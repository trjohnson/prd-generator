import Anthropic from "@anthropic-ai/sdk";

// Raises the limit on Pro/Enterprise plans; Hobby is hard-capped at 10s by Vercel regardless.
export const maxDuration = 60;

const MAX_CHARS_PER_DOC = 24_000; // ~6k words per document
const MAX_TOTAL_CHARS = 72_000;   // ~18k words across all documents

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { documents } = req.body;
  if (!documents || documents.length === 0) {
    return res.status(400).json({ error: "No documents provided", errorCode: "NO_DOCUMENTS" });
  }

  // Truncate oversized text documents and reject if the total is still too large.
  let totalChars = 0;
  const processedDocs = documents.map((doc) => {
    if (doc.type === "text") {
      const truncated =
        doc.content.length > MAX_CHARS_PER_DOC
          ? doc.content.slice(0, MAX_CHARS_PER_DOC) + "\n[content truncated for processing]"
          : doc.content;
      totalChars += truncated.length;
      return { ...doc, content: truncated };
    }
    // PDF: base64 is ~4/3× the binary size — approximate the char budget.
    totalChars += Math.ceil(doc.content.length * 0.75);
    return doc;
  });

  if (totalChars > MAX_TOTAL_CHARS) {
    return res.status(413).json({
      error: "Combined document content is too large. Try uploading fewer files or use smaller documents.",
      errorCode: "TOO_LARGE",
    });
  }

  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  const content = [
    {
      type: "text",
      text: `Analyze the following documents and extract information relevant to writing a Product Requirements Document (PRD).

Extract each of the fields below. Be specific and grounded in the document content. If a field cannot be determined, return an empty string.

Fields to extract:
- problemStatement: The core problem, pain point, or opportunity being addressed
- targetUsers: Who the primary and secondary users are (roles, characteristics, behaviors, segments)
- goals: Business and user goals or objectives to be achieved
- successMetrics: Specific metrics, KPIs, or measurable success criteria mentioned
- inScope: Features, capabilities, or functionality that should be built
- outOfScope: What should be explicitly excluded or deferred to a later phase

Return ONLY a valid JSON object with exactly these six keys. No markdown, no explanation — just the JSON.`,
    },
  ];

  for (const doc of processedDocs) {
    if (doc.type === "pdf") {
      content.push({
        type: "document",
        source: { type: "base64", media_type: "application/pdf", data: doc.content },
        title: doc.name,
      });
    } else {
      // Document blocks with source.type "text" are not reliably supported —
      // embed extracted text directly as a labelled text block instead.
      const sanitized = doc.content
        .replace(/\0/g, "")                            // null bytes from DOCX parsing
        .replace(/[\x01-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "") // stray control chars
        .trim();
      if (sanitized.length === 0) continue;            // skip empty documents
      content.push({
        type: "text",
        text: `--- ${doc.name} ---\n${sanitized}`,
      });
    }
  }

  try {
    const message = await client.messages.create(
      {
        model: "claude-sonnet-4-6",
        max_tokens: 1024, // extraction output is short JSON — 1024 is plenty
        messages: [{ role: "user", content }],
      },
      { timeout: 55_000 } // leave a buffer inside maxDuration
    );

    const raw = message.content[0].text.trim();
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return res.status(500).json({
        error: "Claude returned an unexpected format. Please try again.",
        errorCode: "PARSE_ERROR",
      });
    }

    const extracted = JSON.parse(jsonMatch[0]);
    const EXPECTED_KEYS = ["problemStatement", "targetUsers", "goals", "successMetrics", "inScope", "outOfScope"];
    const safe = {};
    for (const key of EXPECTED_KEYS) {
      safe[key] = typeof extracted[key] === "string" ? extracted[key] : "";
    }

    return res.status(200).json({ extracted: safe });
  } catch (err) {
    console.error("Extraction error:", err.constructor?.name, err.status, err.message, JSON.stringify(err.error ?? null));

    const name = err.constructor?.name ?? "";

    if (name === "AuthenticationError" || err.status === 401) {
      return res.status(500).json({
        error: "Invalid or missing Anthropic API key. Check that ANTHROPIC_API_KEY is set in your Vercel environment variables.",
        errorCode: "AUTH_ERROR",
      });
    }

    const isTimeout =
      name === "APIConnectionTimeoutError" ||
      err.code === "ETIMEDOUT" ||
      err.message?.toLowerCase().includes("timeout");

    if (isTimeout) {
      return res.status(504).json({
        error: "Analysis timed out. Try uploading fewer or smaller files. Vercel Hobby plan has a 10-second function limit — larger documents may require a Pro plan.",
        errorCode: "TIMEOUT",
      });
    }

    if (err instanceof SyntaxError) {
      return res.status(500).json({
        error: "Failed to parse Claude's response. Please try again.",
        errorCode: "PARSE_ERROR",
      });
    }

    return res.status(500).json({
      error: `Failed to extract information from your documents. Please try again. (${name || "UnknownError"})`,
      errorCode: "API_ERROR",
    });
  }
}
