import Groq from "groq-sdk";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export async function POST(req: Request) {
  try {
    const { message, userData, currentLogs } = await req.json();

    const weight = userData?.weight ? parseFloat(userData.weight) : null;
    const height = userData?.height ? parseFloat(userData.height) : null;
    const bmi = weight && height ? (weight / ((height / 100) ** 2)).toFixed(1) : null;
    const tdee = weight && height && userData?.gender
      ? Math.round(
          userData.gender === "male"
            ? 10 * weight + 6.25 * height - 5 * (userData.age || 25) + 5
            : 10 * weight + 6.25 * height - 5 * (userData.age || 25) - 161
        )
      : null;

    const totalCals = currentLogs?.reduce((s: number, f: any) => s + (f.calories || 0), 0) || 0;
    const totalProtein = currentLogs?.reduce((s: number, f: any) => s + (f.protein || 0), 0) || 0;
    const goalCals = userData?.goal || 2000;
    const remaining = goalCals - totalCals;
    const proteinGoal = weight ? Math.round(weight * 1.8) : 120;

    const foodSummary = currentLogs && currentLogs.length > 0
      ? currentLogs.map((f: any) => `${f.name} (${f.calories}kcal, ${f.protein || 0}g protein)`).join(", ")
      : "Nothing logged yet.";

    const systemPrompt = `You are Joel — an elite AI fitness coach and sports nutritionist inside NourishFit.

USER PROFILE:
- Name: ${userData?.name || "User"}
- Body: ${weight ? weight + "kg" : "?"}, ${height ? height + "cm" : "?"}, ${userData?.gender || "unknown gender"}
- BMI: ${bmi || "unknown"} | Est. TDEE: ${tdee ? tdee + " kcal/day" : "unknown"}
- Calorie Goal: ${goalCals} kcal/day
- Today consumed: ${totalCals} kcal (${remaining > 0 ? remaining + " kcal remaining" : Math.abs(remaining) + " kcal OVER budget"})
- Protein today: ${totalProtein.toFixed(0)}g / goal ~${proteinGoal}g
- Food log: ${foodSummary}

RESPONSE RULES — STRICTLY FOLLOW:
1. ALWAYS respond in SHORT bullet points (•). Never write paragraphs.
2. Max 4-5 bullets per response. Be surgical and direct.
3. Start with the most critical insight first.
4. Use bold (**word**) for key numbers, nutrients, or exercise names.
5. If their protein is low, say so with the exact gap.
6. If calories are over budget, give a specific fix (e.g., "do 20 min HIIT to burn ~200 kcal").
7. For workout questions: give specific sets/reps, not vague advice.
8. Never say "Great question!" or filler phrases. Get straight to the point.
9. Speak like a tough but caring coach — direct, no sugarcoating.
10. Never give medical diagnoses. If a question is medical, redirect to a doctor in one line.

EXPERTISE:
- Sports science, hypertrophy, fat loss, Indian nutrition
- Knows calorie/macro content of Indian foods (dosa, idli, biryani, paneer, etc.)
- Can calculate estimated burn rates, recovery needs, progressive overload`;

    const chatCompletion = await groq.chat.completions.create({
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: message },
      ],
      model: "llama-3.3-70b-versatile",
      temperature: 0.45,
      max_tokens: 450,
      top_p: 0.9,
    });

    const reply = chatCompletion.choices?.[0]?.message?.content || "Joel is momentarily speechless. Try again.";

    return Response.json({ reply });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("[api/chat] Error:", message);

    if (message.includes("API key")) {
      return Response.json({
        reply: "Joel's brain (API Key) is missing. Please add GROQ_API_KEY to your environment variables.",
      });
    }

    return Response.json({
      reply: "Joel hit a snag. He's probably doing burpees. Try again in a second!",
    });
  }
}