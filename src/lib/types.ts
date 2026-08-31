import { LucideIcon } from "lucide-react";

export type Service = {
  id: string;
  name: string;
  description: string;
  slug: string;
  longDescription: string;
  icon?: LucideIcon;
  conditions: Condition[];
};

export type Speciality = {
  id: string;
  name: string;
  description: string;
};

export type Therapist = {
  id: string;
  slug?: string;
  name: string;
  qualification: string;
  experience: string;
  imageUrl: string;
  imageHint: string;
};

export type Location = {
  id: string;
  city: string;
  address: string;
  phone: string;
  timings: string;
  mapImageUrl: string;
  mapImageHint: string;
};

export type BlogPost = {
  id: string;
  slug: string;
  title: string;
  summary: string;
  content: string;
  imageUrl: string;
  imageHint: string;
  author: string;
  date: string;
  serviceTag: string;
  relatedServiceSlug: string;
  readTime: string;
  keywords: string;
};

export type Faq = {
  id: string;
  question: string;
  answer: string;
};

export type Condition = {
  id: string;
  name: string;
  slug: string;
  description: string;
  imageUrl: string;
  imageHint: string;
  symptoms: string[];
  treatmentDetails: string;
  benefits: string[];
  whoShouldOpt: string[];
  faqs: Faq[];
};

export type SymptomDetail = {
  name: string;
  slug: string;
  description: string;
  longDescription: string;
  causes: string[];
  riskFactors: string[];
  whenToSeeDoctor: string;
  emergencySigns?: string;
  diagnosis: string;
  treatments: string[];
  benefits: string[];
  faqs: Faq[];
  imageUrl: string;
  imageHint: string;
};

export type TherapyDetail = {
  name: string;
  slug: string;
  description: string;
  howItWorks: string;
  benefits: string[];
  conditionsTreated: string[];
  techniques: string[];
  whoShouldOpt: string[];
  faqs: Faq[];
  imageUrl: string;
  imageHint: string;
};

export type SubArea = {
  name: string;
  slug: string;
  isActive: boolean;
  seoEnabled: boolean;
}

export type Area = {
  name: string;
  slug: string;
  isActive: boolean;
  seoEnabled: boolean;
  subAreas?: IndianSubAreaType[];
}

export type City = {
  name: string;
  slug: string;
  isActive: boolean;
  seoEnabled: boolean;
  areas: IndianAreaType[];
}

export type State = {
  name: string;
  slug: string;
  isActive: boolean;
  seoEnabled: boolean;
  cities: City[];
}

export type Country = {
  name: string;
  slug: string;
  isActive: boolean;
  seoEnabled: boolean;
  states: State[];
}

export type GeoPath = {
  country: Country | null;
  state: State | null;
  city: City | null;
  area: Area | null;
  subArea?: SubArea | null;
};

import { IndianAreaType, IndianSubAreaType } from './locations';
