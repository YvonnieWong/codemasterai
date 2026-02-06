
import { GoogleGenAI, Type } from "@google/genai";
import { LearningModule } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export async function generateLearningModule(code: string): Promise<LearningModule> {
  const prompt = `
    You are an elite programming tutor. Analyze the following code snippet and generate a comprehensive learning module.
    
    Code Snippet:
    \`\`\`
    ${code}
    \`\`\`

    Requirements:
    1. Identify the programming language.
    2. Provide a clear, step-by-step explanation of what the code does.
    3. Create a tutorial that teaches the core concepts demonstrated in the code.
    4. Provide an expanded or related advanced example that builds on this logic.
    5. Create a 3-question interactive quiz to test understanding. Each question must have exactly 4 options.

    Ensure all content is high-quality and uses Markdown for formatting (within the strings).
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            language: { type: Type.STRING },
            explanation: { type: Type.STRING },
            tutorial: { type: Type.STRING },
            example: { type: Type.STRING },
            quiz: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  question: { type: Type.STRING },
                  options: { 
                    type: Type.ARRAY, 
                    items: { type: Type.STRING } 
                  },
                  correctAnswerIndex: { type: Type.INTEGER },
                  explanation: { type: Type.STRING }
                },
                required: ["question", "options", "correctAnswerIndex", "explanation"]
              }
            }
          },
          required: ["language", "explanation", "tutorial", "example", "quiz"]
        },
        thinkingConfig: { thinkingBudget: 4000 }
      },
    });

    const result = JSON.parse(response.text || '{}');
    return result as LearningModule;
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw new Error("Failed to generate learning module. Please try again.");
  }
}
