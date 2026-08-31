/**
 * Fetches AI-published blog articles from the Growth Engine public catalog.
 */

export interface GrowthBlogPost {
  id: string;
  slug: string;
  title: string;
  summary: string;
  content: string;
  contentId?: string;
  territory?: string;
  topic?: string;
  publishedAt?: string;
  url?: string;
  imageUrl?: string;
  cta?: string;
}

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '') ||
  'https://api.ariesxpert.com/api/v1';

const FALLBACK_CLINICAL_ARTICLES: GrowthBlogPost[] = [
  {
    id: 'post-lower-back-pain-rehab',
    slug: 'evidence-based-lower-back-pain-rehabilitation-at-home',
    title: 'Evidence-Based Lower Back Pain Rehabilitation: Modern Clinical Protocols at Home',
    summary: 'Discover how targeted core stabilization, Lumbar McKenzie mechanical diagnosis, and digital electrotherapy reduce disc herniation and sciatica pain without invasive surgery.',
    content: `# Evidence-Based Lower Back Pain Rehabilitation: Modern Clinical Protocols at Home

Lower back pain (LBP) remains the leading cause of activity limitation and work absence worldwide. Whether resulting from acute lumbar strain, lumbar disc herniation, spinal stenosis, or postural fatigue from prolonged desk work, comprehensive home-based physical rehabilitation has demonstrated superior long-term outcomes compared to passive rest alone.

## 1. Acute vs. Subacute Clinical Pathways
In the acute phase (0–4 weeks), our clinical priority focuses on inflammation reduction and directional preference identification:
- **Mechanical Diagnosis and Therapy (MDT / McKenzie Method):** Classifying symptoms into derangement, dysfunction, or postural syndromes to prescribe directional extension/flexion movements that promote centralization of radiating sciatic pain.
- **Electrotherapy & Modalities:** Deploying calibrated Interferential Therapy (IFT) and Class IV Laser to downregulate nociceptive nerve firing and alleviate severe muscle spasms.

## 2. Core Stability & Motor Control
Long-term spinal protection requires deep musculature reactivation:
- **Transversus Abdominis & Multifidus Recruitment:** Restoring neuromuscular timing before global mobilization.
- **Neutral Spine Loading:** Progressing from supine bridging to quadruped bird-dogs, side planks, and loaded hip hinges.

## 3. Ergonomics and Lifestyle Modification
Over 70% of recurrences stem from uncorrected workstation ergonomics. Our senior visiting physiotherapists conduct an on-site evaluation of chair lumbar support, monitor focal height, and daily sitting intervals to eliminate micro-trauma.

## Conclusion
With structured, doorstep clinical intervention, over 88% of patients achieve significant pain relief and functional restoration within 10–15 sessions.`,
    territory: 'Physiotherapy & Spine Care',
    topic: 'Back Pain & Spine',
    publishedAt: '2026-02-15T00:00:00.000Z',
    imageUrl: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&q=85&w=1600',
  },
  {
    id: 'post-knee-osteoarthritis-management',
    slug: 'managing-knee-osteoarthritis-quadriceps-strengthening-home-care',
    title: 'Managing Knee Osteoarthritis at Home: Joint Preservation & Advanced Biomechanics',
    summary: 'A complete clinical guide to non-surgical knee osteoarthritis care: isometric quad loading, patellar mobilization, hyaluronic joint offloading, and pain-free mobility.',
    content: `# Managing Knee Osteoarthritis at Home: Joint Preservation & Advanced Biomechanics

Osteoarthritis (OA) of the knee is a degenerative articular cartilage condition affecting millions of active adults and senior citizens. Modern clinical guidelines strongly emphasize that targeted physical therapy is first-line management for preserving joint space and postponing or avoiding surgical arthroplasty.

## 1. Targeted Quadriceps & Hamstring Conditioning
The knee joint absorbs up to 4x body weight during stair descent. By systematically strengthening the vastus medialis oblique (VMO) and gluteus medius:
- **Closed Kinetic Chain Exercises:** Wall squats with Swiss ball support and straight leg raises reduce tibiofemoral peak stress.
- **Range of Motion Optimization:** Gentle passive knee flexion and extension to circulate synovial fluid and nourish joint cartilage.

## 2. In-Home Therapeutic Modalities
- **High-Frequency Therapeutic Ultrasound:** Promotes deep tissue micro-massage to reduce intra-capsular effusion.
- **TENS & Cryotherapy Protocols:** Manages inflammatory flare-ups post-exertion without pharmacological reliance.

## 3. Gait Correction & Assisted Walking
Our therapists assess foot pronation, pelvic drop (Trendelenburg sign), and stride cadence to prescribe customized orthotics and walking aids that offload the medial knee compartment.`,
    territory: 'Orthopedic Rehabilitation',
    topic: 'Knee & Joint Pain',
    publishedAt: '2026-02-10T00:00:00.000Z',
    imageUrl: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&q=85&w=1600',
  },
  {
    id: 'post-stroke-neuro-recovery-timeline',
    slug: 'post-stroke-neurological-rehabilitation-timeline-and-neuroplasticity',
    title: 'Post-Stroke Neurological Recovery: Harnessing Neuroplasticity with Home Rehabilitation',
    summary: 'Understand the critical golden window of post-stroke rehabilitation, Bobath concepts, task-oriented gait training, and hemiplegic limb activation in familiar home surroundings.',
    content: `# Post-Stroke Neurological Recovery: Harnessing Neuroplasticity with Home Rehabilitation

Surviving an ischemic or hemorrhagic stroke marks the beginning of the recovery journey. Clinical evidence confirms that intensive, repetitive, and task-specific rehabilitation conducted in the patient’s real-world home environment significantly accelerates neurological retraining via brain neuroplasticity.

## 1. The Critical 90-Day Golden Window
The first 3 to 6 months post-stroke represent maximum spontaneous neuroplastic recovery:
- **Bobath & NDT Approaches:** Inhibiting abnormal synergies and spasticity while facilitating normal postural control.
- **Constraint-Induced Movement Therapy (CIMT):** Forcing activation of the affected upper extremity to overcome learned non-use.

## 2. Balance, Coordination & Functional Transfers
Regaining independence begins with functional milestones:
- Bed mobility, rolling, and sit-to-stand transitions.
- Dual-task cognitive-motor gait training to reduce fall risks.
- Proprioceptive neuromuscular facilitation (PNF) patterns for coordinated limb movement.

## 3. Family Training and Emotional Support
Aries PhysioCare’s dedicated neurological team trains family members and primary caregivers in safe transfer mechanics, positioning protocols, and daily encouragement regimens.`,
    territory: 'Neurological Care',
    topic: 'Stroke & Neuro Rehab',
    publishedAt: '2026-02-05T00:00:00.000Z',
    imageUrl: 'https://images.unsplash.com/photo-1559757175-5700dde675bc?auto=format&fit=crop&q=85&w=1600',
  }
];

export async function fetchGrowthBlogPosts(): Promise<GrowthBlogPost[]> {
  try {
    const res = await fetch(`${API_BASE}/growth-engine/public/website/blogs`, {
      next: { revalidate: 300 },
    });
    if (res.ok) {
      const json = await res.json();
      if (Array.isArray(json?.data) && json.data.length > 0) {
        return json.data;
      }
    }
  } catch {
    // Network or server error — return curated clinical articles
  }
  return FALLBACK_CLINICAL_ARTICLES;
}

export async function fetchGrowthBlogBySlug(
  slug: string,
): Promise<GrowthBlogPost | null> {
  const posts = await fetchGrowthBlogPosts();
  return posts.find((p) => p.slug === slug) ?? FALLBACK_CLINICAL_ARTICLES.find((p) => p.slug === slug) ?? null;
}
