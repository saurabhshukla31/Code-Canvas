import { GoogleGenerativeAI } from '@google/generative-ai';

const apiKey = import.meta.env.VITE_GOOGLE_API_KEY;

if (!apiKey) {
  console.error("⚠️ API Key is missing! Make sure VITE_GOOGLE_API_KEY is set.");
}

const genAI = new GoogleGenerativeAI(apiKey);

export async function generateResponse(prompt: string, selectedLang: string = 'Python'): Promise<string> {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
    const chat = model.startChat({
      history: [],
      generationConfig: {
        maxOutputTokens: 2048,
        temperature: 0.7,
      },
    });

    const promptTemplate = `
As an expert algorithm teacher, explain the solution to this coding problem. Follow this EXACT format:

1. BRIEF Problem Overview (2-3 sentences max)

2. Pseudocode (EXACTLY 5 steps, no more, no less):
   1) [First step - one clear, concise line]
   2) [Second step - one clear, concise line]
   3) [Third step - one clear, concise line]
   4) [Fourth step - one clear, concise line]
   5) [Fifth step - one clear, concise line]

3. Implementation (in ${selectedLang}):
   - Clean, optimized code
   - Important comments only
   - Follow best practices

4. Complexity:
   - Time: O(?) with brief explanation
   - Space: O(?) with brief explanation

5. Example:
   Input: [example input]
   Output: [example output]
   Brief walkthrough of how the solution works with this example

Question: ${prompt}

IMPORTANT:
- Each pseudocode step MUST be numbered exactly as shown: 1) 2) 3) 4) 5)
- Each step MUST be a single, clear line
- NO additional or fewer steps allowed
- NO substeps or nested steps
- Keep steps high-level and algorithmic
- Use clear, concise language
`;

    const result = await chat.sendMessage(promptTemplate);
    return result.response.text();
  } catch (error) {
    console.error("❌ Error generating response:", error);
    return "I apologize, but I encountered an error while processing your request. Please try again.";
  }
}
