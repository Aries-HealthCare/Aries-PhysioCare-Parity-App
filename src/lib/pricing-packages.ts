/**
 * Aries PhysioCare - All-India 2026 Comprehensive Locality, Pincode & Tiered Pricing System
 * Standardized across Admin Dashboard and Customer-Facing Website Landing Pages
 */

export interface PackageTierOption {
  days: number; // 10, 15, 20, 30
  ratePerSession: number;
  totalPrice: number;
  totalSavings: number;
  discountPercent: number;
}

export interface PricingTier {
  id: 'economy' | 'standard' | 'premium' | 'luxury' | 'custom';
  name: string;
  badge: string;
  basePrice: number; // Single session base price (INR)
  currency: string;
  description: string;
  recommendedAreas: string[];
  packages: {
    days10: PackageTierOption;
    days15: PackageTierOption;
    days20: PackageTierOption;
    days30: PackageTierOption;
  };
}

export interface LocalityPricingRecord {
  state: string;
  city: string;
  subArea: string;
  tierId: 'economy' | 'standard' | 'premium' | 'luxury';
  basePrice: number;
  pincodes: string[];
  keywords: string[];
}

export const STANDARD_PRICING_TIERS: Record<string, PricingTier> = {
  economy: {
    id: 'economy',
    name: 'Economy Tier',
    badge: '₹1,000/-',
    basePrice: 1000,
    currency: 'INR',
    description: 'Affordable home visits for suburban outskirts & developing localities (₹800 - ₹1,000)',
    recommendedAreas: ['Kalyan', 'Dombivli', 'Diva', 'Dahisar', 'Virar', 'Nalasopara', 'Vasai', 'Kurla', 'Govandi', 'Mankhurd', 'Bhiwandi', 'Ambernath', 'Badlapur'],
    packages: {
      days10: {
        days: 10,
        ratePerSession: 950,
        totalPrice: 9500,
        totalSavings: 500,
        discountPercent: 5,
      },
      days15: {
        days: 15,
        ratePerSession: 900,
        totalPrice: 13500,
        totalSavings: 1500,
        discountPercent: 10,
      },
      days20: {
        days: 20,
        ratePerSession: 850,
        totalPrice: 17000,
        totalSavings: 3000,
        discountPercent: 15,
      },
      days30: {
        days: 30,
        ratePerSession: 800,
        totalPrice: 24000,
        totalSavings: 6000,
        discountPercent: 20,
      },
    },
  },
  standard: {
    id: 'standard',
    name: 'Standard Tier',
    badge: '₹1,200/-',
    basePrice: 1200,
    currency: 'INR',
    description: 'Most popular for middle-class residential localities & primary city hubs (₹1,000 - ₹1,500)',
    recommendedAreas: ['Andheri East', 'Goregaon', 'Kandivali', 'Borivali', 'Malad', 'Ghatkopar', 'Mulund', 'Thane', 'Navi Mumbai', 'Vashi', 'Nerul', 'Kharghar', 'Belapur', 'Airoli'],
    packages: {
      days10: {
        days: 10,
        ratePerSession: 1100,
        totalPrice: 11000,
        totalSavings: 1000,
        discountPercent: 8.3,
      },
      days15: {
        days: 15,
        ratePerSession: 1050,
        totalPrice: 15750,
        totalSavings: 2250,
        discountPercent: 12.5,
      },
      days20: {
        days: 20,
        ratePerSession: 1000,
        totalPrice: 20000,
        totalSavings: 4000,
        discountPercent: 16.7,
      },
      days30: {
        days: 30,
        ratePerSession: 950,
        totalPrice: 28500,
        totalSavings: 8000,
        discountPercent: 20.8,
      },
    },
  },
  premium: {
    id: 'premium',
    name: 'Premium Tier',
    badge: '₹1,500/-',
    basePrice: 1500,
    currency: 'INR',
    description: 'High-demand urban corridors, IT hubs & upper-middle class areas with specialized equipment (₹1,400 - ₹1,600)',
    recommendedAreas: ['Andheri West', 'Lokhandwala', 'Juhu', 'Dadar', 'Powai', 'Chembur', 'Santacruz', 'Khar', 'Vile Parle', 'Whitefield', 'HSR Layout', 'Gachibowli', 'Anna Nagar', 'Koregaon Park', 'Alipore'],
    packages: {
      days10: {
        days: 10,
        ratePerSession: 1450,
        totalPrice: 14500,
        totalSavings: 500,
        discountPercent: 3.3,
      },
      days15: {
        days: 15,
        ratePerSession: 1400,
        totalPrice: 21000,
        totalSavings: 1500,
        discountPercent: 6.7,
      },
      days20: {
        days: 20,
        ratePerSession: 1350,
        totalPrice: 27000,
        totalSavings: 3000,
        discountPercent: 10,
      },
      days30: {
        days: 30,
        ratePerSession: 1300,
        totalPrice: 39000,
        totalSavings: 6000,
        discountPercent: 13.3,
      },
    },
  },
  luxury: {
    id: 'luxury',
    name: 'Luxury Tier',
    badge: '₹2,000/-',
    basePrice: 2000,
    currency: 'INR',
    description: 'South Mumbai, South Delhi, Golf Course Rd & Ultra-luxury VIP concierge home physiotherapy (₹1,800 - ₹2,000+)',
    recommendedAreas: ['South Mumbai', 'Colaba', 'Cuffe Parade', 'Marine Drive', 'Malabar Hill', 'Nariman Point', 'Worli', 'Lower Parel', 'Bandra West', 'Pali Hill', 'Jor Bagh', 'Vasant Vihar', 'Jubilee Hills', 'Boat Club Road'],
    packages: {
      days10: {
        days: 10,
        ratePerSession: 1800,
        totalPrice: 18000,
        totalSavings: 2000,
        discountPercent: 10,
      },
      days15: {
        days: 15,
        ratePerSession: 1700,
        totalPrice: 25500,
        totalSavings: 5000,
        discountPercent: 15,
      },
      days20: {
        days: 20,
        ratePerSession: 1600,
        totalPrice: 32000,
        totalSavings: 8000,
        discountPercent: 20,
      },
      days30: {
        days: 30,
        ratePerSession: 1500,
        totalPrice: 45000,
        totalSavings: 15000,
        discountPercent: 25,
      },
    },
  },
};

/**
 * 2026 Comprehensive All-India Locality, Pincode & Pricing Registry
 */
