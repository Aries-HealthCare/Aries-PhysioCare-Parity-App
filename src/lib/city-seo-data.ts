/**
 * City-Specific SEO Data for Aries PhysioCare
 * Used to generate rich, unique landing pages for each city.
 */
export interface CityArea {
    name: string;
    slug: string;
}

export interface CityFaq {
    question: string;
    answer: string;
}

export interface CitySeoData {
    cityName: string;
    stateName: string;
    citySlug: string;
    stateSlug: string;
    pageSlug: string;           // e.g. "physiotherapy-in-mumbai"
    metaTitle: string;
    metaDescription: string;
    keywords: string[];
    heroHeading: string;
    heroSubheading: string;
    localIntro: string;          // unique paragraph about the city context
    whySection: string;
    stats: { label: string; value: string }[];
    popularAreas: CityArea[];
    conditions: string[];
    faqs: CityFaq[];
    canonicalUrl: string;
}

const BASE = 'https://www.ariesphysiocare.com';

export const citySeoPages: CitySeoData[] = [
    // ─────────────────────── MUMBAI ───────────────────────
    {
        cityName: 'Mumbai',
        stateName: 'Maharashtra',
        citySlug: 'mumbai',
        stateSlug: 'maharashtra',
        pageSlug: 'physiotherapy-in-mumbai',
        metaTitle: 'Best Home Physiotherapy in Mumbai | Expert Physio at Doorstep | Aries PhysioCare',
        metaDescription: 'Top-rated home physiotherapy in Mumbai. Certified physio experts available in Andheri, Bandra, Thane, Kandivali & all areas. Book same-day appointment. Call +91 9136447006.',
        keywords: ['physiotherapy in mumbai', 'home physiotherapy mumbai', 'physiotherapist near me mumbai', 'best physiotherapist mumbai', 'physio at home mumbai', 'physiotherapy bandra', 'physiotherapy andheri'],
        heroHeading: 'Expert Home Physiotherapy in Mumbai',
        heroSubheading: 'Hospital-grade physiotherapy delivered to your home anywhere in Mumbai. Same-day slots available.',
        localIntro: 'Mumbai is India\'s most dynamic city — but its relentless pace takes a toll on the body. From office-going professionals in BKC and Nariman Point dealing with tech-neck and postural strain, to senior citizens in Borivali and Mulund managing age-related mobility issues — the demand for expert physiotherapy at home is greater than ever. Aries PhysioCare operates across all 48 wards of Mumbai, ensuring you get certified clinical care without the exhausting commute.',
        whySection: 'With over 350+ sessions conducted monthly across Mumbai alone, Aries PhysioCare is the most trusted home physiotherapy brand in the city. Our therapists are trained at leading Mumbai hospitals and bring the same clinical standard to your home.',
        stats: [
            { label: 'Active Therapists in Mumbai', value: '80+' },
            { label: 'Areas Covered', value: '48+' },
            { label: 'Sessions This Month', value: '350+' },
            { label: 'Avg. Patient Rating', value: '4.9★' },
        ],
        popularAreas: [
            { name: 'Andheri West', slug: 'andheri-west' },
            { name: 'Bandra West', slug: 'bandra-west' },
            { name: 'Kandivali West', slug: 'kandivali-west' },
            { name: 'Colaba', slug: 'colaba' },
            { name: 'Dadar', slug: 'dadar' },
            { name: 'Borivali', slug: 'borivali' },
            { name: 'Malad', slug: 'malad' },
            { name: 'Goregaon', slug: 'goregaon' },
            { name: 'Juhu', slug: 'juhu' },
            { name: 'Vile Parle', slug: 'vile-parle' },
            { name: 'Mulund', slug: 'mulund' },
            { name: 'Ghatkopar', slug: 'ghatkopar' },
        ],
        conditions: ['Lower Back Pain', 'Knee Pain', 'Post-TKR Rehab', 'Cervical Spondylosis', 'Frozen Shoulder', 'Sciatica', 'Stroke Rehab', 'Parkinson\'s Care'],
        faqs: [
            { question: 'How quickly can a physiotherapist reach my home in Mumbai?', answer: 'For most areas in Mumbai, we can arrange a same-day appointment. For early morning or weekend slots, we recommend booking at least 12 hours in advance. Call +91 9136447006 for the fastest booking.' },
            { question: 'Do you cover areas like Navi Mumbai and Thane?', answer: 'Yes! Our services extend across Greater Mumbai, Navi Mumbai, and Thane. Please mention your specific pincode while booking and we\'ll confirm availability.' },
            { question: 'What does a typical home physiotherapy session cost in Mumbai?', answer: 'Our session pricing starts from ₹800 per session depending on the service type and package. We also offer discounted recovery packages. Call us for an exact quote for your condition.' },
            { question: 'Are your Mumbai physiotherapists all BPT/MPT qualified?', answer: 'Absolutely. Every Aries therapist serving Mumbai holds a minimum of a BPT degree from a recognized institute and is registered with the Indian Association of Physiotherapists (IAP). Many hold MPT degrees from KEM, TNMC, and other leading Mumbai hospitals.' },
            { question: 'Can I get physiotherapy at home after surgery in Mumbai?', answer: 'Yes, post-surgical home physiotherapy is one of our most sought-after services in Mumbai. We specialize in post-TKR, post-THR, ACL, and spine surgery rehabilitation and coordinate with your surgeon if required.' },
        ],
        canonicalUrl: `${BASE}/physiotherapy-in-mumbai`,
    },

    // ─────────────────────── PUNE ───────────────────────
    {
        cityName: 'Pune',
        stateName: 'Maharashtra',
        citySlug: 'pune',
        stateSlug: 'maharashtra',
        pageSlug: 'physiotherapy-in-pune',
        metaTitle: 'Best Home Physiotherapy in Pune | Expert Physio at Doorstep | Aries PhysioCare',
        metaDescription: 'Expert home physiotherapy in Pune. Certified physiotherapists available in Hinjewadi, Baner, Kothrud, Hadapsar & all areas. Book same-day. Call +91 9136447006.',
        keywords: ['physiotherapy in pune', 'home physiotherapy pune', 'physiotherapist near me pune', 'physio at home pune', 'physiotherapy hinjewadi', 'physiotherapy baner', 'physiotherapy kothrud'],
        heroHeading: 'Expert Home Physiotherapy in Pune',
        heroSubheading: 'Certified physiotherapy specialists available across all Pune localities. Book in minutes.',
        localIntro: 'Pune\'s rapidly growing IT corridor from Hinjewadi to Kharadi has created a generation of young professionals who spend 10+ hours at a desk. Combined with Pune\'s love for fitness activities like cycling, trekking, and running, musculoskeletal injuries and postural disorders are at an all-time high. Aries PhysioCare brings expert clinical care directly to homes in Baner, Aundh, Viman Nagar, Hadapsar, Kothrud, and 50+ other localities — so recovery never disrupts your day.',
        whySection: 'Aries PhysioCare has served Pune since 2021 and has grown to a team of 60+ therapists covering every corner of the city. Our deep expertise in sports injury recovery makes us Pune\'s go-to choice for athletes and tech professionals alike.',
        stats: [
            { label: 'Active Therapists in Pune', value: '60+' },
            { label: 'Areas Covered', value: '50+' },
            { label: 'Sessions This Month', value: '220+' },
            { label: 'Avg. Patient Rating', value: '4.8★' },
        ],
        popularAreas: [
            { name: 'Hinjewadi', slug: 'hinjewadi' },
            { name: 'Baner', slug: 'baner' },
            { name: 'Kothrud', slug: 'kothrud' },
            { name: 'Aundh', slug: 'aundh' },
            { name: 'Viman Nagar', slug: 'viman-nagar' },
            { name: 'Hadapsar', slug: 'hadapsar' },
            { name: 'Koregaon Park', slug: 'koregaon-park' },
            { name: 'Wakad', slug: 'wakad' },
            { name: 'Kharadi', slug: 'kharadi' },
            { name: 'Kondhwa', slug: 'kondhwa' },
            { name: 'Chinchwad', slug: 'chinchwad' },
            { name: 'Shivajinagar', slug: 'shivajinagar' },
        ],
        conditions: ['Lower Back Pain', 'Knee Pain', 'Sports Injuries', 'Cervical Spondylosis', 'Shoulder Pain', 'Post-Surgery Rehab', 'Sciatica', 'IT-Related Strain'],
        faqs: [
            { question: 'Do you cover IT parks like Hinjewadi Phase 1, 2, 3?', answer: 'Yes, we have therapists specifically covering the Hinjewadi IT park area including all phases. We also do corporate wellness visits for offices. Contact us to schedule.' },
            { question: 'Is home physiotherapy available in Pimpri-Chinchwad?', answer: 'Yes, Pimpri-Chinchwad, Akurdi, Nigdi, and Bhosari are all covered under our Pune network. The same quality standard applies across all areas.' },
            { question: 'Can you help with posture correction for IT professionals in Pune?', answer: 'Absolutely — posture correction and ergonomics assessment are among our most popular services for Pune\'s IT workforce. We provide a full biomechanical assessment and corrective exercise plan.' },
            { question: 'Do you offer physiotherapy for runners and cyclists in Pune?', answer: 'Yes! Sports physiotherapy for runners, cyclists, and trekkers is one of our core strengths in Pune. We do gait analysis, return-to-sport programs, and injury prevention assessments.' },
            { question: 'How do I book a physiotherapist in Pune?', answer: 'Call +91 9136447006, WhatsApp +91 9372681410, or use the Book Appointment button above. Mention your area and condition and we\'ll arrange a same-day or next-day slot.' },
        ],
        canonicalUrl: `${BASE}/physiotherapy-in-pune`,
    },

    // ─────────────────────── BANGALORE ───────────────────────
    {
        cityName: 'Bengaluru',
        stateName: 'Karnataka',
        citySlug: 'bengaluru',
        stateSlug: 'karnataka',
        pageSlug: 'physiotherapy-in-bangalore',
        metaTitle: 'Best Home Physiotherapy in Bangalore | Expert Physio at Home | Aries PhysioCare',
        metaDescription: 'Expert home physiotherapy in Bangalore. Certified physio specialists in Whitefield, Indiranagar, HSR Layout, Koramangala & all areas. Same-day appointments. Call +91 9136447006.',
        keywords: ['physiotherapy in bangalore', 'home physiotherapy bangalore', 'physiotherapist near me bangalore', 'physio at home bangalore', 'physiotherapy whitefield', 'physiotherapy koramangala', 'physiotherapy indiranagar'],
        heroHeading: 'Expert Home Physiotherapy in Bangalore',
        heroSubheading: 'Certified physiotherapy delivered at your doorstep anywhere in Bengaluru. Same-day slots.',
        localIntro: 'Bengaluru, the Silicon Valley of India, is home to millions of tech professionals whose sedentary workstyles make them highly susceptible to postural disorders, repetitive strain injuries, and musculoskeletal pain. From the bustling corridors of Whitefield and Electronic City to the trendy lifestyle of Indiranagar and Koramangala — Aries PhysioCare brings world-class clinical physiotherapy to your home without the Bengaluru traffic hassle.',
        whySection: 'Our Bengaluru network includes 70+ specialized therapists who understand the lifestyle demands of the city. Whether you\'re a startup founder in HSR Layout or a senior professional in Jayanagar, we match you with the right specialist for your condition.',
        stats: [
            { label: 'Active Therapists in Bengaluru', value: '70+' },
            { label: 'Areas Covered', value: '60+' },
            { label: 'Sessions This Month', value: '280+' },
            { label: 'Avg. Patient Rating', value: '4.9★' },
        ],
        popularAreas: [
            { name: 'Whitefield', slug: 'whitefield' },
            { name: 'Indiranagar', slug: 'indiranagar' },
            { name: 'Koramangala', slug: 'koramangala-5th-block' },
            { name: 'HSR Layout', slug: 'hsr-layout' },
            { name: 'Jayanagar', slug: 'jayanagar' },
            { name: 'Electronic City', slug: 'electronic-city-phase-1' },
            { name: 'Marathahalli', slug: 'marathahalli' },
            { name: 'Hebbal', slug: 'hebbal' },
            { name: 'Sarjapur Road', slug: 'sarjapur-road' },
            { name: 'BTM Layout', slug: 'btm-layout' },
            { name: 'Banashankari', slug: 'banashankari' },
            { name: 'Rajajinagar', slug: 'rajajinagar' },
        ],
        conditions: ['Back Pain', 'Neck Pain', 'Knee Arthritis', 'Sports Injuries', 'Sciatica', 'Frozen Shoulder', 'Neuro Rehab', 'Post-Surgery Care'],
        faqs: [
            { question: 'Is home physiotherapy available in Whitefield and ITPL areas of Bangalore?', answer: 'Yes, Whitefield, ITPL, Brookefield, and Varthur are all covered. We have dedicated therapists for the East Bengaluru IT corridor.' },
            { question: 'Do you serve Electronic City and Sarjapur Road?', answer: 'Absolutely. Both Electronic City Phase 1 & 2 and the entire Sarjapur Road stretch are covered under our South Bengaluru network.' },
            { question: 'How soon can a physiotherapist arrive in Bangalore?', answer: 'In most Bengaluru areas, we can arrange a same-day appointment. For peak hours, expect 2-4 hour booking time. WhatsApp us at +91 9372681410 for the fastest slot.' },
            { question: 'Do you offer corporate physiotherapy visits in Bengaluru tech parks?', answer: 'Yes! We conduct regular corporate wellness programs at offices in ITPL, Manyata Tech Park, Prestige Tech Park, and other locations. Contact us for group packages.' },
            { question: 'Can you treat sports injuries from marathon running or gym workouts in Bangalore?', answer: 'Sports injury rehabilitation is a strength of our Bengaluru team. We work with runners, CrossFit athletes, and gym-goers for everything from acute sprains to chronic overuse injuries.' },
        ],
        canonicalUrl: `${BASE}/physiotherapy-in-bangalore`,
    },

    // ─────────────────────── DELHI ───────────────────────
    {
        cityName: 'Delhi',
        stateName: 'Delhi NCR',
        citySlug: 'delhi',
        stateSlug: 'delhi',
        pageSlug: 'physiotherapy-in-delhi',
        metaTitle: 'Best Home Physiotherapy in Delhi & NCR | Expert Physio at Home | Aries PhysioCare',
        metaDescription: 'Expert home physiotherapy in Delhi NCR. Certified physio specialists in South Delhi, Noida, Gurgaon, Dwarka & all areas. Same-day appointments. Call +91 9136447006.',
        keywords: ['physiotherapy in delhi', 'home physiotherapy delhi', 'physiotherapist near me delhi', 'physio at home delhi ncr', 'physiotherapy south delhi', 'physiotherapy noida', 'physiotherapy gurgaon'],
        heroHeading: 'Expert Home Physiotherapy in Delhi & NCR',
        heroSubheading: 'Certified physiotherapy specialists covering all of Delhi NCR — from South Delhi to Noida, Gurgaon, and beyond.',
        localIntro: 'Delhi NCR, India\'s capital region, is a vast urban sprawl where long commutes and sedentary desk jobs have made musculoskeletal disorders one of the most common health complaints. From South Delhi\'s established residential zones to the corporate hubs of Gurgaon and the IT townships of Noida, Aries PhysioCare\'s expert network brings certified clinical physiotherapy directly to your home — eliminating the need to navigate Delhi\'s notorious traffic for your recovery.',
        whySection: 'With a growing team of 65+ therapists across Delhi NCR, we bring the same clinical rigour you\'d find in a top AIIMS-affiliated clinic directly to your home. Our therapists are trained to handle complex post-operative and neurological cases with precision.',
        stats: [
            { label: 'Active Therapists in Delhi NCR', value: '65+' },
            { label: 'Areas Covered', value: '70+' },
            { label: 'Sessions This Month', value: '240+' },
            { label: 'Avg. Patient Rating', value: '4.8★' },
        ],
        popularAreas: [
            { name: 'South Delhi', slug: 'south-delhi' },
            { name: 'Connaught Place', slug: 'connaught-place' },
            { name: 'Karol Bagh', slug: 'karol-bagh' },
            { name: 'Dwarka', slug: 'dwarka-sector-1' },
            { name: 'Rohini', slug: 'rohini-sector-1' },
            { name: 'Lajpat Nagar', slug: 'lajpat-nagar-1' },
            { name: 'Greater Kailash', slug: 'greater-kailash-1' },
            { name: 'Vasant Kunj', slug: 'vasant-kunj' },
            { name: 'Saket', slug: 'saket' },
            { name: 'Hauz Khas', slug: 'hauz-khas' },
            { name: 'Janakpuri', slug: 'janakpuri' },
            { name: 'Pitampura', slug: 'pitampura' },
        ],
        conditions: ['Lower Back Pain', 'Knee Pain', 'Post-Surgery Rehab', 'Cervical Spondylosis', 'Elderly Care', 'Stroke Rehab', 'Sports Injury', 'Disc Herniation'],
        faqs: [
            { question: 'Do you cover South Delhi areas like Hauz Khas, Greater Kailash, and Vasant Kunj?', answer: 'Yes, South Delhi is one of our most active zones. All areas including Hauz Khas, GK1, GK2, Vasant Vihar, Saket, Defence Colony, and Lajpat Nagar are covered.' },
            { question: 'Is physiotherapy at home available in Noida and Gurgaon?', answer: 'Yes, we cover Noida (Sectors 1-150+) and Gurgaon (all DLF phases, Sohna Road, Golf Course Road). Please specify your sector/locality while booking.' },
            { question: 'Can elderly patients with limited mobility get physiotherapy at home in Delhi?', answer: 'Geriatric home physiotherapy is one of our most popular services in Delhi. We specialize in fall prevention, balance training, and mobility restoration for senior citizens in the comfort of their own homes.' },
            { question: 'Do you provide physiotherapy after joint replacement surgery in Delhi?', answer: 'Yes, we are highly experienced in post-TKR and THR home rehabilitation. We coordinate with leading Delhi hospitals like AIIMS, Fortis, and Max to provide seamless post-operative care.' },
            { question: 'How do I book a home physio in Delhi?', answer: 'Call +91 9136447006 or WhatsApp +91 9372681410. Mention your area, condition, and preferred time. We confirm within 1-2 hours for most Delhi locations.' },
        ],
        canonicalUrl: `${BASE}/physiotherapy-in-delhi`,
    },

    // ─────────────────────── CHENNAI ───────────────────────
    {
        cityName: 'Chennai',
        stateName: 'Tamil Nadu',
        citySlug: 'chennai',
        stateSlug: 'tamil-nadu',
        pageSlug: 'physiotherapy-in-chennai',
        metaTitle: 'Best Home Physiotherapy in Chennai | Expert Physio at Home | Aries PhysioCare',
        metaDescription: 'Expert home physiotherapy in Chennai. Certified physio specialists in Anna Nagar, Velachery, Adyar, OMR & all areas. Same-day appointments. Call +91 9136447006.',
        keywords: ['physiotherapy in chennai', 'home physiotherapy chennai', 'physiotherapist near me chennai', 'physio at home chennai', 'physiotherapy anna nagar', 'physiotherapy velachery', 'physiotherapy adyar'],
        heroHeading: 'Expert Home Physiotherapy in Chennai',
        heroSubheading: 'Certified physiotherapy care at your doorstep — covering all of Chennai from Anna Nagar to OMR.',
        localIntro: 'Chennai, Tamil Nadu\'s bustling capital, is home to a large population engaged in manufacturing, IT services, and healthcare sectors. The city\'s growing IT corridor on OMR and the dense residential areas of Anna Nagar, Velachery, and Adyar all have a high demand for quality home physiotherapy. Aries PhysioCare brings certified clinical expertise to your doorstep across all Chennai zones, with Tamil-speaking therapists available.',
        whySection: 'Our Chennai team includes 45+ therapists, many of them trained at premier Chennai institutions. We serve patients from Thiruvanmiyur in the south to Kolathur in the north, bringing consistent quality across the city.',
        stats: [
            { label: 'Active Therapists in Chennai', value: '45+' },
            { label: 'Areas Covered', value: '50+' },
            { label: 'Sessions This Month', value: '160+' },
            { label: 'Avg. Patient Rating', value: '4.8★' },
        ],
        popularAreas: [
            { name: 'Anna Nagar', slug: 'anna-nagar' },
            { name: 'Velachery', slug: 'velachery' },
            { name: 'Adyar', slug: 'adyar' },
            { name: 'Besant Nagar', slug: 'besant-nagar' },
            { name: 'T Nagar', slug: 't-nagar' },
            { name: 'Nungambakkam', slug: 'nungambakkam' },
            { name: 'Sholinganallur', slug: 'sholinganallur' },
            { name: 'Thiruvanmiyur', slug: 'thiruvanmiyur' },
            { name: 'Porur', slug: 'porur' },
            { name: 'Mylapore', slug: 'mylapore' },
            { name: 'Perambur', slug: 'perambur' },
            { name: 'Tambaram', slug: 'tambaram' },
        ],
        conditions: ['Back Pain', 'Knee Pain', 'Sports Injuries', 'Post-Surgery Rehab', 'Cervical Pain', 'Frozen Shoulder', 'Elderly Care', 'Neuro Rehab'],
        faqs: [
            { question: 'Do you have Tamil-speaking physiotherapists in Chennai?', answer: 'Yes, all our Chennai therapists speak Tamil fluently. We understand the comfort of communicating in your preferred language during treatment.' },
            { question: 'Is home physiotherapy available in OMR, Sholinganallur, and Siruseri?', answer: 'Yes, the entire OMR corridor from Perungudi to Siruseri is covered. IT professionals on OMR are some of our most frequent patients.' },
            { question: 'Can you provide post-surgery physiotherapy after treatment at Apollo or Fortis hospitals in Chennai?', answer: 'Absolutely. We regularly coordinate with discharge notes from Apollo, Fortis, MIOT, and other Chennai hospitals to provide seamless home rehabilitation post-surgery.' },
            { question: 'Do you offer physiotherapy for elderly patients in Chennai?', answer: 'Yes, geriatric care with a focus on fall prevention, balance training, and age-related mobility management is a key speciality of our Chennai team.' },
            { question: 'What is the process to book home physiotherapy in Chennai?', answer: 'Simply call +91 9136447006 or WhatsApp +91 9372681410. Share your area, condition, and preferred timing. We\'ll arrange a certified therapist, typically within the same day or next morning.' },
        ],
        canonicalUrl: `${BASE}/physiotherapy-in-chennai`,
    },

    // ─────────────────────── HYDERABAD ───────────────────────
    {
        cityName: 'Hyderabad',
        stateName: 'Telangana',
        citySlug: 'hyderabad',
        stateSlug: 'telangana',
        pageSlug: 'physiotherapy-in-hyderabad',
        metaTitle: 'Best Home Physiotherapy in Hyderabad | Expert Physio at Home | Aries PhysioCare',
        metaDescription: 'Expert home physiotherapy in Hyderabad. Certified physio specialists in Banjara Hills, Jubilee Hills, Hitech City, Gachibowli & all areas. Call +91 9136447006.',
        keywords: ['physiotherapy in hyderabad', 'home physiotherapy hyderabad', 'physiotherapist near me hyderabad', 'physio at home hyderabad', 'physiotherapy banjara hills', 'physiotherapy hitech city', 'physiotherapy gachibowli'],
        heroHeading: 'Expert Home Physiotherapy in Hyderabad',
        heroSubheading: 'Premium physiotherapy at your doorstep — serving all of Hyderabad from Banjara Hills to Hitech City.',
        localIntro: 'Hyderabad — City of Pearls and now a global tech hub — has seen exponential growth in health-consciousness alongside the rise of its IT industry in Hitech City and HITEC City. Professionals in Gachibowli, Kondapur, and Ameerpet, along with the city\'s large retired population in Banjara Hills and Jubilee Hills, are increasingly choosing home physiotherapy to manage pain, recover from surgery, and maintain quality of life. Aries PhysioCare brings that expertise to your door.',
        whySection: 'Our Hyderabad network is growing rapidly with 40+ therapists covering all major zones including Secunderabad, West Hyderabad, and the HITEC corridor. We bring the same clinical standard that top Hyderabad hospitals offer directly to your home.',
        stats: [
            { label: 'Active Therapists in Hyderabad', value: '40+' },
            { label: 'Areas Covered', value: '45+' },
            { label: 'Sessions This Month', value: '140+' },
            { label: 'Avg. Patient Rating', value: '4.8★' },
        ],
        popularAreas: [
            { name: 'Banjara Hills', slug: 'banjara-hills' },
            { name: 'Jubilee Hills', slug: 'jubilee-hills' },
            { name: 'Kukatpally', slug: 'kukatpally' },
            { name: 'Ameerpet', slug: 'ameerpet' },
            { name: 'Secunderabad', slug: 'secunderabad' },
            { name: 'Begumpet', slug: 'begumpet' },
            { name: 'Miyapur', slug: 'miyapur' },
            { name: 'KPHB', slug: 'kphb' },
            { name: 'Bachupally', slug: 'bachupally' },
            { name: 'Tarnaka', slug: 'tarnaka' },
            { name: 'Chandanagar', slug: 'chandanagar' },
            { name: 'Kompally', slug: 'kompally' },
        ],
        conditions: ['Back Pain', 'Knee Pain', 'Post-Surgery Rehab', 'Sports Injuries', 'Neurological Rehab', 'Cervical Pain', 'Elderly Care', 'Work-Related Injuries'],
        faqs: [
            { question: 'Is home physiotherapy available in Hitech City and Gachibowli?', answer: 'Yes! Hitech City, Gachibowli, Kondapur, Madhapur, and the entire HITEC corridor are well-covered. We know this area is Hyderabad\'s busiest and we ensure fast appointment slots here.' },
            { question: 'Can I get physiotherapy at home in Secunderabad?', answer: 'Yes, Secunderabad and all surrounding areas including Trimulgherry, Alwal, Malkajgiri, and Sainikpuri are covered under our North Hyderabad network.' },
            { question: 'Do you offer Telugu-language therapist consultations in Hyderabad?', answer: 'Yes, most of our Hyderabad therapists are fluent in Telugu and can consult and communicate in Telugu for your comfort.' },
            { question: 'How does Aries PhysioCare compare to local clinics in Hyderabad?', answer: 'We bring hospital-grade care directly to your home, eliminating travel stress. Our therapists carry advanced portable equipment like IFT, Laser, and Ultrasound — the same modalities you\'d find in top Hyderabad physio clinics.' },
            { question: 'Can Aries PhysioCare handle neurological cases like stroke rehab in Hyderabad?', answer: 'Yes, neurological rehabilitation including stroke recovery, Parkinson\'s, and cerebral palsy care is available via our specialized neuro-physiotherapy team in Hyderabad.' },
        ],
        canonicalUrl: `${BASE}/physiotherapy-in-hyderabad`,
    },

    // ─────────────────────── KOLKATA ───────────────────────
    {
        cityName: 'Kolkata',
        stateName: 'West Bengal',
        citySlug: 'kolkata',
        stateSlug: 'west-bengal',
        pageSlug: 'physiotherapy-in-kolkata',
        metaTitle: 'Best Home Physiotherapy in Kolkata | Expert Physio at Home | Aries PhysioCare',
        metaDescription: 'Expert home physiotherapy in Kolkata. Certified physio specialists in Salt Lake, Ballygunge, Behala, New Town & all areas. Same-day appointments. Call +91 9136447006.',
        keywords: ['physiotherapy in kolkata', 'home physiotherapy kolkata', 'physiotherapist near me kolkata', 'physio at home kolkata', 'physiotherapy salt lake', 'physiotherapy new town', 'physiotherapy ballygunge'],
        heroHeading: 'Expert Home Physiotherapy in Kolkata',
        heroSubheading: 'Certified physiotherapy at your doorstep across all Kolkata localities — from Salt Lake to Behala.',
        localIntro: 'Kolkata, the City of Joy, has a rich heritage but also a significant elderly population that increasingly requires geriatric physiotherapy and mobility support at home. Alongside this, the city\'s growing IT sector in Salt Lake Sector V and New Town has brought in a younger demographic dealing with posture-related issues. Aries PhysioCare bridges this gap by bringing quality clinical physiotherapy — with Bengali-speaking therapists — directly to your home.',
        whySection: 'Our Kolkata team of 35+ therapists specializes in geriatric care, neurological rehabilitation, and post-surgical recovery — bringing the clinical standard of Kolkata\'s top hospitals like SSKM and AMRI to your home.',
        stats: [
            { label: 'Active Therapists in Kolkata', value: '35+' },
            { label: 'Areas Covered', value: '40+' },
            { label: 'Sessions This Month', value: '120+' },
            { label: 'Avg. Patient Rating', value: '4.7★' },
        ],
        popularAreas: [
            { name: 'Salt Lake', slug: 'salt-lake' },
            { name: 'New Town', slug: 'new-town' },
            { name: 'Ballygunge', slug: 'ballygunge' },
            { name: 'Behala', slug: 'behala' },
            { name: 'Alipore', slug: 'alipore' },
            { name: 'Park Street', slug: 'park-street' },
            { name: 'Howrah', slug: 'howrah' },
            { name: 'Dum Dum', slug: 'dum-dum' },
            { name: 'Kasba', slug: 'kasba' },
            { name: 'Jadavpur', slug: 'jadavpur' },
            { name: 'Tollygunge', slug: 'tollygunge' },
            { name: 'Garia', slug: 'garia' },
        ],
        conditions: ['Back Pain', 'Knee Pain', 'Elderly Care', 'Stroke Rehab', 'Post-Surgery Rehab', 'Arthritis Management', 'Parkinson\'s Care', 'Balance Training'],
        faqs: [
            { question: 'Do you have Bengali-speaking physiotherapists in Kolkata?', answer: 'Yes, all our Kolkata-based therapists speak Bengali and Hindi fluently, ensuring comfortable communication throughout your treatment.' },
            { question: 'Is home physiotherapy available in Salt Lake and New Town Kolkata?', answer: 'Yes, Salt Lake (all Sectors), New Town (Action Area 1, 2, 3), and Rajarhat are all covered under our East Kolkata network.' },
            { question: 'Can you provide elderly physiotherapy at home in Kolkata?', answer: 'Geriatric physiotherapy is our most sought-after service in Kolkata. We specialize in fall prevention, balance training, arthritis management, and post-hip fracture rehabilitation for elderly patients.' },
            { question: 'Do you cover Howrah and areas across the bridge?', answer: 'Yes, we serve Howrah including key areas like Shibpur, Santragachi, and Bally. Please mention Howrah specifically while booking so we can arrange the right therapist.' },
            { question: 'How do I book a home physiotherapist in Kolkata?', answer: 'Call +91 9136447006 or WhatsApp +91 9372681410. Most Kolkata areas can be served the same day or next morning after booking.' },
        ],
        canonicalUrl: `${BASE}/physiotherapy-in-kolkata`,
    },

    // ─────────────────────── AHMEDABAD ───────────────────────
    {
        cityName: 'Ahmedabad',
        stateName: 'Gujarat',
        citySlug: 'ahmedabad',
        stateSlug: 'gujarat',
        pageSlug: 'physiotherapy-in-ahmedabad',
        metaTitle: 'Best Home Physiotherapy in Ahmedabad | Expert Physio at Home | Aries PhysioCare',
        metaDescription: 'Expert home physiotherapy in Ahmedabad. Certified physio specialists in Satellite, Prahlad Nagar, Navrangpura, Bopal & all areas. Call +91 9136447006.',
        keywords: ['physiotherapy in ahmedabad', 'home physiotherapy ahmedabad', 'physiotherapist near me ahmedabad', 'physio at home ahmedabad', 'physiotherapy satellite', 'physiotherapy prahlad nagar', 'physiotherapy bopal'],
        heroHeading: 'Expert Home Physiotherapy in Ahmedabad',
        heroSubheading: 'Premium physiotherapy at your doorstep across Ahmedabad — with Gujarati-speaking specialist therapists.',
        localIntro: 'Ahmedabad, Gujarat\'s commercial capital and a thriving business hub, has a large entrepreneurial and professional population with growing healthcare needs. From the affluent residential belts of Satellite and Prahlad Nagar to the rapidly developing Western suburbs of Bopal and S.G. Highway, Aries PhysioCare delivers certified clinical physiotherapy directly to Ahmedabad homes — with Gujarati and Hindi speaking therapists for maximum comfort.',
        whySection: 'Our Ahmedabad team, though growing, is highly specialized with 30+ therapists covering key city zones. We\'re rapidly expanding to ensure every Ahmedabad resident can access the same clinical quality without the clinic.',
        stats: [
            { label: 'Active Therapists in Ahmedabad', value: '30+' },
            { label: 'Areas Covered', value: '35+' },
            { label: 'Sessions This Month', value: '100+' },
            { label: 'Avg. Patient Rating', value: '4.8★' },
        ],
        popularAreas: [
            { name: 'Satellite', slug: 'satellite' },
            { name: 'Prahlad Nagar', slug: 'prahlad-nagar' },
            { name: 'Navrangpura', slug: 'navrangpura' },
            { name: 'Bopal', slug: 'bopal' },
            { name: 'Vastrapur', slug: 'vastrapur' },
            { name: 'Maninagar', slug: 'maninagar' },
            { name: 'Gota', slug: 'gota' },
            { name: 'Chandkheda', slug: 'chandkheda' },
            { name: 'Nikol', slug: 'nikol' },
            { name: 'Memnagar', slug: 'memnagar' },
            { name: 'Thaltej', slug: 'thaltej' },
            { name: 'Naranpura', slug: 'naranpura' },
        ],
        conditions: ['Back Pain', 'Knee Pain', 'Post-Surgery Rehab', 'Sports Injuries', 'Elderly Care', 'Cervical Pain', 'Orthopaedic Conditions', 'Diabetes-Related Issues'],
        faqs: [
            { question: 'Do you have Gujarati-speaking physiotherapists in Ahmedabad?', answer: 'Yes! All our Ahmedabad therapists speak Gujarati and Hindi fluently, making consultations and instruction comfortable for patients of all backgrounds.' },
            { question: 'Is home physiotherapy available in Satellite and Prahlad Nagar?', answer: 'Yes, the Western Ahmedabad belt including Satellite, Prahlad Nagar, Vastrapur, and S.G. Highway is one of our most active areas in the city.' },
            { question: 'Can you provide physiotherapy after treatment at hospitals like Apollo or HCG in Ahmedabad?', answer: 'Yes, we coordinate seamlessly with discharge instructions from all major Ahmedabad hospitals for post-operative home rehabilitation.' },
            { question: 'Do you cover newly developed areas like Shela and South Bopal?', answer: 'Yes, we serve the expanding Western suburbs of Ahmedabad including Shela, South Bopal, Ghuma, and Tragad. Please confirm while booking.' },
            { question: 'How do I book home physiotherapy in Ahmedabad?', answer: 'Call +91 9136447006 or WhatsApp +91 9372681410. Provide your area, condition, and preferred slot and we\'ll match you with the best available Ahmedabad therapist.' },
        ],
        canonicalUrl: `${BASE}/physiotherapy-in-ahmedabad`,
    },
];

export const getCityData = (pageSlug: string): CitySeoData | undefined => {
    return citySeoPages.find(c => c.pageSlug === pageSlug);
};
