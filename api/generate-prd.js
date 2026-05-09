import Anthropic from "@anthropic-ai/sdk";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { featureName, problemStatement, targetUsers, useCases, goals, successMetrics, inScope, outOfScope } = req.body;

  if (!featureName || !problemStatement) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  const prompt = `You are a senior product manager writing a professional PRD. Generate a complete, well-structured PRD based on the following inputs.

Feature Name: ${featureName}
Problem Statement: ${problemStatement}
Target Users: ${targetUsers || "Not specified"}
Use Cases: ${useCases || "Not specified"}
Goals: ${goals || "Not specified"}
Success Metrics: ${successMetrics || "Not specified"}
In Scope: ${inScope || "Not specified"}
Out of Scope: ${outOfScope || "Not specified"}

Write a complete PRD with exactly these sections in order, using these exact markdown headers:

## Executive Summary
A concise 2-3 sentence overview of the feature, its purpose, and expected impact.

## Problem Statement
A detailed explanation of the problem being solved, including context, pain points, and why this matters now.

## Target Users
Description of primary and secondary user personas, their characteristics, needs, and behaviors.

## Goals & Success Metrics
Clear business and user goals with specific, measurable success metrics and KPIs.

## Proposed Solution
High-level description of the proposed solution, how it addresses the problem, and key design principles.

## Scope
### In Scope
Bulleted list of features and functionality included in this release.

### Out of Scope
Bulleted list of features and functionality explicitly excluded, with brief rationale.

## Open Questions
Bulleted list of unresolved questions, risks, dependencies, or decisions that need to be made before or during development.

Write professionally, be specific and actionable, and ensure the content flows logically. Do not add any text before the first section header.`;

  try {
    const message = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 2048,
      messages: [{ role: "user", content: prompt }],
    });

    const prdContent = message.content[0].text;
    return res.status(200).json({ prd: prdContent });
  } catch (err) {
    console.error("Anthropic API error:", err);
    return res.status(500).json({ error: "Failed to generate PRD. Please try again." });
  }
}
