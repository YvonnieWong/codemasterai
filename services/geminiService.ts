
import { GoogleGenAI, Type } from "@google/genai";
import { LearningModule, CodeEvaluation } from "../types";

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
    5. Create a 3-question quiz. 
       - At least one question must be a "choice" (multiple choice with 4 options).
       - At least one question must be a "code" (where the user writes a small code snippet to solve a task related to the input code).
       - For "code" questions, provide a "starterCode", a clear "task", and a "solution" (the correct code).

    Ensure all content is high-quality and uses Markdown for formatting.
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
                  type: { type: Type.STRING, description: "Must be 'choice' or 'code'" },
                  question: { type: Type.STRING },
                  explanation: { type: Type.STRING },
                  // Fields for 'choice'
                  options: { type: Type.ARRAY, items: { type: Type.STRING } },
                  correctAnswerIndex: { type: Type.INTEGER },
                  // Fields for 'code'
                  starterCode: { type: Type.STRING },
                  task: { type: Type.STRING },
                  solution: { type: Type.STRING, description: "The correct code for the task." }
                },
                required: ["type", "question", "explanation"]
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

export async function evaluateCodeAnswer(
  task: string, 
  userCode: string, 
  language: string,
  contextCode: string
): Promise<CodeEvaluation> {
  const prompt = `
    As an AI Tutor, evaluate the following code submission for a programming quiz.
    
    Context Code (what the user is learning):
    ${contextCode}

    Task: ${task}
    Programming Language: ${language}
    User's Submission:
    \`\`\`
    ${userCode}
    \`\`\`

    Grade the submission. Check for correctness, logic, and if it solves the task.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            isCorrect: { type: Type.BOOLEAN },
            feedback: { type: Type.STRING, description: "Constructive feedback about the code." },
            score: { type: Type.INTEGER, description: "A score from 0 to 100." }
          },
          required: ["isCorrect", "feedback", "score"]
        }
      }
    });

    return JSON.parse(response.text || '{}') as CodeEvaluation;
  } catch (error) {
    console.error("Evaluation Error:", error);
    return {
      isCorrect: false,
      feedback: "The AI was unable to evaluate your code at this moment. Please try again.",
      score: 0
    };
  }
}
