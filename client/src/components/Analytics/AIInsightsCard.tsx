import { getAIInsights } from "@/services/analyticsService";
import {
  AlertTriangle,
  DollarSign,
  Loader2,
  Sparkles,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import { useState } from "react";

type InsightType = "positive" | "negative" | "neutral";

interface Insight {
  text: string;
  type: InsightType;
}

function getIconAndColor(type: InsightType) {
  switch (type) {
    case "positive":
      return { Icon: TrendingDown, color: "text-green-400 bg-green-900/20" };
    case "negative":
      return { Icon: AlertTriangle, color: "text-red-400 bg-red-900/20" };
    case "neutral":
      return { Icon: DollarSign, color: "text-blue-400 bg-blue-900/20" };
  }
}

export default function AIInsightsCard() {
  const [insights, setInsights] = useState<Insight[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasGenerated, setHasGenerated] = useState(false);

  async function handleGenerate() {
    setIsLoading(true);
    setError(null);
    try {
      const response = await getAIInsights();
      setInsights(response.data ?? []);
      setHasGenerated(true);
    } catch {
      setError("Failed to generate insights. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="border border-purple-950 rounded-sm p-6">
      <div className="flex items-center gap-2 mb-1">
        <Sparkles className="size-5 text-purple-400" />
        <h3 className="text-lg font-semibold text-gray-100">AI Insights</h3>
      </div>
      <p className="text-sm text-gray-400 mb-5">
        Get personalized analysis of your spending habits
      </p>

      {!hasGenerated && !isLoading && (
        <div className="flex flex-col items-center justify-center py-8 gap-4">
          <p className="text-sm text-gray-500 text-center">
            Click below to generate AI-powered insights based on all your
            expense data
          </p>
          <button
            onClick={handleGenerate}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm rounded-sm flex items-center gap-2 transition-colors"
          >
            <Sparkles className="size-4" />
            Generate Analysis
          </button>
        </div>
      )}

      {isLoading && (
        <div className="flex flex-col items-center justify-center py-10 gap-3">
          <Loader2 className="size-6 text-purple-400 animate-spin" />
          <p className="text-sm text-gray-400">Analyzing your expenses...</p>
        </div>
      )}

      {error && (
        <div className="py-4 text-center">
          <p className="text-sm text-red-400 mb-3">{error}</p>
          <button
            onClick={handleGenerate}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm rounded-sm transition-colors"
          >
            Try Again
          </button>
        </div>
      )}

      {hasGenerated && !isLoading && insights.length > 0 && (
        <div className="space-y-3">
          {insights.map((insight, index) => {
            const { Icon, color } = getIconAndColor(insight.type);
            return (
              <div
                key={index}
                className="flex items-start gap-3 p-3 bg-slate-900/50 rounded-sm"
              >
                <p className={`p-2 rounded-sm shrink-0 ${color}`}>
                  <Icon className="size-4" />
                </p>
                <p className="text-sm text-gray-300 leading-relaxed">
                  {insight.text}
                </p>
              </div>
            );
          })}

          <button
            onClick={handleGenerate}
            className="mt-2 w-full px-4 py-2 border border-purple-950 hover:bg-purple-950/30 text-gray-400 hover:text-gray-200 text-sm rounded-sm flex items-center justify-center gap-2 transition-colors"
          >
            <TrendingUp className="size-4" />
            Regenerate
          </button>
        </div>
      )}
    </div>
  );
}
