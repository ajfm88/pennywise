import { NextFunction, Request, Response } from "express";
import OpenAI from "openai";
import { asyncHandler, sendSuccess } from "../utils/responseHelpers";
import { AppError } from "../middleware/errorHandler";
import Expense from "../models/Expense";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export const getAIInsights = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.userId;

    const expenses = await Expense.find({ userId });

    if (expenses.length === 0) {
      throw new AppError("No expenses found to analyze", 404);
    }

    const total = expenses.reduce((sum, e) => sum + e.amount, 0);
    const average = total / expenses.length;

    const categoryTotals = expenses.reduce(
      (acc, e) => {
        acc[e.category] = (acc[e.category] || 0) + e.amount;
        return acc;
      },
      {} as Record<string, number>,
    );

    const categoryBreakdown = Object.entries(categoryTotals)
      .sort((a, b) => b[1] - a[1])
      .map(([cat, amt]) => `${cat}: $${amt.toFixed(2)} (${((amt / total) * 100).toFixed(1)}%)`)
      .join(", ");

    const now = new Date();
    const currentMonth = `${String(now.getMonth() + 1).padStart(2, "0")}-${now.getFullYear()}`;
    const lastMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonth = `${String(lastMonthDate.getMonth() + 1).padStart(2, "0")}-${lastMonthDate.getFullYear()}`;

    const getMonthTotal = (monthStr: string) =>
      expenses
        .filter((e) => {
          const d = new Date(e.date);
          return `${String(d.getMonth() + 1).padStart(2, "0")}-${d.getFullYear()}` === monthStr;
        })
        .reduce((sum, e) => sum + e.amount, 0);

    const currentMonthTotal = getMonthTotal(currentMonth);
    const lastMonthTotal = getMonthTotal(lastMonth);

    const prompt = `You are a personal finance advisor. Analyze this user's expense data and return exactly 4 concise, actionable insights.

Data:
- Total all-time expenses: $${total.toFixed(2)} across ${expenses.length} transactions
- Average expense: $${average.toFixed(2)}
- Spending by category: ${categoryBreakdown}
- This month's spending: $${currentMonthTotal.toFixed(2)}
- Last month's spending: $${lastMonthTotal.toFixed(2)}

Return a JSON array with exactly 4 objects, each with:
- "text": a 1-2 sentence insight (specific, use real numbers from the data)
- "type": one of "positive", "negative", or "neutral"

Use "positive" for good financial habits, "negative" for areas of concern, "neutral" for informational observations. Be direct and specific. No generic advice.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
      temperature: 0.7,
    });

    const raw = completion.choices[0].message.content ?? "{}";
    const parsed = JSON.parse(raw);

    const insights: { text: string; type: string }[] = Array.isArray(parsed)
      ? parsed
      : parsed.insights ?? parsed.data ?? [];

    sendSuccess(res, insights, "AI insights generated");
  },
);
