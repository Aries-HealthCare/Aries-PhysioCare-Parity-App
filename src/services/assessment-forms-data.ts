import { DynamicAssessmentForm } from './provider-api';

export const BUILTIN_34_ASSESSMENT_FORMS: DynamicAssessmentForm[] = [
  // ── 1. ORTHOPEDIC FIRST VISIT ───────────────────────────
  {
    _id: 'form_ortho_first_01',
    title: 'Orthopedic & Musculoskeletal — Initial Assessment',
    description: 'Comprehensive baseline clinical assessment for new orthopedic patients.',
    treatmentType: 'Orthopedic',
    visitType: 'First Visit',
    questions: [
      { _id: 'q_o1_1', questionText: 'Chief Complaint & Affected Joint / Region', questionType: 'text', required: true, group: 'Subjective Assessment' },
      { _id: 'q_o1_2', questionText: 'Mechanism of Injury & Onset Duration', questionType: 'longText', required: true, group: 'Subjective Assessment' },
      { _id: 'q_o1_3', questionText: 'Current VAS Pain Intensity (0: No Pain - 10: Worst Pain)', questionType: 'scale', scaleMin: 0, scaleMax: 10, required: true, group: 'Pain Evaluation' },
      { _id: 'q_o1_4', questionText: 'Pain Nature & Sensation', questionType: 'singleChoice', options: ['Dull Ache', 'Sharp/Stabbing', 'Throbbing', 'Burning', 'Stiff/Aching', 'Radiating'], required: true, group: 'Pain Evaluation' },
      { _id: 'q_o1_5', questionText: 'Aggravating Factors', questionType: 'text', placeholder: 'e.g. Walking, stairs, prolonged sitting', group: 'Pain Evaluation' },
      { _id: 'q_o1_6', questionText: 'Relieving Factors', questionType: 'text', placeholder: 'e.g. Rest, ice, elevation, medication', group: 'Pain Evaluation' },
      { _id: 'q_o1_7', questionText: 'Active & Passive Range of Motion (ROM)', questionType: 'longText', required: true, placeholder: 'e.g. Flexion: 90°, Extension: 0°, Abduction: 80°', group: 'Objective Physical Exam' },
      { _id: 'q_o1_8', questionText: 'Manual Muscle Testing (MMT Grade)', questionType: 'singleChoice', options: ['Grade 0 (Zero)', 'Grade 1 (Trace)', 'Grade 2 (Poor)', 'Grade 3 (Fair)', 'Grade 4 (Good)', 'Grade 5 (Normal)'], required: true, group: 'Objective Physical Exam' },
      { _id: 'q_o1_9', questionText: 'Special Clinical Orthopedic Tests Performed', questionType: 'longText', placeholder: 'e.g. Lachman, McMurray, Hawkins-Kennedy, SLR, FABER', group: 'Special Tests' },
      { _id: 'q_o1_10', questionText: 'Palpation Findings & Tenderness Points', questionType: 'text', group: 'Objective Physical Exam' },
      { _id: 'q_o1_11', questionText: 'Clinical Diagnosis & Diagnostic Impression', questionType: 'text', required: true, group: 'Diagnosis & Prognosis' },
      { _id: 'q_o1_12', questionText: 'Rehabilitation Phase', questionType: 'singleChoice', options: ['Acute (0-2 Weeks)', 'Subacute (2-6 Weeks)', 'Chronic (>6 Weeks)', 'Functional Restoration', 'Sports Return'], required: true, group: 'Diagnosis & Prognosis' },
      { _id: 'q_o1_13', questionText: 'Treatment Modalities Provided Today', questionType: 'multipleChoice', options: ['Manual Therapy & Joint Mobilization', 'Electrotherapy (TENS / IFT)', 'Therapeutic Ultrasound', 'Cold / Heat Therapy', 'Therapeutic Exercise', 'Dry Needling', 'Kinesiology Taping'], required: true, group: 'Treatment Plan' },
      { _id: 'q_o1_14', questionText: 'Home Exercise Prescription Given to Patient', questionType: 'longText', required: true, group: 'Treatment Plan' },
      { _id: 'q_o1_15', questionText: 'Therapist Clinical Internal Notes', questionType: 'longText', group: 'Treatment Plan' },
    ],
  },

  // ── 2. ORTHOPEDIC REGULAR VISIT ──────────────────────────
  {
    _id: 'form_ortho_regular_02',
    title: 'Orthopedic & Musculoskeletal — Regular Follow-up Visit',
    description: 'Progress tracking, pain delta, and exercise progression for continuing sessions.',
    treatmentType: 'Orthopedic',
    visitType: 'Regular Visit',
    questions: [
      { _id: 'q_o2_1', questionText: 'Patient Response to Previous Treatment & Home Exercises', questionType: 'longText', required: true, group: 'Follow-up Subjective' },
      { _id: 'q_o2_2', questionText: 'Current VAS Pain Intensity (0-10)', questionType: 'scale', scaleMin: 0, scaleMax: 10, required: true, group: 'Pain Progress' },
      { _id: 'q_o2_3', questionText: 'Change in Pain since Last Session', questionType: 'singleChoice', options: ['Significantly Improved (>50%)', 'Moderately Improved (25-50%)', 'Mildly Improved (<25%)', 'No Change / Same', 'Slightly Increased'], required: true, group: 'Pain Progress' },
      { _id: 'q_o2_4', questionText: 'Current Active Range of Motion (ROM Delta)', questionType: 'text', placeholder: 'e.g. Flexion improved from 90° to 110°', required: true, group: 'Objective Progress' },
      { _id: 'q_o2_5', questionText: 'Current Muscle Strength (MMT Grade)', questionType: 'singleChoice', options: ['Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5'], required: true, group: 'Objective Progress' },
      { _id: 'q_o2_6', questionText: 'Functional Independence & Activities of Daily Living (ADL) Status', questionType: 'singleChoice', options: ['Independent', 'Requires Minimal Assistance', 'Moderate Assistance', 'Dependent'], group: 'Functional Progress' },
      { _id: 'q_o2_7', questionText: 'Treatment Delivered in Session', questionType: 'multipleChoice', options: ['Joint Mobilization Grade III-IV', 'Electrotherapy', 'Strengthening & Resistance Bands', 'Gait & Balance Training', 'Soft Tissue Release', 'Add-on Modality'], required: true, group: 'Treatment Plan' },
      { _id: 'q_o2_8', questionText: 'Progressed Home Exercise Prescription', questionType: 'longText', required: true, group: 'Treatment Plan' },
    ],
  },

  // ── 3. CERVICAL SPINE & RADICULOPATHY FIRST VISIT ────────
  {
    _id: 'form_cervical_first_03',
    title: 'Cervical Spine & Neck Pain — Initial Assessment',
    treatmentType: 'Spine & Cervical',
    visitType: 'First Visit',
    questions: [
      { _id: 'q_c1_1', questionText: 'Neck Pain Symptoms & Duration', questionType: 'text', required: true, group: 'Subjective' },
      { _id: 'q_c1_2', questionText: 'Upper Limb Radicular Pain / Paresthesia (Numbness/Tingling)', questionType: 'singleChoice', options: ['None', 'Unilateral Right Arm', 'Unilateral Left Arm', 'Bilateral Upper Limbs'], required: true, group: 'Subjective' },
      { _id: 'q_c1_3', questionText: 'VAS Pain Score (0-10)', questionType: 'scale', scaleMin: 0, scaleMax: 10, required: true, group: 'Pain' },
      { _id: 'q_c1_4', questionText: 'Cervical Range of Motion (Flexion/Ext/Rot/Side Flex)', questionType: 'longText', required: true, group: 'Objective' },
      { _id: 'q_c1_5', questionText: 'Spurling Test / Upper Limb Tension Test (ULTT)', questionType: 'singleChoice', options: ['Positive Right', 'Positive Left', 'Negative Bilaterally'], group: 'Special Tests' },
      { _id: 'q_c1_6', questionText: 'Myotome & Dermatome Assessment (C5-T1)', questionType: 'longText', group: 'Neurological' },
      { _id: 'q_c1_7', questionText: 'Treatment Delivered & Postural Ergonomic Advice', questionType: 'longText', required: true, group: 'Plan' },
    ],
  },

  // ── 4. CERVICAL SPINE REGULAR VISIT ─────────────────────
  {
    _id: 'form_cervical_regular_04',
    title: 'Cervical Spine & Neck Pain — Regular Follow-up Visit',
    treatmentType: 'Spine & Cervical',
    visitType: 'Regular Visit',
    questions: [
      { _id: 'q_c2_1', questionText: 'Neck Stiffness & Radicular Symptoms Update', questionType: 'longText', required: true, group: 'Subjective' },
      { _id: 'q_c2_2', questionText: 'Current VAS Pain Score (0-10)', questionType: 'scale', scaleMin: 0, scaleMax: 10, required: true, group: 'Pain' },
      { _id: 'q_c2_3', questionText: 'Cervical Active ROM Improvement', questionType: 'text', group: 'Objective' },
      { _id: 'q_c2_4', questionText: 'Deep Neck Flexor Activation (Chin Tucks) Performance', questionType: 'singleChoice', options: ['Good Activation (>10s hold)', 'Fair Activation', 'Poor / Synergistic Compensation'], group: 'Objective' },
      { _id: 'q_c2_5', questionText: 'Therapy Delivered & Exercise Progressions', questionType: 'longText', required: true, group: 'Plan' },
    ],
  },

  // ── 5. LUMBAR SPINE & SCIATICA FIRST VISIT ──────────────
  {
    _id: 'form_lumbar_first_05',
    title: 'Lumbar Spine, Disc Herniation & Sciatica — Initial Assessment',
    treatmentType: 'Spine & Lumbar',
    visitType: 'First Visit',
    questions: [
      { _id: 'q_l1_1', questionText: 'Low Back Pain Location & Radiation to Leg / Foot', questionType: 'text', required: true, group: 'Subjective' },
      { _id: 'q_l1_2', questionText: 'Red Flags Check (Cauda Equina / Bowel / Bladder / Saddle Numbness)', questionType: 'singleChoice', options: ['Negative - Cleared', 'Positive - Requires Urgent Referral'], required: true, group: 'Safety Screen' },
      { _id: 'q_l1_3', questionText: 'VAS Pain Score (0-10)', questionType: 'scale', scaleMin: 0, scaleMax: 10, required: true, group: 'Pain' },
      { _id: 'q_l1_4', questionText: 'Straight Leg Raise (SLR) Angle & Positive Side', questionType: 'text', placeholder: 'e.g. Right SLR +ve at 40°, Left SLR negative', required: true, group: 'Special Tests' },
      { _id: 'q_l1_5', questionText: 'Slump Test & Femoral Nerve Stretch Test', questionType: 'singleChoice', options: ['Slump +ve', 'Femoral Stretch +ve', 'Negative'], group: 'Special Tests' },
      { _id: 'q_l1_6', questionText: 'Lumbar ROM (Flexion, Extension, Lateral Shift)', questionType: 'text', group: 'Objective' },
      { _id: 'q_l1_7', questionText: 'Directional Preference (McKenzie Protocol)', questionType: 'singleChoice', options: ['Extension Bias (Centralizes with Extension)', 'Flexion Bias', 'Lateral Shift Bias', 'No Preference'], group: 'McKenzie Evaluation' },
      { _id: 'q_l1_8', questionText: 'Treatment Plan & Core Stabilization Prescription', questionType: 'longText', required: true, group: 'Plan' },
    ],
  },

  // ── 6. LUMBAR SPINE REGULAR VISIT ───────────────────────
  {
    _id: 'form_lumbar_regular_06',
    title: 'Lumbar Spine & Sciatica — Regular Follow-up Visit',
    treatmentType: 'Spine & Lumbar',
    visitType: 'Regular Visit',
    questions: [
      { _id: 'q_l2_1', questionText: 'Back Pain & Sciatic Radiation Change (Centralization)', questionType: 'singleChoice', options: ['Centralized into Lower Back (Significant Recovery)', 'Reduced Peripheral Pain', 'Unchanged', 'Peripheralized'], required: true, group: 'Subjective' },
      { _id: 'q_l2_2', questionText: 'Current VAS Score (0-10)', questionType: 'scale', scaleMin: 0, scaleMax: 10, required: true, group: 'Pain' },
      { _id: 'q_l2_3', questionText: 'Current SLR Angle', questionType: 'text', placeholder: 'e.g. SLR improved to 75°', group: 'Objective' },
      { _id: 'q_l2_4', questionText: 'Core & Glute Activation (Bridging / Bird-Dog Tolerance)', questionType: 'singleChoice', options: ['Good (Level 2-3 Exercises)', 'Moderate (Level 1 Isometrics)', 'Poor'], group: 'Objective' },
      { _id: 'q_l2_5', questionText: 'Session Treatment & Progressed Home Regimen', questionType: 'longText', required: true, group: 'Plan' },
    ],
  },

  // ── 7. KNEE OSTEOARTHRITIS & TKR FIRST VISIT ────────────
  {
    _id: 'form_knee_first_07',
    title: 'Knee Joint, Osteoarthritis & Post-TKR — Initial Assessment',
    treatmentType: 'Knee & Lower Limb',
    visitType: 'First Visit',
    questions: [
      { _id: 'q_k1_1', questionText: 'Knee Condition (Osteoarthritis / Post-TKR / Ligament Injury)', questionType: 'text', required: true, group: 'Subjective' },
      { _id: 'q_k1_2', questionText: 'Surgical Date / Post-Op Day (if applicable)', questionType: 'text', placeholder: 'e.g. Post-TKR Day 12', group: 'Subjective' },
      { _id: 'q_k1_3', questionText: 'Current VAS Pain Score (0-10)', questionType: 'scale', scaleMin: 0, scaleMax: 10, required: true, group: 'Pain' },
      { _id: 'q_k1_4', questionText: 'Knee Active & Passive Flexion Angle (in Degrees)', questionType: 'number', suffix: '°', required: true, group: 'ROM' },
      { _id: 'q_k1_5', questionText: 'Knee Extension Deficit / Extensor Lag (in Degrees)', questionType: 'number', suffix: '°', required: true, group: 'ROM' },
      { _id: 'q_k1_6', questionText: 'Effusion / Swelling Grade & Patellar Mobility', questionType: 'singleChoice', options: ['Mild Effusion', 'Moderate Effusion', 'Severe Effusion', 'Normal / No Effusion'], group: 'Objective' },
      { _id: 'q_k1_7', questionText: 'Quadriceps & Hamstrings MMT Grade', questionType: 'singleChoice', options: ['Grade 2', 'Grade 3 (Can SLR)', 'Grade 4', 'Grade 5'], required: true, group: 'Strength' },
      { _id: 'q_k1_8', questionText: 'Ambulation Status (Walker / Cane / Independent)', questionType: 'singleChoice', options: ['Walker / Frame Support', 'Elbow Crutches', 'Single Cane / Stick', 'Independent Ambulation'], required: true, group: 'Functional' },
      { _id: 'q_k1_9', questionText: 'Mobilization & Home Exercise Protocol', questionType: 'longText', required: true, group: 'Plan' },
    ],
  },

  // ── 8. KNEE OSTEOARTHRITIS REGULAR VISIT ────────────────
  {
    _id: 'form_knee_regular_08',
    title: 'Knee Joint & Post-TKR — Regular Follow-up Visit',
    treatmentType: 'Knee & Lower Limb',
    visitType: 'Regular Visit',
    questions: [
      { _id: 'q_k2_1', questionText: 'Stiffness & Weight-Bearing Tolerance Update', questionType: 'text', required: true, group: 'Subjective' },
      { _id: 'q_k2_2', questionText: 'Current VAS Pain Score (0-10)', questionType: 'scale', scaleMin: 0, scaleMax: 10, required: true, group: 'Pain' },
      { _id: 'q_k2_3', questionText: 'Current Knee Flexion Angle (Degrees)', questionType: 'number', suffix: '°', required: true, group: 'ROM' },
      { _id: 'q_k2_4', questionText: 'Extensor Lag Resolved?', questionType: 'boolean', required: true, group: 'ROM' },
      { _id: 'q_k2_5', questionText: 'Gait Quality & Assistive Device Weaning', questionType: 'singleChoice', options: ['Transitioning to Cane', 'Independent Gait with Good Step Length', 'Still on Walker Frame'], group: 'Functional' },
      { _id: 'q_k2_6', questionText: 'Treatment Delivered & Home Program Progression', questionType: 'longText', required: true, group: 'Plan' },
    ],
  },

  // ── 9. SHOULDER & ROTATOR CUFF FIRST VISIT ──────────────
  {
    _id: 'form_shoulder_first_09',
    title: 'Shoulder Joint, Rotator Cuff & Frozen Shoulder — Initial Assessment',
    treatmentType: 'Shoulder & Upper Limb',
    visitType: 'First Visit',
    questions: [
      { _id: 'q_s1_1', questionText: 'Shoulder Complaint (Adhesive Capsulitis / Cuff Tear / Impingement)', questionType: 'text', required: true, group: 'Subjective' },
      { _id: 'q_s1_2', questionText: 'Night Pain & Sleep Disturbance', questionType: 'singleChoice', options: ['Severe (Cannot sleep on side)', 'Moderate', 'Mild / None'], required: true, group: 'Pain' },
      { _id: 'q_s1_3', questionText: 'VAS Pain Score (0-10)', questionType: 'scale', scaleMin: 0, scaleMax: 10, required: true, group: 'Pain' },
      { _id: 'q_s1_4', questionText: 'Active Shoulder Flexion & Abduction ROM (Degrees)', questionType: 'text', placeholder: 'e.g. Flexion: 110°, Abduction: 90°', required: true, group: 'ROM' },
      { _id: 'q_s1_5', questionText: 'External & Internal Rotation ROM (Degrees)', questionType: 'text', placeholder: 'e.g. Ext Rot: 30°, Int Rot: Hand to L4', required: true, group: 'ROM' },
      { _id: 'q_s1_6', questionText: 'Special Tests (Neer, Hawkins-Kennedy, Empty Can, Speed Test)', questionType: 'longText', group: 'Special Tests' },
      { _id: 'q_s1_7', questionText: 'Glenohumeral Joint Mobilization & Scapular Rehab Plan', questionType: 'longText', required: true, group: 'Plan' },
    ],
  },

  // ── 10. SHOULDER REGULAR VISIT ──────────────────────────
  {
    _id: 'form_shoulder_regular_10',
    title: 'Shoulder Joint & Rotator Cuff — Regular Follow-up Visit',
    treatmentType: 'Shoulder & Upper Limb',
    visitType: 'Regular Visit',
    questions: [
      { _id: 'q_s2_1', questionText: 'Overhead Reach & Night Pain Progress', questionType: 'text', required: true, group: 'Subjective' },
      { _id: 'q_s2_2', questionText: 'Current VAS Score (0-10)', questionType: 'scale', scaleMin: 0, scaleMax: 10, required: true, group: 'Pain' },
      { _id: 'q_s2_3', questionText: 'Shoulder Abduction & External Rotation ROM Delta', questionType: 'text', group: 'ROM' },
      { _id: 'q_s2_4', questionText: 'Scapular Control & Rotator Cuff Resistance Tolerance', questionType: 'singleChoice', options: ['Progressed to Yellow/Red TheraBand', 'Isometric Strengthening Only', 'Passive Mobilization Phase'], group: 'Strength' },
      { _id: 'q_s2_5', questionText: 'Session Treatment & Progressed Home Exercises', questionType: 'longText', required: true, group: 'Plan' },
    ],
  },

  // ── 11. NEUROLOGICAL STROKE & HEMIPLEGIA FIRST VISIT ────
  {
    _id: 'form_stroke_first_11',
    title: 'Neurological Stroke & Hemiplegia — Baseline Neuro Assessment',
    treatmentType: 'Neurology & Stroke',
    visitType: 'First Visit',
    questions: [
      { _id: 'q_n1_1', questionText: 'Stroke Onset Date & Type (Ischemic / Hemorrhagic)', questionType: 'text', required: true, group: 'History' },
      { _id: 'q_n1_2', questionText: 'Affected Hemiplegic Side', questionType: 'singleChoice', options: ['Right Hemiplegia', 'Left Hemiplegia', 'Bilateral'], required: true, group: 'History' },
      { _id: 'q_n1_3', questionText: 'Brunnstrom Stage of Motor Recovery (Stage 1 - 6)', questionType: 'singleChoice', options: ['Stage 1 (Flaccidity)', 'Stage 2 (Synergies Elicited)', 'Stage 3 (Voluntary Synergies)', 'Stage 4 (Combinations out of Synergy)', 'Stage 5 (Relative Independence)', 'Stage 6 (Isolated Movement)'], required: true, group: 'Motor Assessment' },
      { _id: 'q_n1_4', questionText: 'Modified Ashworth Scale (MAS) Spasticity Grade', questionType: 'singleChoice', options: ['Grade 0 (No Spasticity)', 'Grade 1 (Slight catch)', 'Grade 1+ (Catch & minimal resistance)', 'Grade 2 (Marked increase in tone)', 'Grade 3 (Considerable increase in tone)', 'Grade 4 (Rigid / Fixed)'], required: true, group: 'Tone Assessment' },
      { _id: 'q_n1_5', questionText: 'Bed Mobility & Trunk Balance (Sitting / Standing)', questionType: 'singleChoice', options: ['Independent Standing Balance', 'Supported Standing Balance', 'Static Sitting Balance Only', 'Poor Trunk Control / Bed-Bound'], required: true, group: 'Functional Assessment' },
      { _id: 'q_n1_6', questionText: 'Gait Assessment & Foot Drop Presence', questionType: 'text', placeholder: 'e.g. Circumductory gait with AFO support, step length asymmetric', group: 'Gait' },
      { _id: 'q_n1_7', questionText: 'Neuro-Facilitation (NDT / PNF / Task-Oriented) Treatment Protocol', questionType: 'longText', required: true, group: 'Plan' },
    ],
  },

  // ── 12. NEUROLOGICAL STROKE REGULAR VISIT ───────────────
  {
    _id: 'form_stroke_regular_12',
    title: 'Neurological Stroke & Hemiplegia — Regular Follow-up Visit',
    treatmentType: 'Neurology & Stroke',
    visitType: 'Regular Visit',
    questions: [
      { _id: 'q_n2_1', questionText: 'Functional Motor Gains & Spasticity Update', questionType: 'longText', required: true, group: 'Subjective' },
      { _id: 'q_n2_2', questionText: 'Upper Extremity Voluntary Control (Hand Grasp & Release)', questionType: 'singleChoice', options: ['Functional Pincer / Power Grasp', 'Gross Flexion Synergy Only', 'Associated Reaction on Effort', 'Flaccid Hand'], group: 'Motor' },
      { _id: 'q_n2_3', questionText: 'Standing Balance & Weight-Bearing Symmetry (% on Affected Leg)', questionType: 'singleChoice', options: ['Equal Weight Bearing (50/50)', 'Moderate Asymmetry (30/70)', 'Severe Asymmetry (<20% on hemiplegic leg)'], group: 'Balance' },
      { _id: 'q_n2_4', questionText: 'Dynamic Gait Training Distance (Meters) & Speed', questionType: 'text', placeholder: 'e.g. 50 meters with quad-cane in 2 minutes', group: 'Gait' },
      { _id: 'q_n2_5', questionText: 'Neuro-Rehab Interventions & Caregiver Exercise Training', questionType: 'longText', required: true, group: 'Plan' },
    ],
  },

  // ── 13. PARKINSON\'S DISEASE ASSESSMENT (First Visit) ──
  {
    _id: 'form_parkinsons_first_13',
    title: 'Parkinson\'s Disease & Movement Disorders — Initial Assessment',
    treatmentType: 'Neurology & Parkinson\'s',
    visitType: 'First Visit',
    questions: [
      { _id: 'q_pk1_1', questionText: 'Hoehn & Yahr Clinical Stage (Stage 1 to 5)', questionType: 'singleChoice', options: ['Stage 1 (Unilateral)', 'Stage 2 (Bilateral, Balance intact)', 'Stage 3 (Bilateral + Impaired Balance)', 'Stage 4 (Severe disability, can walk)', 'Stage 5 (Wheelchair / Bed-bound)'], required: true, group: 'Clinical Stage' },
      { _id: 'q_pk1_2', questionText: 'Tremor, Rigidity & Bradykinesia Severity', questionType: 'longText', required: true, group: 'Motor Symptoms' },
      { _id: 'q_pk1_3', questionText: 'Freezing of Gait (FOG) & Festinating Gait Presence', questionType: 'singleChoice', options: ['Frequent Freezing (Turns & Doorways)', 'Occasional Freezing', 'No Freezing Observed'], required: true, group: 'Gait' },
      { _id: 'q_pk1_4', questionText: 'Timed Up and Go (TUG Test in Seconds)', questionType: 'number', suffix: 'sec', group: 'Functional Balance' },
      { _id: 'q_pk1_5', questionText: 'LSVT BIG / High-Amplitude Cueing Movement Plan', questionType: 'longText', required: true, group: 'Plan' },
    ],
  },

  // ── 14. PARKINSON\'S DISEASE REGULAR VISIT ───────────────
  {
    _id: 'form_parkinsons_regular_14',
    title: 'Parkinson\'s Disease — Regular Follow-up Visit',
    treatmentType: 'Neurology & Parkinson\'s',
    visitType: 'Regular Visit',
    questions: [
      { _id: 'q_pk2_1', questionText: 'On/Off Medication Phase during Session', questionType: 'singleChoice', options: ['ON Medication (Optimal Window)', 'OFF Medication (Stiff/Bradykinetic)', 'Transitioning'], required: true, group: 'Clinical' },
      { _id: 'q_pk2_2', questionText: 'Rhythmic Auditory Cueing & Dual-Task Walking Performance', questionType: 'text', group: 'Gait' },
      { _id: 'q_pk2_3', questionText: 'Postural Control & Fall Prevention Drills Done', questionType: 'longText', required: true, group: 'Plan' },
    ],
  },

  // ── 15. GERIATRIC & FALL RISK ASSESSMENT (First Visit) ──
  {
    _id: 'form_geriatric_first_15',
    title: 'Geriatric Rehabilitation & Fall Risk Evaluation — Initial Assessment',
    treatmentType: 'Geriatric Care',
    visitType: 'First Visit',
    questions: [
      { _id: 'q_g1_1', questionText: 'History of Falls in Past 6 Months', questionType: 'singleChoice', options: ['0 Falls', '1 Fall', '2 or More Falls (High Risk)'], required: true, group: 'History' },
      { _id: 'q_g1_2', questionText: 'Berg Balance Scale (BBS) Estimated Score / High Risk (<45)', questionType: 'number', suffix: '/56', group: 'Balance' },
      { _id: 'q_g1_3', questionText: '30-Second Sit-to-Stand Repetitions', questionType: 'number', suffix: 'reps', group: 'Lower Limb Strength' },
      { _id: 'q_g1_4', questionText: 'Home Hazard & Footwear Assessment', questionType: 'text', placeholder: 'e.g. Slippery bathroom floor, loose carpets, poor lighting', group: 'Safety' },
      { _id: 'q_g1_5', questionText: 'Senior Functional Independence & Balance Restoration Protocol', questionType: 'longText', required: true, group: 'Plan' },
    ],
  },

  // ── 16. GERIATRIC REGULAR VISIT ─────────────────────────
  {
    _id: 'form_geriatric_regular_16',
    title: 'Geriatric Rehabilitation — Regular Follow-up Visit',
    treatmentType: 'Geriatric Care',
    visitType: 'Regular Visit',
    questions: [
      { _id: 'q_g2_1', questionText: 'Daily Physical Activity & Vitality Update', questionType: 'text', required: true, group: 'Subjective' },
      { _id: 'q_g2_2', questionText: 'Sit-to-Stand Improvement & Chair Transfers', questionType: 'singleChoice', options: ['Independent without Hand Support', 'Requires Armrest Push', 'Needs Caregiver Assist'], group: 'Functional' },
      { _id: 'q_g2_3', questionText: 'Tandem Stance & Single Leg Balance Tolerance', questionType: 'text', group: 'Balance' },
      { _id: 'q_g2_4', questionText: 'Therapy Delivered & Safe Activity Regimen', questionType: 'longText', required: true, group: 'Plan' },
    ],
  },

  // ── 17. SPORTS INJURY & ACL REHAB (First Visit) ─────────
  {
    _id: 'form_sports_first_17',
    title: 'Sports Injury & ACL / Meniscus — Initial Assessment',
    treatmentType: 'Sports Medicine',
    visitType: 'First Visit',
    questions: [
      { _id: 'q_sp1_1', questionText: 'Sport / Athletic Activity & Mechanism of Injury', questionType: 'text', required: true, group: 'History' },
      { _id: 'q_sp1_2', questionText: 'Post-Op ACL Reconstruction Week (if applicable)', questionType: 'text', placeholder: 'e.g. Week 6 Post-ACL with Hamstring Graft', group: 'History' },
      { _id: 'q_sp1_3', questionText: 'Y-Balance / Dynamic Balance Test Symmetry', questionType: 'text', group: 'Functional' },
      { _id: 'q_sp1_4', questionText: 'Limb Symmetry Index (LSI) % for Quadriceps', questionType: 'number', suffix: '%', group: 'Strength' },
      { _id: 'q_sp1_5', questionText: 'Return-to-Play Progression Phase & Periodized Rehab Plan', questionType: 'longText', required: true, group: 'Plan' },
    ],
  },

  // ── 18. SPORTS INJURY REGULAR VISIT ─────────────────────
  {
    _id: 'form_sports_regular_18',
    title: 'Sports Injury & Performance — Regular Follow-up Visit',
    treatmentType: 'Sports Medicine',
    visitType: 'Regular Visit',
    questions: [
      { _id: 'q_sp2_1', questionText: 'Training Load & Plyometric Tolerance', questionType: 'text', required: true, group: 'Subjective' },
      { _id: 'q_sp2_2', questionText: 'Single Leg Hop for Distance Symmetry %', questionType: 'number', suffix: '%', group: 'Performance' },
      { _id: 'q_sp2_3', questionText: 'Eccentric Strength & Agility Drills Completed', questionType: 'longText', required: true, group: 'Plan' },
    ],
  },

  // ── 19. PEDIATRIC PHYSIOTHERAPY (First Visit) ───────────
  {
    _id: 'form_pediatric_first_19',
    title: 'Pediatric Physiotherapy & Motor Milestones — Initial Assessment',
    treatmentType: 'Pediatrics',
    visitType: 'First Visit',
    questions: [
      { _id: 'q_pd1_1', questionText: 'Child Age & Diagnosis (Cerebral Palsy / Global Delay / Torticollis)', questionType: 'text', required: true, group: 'History' },
      { _id: 'q_pd1_2', questionText: 'Gross Motor Function Classification (GMFCS Level I-V)', questionType: 'singleChoice', options: ['Level I (Walks without limitations)', 'Level II (Walks with limitations)', 'Level III (Walks with hand-held mobility device)', 'Level IV (Self-mobility with limitations)', 'Level V (Transported in manual wheelchair)'], group: 'Milestones' },
      { _id: 'q_pd1_3', questionText: 'Current Achieved Milestones (Head control, Rolling, Sitting, Crawling, Standing)', questionType: 'longText', required: true, group: 'Milestones' },
      { _id: 'q_pd1_4', questionText: 'Tone Assessment (Hypotonia / Spasticity / Dystonia)', questionType: 'text', group: 'Neuro-Development' },
      { _id: 'q_pd1_5', questionText: 'Play-Based Neuro-Developmental Therapy (NDT) Protocol', questionType: 'longText', required: true, group: 'Plan' },
    ],
  },

  // ── 20. PEDIATRIC PHYSIOTHERAPY REGULAR VISIT ───────────
  {
    _id: 'form_pediatric_regular_20',
    title: 'Pediatric Physiotherapy — Regular Follow-up Visit',
    treatmentType: 'Pediatrics',
    visitType: 'Regular Visit',
    questions: [
      { _id: 'q_pd2_1', questionText: 'Parent Report of Home Play & Milestone Progress', questionType: 'longText', required: true, group: 'Subjective' },
      { _id: 'q_pd2_2', questionText: 'Postural Reactions (Righting & Equilibrium Responses)', questionType: 'singleChoice', options: ['Intact & Prompt', 'Delayed', 'Absent'], group: 'Development' },
      { _id: 'q_pd2_3', questionText: 'Facilitated Movement & Sensory Integration Activities Delivered', questionType: 'longText', required: true, group: 'Plan' },
    ],
  },

  // ── 21. CARDIOPULMONARY & CHEST PHYSIO (First Visit) ────
  {
    _id: 'form_cardio_first_21',
    title: 'Cardiopulmonary & Chest Physiotherapy — Initial Assessment',
    treatmentType: 'Cardiopulmonary',
    visitType: 'First Visit',
    questions: [
      { _id: 'q_cp1_1', questionText: 'Respiratory Condition (COPD / Post-CABG / Bronchiectasis / Pneumonia)', questionType: 'text', required: true, group: 'History' },
      { _id: 'q_cp1_2', questionText: 'Baseline SpO2 (%) on Room Air & Heart Rate (BPM)', questionType: 'text', placeholder: 'e.g. SpO2: 96%, HR: 78 bpm', required: true, group: 'Vitals' },
      { _id: 'q_cp1_3', questionText: 'Breath Sounds on Auscultation (Wheeze / Crepitations / Rhonchi / Clear)', questionType: 'singleChoice', options: ['Bilateral Clear', 'Basal Crepitations', 'Expiratory Wheezing', 'Coarse Rhonchi'], required: true, group: 'Auscultation' },
      { _id: 'q_cp1_4', questionText: 'Modified Borg Dyspnea Scale (0: No Breathlessness - 10: Maximum)', questionType: 'scale', scaleMin: 0, scaleMax: 10, required: true, group: 'Dyspnea' },
      { _id: 'q_cp1_5', questionText: 'Chest Clearance (ACBT / Postural Drainage / Flutter) & Incentive Spirometry Plan', questionType: 'longText', required: true, group: 'Plan' },
    ],
  },

  // ── 22. CARDIOPULMONARY REGULAR VISIT ───────────────────
  {
    _id: 'form_cardio_regular_22',
    title: 'Cardiopulmonary & Chest Physiotherapy — Regular Follow-up Visit',
    treatmentType: 'Cardiopulmonary',
    visitType: 'Regular Visit',
    questions: [
      { _id: 'q_cp2_1', questionText: 'Sputum Clearance Volume, Color & Cough Productivity', questionType: 'text', required: true, group: 'Subjective' },
      { _id: 'q_cp2_2', questionText: 'Pre & Post-Session SpO2 (%) and Pulse Rate', questionType: 'text', required: true, group: 'Vitals' },
      { _id: 'q_cp2_3', questionText: '6-Minute Walk Test Distance (Meters) or Tolerated Ambulation', questionType: 'number', suffix: 'm', group: 'Endurance' },
      { _id: 'q_cp2_4', questionText: 'Breathing Exercises & Aerobic Pacing Regimen Delivered', questionType: 'longText', required: true, group: 'Plan' },
    ],
  },

  // ── 23. POST-SURGICAL FRACTURE REHAB (First Visit) ──────
  {
    _id: 'form_fracture_first_23',
    title: 'Post-Trauma Fracture & Orthopedic Surgery — Initial Assessment',
    treatmentType: 'Post-Surgical Trauma',
    visitType: 'First Visit',
    questions: [
      { _id: 'q_fr1_1', questionText: 'Fracture Site & Surgical Fixation (ORIF / Plate / Nail / Cast)', questionType: 'text', required: true, group: 'History' },
      { _id: 'q_fr1_2', questionText: 'Orthopedic Surgeon Weight-Bearing Protocol', questionType: 'singleChoice', options: ['Non-Weight Bearing (NWB)', 'Touchdown / Toe-Touch (TTWB)', 'Partial Weight Bearing (PWB 50%)', 'Full Weight Bearing (FWB as tolerated)'], required: true, group: 'Protocols' },
      { _id: 'q_fr1_3', questionText: 'Wound Healing, Scar Mobility & Surgical Staples/Sutures Status', questionType: 'text', required: true, group: 'Inspection' },
      { _id: 'q_fr1_4', questionText: 'Adjacent Joint Mobility & Circulation Drills (Ankle Pumps / Hand Grasp)', questionType: 'text', group: 'Objective' },
      { _id: 'q_fr1_5', questionText: 'Safe Mobilization & Safe Transfer Protocol', questionType: 'longText', required: true, group: 'Plan' },
    ],
  },

  // ── 24. POST-SURGICAL FRACTURE REGULAR VISIT ────────────
  {
    _id: 'form_fracture_regular_24',
    title: 'Post-Trauma Fracture — Regular Follow-up Visit',
    treatmentType: 'Post-Surgical Trauma',
    visitType: 'Regular Visit',
    questions: [
      { _id: 'q_fr2_1', questionText: 'Weight-Bearing Tolerance & Limb Edema Check', questionType: 'text', required: true, group: 'Subjective' },
      { _id: 'q_fr2_2', questionText: 'Range of Motion at Injured & Adjacent Joints', questionType: 'text', required: true, group: 'ROM' },
      { _id: 'q_fr2_3', questionText: 'Gait Training & Strengthening Progressions Delivered', questionType: 'longText', required: true, group: 'Plan' },
    ],
  },

  // ── 25. HIP REHABILITATION & ARTHROPLASTY (First Visit) ──
  {
    _id: 'form_hip_first_25',
    title: 'Hip Joint, Femoral Neck & Post-THR — Initial Assessment',
    treatmentType: 'Hip Rehabilitation',
    visitType: 'First Visit',
    questions: [
      { _id: 'q_hp1_1', questionText: 'Hip Condition (Post-Total Hip Replacement / Avascular Necrosis / Labral Tear)', questionType: 'text', required: true, group: 'History' },
      { _id: 'q_hp1_2', questionText: 'Hip Surgical Precautions Verified with Patient (No Flexion >90°, No Adduction, No Internal Rot)', questionType: 'singleChoice', options: ['Verified & Educated', 'Not Applicable'], required: true, group: 'Safety Precautions' },
      { _id: 'q_hp1_3', questionText: 'Trendelenburg Sign & Gluteus Medius Strength', questionType: 'singleChoice', options: ['Positive (Pelvic Drop)', 'Compensated', 'Negative (Stable Pelvis)'], required: true, group: 'Objective' },
      { _id: 'q_hp1_4', questionText: 'Hip Active ROM within Safe Arc (Degrees)', questionType: 'text', group: 'ROM' },
      { _id: 'q_hp1_5', questionText: 'Gait Stabilization & Bed Transfer Training Plan', questionType: 'longText', required: true, group: 'Plan' },
    ],
  },

  // ── 26. HIP REHABILITATION REGULAR VISIT ────────────────
  {
    _id: 'form_hip_regular_26',
    title: 'Hip Joint & Post-THR — Regular Follow-up Visit',
    treatmentType: 'Hip Rehabilitation',
    visitType: 'Regular Visit',
    questions: [
      { _id: 'q_hp2_1', questionText: 'Sitting, Walking Distance & Stair Climbing Progress', questionType: 'text', required: true, group: 'Subjective' },
      { _id: 'q_hp2_2', questionText: 'Gluteus Medius & Maximum Strength (MMT Grade)', questionType: 'singleChoice', options: ['Grade 3', 'Grade 4', 'Grade 5'], group: 'Strength' },
      { _id: 'q_hp2_3', questionText: 'Therapy Delivered & Safe Activity Guidelines', questionType: 'longText', required: true, group: 'Plan' },
    ],
  },

  // ── 27. ANKLE & FOOT REHABILITATION (First Visit) ───────
  {
    _id: 'form_ankle_first_27',
    title: 'Ankle Sprain, Achilles Tendon & Plantar Fasciitis — Initial Assessment',
    treatmentType: 'Ankle & Foot',
    visitType: 'First Visit',
    questions: [
      { _id: 'q_ak1_1', questionText: 'Ankle/Foot Pathology & Injury Mechanism (Inversion / Chronic Plantar Heel Pain)', questionType: 'text', required: true, group: 'History' },
      { _id: 'q_ak1_2', questionText: 'Ottawa Ankle Rules (Malleolar / 5th Metatarsal / Navicular Bone Tenderness)', questionType: 'singleChoice', options: ['Negative for Fracture', 'Positive - Requires X-Ray Referral'], required: true, group: 'Safety' },
      { _id: 'q_ak1_3', questionText: 'Weight-Bearing Lunge Test / Dorsiflexion Range (cm from wall or degrees)', questionType: 'text', group: 'ROM' },
      { _id: 'q_ak1_4', questionText: 'Single Leg Heel Raise Repetitions (Calf Capacity)', questionType: 'number', suffix: 'reps', group: 'Strength' },
      { _id: 'q_ak1_5', questionText: 'Manual Mobilization, Eccentric Loading & Taping Plan', questionType: 'longText', required: true, group: 'Plan' },
    ],
  },

  // ── 28. ANKLE & FOOT REGULAR VISIT ──────────────────────
  {
    _id: 'form_ankle_regular_28',
    title: 'Ankle & Foot — Regular Follow-up Visit',
    treatmentType: 'Ankle & Foot',
    visitType: 'Regular Visit',
    questions: [
      { _id: 'q_ak2_1', questionText: 'First-Step Morning Heel Pain & Walking Distance Update', questionType: 'text', required: true, group: 'Subjective' },
      { _id: 'q_ak2_2', questionText: 'Dynamic Balance on Balance Pad / Wobble Board', questionType: 'singleChoice', options: ['Good (>30s stable)', 'Moderate', 'Poor'], group: 'Proprioception' },
      { _id: 'q_ak2_3', questionText: 'Therapeutic Exercises & Footwear Modifications Delivered', questionType: 'longText', required: true, group: 'Plan' },
    ],
  },

  // ── 29. WOMEN\'S HEALTH & PRENATAL (First Visit) ─────────
  {
    _id: 'form_womens_first_29',
    title: 'Women\'s Health, Antenatal & Pelvic Floor — Initial Assessment',
    treatmentType: 'Women\'s Health',
    visitType: 'First Visit',
    questions: [
      { _id: 'q_wh1_1', questionText: 'Obstetric / Gynecological Stage (Antenatal Trimester / Postpartum Weeks)', questionType: 'text', required: true, group: 'History' },
      { _id: 'q_wh1_2', questionText: 'Pelvic Girdle Pain (PGP) / Sacroiliac Joint Dysfunction Score', questionType: 'scale', scaleMin: 0, scaleMax: 10, group: 'Pain' },
      { _id: 'q_wh1_3', questionText: 'Diastasis Recti Abdominis (DRA) Inter-Recti Distance (Finger-breadths)', questionType: 'singleChoice', options: ['<2 Fingers (Normal)', '2-3 Fingers (Moderate)', '>3 Fingers (Significant Separation)'], group: 'Abdominal Wall' },
      { _id: 'q_wh1_4', questionText: 'Safe Antenatal / Postnatal Pelvic Floor & Postural Program', questionType: 'longText', required: true, group: 'Plan' },
    ],
  },

  // ── 30. WOMEN\'S HEALTH REGULAR VISIT ────────────────────
  {
    _id: 'form_womens_regular_30',
    title: 'Women\'s Health & Postnatal — Regular Follow-up Visit',
    treatmentType: 'Women\'s Health',
    visitType: 'Regular Visit',
    questions: [
      { _id: 'q_wh2_1', questionText: 'Core Activation & Pelvic Stability Update', questionType: 'text', required: true, group: 'Subjective' },
      { _id: 'q_wh2_2', questionText: 'DRA Closure Progress & Transverse Abdominis Engagement', questionType: 'text', group: 'Objective' },
      { _id: 'q_wh2_3', questionText: 'Therapeutic Exercises & Safe Functional Movement Prescribed', questionType: 'longText', required: true, group: 'Plan' },
    ],
  },

  // ── 31. SPINAL CORD INJURY (SCI) FUNCTIONAL ASSESSMENT ──
  {
    _id: 'form_sci_first_31',
    title: 'Spinal Cord Injury (SCI) & Paraplegia — Functional Evaluation',
    treatmentType: 'Spinal Cord Injury',
    visitType: 'First Visit',
    questions: [
      { _id: 'q_sci1_1', questionText: 'ASIA Impairment Scale (AIS A - E) & Neurological Level', questionType: 'text', placeholder: 'e.g. T10 AIS A Complete', required: true, group: 'Classification' },
      { _id: 'q_sci1_2', questionText: 'Autonomic Dysreflexia Screen & Blood Pressure Precautions', questionType: 'singleChoice', options: ['Screened & Negative', 'Risk Present - Monitored'], required: true, group: 'Safety' },
      { _id: 'q_sci1_3', questionText: 'Pressure Ulcer / Skin Integrity Inspection', questionType: 'singleChoice', options: ['Intact Skin', 'Stage 1 Redness', 'Stage 2+ Wound Present'], required: true, group: 'Skin Safety' },
      { _id: 'q_sci1_4', questionText: 'Wheelchair Transfer & Sitting Balance Independence', questionType: 'longText', required: true, group: 'Mobility' },
      { _id: 'q_sci1_5', questionText: 'Tilt Table / Standing Frame & Spasticity Management Plan', questionType: 'longText', required: true, group: 'Plan' },
    ],
  },

  // ── 32. SPINAL CORD INJURY REGULAR VISIT ────────────────
  {
    _id: 'form_sci_regular_32',
    title: 'Spinal Cord Injury — Regular Functional Visit',
    treatmentType: 'Spinal Cord Injury',
    visitType: 'Regular Visit',
    questions: [
      { _id: 'q_sci2_1', questionText: 'Passive ROM Maintenance & Spasticity Modulations', questionType: 'text', required: true, group: 'Subjective' },
      { _id: 'q_sci2_2', questionText: 'Independent Bed-to-Chair Transfer Progress', questionType: 'singleChoice', options: ['Fully Independent with Sliding Board', 'Minimal Assist', 'Moderate Assist'], group: 'Functional' },
      { _id: 'q_sci2_3', questionText: 'Upper Limb Strengthening & Conditioning Delivered', questionType: 'longText', required: true, group: 'Plan' },
    ],
  },

  // ── 33. DRY NEEDLING & MYOFASCIAL TRIGGER POINTS ─────────
  {
    _id: 'form_dry_needling_33',
    title: 'Dry Needling & Myofascial Trigger Point Protocol',
    treatmentType: 'Manual & Modalities',
    visitType: 'Regular Visit',
    questions: [
      { _id: 'q_dn1_1', questionText: 'Target Muscles Treated with Dry Needling (e.g. Upper Trap, Piriformis, Infraspinatus)', questionType: 'text', required: true, group: 'Procedure' },
      { _id: 'q_dn1_2', questionText: 'Needle Gauge & Length Utilized (mm)', questionType: 'text', placeholder: 'e.g. 0.25 x 40mm', required: true, group: 'Procedure' },
      { _id: 'q_dn1_3', questionText: 'Local Twitch Response (LTR) Elicited', questionType: 'singleChoice', options: ['Yes - Strong LTR', 'Yes - Moderate LTR', 'No Twitch'], required: true, group: 'Response' },
      { _id: 'q_dn1_4', questionText: 'Post-Needling Pain Relief & Active ROM Delta', questionType: 'text', required: true, group: 'Post-Treatment' },
    ],
  },

  // ── 34. TELEHEALTH REMOTE CLINICAL CONSULTATION ─────────
  {
    _id: 'form_telehealth_34',
    title: 'Telehealth & Remote Virtual Physiotherapy Consultation',
    treatmentType: 'Telehealth',
    visitType: 'First Visit',
    questions: [
      { _id: 'q_th1_1', questionText: 'Video Consultation Quality & Patient Setting', questionType: 'singleChoice', options: ['HD Video & Audio Clear', 'Audio Only / Poor Bandwidth'], required: true, group: 'Technical' },
      { _id: 'q_th1_2', questionText: 'Subjective Pain & Symptom Description over Call', questionType: 'longText', required: true, group: 'Subjective' },
      { _id: 'q_th1_3', questionText: 'VAS Pain Score (0-10)', questionType: 'scale', scaleMin: 0, scaleMax: 10, required: true, group: 'Pain' },
      { _id: 'q_th1_4', questionText: 'Virtual Visual Assessment of Movement & Posture', questionType: 'longText', required: true, group: 'Observation' },
      { _id: 'q_th1_5', questionText: 'Prescribed Digital Home Exercise Video Program', questionType: 'longText', required: true, group: 'Plan' },
    ],
  },
];