export const ALL_INDIA_LOCALITIES_2026: LocalityPricingRecord[] = [
  // ─── MAHARASHTRA : MUMBAI & MMR ──────────────────────────────────
  // Luxury Tier (₹2,000)
  { state: 'Maharashtra', city: 'Mumbai', subArea: 'Colaba & Cuffe Parade', tierId: 'luxury', basePrice: 2000, pincodes: ['400005', '400001'], keywords: ['colaba', 'cuffe parade', 'navy nagar', 'rc church', 'sassoon dock', 'strand'] },
  { state: 'Maharashtra', city: 'Mumbai', subArea: 'Malabar Hill & Walkeshwar', tierId: 'luxury', basePrice: 2000, pincodes: ['400006', '400026'], keywords: ['malabar hill', 'walkeshwar', 'nepean sea road', 'banganga', 'raj bhavan'] },
  { state: 'Maharashtra', city: 'Mumbai', subArea: 'Altamount & Pedder Road', tierId: 'luxury', basePrice: 2000, pincodes: ['400026', '400034'], keywords: ['altamount road', 'pedder road', 'carmichael road', 'breach candy', 'cumballa hill', 'mahalaxmi'] },
  { state: 'Maharashtra', city: 'Mumbai', subArea: 'Nariman Point & Marine Drive', tierId: 'luxury', basePrice: 2000, pincodes: ['400021', '400020', '400002'], keywords: ['nariman point', 'marine drive', 'marine lines', 'churchgate', 'ncpa', 'air india building'] },
  { state: 'Maharashtra', city: 'Mumbai', subArea: 'Worli & Worli Sea Face', tierId: 'luxury', basePrice: 2000, pincodes: ['400018', '400030'], keywords: ['worli', 'worli sea face', 'dr e moses rd', 'century bazaar', 'worli naka'] },
  { state: 'Maharashtra', city: 'Mumbai', subArea: 'Lower Parel & Mahalaxmi', tierId: 'luxury', basePrice: 2000, pincodes: ['400013', '400011'], keywords: ['lower parel', 'high street phoenix', 'palladium', 'mathuradas mill', 'senapati bapat marg'] },
  { state: 'Maharashtra', city: 'Mumbai', subArea: 'Bandra West (Pali Hill & Bandstand)', tierId: 'luxury', basePrice: 2000, pincodes: ['400050'], keywords: ['bandra west', 'pali hill', 'bandstand', 'carter road', 'mount mary', 'turner road', 'hill road', 'perry cross'] },
  { state: 'Maharashtra', city: 'Mumbai', subArea: 'Juhu & JVPD Scheme', tierId: 'luxury', basePrice: 2000, pincodes: ['400049'], keywords: ['juhu', 'jvpd scheme', 'juhu tara road', 'juhu beach', 'gulmohar road', 'chandan cinema'] },

  // Premium Tier (₹1,500)
  { state: 'Maharashtra', city: 'Mumbai', subArea: 'Andheri West & Lokhandwala', tierId: 'premium', basePrice: 1500, pincodes: ['400053', '400058'], keywords: ['andheri west', 'lokhandwala', 'lokhandwala complex', 'four bungalows', 'seven bungalows', 'versova', 'oshiwara', 'model town'] },
  { state: 'Maharashtra', city: 'Mumbai', subArea: 'Powai & Hiranandani', tierId: 'premium', basePrice: 1500, pincodes: ['400076', '400072'], keywords: ['powai', 'hiranandani gardens', 'chandivali', 'lake homes', 'iit bombay', 'galleria'] },
  { state: 'Maharashtra', city: 'Mumbai', subArea: 'Bandra East & BKC', tierId: 'premium', basePrice: 1500, pincodes: ['400051'], keywords: ['bkc', 'bandra kurla complex', 'bandra east', 'kalanagar', 'moter colony', 'dharavi cross'] },
  { state: 'Maharashtra', city: 'Mumbai', subArea: 'Santacruz West & Khar West', tierId: 'premium', basePrice: 1500, pincodes: ['400054', '400052'], keywords: ['santacruz west', 'khar west', 'linking road', 'sv road khar', 'gazdar bandh', 'podar school'] },
  { state: 'Maharashtra', city: 'Mumbai', subArea: 'Vile Parle West & East', tierId: 'premium', basePrice: 1500, pincodes: ['400056', '400057'], keywords: ['vile parle west', 'vile parle east', 'irla', 'hanuman road', 'nehru road'] },
  { state: 'Maharashtra', city: 'Mumbai', subArea: 'Dadar (Shivaji Park & Hindu Colony)', tierId: 'premium', basePrice: 1500, pincodes: ['400028', '400014'], keywords: ['dadar', 'dadar west', 'dadar east', 'shivaji park', 'hindu colony', 'prabhadevi', 'siddhivinayak'] },
  { state: 'Maharashtra', city: 'Mumbai', subArea: 'Chembur & Diamond Garden', tierId: 'premium', basePrice: 1500, pincodes: ['400071', '400088'], keywords: ['chembur', 'diamond garden', 'deonar', 'sindhi society', 'pestom sagar', 'st anthony road'] },
  { state: 'Maharashtra', city: 'Mumbai', subArea: 'Mahim & Matunga', tierId: 'premium', basePrice: 1500, pincodes: ['400016', '400019'], keywords: ['mahim', 'matunga', 'matunga east', 'matunga west', 'five gardens', 'king circle', 'ruia college'] },
  { state: 'Maharashtra', city: 'Mumbai', subArea: 'Tardeo, Byculla & Mazgaon', tierId: 'premium', basePrice: 1500, pincodes: ['400034', '400008', '400010'], keywords: ['tardeo', 'byculla', 'mazgaon', 'mumbai central', 'grant road', 'haji ali', 'jacob circle'] },

  // Standard Tier (₹1,200)
  { state: 'Maharashtra', city: 'Mumbai', subArea: 'Andheri East & MIDC', tierId: 'standard', basePrice: 1200, pincodes: ['400069', '400093', '400059', '400072', '400099'], keywords: ['andheri east', 'chakala', 'jb nagar', 'marol', 'sakinaka', 'midc andheri', 'sahar'] },
  { state: 'Maharashtra', city: 'Mumbai', subArea: 'Goregaon East & West', tierId: 'standard', basePrice: 1200, pincodes: ['400062', '400063'], keywords: ['goregaon', 'goregaon east', 'goregaon west', 'gokuldham', 'yashodham', 'bangur nagar', 'film city', 'dindoshi'] },
  { state: 'Maharashtra', city: 'Mumbai', subArea: 'Malad East & West', tierId: 'standard', basePrice: 1200, pincodes: ['400064', '400097'], keywords: ['malad', 'malad west', 'malad east', 'mindspace', 'evershine nagar', 'chincholi bunder', 'marve road'] },
  { state: 'Maharashtra', city: 'Mumbai', subArea: 'Kandivali East & West', tierId: 'standard', basePrice: 1200, pincodes: ['400067', '400101'], keywords: ['kandivali', 'kandivali west', 'kandivali east', 'mahavir nagar', 'charkop', 'thakur village', 'thakur complex', 'lokhandwala township'] },
  { state: 'Maharashtra', city: 'Mumbai', subArea: 'Borivali East & West', tierId: 'standard', basePrice: 1200, pincodes: ['400066', '400091', '400092', '400103'], keywords: ['borivali', 'borivali west', 'borivali east', 'ic colony', 'shimpoli', 'gorai', 'eksar', 'magathane', 'vazira'] },
  { state: 'Maharashtra', city: 'Mumbai', subArea: 'Ghatkopar East & West', tierId: 'standard', basePrice: 1200, pincodes: ['400075', '400077', '400086'], keywords: ['ghatkopar', 'ghatkopar east', 'ghatkopar west', 'pant nagar', 'garodia nagar', 'r city', 'lbs marg'] },
  { state: 'Maharashtra', city: 'Mumbai', subArea: 'Mulund East & West', tierId: 'standard', basePrice: 1200, pincodes: ['400080', '400081'], keywords: ['mulund', 'mulund west', 'mulund east', 'nahur', 'sarvodaya nagar', 'paanch rasta'] },
  { state: 'Maharashtra', city: 'Mumbai', subArea: 'Bhandup & Kanjurmarg', tierId: 'standard', basePrice: 1200, pincodes: ['400078', '400042'], keywords: ['bhandup', 'bhandup west', 'bhandup east', 'kanjurmarg', 'kanjurmarg east', 'vikhroli'] },
  { state: 'Maharashtra', city: 'Mumbai', subArea: 'Sion, Wadala & Sewri', tierId: 'standard', basePrice: 1200, pincodes: ['400022', '400031', '400015', '400037'], keywords: ['sion', 'wadala', 'sewri', 'antop hill', 'chunabhatti', 'pratiksha nagar', 'bpt'] },
  { state: 'Maharashtra', city: 'Thane', subArea: 'Thane West & Ghodbunder Road', tierId: 'standard', basePrice: 1200, pincodes: ['400601', '400602', '400604', '400607', '400610', '400615'], keywords: ['thane', 'thane west', 'ghodbunder road', 'majiwada', 'vasant vihar thane', 'hiranandani estate', 'hiranandani meadows', 'kolshet', 'manpada', 'brahmand', 'kasarvadavali', 'naupada', 'pachpakhadi', 'wagle estate'] },
  { state: 'Maharashtra', city: 'Navi Mumbai', subArea: 'Vashi, Sanpada & Nerul', tierId: 'standard', basePrice: 1200, pincodes: ['400703', '400705', '400706'], keywords: ['navi mumbai', 'vashi', 'sanpada', 'nerul', 'palm beach road', 'seawoods', 'nerul west', 'nerul east'] },
  { state: 'Maharashtra', city: 'Navi Mumbai', subArea: 'Kharghar & Belapur', tierId: 'standard', basePrice: 1200, pincodes: ['410210', '400614'], keywords: ['kharghar', 'belapur', 'cbd belapur', 'utsav chowk', 'hiranandani kharghar', 'sector 20 kharghar'] },
  { state: 'Maharashtra', city: 'Navi Mumbai', subArea: 'Airoli, Ghansoli & Kopar Khairane', tierId: 'standard', basePrice: 1200, pincodes: ['400708', '400701', '400709'], keywords: ['airoli', 'ghansoli', 'kopar khairane', 'reliance corporate park', 'rabale', 'mahape'] },
  { state: 'Maharashtra', city: 'Navi Mumbai', subArea: 'Panvel, Kamothe & Ulwe', tierId: 'standard', basePrice: 1200, pincodes: ['410206', '410209'], keywords: ['panvel', 'new panvel', 'kamothe', 'khandeshwar', 'ulwe', 'dronagiri', 'karanjade'] },

  // Economy Tier (₹1,000)
  { state: 'Maharashtra', city: 'Mumbai', subArea: 'Dahisar East & West', tierId: 'economy', basePrice: 1000, pincodes: ['400068'], keywords: ['dahisar', 'dahisar east', 'dahisar west', 'rawalpada', 'shailendra nagar', 'anand nagar dahisar'] },
  { state: 'Maharashtra', city: 'Mira-Bhayandar', subArea: 'Mira Road & Bhayandar', tierId: 'economy', basePrice: 1000, pincodes: ['401107', '401101', '401105'], keywords: ['mira road', 'bhayandar', 'bhayandar east', 'bhayandar west', 'shanti park', 'kashimira', 'kanakia'] },
  { state: 'Maharashtra', city: 'Vasai-Virar', subArea: 'Vasai, Nalasopara & Virar', tierId: 'economy', basePrice: 1000, pincodes: ['401202', '401209', '401303', '401208', '401305'], keywords: ['vasai', 'virar', 'nalasopara', 'vasai west', 'vasai east', 'virar west', 'virar east', 'naigaon', 'bolinj'] },
  { state: 'Maharashtra', city: 'Kalyan-Dombivli', subArea: 'Kalyan & Dombivli', tierId: 'economy', basePrice: 1000, pincodes: ['421301', '421201', '421202', '421204', '421306'], keywords: ['kalyan', 'dombivli', 'kalyan west', 'kalyan east', 'dombivli west', 'dombivli east', 'diva', 'thakurli', 'palava', 'palava city'] },
  { state: 'Maharashtra', city: 'Thane Suburbs', subArea: 'Ulhasnagar, Ambernath & Badlapur', tierId: 'economy', basePrice: 1000, pincodes: ['421001', '421501', '421503', '421302'], keywords: ['ulhasnagar', 'ambernath', 'badlapur', 'bhiwandi', 'titwala', 'mumbra', 'kalwa', 'shilphata'] },
  { state: 'Maharashtra', city: 'Mumbai', subArea: 'Kurla, Govandi & Mankhurd', tierId: 'economy', basePrice: 1000, pincodes: ['400070', '400043', '400088', '400074'], keywords: ['kurla', 'kurla east', 'kurla west', 'govandi', 'mankhurd', 'chembur camp', 'tilak nagar'] },

  // ─── MAHARASHTRA : PUNE & REST OF STATE ──────────────────────────
  { state: 'Maharashtra', city: 'Pune', subArea: 'Koregaon Park & Kalyani Nagar', tierId: 'luxury', basePrice: 2000, pincodes: ['411001', '411006'], keywords: ['koregaon park', 'kalyani nagar', 'boat club road', 'north main road', 'bund garden'] },
  { state: 'Maharashtra', city: 'Pune', subArea: 'Baner, Aundh & Balewadi', tierId: 'premium', basePrice: 1500, pincodes: ['411045', '411007', '411021'], keywords: ['baner', 'aundh', 'balewadi', 'balewadi high street', 'pashan', 'bavdhan'] },
  { state: 'Maharashtra', city: 'Pune', subArea: 'Viman Nagar, Kharadi & Magarpatta', tierId: 'premium', basePrice: 1500, pincodes: ['411014', '411028', '411036'], keywords: ['viman nagar', 'kharadi', 'eon it park', 'magarpatta', 'magarpatta city', 'hadapsar', 'amanora'] },
  { state: 'Maharashtra', city: 'Pune', subArea: 'Kothrud, Erandwane & Senapati Bapat', tierId: 'premium', basePrice: 1500, pincodes: ['411038', '411004', '411016'], keywords: ['kothrud', 'erandwane', 'prabhat road', 'law college road', 'senapati bapat road', 'shivaji nagar pune', 'model colony pune'] },
  { state: 'Maharashtra', city: 'Pune', subArea: 'Hinjawadi, Wakad & Pimple Saudagar', tierId: 'standard', basePrice: 1200, pincodes: ['411057', '411027', '411033'], keywords: ['hinjawadi', 'wakad', 'pimple saudagar', 'pimple nilakh', 'punawale', 'tathawade', 'ravet'] },
  { state: 'Maharashtra', city: 'Pune', subArea: 'PCMC (Pimpri-Chinchwad & Nigdi)', tierId: 'standard', basePrice: 1200, pincodes: ['411018', '411019', '411044', '411026'], keywords: ['pimpri', 'chinchwad', 'nigdi', 'pradhikaran', 'bhosari', 'moshi', 'chakan'] },
  { state: 'Maharashtra', city: 'Pune', subArea: 'Sinhagad Rd, Dhayari, Katraj & Kondhwa', tierId: 'standard', basePrice: 1200, pincodes: ['411041', '411046', '411048', '411060'], keywords: ['sinhagad road', 'dhayari', 'katraj', 'bibwewadi', 'kondhwa', 'nibm road', 'undri', 'wanowrie'] },
  { state: 'Maharashtra', city: 'Nagpur', subArea: 'Civil Lines, Dharampeth & Wardha Rd', tierId: 'standard', basePrice: 1200, pincodes: ['440001', '440010', '440015', '440022'], keywords: ['nagpur', 'civil lines nagpur', 'dharampeth', 'ramdaspeth', 'laxmi nagar nagpur', 'wardha road', 'manish nagar', 'mihan'] },
  { state: 'Maharashtra', city: 'Nashik', subArea: 'Gangapur Road & College Road', tierId: 'standard', basePrice: 1200, pincodes: ['422005', '422013', '422009'], keywords: ['nashik', 'gangapur road', 'college road', 'mahatma nagar', 'indira nagar nashik', 'govind nagar'] },
  { state: 'Maharashtra', city: 'Aurangabad', subArea: 'CIDCO, Cannaught & Garkheda', tierId: 'standard', basePrice: 1200, pincodes: ['431003', '431009', '431005'], keywords: ['aurangabad', 'chhatrapati sambhajinagar', 'cidco aurangabad', 'garkheda', 'osmanpura', 'seven hills aurangabad'] },
  { state: 'Maharashtra', city: 'Kolhapur', subArea: 'Tarabai Park & Rajarampuri', tierId: 'standard', basePrice: 1200, pincodes: ['416003', '416008'], keywords: ['kolhapur', 'tarabai park', 'rajarampuri', 'nagala park', 'shahupuri'] },
  { state: 'Maharashtra', city: 'Solapur', subArea: 'Solapur City & MIDC', tierId: 'economy', basePrice: 1000, pincodes: ['413001', '413002', '413004'], keywords: ['solapur', 'solapur city', 'jule solapur', 'hotgi road'] },

  // ─── DELHI NCR ──────────────────────────────────────────────────
  // Luxury Tier (₹2,000)
  { state: 'Delhi', city: 'New Delhi', subArea: 'Lutyens Delhi, Golf Links & Jor Bagh', tierId: 'luxury', basePrice: 2000, pincodes: ['110001', '110003', '110011', '110021'], keywords: ['lutyens delhi', 'golf links', 'jor bagh', 'sundar nagar', 'chanakyapuri', 'shanti niketan', 'anand niketan', 'westend'] },
  { state: 'Delhi', city: 'South Delhi', subArea: 'Greater Kailash, Vasant Vihar & Defense Colony', tierId: 'luxury', basePrice: 2000, pincodes: ['110048', '110057', '110024', '110017'], keywords: ['greater kailash', 'gk 1', 'gk 2', 'vasant vihar', 'defence colony', 'panchsheel park', 'panchsheel enclave', 'south extension', 'new friends colony'] },
  { state: 'Haryana', city: 'Gurugram', subArea: 'Golf Course Road & DLF Phase 1-5', tierId: 'luxury', basePrice: 2000, pincodes: ['122002', '122009'], keywords: ['golf course road', 'dlf phase 1', 'dlf phase 2', 'dlf phase 4', 'dlf phase 5', 'magnolias', 'aralias', 'camellias', 'the crest', 'belaire', 'ambience island'] },

  // Premium Tier (₹1,500)
  { state: 'Delhi', city: 'South Delhi', subArea: 'Hauz Khas, Saket & Green Park', tierId: 'premium', basePrice: 1500, pincodes: ['110016', '110017', '110029', '110049'], keywords: ['hauz khas', 'saket', 'green park', 'safdarjung enclave', 'malviya nagar delhi', 'gulmohar park', 'cr park', 'chittaranjan park', 'alknanda', 'kalkaji'] },
  { state: 'Delhi', city: 'South West Delhi', subArea: 'Vasant Kunj & Dwarka Sector 1-23', tierId: 'premium', basePrice: 1500, pincodes: ['110070', '110075', '110077', '110078'], keywords: ['vasant kunj', 'dwarka', 'dwarka expressway', 'sector 6 dwarka', 'sector 10 dwarka', 'sector 12 dwarka', 'sector 22 dwarka'] },
  { state: 'Delhi', city: 'Central & West Delhi', subArea: 'CP, Karol Bagh, Punjabi Bagh & Rajouri', tierId: 'premium', basePrice: 1500, pincodes: ['110001', '110005', '110026', '110027'], keywords: ['connaught place', 'karol bagh', 'punjabi bagh', 'rajouri garden', 'civil lines delhi', 'model town delhi', 'patel nagar'] },
  { state: 'Haryana', city: 'Gurugram', subArea: 'Cyber City, Sohna Rd & Golf Course Extn', tierId: 'premium', basePrice: 1500, pincodes: ['122002', '122018', '122102', '122003'], keywords: ['cyber city', 'cyberhub', 'sohna road', 'golf course extension road', 'sushant lok', 'nirvana country', 'sector 56 gurgaon', 'sector 57 gurgaon', 'sector 48 gurgaon', 'sector 49 gurgaon'] },
  { state: 'Uttar Pradesh', city: 'Noida', subArea: 'Noida Central & Expressway (Sec 15-128)', tierId: 'premium', basePrice: 1500, pincodes: ['201301', '201303', '201304', '201305'], keywords: ['noida sector 15a', 'noida sector 14a', 'noida sector 44', 'noida sector 50', 'noida sector 93', 'noida sector 128', 'noida expressway', 'sector 137 noida', 'sector 150 noida'] },

  // Standard Tier (₹1,200)
  { state: 'Delhi', city: 'North & West Delhi', subArea: 'Rohini, Pitampura, Janakpuri & Paschim Vihar', tierId: 'standard', basePrice: 1200, pincodes: ['110085', '110034', '110058', '110063', '110018'], keywords: ['rohini', 'pitampura', 'janakpuri', 'paschim vihar', 'vikaspuri', 'shalimar bagh', 'moti nagar', 'kirti nagar', 'tilak nagar'] },
  { state: 'Delhi', city: 'East Delhi', subArea: 'Mayur Vihar, Preet Vihar & Laxmi Nagar', tierId: 'standard', basePrice: 1200, pincodes: ['110091', '110092', '110095', '110096'], keywords: ['mayur vihar', 'ip extension', 'patparganj', 'preet vihar', 'laxmi nagar', 'anand vihar', 'vivek vihar', 'shahdara'] },
  { state: 'Uttar Pradesh', city: 'Noida', subArea: 'Noida Sector 62, 75, 76, 78 & 120', tierId: 'standard', basePrice: 1200, pincodes: ['201301', '201307'], keywords: ['noida sector 62', 'noida sector 75', 'noida sector 76', 'noida sector 78', 'noida sector 120', 'noida sector 121', 'noida sector 119'] },
  { state: 'Uttar Pradesh', city: 'Greater Noida', subArea: 'Greater Noida West / Noida Extension & Pari Chowk', tierId: 'standard', basePrice: 1200, pincodes: ['201318', '201306', '201310', '201308'], keywords: ['greater noida', 'noida extension', 'gaur city', 'greater noida west', 'pari chowk', 'alpha 1 greater noida', 'beta 1', 'knowledge park noida'] },
  { state: 'Uttar Pradesh', city: 'Ghaziabad', subArea: 'Indirapuram, Vaishali, Vasundhara & Raj Nagar', tierId: 'standard', basePrice: 1200, pincodes: ['201014', '201010', '201012', '201016', '201002'], keywords: ['ghaziabad', 'indirapuram', 'vaishali', 'vasundhara', 'kaushambi', 'crossings republik', 'raj nagar extension', 'kavi nagar'] },
  { state: 'Haryana', city: 'Faridabad', subArea: 'Sector 14-21, Green Field & Surajkund', tierId: 'standard', basePrice: 1200, pincodes: ['121002', '121003', '121008', '121009', '121010'], keywords: ['faridabad', 'sector 15 faridabad', 'sector 14 faridabad', 'sector 21 faridabad', 'green field colony', 'surajkund', 'charmwood village', 'neharpar'] },

  // Economy Tier (₹1,000)
  { state: 'Delhi', city: 'Outer Delhi', subArea: 'Narela, Bawana, Najafgarh & Burari', tierId: 'economy', basePrice: 1000, pincodes: ['110040', '110039', '110043', '110084', '110041'], keywords: ['narela', 'bawana', 'najafgarh', 'burari', 'nangloi', 'mundka', 'sultanpuri', 'mangolpuri', 'palam', 'badarpur'] },
  { state: 'Uttar Pradesh', city: 'Ghaziabad Outskirts', subArea: 'Loni, Sahibabad & Muradnagar', tierId: 'economy', basePrice: 1000, pincodes: ['201102', '201005', '201206'], keywords: ['loni', 'sahibabad', 'mohan nagar', 'muradnagar', 'modinagar', 'dasna'] },

  // ─── KARNATAKA : BENGALURU & STATE ──────────────────────────────
  // Luxury Tier (₹2,000)
  { state: 'Karnataka', city: 'Bengaluru', subArea: 'Sadashivanagar, Lavelle Rd & Cunningham Rd', tierId: 'luxury', basePrice: 2000, pincodes: ['560080', '560001', '560052', '560025'], keywords: ['sadashivanagar', 'lavelle road', 'cunningham road', 'richmond town', 'vittal mallya', 'langford town', 'benson town', 'sankey road'] },
  { state: 'Karnataka', city: 'Bengaluru', subArea: 'Indiranagar (100ft Rd & Defence Colony)', tierId: 'luxury', basePrice: 2000, pincodes: ['560038'], keywords: ['indiranagar', 'defence colony bangalore', '100ft road indiranagar', '12th main indiranagar', 'hal 2nd stage'] },
  { state: 'Karnataka', city: 'Bengaluru', subArea: 'Koramangala (3rd & 4th Block)', tierId: 'luxury', basePrice: 2000, pincodes: ['560034', '560095'], keywords: ['koramangala', 'koramangala 3rd block', 'koramangala 4th block', 'koramangala 5th block', 'st johns woods'] },

  // Premium Tier (₹1,500)
  { state: 'Karnataka', city: 'Bengaluru', subArea: 'Whitefield, ITPL & Brookefield', tierId: 'premium', basePrice: 1500, pincodes: ['560066', '560037', '560048', '560067'], keywords: ['whitefield', 'itpl', 'brookefield', 'kundalahalli', 'kadugodi', 'hoodi', 'hope farm', 'ecoworld'] },
  { state: 'Karnataka', city: 'Bengaluru', subArea: 'HSR Layout & Bellandur', tierId: 'premium', basePrice: 1500, pincodes: ['560102', '560103', '560035'], keywords: ['hsr layout', 'hsr sector 1', 'hsr sector 2', 'bellandur', 'outer ring road bangalore', 'sarjapur road', 'haralur road', 'kasavanahalli'] },
  { state: 'Karnataka', city: 'Bengaluru', subArea: 'Jayanagar & JP Nagar', tierId: 'premium', basePrice: 1500, pincodes: ['560011', '560041', '560078', '560076'], keywords: ['jayanagar', 'jp nagar', 'btm layout', 'bannerghatta road', 'hulimavu', 'arekere', 'south end circle'] },
  { state: 'Karnataka', city: 'Bengaluru', subArea: 'Malleshwaram & Rajajinagar', tierId: 'premium', basePrice: 1500, pincodes: ['560003', '560010', '560004'], keywords: ['malleshwaram', 'rajajinagar', 'basavanagudi', 'shankarpuram', 'west of chord road', 'orion mall'] },
  { state: 'Karnataka', city: 'Bengaluru', subArea: 'Hebbal, Thanisandra & Manyata', tierId: 'premium', basePrice: 1500, pincodes: ['560024', '560045', '560077', '560043'], keywords: ['hebbal', 'manyata tech park', 'thanisandra', 'sahakar nagar', 'kalyan nagar', 'hrbr layout', 'kammanahalli', 'hennur road'] },
  { state: 'Karnataka', city: 'Bengaluru', subArea: 'Electronic City & Singasandra', tierId: 'premium', basePrice: 1500, pincodes: ['560100', '560068'], keywords: ['electronic city', 'electronic city phase 1', 'electronic city phase 2', 'singasandra', 'kudlu gate', 'hosa road', 'wipro gate'] },

  // Standard Tier (₹1,200)
  { state: 'Karnataka', city: 'Bengaluru', subArea: 'RR Nagar, Banashankari & Kengeri', tierId: 'standard', basePrice: 1200, pincodes: ['560098', '560050', '560085', '560060', '560070'], keywords: ['rr nagar', 'rajarajeshwari nagar', 'banashankari', 'padmanabhanagar', 'kumaraswamy layout', 'uttarahalli', 'kengeri'] },
  { state: 'Karnataka', city: 'Bengaluru', subArea: 'Yelahanka, Jalahalli & Peenya', tierId: 'standard', basePrice: 1200, pincodes: ['560064', '560013', '560058', '560097'], keywords: ['yelahanka', 'yelahanka new town', 'jalahalli', 'peenya', 'vidyaranyapura', 'yeshwanthpur', 'nagasandra'] },
  { state: 'Karnataka', city: 'Bengaluru', subArea: 'KR Puram, Mahadevapura & Ramamurthy Nagar', tierId: 'standard', basePrice: 1200, pincodes: ['560036', '560048', '560016', '560049'], keywords: ['kr puram', 'mahadevapura', 'ramamurthy nagar', 'horamavu', 'tc palya', 'battarahalli'] },
  { state: 'Karnataka', city: 'Mysuru', subArea: 'Gokulam, Jayalakshmipuram & Vijayanagar', tierId: 'standard', basePrice: 1200, pincodes: ['570002', '570012', '570017', '570023'], keywords: ['mysuru', 'mysore', 'gokulam', 'jayalakshmipuram', 'saraswathipuram', 'vijayanagar mysore', 'kuvempunagar'] },
  { state: 'Karnataka', city: 'Mangaluru', subArea: 'Kadri, Bejai & Lalbagh', tierId: 'standard', basePrice: 1200, pincodes: ['575002', '575004', '575003', '575001'], keywords: ['mangaluru', 'mangalore', 'kadri', 'bejai', 'lalbagh mangalore', 'mannagudda', 'falnir'] },
  { state: 'Karnataka', city: 'Hubballi-Dharwad', subArea: 'Vidyanagar, Gokul Rd & Dharwad City', tierId: 'standard', basePrice: 1200, pincodes: ['580021', '580030', '580001'], keywords: ['hubballi', 'hubli', 'dharwad', 'vidyanagar hubli', 'gokul road'] },

  // Economy Tier (₹1,000)
  { state: 'Karnataka', city: 'Bengaluru Outskirts', subArea: 'Hoskote, Nelamangala & Bidadi', tierId: 'economy', basePrice: 1000, pincodes: ['562114', '562123', '562109', '562106', '560105'], keywords: ['hoskote', 'nelamangala', 'bidadi', 'anekal', 'jigani', 'attibele', 'chandapura', 'sarjapura town'] },

  // ─── TELANGANA : HYDERABAD ──────────────────────────────────────
  // Luxury Tier (₹2,000)
  { state: 'Telangana', city: 'Hyderabad', subArea: 'Jubilee Hills & Banjara Hills', tierId: 'luxury', basePrice: 2000, pincodes: ['500033', '500034', '500096'], keywords: ['jubilee hills', 'banjara hills', 'film nagar', 'road no 36 jubilee hills', 'road no 12 banjara hills', 'prashasan nagar'] },

  // Premium Tier (₹1,500)
  { state: 'Telangana', city: 'Hyderabad', subArea: 'Gachibowli, HITEC City & Madhapur', tierId: 'premium', basePrice: 1500, pincodes: ['500032', '500081', '500084', '500075'], keywords: ['gachibowli', 'hitec city', 'madhapur', 'kondapur', 'financial district hyderabad', 'nanakramguda', 'kokapet', 'gandipet'] },
  { state: 'Telangana', city: 'Hyderabad', subArea: 'Kukatpally, Miyapur & Manikonda', tierId: 'premium', basePrice: 1500, pincodes: ['500072', '500049', '500089', '500090'], keywords: ['kukatpally', 'kphb', 'miyapur', 'manikonda', 'puppalguda', 'nizampet', 'bachupally', 'pragathi nagar'] },
  { state: 'Telangana', city: 'Hyderabad', subArea: 'Begumpet, Somajiguda & Himayatnagar', tierId: 'premium', basePrice: 1500, pincodes: ['500016', '500082', '500029', '500073'], keywords: ['begumpet', 'somajiguda', 'panjagutta', 'ameerpet', 'himayatnagar', 'srinagar colony', 'sr nagar'] },
  { state: 'Telangana', city: 'Secunderabad', subArea: 'Marredpally, Sainikpuri & Kharkhana', tierId: 'premium', basePrice: 1500, pincodes: ['500026', '500094', '500009', '500015'], keywords: ['secunderabad', 'marredpally', 'sainikpuri', 'kharkhana', 'trimulgherry', 'as rao nagar', 'ecil', 'tarnaka'] },

  // Standard Tier (₹1,200)
  { state: 'Telangana', city: 'Hyderabad', subArea: 'Dilsukhnagar, LB Nagar & Uppal', tierId: 'standard', basePrice: 1200, pincodes: ['500060', '500074', '500039', '500035'], keywords: ['dilsukhnagar', 'lb nagar', 'uppal', 'nagole', 'kothapet', 'saroornagar', 'boduppal', 'vanasthalipuram'] },
  { state: 'Telangana', city: 'Hyderabad', subArea: 'Mehdipatnam, Tolichowki & Attapur', tierId: 'standard', basePrice: 1200, pincodes: ['500028', '500008', '500048', '500030'], keywords: ['mehdipatnam', 'tolichowki', 'attapur', 'shaikpet', 'rajendranagar', 'shamshabad'] },
  { state: 'Telangana', city: 'Hyderabad', subArea: 'Kompally, Bowenpally & Alwal', tierId: 'standard', basePrice: 1200, pincodes: ['500014', '500011', '500010', '500047'], keywords: ['kompally', 'bowenpally', 'alwal', 'malkajgiri', 'suchitra'] },
  { state: 'Telangana', city: 'Warangal', subArea: 'Hanamkonda & Kazipet', tierId: 'standard', basePrice: 1200, pincodes: ['506001', '506002', '506004'], keywords: ['warangal', 'hanamkonda', 'kazipet'] },

  // ─── TAMIL NADU : CHENNAI & STATE ────────────────────────────────
  // Luxury Tier (₹2,000)
  { state: 'Tamil Nadu', city: 'Chennai', subArea: 'Boat Club Road, Poes Garden & RA Puram', tierId: 'luxury', basePrice: 2000, pincodes: ['600028', '600086', '600018', '600034'], keywords: ['boat club chennai', 'poes garden', 'ra puram', 'alwarpet', 'nungambakkam', 'cenotaph road', 'mrc nagar'] },

  // Premium Tier (₹1,500)
  { state: 'Tamil Nadu', city: 'Chennai', subArea: 'Anna Nagar, Kilpauk & Shenoy Nagar', tierId: 'premium', basePrice: 1500, pincodes: ['600040', '600101', '600102', '600010', '600030'], keywords: ['anna nagar', 'anna nagar east', 'anna nagar west', 'kilpauk', 'shenoy nagar', 'chetpet', 'chintamani'] },
  { state: 'Tamil Nadu', city: 'Chennai', subArea: 'Adyar, Besant Nagar & Thiruvanmiyur', tierId: 'premium', basePrice: 1500, pincodes: ['600020', '600090', '600041', '600085'], keywords: ['adyar', 'besant nagar', 'thiruvanmiyur', 'gandhi nagar adyar', 'kotturpuram', 'elliots beach'] },
  { state: 'Tamil Nadu', city: 'Chennai', subArea: 'T. Nagar, Mylapore & Vadapalani', tierId: 'premium', basePrice: 1500, pincodes: ['600017', '600004', '600026', '600083', '600078'], keywords: ['t nagar', 'mylapore', 'vadapalani', 'ashok nagar chennai', 'kk nagar chennai', 'kodambakkam', 'virugambakkam'] },
  { state: 'Tamil Nadu', city: 'Chennai', subArea: 'OMR IT Corridor (Perungudi to Siruseri)', tierId: 'premium', basePrice: 1500, pincodes: ['600096', '600097', '600119', '603103'], keywords: ['omr', 'perungudi', 'thoraipakkam', 'sholinganallur', 'karapakkam', 'navalur', 'siruseri', 'taramani'] },
  { state: 'Tamil Nadu', city: 'Chennai', subArea: 'ECR Corridor (Neelankarai to Injambakkam)', tierId: 'premium', basePrice: 1500, pincodes: ['600041', '600115', '600119'], keywords: ['ecr chennai', 'neelankarai', 'injambakkam', 'palavakkam', 'kottivakkam', 'akkarai', 'uthandi'] },
  { state: 'Tamil Nadu', city: 'Chennai', subArea: 'Velachery, Porur & Guindy', tierId: 'premium', basePrice: 1500, pincodes: ['600042', '600116', '600032', '600089'], keywords: ['velachery', 'porur', 'guindy', 'ramapuram', 'manapakkam', 'valasaravakkam'] },

  // Standard Tier (₹1,200)
  { state: 'Tamil Nadu', city: 'Chennai', subArea: 'Tambaram, Chromepet & Pallavaram', tierId: 'standard', basePrice: 1200, pincodes: ['600059', '600044', '600043', '600073'], keywords: ['tambaram', 'chromepet', 'pallavaram', 'selaiyur', 'sanatorium', 'perungalathur', 'vandalur'] },
  { state: 'Tamil Nadu', city: 'Chennai', subArea: 'Ambattur, Avadi & Mogappair', tierId: 'standard', basePrice: 1200, pincodes: ['600053', '600058', '600054', '600037'], keywords: ['ambattur', 'avadi', 'mogappair', 'mogappair east', 'mogappair west', 'kolathur', 'perambur', 'villivakkam'] },
  { state: 'Tamil Nadu', city: 'Coimbatore', subArea: 'RS Puram, Race Course & Peelamedu', tierId: 'standard', basePrice: 1200, pincodes: ['641002', '641018', '641004', '641012', '641035'], keywords: ['coimbatore', 'rs puram', 'race course coimbatore', 'gandhipuram', 'peelamedu', 'saravanampatti', 'saibaba colony'] },
  { state: 'Tamil Nadu', city: 'Madurai', subArea: 'KK Nagar, Anna Nagar & Tallakulam', tierId: 'standard', basePrice: 1200, pincodes: ['625020', '625002', '625010'], keywords: ['madurai', 'kk nagar madurai', 'anna nagar madurai', 'tallakulam', 'ss colony'] },
  { state: 'Tamil Nadu', city: 'Tiruchirappalli', subArea: 'Thillai Nagar & Cantonment', tierId: 'standard', basePrice: 1200, pincodes: ['620018', '620001', '620021'], keywords: ['trichy', 'tiruchirappalli', 'thillai nagar', 'cantonment trichy', 'srirangam'] },

  // ─── GUJARAT : AHMEDABAD, SURAT, VADODARA ─────────────────────────
  { state: 'Gujarat', city: 'Ahmedabad', subArea: 'SG Highway, Bodakdev & Prahlad Nagar', tierId: 'premium', basePrice: 1500, pincodes: ['380054', '380015', '380059', '380058'], keywords: ['ahmedabad', 'sg highway', 'bodakdev', 'prahlad nagar', 'satellite ahmedabad', 'vastrapur', 'sindhu bhavan road', 'thaltej', 'bopal', 'south bopal', 'science city'] },
  { state: 'Gujarat', city: 'Ahmedabad', subArea: 'Navrangpura, Paldi & CG Road', tierId: 'premium', basePrice: 1500, pincodes: ['380009', '380006', '380007', '380013'], keywords: ['navrangpura', 'paldi', 'cg road', 'ellis bridge', 'ambawadi', 'naranpura', 'memnagar'] },
  { state: 'Gujarat', city: 'Ahmedabad', subArea: 'Maninagar, Chandkheda & Gota', tierId: 'standard', basePrice: 1200, pincodes: ['380008', '382424', '382481', '380005', '382330'], keywords: ['maninagar', 'chandkheda', 'motera', 'gota', 'ghatlodiya', 'sabarmati', 'naroda', 'nikol'] },
  { state: 'Gujarat', city: 'Gandhinagar', subArea: 'GIFT City, Infocity & Sector 1-30', tierId: 'standard', basePrice: 1200, pincodes: ['382355', '382007', '382421', '382010'], keywords: ['gandhinagar', 'gift city', 'infocity gandhinagar', 'kudasan', 'raysan', 'randesan'] },
  { state: 'Gujarat', city: 'Surat', subArea: 'Vesu, Piplod, City Light & Adajan', tierId: 'standard', basePrice: 1200, pincodes: ['395007', '395009', '395017'], keywords: ['surat', 'vesu', 'piplod', 'city light surat', 'adajan', 'althan', 'pal surat', 'ghod dod road'] },
  { state: 'Gujarat', city: 'Vadodara', subArea: 'Alkapuri, Gotri, Vasna & Bhayli', tierId: 'standard', basePrice: 1200, pincodes: ['390007', '390021', '391410', '390020', '390011'], keywords: ['vadodara', 'baroda', 'alkapuri', 'gotri', 'vasna vadodara', 'bhayli', 'akota', 'manjalpur', 'karelibaug'] },
  { state: 'Gujarat', city: 'Rajkot', subArea: 'Kalawad Road & University Road', tierId: 'standard', basePrice: 1200, pincodes: ['360005', '360001', '360004'], keywords: ['rajkot', 'kalawad road', 'university road rajkot', 'yagnik road', '150ft ring road'] },

  // ─── WEST BENGAL : KOLKATA ───────────────────────────────────────
  { state: 'West Bengal', city: 'Kolkata', subArea: 'Alipore, Ballygunge & Queens Park', tierId: 'luxury', basePrice: 2000, pincodes: ['700027', '700019', '700016', '700071'], keywords: ['alipore', 'ballygunge', 'park street kolkata', 'queens park kolkata', 'camac street', 'shakespeare sarani', 'loudon street'] },
  { state: 'West Bengal', city: 'Kolkata', subArea: 'Salt Lake (Sector 1-5) & New Town', tierId: 'premium', basePrice: 1500, pincodes: ['700064', '700091', '700156', '700157', '700160'], keywords: ['salt lake kolkata', 'bidhannagar', 'salt lake sector 5', 'new town kolkata', 'rajarhat', 'action area 1', 'action area 2', 'eco park kolkata'] },
  { state: 'West Bengal', city: 'Kolkata', subArea: 'South Kolkata (Southern Ave, Gariahat & Tollygunge)', tierId: 'premium', basePrice: 1500, pincodes: ['700029', '700033', '700053', '700068', '700032'], keywords: ['southern avenue', 'gariahat', 'tollygunge', 'new alipore', 'jodhpur park', 'lake gardens', 'south city kolkata', 'jadavpur'] },
  { state: 'West Bengal', city: 'Kolkata', subArea: 'EM Bypass, Kasba & Behala', tierId: 'standard', basePrice: 1200, pincodes: ['700099', '700107', '700042', '700034', '700089', '700028'], keywords: ['em bypass', 'ruby hospital kolkata', 'kasba', 'behala', 'lake town kolkata', 'kestopur', 'dum dum', 'vip road kolkata', 'howrah'] },

  // ─── RAJASTHAN : JAIPUR & REST ──────────────────────────────────
  { state: 'Rajasthan', city: 'Jaipur', subArea: 'C-Scheme, Civil Lines & Malviya Nagar', tierId: 'premium', basePrice: 1500, pincodes: ['302001', '302006', '302017', '302021', '302004'], keywords: ['jaipur', 'c scheme jaipur', 'civil lines jaipur', 'malviya nagar jaipur', 'vaishali nagar jaipur', 'raja park jaipur'] },
  { state: 'Rajasthan', city: 'Jaipur', subArea: 'Mansarovar, Jagatpura & Tonk Road', tierId: 'standard', basePrice: 1200, pincodes: ['302020', '302015', '302016', '302039'], keywords: ['mansarovar jaipur', 'jagatpura jaipur', 'tonk road jaipur', 'bani park', 'vidhyadhar nagar', 'ajmer road jaipur'] },
  { state: 'Rajasthan', city: 'Jodhpur', subArea: 'Shastri Nagar & Sardarpura', tierId: 'standard', basePrice: 1200, pincodes: ['342001', '342003', '342011'], keywords: ['jodhpur', 'shastri nagar jodhpur', 'sardarpura', 'ratanada'] },
  { state: 'Rajasthan', city: 'Udaipur', subArea: 'Panchwati, Fatehpura & Hiran Magri', tierId: 'standard', basePrice: 1200, pincodes: ['313001', '313002', '313004'], keywords: ['udaipur', 'panchwati udaipur', 'fatehpura', 'hiran magri', 'sukhadia circle'] },

  // ─── UTTAR PRADESH : LUCKNOW & REST ─────────────────────────────
  { state: 'Uttar Pradesh', city: 'Lucknow', subArea: 'Gomti Nagar, Hazratganj & Aliganj', tierId: 'premium', basePrice: 1500, pincodes: ['226010', '226001', '226024', '226006', '226016'], keywords: ['lucknow', 'gomti nagar', 'gomti nagar extension', 'hazratganj', 'aliganj lucknow', 'mahanagar lucknow', 'indira nagar lucknow', 'sushant golf city'] },
  { state: 'Uttar Pradesh', city: 'Lucknow', subArea: 'Alambagh, Ashiyana & Jankipuram', tierId: 'standard', basePrice: 1200, pincodes: ['226005', '226012', '226021', '226022'], keywords: ['alambagh', 'ashiyana lucknow', 'jankipuram', 'vikas nagar lucknow', 'chowk lucknow'] },
  { state: 'Uttar Pradesh', city: 'Kanpur', subArea: 'Civil Lines, Swaroop Nagar & Kakadeo', tierId: 'standard', basePrice: 1200, pincodes: ['208001', '208002', '208025', '208017'], keywords: ['kanpur', 'civil lines kanpur', 'swaroop nagar', 'kakadeo', 'kalyanpur kanpur', 'kidwai nagar'] },
  { state: 'Uttar Pradesh', city: 'Varanasi', subArea: 'Sigra, Bhelupur, Cantt & Lanka', tierId: 'standard', basePrice: 1200, pincodes: ['221001', '221002', '221005', '221010'], keywords: ['varanasi', 'banaras', 'kashi', 'sigra', 'bhelupur', 'lanka varanasi', 'mahmoorganj', 'cantonment varanasi'] },
  { state: 'Uttar Pradesh', city: 'Prayagraj', subArea: 'Civil Lines & George Town', tierId: 'standard', basePrice: 1200, pincodes: ['211001', '211002', '211003'], keywords: ['prayagraj', 'allahabad', 'civil lines allahabad', 'george town allahabad', 'ashok nagar allahabad'] },

  // ─── KERALA : KOCHI & THIRUVANANTHAPURAM ─────────────────────────
  { state: 'Kerala', city: 'Kochi', subArea: 'Marine Drive, Panampilly Nagar & Kakkanad', tierId: 'premium', basePrice: 1500, pincodes: ['682031', '682036', '682030', '682024', '682020'], keywords: ['kochi', 'cochin', 'ernakulam', 'marine drive kochi', 'panampilly nagar', 'kakkanad', 'infopark kochi', 'edappally', 'kadavanthra', 'kaloor', 'vyttila', 'palarivattom'] },
  { state: 'Kerala', city: 'Thiruvananthapuram', subArea: 'Kowdiar, Sasthamangalam & Technopark', tierId: 'premium', basePrice: 1500, pincodes: ['695003', '695010', '695014', '695581', '695004'], keywords: ['thiruvananthapuram', 'trivandrum', 'kowdiar', 'sasthamangalam', 'vazhuthacaud', 'technopark trivandrum', 'kazhakkoottam', 'pattom'] },
  { state: 'Kerala', city: 'Kozhikode', subArea: 'Calicut City & Mavoor Road', tierId: 'standard', basePrice: 1200, pincodes: ['673001', '673004', '673016'], keywords: ['kozhikode', 'calicut', 'mavoor road', 'nadakkavu'] },

  // ─── MADHYA PRADESH : INDORE & BHOPAL ────────────────────────────
  { state: 'Madhya Pradesh', city: 'Indore', subArea: 'Vijay Nagar, Saket & Palasia', tierId: 'premium', basePrice: 1500, pincodes: ['452010', '452018', '452001', '452016'], keywords: ['indore', 'vijay nagar indore', 'saket indore', 'palasia', 'new palasia', 'ab road indore', 'super corridor indore', 'nipania', 'mahalaxmi nagar indore'] },
  { state: 'Madhya Pradesh', city: 'Bhopal', subArea: 'Arera Colony, MP Nagar & Shahpura', tierId: 'standard', basePrice: 1200, pincodes: ['462016', '462011', '462039', '462003', '462042'], keywords: ['bhopal', 'arera colony', 'mp nagar bhopal', 'shahpura bhopal', 'chunabhatti bhopal', 'kolar road bhopal', 'tt nagar'] },

  // ─── PUNJAB & CHANDIGARH & HARYANA ──────────────────────────────
  { state: 'Chandigarh', city: 'Chandigarh', subArea: 'Sector 1-35 & Manimajra', tierId: 'premium', basePrice: 1500, pincodes: ['160001', '160008', '160009', '160017', '160022', '160035', '160101'], keywords: ['chandigarh', 'sector 8 chandigarh', 'sector 9 chandigarh', 'sector 17 chandigarh', 'sector 35 chandigarh', 'manimajra'] },
  { state: 'Punjab', city: 'Mohali', subArea: 'Phase 1-11 & Sector 66-82', tierId: 'standard', basePrice: 1200, pincodes: ['160055', '160059', '160062', '160071'], keywords: ['mohali', 'sas nagar', 'phase 7 mohali', 'sector 70 mohali', 'sector 82 mohali', 'aerocity mohali'] },
  { state: 'Haryana', city: 'Panchkula', subArea: 'Sector 1-21 & MDC', tierId: 'standard', basePrice: 1200, pincodes: ['134109', '134112', '134114'], keywords: ['panchkula', 'sector 20 panchkula', 'sector 4 panchkula', 'mdc panchkula'] },
  { state: 'Punjab', city: 'Ludhiana', subArea: 'Saraba Nagar, Civil Lines & Model Town', tierId: 'standard', basePrice: 1200, pincodes: ['141001', '141002', '141012'], keywords: ['ludhiana', 'saraba nagar', 'civil lines ludhiana', 'brs nagar', 'model town ludhiana'] },
  { state: 'Punjab', city: 'Amritsar', subArea: 'Ranjit Avenue & Mall Road', tierId: 'standard', basePrice: 1200, pincodes: ['143001', '143002'], keywords: ['amritsar', 'ranjit avenue', 'mall road amritsar', 'lawrence road amritsar'] },

  // ─── BIHAR & JHARKHAND & ODISHA & CHHATTISGARH ───────────────────
  { state: 'Bihar', city: 'Patna', subArea: 'Boring Road, Bailey Road & Kankarbagh', tierId: 'standard', basePrice: 1200, pincodes: ['800001', '800013', '800014', '800020', '801503'], keywords: ['patna', 'boring road', 'bailey road patna', 'kankarbagh', 'patliputra colony', 'rajendra nagar patna', 'danapur', 'saguna more'] },
  { state: 'Jharkhand', city: 'Ranchi', subArea: 'Morabadi, Ashok Nagar & Kanke Road', tierId: 'standard', basePrice: 1200, pincodes: ['834008', '834002', '834001', '834009'], keywords: ['ranchi', 'morabadi', 'ashok nagar ranchi', 'kanke road', 'lalpur ranchi', 'doranda', 'bariatu'] },
  { state: 'Jharkhand', city: 'Jamshedpur', subArea: 'Bistupur, Sakchi & Kadma', tierId: 'standard', basePrice: 1200, pincodes: ['831001', '831005', '831011', '831004'], keywords: ['jamshedpur', 'tatanagar', 'bistupur', 'sakchi', 'kadma', 'sonari', 'telco jamshedpur'] },
  { state: 'Odisha', city: 'Bhubaneswar', subArea: 'Saheed Nagar, Jayadev Vihar & Patia', tierId: 'standard', basePrice: 1200, pincodes: ['751007', '751013', '751024', '751016'], keywords: ['bhubaneswar', 'saheed nagar', 'jayadev vihar', 'patia', 'chandrasekharpur', 'infocity bhubaneswar', 'nayapalli', 'khandagiri'] },
  { state: 'Chhattisgarh', city: 'Raipur', subArea: 'Civil Lines, Shankar Nagar & VIP Road', tierId: 'standard', basePrice: 1200, pincodes: ['492001', '492006', '492007', '492018'], keywords: ['raipur', 'civil lines raipur', 'shankar nagar raipur', 'vip road raipur', 'telibandha', 'devendra nagar', 'naya raipur'] },

  // ─── GOA & UTTARAKHAND & HIMACHAL & OTHER STATES ─────────────────
  { state: 'Goa', city: 'Panaji', subArea: 'Panaji, Miramar, Dona Paula & Porvorim', tierId: 'premium', basePrice: 1500, pincodes: ['403001', '403004', '403521', '403516'], keywords: ['goa', 'panaji', 'panjim', 'miramar goa', 'dona paula', 'porvorim', 'calangute', 'candolim', 'margao', 'vasco'] },
  { state: 'Uttarakhand', city: 'Dehradun', subArea: 'Rajpur Road, Dalanwala & Vasant Vihar', tierId: 'standard', basePrice: 1200, pincodes: ['248001', '248006', '248013'], keywords: ['dehradun', 'rajpur road', 'dalanwala', 'vasant vihar dehradun', 'sahastradhara road', 'rishikesh', 'haridwar'] },
  { state: 'Himachal Pradesh', city: 'Shimla', subArea: 'Mall Road, Chotta Shimla & New Shimla', tierId: 'standard', basePrice: 1200, pincodes: ['171001', '171002', '171009'], keywords: ['shimla', 'mall road shimla', 'chotta shimla', 'sanjauli', 'dharamshala', 'solan', 'manali'] },
  { state: 'Assam', city: 'Guwahati', subArea: 'GS Road, Christian Basti & Dispur', tierId: 'standard', basePrice: 1200, pincodes: ['781005', '781006', '781022'], keywords: ['guwahati', 'gs road guwahati', 'christian basti', 'dispur', 'khanapara', 'zoo road guwahati'] },
];

