"use server";

import { ai } from "@/ai/genkit";
import { z } from "zod";

export async function getNextQuestionAction(symptom: string, previousMessages: { role: 'ai' | 'user', content: string }[]): Promise<{ question: string } | null> {
  try {
    const response = await (ai as any).generate({
      prompt: `You are a professional clinical assistant for Aries PhysioCare. The patient initially reported: "${symptom}".
      Conversation history:
      ${previousMessages.map(m => `${m.role.toUpperCase()}: ${m.content}`).join('\n')}
      
      Generate the NEXT single follow-up question to understand the problem better. 
      Focus on one specific aspect: pain nature, triggers, duration, neurological symptoms (numbness/tingling), or lifestyle impact.
      The question must be concise, professional, and empathetic.`,
      output: {
        schema: z.object({
          question: z.string()
        })
      }
    });
    return response.output as { question: string };
  } catch (error) {
    console.error("AI Question Error:", error);
    return { question: "Can you describe what activities make your pain worse?" };
  }
}

export async function getFinalAssessmentAction(symptom: string, conversation: { role: 'ai' | 'user', content: string }[], hasReports: boolean): Promise<any> {
  try {
    const history = conversation.map(m => `${m.role.toUpperCase()}: ${m.content}`).join('\n');
    const response = await (ai as any).generate({
      prompt: `Based on the patient's initial report: "${symptom}" and our detailed conversation:
      ${history}
      
      Note: The patient ${hasReports ? 'HAS provided' : 'HAS NOT provided'} investigation reports (X-Ray/MRI).
      
      Provide a clinical educational visualization assessment.
      
      Identify:
      1. conditionName: A specific likely condition (e.g. Sciatica, ACL Tear, Cervical Spondylosis).
      2. region: (one of: knee, back, neck, shoulder, ankle)
      3. structure: Specific anatomical structure involved.
      4. layer: (one of: skeleton, muscles, nerves)
      5. focusPosition: {x, y, z} relative to body center for 3D marker. (Estimated Y values: knee=0.4, back=1.2, neck=1.8, shoulder=1.7)
      6. explanation: Brief "what" (anatomy), "why" (likely cause), and "how" (recovery strategy).
      7. ariesExpertise: How Aries PhysioCare's expert team, technology (like laser/IFT), and home care protocols help with THIS specific condition.
      8. estimatedDays: Number of days for recovery. Use 10 for minor, or pick one of (15, 20, 30) for complex cases.
      
      Return as JSON matching schema.`,
      output: {
        schema: z.object({
          conditionName: z.string(),
          region: z.string(),
          structure: z.string(),
          layer: z.string(),
          focusPosition: z.object({ x: z.number(), y: z.number(), z: z.number() }),
          explanation: z.object({
            what: z.string(),
            why: z.string(),
            how: z.string()
          }),
          ariesExpertise: z.string(),
          estimatedDays: z.number()
        })
      }
    });
    return response.output;
  } catch (error) {
    console.error("AI Assessment Error:", error);
    return null;
  }
}
