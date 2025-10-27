import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
    apiKey: "AIzaSyAxeQJGaHcUBziFV5wKubKHxo4SK1DKl0w",
});

export async function checkPlagiarism(text: string): Promise<boolean> {
    const prompt = `
  Check if the following text shows signs of plagiarism.
  Respond ONLY with "Yes" if it seems plagiarized or "No" if it's original.
  Text:
  ${text.slice(0, 5000)}
  `;

    const result = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: [{ role: "user", parts: [{ text: prompt }] }],
    });

    const resultText = (result.text || "").toLowerCase();
    return resultText.includes("yes");
}
