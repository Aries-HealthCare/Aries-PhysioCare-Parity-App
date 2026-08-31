'use server';

/**
 * @fileOverview Provides AI-generated insights and personalized data-driven guidance for recovery.
 *
 * - aiPrecisionRecoveryInsights - A function that handles the AI-driven recovery insights process.
 * - AiPrecisionRecoveryInsightsInput - The input type for the aiPrecisionRecoveryInsights function.
 * - AiPrecisionRecoveryInsightsOutput - The return type for the aiPrecisionRecoveryInsights function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AiPrecisionRecoveryInsightsInputSchema = z.object({
  assessmentData: z
    .string()
    .describe('Data from the patient assessment, including symptoms and condition.'),
  treatmentPlan: z
    .string()
    .describe('The current treatment plan for the patient.'),
  trackingData: z
    .string()
    .describe('Data tracking the patients progress, including pain levels and mobility metrics.'),
});
export type AiPrecisionRecoveryInsightsInput = z.infer<
  typeof AiPrecisionRecoveryInsightsInputSchema
>;

const AiPrecisionRecoveryInsightsOutputSchema = z.object({
  insights: z.object({
    assessment: z.string(),
    plan: z.string(),
    track: z.string(),
    advance: z.string(),
  }),
});
export type AiPrecisionRecoveryInsightsOutput = z.infer<
  typeof AiPrecisionRecoveryInsightsOutputSchema
>;

export async function aiPrecisionRecoveryInsights(
  input: AiPrecisionRecoveryInsightsInput
): Promise<AiPrecisionRecoveryInsightsOutput> {
  return aiPrecisionRecoveryInsightsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'aiPrecisionRecoveryInsightsPrompt',
  input: {schema: AiPrecisionRecoveryInsightsInputSchema},
  output: {schema: AiPrecisionRecoveryInsightsOutputSchema},
  prompt: `You are an AI assistant providing insights and guidance for patient recovery.

  Based on the assessment data, treatment plan, and tracking data, provide personalized insights and recommendations for the following areas:

  1. Assessment: Analyze the patient assessment data and provide key insights into their condition.
  2. Plan: Offer data-driven guidance for optimizing the treatment plan based on the assessment and tracking data.
  3. Track: Provide personalized guidance for effectively tracking the patients progress, including relevant metrics and monitoring techniques.
  4. Advance: Recommend specific actions and strategies for advancing the recovery process, taking into account the patients current progress and condition.

  Assessment Data: {{{assessmentData}}}
  Treatment Plan: {{{treatmentPlan}}}
  Tracking Data: {{{trackingData}}}`,
});

const aiPrecisionRecoveryInsightsFlow = ai.defineFlow(
  {
    name: 'aiPrecisionRecoveryInsightsFlow',
    inputSchema: AiPrecisionRecoveryInsightsInputSchema,
    outputSchema: AiPrecisionRecoveryInsightsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
