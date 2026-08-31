export interface ClinicDoctor {
  name: string;
  qualification: string;
  specialization: string;
  experience: string;
  timings: string;
  imageUrl: string;
}

export interface ClinicPackage {
  duration: string;
  perSession: string;
  totalPrice: string;
  savings: string;
  isPopular?: boolean;
}

export interface ClinicBranch {
  id: string;
  slug: string;
  name: string;
  badge?: string;
  isFlagship?: boolean;
  tagline: string;
  address: string;
  subArea: string;
  city: string;
  state: string;
  pincode: string;
  phone: string;
  phones: string[];
  whatsapp: string;
  googleRating: number;
  reviewCount: number;
  googleMapsUrl: string;
  googleMapsEmbedUrl?: string;
  workingHours: string;
  daysOpen: string;
  imageUrl: string;
  galleryImages: string[];
  specialties: string[];
  amenities: string[];
  equipment: string[];
  doctors: ClinicDoctor[];
  consultationFee: string;
  regularSessionFee: string;
  packages: ClinicPackage[];
  pricingNotice: string;
  description: string;
}

export const ARIES_CLINICS_DIRECTORY: ClinicBranch[] = [
  {
    id: "clinic-borivali-flagship",
    slug: "aries-physiocare-expert-physiotherapy-wellness-center-borivali",
    name: "Aries PhysioCare : Expert Physiotherapy Center | Integrated Wellness Center",
    badge: "Official Clinic Center",
    isFlagship: true,
    tagline: "The Healing Touch · Hospital-Grade Integrated Physiotherapy & Advanced Clinical Wellness",
    address: "Shop No. 7, Parrk Riviera, New MHB Colony, Opp. Gorai Bridge / Don Bosco Road, Borivali West, Mumbai, Maharashtra 400091",
    subArea: "Borivali West",
    city: "Mumbai",
    state: "Maharashtra",
    pincode: "400091",
    phone: "+91 9136447006",
    phones: ["+91 9136447006", "+91 9372681410", "+91 8591981880"],
    whatsapp: "918591981880",
    googleRating: 4.9,
    reviewCount: 285,
    googleMapsUrl: "https://share.google/rOlEnKQabSdOV2fpf",
    workingHours: "8:00 AM – 9:30 PM",
    daysOpen: "Monday – Sunday (365 Days Open)",
    imageUrl: "https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&q=85&w=1600",
    galleryImages: [
      "https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&q=85&w=1600",
      "https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&q=85&w=1600",
      "https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&q=85&w=1600",
      "https://images.unsplash.com/photo-1519823551278-64ac92734fb1?auto=format&fit=crop&q=85&w=1600",
    ],
    specialties: [
      "Orthopedic & Joint Mobilization",
      "Neurological Stroke Rehabilitation",
      "Spine Decompression & Sciatica Care",
      "Sports Injury Conditioning",
      "Geriatric Balance & Fall Prevention",
      "Post-Surgical TKR/THR Rehab",
      "Women's Health & Pelvic Floor",
      "Pediatric Neuro-Development",
    ],
    amenities: [
      "Air-Conditioned Private Treatment Cabins",
      "Wheelchair Accessible Ground Floor",
      "Free High-Speed Wi-Fi & Lounge",
      "Dedicated Parking Available",
      "Digital Gait Analysis Lab",
      "Emergency Medical Oxygen & Vitals Kit",
      "Digital Invoicing & Insurance Support",
      "In-House High-End Modalities",
    ],
    equipment: [
      "High-Intensity Class IV Laser Therapy Unit",
      "Multi-Channel Interferential Therapy (IFT)",
      "High-Frequency Therapeutic Ultrasound (1 & 3 MHz)",
      "Continuous Passive Motion (CPM) Knee Unit",
      "Lumbar & Cervical Electronic Traction Bed",
      "Pneumatic Deep Tissue Massager & Recovery Boots",
      "Digital Muscle Stimulator (TENS / Russian)",
      "Dynamic Balance & Stability Platform",
    ],
    doctors: [
      {
        name: "Dr. Hitali Sankhe, PT",
        qualification: "BPT, MIAP · Expert Physiotherapist",
        specialization: "Orthopedic & Neurological Rehabilitation Specialist",
        experience: "Expert Physiotherapist",
        timings: "9:00 AM – 1:00 PM",
        imageUrl: "/images/aries-emblem.png",
      },
      {
        name: "Dr. Anu Desai, PT",
        qualification: "BPT, MIAP · Senior Consultant Physiotherapist",
        specialization: "Senior Clinical Advisor & Comprehensive Rehabilitation",
        experience: "50+ Years Experience",
        timings: "1:00 PM – 4:00 PM",
        imageUrl: "https://aries-physiohealthcare.s3.ap-south-1.amazonaws.com/1757059872029.jpg",
      },
      {
        name: "Dr. Pallavi Sharma, PT",
        qualification: "BPT, MIAP · Expert Physiotherapist",
        specialization: "Spine Care, Joint Mobilization & Pain Management Specialist",
        experience: "Expert Physiotherapist",
        timings: "4:00 PM – 9:00 PM",
        imageUrl: "/images/aries-emblem.png",
      },
    ],
    consultationFee: "₹ 800/-",
    regularSessionFee: "₹ 800/- per session",
    packages: [
      {
        duration: "10 Days",
        perSession: "₹ 750 / session",
        totalPrice: "₹ 7,500/-",
        savings: "Save ₹ 500/-",
      },
      {
        duration: "15 Days",
        perSession: "₹ 700 / session",
        totalPrice: "₹ 10,500/-",
        savings: "Save ₹ 1,500/-",
        isPopular: true,
      },
      {
        duration: "30 Days",
        perSession: "₹ 650 / session",
        totalPrice: "₹ 19,500/-",
        savings: "Save ₹ 4,500/-",
      },
    ],
    pricingNotice: "Bargaining is not permitted. If there are any offers or discounts available, they will be clearly advertised or displayed on our board.",
    description: "Aries PhysioCare Center in New MHB Colony, Borivali West is our premier physical clinic and clinical wellness hub. Equipped with world-class electrotherapy modalities, private therapy suites, and senior hospital-trained specialists, we provide personalized healing for acute and chronic musculoskeletal, neurological, and post-operative conditions.",
  },
];