/**
 * Fast search for any Locality, Pincode, City, or State across India
 */
export function searchAllIndiaLocalities(query: string, limit: number = 20): LocalityPricingRecord[] {
  const q = (query || '').trim().toLowerCase();
  if (!q) return ALL_INDIA_LOCALITIES_2026.slice(0, limit);

  // Exact or partial pincode match
  const isPincode = /^\d{2,6}$/.test(q);

  const matched = ALL_INDIA_LOCALITIES_2026.filter((loc) => {
    if (isPincode) {
      return loc.pincodes.some((pin) => pin.startsWith(q) || pin === q);
    }
    const inSubArea = loc.subArea.toLowerCase().includes(q);
    const inCity = loc.city.toLowerCase().includes(q);
    const inState = loc.state.toLowerCase().includes(q);
    const inKeywords = loc.keywords.some((kw) => kw.includes(q) || q.includes(kw));
    return inSubArea || inCity || inState || inKeywords;
  });

  return matched.slice(0, limit);
}

/**
 * Intelligent location matching algorithm
 * Returns appropriate tier based on location text or 6-digit pincode
 */
export function detectTierFromLocation(locationText: string): 'economy' | 'standard' | 'premium' | 'luxury' {
  const text = (locationText || '').toLowerCase().trim();
  if (!text) return 'standard';

  // 1. Check direct pincode match
  const pinMatch = text.match(/\b\d{6}\b/);
  if (pinMatch) {
    const pin = pinMatch[0];
    const found = ALL_INDIA_LOCALITIES_2026.find((l) => l.pincodes.includes(pin));
    if (found) return found.tierId;
  }

  // 2. Check Luxury keywords
  const luxuryKeys = [
    'colaba', 'cuffe parade', 'marine lines', 'marine drive', 'nariman point', 'malabar hill',
    'walkeshwar', 'nepean sea', 'altamount', 'pedder road', 'breach candy', 'carmichael',
    'worli', 'lower parel', 'pali hill', 'bandra west', 'bandstand', 'carter road', 'juhu',
    'lutyens', 'golf links', 'jor bagh', 'chanakyapuri', 'vasant vihar', 'greater kailash', 'defence colony',
    'golf course road', 'dlf phase 1', 'dlf phase 5', 'magnolias', 'aralias', 'camellias',
    'sadashivanagar', 'lavelle road', 'cunningham road', 'jubilee hills', 'banjara hills',
    'boat club', 'poes garden', 'alipore', 'ballygunge',
  ];
  if (luxuryKeys.some((k) => text.includes(k))) return 'luxury';

  // 3. Check Premium keywords
  const premiumKeys = [
    'andheri west', 'lokhandwala', 'powai', 'chembur', 'santacruz', 'khar west', 'vile parle',
    'dadar', 'prabhadevi', 'shivaji park', 'mahim', 'matunga', 'tardeo', 'byculla', 'bkc',
    'hauz khas', 'saket', 'green park', 'dwarka', 'vasant kunj', 'sohna road', 'cyber city',
    'noida sector 15', 'noida sector 44', 'noida sector 50', 'noida expressway',
    'whitefield', 'hsr layout', 'bellandur', 'sarjapur', 'jayanagar', 'jp nagar', 'malleshwaram', 'hebbal', 'electronic city',
    'gachibowli', 'hitec city', 'madhapur', 'kondapur', 'manikonda', 'begumpet', 'marredpally',
    'anna nagar', 'adyar', 'besant nagar', 't nagar', 'omr', 'ecr', 'velachery', 'porur',
    'sg highway', 'bodakdev', 'prahlad nagar', 'satellite', 'vastrapur', 'sindhu bhavan',
    'salt lake', 'new town kolkata', 'southern avenue', 'c scheme', 'gomti nagar', 'marine drive kochi',
    'koregaon park', 'kalyani nagar', 'baner', 'aundh', 'viman nagar', 'kharadi',
  ];
  if (premiumKeys.some((k) => text.includes(k))) return 'premium';

  // 4. Check Economy keywords
  const economyKeys = [
    'kalyan', 'dombivli', 'diva', 'dahisar', 'mira road', 'bhayandar', 'virar', 'nalasopara', 'vasai',
    'kurla', 'govandi', 'mankhurd', 'bhiwandi', 'ambernath', 'badlapur', 'ulhasnagar', 'titwala',
    'narela', 'bawana', 'najafgarh', 'loni', 'sahibabad', 'hoskote', 'nelamangala', 'bidadi',
  ];
  if (economyKeys.some((k) => text.includes(k))) return 'economy';

  // Default to Standard
  return 'standard';
}

