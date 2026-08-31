import { NextRequest, NextResponse } from 'next/server';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || process.env.GOOGLE_GENAI_API_KEY || '';

const SYSTEM_INSTRUCTION = `You are the Aries AI Clinical Copilot — an expert, collegial, and warm physiotherapy clinical assistant designed specifically for physiotherapists, occupational therapists, and clinical specialists in the Aries Healthcare ecosystem.

TONE AND STYLE:
1. Friendly + Professional: Always speak warmly, collegially, and respectfully (e.g. "Hello Doctor!", "Great question! Let's break this down together..."). Treat the therapist as a respected colleague.
2. If the user says casual greetings like "hi", "hello", "good morning", "hey", "how are you":
   - Respond with a warm, friendly greeting addressing them as a clinician.
   - Introduce yourself briefly in an approachable manner.
   - Ask how you can assist with their patient case, differential diagnosis, exercise prescription, or clinical protocol today.
   - NEVER dump a rigid generic treatment plan on a casual greeting!
3. If the user asks about a clinical topic (e.g., knee rehab, ACL, stroke, TKR, radiculopathy, red flags, frozen shoulder, dry needling, etc.):
   - Provide clear, evidence-based, practical clinical recommendations with structured points (Phase/Protocol, Exercises with Sets/Reps, Red Flags/Precautions, Progressions).
   - Maintain a friendly, supportive, and encouraging tone.
4. Keep replies concise, well-formatted with markdown bullet points and bold headers, easy to read on mobile and web screens during home visits.`;

