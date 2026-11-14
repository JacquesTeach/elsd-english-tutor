const MAX_MESSAGE_LENGTH = 4000;
const MAX_OUTPUT_TOKENS = 700;
const SYSTEM_INSTRUCTION = `
You are ELSD, a friendly and patient English-language tutor.
Help learners practice grammar, vocabulary, reading, writing, speaking, and listening.
Adapt explanations to the learner's level, use clear examples, and encourage them.
When useful, ask one short follow-up question or provide a brief exercise.
`;
export default {
  async fetch(request, env) {
    const allowedOrigins = (env.ALLOWED_ORIGIN || "")
      .split(",")
      .map(o => o.trim())
      .filter(Boolean);
    const origin = request.headers.get("Origin") || "";
    const allowedOrigin = allowedOrigins.includes(origin) ? origin : null;
    if (request.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: {
          "Access-Control-Allow-Origin": allowedOrigin || "*",
          "Access-Control-Allow-Methods": "POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type"
        }
      });
    }
    if (request.method !== "POST") {
      return new Response("Method not allowed", { status: 405 });
    }
    try {
      const body = await request.json();
      const prompt = body.message || "";

      const openaiRes = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${env.OPENAI_API_KEY}`
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [
            { role: "system", content: "You are an English tutor." },
            { role: "user", content: prompt }
          ]
        })
      });
      const openaiData = await openaiRes.json();
      if (!openaiRes.ok) {
        return new Response(JSON.stringify({ error: openaiData.error?.message || "OpenAI request failed" }), {
          status: 500,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": allowedOrigin || "*"
          }
        });
      }
      const reply = openaiData.choices?.[0]?.message?.content || "No response.";
      return new Response(JSON.stringify({ reply }), {
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": allowedOrigin || "*"
        }
      });
    } catch (err) {
      return new Response(JSON.stringify({ error: "Invalid request or server error" }), {
        status: 500,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": allowedOrigin || "*"
        }
      });
    }
  }
};
