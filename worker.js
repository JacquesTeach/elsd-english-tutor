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
    if (request.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: {
          "Access-Control-Allow-Origin": env.ALLOWED_ORIGIN,
          "Access-Control-Allow-Methods": "POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type"
        }
      });
    }
    if (request.method !== "POST") {
      return new Response(JSON.stringify({ error: "Method not allowed." }), {
        status: 405,
        headers: { "Content-Type": "application/json" }
      });
    }
    try {
      const body = await request.json();
      const message = typeof body.message === "string" ? body.message.trim() : "";
      if (!message) {
        return new Response(JSON.stringify({ error: "Please enter a message." }), {
          status: 400,
          headers: { "Content-Type": "application/json" }
        });
      }
      if (message.length > MAX_MESSAGE_LENGTH) {
        return new Response(JSON.stringify({
          error: `Message must be ${MAX_MESSAGE_LENGTH} characters or fewer.`
        }), {
          status: 400,
          headers: { "Content-Type": "application/json" }
        });
      }
      const openaiResponse = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${env.OPENAI_API_KEY}`
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [
            { role: "system", content: SYSTEM_INSTRUCTION },
            { role: "user", content: message }
          ],
          max_tokens: MAX_OUTPUT_TOKENS
        })
      });
      if (!openaiResponse.ok) {
        const errorText = await openaiResponse.text();
        console.error(errorText);
        return new Response(JSON.stringify({ error: "OpenAI request failed." }), {
          status: 502,
          headers: { "Content-Type": "application/json" }
        });
      }
      const result = await openaiResponse.json();
      const reply = result.choices?.[0]?.message?.content || "No response returned.";
      return new Response(JSON.stringify({ reply }), {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": env.ALLOWED_ORIGIN
        }
      });
    } catch (error) {
      console.error(error);
      return new Response(JSON.stringify({ error: "Server error." }), {
        status: 500,
        headers: { "Content-Type": "application/json" }
      });
    }
  }
};