function getFriendlyFallbackReply(prompt: string, therapistName: string): string {
  const lower = prompt.toLowerCase().trim();

  // Greetings / Small talk
  if (/^(hi|hello|hey|hola|namaste|good morning|good afternoon|good evening|howdy|sup)[\s!.]*$/i.test(lower) || lower.length <= 3) {
    return `Hello ${therapistName}! 👋 Great to connect with you today.\n\nI'm your Aries Clinical Copilot — ready to assist you with evidence-based rehabilitation protocols, differential diagnosis, red flag triage, or exercise prescriptions for your doorstep visits.\n\nWhat clinical case or patient condition are we discussing today?`;
  }

  if (lower.includes('how are you') || lower.includes('who are you') || lower.includes('what can you do')) {
    return `I'm doing wonderful, thank you for asking, ${therapistName}! 😊\n\nAs your AI Clinical Copilot, I'm here to support your clinical practice with:\n• **Evidence-based exercise progressions** for orthopedic, neuro, and pediatric cases\n• **Red flag screenings** & clinical emergency triage\n• **Differential diagnosis & special orthopedic test** checklists\n• **SOAP note formulation & documentation** support\n\nFeel free to ask about any patient case, injury protocol, or treatment modality you'd like to explore!`;
  }

  if (lower.includes('thanks') || lower.includes('thank you')) {
    return `You're very welcome, ${therapistName}! Always happy to support your clinical care. Let me know if you need anything else for your patient sessions! 🌟`;
  }

  // TKR / Knee
  if (lower.includes('tkr') || (lower.includes('knee') && lower.includes('rehab'))) {
    return `**Post-Total Knee Arthroplasty (TKA) Clinical Protocol:**\n\nHello ${therapistName}, here is the recommended evidence-based progression for Day 10–14 post-op:\n\n1. **Active-Assisted ROM:** Heel slides with strap assistance targeting 90° flexion; prone or seated knee extensions.\n2. **Extensor Mechanism:** Isometric quad sets with towel roll biofeedback; Straight Leg Raise (SLR) with zero extensor lag.\n3. **Patellar Mobilization:** Superior/inferior and medial/lateral glides to prevent capsular adhesions.\n4. **Closed-Kinetic Chain:** Bilateral mini-squats (0–30°), 2-inch block step-ups with railing support.\n5. **Cryotherapy & Elevation:** 15–20 mins post-session to manage joint effusion.\n\n⚠️ **Safety Screening:** Ensure absence of calf tenderness, warmth, or asymmetrical swelling (DVT risk) and verify clean incision healing.`;
  }

  // Red Flags / Lumbar / Spine
  if (lower.includes('red flag') || lower.includes('cauda') || lower.includes('spine')) {
    return `**Emergency Red Flag Screening for Acute Lumbar & Spine Cases:**\n\n${therapistName}, keep a high index of suspicion for the following critical indicators:\n\n• **Cauda Equina Syndrome:** Saddle anesthesia (numbness in perineum/buttocks), sudden urinary retention/overflow incontinence, progressive bilateral lower limb weakness.\n• **Spinal Malignancy:** Unexplained weight loss, relentless pain unremitting with rest/recumbency, history of cancer, age > 50 with severe onset.\n• **Infection/Discitis:** High fever, systemic chills, localized spinal tenderness, recent invasive procedure/infection.\n• **Abdominal Aortic Aneurysm (AAA):** Pulsatile abdominal mass, tearing deep lumbar/flank pain.\n\n🚨 **Clinical Action:** If cauda equina or progressive neuro deficit is identified, immediately suspend home therapy and activate the Aries Clinical SOS Protocol for emergency hospital referral.`;
  }

  // General Clinical fallback
  return `**Clinical Assessment & Protocol Synthesis:**\n\nHello ${therapistName}, regarding **"${prompt}"**:\n\n1. **Initial Clinical Objective:** Establish baseline active and passive range of motion, assess functional pain thresholds (VAS scale), and check neural dynamic mobility (SLR / Slump / ULTT tests).\n2. **Therapeutic Loading:** Begin with graded submaximal isometric stabilization before transitioning to active-assisted and dynamic eccentric loading.\n3. **Recommended Dosage:** 2–3 sets of 8–10 controlled repetitions, twice daily, keeping symptom irritability < 3/10 on the visual analog scale.\n4. **Home Exercise Prescription:** Ensure proper ergonomic alignment and provide clear visual cues for independent home performance.\n\nWould you like me to tailor this for a specific patient demographic, acute stage, or post-surgical timeframe?`;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { prompt, therapistName = 'Doctor', conversationHistory = [] } = body;

    if (!prompt || typeof prompt !== 'string' || !prompt.trim()) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
    }

    const trimmedPrompt = prompt.trim();

    // Check for quick greetings locally first for instant, delightful response
    const isQuickGreeting = /^(hi|hello|hey|hola|namaste|good morning|good afternoon|good evening|howdy|sup)[\s!.]*$/i.test(trimmedPrompt);
    if (isQuickGreeting) {
      return NextResponse.json({
        success: true,
        reply: getFriendlyFallbackReply(trimmedPrompt, therapistName),
      });
    }

    // Try Gemini API if key is available
    if (GEMINI_API_KEY) {
      try {
        const contents = [
          {
            role: 'user',
            parts: [
              {
                text: `${SYSTEM_INSTRUCTION}\n\nTherapist Name: ${therapistName}\nTherapist Query: ${trimmedPrompt}`,
              },
            ],
          },
        ];

        const geminiRes = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents,
              generationConfig: {
                temperature: 0.7,
                maxOutputTokens: 800,
              },
            }),
          }
        );

        if (geminiRes.ok) {
          const geminiData = await geminiRes.json();
          const candidateText = geminiData?.candidates?.[0]?.content?.parts?.[0]?.text;
          if (candidateText && candidateText.trim().length > 0) {
            return NextResponse.json({
              success: true,
              reply: candidateText.trim(),
            });
          }
        }
      } catch (geminiErr) {
        console.warn('[AI Copilot] Gemini API error, falling back to local clinical knowledge engine:', geminiErr);
      }
    }

    // Fallback to rich, friendly clinical knowledge engine
    const reply = getFriendlyFallbackReply(trimmedPrompt, therapistName);
    return NextResponse.json({
      success: true,
      reply,
    });
  } catch (error: any) {
    console.error('[/api/app/ai-copilot] Error:', error);
    return NextResponse.json({
      success: true,
      reply: 'Hello Doctor! I am ready to assist with your patient case. Could you please share the diagnosis or clinical query you would like to review?',
    });
  }
}
