export default async (req, context) => {
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json" },
    });
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return new Response(JSON.stringify({ error: "API key not configured on server." }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const { systemPrompt, userPrompt } = await req.json();

    const openaiRes = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.7,
      }),
    });

    if (!openaiRes.ok) {
      const err = await openaiRes.json().catch(() => ({}));
      return new Response(
        JSON.stringify({ error: err?.error?.message || `OpenAI error ${openaiRes.status}` }),
        { status: openaiRes.status, headers: { "Content-Type": "application/json" } }
      );
    }

    const data = await openaiRes.json();
    const text = data?.choices?.[0]?.message?.content;

    if (!text) {
      return new Response(JSON.stringify({ error: "Model returned empty response." }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ output_text: text }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message || "Server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};

export const config = {
  path: "/api/openai",
  maxDuration: 60,
};
