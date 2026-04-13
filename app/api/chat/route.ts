import Groq from "groq-sdk";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export async function POST(req: Request) {
  try {
    const { message, userData } = await req.json();

    const systemPrompt = `You are Joel, an AI fitness coach inside the NourishFit app.

User Profile:
- Weight: ${userData?.weight || "Unknown"}
- Height: ${userData?.height || "Unknown"}
- Goal: ${userData?.goal || "Maintain"}

Rules:
- Keep answers VERY SHORT and conversational
- Use bullet points, not paragraphs
- Be encouraging and motivating
- Use emojis sparingly for personality

If asked about diet:
Suggest Breakfast / Lunch / Dinner / Snacks

If asked about workout:
Suggest Warmup / Exercises / Cardio

Always be helpful, concise, and fitness-focused.`;

    const chatCompletion = await groq.chat.completions.create({
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: message },
      ],
      model: "llama-3.3-70b-versatile",
      temperature: 0.7,
      max_tokens: 512,
    });

    const reply =
      chatCompletion.choices?.[0]?.message?.content || "No response from Joel.";

    return Response.json({ reply });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("[api/chat] Error:", message);

    // Provide a helpful error if API key is missing
    if (message.includes("API key") || message.includes("apiKey")) {
      return Response.json({
        reply:
          "⚠️ Joel needs a Groq API key to work. Add GROQ_API_KEY to your .env.local file. Get a free key at console.groq.com",
      });
    }

    return Response.json({
      reply: "Joel is having trouble right now. Please try again later.",
    });
  }
}