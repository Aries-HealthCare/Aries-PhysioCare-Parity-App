import type { Service, Speciality, Therapist, Location, Faq, Condition, GeoPath, SymptomDetail, TherapyDetail } from './types';
import { PlaceHolderImages } from './placeholder-images';
import { HeartPulse, Accessibility, Stethoscope, Users, CookingPot, BrainCircuit, Mic2 } from 'lucide-react';
import { IndianStates } from './locations';

const findImage = (id: string, name?: string) => {
  const img = PlaceHolderImages.find(p => p.id === id);
  if (img) {
    return { imageUrl: img.imageUrl, imageHint: img.imageHint };
  }

  // Comprehensive Medical Category Image Resolver with UHD Curated Photography
  const term = (name || id).toLowerCase();

  // Spine, Back & Neck
  if (term.includes('back') || term.includes('spine') || term.includes('lumbar') || term.includes('scolio') || term.includes('spondy') || term.includes('disc') || term.includes('sciatica') || term.includes('stenosis') || term.includes('sacral') || term.includes('retrolisthesis') || term.includes('fusion') || term.includes('discectomy') || term.includes('laminectomy')) {
    return { imageUrl: 'https://images.unsplash.com/photo-1519823551278-64ac92734fb1?auto=format&fit=crop&q=85&w=1600', imageHint: 'lumbar spine and back pain therapy' };
  }
  if (term.includes('neck') || term.includes('cervic') || term.includes('whiplash') || term.includes('torticollis') || term.includes('headache')) {
    return { imageUrl: 'https://images.unsplash.com/photo-1584820927500-47b2d5edb151?auto=format&fit=crop&q=85&w=1600', imageHint: 'cervical neck pain and mobilization' };
  }

  // Knee & Lower Extremity
  if (term.includes('knee') || term.includes('patell') || term.includes('acl') || term.includes('mcl') || term.includes('pcl') || term.includes('lcl') || term.includes('menisc') || term.includes('tkr') || term.includes('genu') || term.includes('baker') || term.includes('osgood')) {
    return { imageUrl: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&q=85&w=1600', imageHint: 'knee joint rehabilitation and assessment' };
  }
  if (term.includes('ankle') || term.includes('foot') || term.includes('plantar') || term.includes('achilles') || term.includes('heel') || term.includes('tarsal') || term.includes('ctev') || term.includes('clubfoot') || term.includes('metatarsalgia') || term.includes('bunion') || term.includes('cuboid') || term.includes('hammer toe') || term.includes('gastrocnemius')) {
    return { imageUrl: 'https://images.unsplash.com/photo-1581594693702-fbdc51b2763b?auto=format&fit=crop&q=85&w=1600', imageHint: 'ankle and foot orthopedic therapy' };
  }
  if (term.includes('hip') || term.includes('thr') || term.includes('trochanter') || term.includes('labral') || term.includes('pelvic') || term.includes('coccydynia') || term.includes('piriformis')) {
    return { imageUrl: 'https://images.unsplash.com/photo-1584515933487-779824d29309?auto=format&fit=crop&q=85&w=1600', imageHint: 'hip joint and pelvic physical therapy' };
  }

  // Shoulder & Upper Extremity
  if (term.includes('shoulder') || term.includes('cuff') || term.includes('frozen') || term.includes('impingement') || term.includes('dislocation') || term.includes('sprengel') || term.includes('hill-sachs') || term.includes('supraspinatus')) {
    return { imageUrl: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&q=85&w=1600', imageHint: 'shoulder mobilization and rotator cuff rehabilitation' };
  }
  if (term.includes('elbow') || term.includes('tennis') || term.includes('golfer') || term.includes('cubital') || term.includes('biceps')) {
    return { imageUrl: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&q=85&w=1600', imageHint: 'elbow tendon and joint therapy' };
  }
  if (term.includes('wrist') || term.includes('hand') || term.includes('carpal') || term.includes('quervain') || term.includes('trigger finger') || term.includes('ganglion') || term.includes('mallet') || term.includes('boutonniere') || term.includes('swan neck')) {
    return { imageUrl: 'https://images.unsplash.com/photo-1519823551278-64ac92734fb1?auto=format&fit=crop&q=85&w=1600', imageHint: 'hand dexterity and wrist physical rehabilitation' };
  }

  // Neurological Rehabilitation
  if (term.includes('neuro') || term.includes('stroke') || term.includes('palsy') || term.includes('paralysis') || term.includes('hemiplegia') || term.includes('quadriplegia') || term.includes('parkinson') || term.includes('sclerosis') || term.includes('mnd') || term.includes('guillain') || term.includes('myasthenia') || term.includes('dementia') || term.includes('nerve') || term.includes('myelopathy') || term.includes('ataxia')) {
    return { imageUrl: 'https://images.unsplash.com/photo-1559757175-5700dde675bc?auto=format&fit=crop&q=85&w=1600', imageHint: 'neurological neuro-motor re-education' };
  }

  // Pediatric Rehabilitation
  if (term.includes('pediatric') || term.includes('child') || term.includes('infant') || term.includes('kid') || term.includes('autism') || term.includes('down syndrome') || term.includes('cerebral palsy') || term.includes('spina bifida') || term.includes('dyslexia')) {
    return { imageUrl: 'https://images.unsplash.com/photo-1519238263530-990ffce6e4b8?auto=format&fit=crop&q=85&w=1600', imageHint: 'pediatric physiotherapy and developmental therapy' };
  }

  // Geriatric & Senior Care
  if (term.includes('geriatric') || term.includes('elderly') || term.includes('senior') || term.includes('age') || term.includes('fall') || term.includes('osteoporosis') || term.includes('frail')) {
    return { imageUrl: 'https://images.unsplash.com/photo-1576765608535-5f04c18459e4?auto=format&fit=crop&q=85&w=1600', imageHint: 'geriatric mobility and senior independence' };
  }

  // Sports & Musculoskeletal Conditioning
  if (term.includes('sport') || term.includes('athle') || term.includes('strain') || term.includes('sprain') || term.includes('tendon') || term.includes('runner') || term.includes('hamstring') || term.includes('quadriceps') || term.includes('ligament')) {
    return { imageUrl: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&q=85&w=1600', imageHint: 'sports physical therapy and active conditioning' };
  }

  // Post-Surgical & Wound Care
  if (term.includes('surgery') || term.includes('post-op') || term.includes('fracture') || term.includes('replacement') || term.includes('wound') || term.includes('burn')) {
    return { imageUrl: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&q=85&w=1600', imageHint: 'post-surgical orthopedic rehabilitation' };
  }

  // Cardiopulmonary & Respiratory
  if (term.includes('cardio') || term.includes('pulmonary') || term.includes('chest') || term.includes('asthma') || term.includes('breath') || term.includes('lung') || term.includes('heart')) {
    return { imageUrl: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&q=85&w=1600', imageHint: 'cardiopulmonary chest physiotherapy' };
  }

  // Posture, Ergonomics & Lifestyle
  if (term.includes('ergo') || term.includes('postur') || term.includes('work') || term.includes('desk') || term.includes('fatigue')) {
    return { imageUrl: 'https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?auto=format&fit=crop&q=85&w=1600', imageHint: 'workplace ergonomic posture correction' };
  }

  // Default Clinical Excellence
  return { imageUrl: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&q=85&w=1600', imageHint: 'hospital-grade clinical healthcare' };
};


function capitalize(str: string) {
  if (!str) return '';
  return str.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
}

export const therapists: Therapist[] = [
  {
    id: 't1',
    slug: 'dr-kajal-vora',
    name: 'Dr. Kajal Vora',
    qualification: 'MPT (Neurology), BPT',
    experience: '12 Years',
    imageUrl: '/images/aries-emblem.png',
    imageHint: 'certified physiotherapist'
  },
  {
    id: 't2',
    slug: 'dr-twinkle-patel',
    name: 'Dr. Twinkle Patel',
    qualification: 'BPT, MIAP',
    experience: '10 Years',
    imageUrl: '/images/aries-emblem.png',
    imageHint: 'certified physiotherapist'
  },
  {
    id: 't3',
    slug: 'dr-chloe-davis',
    name: 'Dr. Chloe Davis',
    qualification: 'MPT (Orthopedics)',
    experience: '8 Years',
    imageUrl: '/images/aries-emblem.png',
    imageHint: 'certified physiotherapist'
  },
  {
    id: 't4',
    slug: 'dr-sam-evans',
    name: 'Dr. Sam Evans',
    qualification: 'MPT (Sports)',
    experience: '15 Years',
    imageUrl: '/images/aries-emblem.png',
    imageHint: 'certified physiotherapist'
  }
];

export const specialities: Speciality[] = [
  { id: '1', name: 'Orthopedic Physiotherapy', description: 'Rehabilitation for bone, joint, and muscle injuries with evidence-based protocols.' },
  { id: '2', name: 'Neurological Physiotherapy', description: 'Specialized care for stroke, Parkinson’s, and spinal injuries to restore motor control.' },
  { id: '3', name: 'Pediatric Physiotherapy', description: 'Helping children achieve physical milestones and mobility through playful clinical intervention.' },
  { id: '4', name: 'Geriatric Physiotherapy', description: 'Focused care for elderly patients to maintain independence and prevent fall-related injuries.' },
  { id: '5', name: 'Sports Physiotherapy', description: 'Rapid recovery and performance optimization for athletes and active individuals.' },
  { id: '6', name: 'Post-Surgery Rehab', description: 'Structured, phased recovery programs following surgical procedures for optimal outcomes.' },
  { id: '7', name: 'Women\'s Health', description: 'Specialized clinical care for pre/post-natal recovery, pelvic floor health, and wellness.' },
  { id: '8', name: 'Ergonomics', description: 'Workplace assessments and postural training to prevent repetitive strain and lifestyle discomfort.' },
  { id: '9', name: 'Cardio-Pulmonary', description: 'Rehabilitation for heart and lung conditions to improve endurance and respiratory function.' },
];

export const locations: Location[] = [
  {
    id: 'loc-1',
    city: 'Mumbai',
    address: 'Borivali West / All Mumbai Hubs, Maharashtra',
    phone: '+91 9136447006',
    timings: '8:00 AM - 9:30 PM',
    mapImageUrl: 'https://images.unsplash.com/photo-1570168007204-dfb528c6958f?auto=format&fit=crop&q=85&w=1200',
    mapImageHint: 'mumbai healthcare hub'
  },
  {
    id: 'loc-2',
    city: 'Pune',
    address: 'Koregaon Park / Baner Hub, Maharashtra',
    phone: '+91 9136447006',
    timings: '8:00 AM - 9:30 PM',
    mapImageUrl: 'https://images.unsplash.com/photo-1595658658481-d53d3f999875?auto=format&fit=crop&q=85&w=1200',
    mapImageHint: 'pune healthcare hub'
  },
  {
    id: 'loc-3',
    city: 'Bengaluru',
    address: 'Indiranagar / Whitefield Hub, Karnataka',
    phone: '+91 9136447006',
    timings: '8:00 AM - 9:30 PM',
    mapImageUrl: 'https://images.unsplash.com/photo-1596176530529-78163a4f7af2?auto=format&fit=crop&q=85&w=1200',
    mapImageHint: 'bengaluru healthcare hub'
  },
  {
    id: 'loc-4',
    city: 'Chennai',
    address: 'Anna Nagar / Adyar Hub, Tamil Nadu',
    phone: '+91 9136447006',
    timings: '8:00 AM - 9:30 PM',
    mapImageUrl: 'https://images.unsplash.com/photo-1616843413587-9e3a37f7bbd8?auto=format&fit=crop&q=85&w=1200',
    mapImageHint: 'chennai healthcare hub'
  },
  {
    id: 'loc-5',
    city: 'Hyderabad',
    address: 'Jubilee Hills / HITEC City Hub, Telangana',
    phone: '+91 9136447006',
    timings: '8:00 AM - 9:30 PM',
    mapImageUrl: 'https://images.unsplash.com/photo-1605469237567-a39930679526?auto=format&fit=crop&q=85&w=1200',
    mapImageHint: 'hyderabad healthcare hub'
  },
  {
    id: 'loc-6',
    city: 'Delhi',
    address: 'South Delhi / Gurugram Hub, Delhi NCR',
    phone: '+91 9136447006',
    timings: '8:00 AM - 9:30 PM',
    mapImageUrl: 'https://images.unsplash.com/photo-1587474260584-136574528ed5?auto=format&fit=crop&q=85&w=1200',
    mapImageHint: 'delhi ncr healthcare hub'
  },
  {
    id: 'loc-7',
    city: 'Kolkata',
    address: 'Salt Lake / Alipore Hub, West Bengal',
    phone: '+91 9136447006',
    timings: '8:00 AM - 9:30 PM',
    mapImageUrl: 'https://images.unsplash.com/photo-1558431382-27e39cb14bc8?auto=format&fit=crop&q=85&w=1200',
    mapImageHint: 'kolkata healthcare hub'
  },
];

const conditionList = [
  "Lumbar Spondylosis", "Pes Anserine Bursitis", "Quadriceps Muscle Strain", "Herniated Disk Or Slipped Disc", "Clubfoot Or Congenital Talipes Equinovarus Or Ctev", "Ankle Bone Spur", "Total Hip Replacement (thr)", "Swan Neck Deformity", "Erb’s Palsy", "Sprengel's Shoulder", "Meralgia Paresthetica", "Tendinitis", "Sciatica", "Guillain-barré Syndrome", "Fecal Incontinence", "Radial Nerve Injury", "Sacralization", "Shoulder Impingement", "Disc Bulge", "Dyslexia", "Genu Valgus", "Genu Varum", "Cauda Equina Syndrome", "Wartenberg’s Syndrome", "Shoulder Arthropathy", "Cuboid Syndrome", "Median Nerve Injury", "Hemangioma", "Raynaud’s Disease", "Urinary Incontinence", "Pelvic Organ Prolapse", "Motor Neuron Disease (mnd)", "Complex Regional Pain Syndrome (crps)", "Cervicogenic Headache", "Infantile Hemiparesis", "Galeazzi Fracture", "Lymphedema", "Wrist Drop", "Trigger Finger", "Retrolisthesis", "Klumpke's Palsy", "Supraspinatus Tendinitis", "Lumbarization", "Foot Drop", "Smith Fracture", "Gastrocnemius Rupture", "Osgood-schlatter Disease", "Hill-sachs Lesion", "Hemiplegia", "Myositis Ossification (mo)", "Huntington's Disease (hd)", "Systemic Lupus Erythematosus (sle)", "Reiter's Syndrome", "Peripheral Artery Disease (pad)", "Lipedema", "Cervical Spondylosis", "Frozen Shoulder", "Vertigo", "Achilles Tendon Rupture", "Carpal Tunnel Syndrome (cts)", "Arthritis", "Chondromalacia Patella", "Knee Bursitis", "Anterior Cruciate Ligament Tear(acl)", "Ankle Sprain", "Cerebral Palsy", "Parkinson's Disease", "Tennis Elbow", "Baastrup Syndrome", "Osteoarthritis", "Cervical Myelopathy", "Osteoporosis", "Whiplash", "Rotator Cuff Injury", "Scoliosis", "Bell's Palsy Or Facial Palsy", "Dementia", "Plantar Fasciitis", "Concussion", "Spinal Stenosis", "Rheumatoid Arthritis", "Tailbone Pain/coccydynia", "Piriformis Syndrome", "Myasthenia Gravis (mg)", "Diabetic Neuropathy", "Degenerative Disc Disease", "Distal Muscular Dystrophy", "Asthma", "Temporomandibular Joint (tmj)", "Stroke Or Cerebrovascular Accident (cva)", "Hamstring Strain", "Fibromyalgia Syndrome", "Total Knee Replacement(tkr)", "Meniscal Injury", "Spina Bifida", "Down Syndrome", "Torticollis", "Shoulder Dislocation", "Shoulder And Arm Fractures", "Elbow Fractures", "Forearm Fractures", "Wrist Fracture", "Hand Fractures", "Mallet Finger", "Boutonniere Deformity", "Ganglion Cyst", "Burns", "De Quervain's Tenosynovitis", "Cubital Tunnel Syndrome", "Biceps Tendonitis", "Radial Tunnel Syndrome", "Hip Fracture", "Trochanteric Bursitis", "Hip Labral Tear", "Hip Impingement", "Hip Osteoarthritis", "Patellar Fracture", "Patella Dislocation", "Medial Collateral Ligament (mcl) Injury", "Lateral Collateral Ligament(lcl) Injury", "Posterior Cruciate Ligament(pcl) Injury", "Popliteal (baker's) Cyst", "Varicose Veins", "Patellar Tendonitis", "Deep Venous Thrombosis", "Knee Fracture", "Flat Foot", "Ankle Fracture", "Ankle Syndesmosis Ligament Injury", "Ankle Dislocation", "Tarsal Tunnel Syndrome", "Ankle Instability", "Posterior Tibial Tendon Dysfunction (pttd)", "Metatarsalgia", "Bunion Or Hallux Valgus", "Morton's Neuroma", "Diabetic Foot", "Hammer Toe", "Knee Osteoarthritis", "Golfer's Elbow", "Spondylolisthesis", "Ankylosing Spondylitis (as)", "Discectomy", "Laminectomy", "Autism", "Spinal Fusion", "Spinal Cord Injury", "Leprosy", "Migraine", "Multiple Sclerosis", "Quadriplegia", "Ulnar Nerve Injury", "Transverse Myelitis (tm)"
];

const symptomList = [
  "Muscle Stiffness", "Muscle Spasm", "Crepitus - Cracking Joints", "Numbness And Tingling", "Neck Pain", "Foot Pain", "Tremors", "Back Pain", "Myalgia (muscle Pain)", "Knee Pain", "Joint Pain", "Shoulder Pain", "Loss Of Balance", "Inflammation", "Headache", "Shortness Of Breath", "Sprains And Strains"
];

export const therapyList = [
  "Interferential Therapy (ift)", "Chiropractic Therapy", "Ultrasound Therapy", "Laser Therapy", "Cupping Therapy", "Wax Therapy", "Kinesio Taping / Taping Therapy", "Dry Needling Therapy", "Thermotherapy(heat Therapy)", "Transcutaneous Electrical Nerve Stimulation(tens) Therapy", "Lymphatic Drainage Massage", "Overhead Track Harness Therapy", "Traction Therapy", "Spinal Decompression / Traction Therapy", "Tecar / Cret Therapy", "Cryotherapy(cold Therapy)", "Dynamic Compression Therapy", "Shockwave Therapy", "Robotic Spinal Decompression Therapy", "Manual Therapy", "Myofascial Release (mfr)", "Soft Tissue Mobilization", "Pelvic Floor Physical Therapy", "Chest Physiotherapy", "Shortwave Diathermy (swd)"
];

export const toSlug = (name: string) => name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

export function getLocalizedFaqs(geo: GeoPath | null, serviceName: string = "physiotherapy"): Faq[] {
  const cityName = geo?.city?.name || 'Mumbai';
  const areaName = geo?.area?.name || geo?.city?.name || 'your local area';
  const stateName = geo?.state?.name || 'Maharashtra';

  const city = capitalize(cityName);
  const area = capitalize(areaName);
  const state = capitalize(stateName);
  const service = capitalize(serviceName);

  return [
    {
      id: 'lfaq-1',
      question: `What is home ${service.toLowerCase()}?`,
      answer: `Home ${service.toLowerCase()} is a professional clinical service where a certified specialist visits your home in ${area} to provide sessions. At Aries PhysioCare (a division of Aries HealthCare International Pvt Ltd), we deliver hospital-grade expertise, ensuring comfort, safety, and faster recovery without the need for travel.`
    },
    {
      id: 'lfaq-2',
      question: `How long does a typical session last?`,
      answer: `A standard session usually lasts between 45 to 60 minutes. This includes a review of your progress, manual therapy, supervised exercises, and if required, the application of portable therapeutic modalities like IFT or Laser.`
    },
    {
      id: 'lfaq-3',
      question: `Do I need to provide any equipment?`,
      answer: `No. Our therapists carry all necessary portable equipment required for your treatment, including specialized clinical machines and basic exercise tools. You only need to provide a comfortable space for the session to take place.`
    },
    {
      id: 'lfaq-4',
      question: `Are your therapists qualified and certified?`,
      answer: `Yes, absolutely. Every Aries specialist is a qualified professional with a BPT or MPT degree and is registered with the relevant clinical councils. They undergo additional rigorous internal training on our standardized clinical protocols.`
    },
    {
      id: 'lfaq-5',
      question: `Is home ${service.toLowerCase()} as effective as clinic-based treatment?`,
      answer: `In many cases, it is more effective. Treating you in your natural environment allows the therapist to understand your functional challenges better and design lifestyle-specific exercises. It also eliminates the stress and physical strain of commuting.`
    },
    {
      id: 'lfaq-6',
      question: `What should I wear during my session?`,
      answer: `We recommend wearing loose, comfortable clothing like a track suit or shorts that allow easy movement and access to the area being treated (e.g., knee or shoulder).`
    },
    {
      id: 'lfaq-7',
      question: `How many sessions will I need for recovery?`,
      answer: `This depends entirely on your initial clinical assessment. While some acute conditions show results in 3-5 sessions, chronic or post-surgical cases may require 10-15 sessions for full functional restoration.`
    },
    {
      id: 'lfaq-8',
      question: `Do you treat post-surgery cases?`,
      answer: `Yes, we specialize in post-operative rehabilitation for Total Knee Replacement (TKR), Total Hip Replacement (THR), ACL reconstruction, and spine surgeries. We follow phased clinical protocols to ensure safe and steady recovery.`
    },
    {
      id: 'lfaq-9',
      question: `What if I need to cancel or reschedule?`,
      answer: `We request a minimum of 12-24 hours notice for any cancellations or rescheduling to help us manage our experts' clinical schedules effectively across ${city}.`
    },
    {
      id: 'lfaq-10',
      question: `Do you provide a formal invoice for insurance?`,
      answer: `Yes, we provide digital invoices and clinical progress reports that you can submit to your insurance provider or employer for reimbursement where applicable.`
    },
    {
      id: 'lfaq-11',
      question: `Can I request a female therapist?`,
      answer: `Yes, we have a diverse team of specialists and you can request a female therapist based on your preference and availability in your locality of ${area}.`
    },
    {
      id: 'lfaq-12',
      question: `How do I pay for the sessions?`,
      answer: `We offer flexible payment options including online transfers, UPI, and cash. You can choose to pay per session or opt for our discounted recovery packages.`
    },
    {
      id: 'lfaq-13',
      question: `Is it safe for the therapist to visit during infectious periods?`,
      answer: `Aries PhysioCare follows strict clinical hygiene and safety protocols. Our therapists use sanitized equipment, wear necessary protective gear, and follow hand-hygiene standards to ensure your safety.`
    },
    {
      id: 'lfaq-14',
      question: `Can you help with elderly care and fall prevention?`,
      answer: `Yes, geriatric care is one of our core specialities. We focus on balance training, joint stability, and environmental modifications to prevent falls and maintain senior independence.`
    },
    {
      id: 'lfaq-15',
      question: `How can I track my recovery progress?`,
      answer: `We use digital clinical tracking. After every session, your functional improvements are logged, and you will receive periodic progress reports highlighting your gains in mobility, strength, and pain reduction.`
    }
  ];
}

export function getAreaSpecificContext(geo: GeoPath) {
  const cityName = geo?.city?.name || 'Mumbai';
  const areaName = geo?.area?.name || geo?.city?.name || 'Local Area';

  const contexts: Record<string, any> = {
    'hinjewadi': {
      lifestyle: 'As a major IT hub, Hinjewadi has a population largely consisting of young professionals who spend long hours at workstations.',
      painPoints: 'postural discomfort, stress-related strain, and repetitive movement fatigue',
      landmarks: ['Phase 1', 'Phase 2', 'Phase 3', 'EON IT Park']
    },
    'kothrud': {
      lifestyle: 'Kothrud is one of Pune\'s most established residential neighborhoods, with a significant population of senior citizens and families.',
      painPoints: 'age-related mobility challenges, wellness management, and post-hospital recovery',
      landmarks: ['Karve Road', 'Vanaz Corner', 'Ideal Colony']
    },
    'colaba': {
      lifestyle: 'Colaba is a historic district with a diverse population, including elderly long-term residents and active urban professionals.',
      painPoints: 'geriatric care needs, general musculoskeletal support, and wellness optimization',
      landmarks: ['Gateway of India', 'Colaba Causeway', 'Navy Nagar']
    },
    'default': {
      lifestyle: `The residents of ${areaName} are part of a vibrant urban community in ${cityName} that values health and proactive clinical recovery.`,
      painPoints: 'common health management issues, mobility support, and lifestyle-related clinical needs',
      landmarks: [`${areaName} market`, 'local parks', 'major residential complexes']
    }
  };

  return contexts[areaName.toLowerCase()] || contexts['default'];
}

export function getNearbyAreas(geo: GeoPath, serviceSlug: string = 'physiotherapy') {
  if (!geo.city) return [];
  const stateSlug = geo.state?.slug || 'maharashtra';
  const citySlug = geo.city.slug;

  return geo.city.areas
    .filter(a => a.slug !== geo.area?.slug)
    .slice(0, 4)
    .map(a => ({
      name: a.name,
      slug: a.slug,
      fullPath: `${stateSlug}/${citySlug}/${a.slug}`
    }));
}

const getConditionClinicalInfo = (name: string) => {
  const lowerName = name.toLowerCase();

  const dynamicFaqs = [
    { id: 'q1', question: `How long does recovery take for ${name}?`, answer: `The recovery timeline for ${name} depends on severity and adherence to the prescribed clinical protocol. Most patients notice significant improvement in mobility and pain reduction within the first 6-8 supervised sessions.` },
    { id: 'q2', question: `What specific treatments do you use for ${name} at home?`, answer: `Our clinical experts use a combination of advanced portable modalities, targeted manual therapy, and progressive strengthening exercises specifically tailored to address the biomechanical root causes of ${name}.` },
    { id: 'q3', question: `Is home clinical care effective for a condition like ${name}?`, answer: `Yes, treating ${name} at home is highly effective. Our clinicians formulate precise care plans using hospital-grade equipment, allowing you to undergo intensive rehabilitation without traveling.` }
  ];

  if (lowerName.includes('spondylosis') || lowerName.includes('disc') || lowerName.includes('spine') || lowerName.includes('sciatica') || lowerName.includes('back') || lowerName.includes('neck')) {
    return {
      description: `Specialized care for ${name} focuses on alleviating pressure and restoring structural alignment. This condition often leads to localized discomfort, stiffness, and radiating symptoms that can significantly impact daily life.`,
      symptoms: ['Radiating sensations', 'Morning stiffness', 'Functional weakness', 'Localised tension'],
      treatmentDetails: 'Our clinical protocol includes joint mobilization, postural correction exercises, and targeted stabilization to prevent recurrence and support recovery.',
      benefits: ['Reduced structural compression', 'Improved flexibility', 'Enhanced postural awareness', 'Long-term management'],
      whoShouldOpt: ['Professionals with postural issues', 'Patients with chronic discomfort', 'Individuals post-procedure', 'Elderly with age-related wear'],
      faqs: dynamicFaqs
    };
  }

  if (lowerName.includes('palsy') || lowerName.includes('stroke') || lowerName.includes('neuro') || lowerName.includes('nerve') || lowerName.includes('sclerosis') || lowerName.includes('paralysis') || lowerName.includes('dementia') || lowerName.includes('brain')) {
    return {
      description: `Neurological rehabilitation for ${name} aims to restore motor control through intensive, repetitive movement protocols. We focus on enhancing functional capacity to help you regain lost independence.`,
      symptoms: ['Loss of motor control', 'Balance and coordination issues', 'Muscle tone changes', 'Difficulty with gait and walking'],
      treatmentDetails: 'We employ Neuro-Muscular Re-education, specialized stretching, gait training, and functional task practice supported by advanced clinical tracking.',
      benefits: ['Improved functional independence', 'Increased muscle control', 'Enhanced balance and safety', 'Significant quality of life improvements'],
      whoShouldOpt: ['Post-acute survivors', 'Patients with progressive conditions', 'Individuals with nerve injuries', 'Geriatric patients with balance issues'],
      faqs: dynamicFaqs
    };
  }

  return {
    description: `Comprehensive expert-led care for ${name} involves a detailed clinical assessment of imbalances. We address the root cause of your health issue rather than just treating temporary symptoms.`,
    symptoms: ['Localized discomfort', 'Reduced range', 'Trigger points', 'Activity-limiting strain'],
    treatmentDetails: 'We use a combination of mobilization, myofascial release, therapeutic exercise, and advanced portable modalities for rapid relief at home.',
    benefits: ['Quick return to activity', 'Enhanced strength', 'Improved movement efficiency', 'Prevention of future recurring issues'],
    whoShouldOpt: ['Individuals with strain', 'Patients with repetitive stress', 'Patients with generalized clinical discomfort', 'Anyone seeking better physical performance'],
    faqs: dynamicFaqs
  };
};

const getSymptomImage = (name: string) => {
  const ln = name.toLowerCase();
  if (ln.includes('stiff') || ln.includes('spasm')) {
    return { url: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&q=85&w=1600', hint: 'muscle stiffness manual release' };
  }
  if (ln.includes('crepitus') || ln.includes('crack')) {
    return { url: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&q=85&w=1600', hint: 'joint crepitus examination' };
  }
  if (ln.includes('numb') || ln.includes('tingl') || ln.includes('tremor')) {
    return { url: 'https://images.unsplash.com/photo-1559757175-5700dde675bc?auto=format&fit=crop&q=85&w=1600', hint: 'neurological nerve conduction test' };
  }
  if (ln.includes('neck')) {
    return { url: 'https://images.unsplash.com/photo-1584820927500-47b2d5edb151?auto=format&fit=crop&q=85&w=1600', hint: 'cervical neck palpation' };
  }
  if (ln.includes('foot') || ln.includes('ankle')) {
    return { url: 'https://images.unsplash.com/photo-1581594693702-fbdc51b2763b?auto=format&fit=crop&q=85&w=1600', hint: 'foot biomechanics therapy' };
  }
  if (ln.includes('back')) {
    return { url: 'https://images.unsplash.com/photo-1519823551278-64ac92734fb1?auto=format&fit=crop&q=85&w=1600', hint: 'lumbar spine assessment' };
  }
  if (ln.includes('knee')) {
    return { url: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&q=85&w=1600', hint: 'knee pain clinical assessment' };
  }
  if (ln.includes('shoulder')) {
    return { url: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&q=85&w=1600', hint: 'shoulder mobility testing' };
  }
  if (ln.includes('balance')) {
    return { url: 'https://images.unsplash.com/photo-1576765608535-5f04c18459e4?auto=format&fit=crop&q=85&w=1600', hint: 'balance and stability training' };
  }
  if (ln.includes('inflam') || ln.includes('swelling')) {
    return { url: 'https://images.unsplash.com/photo-1584515933487-779824d29309?auto=format&fit=crop&q=85&w=1600', hint: 'inflammation management' };
  }
  if (ln.includes('headache')) {
    return { url: 'https://images.unsplash.com/photo-1584820927500-47b2d5edb151?auto=format&fit=crop&q=85&w=1600', hint: 'cervicogenic headache relief' };
  }
  if (ln.includes('breath') || ln.includes('shortness')) {
    return { url: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&q=85&w=1600', hint: 'chest physiotherapy' };
  }
  if (ln.includes('sprain') || ln.includes('strain')) {
    return { url: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&q=85&w=1600', hint: 'sports sprain rehabilitation' };
  }
  return { url: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&q=85&w=1600', hint: 'clinical assessment' };
};

const getSymptomClinicalInfo = (name: string): SymptomDetail => {
  const lowerName = name.toLowerCase();
  const dynamicFaqs = [
    { id: 'sq1', question: `How can home care help with ${name}?`, answer: `Clinical care addresses the underlying mechanical or physiological cause of ${name} through targeted exercises, manual therapy, and advanced modalities.` },
    { id: 'sq2', question: `Will I need a doctors referral for ${name} treatment?`, answer: `No, you can directly book a diagnostic assessment with our expert team for symptomatic relief from ${name} and a comprehensive root-cause analysis.` },
    { id: 'sq3', question: `Can this be treated entirely at home?`, answer: `Yes, we bring hospital-grade portable equipment directly to your home to ensure elite-level treatment for ${name} without compromising on quality.` }
  ];

  const symptomImg = getSymptomImage(name);
  const info: any = {
    name,
    slug: toSlug(name),
    faqs: dynamicFaqs,
    imageUrl: symptomImg.url,
    imageHint: symptomImg.hint
  };

  if (lowerName.includes('stiffness') || lowerName.includes('spasm')) {
    info.description = `${name} is a common clinical complaint involving perceived tightness and resistance to movement. At Aries PhysioCare, we specialize in high-precision tissue release to restore natural fluidity.`;
    info.longDescription = `Addressing ${name} involves restoring tissue elasticity and optimized blood flow. We focus on relaxing overactive neural pathways to restore smooth movement and structural harmony. Our clinical experts use a combination of manual skill and portable technology to deliver elite care directly at home.`;
    info.causes = ['Prolonged static posture', 'Inadequate recovery protocols', 'Underlying degenerative changes', 'Repetitive mechanical stress', 'Neural irritation'];
    info.riskFactors = ['Office workers', 'Geriatric age groups', 'Individuals with high mechanical stress'];
    info.whenToSeeDoctor = `Seek clinical assessment if ${name.toLowerCase()} is persistent for more than 48 hours, occurs after a traumatic incident, or significantly restricts your normal range of motion.`;
    info.diagnosis = 'Our diagnostic process includes precise tissue tone assessment, flexibility testing, and functional movement analysis to identify the biomechanical source.';
    info.treatments = ['Deep Tissue Mobilization', 'PNF Stretching', 'Advanced Portable Laser', 'Neuromuscular Re-education', 'Postural Correction Protocols'];
    info.benefits = ['Significant gains in flexibility', 'Rapid reduction in fatigue', 'Smoother joint kinematics', 'Improved overall posture'];
  } else if (lowerName.includes('pain')) {
    info.description = `${name} can be an indicator of underlying structural or mechanical stress. Our expert protocols aim to identify the exact pain source for sustainable relief.`;
    info.longDescription = `${name} is one of the most frequent reasons for seeking clinical help. It can range from a dull ache to sharp, limiting discomfort. Our structured approach ensures that we don't just mask the pain but address the compensatory patterns and structural imbalances causing it.`;
    info.causes = ['Mechanical misalignment', 'Soft tissue inflammation', 'Nerve compression', 'Age-related wear', 'Overuse injuries'];
    info.riskFactors = ['Sedentary lifestyles', 'Sports enthusiasts', 'Post-operative patients'];
    info.whenToSeeDoctor = `Clinical intervention is required if the ${name.toLowerCase()} is radiating, accompanied by numbness, or preventing you from performing basic daily tasks.`;
    info.diagnosis = 'Comprehensive evaluation involving joint mobility scans, muscle strength grading, and neural tension tests.';
    info.treatments = ['Manual Joint Mobilization', 'Core/Segmental Stabilization', 'Portable IFT/Ultrasound', 'Taping Therapy', 'Activity Modification Guidance'];
    info.benefits = ['Sustainable pain reduction', 'Restored functional mobility', 'Reduced reliance on analgesics', 'Enhanced movement confidence'];
  } else {
    info.description = `Managing ${name} requires a comprehensive clinical approach to understand its impact on your overall health and daily movement economy.`;
    info.longDescription = `Whether it's localized discomfort or balance issues, ${name} can significantly reduce quality of life. Our structured recovery protocols are designed to help you regain control, safety, and independence at home.`;
    info.causes = ['Mechanical stress', 'Structural trauma', 'Age-related changes', 'Metabolic factors', 'Lifestyle stress'];
    info.riskFactors = ['Sedentary lifestyle', 'History of unresolved injury', 'Compromised stability', 'Geriatric age group'];
    info.whenToSeeDoctor = `Seek clinical help if ${name.toLowerCase()} starts causing functional limitations, persistent discomfort, or safety concerns during movement.`;
    info.diagnosis = 'Comprehensive biomechanical screening, range-of-motion testing, and detailed history review.';
    info.treatments = ['Manual Mobilization', 'Portable Modalities', 'Corrective Exercises', 'Clinical Coordination Training', 'Task Modification'];
    info.benefits = ['Sustainable relief', 'Restored functional mobility', 'Better stability and safety', 'Enhanced quality of life'];
  }

  return info;
};

const getTherapyClinicalInfo = (name: string): TherapyDetail => {
  const lowerName = name.toLowerCase();

  const dynamicFaqs = [
    { id: 'tq1', question: `Is ${name} safe to receive at home?`, answer: `Yes, ${name} is completely non-invasive. Our certified specialists use high-end portable clinical equipment and follow strict safety protocols during every home session.` },
    { id: 'tq2', question: `How soon can I expect results from ${name}?`, answer: `Many patients experience significant relief after just 3-4 sessions of ${name}, especially when it is integrated into a comprehensive clinical protocol tailored to your specific needs.` },
    { id: 'tq3', question: `How does ${name} fit into my overall treatment?`, answer: `Depending on your clinical assessment, ${name} may be used as the primary modality or alongside manual therapy and therapeutic exercises to accelerate tissue healing and functional recovery.` }
  ];

  const getTherapyImage = (name: string) => {
    const ln = name.toLowerCase();
    if (ln.includes('cupping')) {
      return { url: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&q=85&w=1600', hint: 'cupping therapy and myofascial decompression' };
    }
    if (ln.includes('tens') || ln.includes('transcutaneous') || ln.includes('ift') || ln.includes('interferential')) {
      return { url: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&q=85&w=1600', hint: 'electrotherapy and TENS pain relief' };
    }
    if (ln.includes('needling')) {
      return { url: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&q=85&w=1600', hint: 'dry needling and trigger point therapy' };
    }
    if (ln.includes('massage') || ln.includes('mfr') || ln.includes('myofascial') || ln.includes('release') || ln.includes('tissue')) {
      return { url: 'https://images.unsplash.com/photo-1519823551278-64ac92734fb1?auto=format&fit=crop&q=85&w=1600', hint: 'manual deep tissue release therapy' };
    }
    if (ln.includes('taping') || ln.includes('kinesio')) {
      return { url: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&q=85&w=1600', hint: 'kinesio dynamic neuromuscular taping' };
    }
    if (ln.includes('chiropractic') || ln.includes('decompression') || ln.includes('traction') || ln.includes('robotic')) {
      return { url: 'https://images.unsplash.com/photo-1519823551278-64ac92734fb1?auto=format&fit=crop&q=85&w=1600', hint: 'spinal adjustment and decompression therapy' };
    }
    if (ln.includes('laser') || ln.includes('ultrasound') || ln.includes('shockwave') || ln.includes('tecar') || ln.includes('swd') || ln.includes('diathermy')) {
      return { url: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&q=85&w=1600', hint: 'advanced photobiomodulation and ultrasound modality' };
    }
    if (ln.includes('wax')) {
      return { url: 'https://images.unsplash.com/photo-1519823551278-64ac92734fb1?auto=format&fit=crop&q=85&w=1600', hint: 'paraffin wax therapy for arthritic joints' };
    }
    if (ln.includes('pelvic')) {
      return { url: 'https://images.unsplash.com/photo-1584515933487-779824d29309?auto=format&fit=crop&q=85&w=1600', hint: 'pelvic floor core strengthening therapy' };
    }
    if (ln.includes('chest') || ln.includes('pulmonary')) {
      return { url: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&q=85&w=1600', hint: 'chest physiotherapy and respiratory hygiene' };
    }
    if (ln.includes('cryo') || ln.includes('cold') || ln.includes('compression')) {
      return { url: 'https://images.unsplash.com/photo-1584515933487-779824d29309?auto=format&fit=crop&q=85&w=1600', hint: 'cryotherapy and cold compression recovery' };
    }
    if (ln.includes('harness') || ln.includes('gait')) {
      return { url: 'https://images.unsplash.com/photo-1559757175-5700dde675bc?auto=format&fit=crop&q=85&w=1600', hint: 'gait training and functional ambulation' };
    }
    if (ln.includes('manual') || ln.includes('mobilization')) {
      return { url: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&q=85&w=1600', hint: 'expert manual joint mobilization' };
    }

    return { url: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&q=85&w=1600', hint: 'evidence-based clinical physiotherapy' };
  };

  const therapyImg = getTherapyImage(name);
  const result: any = {
    name,
    slug: toSlug(name),
    faqs: dynamicFaqs,
    imageUrl: therapyImg.url,
    imageHint: therapyImg.hint
  };


  if (lowerName === "interferential therapy (ift)") {
    result.description = "Interferential Therapy (IFT) is an advanced electrotherapy modality that uses mid-frequency electric currents to relieve deep-seated muscular and joint pain.";
    result.howItWorks = "IFT delivers two distinct mid-frequency currents that intersect deep within your tissues. This 'interference' creates a low-frequency therapeutic beat that blocks pain signals (Gate Control Theory), increases local blood flow, and accelerates natural cellular healing without causing skin discomfort.";
    result.benefits = ["Deep-tissue pain relief", "Reduction of localized swelling and inflammation", "Accelerated cellular repair", "Muscle spasm relaxation"];
    result.conditionsTreated = ["Sciatica", "Osteoarthritis", "Frozen Shoulder", "Muscle Strains", "Chronic Back Pain"];
    result.techniques = ["Quadripolar Electrode Placement", "Pre-modulated Current Setting", "Targeted Neuromuscular Stimulation", "Pain-gating Frequency Adjustment"];
    result.whoShouldOpt = ["Patients with chronic joint pain", "Athletes with deep tissue strains", "Individuals suffering from nerve compression (like Sciatica)", "Post-operative orthopedic patients"];
    return result;
  }

  if (lowerName === "chiropractic therapy") {
    result.description = "Chiropractic Therapy at Aries focuses on the expert diagnosis, structural alignment, and mechanical correction of musculoskeletal disorders, primarily targeting the spinal column.";
    result.howItWorks = "Our certified experts carefully apply high-velocity, low-amplitude (HVLA) thrusts to specific joints. This targeted manual force restores restricted joint mobility, reduces nerve impingement, and improves the overall mechanical efficiency of your central nervous system.";
    result.benefits = ["Instant reduction in spinal tension", "Restored joint mobility and kinematics", "Improved postural alignment", "Decreased neural irritation and nerve pressure"];
    result.conditionsTreated = ["Cervical Spondylosis", "Herniated Disc", "Sciatic Nerve Pain", "Tension Headaches", "Pelvic Misalignment"];
    result.techniques = ["Manual Spinal Manipulation", "Activator Instrument Adjustment", "Flexion-Distraction Technique", "Targeted Segmental Mobilization"];
    result.whoShouldOpt = ["Individuals with chronic mechanical back pain", "Patients with tension or cervicogenic headaches", "Professionals with prolonged sedentary postures", "Athletes seeking improved biomechanical performance"];
    return result;
  }

  if (lowerName === "ultrasound therapy") {
    result.description = "Ultrasound Therapy is a non-invasive, deep-heating modality used to treat musculoskeletal injuries, promoting cellular healing and pain relief.";
    result.howItWorks = "A specialized clinical transducer directs high-frequency sound waves deep into the soft tissues. These acoustic waves generate micro-vibrations, producing deep thermal heat and mechanical stress that breaks down scar tissue, increases blood circulation, and triggers accelerated cellular metabolism.";
    result.benefits = ["Breakdown of tough scar tissue", "Deep tissue heating to increase tissue elasticity", "Reduction of chronic inflammation", "Accelerated ligament and tendon healing"];
    result.conditionsTreated = ["Plantar Fasciitis", "Ligament Sprains", "Bursitis", "Tendinitis", "Tennis Elbow"];
    result.techniques = ["Continuous Thermal Application", "Pulsed Non-thermal Cellular Stimulation", "Phonophoresis (Medicine Delivery)", "Moving Transducer Technique"];
    result.whoShouldOpt = ["Patients with chronic tendon conditions", "Individuals with thick scar tissue from old injuries", "Athletes recovering from sprains", "Patients with limited joint flexibility"];
    return result;
  }

  if (lowerName === "laser therapy") {
    result.description = "Advanced Low-Level Laser Therapy (LLLT) utilizes targeted photonic energy to stimulate cellular regeneration, drastically accelerating the body's natural healing phase.";
    result.howItWorks = "Class IV therapeutic laser waves penetrate deeply into the epidermis and dermis without generating excessive heat. The photons are absorbed by the mitochondria of injured cells, increasing ATP (adenosine triphosphate) synthesis. This surge in cellular energy rapidly reduces oxidative stress, inflammation, and pain.";
    result.benefits = ["Rapid reduction of acute localized swelling", "Accelerated cellular repair and nerve regeneration", "Non-pharmacological pain relief", "Faster wound and tissue healing"];
    result.conditionsTreated = ["Sports Injuries", "Carpal Tunnel Syndrome", "Rheumatoid Arthritis", "Soft Tissue Tears", "Diabetic Neuropathy"];
    result.techniques = ["Targeted Trigger Point Lasing", "Sweeping Optical Delivery for larger muscles", "Deep Tissue Photobiomodulation", "Pulsed Frequency Therapy"];
    result.whoShouldOpt = ["Patients with acute sports injuries", "Individuals with inflammatory joint conditions", "Sufferers of chronic nerve pain", "Post-surgical patients seeking rapid tissue healing"];
    return result;
  }

  if (lowerName === "cupping therapy") {
    result.description = "Cupping Therapy is a specialized myofascial decompression technique that uses negative pressure to lift deep connective tissues, promoting circulation and profound muscular relaxation.";
    result.howItWorks = "Clinical silicone or glass cups are applied to the skin to create a localized vacuum. This negative pressure decompresses the underlying fascia, drawing stagnant, deoxygenated blood and toxins to the surface while encouraging fresh arterial blood flow to the targeted muscular knots.";
    result.benefits = ["Instant relief from fascial tightness", "Detoxification of stagnant muscular tissue", "Deep muscular relaxation", "Enhanced lymphatic drainage"];
    result.conditionsTreated = ["Chronic Muscle Tension", "Fibromyalgia", "Myofascial Pain Syndrome", "Sports Fatigue", "Back and Neck Stiffness"];
    result.techniques = ["Static Dry Cupping", "Dynamic Glide Cupping", "Flash Action Cupping", "Fascial Decompression Routing"];
    result.whoShouldOpt = ["Athletes needing fast muscular recovery", "Individuals with chronic deep-tissue stiffness", "Patients with localized myofascial trigger points", "Professionals with chronic postural tension"];
    return result;
  }

  if (lowerName === "wax therapy") {
    result.description = "Paraffin Wax Therapy is a thermotherapy treatment providing intense, soothing focal heat primarily used for distal extremities like hands and feet.";
    result.howItWorks = "The target limb is immersed in a warm, medically-controlled bath of melted paraffin wax mixed with mineral oil. The wax perfectly coats the contours of the joints, trapping heat deeply into the localized tissues. This intense thermal therapy dilates blood vessels, flushes out stiffness, and drastically improves joint lubrication.";
    result.benefits = ["Profound relief from peripheral joint stiffness", "Enhanced tissue and skin elasticity", "Significant reduction in arthritic pain", "Promotion of deep tissue relaxation"];
    result.conditionsTreated = ["Rheumatoid Arthritis in hands/feet", "Osteoarthritis", "Scleroderma", "Post-fracture stiffness", "Raynaud's Disease"];
    result.techniques = ["Dip-Wrap Technique", "Continuous Immersion", "Brush-on Application method", "Wax Thermoregulation"];
    result.whoShouldOpt = ["Patients suffering from rheumatoid or osteoarthritis in digits", "Individuals with stiff hands or feet post-injury", "Patients with circulation disorders", "Those undergoing hand rehabilitation"];
    return result;
  }

  if (lowerName === "kinesio taping / taping therapy") {
    result.description = "Kinesio Taping involves the precise clinical application of elastic therapeutic tape to provide dynamic structural support without restricting your natural range of motion.";
    result.howItWorks = "When applied strategically along functional muscle chains, the specific elasticity of the tape microscopically lifts the skin. This relieves pressure on subcutaneous pain receptors and creates a wider channel for lymphatic drainage, all while providing bio-feedback to optimize joint positioning during movement.";
    result.benefits = ["Continuous joint and muscle support", "Reduction of localized edema and swelling", "Enhancement of proprioception and kinesthetic awareness", "Immediate pain modulation without restricting movement"];
    result.conditionsTreated = ["Ankle Sprains", "Patellofemoral Pain Syndrome", "Shoulder Impingement", "Plantar Fasciitis", "Muscle Strains"];
    result.techniques = ["Fascial Lift Application", "Inhibitory Muscle Taping", "Facilitatory Muscle Taping", "Lymphatic Drainage Web Application"];
    result.whoShouldOpt = ["Athletes desiring support while maintaining performance", "Patients with acute joint instability", "Individuals suffering from localized swelling or hematomas", "Patients needing postural correction cues"];
    return result;
  }

  if (lowerName === "dry needling therapy") {
    result.description = "Dry Needling is an advanced, evidence-based modality where ultra-fine clinical needles are inserted into myofascial trigger points to instantly deactivate muscle spasms.";
    result.howItWorks = "The specialized sterile needle creates a micro-lesion inside the hardened muscle knot (trigger point). This stimulates a localized twitch response, physically breaking the tension protocol within the muscle fiber, instantly restoring normal blood flow and resetting the neural pathway of pain.";
    result.benefits = ["Instant deactivation of severe muscle spasms", "Rapid restoration of muscle length and flexibility", "Targeted relief of deep, intractable pain", "Breakdown of chronic myofascial adhesions"];
    result.conditionsTreated = ["Tennis Elbow", "Chronic Tension Headaches", "Piriformis Syndrome", "TMJ Dysfunction", "Iliotibial (IT) Band Syndrome"];
    result.techniques = ["Deep Trigger Point Needling", "Superficial Fascial Needling", "Pistoning Technique", "Periosteal Pecking"];
    result.whoShouldOpt = ["Patients with chronic, stubborn muscular knots", "Athletes experiencing localized muscular cramping", "Individuals suffering from tension-related headaches", "Patients failing to respond to traditional massage alone"];
    return result;
  }

  if (lowerName === "thermotherapy(heat therapy)") {
    result.description = "Thermotherapy uses targeted clinical heat application to drastically increase local tissue metabolism and expand blood vessels, preparing the musculoskeletal system for recovery.";
    result.howItWorks = "Controlled therapeutic heat penetrates the superficial skin layers, expanding local blood vessels (vasodilation). This rush of oxygen-rich blood flushes away pain-inducing metabolic waste, simultaneously relaxing the spindle fibers within tense muscles to decrease overall muscle tone and stiffness.";
    result.benefits = ["Immediate reduction in muscular tension", "Increased flexibility of collagen tissues", "Accelerated delivery of oxygen and nutrients", "Soothing relief for chronic joint discomfort"];
    result.conditionsTreated = ["Chronic Back Muscle Spasms", "Osteoarthritis Pain", "Delayed Onset Muscle Soreness (DOMS)", "General Joint Stiffness", "Menstrual Cramps affecting lower back"];
    result.techniques = ["Moist Hot Pack Application", "Infrared Thermal Therapy", "Contrast Bath Protocols", "Deep Tissue Pre-heating"];
    result.whoShouldOpt = ["Individuals with chronic, non-inflammatory pain", "Seniors with morning joint stiffness", "Athletes preparing stiff muscles for deep stretch", "Patients needing relaxation before manual therapy"];
    return result;
  }

  if (lowerName === "transcutaneous electrical nerve stimulation(tens) therapy") {
    result.description = "TENS Therapy is a highly effective, non-invasive analgesic modality that uses low-voltage electrical currents for immediate pain management.";
    result.howItWorks = "Electrode pads deliver specific electrical impulses across the skin. Based on the frequency set by the clinician, these impulses either block the pain signals traveling to the brain (Gate Control) or stimulate the body’s natural production of endorphins—your physiological painkillers.";
    result.benefits = ["Immediate localized pain suppression", "Drug-free acute pain management", "Stimulation of natural endorphin release", "Reduction of muscle hypertonicity"];
    result.conditionsTreated = ["Post-operative Acute Pain", "Labor Pain Management", "Acute Sciatica", "Diabetic Neuropathy Discomfort", "Fibromyalgia"];
    result.techniques = ["High-Frequency Conventional TENS", "Low-Frequency Acupuncture-like TENS", "Burst Mode TENS", "Brief Intense TENS Protocol"];
    result.whoShouldOpt = ["Patients seeking non-pharmacological pain relief", "Individuals dealing with sudden, acute nerve pain", "Patients recovering immediately from surgery", "Those with flare-ups of chronic pain conditions"];
    return result;
  }

  if (lowerName === "lymphatic drainage massage") {
    result.description = "Manual Lymphatic Drainage (MLD) is a delicate, highly specialized clinical massage designed to dramatically speed up the body's natural lymphatic waste removal system.";
    result.howItWorks = "Using very light, rhythmic, skin-stretching strokes, the specialist manually pumps and redirects lymphatic fluid from congested areas toward healthy lymph nodes. This accelerates the removal of stagnant intercellular fluid, cellular debris, and inflammatory proteins from your tissues.";
    result.benefits = ["Rapid reduction of post-surgical or systemic swelling", "Detoxification of cellular waste", "Acceleration of immune system responses", "Deep relaxation of the autonomic nervous system"];
    result.conditionsTreated = ["Lymphedema", "Post-surgical Swelling (e.g., Post-Mastectomy)", "Chronic Venous Insufficiency", "Post-traumatic Edema", "Lipedema"];
    result.techniques = ["Stationary Circle Strokes", "Pump Technique", "Scoop Stroke Technique", "Rotary Technique Application"];
    result.whoShouldOpt = ["Post-operative patients experiencing heavy swelling", "Patients diagnosed with secondary or primary Lymphedema", "Individuals with systemic inflammatory conditions", "Post-trauma patients with massive bruising"];
    return result;
  }

  if (lowerName === "overhead track harness therapy") {
    result.description = "Overhead Track Harness Therapy provides a completely secure, body-weight supported environment for patients to re-learn gait and balance without the fear of falling.";
    result.howItWorks = "The patient is safely suspended in an adjustable clinical harness connected to an overhead track system. The therapist unloads a specific percentage of the patient's body weight, allowing them to practice complex walking and balance patterns with normalized biomechanics and absolute safety.";
    result.benefits = ["Total elimination of fall risk during rehabilitation", "Ability to practice walking earlier in the recovery phase", "Enhancement of neuro-plasticity via repetitive perfect gait", "Significant improvement in patient confidence"];
    result.conditionsTreated = ["Stroke Rehabilitation", "Spinal Cord Injuries", "Parkinson's Disease", "Traumatic Brain Injuries", "Severe Post-orthopedic Surgery"];
    result.techniques = ["Partial Body Weight Supported Treadmill Training", "Over-ground Harness Ambulation", "Dynamic Balance Perturbation Training", "Unloaded Squat and Step Mechanisms"];
    result.whoShouldOpt = ["Neurological patients re-learning to walk", "Geriatric patients with a profound fear of falling", "Individuals with severe balance or vestibular deficits", "Patients incapable of full weight-bearing on lower limbs"];
    return result;
  }

  if (lowerName === "traction therapy") {
    result.description = "Traction Therapy provides sustained or intermittent mechanical separation of spinal vertebrae to relieve direct pressure on severely compressed intervertebral discs and nerve roots.";
    result.howItWorks = "Using specialized clinical harnesses, calculated mechanical force is applied longitudinally along the spine. This creates a negative intra-discal pressure, helping to retract herniated disc materials, open up narrowed neural foramina, and stretch contracted surrounding spinal musculature.";
    result.benefits = ["Relief from severe radiating nerve pain", "Decompression of pinched spinal nerves", "Restoration of spinal segmental mobility", "Reduction of chronic spinal muscle spasms"];
    result.conditionsTreated = ["Herniated or Bulging Discs", "Cervical Radiculopathy", "Spinal Stenosis", "Degenerative Disc Disease", "Sciatica"];
    result.techniques = ["Intermittent Mechanical Cervical Traction", "Sustained Lumbar Traction", "Manual Director's Traction", "Positional Inversion Traction"];
    result.whoShouldOpt = ["Patients suffering from sharp, shooting pain down arms or legs", "Individuals diagnosed with disc bulges", "Patients with spinal arthritis causing nerve pinching", "Those looking to avoid surgical spinal interventions"];
    return result;
  }

  if (lowerName === "spinal decompression / traction therapy") {
    result.description = "Advanced Spinal Decompression is a highly sophisticated, computer-controlled traction therapy designed to gently separate vertebrae and heal damaged spinal discs.";
    result.howItWorks = "The patient rests on a specialized computerized table that applies logarithmic, precision-calibrated pulling forces. The system's biofeedback sensors bypass the spine's natural muscle guarding mechanisms, creating a proven negative vacuum effect inside the disc that sucks the herniated gel back into place and draws in vital healing nutrients.";
    result.benefits = ["Non-surgical healing of disc herniations", "Precise targeting of damaged spinal segments", "Rehydration of degenerated spinal discs", "Elimination of chronic radiating sciatica and radiculopathy"];
    result.conditionsTreated = ["Severe Disc Herniation", "Slipped Disc", "Chronic Lumbar Spondylosis", "Facet Syndrome", "Failed Back Surgery Syndrome"];
    result.techniques = ["Computerized Logarithmic Pulls", "Targeted Multi-vector Decompression", "Pelvic Tilt Variable Traction", "Sensory Bio-feedback Neutralization"];
    result.whoShouldOpt = ["Patients recommended for spinal surgery looking for a conservative alternative", "Individuals with chronic, severe sciatica", "Patients with multiple degenerated discs", "Those suffering from chronic, unrelenting low back pain"];
    return result;
  }

  if (lowerName === "tecar / cret therapy") {
    result.description = "TECAR (Capacitive and Resistive Electric Transfer) Therapy is an elite high-frequency modality that stimulates biological healing processes at a fundamental cellular level.";
    result.howItWorks = "TECAR generates an electromagnetic high-frequency current that passes harmlessly through the body, drastically raising the internal temperature of dense targeted tissues (tendons, bones, and ligaments). This internal bio-stimulation accelerates cellular metabolism, radically increasing oxygen delivery and accelerating tissue repair.";
    result.benefits = ["Profoundly rapid healing of deep tissue injuries", "Immediate and long-lasting pain relief", "Drastic reduction in acute and chronic inflammation", "Restoration of cellular metabolic efficiency"];
    result.conditionsTreated = ["Severe Osteoarthritis", "Deep Muscle Contusions", "Chronic Tendinopathies", "Ligament Tears", "Plantar Fasciitis"];
    result.techniques = ["Capacitive Mode for superficial soft tissue", "Resistive Mode for deep bone and cartilage", "Athermal Cellular Stimulation", "Thermal Hyperemia Protocols"];
    result.whoShouldOpt = ["Professional athletes needing the fastest possible return to play", "Patients with deep, chronic joint degeneration", "Individuals with slow-healing ligament injuries", "Patients with severe muscle trauma or contusions"];
    return result;
  }

  if (lowerName === "cryotherapy(cold therapy)") {
    result.description = "Cryotherapy is the clinical application of extreme cold to rapidly suppress inflammation, numb acute pain, and construct blood vessels to prevent hazardous swelling.";
    result.howItWorks = "Intense local cooling causes immediate vasoconstriction (narrowing of blood vessels), drastically slowing local cellular metabolism and cutting off the production of inflammatory mediators. It also decreases the nerve conduction velocity, providing a potent, immediate analgesic (numbing) effect on the injured area.";
    result.benefits = ["Instant numbing of acute pain", "Total prevention of excessive acute swelling", "Suppression of muscle spasms and guarding", "Reduction of secondary cellular hypoxic injury"];
    result.conditionsTreated = ["Acute Ankle Sprains", "Immediate Post-operative Swelling", "Acute Muscle Tears", "Bursitis Flare-ups", "Severe DOMS (Delayed Onset Muscle Soreness)"];
    result.techniques = ["Ice Pack Compression (RICE protocol)", "Vapocoolant Sprays", "Ice Massage Modalities", "Cryokinetics (Cold combined with motion)"];
    result.whoShouldOpt = ["Individuals who have acutely injured themselves within the last 48 hours", "Athletes managing severe post-game inflammation", "Patients recovering immediately from orthopedic surgery", "Individuals experiencing an acute flare-up of arthritis"];
    return result;
  }

  if (lowerName === "dynamic compression therapy") {
    result.description = "Dynamic Compression Therapy utilizes pneumatic, sequential compression sleeves to mechanically flush trapped metabolic waste and dramatically enhance lymphatic return.";
    result.howItWorks = "The patient's limbs are encased in high-tech pneumatic sleeves that inflate in a distal-to-proximal sequence (from foot to hip). This pulsating pressure mimics and amplifies the body's natural muscle-pump mechanism, forcefully clearing lactic acid and lymphatic fluid while driving fresh, oxygenated arterial blood down the limb.";
    result.benefits = ["Extremely rapid recovery for fatigued muscles", "Effective clearance of lactic acid and metabolic waste", "Dramatic reduction in limb swelling and edema", "Improvement in overall vascular circulation efficiency"];
    result.conditionsTreated = ["Athletic Muscle Fatigue", "Peripheral Edema", "Varicose Vein Swelling", "Deep Vein Thrombosis (Prevention protocols)", "Lymphedema"];
    result.techniques = ["Distal-to-Proximal Sequential Flushing", "Targeted Zone Compression", "Pulsating Wave Therapy", "Pre-workout Vascular Activation"];
    result.whoShouldOpt = ["Endurance athletes (runners, cyclists) needing fast recovery", "Individuals suffering from swollen legs or chronic fluid retention", "Patients with sluggish circulation", "Professionals who stand for prolonged hours"];
    return result;
  }

  if (lowerName === "shockwave therapy") {
    result.description = "Extracorporeal Shockwave Therapy (ESWT) is an aggressive, high-energy acoustic treatment designed to forcefully breakdown chronic calcifications and instantly restart the healing process of stagnant injuries.";
    result.howItWorks = "A specialized clinical applicator fires high-intensity acoustic pressure waves directly into the chronic injury site. These shockwaves cause targeted micro-trauma, dissolving calcium build-ups, promoting aggressive new blood vessel formation (angiogenesis), and shocking the body's stem cells back into action to heal tendons that have stopped repairing themselves.";
    result.benefits = ["Dissolves chronic tendon calcifications", "Triggers the generation of brand new blood vessels", "Breaks the cycle of chronic pain signals", "Extremely high success rate for chronic tendinopathies"];
    result.conditionsTreated = ["Calcific Tendinitis of the Shoulder", "Severe Plantar Fasciitis with Heel Spurs", "Chronic Achilles Tendinopathy", "Tennis/Golfer's Elbow", "Jumper's Knee (Patellar Tendinosis)"];
    result.techniques = ["Radial Pressure Wave Therapy", "Focused Shockwave Therapy", "Gradual Intensity Stepping", "Trigger Point Shock Localization"];
    result.whoShouldOpt = ["Patients with chronic tendon pain lasting more than 6 months", "Individuals with diagnosed bone spurs or calcifications", "Patients who have failed traditional physical therapy", "Athletes suffering from chronic overuse injuries"];
    return result;
  }

  if (lowerName === "robotic spinal decompression therapy") {
    result.description = "Robotic Spinal Decompression is the absolute pinnacle of conservative spinal care, utilizing AI-driven robotic actuators to provide unmatched, mathematically precise spinal distraction.";
    result.howItWorks = "A heavy-duty robotic table constantly monitors paraspinal muscle tension through sophisticated biofeedback sensors at a rate of 10,000 times per second. Based on this data, the robotic motors dynamically adjust the angle and force of pull in real-time, completely overriding the brain's defense mechanisms to safely widen the disc space and hydrate degenerated discs.";
    result.benefits = ["Surgically-precise targeted spinal decompression", "Completely eliminates human-error in traction delivery", "Safely treats patients who could not tolerate standard traction", "Reverses structural disc dehydration and height loss"];
    result.conditionsTreated = ["Massive Disc Extrusions", "Multilevel Degenerative Disc Disease", "Spinal Canal Stenosis", "Advanced Sciatic Nerve Impingement", "Severe Post-Surgical Lumbar Pain"];
    result.techniques = ["AI-Adjusted Dynamic Force Curves", "3D Multi-axial Distraction", "Zero-Gravity Positioning", "Real-time Bio-feedback Nullification"];
    result.whoShouldOpt = ["Patients facing imminent spinal fusion or discectomy surgery", "Individuals with highly reactive, severe back pain", "Patients with complex, multi-level spinal degeneration", "Those who have seen no results from standard chiropractic or physiotherapy"];
    return result;
  }

  if (lowerName === "manual therapy") {
    result.description = "Manual Therapy encapsulates expert, hands-on clinical interventions targeted at mobilizing stiff joints and rapidly modulating complex neuromusculoskeletal pain.";
    result.howItWorks = "Our clinical specialists use specialized, highly-skilled hand movements (Maitland, Mulligan, or Kaltenborn concepts) to assess joint play and passively restore the natural glide and slide mechanics of the joints. This precise mechanical input immediately reduces pain through neurological mechanisms and instantly unlocks restricted ranges of motion.";
    result.benefits = ["Immediate restoration of joint mechanics and mobility", "Rapid, drug-free pain modulation", "Correction of subtle joint positional faults", "Enhancement of fluid dynamics inside the joint capsule"];
    result.conditionsTreated = ["Frozen Shoulder (Adhesive Capsulitis)", "Facet Joint Locking in the Spine", "Stiff Ankles post-fracture", "Cervical Headaches", "Joint Osteoarthritis"];
    result.techniques = ["Joint Mobilization (Grades 1-5)", "Mobilization with Movement (MWM)", "Muscle Energy Techniques (MET)", "Passive Accessory Glides"];
    result.whoShouldOpt = ["Patients experiencing joint stiffness restricting daily activities", "Individuals recovering from prolonged periods in a cast", "Patients suffering from sudden locked backs or necks", "Those requiring precise biomechanical correction"];
    return result;
  }

  if (lowerName === "myofascial release (mfr)") {
    result.description = "Myofascial Release (MFR) is an intensive, sustained manual technique targeting the fascial connective tissue matrix that encases and supports the entire muscular system.";
    result.howItWorks = "Fascia can become dense, restrictive, and painful due to trauma, poor posture, or inflammation. The therapist applies slow, sustained, highly specific pressure (without sliding) into fascial restrictions. This sustained holding actually changes the viscosity of the fascia, melting away solid restrictions into a pliable, functional state.";
    result.benefits = ["Total release of chronic, full-body tension patterns", "Dramatically improves absolute range of motion", "Decompresses trapped neurological structures", "Re-establishes structural balance across entire limb chains"];
    result.conditionsTreated = ["Fibromyalgia", "Myofascial Pain Syndrome", "Chronic Pelvic Pain", "Severe Postural Imbalances", "Widespread Chronic Muscular Pain"];
    result.techniques = ["Skin Rolling", "Cross-Hand Fascial Stretches", "Sustained Deep Tissue Torquing", "Instrument Assisted Soft Tissue Mobilization (IASTM)"];
    result.whoShouldOpt = ["Patients who feel tight all over", "Individuals suffering from stress-induced chronic pain syndromes", "Patients with unexplained, spreading muscular discomfort", "Athletes requiring deep structural realignment"];
    return result;
  }

  if (lowerName === "soft tissue mobilization") {
    result.description = "Soft Tissue Mobilization (STM) is a clinical approach dedicated to breaking down adhesions and correcting the alignment of injured muscle fibers, tendons, and ligaments.";
    result.howItWorks = "Using varied pressures, rhythms, and directional strokes, the specialist systematically realigns disorganized collagen fibers (scar tissue). This aggressive mechanical action breaks the pathological cross-links between tissues, restoring normal gliding between muscles and allowing for pain-free contraction.";
    result.benefits = ["Destroys pathological cross-links and adhesions", "Realigns healing scar tissue for maximum strength", "Greatly reduces friction between adjacent muscles", "Accelerates muscle recovery post-trauma"];
    result.conditionsTreated = ["Chronic Achilles Tendinitis", "Post-Surgical Scar Tissue Binding", "Severe Muscle Strains/Tears", "IT Band Friction Syndrome", "Golfers/Tennis Elbow"];
    result.techniques = ["Deep Transverse Friction Massage (DTFM)", "Longitudinal Gliding", "Active Release Strategy", "Graston / IASTM Technique"];
    result.whoShouldOpt = ["Athletes dealing with heavy, dense scar tissue from previous injuries", "Patients recovering from major orthopedic or abdominal surgeries", "Individuals with localized, thickened tissue restrictions", "Patients experiencing mechanical friction or snapping sensations in joints"];
    return result;
  }

  if (lowerName === "pelvic floor physical therapy") {
    result.description = "Pelvic Floor Physical Therapy is highly-specialized, discreet clinical care aimed at rehabilitating the hammock of muscles supporting the pelvic organs, bladder, and bowel functions.";
    result.howItWorks = "Through external (and sometimes internal) assessment, the specialist identifies whether the pelvic muscles are hypertonic (too tight) or hypotonic (too weak). The treatment involves targeted biofeedback, respiratory coordination, neuromuscular electrical stimulation, and specific internal release/strengthening exercises to restore complete functional control.";
    result.benefits = ["Total restoration of bladder and bowel control", "Elimination of chronic pelvic and lower abdominal pain", "Safe, rapid recovery of core stability post-childbirth", "Improvement in overall sexual functional health"];
    result.conditionsTreated = ["Urinary/Fecal Incontinence", "Pelvic Organ Prolapse", "Post-partum Core/Pelvic Weakness", "Vaginismus / Dyspareunia", "Chronic Prostatitis (Men)"];
    result.techniques = ["Kegel and Reverse Kegel Protocols", "Electromyography (EMG) Biofeedback", "Internal Trigger Point Release", "Diaphragmatic Breathing Syncing"];
    result.whoShouldOpt = ["Women experiencing leakage post-pregnancy or menopause", "Individuals suffering from unexplained, chronic pelvic pain", "Patients recovering from prostate or gynecological surgeries", "Athletes experiencing core instability or pelvic heaviness"];
    return result;
  }

  if (lowerName === "chest physiotherapy") {
    result.description = "Chest Physiotherapy (CPT) encompasses respiratory techniques designed to aggressively clear thick secretions from the lungs and dramatically improve pulmonary efficiency and oxygenation.";
    result.howItWorks = "The therapist utilizes precise percussion (clapping), mechanical vibration, and postural drainage (positioning the patient using gravity). This combination mechanically shakes free the thick, sticky mucus trapped in the deep lung lobes, allowing the patient to effectively cough it out and dramatically rapidly improving oxygen exchange.";
    result.benefits = ["Immediate clearing of deep, trapped lung secretions", "Prevention of severe respiratory infections (like pneumonia)", "Vast improvement in lung volume and oxygen levels", "Reduction in respiratory effort and shortness of breath"];
    result.conditionsTreated = ["Cystic Fibrosis", "Bronchiectasis", "Severe COPD", "Post-operative Pulmonary Complications", "Pneumonia"];
    result.techniques = ["Postural Drainage Sequencing", "Manual Percussion and Vibration", "Active Cycle of Breathing Technique (ACBT)", "Incentive Spirometry Training"];
    result.whoShouldOpt = ["Patients struggling to cough up thick phlegm", "Individuals recovering from severe lower respiratory tract infections", "Bedridden or post-surgical patients at high risk of pneumonia", "Patients suffering from chronic restrictive or obstructive lung diseases"];
    return result;
  }

  if (lowerName === "shortwave diathermy (swd)") {
    result.description = "Shortwave Diathermy (SWD) is an incredibly powerful deep-tissue thermotherapy capable of heating heavy muscular, ligamentous, and capsular structures simultaneously over a large area.";
    result.howItWorks = "SWD uses high-frequency electromagnetic energy (radio waves) operating at 27.12 MHz to generate deep, penetrating heat via massive molecular friction within the tissues. Unlike hot packs which only heat the skin, SWD easily penetrates fat layers to deliver therapeutic vasodilation deeply into the massive joints like hips and shoulders.";
    result.benefits = ["Capable of heating very deep, massive joint structures", "Causes widespread, profound blood vessel dilation", "Significantly increases the extensibility of thick joint capsules", "Highly effective for massive tissue regions (like the low back)"];
    result.conditionsTreated = ["Severe, Deep Osteoarthritis (Hip/Knee)", "Chronic Degenerative Disc Disease", "Adhesive Capsulitis (Frozen Shoulder) Capsular Contracture", "Massive Muscle Spasms in the Lumbar Spine", "Chronic Pelvic Inflammatory Disease Pain"];
    result.techniques = ["Continuous Mode (for profound thermal effects)", "Pulsed Mode (for non-thermal tissue healing)", "Capacitive Plate Setup", "Induction Coil / Drum Setup"];
    result.whoShouldOpt = ["Patients with severe stiffness in large, deep joints (hips and shoulders)", "Individuals with widespread chronic muscle spasms", "Patients who need massive tissue extensibility before aggressive stretching", "Geant/Bariatric patients where standard heat packs cannot penetrate fat layers"];
    return result;
  }


  // Fallback for any unknown
  result.description = `${name} is a specialized clinical therapeutic modality used by Aries experts to accelerate recovery and enhance functional outcomes. We integrate this into personalized programs to ensure the best possible results.`;
  result.howItWorks = `This therapy utilizes fundamental scientific principles to stimulate biological repair mechanisms, improve localized circulation, and restore functional patterns through targeted clinical intervention.`;
  result.benefits = ['Faster recovery times', 'Improved functional capacity', 'Sustainable results', 'Non-invasive clinical care', 'Reduced risk of complications', 'Enhanced efficiency'];
  result.conditionsTreated = ['Musculoskeletal disorders', 'Rehabilitation needs', 'Functional limitations', 'Chronic management', 'Acute issues'];
  result.techniques = ['Clinical assessment', 'Targeted application', 'Progressive adjustment', 'Bio-mechanical integration'];
  result.whoShouldOpt = ['Patients seeking expert recovery', 'Individuals with movement challenges', 'Anyone prioritizing clinical health', 'Patients needing hospital-grade care at home'];

  return result;
};

export const physiotherapyConditions: Condition[] = conditionList.map((name, index) => {
  const clinicalInfo = getConditionClinicalInfo(name);
  return {
    id: `physio-${index}`,
    name,
    slug: toSlug(name),
    imageUrl: findImage(toSlug(name), name).imageUrl,
    imageHint: name,
    ...clinicalInfo
  };
});

const generateMockConditions = (servicePrefix: string, count: number): Condition[] => {
  const getImg = (prefix: string) => {
    switch (prefix) {
      case 'ot': return 'https://images.unsplash.com/photo-1519238263530-990ffce6e4b8?auto=format&fit=crop&q=85&w=1600';
      case 'diet': return 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?auto=format&fit=crop&q=85&w=1600';
      case 'nursing': return 'https://images.unsplash.com/photo-1584515933487-779824d29309?auto=format&fit=crop&q=85&w=1600';
      case 'caretaker': return 'https://images.unsplash.com/photo-1576765608535-5f04c18459e4?auto=format&fit=crop&q=85&w=1600';
      case 'speech': return 'https://images.unsplash.com/photo-1543881062-8e1f5798aee8?auto=format&fit=crop&q=85&w=1600';
      default: return 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&q=85&w=1600';
    }
  };

  return Array.from({ length: count }).map((_, i) => ({
    id: `${servicePrefix}-cond-${i}`,
    name: `Clinical Focus Area ${i + 1}`,
    slug: `focus-area-${i + 1}`,
    description: 'Specialized home-based clinical protocol for focused recovery and health management.',
    imageUrl: getImg(servicePrefix),
    imageHint: 'medical focus',
    symptoms: ['Symptom A', 'Symptom B'],
    treatmentDetails: 'Our clinical approach combines expert assessment with personalized management plans.',
    benefits: ['Benefit 1', 'Benefit 2'],
    whoShouldOpt: ['Patient Group A', 'Patient Group B'],
    faqs: []
  }));
};

export const services: Service[] = [
  {
    id: '1',
    name: 'Physiotherapy',
    slug: 'physiotherapy',
    description: 'Personalized physical therapy to restore movement and function.',
    icon: HeartPulse,
    longDescription: 'Physiotherapy at home offers a convenient and effective way to receive expert care. At Aries PhysioCare, our certified physiotherapists bring hospital-grade treatment to your doorstep, utilizing advanced modalities and manual therapy techniques.',
    conditions: physiotherapyConditions
  },
  {
    id: '2',
    name: 'Occupational Therapy',
    slug: 'occupational-therapy',
    description: 'Specialized intervention to help you regain independence in daily life activities.',
    icon: Accessibility,
    longDescription: 'Occupational Therapy (OT) at Aries PhysioCare is dedicated to helping individuals of all ages achieve independence in their daily lives. Our experts focus on "occupations"—the meaningful activities that make up your day, from self-care to work and play. We address physical, cognitive, and sensory challenges through personalized clinical protocols, environmental adaptations, and evidence-based functional training delivered in the comfort of your home.',
    conditions: [
      {
        id: 'ot-cond-1',
        name: 'Sensory Processing Disorder',
        slug: 'sensory-processing-disorder',
        description: 'Specialized sensory integration therapy to help children and adults process and respond to environmental stimuli effectively.',
        imageUrl: 'https://images.unsplash.com/photo-1519238263530-990ffce6e4b8?auto=format&fit=crop&q=85&w=1600',
        imageHint: 'sensory integration and pediatric developmental therapy',
        symptoms: ['Over-sensitivity to light/sound', 'Poor coordination', 'Difficulty with transitions', 'Behavioral challenges'],
        treatmentDetails: 'Our OT experts utilize sensory-rich environments and structured play to regulate neural responses and improve focus.',
        benefits: ['Improved emotional regulation', 'Better focus in school/work', 'Enhanced motor coordination'],
        whoShouldOpt: ['Children with ADHD/Autism', 'Individuals with sensory processing challenges', 'Parents seeking developmental support'],
        faqs: []
      },
      {
        id: 'ot-cond-2',
        name: 'Stroke & Neuro Rehabilitation',
        slug: 'neuro-occupational-therapy',
        description: 'Functional recovery programs to help stroke survivors regain the ability to perform daily tasks like dressing, eating, and grooming.',
        imageUrl: 'https://images.unsplash.com/photo-1559757175-5700dde675bc?auto=format&fit=crop&q=85&w=1600',
        imageHint: 'neurological rehabilitation and fine motor dexterity',
        symptoms: ['Hemiplegia/Paralysis', 'Cognitive deficits', 'Loss of fine motor control', 'Difficulty with ADLs'],
        treatmentDetails: 'We use task-oriented training, constraint-induced movement therapy (CIMT), and cognitive retraining to restore autonomy.',
        benefits: ['Restored independence in self-care', 'Improved fine motor dexterity', 'Enhanced cognitive function'],
        whoShouldOpt: ['Stroke survivors', 'Patients with TBI or Spinal Cord injuries', 'Individuals with Neurological tremors'],
        faqs: []
      },
      {
        id: 'ot-cond-3',
        name: 'Pediatric Developmental Delay',
        slug: 'pediatric-occupational-therapy',
        description: 'Helping children achieve crucial developmental milestones through playful clinical intervention and motor skill training.',
        imageUrl: 'https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&q=85&w=1600',
        imageHint: 'pediatric developmental motor milestones therapy',
        symptoms: ['Delayed fine motor skills', 'Poor handwriting', 'Difficulty with buttons/zips', 'Low muscle tone'],
        treatmentDetails: 'Includes handwriting training, gross motor coordination games, and upper limb strengthening protocols.',
        benefits: ['School readiness', 'Improved self-esteem', 'Mastery of self-care tasks'],
        whoShouldOpt: ['Children with developmental delays', 'Kids struggling with fine motor tasks', 'Educational institutions seeking OT support'],
        faqs: []
      },
      {
        id: 'ot-cond-4',
        name: 'Geriatric Home Safety & ADLs',
        slug: 'geriatric-occupational-therapy',
        description: 'Environmental modifications and functional training to help senior citizens live safely and independently at home.',
        imageUrl: 'https://images.unsplash.com/photo-1576765608535-5f04c18459e4?auto=format&fit=crop&q=85&w=1600',
        imageHint: 'senior citizen daily living and fall prevention',
        symptoms: ['Frequent falls', 'Reduced mobility', 'Difficulty with home tasks', 'Cognitive decline'],
        treatmentDetails: 'Comprehensive home safety audits, balance training, and adaptive equipment recommendations (grab bars, reachers).',
        benefits: ['Reduced fall risk', 'Prolonged independent living', 'Improved quality of life for seniors'],
        whoShouldOpt: ['Seniors living alone', 'Families of patients with Alzheimers/Parkinsons', 'Individuals with age-related mobility loss'],
        faqs: []
      },
      {
        id: 'ot-cond-5',
        name: 'Hand & Wrist Rehabilitation',
        slug: 'hand-therapy',
        description: 'Specialized therapy for hand injuries, tendon repairs, and carpal tunnel syndrome to restore grip and dexterity.',
        imageUrl: 'https://images.unsplash.com/photo-1519823551278-64ac92734fb1?auto=format&fit=crop&q=85&w=1600',
        imageHint: 'hand dexterity, tendon and wrist rehabilitation',
        symptoms: ['Wrist pain', 'Reduced grip strength', 'Numbness in fingers', 'Post-surgical stiffness'],
        treatmentDetails: 'Custom splinting, scar management, tendon gliding exercises, and progressive strengthening.',
        benefits: ['Restored hand function', 'Reduced pain and swelling', 'Improved dexterity for work/hobbies'],
        whoShouldOpt: ['Post-surgical hand patients', 'Individuals with Carpal Tunnel', 'Artists/Musicians with hand strain'],
        faqs: []
      },
      {
        id: 'ot-cond-6',
        name: 'Ergonomics & Workstation Adaptation',
        slug: 'occupational-ergonomics',
        description: 'Clinical assessment of your workspace to prevent repetitive strain injuries and optimize postural health.',
        imageUrl: 'https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?auto=format&fit=crop&q=85&w=1600',
        imageHint: 'workplace ergonomic posture correction',
        symptoms: ['Chronic neck/back pain', 'Wrist fatigue', 'Eye strain', 'Postural headaches'],
        treatmentDetails: 'Workstation setup analysis, postural corrective exercises, and micro-break scheduling protocols.',
        benefits: ['Reduced workplace injuries', 'Increased productivity', 'Long-term spinal health'],
        whoShouldOpt: ['IT Professionals', 'Remote workers', 'Corporate teams'],
        faqs: []
      }
    ]
  },
  {
    id: '3',
    name: 'Clinical Dietician',
    slug: 'dietician',
    description: 'Evidence-based nutrition management for disease recovery and peak wellness.',
    icon: CookingPot,
    longDescription: 'Nutrition is the cornerstone of clinical recovery and long-term health. At Aries PhysioCare, our Clinical Dieticians provide evidence-based nutrition counseling tailored to your unique metabolic needs. We go beyond generic meal plans, offering specialized medical nutrition therapy for diabetes, cardiac health, weight management, and post-operative recovery, all within the convenience of your home.',
    conditions: [
      {
        id: 'diet-cond-1',
        name: 'Diabetes Management',
        slug: 'diabetes-nutrition',
        description: 'Scientific blood sugar control through specialized glycemic index management and personalized carbohydrate counting.',
        imageUrl: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?auto=format&fit=crop&q=85&w=1600',
        imageHint: 'clinical diabetes nutrition planning',
        symptoms: ['High blood sugar levels', 'Insulin resistance', 'Frequent fatigue', 'Fluctuating energy'],
        treatmentDetails: 'Personalized meal mapping to stabilize HbA1c levels, continuous glucose monitoring integration, and lifestyle coaching.',
        benefits: ['Stable energy levels', 'Reduced dependency on medication', 'Prevention of diabetic complications'],
        whoShouldOpt: ['Type 1/2 Diabetics', 'Pre-diabetic individuals', 'Gestational diabetes patients'],
        faqs: []
      },
      {
        id: 'diet-cond-2',
        name: 'Weight Management',
        slug: 'medical-weight-loss',
        description: 'Sustainable, medically-supervised weight loss or gain programs focused on body composition and metabolic health.',
        imageUrl: 'https://images.unsplash.com/photo-1505576399279-565b52d4ac71?auto=format&fit=crop&q=85&w=1600',
        imageHint: 'balanced nutritional medical meal planning',
        symptoms: ['High BMI', 'Metabolic syndrome', 'Low muscle mass', 'PCOS-related weight gain'],
        treatmentDetails: 'Caloric deficit/surplus planning based on BMR, macronutrient optimization, and behavioral nutrition coaching.',
        benefits: ['Improved joint health', 'Enhanced metabolic rate', 'Sustainable fat loss'],
        whoShouldOpt: ['Individuals seeking healthy weight loss', 'Patients with PCOS/Thyroid', 'Athletes needing specific body composition'],
        faqs: []
      },
      {
        id: 'diet-cond-3',
        name: 'Cardiac Nutrition',
        slug: 'heart-healthy-diet',
        description: 'Heart-healthy dietary protocols to manage cholesterol, hypertension, and overall cardiovascular recovery.',
        imageUrl: 'https://images.unsplash.com/photo-1505751172676-d7405903823d?auto=format&fit=crop&q=85&w=1600',
        imageHint: 'cardiac heart-healthy clinical nutrition',
        symptoms: ['High cholesterol (LDL)', 'Hypertension', 'Post-heart surgery', 'Arterial plaque'],
        treatmentDetails: 'Low-sodium, heart-healthy fat (MUFA/PUFA) integration and DASH diet based clinical protocols.',
        benefits: ['Lowered blood pressure', 'Improved lipid profile', 'Reduced risk of cardiac events'],
        whoShouldOpt: ['Post-CABG/Angioplasty patients', 'Individuals with Hypertension', 'Anyone with a family history of heart disease'],
        faqs: []
      },
      {
        id: 'diet-cond-4',
        name: 'Gastrointestinal Health',
        slug: 'gut-health-nutrition',
        description: 'Dietary interventions for IBS, Celiac disease, and general gut microbiome optimization.',
        imageUrl: 'https://images.unsplash.com/photo-1616671285410-998846e96901?auto=format&fit=crop&q=85&w=1600',
        imageHint: 'gastrointestinal digestive health nutrition',
        symptoms: ['Bloating', 'Acid reflux', 'Food intolerances', 'Irregular bowel movements'],
        treatmentDetails: 'Elimination diets (Low FODMAP), probiotic integration, and gut-barrier repair protocols.',
        benefits: ['Elimination of digestive discomfort', 'Improved nutrient absorption', 'Enhanced immunity'],
        whoShouldOpt: ['IBS/IBD sufferers', 'Individuals with chronic acidity', 'Patients with food allergies'],
        faqs: []
      }
    ]
  },
  {
    id: '4',
    name: 'Home Nursing',
    slug: 'home-nursing',
    description: 'Skilled clinical nursing care for post-op, chronic illness, and complex recovery.',
    icon: Stethoscope,
    longDescription: 'Aries PhysioCare provides hospital-grade nursing services in the comfort of your home. Our highly trained and certified nurses specialize in complex clinical tasks, including advanced wound management, medication administration, vitals monitoring, and specialized post-operative care. We bridge the gap between hospital discharge and full recovery with professional rigor and compassionate attention.',
    conditions: [
      {
        id: 'nursing-cond-1',
        name: 'Post-Surgical Care',
        slug: 'post-operative-nursing',
        description: 'Comprehensive management of surgical wounds, drain care, and medication protocols for a safe infection-free recovery.',
        imageUrl: 'https://images.unsplash.com/photo-1584515933487-779824d29309?auto=format&fit=crop&q=85&w=1600',
        imageHint: 'post-operative surgical nursing and wound care',
        symptoms: ['Surgical incisions', 'Suture/Staple removal', 'Post-op pain', 'Drain tubes'],
        treatmentDetails: 'Sterile dressing changes, administration of IV/Oral medications, monitoring for signs of infection, and progress reporting to surgeons.',
        benefits: ['Reduced risk of hospital readmission', 'Zero-infection recovery', 'Faster wound healing'],
        whoShouldOpt: ['Post-orthopedic surgery patients', 'Cardiac surgery survivors', 'Maternity/C-section recovery'],
        faqs: []
      },
      {
        id: 'nursing-cond-2',
        name: 'Chronic Disease Management',
        slug: 'chronic-illness-nursing',
        description: 'Professional monitoring and medication management for patients with chronic conditions like diabetes and hypertension.',
        imageUrl: 'https://images.unsplash.com/photo-1576765608535-5f04c18459e4?auto=format&fit=crop&q=85&w=1600',
        imageHint: 'chronic illness monitoring and vitals tracking',
        symptoms: ['Uncontrolled blood sugar', 'Hypertension', 'COPD/Respiratory issues', 'Chronic heart failure'],
        treatmentDetails: 'Regular vitals tracking, insulin administration, nebulization therapy, and oxygen management.',
        benefits: ['Stabilized health metrics', 'Early detection of complications', 'Effective medication adherence'],
        whoShouldOpt: ['Senior citizens with multiple comorbidities', 'Patients requiring daily clinical monitoring', 'Bedridden individuals'],
        faqs: []
      },
      {
        id: 'nursing-cond-3',
        name: 'Critical Care at Home',
        slug: 'home-icu-nursing',
        description: 'Hospital-grade care for patients requiring specialized equipment like Tracheostomy, Ryle’s Tube, and Catheters.',
        imageUrl: 'https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&q=85&w=1600',
        imageHint: 'critical care and specialized medical equipment',
        symptoms: ['Difficulty breathing', 'Feeding via tube', 'Urinary retention', 'Neurological instability'],
        treatmentDetails: 'Tracheostomy suctioning, Ryle’s Tube feeding, Foley catheterization, and ICU-trained nurse monitoring.',
        benefits: ['Cost-effective alternative to hospital ICU', 'Greater patient comfort', 'Specialized clinical intervention'],
        whoShouldOpt: ['Comatose/Semi-comatose patients', 'End-stage cancer patients', 'Stroke survivors with complex needs'],
        faqs: []
      },
      {
        id: 'nursing-cond-4',
        name: 'Wound & Bedsore Care',
        slug: 'wound-management-nursing',
        description: 'Expert treatment for chronic wounds, diabetic ulcers, and pressure sores (bedsores) using sterile techniques.',
        imageUrl: 'https://images.unsplash.com/photo-1581594693702-fbdc51b2763b?auto=format&fit=crop&q=85&w=1600',
        imageHint: 'sterile wound care and pressure sore management',
        symptoms: ['Persistent skin ulcers', 'Stage I-IV bedsores', 'Diabetic foot complications', 'Non-healing wounds'],
        treatmentDetails: 'Debridement consultation, advanced sterile dressing, pressure point management, and nutrition-assisted healing.',
        benefits: ['Prevention of gangrene', 'Rapid skin regeneration', 'Significant pain reduction'],
        whoShouldOpt: ['Paralyzed/Bedridden patients', 'Diabetics with foot ulcers', 'Elderly with fragile skin'],
        faqs: []
      },
      {
        id: 'nursing-cond-5',
        name: 'Palliative & Geriatric Care',
        slug: 'geriatric-palliative-nursing',
        description: 'Compassionate clinical support focused on the comfort, dignity, and quality of life for seniors and those with life-limiting illnesses.',
        imageUrl: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&q=85&w=1600',
        imageHint: 'palliative geriatric nursing and comfort care',
        symptoms: ['Age-related frailty', 'Pain management needs', 'Emotional distress', 'End-of-life support'],
        treatmentDetails: 'Pain relief protocols, basic hygiene support, emotional counseling, and family caregiver training.',
        benefits: ['Enhanced quality of life', 'Dignified care at home', 'Reduced caregiver burnout'],
        whoShouldOpt: ['Seniors living alone', 'Terminally ill patients', 'Families seeking end-of-life support'],
        faqs: []
      }
    ]
  },
  {
    id: '5',
    name: 'Care Takers',
    slug: 'care-taker',
    description: 'Compassionate in-home assistance for daily living, hygiene, and patient support.',
    icon: Users,
    longDescription: 'Our trained Care Takers provide essential support for patients who need assistance with the "Activities of Daily Living" (ADLs). From personal hygiene and grooming to mobility support and companionship, our staff ensures that your loved ones live with dignity and comfort in their own homes. We offer flexible shifts, including 12-hour and 24-hour care, tailored to the specific needs of the patient and family.',
    conditions: [
      {
        id: 'caretaker-cond-1',
        name: 'Elderly Personal Hygiene',
        slug: 'elderly-hygiene-care',
        description: 'Assisting senior citizens with daily tasks like bathing, dressing, grooming, and maintaining personal dignity.',
        imageUrl: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&q=85&w=1600',
        imageHint: 'elderly personal hygiene assistance',
        symptoms: ['Difficulty bathing', 'Inability to dress self', 'Poor grooming', 'Need for assistance'],
        treatmentDetails: 'Help with sponge baths/showers, oral hygiene, hair care, dressing assistance, and diaper changes if required.',
        benefits: ['Improved self-esteem', 'Prevention of skin infections', 'Comfort and freshness'],
        whoShouldOpt: ['Seniors with limited mobility', 'Patients recovering from surgery', 'Individuals with frailty'],
        faqs: []
      },
      {
        id: 'caretaker-cond-2',
        name: 'Mobility & Fall Prevention',
        slug: 'mobility-support-care',
        description: 'Safe handling and transfer techniques to help patients move around their home without the risk of falling.',
        imageUrl: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&q=85&w=1600',
        imageHint: 'elderly mobility assistance and transfer support',
        symptoms: ['Fear of falling', 'Unsteady gait', 'Need for walking aids', 'Bed-to-chair transfers'],
        treatmentDetails: 'Assisted walking, wheelchair transfers, passive limb movements as prescribed by physios, and fall-risk monitoring.',
        benefits: ['Reduced risk of fractures', 'Increased confidence to move', 'Safe transitions'],
        whoShouldOpt: ['Post-hip replacement patients', 'Parkinsons patients', 'Frail elderly'],
        faqs: []
      },
      {
        id: 'caretaker-cond-3',
        name: 'Bedridden & Post-Op Support',
        slug: 'bedridden-patient-care',
        description: 'Dedicated support for patients confined to bed, focusing on comfort, nutrition, and skin integrity.',
        imageUrl: 'https://images.unsplash.com/photo-1576765608535-5f04c18459e4?auto=format&fit=crop&q=85&w=1600',
        imageHint: 'bedridden patient compassionate care',
        symptoms: ['Paralysis', 'Comatose state', 'Severe mobility loss', 'Post-major surgery'],
        treatmentDetails: 'Regular positioning to prevent sores, feeding assistance, diaper management, and basic exercise support.',
        benefits: ['Prevention of bedsores', 'Better nutritional intake', 'Enhanced physical comfort'],
        whoShouldOpt: ['Stroke survivors', 'Paralyzed individuals', 'Patients in recovery phases'],
        faqs: []
      }
    ]
  },
  {
    id: '6',
    name: 'Speech Therapy',
    slug: 'speech-therapy',
    description: 'Expert intervention for speech, language, communication, and swallowing disorders.',
    icon: Mic2,
    longDescription: 'Speech-Language Pathology (SLP) at Aries PhysioCare focuses on restoring the vital human connection of communication and the essential function of swallowing. Our specialists work with children and adults to overcome challenges ranging from developmental speech delays and stuttering to post-stroke aphasia and cognitive-communication disorders, providing evidence-based therapy in the comfort of your home.',
    conditions: [
      {
        id: 'speech-cond-1',
        name: 'Pediatric Language Delay',
        slug: 'pediatric-speech-delay',
        description: 'Helping children bridge the gap in their expressive and receptive language skills through playful, structured clinical intervention.',
        imageUrl: 'https://images.unsplash.com/photo-1543881062-8e1f5798aee8?auto=format&fit=crop&q=85&w=1600',
        imageHint: 'pediatric speech and language articulation therapy',
        symptoms: ['Delayed first words', 'Limited vocabulary', 'Difficulty following instructions', 'Unclear pronunciation'],
        treatmentDetails: 'Language-rich play, phonological awareness exercises, and parent coaching to integrate therapy into daily routines.',
        benefits: ['Improved school readiness', 'Enhanced social interaction', 'Reduced frustration for child and parent'],
        whoShouldOpt: ['Toddlers with late-talking', 'Preschoolers with language gaps', 'Children struggling with articulation'],
        faqs: []
      },
      {
        id: 'speech-cond-2',
        name: 'Autism & Social Communication',
        slug: 'autism-speech-therapy',
        description: 'Specialized focus on pragmatic language, social cues, and alternative communication for individuals on the spectrum.',
        imageUrl: 'https://images.unsplash.com/photo-1519238263530-990ffce6e4b8?auto=format&fit=crop&q=85&w=1600',
        imageHint: 'social communication and pragmatic speech therapy',
        symptoms: ['Poor eye contact', 'Difficulty with turn-taking', 'Literal interpretation of language', 'Social isolation'],
        treatmentDetails: 'Social stories, visual supports (PECS), functional communication training, and peer-interaction modeling.',
        benefits: ['Meaningful social connections', 'Enhanced emotional expression', 'Improved functional independence'],
        whoShouldOpt: ['Children/Adults with ASD', 'Individuals with social anxiety', 'Patients with pragmatic language disorders'],
        faqs: []
      },
      {
        id: 'speech-cond-3',
        name: 'Post-Stroke Aphasia Rehab',
        slug: 'aphasia-rehabilitation',
        description: 'Intensive therapy to regain speech and language comprehension following a stroke or traumatic brain injury.',
        imageUrl: 'https://images.unsplash.com/photo-1576765608535-5f04c18459e4?auto=format&fit=crop&q=85&w=1600',
        imageHint: 'aphasia recovery and adult speech rehabilitation',
        symptoms: ['Difficulty finding words', 'Slurred speech (Dysarthria)', 'Loss of reading/writing skills', 'Impaired comprehension'],
        treatmentDetails: 'Melodic Intonation Therapy, Constraint-Induced Language Therapy, and cognitive-linguistic retraining.',
        benefits: ['Restored ability to communicate needs', 'Improved quality of life', 'Enhanced cognitive function'],
        whoShouldOpt: ['Stroke survivors', 'Patients with TBI', 'Individuals with Brain Tumors'],
        faqs: []
      },
      {
        id: 'speech-cond-4',
        name: 'Stuttering & Fluency Disorders',
        slug: 'fluency-speech-therapy',
        description: 'Clinical techniques to improve speech flow and reduce the physical and emotional impact of stuttering.',
        imageUrl: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&q=85&w=1600',
        imageHint: 'fluency shaping and speech confidence therapy',
        symptoms: ['Repetition of sounds', 'Prolongations/Blocks', 'Facial tension during speech', 'Avoidance of speaking'],
        treatmentDetails: 'Breath control techniques, easy-onset speech, and desensitization therapy to build speaking confidence.',
        benefits: ['Fluid speech production', 'Increased social confidence', 'Reduced anxiety around speaking'],
        whoShouldOpt: ['Children with developmental stuttering', 'Adults with chronic fluency issues', 'Teenagers seeking speech confidence'],
        faqs: []
      },
      {
        id: 'speech-cond-5',
        name: 'Swallowing Disorders (Dysphagia)',
        slug: 'dysphagia-therapy',
        description: 'Vital clinical intervention to ensure safe swallowing and prevent aspiration in patients with neurological or structural issues.',
        imageUrl: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&q=85&w=1600',
        imageHint: 'dysphagia swallowing therapy and safety rehabilitation',
        symptoms: ['Coughing during meals', 'Feeling of food stuck in throat', 'Recurrent pneumonia', 'Unexplained weight loss'],
        treatmentDetails: 'Oral-motor exercises, dietary texture modification, and therapeutic swallowing maneuvers (e.g., Mendelsohn Maneuver).',
        benefits: ['Prevention of aspiration pneumonia', 'Improved nutritional intake', 'Enhanced safety during meals'],
        whoShouldOpt: ['Post-stroke patients', 'Individuals with Parkinsons/Dementia', 'Patients recovering from throat surgery'],
        faqs: []
      }
    ]
  },
];

// Legacy static placeholder blog posts (with fake "Full long-form content..."
// bodies) have been removed — P2-09. The website now only shows real,
// backend-sourced posts from the Growth Engine CMS feed (see
// src/lib/growth-blog-posts.ts and src/app/blogs/page.tsx).

export const faqs: Faq[] = [
  { id: '1', question: 'What services do you offer?', answer: 'We offer Physiotherapy, Occupational Therapy, Nursing Care, and more.' }
];

export const Countries = [
  {
    name: "India",
    slug: "india",
    isActive: true,
    seoEnabled: true,
    states: IndianStates,
  }
];

export const getServiceBySlug = (slug: string) => services.find(s => s.slug === slug);
export const getConditionBySlug = (service: Service, slug: string) => service.conditions.find(c => c.slug === slug);
export const getSymptomBySlug = (slug: string) => symptomList.find(s => toSlug(s) === slug);
export const getDetailedSymptomBySlug = (slug: string): SymptomDetail | null => {
  const name = symptomList.find(s => toSlug(s) === slug);
  if (!name) return null;
  return getSymptomClinicalInfo(name);
};
export const getDetailedTherapyBySlug = (slug: string): TherapyDetail | null => {
  const name = therapyList.find(t => toSlug(t) === slug);
  if (!name) return null;
  return getTherapyClinicalInfo(name);
};
export const getTherapyBySlug = (slug: string) => therapyList.find(t => toSlug(t) === slug);

export function getGeoPath(path: string[]): GeoPath | null {
  let geoPath: GeoPath = { country: null, state: null, city: null, area: null, subArea: null };

  if (!path || path.length === 0) return null;

  let searchPath = [...path];
  const countryMatch = Countries.find(c => c.slug === searchPath[0]);
  if (countryMatch) {
    geoPath.country = countryMatch;
    searchPath.shift();
  } else {
    geoPath.country = Countries[0];
  }

  if (searchPath.length === 0) return geoPath;

  const stateMatch = IndianStates.find(s => s.slug === searchPath[0]);
  if (stateMatch) {
    geoPath.state = stateMatch;
    if (searchPath[1]) {
      const city = stateMatch.cities.find((c: any) => c.slug === searchPath[1]);
      if (city) {
        geoPath.city = city;
        if (searchPath[2]) {
          const area = city.areas.find((a: any) => a.slug === searchPath[2]);
          if (area) {
            geoPath.area = area;
            if (searchPath[3]) {
              const subArea = area.subAreas?.find((sa: any) => sa.slug === searchPath[3]);
              if (subArea) geoPath.subArea = subArea;
            }
          }
        }
      }
    }
    return geoPath;
  }

  return null;
}