/**
 * Returns full PricingTier object for a given location or pincode
 */
export function getTierForLocation(locationText: string): PricingTier {
  const tierId = detectTierFromLocation(locationText);
  return STANDARD_PRICING_TIERS[tierId] || STANDARD_PRICING_TIERS.standard;
}

/**
 * Generate custom package discounts from any base session price
 */
export function calculateCustomPackages(basePrice: number) {
  const p10Rate = Math.round(basePrice * 0.92);
  const p15Rate = Math.round(basePrice * 0.88);
  const p20Rate = Math.round(basePrice * 0.83);
  const p30Rate = Math.round(basePrice * 0.78);

  return {
    days10: {
      days: 10,
      ratePerSession: p10Rate,
      totalPrice: p10Rate * 10,
      totalSavings: (basePrice - p10Rate) * 10,
      discountPercent: Math.round(((basePrice - p10Rate) / basePrice) * 100),
    },
    days15: {
      days: 15,
      ratePerSession: p15Rate,
      totalPrice: p15Rate * 15,
      totalSavings: (basePrice - p15Rate) * 15,
      discountPercent: Math.round(((basePrice - p15Rate) / basePrice) * 100),
    },
    days20: {
      days: 20,
      ratePerSession: p20Rate,
      totalPrice: p20Rate * 20,
      totalSavings: (basePrice - p20Rate) * 20,
      discountPercent: Math.round(((basePrice - p20Rate) / basePrice) * 100),
    },
    days30: {
      days: 30,
      ratePerSession: p30Rate,
      totalPrice: p30Rate * 30,
      totalSavings: (basePrice - p30Rate) * 30,
      discountPercent: Math.round(((basePrice - p30Rate) / basePrice) * 100),
    },
  };
}

