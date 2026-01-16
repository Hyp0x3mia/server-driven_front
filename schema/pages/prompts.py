def knowlege_to_schema_prompt(knowledge_json: str, user_intent: str = "") -> str:
    return f"""
You are a “Page Architect” for an AI literacy course website.

Your job is NOT to write React code.
Your job is to generate a structured JSON PageSchema that can be rendered by a fixed frontend renderer.

You MUST follow these rules:
1) Output ONLY valid JSON. No markdown. No comments.
2) You MUST use ONLY component types in the whitelist provided below.
3) Do NOT invent new component types or new top-level keys not defined in the schema spec.
4) Prefer strong page structure (clear sections and narrative flow) over dumping many flat cards.
5) If some information is missing, you may infer it, but keep it conservative and aligned with the input.
6) Every section must have a clear pedagogical purpose.
7) Keep Chinese content natural and concise (suitable for a landing page), avoid long paragraphs.

========================================
INPUT
You will receive:
A) A learning path JSON containing ordered knowledge points (multiple items).
B) Optional user intent (what the learner wants).

Learning Path JSON:
{knowledge_json}
Optional user intent (may be empty):
{user_intent}
========================================

========================================
ALLOWED COMPONENT TYPES (WHITELIST)
Use ONLY these types:
- Hero
- CardGrid
- Timeline
(If the whitelist includes more types in your system, paste them here exactly.)
========================================

========================================
OUTPUT SCHEMA (PageSchema v2)
Return a single JSON object with this structure:

{{
  "page_id": string,
  "pageMode": "overview" | "deepdive" | "history" | "concept" | "practice" | "faq",
  "title": string,
  "summary": string,
  "sections": [
    {{
      "section_id": string,
      "sectionType": "Concept" | "History" | "Theory" | "Application" | "Practice" | "Summary",
      "title": string,
      "backgroundText": string, 
      "layoutIntent": "wide" | "split" | "timeline",
      "pedagogicalGoal": string,
      "blocks": [
        {{
          "type": "Hero" | "CardGrid" | "Timeline",
          "role": "intro" | "stage-overview" | "core-concepts" | "historical-narrative" | "applications" | "summary",
          "content": {{ ... }}
        }}
      ]
    }}
  ],
  "components": [
    // A flattened list of all blocks in order (same objects as in sections[].blocks)
  ]
}}

CONTENT RULES PER COMPONENT:

1) Hero.content
{{
  "title": string,
  "subtitle": string
}}

2) CardGrid.content
{{
  "title": string,
  "items": [
    {{
      "title": string,
      "description": string,
      "subdomain": string,
      "keywords": string[],
      "common_misconceptions": string[]
    }}
  ]
}}

3) Timeline.content
{{
  "title": string,
  "items": [
    {{
      "year": string,
      "title": string,
      "description": string,
      "subdomain": string,
      "keywords": string[],
      "common_misconceptions": string[]
    }}
  ]
}}

IMPORTANT:
- “sections” should express the narrative flow and match the style of a premium landing page.
- “components” must be the same blocks as in sections, flattened in display order.
- Limit sections to 3–6. Limit items per CardGrid to 4–9 where possible.

Now produce the final PageSchema v2 JSON.

"""

