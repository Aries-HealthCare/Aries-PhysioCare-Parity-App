'use server';

/**
 * @fileOverview A flow for generating follow-up questions based on a patient's reported symptoms.
 *
 * - generateSymptomQuestions - A function that generates targeted questions.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SymptomQuestionsInputSchema = z.object({
  symptom: z.string().describe('The initial symptom reported by the patient.'),
});

const SymptomQuestionsOutputSchema = z.object({
  questions: z.array(z.string()).describe('A list of 2-3 targeted clarifying questions.'),
});

export async function generateSymptomQuestions(input: { symptom: string }) {
  return generateSymptomQuestionsFlow(input);
}

const generateSymptomQuestionsFlow = ai.defineFlow(
  {
    name: 'generateSymptomQuestionsFlow',
    inputSchema: SymptomQuestionsInputSchema,
    outputSchema: SymptomQuestionsOutputSchema,
  },
  async input => {
    const {output} = await ai.generate({
      prompt: `You are a professional clinical assistant for a physiotherapy clinic. 
      The patient has reported the following symptom: "${input.symptom}".
      
      Generate exactly 2 or 3 targeted, concise questions to understand the problem better. 
      Ask about the nature of the pain (sharp, dull), what activities make it worse, and how long it has been occurring.
      
      Format the output as a JSON object with a "questions" array.`,
      output: { schema: SymptomQuestionsOutputSchema }
    });
    return output!;
  }
);
