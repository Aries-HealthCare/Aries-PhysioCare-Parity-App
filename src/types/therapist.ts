export interface TherapistCard {
    id: string;
    slug: string;
    name: string;
    qualification: string;
    specialization: string;
    experience: string;
    city: string;
    state: string;
    areas: string[];
    rating: number;
    reviewCount: number;
    imageUrl: string;
    isAvailable: boolean;
    languages: string[];
    services: string[];
    bio: string;
    isVerified: boolean;
    education: string[];
    feedback: Array<{
        rating: number;
        comment: string;
        user: string;
    }>;
}
