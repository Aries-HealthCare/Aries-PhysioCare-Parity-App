"use server";

import { aiPrecisionRecoveryInsights, AiPrecisionRecoveryInsightsInput, AiPrecisionRecoveryInsightsOutput } from "@/ai/flows/ai-precision-recovery";

export async function getRecoveryInsightsAction(data: AiPrecisionRecoveryInsightsInput): Promise<AiPrecisionRecoveryInsightsOutput | { error: string }> {
  try {
    const result = await aiPrecisionRecoveryInsights(data);
    return result;
  } catch (error) {
    console.error("AI Precision Recovery Error:", error);
    return { error: "Failed to generate AI insights. Please try again later." };
  }
}