/**
 * Return all subareas/areas for any city across India
 */
export function getAreasForCity(city: string, state?: string): string[] {
  const c = (city || '').trim().toLowerCase();
  const s = (state || '').trim().toLowerCase();
  if (!c) return [];

  const found = ALL_INDIA_LOCALITIES_2026.filter((l) => {
    const cityMatch = l.city.toLowerCase() === c || l.city.toLowerCase().includes(c) || c.includes(l.city.toLowerCase());
    if (s) {
      const stateMatch = l.state.toLowerCase() === s || l.state.toLowerCase().includes(s) || s.includes(l.state.toLowerCase());
      return cityMatch && stateMatch;
    }
    return cityMatch;
  });

  const areas = new Set<string>();
  found.forEach((f) => {
    areas.add(f.subArea);
    f.keywords.forEach((k) => {
      if (k.length > 3 && !k.includes('city') && !k.includes('state')) {
        const cap = k.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
        areas.add(cap);
      }
    });
  });

  return Array.from(areas);
}

/**
 * Complete preloaded 2026 all-India session pricing dataset for initial load
 */
export const DEFAULT_ALL_INDIA_SESSION_PRICES = ALL_INDIA_LOCALITIES_2026.map((loc) => {
  const tier = STANDARD_PRICING_TIERS[loc.tierId] || STANDARD_PRICING_TIERS.standard;
  return {
    tierId: loc.tierId,
    tierName: tier.name,
    country: 'India',
    state: loc.state,
    city: loc.city,
    subArea: loc.subArea,
    areas: [loc.subArea],
    pincodes: loc.pincodes,
    price: String(loc.basePrice),
    currency: 'INR',
    service: 'Physiotherapist',
    serviceType: 'Home Visit',
    packages: {
      days10: {
        days: 10,
        ratePerSession: tier.packages.days10.ratePerSession,
        totalPrice: tier.packages.days10.totalPrice,
        totalSavings: tier.packages.days10.totalSavings,
      },
      days15: {
        days: 15,
        ratePerSession: tier.packages.days15.ratePerSession,
        totalPrice: tier.packages.days15.totalPrice,
        totalSavings: tier.packages.days15.totalSavings,
      },
      days20: {
        days: 20,
        ratePerSession: tier.packages.days20.ratePerSession,
        totalPrice: tier.packages.days20.totalPrice,
        totalSavings: tier.packages.days20.totalSavings,
      },
      days30: {
        days: 30,
        ratePerSession: tier.packages.days30.ratePerSession,
        totalPrice: tier.packages.days30.totalPrice,
        totalSavings: tier.packages.days30.totalSavings,
      },
    },
  };
});

