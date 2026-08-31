export type TeleTherapist = {
  id: string;
  name: string;
  qualification: string;
  experience: string;
  specialization: string;
  imageUrl: string;
  isAvailable: boolean;
};

export type IntakeFormValues = {
  fullName: string;
  age: number;
  gender: 'male' | 'female' | 'other';
  address: string;
  mobile: string;
  email: string;
  condition: string;
  files?: FileList;
};
