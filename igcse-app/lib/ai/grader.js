import OpenAI from "openai";

function getOpenAIClient() {
  const apiKey = process.env.GITHUB_TOKEN;
  if (!apiKey) {
    throw new Error("Missing GITHUB_TOKEN env var for GitHub Models API");
  }
  // GitHub Models compatible OpenAI SDK
  const baseURL = process.env.GITHUB_MODELS_BASE_URL || "https://models.inference.ai.azure.com";
  return new OpenAI({ apiKey, baseURL });
}

export async function gradeAnswer({ question, parts, markScheme, studentAnswer }) {
  const client = getOpenAIClient();
  const system = `You are an experienced Cambridge IGCSE examiner. Grade strictly to the mark scheme. Output JSON with this schema: { total_marks, awarded_marks, part_feedback: [{ part_label, awarded_marks, max_marks, feedback, status: one of [full, partial, none] }], overall_feedback }.`;

  const user = `Question: ${question}\nTotal Marks: ${(parts?.length ? parts.reduce((s,p)=>s+p.total_marks,0) :  (markScheme?.total_marks ?? 0))}\n${parts?.length ? `Parts: ${parts.map(p=>`${p.label} (${p.total_marks}): ${p.text}`).join("\n")}`: ""}\nMark Scheme:\n${markScheme?.text || markScheme}\nStudent Answer:\n${studentAnswer}`;

  const response = await client.chat.completions.create({
    model: process.env.GITHUB_MODELS_MODEL || "gpt-4o-mini",
    temperature: 0.2,
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: system },
      { role: "user", content: user },
    ],
  });
  const content = response.choices?.[0]?.message?.content || "{}";
  let parsed;
  try { parsed = JSON.parse(content); } catch { parsed = { awarded_marks: 0, total_marks: 0, part_feedback: [], overall_feedback: "Unable to parse." }; }

  // Normalize statuses to color
  const score = parsed.awarded_marks ?? 0;
  const total = parsed.total_marks || (parts?.reduce((s,p)=>s+p.total_marks,0) || 0);
  const ratio = total ? score / total : 0;
  let status = "partial";
  if (ratio >= 0.99) status = "full";
  else if (ratio <= 0.01) status = "none";

  return { ...parsed, status };
}