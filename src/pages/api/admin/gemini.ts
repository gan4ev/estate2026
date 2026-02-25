export const prerender = false;
import type { APIRoute } from 'astro';

export const POST: APIRoute = async ({ request }) => {
    try {
        const data = await request.json();
        const { sourceDictionary, targetLangName } = data;

        if (!sourceDictionary || !targetLangName) {
            return new Response(JSON.stringify({ error: "Missing sourceDictionary or targetLangName payload" }), { status: 400 });
        }

        const prompt = `You are an expert website localization engineer for a luxury real estate portal.
I am providing you with a JSON dictionary of UI strings representing the website's layout.
Your explicit task is to translate ALL the values into ${targetLangName}. 
You MUST KEEP the exact same JSON key schema.
You MUST output ONLY valid JSON without Markdown blocks or any other commentary formatting.

Source Interface JSON:
${JSON.stringify(sourceDictionary, null, 2)}`;

        // The user's provided Gemini API Key
        const GEMINI_API_KEY = "AIzaSyADYJSKAfl6PyDeogHAoNE0g-3IKlKfpAM";

        const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }],
                generationConfig: {
                    responseMimeType: "application/json",
                    temperature: 0.2
                }
            })
        });

        const result = await res.json();

        if (result.error) {
            console.error("Gemini API Error:", result.error);
            throw new Error(`Gemini Error: ${result.error.message}`);
        }

        const translatedText = result?.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!translatedText) {
            throw new Error("Failed to receive translation data struct from Gemini.");
        }

        const translatedDict = JSON.parse(translatedText);

        return new Response(JSON.stringify({ success: true, dictionary: translatedDict }));
    } catch (err: any) {
        console.error("Gemini Endpoint Crash:", err);
        return new Response(JSON.stringify({ error: err.message }), { status: 500 });
    }
}
