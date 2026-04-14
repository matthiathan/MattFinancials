import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.GEMINI_API_KEY || '';
const ai = new GoogleGenAI({ apiKey });
const model = "gemini-2.0-flash";

export async function getFinancialInsights(context: any) {
  try {
    const response = await ai.models.generateContent({
      model,
      contents: [
        {
          role: "user",
          parts: [
            {
              text: `You are a professional financial advisor. Analyze the following financial data and provide a concise, one-sentence insight for a dashboard banner.
              
              Data: ${JSON.stringify(context)}
              
              IMPORTANT: Use South African Rand (ZAR) for all currency references. Use the symbol "R".
              Focus on trends, anomalies, or actionable advice. Keep it under 20 words.`
            }
          ]
        }
      ],
      config: {
        temperature: 0.7,
        maxOutputTokens: 100,
      }
    });

    return response.text || "Keep up the great work! Your savings rate is looking healthy this month.";
  } catch (error) {
    console.error("AI Insight Error:", error);
    return "Focus on your long-term goals. Every small saving adds up to your financial freedom.";
  }
}

export async function* streamAdvisorResponse(message: string, context: any) {
  try {
    const chat = ai.chats.create({
      model,
      config: {
        systemInstruction: `You are Matt Financials AI Advisor. You have access to the user's financial data: ${JSON.stringify(context)}. 
        This data includes transactions, budgets, financial calendar events, budget recommendations, and credit score history.
        Provide helpful, accurate, and professional financial advice. Be concise and use a friendly tone. 
        IMPORTANT: Always use South African Rand (ZAR) for currency. Use the symbol "R" (e.g., R 1,250.00). Never use $.
        If asked about specific spending, refer to the provided data.
        
        Examples of insights you should provide:
        - Financial Calendar: "You have R3,200 in bills due next week. Ensure your account balance remains above this amount."
        - Smart Budget Autopilot: "Your dining spending increased 18% this month. Consider raising your budget to R2,800."
        - Credit Score: "Your credit score improved by 12 points this month due to lower credit utilization."`
      }
    });

    const result = await chat.sendMessageStream({ message });

    for await (const chunk of result) {
      if (chunk.text) {
        yield chunk.text;
      }
    }
  } catch (error) {
    console.error("AI Advisor Stream Error:", error);
    yield "I'm sorry, I'm having trouble connecting to my brain right now. Please try again in a moment.";
  }
}

export async function categorizeTransaction(description: string): Promise<string> {
  try {
    const response = await ai.models.generateContent({
      model,
      contents: [
        {
          role: "user",
          parts: [
            {
              text: `Categorize the following transaction into one of these categories:
              Food, Transport, Housing, Utilities, Entertainment, Subscriptions, Healthcare, Shopping, Income, Savings.
              
              Transaction: ${description}
              
              Respond ONLY with the category name.`
            }
          ]
        }
      ],
      config: {
        temperature: 0.1,
        maxOutputTokens: 10,
      }
    });

    const category = response.text?.trim() || 'Shopping';
    const validCategories = ['Food', 'Transport', 'Housing', 'Utilities', 'Entertainment', 'Subscriptions', 'Healthcare', 'Shopping', 'Income', 'Savings'];
    return validCategories.includes(category) ? category : 'Shopping';
  } catch (error) {
    console.error("Categorization Error:", error);
    return 'Shopping';
  }
}
