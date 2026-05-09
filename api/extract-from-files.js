import Anthropic from "@anthropic-ai/sdk";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { documents } = req.body;
  if (!documents || documents.length === 0) {
    return res.status(400).json({ error: "No documents provided" });
  }

  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  const content = [
    {
      type: "text",
      text: `Analyze the following documents and extract information relevant to writing a Product Requirements Document (PRD).

Extract each of the fields below. Be specific and grounded in the document content — use direct paraphrases or quotes where helpful. If a field cannot be determined from the documents, return an empty string for that field.

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

  for (const doc of documents) {
    if (doc.type === "pdf") {
      content.push({
        type: "document",
        source: { type: "base64", media_type: "application/pdf", data: doc.content },
        title: doc.name,
      });
    } else {
      content.push({
        type: "document",
        source: { type: "text", data: doc.content },
        title: doc.name,
      });
    }
  }

  try {
    const message = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 2048,
      messages: [{ role: "user", content }],
    });

    const raw = message.content[0].text.trim();
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("No JSON in response");

    const extracted = JSON.parse(jsonMatch[0]);

    const EXPECTED_KEYS = ["problemStatement", "targetUsers", "goals", "successMetrics", "inScope", "outOfScope"];
    const safe = {};
    for (const key of EXPECTED_KEYS) {
      safe[key] = typeof extracted[key] === "string" ? extracted[key] : "";
    }

    return res.status(200).json({ extracted: safe });
  } catch (err) {
    console.error("Extraction error:", err);
    return res.status(500).json({ error: "Failed to extract information from documents. Please try again." });
  }
}
