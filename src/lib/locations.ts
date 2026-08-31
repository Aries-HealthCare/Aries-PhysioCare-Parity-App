export type IndianSubAreaType = {
    name: string;
    slug: string;
    isActive: boolean;
    seoEnabled: boolean;
};

export type IndianAreaType = {
    name: string;
    slug: string;
    isActive: boolean;
    seoEnabled: boolean;
    subAreas?: IndianSubAreaType[];
};

export type IndianCityType = {
    name: string;
    slug: string;
    isActive: boolean;
    seoEnabled: boolean;
    areas: IndianAreaType[];
};

export type IndianStateType = {
    name: string;
    slug: string;
    isActive: boolean;
    seoEnabled: boolean;
    cities: IndianCityType[];
};

export const IndianStates: IndianStateType[] = [
    {
        name: "Maharashtra",
        slug: "maharashtra",
        isActive: true,
        seoEnabled: true,
        cities: [
            {
                name: "Mumbai", slug: "mumbai", isActive: true, seoEnabled: true, areas: [
                    {
                        name: "Colaba", slug: "colaba", isActive: true, seoEnabled: true,
                        subAreas: [
                            { name: "Colaba", slug: "colaba", isActive: true, seoEnabled: true },
                            { name: "Cuffe Parade", slug: "cuffe-parade", isActive: true, seoEnabled: true },
                            { name: "Navy Nagar", slug: "navy-nagar", isActive: true, seoEnabled: true },
                            { name: "Sassoon Dock", slug: "sassoon-dock", isActive: true, seoEnabled: true }
                        ]
                    },
                    {
                        name: "Fort", slug: "fort", isActive: true, seoEnabled: true,
                        subAreas: [
                            { name: "Fort", slug: "fort", isActive: true, seoEnabled: true },
                            { name: "Ballard Estate", slug: "ballard-estate", isActive: true, seoEnabled: true },
                            { name: "Hutatma Chowk", slug: "hutatma-chowk", isActive: true, seoEnabled: true },
                            { name: "Crawford Market", slug: "crawford-market", isActive: true, seoEnabled: true }
                        ]
                    },
                    {
                        name: "Churchgate", slug: "churchgate", isActive: true, seoEnabled: true,
                        subAreas: [
                            { name: "Churchgate", slug: "churchgate", isActive: true, seoEnabled: true }
                        ]
                    },
                    {
                        name: "Marine Lines", slug: "marine-lines", isActive: true, seoEnabled: true,
                        subAreas: [
                            { name: "Marine Lines", slug: "marine-lines", isActive: true, seoEnabled: true }
                        ]
                    },
                    {
                        name: "Nariman Point", slug: "nariman-point", isActive: true, seoEnabled: true,
                        subAreas: [
                            { name: "Nariman Point", slug: "nariman-point", isActive: true, seoEnabled: true }
                        ]
                    },
                    {
                        name: "Grant Road", slug: "grant-road", isActive: true, seoEnabled: true,
                        subAreas: [
                            { name: "Grant Road", slug: "grant-road", isActive: true, seoEnabled: true },
                            { name: "Lamington Road", slug: "lamington-road", isActive: true, seoEnabled: true },
                            { name: "Nana Chowk", slug: "nana-chowk", isActive: true, seoEnabled: true }
                        ]
                    },
                    {
                        name: "Mumbai Central", slug: "mumbai-central", isActive: true, seoEnabled: true,
                        subAreas: [
                            { name: "Mumbai Central", slug: "mumbai-central", isActive: true, seoEnabled: true }
                        ]
                    },
                    {
                        name: "Tardeo", slug: "tardeo", isActive: true, seoEnabled: true,
                        subAreas: [
                            { name: "Tardeo", slug: "tardeo", isActive: true, seoEnabled: true }
                        ]
                    },
                    {
                        name: "Mahalaxmi", slug: "mahalaxmi", isActive: true, seoEnabled: true,
                        subAreas: [
                            { name: "Mahalaxmi", slug: "mahalaxmi", isActive: true, seoEnabled: true }
                        ]
                    },
                    {
                        name: "Haji Ali", slug: "haji-ali", isActive: true, seoEnabled: true,
                        subAreas: [
                            { name: "Haji Ali", slug: "haji-ali", isActive: true, seoEnabled: true }
                        ]
                    },
                    {
                        name: "Byculla", slug: "byculla", isActive: true, seoEnabled: true,
                        subAreas: [
                            { name: "Byculla", slug: "byculla", isActive: true, seoEnabled: true },
                            { name: "Jacob Circle", slug: "jacob-circle", isActive: true, seoEnabled: true }
                        ]
                    },
                    {
                        name: "Mazgaon", slug: "mazgaon", isActive: true, seoEnabled: true,
                        subAreas: [
                            { name: "Mazgaon", slug: "mazgaon", isActive: true, seoEnabled: true },
                            { name: "Mazgaon Dock", slug: "mazgaon-dock", isActive: true, seoEnabled: true }
                        ]
                    },
                    {
                        name: "Parel", slug: "parel", isActive: true, seoEnabled: true,
                        subAreas: [
                            { name: "Parel", slug: "parel", isActive: true, seoEnabled: true }
                        ]
                    },
                    {
                        name: "Lower Parel", slug: "lower-parel", isActive: true, seoEnabled: true,
                        subAreas: [
                            { name: "Lower Parel", slug: "lower-parel", isActive: true, seoEnabled: true }
                        ]
                    },
                    {
                        name: "Worli", slug: "worli", isActive: true, seoEnabled: true,
                        subAreas: [
                            { name: "Worli", slug: "worli", isActive: true, seoEnabled: true },
                            { name: "Sea Face", slug: "sea-face", isActive: true, seoEnabled: true }
                        ]
                    },
                    {
                        name: "Prabhadevi", slug: "prabhadevi", isActive: true, seoEnabled: true,
                        subAreas: [
                            { name: "Prabhadevi", slug: "prabhadevi", isActive: true, seoEnabled: true },
                            { name: "Siddhivinayak", slug: "siddhivinayak", isActive: true, seoEnabled: true }
                        ]
                    },
                    {
                        name: "Dadar West", slug: "dadar-west", isActive: true, seoEnabled: true,
                        subAreas: [
                            { name: "Dadar West", slug: "dadar-west", isActive: true, seoEnabled: true },
                            { name: "Shivaji Park", slug: "shivaji-park", isActive: true, seoEnabled: true }
                        ]
                    },
                    {
                        name: "Dadar East", slug: "dadar-east", isActive: true, seoEnabled: true,
                        subAreas: [
                            { name: "Dadar East", slug: "dadar-east", isActive: true, seoEnabled: true }
                        ]
                    },
                    {
                        name: "Mahim West", slug: "mahim-west", isActive: true, seoEnabled: true,
                        subAreas: [
                            { name: "Mahim West", slug: "mahim-west", isActive: true, seoEnabled: true }
                        ]
                    },
                    {
                        name: "Mahim East", slug: "mahim-east", isActive: true, seoEnabled: true,
                        subAreas: [
                            { name: "Mahim East", slug: "mahim-east", isActive: true, seoEnabled: true }
                        ]
                    },
                    {
                        name: "Bandra West", slug: "bandra-west", isActive: true, seoEnabled: true,
                        subAreas: [
                            { name: "Bandra West", slug: "bandra-west", isActive: true, seoEnabled: true },
                            { name: "Pali Hill", slug: "pali-hill", isActive: true, seoEnabled: true },
                            { name: "Chuim Village", slug: "chuim-village", isActive: true, seoEnabled: true },
                            { name: "Carter Road", slug: "carter-road", isActive: true, seoEnabled: true },
                            { name: "Bandstand", slug: "bandstand", isActive: true, seoEnabled: true },
                            { name: "Chapel Road", slug: "chapel-road", isActive: true, seoEnabled: true },
                            { name: "Linking Road", slug: "linking-road", isActive: true, seoEnabled: true }
                        ]
                    },
                    {
                        name: "Bandra East", slug: "bandra-east", isActive: true, seoEnabled: true,
                        subAreas: [
                            { name: "Bandra East", slug: "bandra-east", isActive: true, seoEnabled: true },
                            { name: "Bkc", slug: "bkc", isActive: true, seoEnabled: true },
                            { name: "Kalanagar", slug: "kalanagar", isActive: true, seoEnabled: true },
                            { name: "Government Colony", slug: "government-colony", isActive: true, seoEnabled: true }
                        ]
                    },
                    {
                        name: "Andheri West", slug: "andheri-west", isActive: true, seoEnabled: true,
                        subAreas: [
                            { name: "Andheri West", slug: "andheri-west", isActive: true, seoEnabled: true },
                            { name: "Lokhandwala", slug: "lokhandwala", isActive: true, seoEnabled: true },
                            { name: "Versova", slug: "versova", isActive: true, seoEnabled: true },
                            { name: "Juhu", slug: "juhu", isActive: true, seoEnabled: true },
                            { name: "Oshiwara", slug: "oshiwara", isActive: true, seoEnabled: true },
                            { name: "Amboli", slug: "amboli", isActive: true, seoEnabled: true },
                            { name: "Yari Road", slug: "yari-road", isActive: true, seoEnabled: true },
                            { name: "Four Bungalows", slug: "four-bungalows", isActive: true, seoEnabled: true },
                            { name: "Seven Bungalows", slug: "seven-bungalows", isActive: true, seoEnabled: true },
                            { name: "Veera Desai Road", slug: "veera-desai-road", isActive: true, seoEnabled: true },
                            { name: "Dn Nagar", slug: "dn-nagar", isActive: true, seoEnabled: true }
                        ]
                    },
                    {
                        name: "Andheri East", slug: "andheri-east", isActive: true, seoEnabled: true,
                        subAreas: [
                            { name: "Chakala", slug: "chakala", isActive: true, seoEnabled: true },
                            { name: "Marol", slug: "marol", isActive: true, seoEnabled: true },
                            { name: "Sakinaka", slug: "sakinaka", isActive: true, seoEnabled: true },
                            { name: "Jb Nagar", slug: "jb-nagar", isActive: true, seoEnabled: true },
                            { name: "Midc", slug: "midc", isActive: true, seoEnabled: true },
                            { name: "Mahakali Caves", slug: "mahakali-caves", isActive: true, seoEnabled: true },
                            { name: "Vijay Nagar", slug: "vijay-nagar", isActive: true, seoEnabled: true }
                        ]
                    },
                    {
                        name: "Jogeshwari West", slug: "jogeshwari-west", isActive: true, seoEnabled: true,
                        subAreas: [
                            { name: "Behram Baug", slug: "behram-baug", isActive: true, seoEnabled: true },
                            { name: "Pratap Nagar", slug: "pratap-nagar", isActive: true, seoEnabled: true }
                        ]
                    },
                    {
                        name: "Jogeshwari East", slug: "jogeshwari-east", isActive: true, seoEnabled: true,
                        subAreas: [
                            { name: "Majaspada", slug: "majaspada", isActive: true, seoEnabled: true },
                            { name: "Meghwadi", slug: "meghwadi", isActive: true, seoEnabled: true }
                        ]
                    },
                    {
                        name: "Goregaon West", slug: "goregaon-west", isActive: true, seoEnabled: true,
                        subAreas: [
                            { name: "Motilal Nagar", slug: "motilal-nagar", isActive: true, seoEnabled: true },
                            { name: "Unnat Nagar", slug: "unnat-nagar", isActive: true, seoEnabled: true },
                            { name: "Mindspace", slug: "mindspace", isActive: true, seoEnabled: true },
                            { name: "Link Road", slug: "link-road", isActive: true, seoEnabled: true }
                        ]
                    },
                    {
                        name: "Goregaon East", slug: "goregaon-east", isActive: true, seoEnabled: true,
                        subAreas: [
                            { name: "Aarey Colony", slug: "aarey-colony", isActive: true, seoEnabled: true },
                            { name: "Nagari Nivara", slug: "nagari-nivara", isActive: true, seoEnabled: true },
                            { name: "Film City Road", slug: "film-city-road", isActive: true, seoEnabled: true }
                        ]
                    },
                    {
                        name: "Malad West", slug: "malad-west", isActive: true, seoEnabled: true,
                        subAreas: [
                            { name: "Orlem", slug: "orlem", isActive: true, seoEnabled: true },
                            { name: "Marve Road", slug: "marve-road", isActive: true, seoEnabled: true },
                            { name: "Link Road", slug: "link-road", isActive: true, seoEnabled: true }
                        ]
                    },
                    {
                        name: "Malad East", slug: "malad-east", isActive: true, seoEnabled: true,
                        subAreas: [
                            { name: "Pushpa Park", slug: "pushpa-park", isActive: true, seoEnabled: true },
                            { name: "Kurar Village", slug: "kurar-village", isActive: true, seoEnabled: true }
                        ]
                    },
                    {
                        name: "Kandivali West", slug: "kandivali-west", isActive: true, seoEnabled: true,
                        subAreas: [
                            { name: "Charkop", slug: "charkop", isActive: true, seoEnabled: true },
                            { name: "Mahavir Nagar", slug: "mahavir-nagar", isActive: true, seoEnabled: true },
                            { name: "Goraswadi", slug: "goraswadi", isActive: true, seoEnabled: true }
                        ]
                    },
                    {
                        name: "Kandivali East", slug: "kandivali-east", isActive: true, seoEnabled: true,
                        subAreas: [
                            { name: "Thakur Village", slug: "thakur-village", isActive: true, seoEnabled: true },
                            { name: "Samai Nagar", slug: "samai-nagar", isActive: true, seoEnabled: true }
                        ]
                    },
                    {
                        name: "Borivali West", slug: "borivali-west", isActive: true, seoEnabled: true,
                        subAreas: [
                            { name: "Eksar", slug: "eksar", isActive: true, seoEnabled: true },
                            { name: "Shimpoli", slug: "shimpoli", isActive: true, seoEnabled: true },
                            { name: "Ic Colony", slug: "ic-colony", isActive: true, seoEnabled: true }
                        ]
                    },
                    {
                        name: "Borivali East", slug: "borivali-east", isActive: true, seoEnabled: true,
                        subAreas: [
                            { name: "Kulupwadi", slug: "kulupwadi", isActive: true, seoEnabled: true },
                            { name: "Kanheri", slug: "kanheri", isActive: true, seoEnabled: true }
                        ]
                    },
                    {
                        name: "Dahisar West", slug: "dahisar-west", isActive: true, seoEnabled: true,
                        subAreas: [
                            { name: "Mandapeshwar", slug: "mandapeshwar", isActive: true, seoEnabled: true },
                            { name: "Boraspada", slug: "boraspada", isActive: true, seoEnabled: true }
                        ]
                    },
                    {
                        name: "Dahisar East", slug: "dahisar-east", isActive: true, seoEnabled: true,
                        subAreas: [
                            { name: "Ketkipada", slug: "ketkipada", isActive: true, seoEnabled: true },
                            { name: "Ovaripada", slug: "ovaripada", isActive: true, seoEnabled: true }
                        ]
                    },
                    {
                        name: "Sion", slug: "sion", isActive: true, seoEnabled: true,
                        subAreas: [
                            { name: "Sion", slug: "sion", isActive: true, seoEnabled: true }
                        ]
                    },
                    {
                        name: "Matunga", slug: "matunga", isActive: true, seoEnabled: true,
                        subAreas: [
                            { name: "Matunga", slug: "matunga", isActive: true, seoEnabled: true }
                        ]
                    },
                    {
                        name: "Wadala", slug: "wadala", isActive: true, seoEnabled: true,
                        subAreas: [
                            { name: "Wadala", slug: "wadala", isActive: true, seoEnabled: true }
                        ]
                    },
                    {
                        name: "Kurla West", slug: "kurla-west", isActive: true, seoEnabled: true,
                        subAreas: [
                            { name: "Kurla West", slug: "kurla-west", isActive: true, seoEnabled: true },
                            { name: "Kamgar Nagar", slug: "kamgar-nagar", isActive: true, seoEnabled: true }
                        ]
                    },
                    {
                        name: "Kurla East", slug: "kurla-east", isActive: true, seoEnabled: true,
                        subAreas: [
                            { name: "Nehrunagar", slug: "nehrunagar", isActive: true, seoEnabled: true },
                            { name: "Chunabhatti", slug: "chunabhatti", isActive: true, seoEnabled: true }
                        ]
                    },
                    {
                        name: "Ghatkopar West", slug: "ghatkopar-west", isActive: true, seoEnabled: true,
                        subAreas: [
                            { name: "Asalpha", slug: "asalpha", isActive: true, seoEnabled: true },
                            { name: "Tilak Nagar", slug: "tilak-nagar", isActive: true, seoEnabled: true }
                        ]
                    },
                    {
                        name: "Ghatkopar East", slug: "ghatkopar-east", isActive: true, seoEnabled: true,
                        subAreas: [
                            { name: "Garodia Nagar", slug: "garodia-nagar", isActive: true, seoEnabled: true },
                            { name: "Pant Nagar", slug: "pant-nagar", isActive: true, seoEnabled: true }
                        ]
                    },
                    {
                        name: "Vikhroli West", slug: "vikhroli-west", isActive: true, seoEnabled: true,
                        subAreas: [
                            { name: "Vikhroli Park", slug: "vikhroli-park", isActive: true, seoEnabled: true }
                        ]
                    },
                    {
                        name: "Vikhroli East", slug: "vikhroli-east", isActive: true, seoEnabled: true,
                        subAreas: [
                            { name: "Tagore Nagar", slug: "tagore-nagar", isActive: true, seoEnabled: true }
                        ]
                    },
                    {
                        name: "Kanjurmarg East", slug: "kanjurmarg-east", isActive: true, seoEnabled: true,
                        subAreas: [
                            { name: "Kanjurmarg East", slug: "kanjurmarg-east", isActive: true, seoEnabled: true }
                        ]
                    },
                    {
                        name: "Kanjurmarg West", slug: "kanjurmarg-west", isActive: true, seoEnabled: true,
                        subAreas: [
                            { name: "Kanjurmarg West", slug: "kanjurmarg-west", isActive: true, seoEnabled: true }
                        ]
                    },
                    {
                        name: "Bhandup West", slug: "bhandup-west", isActive: true, seoEnabled: true,
                        subAreas: [
                            { name: "Bhandup West", slug: "bhandup-west", isActive: true, seoEnabled: true }
                        ]
                    },
                    {
                        name: "Bhandup East", slug: "bhandup-east", isActive: true, seoEnabled: true,
                        subAreas: [
                            { name: "Bhandup East", slug: "bhandup-east", isActive: true, seoEnabled: true }
                        ]
                    },
                    {
                        name: "Mulund West", slug: "mulund-west", isActive: true, seoEnabled: true,
                        subAreas: [
                            { name: "Panch Rasta", slug: "panch-rasta", isActive: true, seoEnabled: true },
                            { name: "Jn Road", slug: "jn-road", isActive: true, seoEnabled: true }
                        ]
                    },
                    {
                        name: "Mulund East", slug: "mulund-east", isActive: true, seoEnabled: true,
                        subAreas: [
                            { name: "Navghar", slug: "navghar", isActive: true, seoEnabled: true }
                        ]
                    },
                    {
                        name: "Chembur", slug: "chembur", isActive: true, seoEnabled: true,
                        subAreas: [
                            { name: "Chembur", slug: "chembur", isActive: true, seoEnabled: true },
                            { name: "Tilak Nagar", slug: "tilak-nagar", isActive: true, seoEnabled: true }
                        ]
                    },
                    {
                        name: "Govandi", slug: "govandi", isActive: true, seoEnabled: true,
                        subAreas: [
                            { name: "Govandi", slug: "govandi", isActive: true, seoEnabled: true }
                        ]
                    },
                    {
                        name: "Mankhurd", slug: "mankhurd", isActive: true, seoEnabled: true,
                        subAreas: [
                            { name: "Mankhurd", slug: "mankhurd", isActive: true, seoEnabled: true }
                        ]
                    },
                    {
                        name: "Sewri", slug: "sewri", isActive: true, seoEnabled: true,
                        subAreas: [
                            { name: "Sewri", slug: "sewri", isActive: true, seoEnabled: true }
                        ]
                    },
                    {
                        name: "Borivali National Park", slug: "borivali-national-park", isActive: true, seoEnabled: true,
                        subAreas: [
                            { name: "Sanjay Gandhi National Park", slug: "sanjay-gandhi-national-park", isActive: true, seoEnabled: true }
                        ]
                    }
                ]
            },
            {
                name: "Thane", slug: "thane", isActive: true, seoEnabled: true, areas: [
                    {
                        name: "Thane West", slug: "thane-west", isActive: true, seoEnabled: true,
                        subAreas: [
                            { name: "Naupada", slug: "naupada", isActive: true, seoEnabled: true },
                            { name: "Panchpakhadi", slug: "panchpakhadi", isActive: true, seoEnabled: true },
                            { name: "Ram Maruti Road", slug: "ram-maruti-road", isActive: true, seoEnabled: true },
                            { name: "Ghantali", slug: "ghantali", isActive: true, seoEnabled: true },
                            { name: "Charai", slug: "charai", isActive: true, seoEnabled: true },
                            { name: "Hariniwas", slug: "hariniwas", isActive: true, seoEnabled: true },
                            { name: "Louiswadi", slug: "louiswadi", isActive: true, seoEnabled: true },
                            { name: "Vartak Nagar", slug: "vartak-nagar", isActive: true, seoEnabled: true },
                            { name: "Kopri", slug: "kopri", isActive: true, seoEnabled: true },
                            { name: "Khopat", slug: "khopat", isActive: true, seoEnabled: true },
                            { name: "Jambli Naka", slug: "jambli-naka", isActive: true, seoEnabled: true },
                            { name: "Teen Hath Naka", slug: "teen-hath-naka", isActive: true, seoEnabled: true },
                            { name: "Kolshet", slug: "kolshet", isActive: true, seoEnabled: true },
                            { name: "Manpada", slug: "manpada", isActive: true, seoEnabled: true },
                            { name: "Yeoor", slug: "yeoor", isActive: true, seoEnabled: true },
                            { name: "Majiwada", slug: "majiwada", isActive: true, seoEnabled: true },
                            { name: "Pokhran Road No 1", slug: "pokhran-road-no-1", isActive: true, seoEnabled: true },
                            { name: "Pokhran Road No 2", slug: "pokhran-road-no-2", isActive: true, seoEnabled: true },
                            { name: "Hiranandani Estate", slug: "hiranandani-estate", isActive: true, seoEnabled: true },
                            { name: "Waghbil", slug: "waghbil", isActive: true, seoEnabled: true },
                            { name: "Owale", slug: "owale", isActive: true, seoEnabled: true },
                            { name: "Balkum", slug: "balkum", isActive: true, seoEnabled: true }
                        ]
                    },
                    {
                        name: "Thane East", slug: "thane-east", isActive: true, seoEnabled: true,
                        subAreas: [
                            { name: "Kopri", slug: "kopri", isActive: true, seoEnabled: true },
                            { name: "Vitawa", slug: "vitawa", isActive: true, seoEnabled: true },
                            { name: "Shivaji Nagar", slug: "shivaji-nagar", isActive: true, seoEnabled: true },
                            { name: "Suvarna Nagar", slug: "suvarna-nagar", isActive: true, seoEnabled: true }
                        ]
                    },
                    {
                        name: "Kalwa", slug: "kalwa", isActive: true, seoEnabled: true,
                        subAreas: [
                            { name: "Kalwa", slug: "kalwa", isActive: true, seoEnabled: true },
                            { name: "Parsnath Township", slug: "parsnath-township", isActive: true, seoEnabled: true },
                            { name: "Chhatrapati Shivaji Nagar", slug: "chhatrapati-shivaji-nagar", isActive: true, seoEnabled: true },
                            { name: "Vitawa", slug: "vitawa", isActive: true, seoEnabled: true }
                        ]
                    },
                    {
                        name: "Mumbra", slug: "mumbra", isActive: true, seoEnabled: true,
                        subAreas: [
                            { name: "Mumbra", slug: "mumbra", isActive: true, seoEnabled: true },
                            { name: "Kausa", slug: "kausa", isActive: true, seoEnabled: true },
                            { name: "Aminiya Park", slug: "aminiya-park", isActive: true, seoEnabled: true },
                            { name: "Almas Colony", slug: "almas-colony", isActive: true, seoEnabled: true }
                        ]
                    },
                    {
                        name: "Diva", slug: "diva", isActive: true, seoEnabled: true,
                        subAreas: [
                            { name: "Diva East", slug: "diva-east", isActive: true, seoEnabled: true },
                            { name: "Diva West", slug: "diva-west", isActive: true, seoEnabled: true },
                            { name: "Agasan", slug: "agasan", isActive: true, seoEnabled: true }
                        ]
                    },
                    {
                        name: "Bhiwandi", slug: "bhiwandi", isActive: true, seoEnabled: true,
                        subAreas: [
                            { name: "Bhiwandi", slug: "bhiwandi", isActive: true, seoEnabled: true },
                            { name: "Kalher", slug: "kalher", isActive: true, seoEnabled: true },
                            { name: "Anjurphata", slug: "anjurphata", isActive: true, seoEnabled: true },
                            { name: "Kongaon", slug: "kongaon", isActive: true, seoEnabled: true },
                            { name: "Padgha", slug: "padgha", isActive: true, seoEnabled: true },
                            { name: "Rahnal", slug: "rahnal", isActive: true, seoEnabled: true },
                            { name: "Temghar", slug: "temghar", isActive: true, seoEnabled: true },
                            { name: "Varal", slug: "varal", isActive: true, seoEnabled: true },
                            { name: "Narpoli", slug: "narpoli", isActive: true, seoEnabled: true },
                            { name: "Pirangut", slug: "pirangut", isActive: true, seoEnabled: true }
                        ]
                    },
                    {
                        name: "Kalyan West", slug: "kalyan-west", isActive: true, seoEnabled: true,
                        subAreas: [
                            { name: "Kalyan West", slug: "kalyan-west", isActive: true, seoEnabled: true },
                            { name: "Khadakpada", slug: "khadakpada", isActive: true, seoEnabled: true },
                            { name: "Godrej Hill", slug: "godrej-hill", isActive: true, seoEnabled: true },
                            { name: "Ramdaswadi", slug: "ramdaswadi", isActive: true, seoEnabled: true },
                            { name: "Patripool", slug: "patripool", isActive: true, seoEnabled: true },
                            { name: "Shahad West", slug: "shahad-west", isActive: true, seoEnabled: true },
                            { name: "Titwala Road", slug: "titwala-road", isActive: true, seoEnabled: true }
                        ]
                    },
                    {
                        name: "Kalyan East", slug: "kalyan-east", isActive: true, seoEnabled: true,
                        subAreas: [
                            { name: "Kalyan East", slug: "kalyan-east", isActive: true, seoEnabled: true },
                            { name: "Vitthalwadi", slug: "vitthalwadi", isActive: true, seoEnabled: true },
                            { name: "Kolsewadi", slug: "kolsewadi", isActive: true, seoEnabled: true },
                            { name: "Katemanivli", slug: "katemanivli", isActive: true, seoEnabled: true },
                            { name: "Chinchpada", slug: "chinchpada", isActive: true, seoEnabled: true }
                        ]
                    },
                    {
                        name: "Dombivli West", slug: "dombivli-west", isActive: true, seoEnabled: true,
                        subAreas: [
                            { name: "Dombivli West", slug: "dombivli-west", isActive: true, seoEnabled: true },
                            { name: "Phadke Road", slug: "phadke-road", isActive: true, seoEnabled: true },
                            { name: "Thakurli Road", slug: "thakurli-road", isActive: true, seoEnabled: true }
                        ]
                    },
                    {
                        name: "Dombivli East", slug: "dombivli-east", isActive: true, seoEnabled: true,
                        subAreas: [
                            { name: "Dombivli East", slug: "dombivli-east", isActive: true, seoEnabled: true },
                            { name: "Manpada Road", slug: "manpada-road", isActive: true, seoEnabled: true },
                            { name: "Gharda Circle", slug: "gharda-circle", isActive: true, seoEnabled: true },
                            { name: "Desale Pada", slug: "desale-pada", isActive: true, seoEnabled: true },
                            { name: "Sonarpada", slug: "sonarpada", isActive: true, seoEnabled: true }
                        ]
                    },
                    {
                        name: "Ulhasnagar", slug: "ulhasnagar", isActive: true, seoEnabled: true,
                        subAreas: [
                            { name: "Ulhasnagar 1", slug: "ulhasnagar-1", isActive: true, seoEnabled: true },
                            { name: "Ulhasnagar 2", slug: "ulhasnagar-2", isActive: true, seoEnabled: true },
                            { name: "Ulhasnagar 3", slug: "ulhasnagar-3", isActive: true, seoEnabled: true },
                            { name: "Ulhasnagar 4", slug: "ulhasnagar-4", isActive: true, seoEnabled: true },
                            { name: "Ulhasnagar 5", slug: "ulhasnagar-5", isActive: true, seoEnabled: true },
                            { name: "Camp No 1", slug: "camp-no-1", isActive: true, seoEnabled: true },
                            { name: "Camp No 2", slug: "camp-no-2", isActive: true, seoEnabled: true },
                            { name: "Camp No 3", slug: "camp-no-3", isActive: true, seoEnabled: true },
                            { name: "Camp No 4", slug: "camp-no-4", isActive: true, seoEnabled: true },
                            { name: "Camp No 5", slug: "camp-no-5", isActive: true, seoEnabled: true }
                        ]
                    },
                    {
                        name: "Ambernath East", slug: "ambernath-east", isActive: true, seoEnabled: true,
                        subAreas: [
                            { name: "Ambernath East", slug: "ambernath-east", isActive: true, seoEnabled: true },
                            { name: "Shivaji Nagar", slug: "shivaji-nagar", isActive: true, seoEnabled: true }
                        ]
                    },
                    {
                        name: "Ambernath West", slug: "ambernath-west", isActive: true, seoEnabled: true,
                        subAreas: [
                            { name: "Ambernath West", slug: "ambernath-west", isActive: true, seoEnabled: true }
                        ]
                    },
                    {
                        name: "Badlapur East", slug: "badlapur-east", isActive: true, seoEnabled: true,
                        subAreas: [
                            { name: "Badlapur East", slug: "badlapur-east", isActive: true, seoEnabled: true },
                            { name: "Katrap", slug: "katrap", isActive: true, seoEnabled: true }
                        ]
                    },
                    {
                        name: "Badlapur West", slug: "badlapur-west", isActive: true, seoEnabled: true,
                        subAreas: [
                            { name: "Badlapur West", slug: "badlapur-west", isActive: true, seoEnabled: true },
                            { name: "Belavali", slug: "belavali", isActive: true, seoEnabled: true }
                        ]
                    },
                    {
                        name: "Mira Road East", slug: "mira-road-east", isActive: true, seoEnabled: true,
                        subAreas: [
                            { name: "Mira Road East", slug: "mira-road-east", isActive: true, seoEnabled: true },
                            { name: "Shanti Nagar", slug: "shanti-nagar", isActive: true, seoEnabled: true }
                        ]
                    },
                    {
                        name: "Mira Road West", slug: "mira-road-west", isActive: true, seoEnabled: true,
                        subAreas: [
                            { name: "Mira Road West", slug: "mira-road-west", isActive: true, seoEnabled: true },
                            { name: "Kanakia", slug: "kanakia", isActive: true, seoEnabled: true }
                        ]
                    },
                    {
                        name: "Bhayandar West", slug: "bhayandar-west", isActive: true, seoEnabled: true,
                        subAreas: [
                            { name: "Bhayandar West", slug: "bhayandar-west", isActive: true, seoEnabled: true },
                            { name: "Uttan", slug: "uttan", isActive: true, seoEnabled: true }
                        ]
                    },
                    {
                        name: "Bhayandar East", slug: "bhayandar-east", isActive: true, seoEnabled: true,
                        subAreas: [
                            { name: "Bhayandar East", slug: "bhayandar-east", isActive: true, seoEnabled: true },
                            { name: "Navghar", slug: "navghar", isActive: true, seoEnabled: true }
                        ]
                    }
                ]
            },
            {
                name: "Pune", slug: "pune", isActive: true, seoEnabled: true, areas: [
                    {
                        name: "Pune City", slug: "pune-city", isActive: true, seoEnabled: true,
                        subAreas: [
                            { name: "Shaniwar Peth", slug: "shaniwar-peth", isActive: true, seoEnabled: true },
                            { name: "Shukrawar Peth", slug: "shukrawar-peth", isActive: true, seoEnabled: true },
                            { name: "Budhwar Peth", slug: "budhwar-peth", isActive: true, seoEnabled: true },
                            { name: "Raviwar Peth", slug: "raviwar-peth", isActive: true, seoEnabled: true },
                            { name: "Somwar Peth", slug: "somwar-peth", isActive: true, seoEnabled: true },
                            { name: "Mangalwar Peth", slug: "mangalwar-peth", isActive: true, seoEnabled: true },
                            { name: "Guruvar Peth", slug: "guruvar-peth", isActive: true, seoEnabled: true },
                            { name: "Nana Peth", slug: "nana-peth", isActive: true, seoEnabled: true },
                            { name: "Ganesh Peth", slug: "ganesh-peth", isActive: true, seoEnabled: true },
                            { name: "Bhawani Peth", slug: "bhawani-peth", isActive: true, seoEnabled: true },
                            { name: "Guruwar Peth", slug: "guruwar-peth", isActive: true, seoEnabled: true }
                        ]
                    },
                    {
                        name: "Shivajinagar", slug: "shivajinagar", isActive: true, seoEnabled: true,
                        subAreas: [
                            { name: "Shivajinagar", slug: "shivajinagar", isActive: true, seoEnabled: true },
                            { name: "Model Colony", slug: "model-colony", isActive: true, seoEnabled: true },
                            { name: "Senapati Bapat Road", slug: "senapati-bapat-road", isActive: true, seoEnabled: true },
                            { name: "University Area", slug: "university-area", isActive: true, seoEnabled: true }
                        ]
                    },
                    {
                        name: "Deccan", slug: "deccan", isActive: true, seoEnabled: true,
                        subAreas: [
                            { name: "Deccan Gymkhana", slug: "deccan-gymkhana", isActive: true, seoEnabled: true }
                        ]
                    },
                    {
                        name: "Prabhat Road", slug: "prabhat-road", isActive: true, seoEnabled: true,
                        subAreas: [
                            { name: "Prabhat Road", slug: "prabhat-road", isActive: true, seoEnabled: true }
                        ]
                    },
                    {
                        name: "Kothrud", slug: "kothrud", isActive: true, seoEnabled: true,
                        subAreas: [
                            { name: "Kothrud", slug: "kothrud", isActive: true, seoEnabled: true },
                            { name: "Paud Road", slug: "paud-road", isActive: true, seoEnabled: true },
                            { name: "Ideal Colony", slug: "ideal-colony", isActive: true, seoEnabled: true }
                        ]
                    },
                    {
                        name: "Karve Nagar", slug: "karve-nagar", isActive: true, seoEnabled: true,
                        subAreas: [
                            { name: "Karve Nagar", slug: "karve-nagar", isActive: true, seoEnabled: true },
                            { name: "Karve Road", slug: "karve-road", isActive: true, seoEnabled: true }
                        ]
                    },
                    {
                        name: "Warje", slug: "warje", isActive: true, seoEnabled: true,
                        subAreas: [
                            { name: "Warje Malwadi", slug: "warje-malwadi", isActive: true, seoEnabled: true },
                            { name: "Warje Naka", slug: "warje-naka", isActive: true, seoEnabled: true }
                        ]
                    },
                    {
                        name: "Sadashiv Peth", slug: "sadashiv-peth", isActive: true, seoEnabled: true,
                        subAreas: [
                            { name: "Sadashiv Peth", slug: "sadashiv-peth", isActive: true, seoEnabled: true },
                            { name: "Tilak Road", slug: "tilak-road", isActive: true, seoEnabled: true },
                            { name: "Laxmi Road", slug: "laxmi-road", isActive: true, seoEnabled: true }
                        ]
                    },
                    {
                        name: "Swargate", slug: "swargate", isActive: true, seoEnabled: true,
                        subAreas: [
                            { name: "Swargate", slug: "swargate", isActive: true, seoEnabled: true }
                        ]
                    },
                    {
                        name: "Bibwewadi", slug: "bibwewadi", isActive: true, seoEnabled: true,
                        subAreas: [
                            { name: "Bibwewadi", slug: "bibwewadi", isActive: true, seoEnabled: true },
                            { name: "Upper Indiranagar", slug: "upper-indiranagar", isActive: true, seoEnabled: true }
                        ]
                    },
                    {
                        name: "Kondhwa", slug: "kondhwa", isActive: true, seoEnabled: true,
                        subAreas: [
                            { name: "Kondhwa", slug: "kondhwa", isActive: true, seoEnabled: true },
                            { name: "Kondhwa Budruk", slug: "kondhwa-budruk", isActive: true, seoEnabled: true },
                            { name: "Kondhwa Khurd", slug: "kondhwa-khurd", isActive: true, seoEnabled: true }
                        ]
                    },
                    {
                        name: "Katraj", slug: "katraj", isActive: true, seoEnabled: true,
                        subAreas: [
                            { name: "Katraj", slug: "katraj", isActive: true, seoEnabled: true }
                        ]
                    },
                    {
                        name: "Dhankawadi", slug: "dhankawadi", isActive: true, seoEnabled: true,
                        subAreas: [
                            { name: "Dhankawadi", slug: "dhankawadi", isActive: true, seoEnabled: true }
                        ]
                    },
                    {
                        name: "Hadapsar", slug: "hadapsar", isActive: true, seoEnabled: true,
                        subAreas: [
                            { name: "Hadapsar", slug: "hadapsar", isActive: true, seoEnabled: true },
                            { name: "Magarpatta", slug: "magarpatta", isActive: true, seoEnabled: true },
                            { name: "Fursungi", slug: "fursungi", isActive: true, seoEnabled: true }
                        ]
                    },
                    {
                        name: "Wanowrie", slug: "wanowrie", isActive: true, seoEnabled: true,
                        subAreas: [
                            { name: "Wanowrie", slug: "wanowrie", isActive: true, seoEnabled: true },
                            { name: "Salisbury Park", slug: "salisbury-park", isActive: true, seoEnabled: true }
                        ]
                    },
                    {
                        name: "Undri", slug: "undri", isActive: true, seoEnabled: true,
                        subAreas: [
                            { name: "Undri", slug: "undri", isActive: true, seoEnabled: true }
                        ]
                    },
                    {
                        name: "Mohammadwadi", slug: "mohammadwadi", isActive: true, seoEnabled: true,
                        subAreas: [
                            { name: "Mohammadwadi", slug: "mohammadwadi", isActive: true, seoEnabled: true }
                        ]
                    },
                    {
                        name: "Viman Nagar", slug: "viman-nagar", isActive: true, seoEnabled: true,
                        subAreas: [
                            { name: "Viman Nagar", slug: "viman-nagar", isActive: true, seoEnabled: true },
                            { name: "Lohgaon", slug: "lohgaon", isActive: true, seoEnabled: true }
                        ]
                    },
                    {
                        name: "Yerwada", slug: "yerwada", isActive: true, seoEnabled: true,
                        subAreas: [
                            { name: "Yerwada", slug: "yerwada", isActive: true, seoEnabled: true }
                        ]
                    },
                    {
                        name: "Kalyani Nagar", slug: "kalyani-nagar", isActive: true, seoEnabled: true,
                        subAreas: [
                            { name: "Kalyani Nagar", slug: "kalyani-nagar", isActive: true, seoEnabled: true }
                        ]
                    },
                    {
                        name: "Nagar Road", slug: "nagar-road", isActive: true, seoEnabled: true,
                        subAreas: [
                            { name: "Nagar Road", slug: "nagar-road", isActive: true, seoEnabled: true }
                        ]
                    },
                    {
                        name: "Aundh", slug: "aundh", isActive: true, seoEnabled: true,
                        subAreas: [
                            { name: "Aundh", slug: "aundh", isActive: true, seoEnabled: true }
                        ]
                    },
                    {
                        name: "Baner", slug: "baner", isActive: true, seoEnabled: true,
                        subAreas: [
                            { name: "Baner", slug: "baner", isActive: true, seoEnabled: true },
                            { name: "Baner Pashan Link Road", slug: "baner-pashan-link-road", isActive: true, seoEnabled: true }
                        ]
                    },
                    {
                        name: "Balewadi", slug: "balewadi", isActive: true, seoEnabled: true,
                        subAreas: [
                            { name: "Balewadi", slug: "balewadi", isActive: true, seoEnabled: true }
                        ]
                    },
                    {
                        name: "Pashan", slug: "pashan", isActive: true, seoEnabled: true,
                        subAreas: [
                            { name: "Pashan", slug: "pashan", isActive: true, seoEnabled: true }
                        ]
                    },
                    {
                        name: "Hinjewadi", slug: "hinjewadi", isActive: true, seoEnabled: true,
                        subAreas: [
                            { name: "Hinjewadi Phase 1", slug: "hinjewadi-phase-1", isActive: true, seoEnabled: true },
                            { name: "Hinjewadi Phase 2", slug: "hinjewadi-phase-2", isActive: true, seoEnabled: true },
                            { name: "Hinjewadi Phase 3", slug: "hinjewadi-phase-3", isActive: true, seoEnabled: true }
                        ]
                    },
                    {
                        name: "Wakad", slug: "wakad", isActive: true, seoEnabled: true,
                        subAreas: [
                            { name: "Wakad", slug: "wakad", isActive: true, seoEnabled: true }
                        ]
                    },
                    {
                        name: "Tathawade", slug: "tathawade", isActive: true, seoEnabled: true,
                        subAreas: [
                            { name: "Tathawade", slug: "tathawade", isActive: true, seoEnabled: true }
                        ]
                    },
                    {
                        name: "Punawale", slug: "punawale", isActive: true, seoEnabled: true,
                        subAreas: [
                            { name: "Punawale", slug: "punawale", isActive: true, seoEnabled: true }
                        ]
                    },
                    {
                        name: "Pimpri", slug: "pimpri", isActive: true, seoEnabled: true,
                        subAreas: [
                            { name: "Pimpri", slug: "pimpri", isActive: true, seoEnabled: true }
                        ]
                    },
                    {
                        name: "Chinchwad", slug: "chinchwad", isActive: true, seoEnabled: true,
                        subAreas: [
                            { name: "Chinchwad", slug: "chinchwad", isActive: true, seoEnabled: true },
                            { name: "Akurdi", slug: "akurdi", isActive: true, seoEnabled: true },
                            { name: "Nigdi", slug: "nigdi", isActive: true, seoEnabled: true },
                            { name: "Pradhikaran", slug: "pradhikaran", isActive: true, seoEnabled: true }
                        ]
                    },
                    {
                        name: "Bhosari", slug: "bhosari", isActive: true, seoEnabled: true,
                        subAreas: [
                            { name: "Bhosari", slug: "bhosari", isActive: true, seoEnabled: true },
                            { name: "Moshi", slug: "moshi", isActive: true, seoEnabled: true }
                        ]
                    },
                    {
                        name: "Dhanori", slug: "dhanori", isActive: true, seoEnabled: true,
                        subAreas: [
                            { name: "Dhanori", slug: "dhanori", isActive: true, seoEnabled: true }
                        ]
                    },
                    {
                        name: "Vishrantwadi", slug: "vishrantwadi", isActive: true, seoEnabled: true,
                        subAreas: [
                            { name: "Vishrantwadi", slug: "vishrantwadi", isActive: true, seoEnabled: true }
                        ]
                    },
                    {
                        name: "Alandi Road", slug: "alandi-road", isActive: true, seoEnabled: true,
                        subAreas: [
                            { name: "Alandi Road", slug: "alandi-road", isActive: true, seoEnabled: true }
                        ]
                    },
                    {
                        name: "Charholi", slug: "charholi", isActive: true, seoEnabled: true,
                        subAreas: [
                            { name: "Charholi", slug: "charholi", isActive: true, seoEnabled: true }
                        ]
                    },
                    {
                        name: "Kharadi", slug: "kharadi", isActive: true, seoEnabled: true,
                        subAreas: [
                            { name: "Kharadi", slug: "kharadi", isActive: true, seoEnabled: true },
                            { name: "Eon It Park", slug: "eon-it-park", isActive: true, seoEnabled: true }
                        ]
                    },
                    {
                        name: "Wagholi", slug: "wagholi", isActive: true, seoEnabled: true,
                        subAreas: [
                            { name: "Wagholi", slug: "wagholi", isActive: true, seoEnabled: true }
                        ]
                    },
                    {
                        name: "Sinhagad Road", slug: "sinhagad-road", isActive: true, seoEnabled: true,
                        subAreas: [
                            { name: "Sinhagad Road", slug: "sinhagad-road", isActive: true, seoEnabled: true }
                        ]
                    },
                    {
                        name: "Dhayari", slug: "dhayari", isActive: true, seoEnabled: true,
                        subAreas: [
                            { name: "Dhayari", slug: "dhayari", isActive: true, seoEnabled: true },
                            { name: "Dhayari Phata", slug: "dhayari-phata", isActive: true, seoEnabled: true }
                        ]
                    },
                    {
                        name: "Bavdhan", slug: "bavdhan", isActive: true, seoEnabled: true,
                        subAreas: [
                            { name: "Bavdhan", slug: "bavdhan", isActive: true, seoEnabled: true }
                        ]
                    },
                    {
                        name: "Nda Road", slug: "nda-road", isActive: true, seoEnabled: true,
                        subAreas: [
                            { name: "Nda Road", slug: "nda-road", isActive: true, seoEnabled: true }
                        ]
                    },
                    {
                        name: "Sus", slug: "sus", isActive: true, seoEnabled: true,
                        subAreas: [
                            { name: "Sus", slug: "sus", isActive: true, seoEnabled: true }
                        ]
                    },
                    {
                        name: "Camp", slug: "camp", isActive: true, seoEnabled: true,
                        subAreas: [
                            { name: "Camp", slug: "camp", isActive: true, seoEnabled: true },
                            { name: "Mg Road", slug: "mg-road", isActive: true, seoEnabled: true }
                        ]
                    },
                    {
                        name: "Koregaon Park", slug: "koregaon-park", isActive: true, seoEnabled: true,
                        subAreas: [
                            { name: "Koregaon Park", slug: "koregaon-park", isActive: true, seoEnabled: true }
                        ]
                    },
                    {
                        name: "Talegaon", slug: "talegaon", isActive: true, seoEnabled: true,
                        subAreas: [
                            { name: "Talegaon Dabhade", slug: "talegaon-dabhade", isActive: true, seoEnabled: true }
                        ]
                    },
                    {
                        name: "Chakan", slug: "chakan", isActive: true, seoEnabled: true,
                        subAreas: [
                            { name: "Chakan", slug: "chakan", isActive: true, seoEnabled: true },
                            { name: "Mahindra Midc", slug: "mahindra-midc", isActive: true, seoEnabled: true }
                        ]
                    }
                ]
            }
        ]
    },
    {
        name: "Delhi NCR",
        slug: "delhi",
        isActive: true,
        seoEnabled: true,
        cities: [
            {
                name: "Delhi", slug: "delhi", isActive: true, seoEnabled: true, areas: [
                    {
                        name: "Central Delhi", slug: "central-delhi", isActive: true, seoEnabled: true,
                        subAreas: [
                            { name: "Connaught Place", slug: "connaught-place", isActive: true, seoEnabled: true },
                            { name: "Barakhamba Road", slug: "barakhamba-road", isActive: true, seoEnabled: true },
                            { name: "Jantar Mantar", slug: "jantar-mantar", isActive: true, seoEnabled: true },
                            { name: "Minto Road", slug: "minto-road", isActive: true, seoEnabled: true },
                            { name: "ITO", slug: "ito", isActive: true, seoEnabled: true },
                            { name: "Rajiv Chowk", slug: "rajiv-chowk", isActive: true, seoEnabled: true },
                            { name: "Paharganj", slug: "paharganj", isActive: true, seoEnabled: true },
                            { name: "Karol Bagh", slug: "karol-bagh", isActive: true, seoEnabled: true },
                            { name: "Rajendra Nagar", slug: "rajendra-nagar", isActive: true, seoEnabled: true },
                            { name: "Patel Nagar", slug: "patel-nagar", isActive: true, seoEnabled: true },
                            { name: "Daryaganj", slug: "daryaganj", isActive: true, seoEnabled: true },
                            { name: "Chandni Chowk", slug: "chandni-chowk", isActive: true, seoEnabled: true },
                            { name: "Kashmere Gate", slug: "kashmere-gate", isActive: true, seoEnabled: true },
                            { name: "Civil Lines", slug: "civil-lines", isActive: true, seoEnabled: true }
                        ]
                    },
                    {
                        name: "New Delhi", slug: "new-delhi", isActive: true, seoEnabled: true,
                        subAreas: [
                            { name: "India Gate", slug: "india-gate", isActive: true, seoEnabled: true },
                            { name: "Chanakyapuri", slug: "chanakyapuri", isActive: true, seoEnabled: true },
                            { name: "Diplomatic Enclave", slug: "diplomatic-enclave", isActive: true, seoEnabled: true },
                            { name: "Lodhi Road", slug: "lodhi-road", isActive: true, seoEnabled: true },
                            { name: "Khan Market", slug: "khan-market", isActive: true, seoEnabled: true },
                            { name: "Sunder Nagar", slug: "sunder-nagar", isActive: true, seoEnabled: true },
                            { name: "Akbar Road", slug: "akbar-road", isActive: true, seoEnabled: true },
                            { name: "Tilak Marg", slug: "tilak-marg", isActive: true, seoEnabled: true },
                            { name: "Gole Market", slug: "gole-market", isActive: true, seoEnabled: true }
                        ]
                    },
                    {
                        name: "South Delhi", slug: "south-delhi", isActive: true, seoEnabled: true,
                        subAreas: [
                            { name: "Greater Kailash 1", slug: "greater-kailash-1", isActive: true, seoEnabled: true },
                            { name: "Greater Kailash 2", slug: "greater-kailash-2", isActive: true, seoEnabled: true },
                            { name: "Kalkaji", slug: "kalkaji", isActive: true, seoEnabled: true },
                            { name: "Cr Park", slug: "cr-park", isActive: true, seoEnabled: true },
                            { name: "Chittaranjan Park", slug: "chittaranjan-park", isActive: true, seoEnabled: true },
                            { name: "Malviya Nagar", slug: "malviya-nagar", isActive: true, seoEnabled: true },
                            { name: "Saket", slug: "saket", isActive: true, seoEnabled: true },
                            { name: "Hauz Khas", slug: "hauz-khas", isActive: true, seoEnabled: true },
                            { name: "Hauz Khas Village", slug: "hauz-khas-village", isActive: true, seoEnabled: true },
                            { name: "Green Park", slug: "green-park", isActive: true, seoEnabled: true },
                            { name: "AIIMS", slug: "aiims", isActive: true, seoEnabled: true },
                            { name: "Defence Colony", slug: "defence-colony", isActive: true, seoEnabled: true },
                            { name: "Lajpat Nagar 1", slug: "lajpat-nagar-1", isActive: true, seoEnabled: true },
                            { name: "Lajpat Nagar 2", slug: "lajpat-nagar-2", isActive: true, seoEnabled: true },
                            { name: "Lajpat Nagar 3", slug: "lajpat-nagar-3", isActive: true, seoEnabled: true },
                            { name: "Lajpat Nagar 4", slug: "lajpat-nagar-4", isActive: true, seoEnabled: true },
                            { name: "Jangpura", slug: "jangpura", isActive: true, seoEnabled: true },
                            { name: "Ashram", slug: "ashram", isActive: true, seoEnabled: true },
                            { name: "Okhla", slug: "okhla", isActive: true, seoEnabled: true },
                            { name: "Okhla Phase 1", slug: "okhla-phase-1", isActive: true, seoEnabled: true },
                            { name: "Okhla Phase 2", slug: "okhla-phase-2", isActive: true, seoEnabled: true },
                            { name: "Okhla Phase 3", slug: "okhla-phase-3", isActive: true, seoEnabled: true },
                            { name: "Jamia Nagar", slug: "jamia-nagar", isActive: true, seoEnabled: true },
                            { name: "Batla House", slug: "batla-house", isActive: true, seoEnabled: true },
                            { name: "Vasant Kunj", slug: "vasant-kunj", isActive: true, seoEnabled: true },
                            { name: "Vasant Vihar", slug: "vasant-vihar", isActive: true, seoEnabled: true },
                            { name: "Munirka", slug: "munirka", isActive: true, seoEnabled: true },
                            { name: "Ber Sarai", slug: "ber-sarai", isActive: true, seoEnabled: true },
                            { name: "Katwaria Sarai", slug: "katwaria-sarai", isActive: true, seoEnabled: true },
                            { name: "Neeti Bagh", slug: "neeti-bagh", isActive: true, seoEnabled: true },
                            { name: "Panchsheel Park", slug: "panchsheel-park", isActive: true, seoEnabled: true },
                            { name: "Sheikh Sarai", slug: "sheikh-sarai", isActive: true, seoEnabled: true }
                        ]
                    },
                    {
                        name: "West Delhi", slug: "west-delhi", isActive: true, seoEnabled: true,
                        subAreas: [
                            { name: "Rajouri Garden", slug: "rajouri-garden", isActive: true, seoEnabled: true },
                            { name: "Tagore Garden", slug: "tagore-garden", isActive: true, seoEnabled: true },
                            { name: "Tilak Nagar", slug: "tilak-nagar", isActive: true, seoEnabled: true },
                            { name: "Janakpuri", slug: "janakpuri", isActive: true, seoEnabled: true },
                            { name: "Uttam Nagar", slug: "uttam-nagar", isActive: true, seoEnabled: true },
                            { name: "Dwarka Sector 1", slug: "dwarka-sector-1", isActive: true, seoEnabled: true },
                            { name: "Dwarka Sector 2", slug: "dwarka-sector-2", isActive: true, seoEnabled: true },
                            { name: "Dwarka Sector 3", slug: "dwarka-sector-3", isActive: true, seoEnabled: true },
                            { name: "Dwarka Sector 4", slug: "dwarka-sector-4", isActive: true, seoEnabled: true },
                            { name: "Dwarka Sector 5", slug: "dwarka-sector-5", isActive: true, seoEnabled: true },
                            { name: "Dwarka Sector 6", slug: "dwarka-sector-6", isActive: true, seoEnabled: true },
                            { name: "Dwarka Sector 7", slug: "dwarka-sector-7", isActive: true, seoEnabled: true },
                            { name: "Dwarka Sector 8", slug: "dwarka-sector-8", isActive: true, seoEnabled: true },
                            { name: "Dwarka Sector 9", slug: "dwarka-sector-9", isActive: true, seoEnabled: true },
                            { name: "Dwarka Sector 10", slug: "dwarka-sector-10", isActive: true, seoEnabled: true },
                            { name: "Dwarka Sector 11", slug: "dwarka-sector-11", isActive: true, seoEnabled: true },
                            { name: "Dwarka Sector 12", slug: "dwarka-sector-12", isActive: true, seoEnabled: true },
                            { name: "Dwarka Sector 13", slug: "dwarka-sector-13", isActive: true, seoEnabled: true },
                            { name: "Dwarka Sector 14", slug: "dwarka-sector-14", isActive: true, seoEnabled: true },
                            { name: "Dwarka Sector 15", slug: "dwarka-sector-15", isActive: true, seoEnabled: true },
                            { name: "Dwarka Sector 16", slug: "dwarka-sector-16", isActive: true, seoEnabled: true },
                            { name: "Dwarka Sector 17", slug: "dwarka-sector-17", isActive: true, seoEnabled: true },
                            { name: "Dwarka Sector 18", slug: "dwarka-sector-18", isActive: true, seoEnabled: true },
                            { name: "Dwarka Sector 19", slug: "dwarka-sector-19", isActive: true, seoEnabled: true },
                            { name: "Dwarka Sector 20", slug: "dwarka-sector-20", isActive: true, seoEnabled: true },
                            { name: "Dwarka Sector 21", slug: "dwarka-sector-21", isActive: true, seoEnabled: true },
                            { name: "Nangloi", slug: "nangloi", isActive: true, seoEnabled: true },
                            { name: "Paschim Vihar", slug: "paschim-vihar", isActive: true, seoEnabled: true },
                            { name: "Punjabi Bagh", slug: "punjabi-bagh", isActive: true, seoEnabled: true },
                            { name: "Kirti Nagar", slug: "kirti-nagar", isActive: true, seoEnabled: true },
                            { name: "Moti Nagar", slug: "moti-nagar", isActive: true, seoEnabled: true }
                        ]
                    },
                    {
                        name: "North Delhi", slug: "north-delhi", isActive: true, seoEnabled: true,
                        subAreas: [
                            { name: "Rohini Sector 1", slug: "rohini-sector-1", isActive: true, seoEnabled: true },
                            { name: "Rohini Sector 2", slug: "rohini-sector-2", isActive: true, seoEnabled: true },
                            { name: "Rohini Sector 3", slug: "rohini-sector-3", isActive: true, seoEnabled: true },
                            { name: "Rohini Sector 4", slug: "rohini-sector-4", isActive: true, seoEnabled: true },
                            { name: "Rohini Sector 5", slug: "rohini-sector-5", isActive: true, seoEnabled: true },
                            { name: "Rohini Sector 6", slug: "rohini-sector-6", isActive: true, seoEnabled: true },
                            { name: "Rohini Sector 7", slug: "rohini-sector-7", isActive: true, seoEnabled: true },
                            { name: "Rohini Sector 8", slug: "rohini-sector-8", isActive: true, seoEnabled: true },
                            { name: "Rohini Sector 9", slug: "rohini-sector-9", isActive: true, seoEnabled: true },
                            { name: "Rohini Sector 10", slug: "rohini-sector-10", isActive: true, seoEnabled: true },
                            { name: "Rohini Sector 11", slug: "rohini-sector-11", isActive: true, seoEnabled: true },
                            { name: "Rohini Sector 13", slug: "rohini-sector-13", isActive: true, seoEnabled: true },
                            { name: "Rohini Sector 14", slug: "rohini-sector-14", isActive: true, seoEnabled: true },
                            { name: "Rohini Sector 15", slug: "rohini-sector-15", isActive: true, seoEnabled: true },
                            { name: "Rohini Sector 16", slug: "rohini-sector-16", isActive: true, seoEnabled: true },
                            { name: "Rohini Sector 17", slug: "rohini-sector-17", isActive: true, seoEnabled: true },
                            { name: "Rohini Sector 18", slug: "rohini-sector-18", isActive: true, seoEnabled: true },
                            { name: "Rohini Sector 19", slug: "rohini-sector-19", isActive: true, seoEnabled: true },
                            { name: "Rohini Sector 20", slug: "rohini-sector-20", isActive: true, seoEnabled: true },
                            { name: "Model Town", slug: "model-town", isActive: true, seoEnabled: true },
                            { name: "Ashok Vihar", slug: "ashok-vihar", isActive: true, seoEnabled: true },
                            { name: "Wazirpur", slug: "wazirpur", isActive: true, seoEnabled: true },
                            { name: "Adarsa Nagar", slug: "adarsa-nagar", isActive: true, seoEnabled: true },
                            { name: "Burari", slug: "burari", isActive: true, seoEnabled: true },
                            { name: "Kingsway Camp", slug: "kingsway-camp", isActive: true, seoEnabled: true }
                        ]
                    },
                    {
                        name: "East Delhi", slug: "east-delhi", isActive: true, seoEnabled: true,
                        subAreas: [
                            { name: "Laxmi Nagar", slug: "laxmi-nagar", isActive: true, seoEnabled: true },
                            { name: "Preet Vihar", slug: "preet-vihar", isActive: true, seoEnabled: true },
                            { name: "Nirman Vihar", slug: "nirman-vihar", isActive: true, seoEnabled: true },
                            { name: "Shakarpur", slug: "shakarpur", isActive: true, seoEnabled: true },
                            { name: "Patparganj", slug: "patparganj", isActive: true, seoEnabled: true },
                            { name: "Mayur Vihar Phase 1", slug: "mayur-vihar-phase-1", isActive: true, seoEnabled: true },
                            { name: "Mayur Vihar Phase 2", slug: "mayur-vihar-phase-2", isActive: true, seoEnabled: true },
                            { name: "Mayur Vihar Phase 3", slug: "mayur-vihar-phase-3", isActive: true, seoEnabled: true },
                            { name: "Vasundhara Enclave", slug: "vasundhara-enclave", isActive: true, seoEnabled: true },
                            { name: "Geeta Colony", slug: "geeta-colony", isActive: true, seoEnabled: true },
                            { name: "Gandhi Nagar", slug: "gandhi-nagar", isActive: true, seoEnabled: true },
                            { name: "Krishna Nagar", slug: "krishna-nagar", isActive: true, seoEnabled: true },
                            { name: "Vivek Vihar", slug: "vivek-vihar", isActive: true, seoEnabled: true },
                            { name: "Shahdara", slug: "shahdara", isActive: true, seoEnabled: true },
                            { name: "Welcome", slug: "welcome", isActive: true, seoEnabled: true },
                            { name: "Seelampur", slug: "seelampur", isActive: true, seoEnabled: true }
                        ]
                    },
                    {
                        name: "North East Delhi", slug: "north-east-delhi", isActive: true, seoEnabled: true,
                        subAreas: [
                            { name: "Yamuna Vihar", slug: "yamuna-vihar", isActive: true, seoEnabled: true },
                            { name: "Bhajanpura", slug: "bhajanpura", isActive: true, seoEnabled: true },
                            { name: "Karawal Nagar", slug: "karawal-nagar", isActive: true, seoEnabled: true },
                            { name: "Gokalpuri", slug: "gokalpuri", isActive: true, seoEnabled: true },
                            { name: "Nand Nagri", slug: "nand-nagri", isActive: true, seoEnabled: true }
                        ]
                    },
                    {
                        name: "South West Delhi", slug: "south-west-delhi", isActive: true, seoEnabled: true,
                        subAreas: [
                            { name: "Dwarka Mor", slug: "dwarka-mor", isActive: true, seoEnabled: true },
                            { name: "Kapashera", slug: "kapashera", isActive: true, seoEnabled: true },
                            { name: "Palam", slug: "palam", isActive: true, seoEnabled: true },
                            { name: "Mahavir Enclave", slug: "mahavir-enclave", isActive: true, seoEnabled: true },
                            { name: "Bijwasan", slug: "bijwasan", isActive: true, seoEnabled: true }
                        ]
                    },
                    {
                        name: "North West Delhi", slug: "north-west-delhi", isActive: true, seoEnabled: true,
                        subAreas: [
                            { name: "Pitampura", slug: "pitampura", isActive: true, seoEnabled: true },
                            { name: "Shalimar Bagh", slug: "shalimar-bagh", isActive: true, seoEnabled: true },
                            { name: "Keshav Puram", slug: "keshav-puram", isActive: true, seoEnabled: true },
                            { name: "Tri Nagar", slug: "tri-nagar", isActive: true, seoEnabled: true }
                        ]
                    }
                ]
            }
        ]
    },
    {
        name: "Karnataka",
        slug: "karnataka",
        isActive: true,
        seoEnabled: true,
        cities: [
            {
                name: "Bengaluru", slug: "bengaluru", isActive: true, seoEnabled: true, areas: [
                    {
                        name: "Central Bengaluru", slug: "central-bengaluru", isActive: true, seoEnabled: true,
                        subAreas: [
                            { name: "MG Road", slug: "mg-road", isActive: true, seoEnabled: true },
                            { name: "Brigade Road", slug: "brigade-road", isActive: true, seoEnabled: true },
                            { name: "Church Street", slug: "church-street", isActive: true, seoEnabled: true },
                            { name: "Cunningham Road", slug: "cunningham-road", isActive: true, seoEnabled: true },
                            { name: "Richmond Town", slug: "richmond-town", isActive: true, seoEnabled: true },
                            { name: "Langford Town", slug: "langford-town", isActive: true, seoEnabled: true },
                            { name: "Shivajinagar", slug: "shivajinagar", isActive: true, seoEnabled: true },
                            { name: "Vasanth Nagar", slug: "vasanth-nagar", isActive: true, seoEnabled: true },
                            { name: "Seshadripuram", slug: "seshadripuram", isActive: true, seoEnabled: true },
                            { name: "Gandhi Nagar", slug: "gandhi-nagar", isActive: true, seoEnabled: true },
                            { name: "Cottonpete", slug: "cottonpete", isActive: true, seoEnabled: true },
                            { name: "Chickpete", slug: "chickpete", isActive: true, seoEnabled: true },
                            { name: "Cubbon Park", slug: "cubbon-park", isActive: true, seoEnabled: true },
                            { name: "Rajajinagar", slug: "rajajinagar", isActive: true, seoEnabled: true },
                            { name: "Malleswaram", slug: "malleswaram", isActive: true, seoEnabled: true }
                        ]
                    },
                    {
                        name: "South Bengaluru", slug: "south-bengaluru", isActive: true, seoEnabled: true,
                        subAreas: [
                            { name: "Jayanagar", slug: "jayanagar", isActive: true, seoEnabled: true },
                            { name: "Jp Nagar", slug: "jp-nagar", isActive: true, seoEnabled: true },
                            { name: "Banashankari", slug: "banashankari", isActive: true, seoEnabled: true },
                            { name: "Basavanagudi", slug: "basavanagudi", isActive: true, seoEnabled: true },
                            { name: "Girinagar", slug: "girinagar", isActive: true, seoEnabled: true },
                            { name: "Uttarahalli", slug: "uttarahalli", isActive: true, seoEnabled: true },
                            { name: "Kumaraswamy Layout", slug: "kumaraswamy-layout", isActive: true, seoEnabled: true },
                            { name: "Arekere", slug: "arekere", isActive: true, seoEnabled: true },
                            { name: "BTM Layout", slug: "btm-layout", isActive: true, seoEnabled: true },
                            { name: "HSR Layout", slug: "hsr-layout", isActive: true, seoEnabled: true },
                            { name: "Madiwala", slug: "madiwala", isActive: true, seoEnabled: true },
                            { name: "Hulimavu", slug: "hulimavu", isActive: true, seoEnabled: true },
                            { name: "Electronic City Phase 1", slug: "electronic-city-phase-1", isActive: true, seoEnabled: true },
                            { name: "Electronic City Phase 2", slug: "electronic-city-phase-2", isActive: true, seoEnabled: true },
                            { name: "Begur", slug: "begur", isActive: true, seoEnabled: true },
                            { name: "Hongasandra", slug: "hongasandra", isActive: true, seoEnabled: true },
                            { name: "Wilson Garden", slug: "wilson-garden", isActive: true, seoEnabled: true },
                            { name: "Koramangala 1st Block", slug: "koramangala-1st-block", isActive: true, seoEnabled: true },
                            { name: "Koramangala 2nd Block", slug: "koramangala-2nd-block", isActive: true, seoEnabled: true },
                            { name: "Koramangala 3rd Block", slug: "koramangala-3rd-block", isActive: true, seoEnabled: true },
                            { name: "Koramangala 4th Block", slug: "koramangala-4th-block", isActive: true, seoEnabled: true },
                            { name: "Koramangala 5th Block", slug: "koramangala-5th-block", isActive: true, seoEnabled: true },
                            { name: "Koramangala 6th Block", slug: "koramangala-6th-block", isActive: true, seoEnabled: true },
                            { name: "Koramangala 7th Block", slug: "koramangala-7th-block", isActive: true, seoEnabled: true },
                            { name: "Koramangala 8th Block", slug: "koramangala-8th-block", isActive: true, seoEnabled: true }
                        ]
                    },
                    {
                        name: "East Bengaluru", slug: "east-bengaluru", isActive: true, seoEnabled: true,
                        subAreas: [
                            { name: "Indiranagar", slug: "indiranagar", isActive: true, seoEnabled: true },
                            { name: "Domlur", slug: "domlur", isActive: true, seoEnabled: true },
                            { name: "Old Airport Road", slug: "old-airport-road", isActive: true, seoEnabled: true },
                            { name: "Halasuru", slug: "halasuru", isActive: true, seoEnabled: true },
                            { name: "Ulsoor", slug: "ulsoor", isActive: true, seoEnabled: true },
                            { name: "CV Raman Nagar", slug: "cv-raman-nagar", isActive: true, seoEnabled: true },
                            { name: "Kaggadasapura", slug: "kaggadasapura", isActive: true, seoEnabled: true },
                            { name: "Mahadevapura", slug: "mahadevapura", isActive: true, seoEnabled: true },
                            { name: "KR Puram", slug: "kr-puram", isActive: true, seoEnabled: true },
                            { name: "Hoodi", slug: "hoodi", isActive: true, seoEnabled: true },
                            { name: "Ramamurthy Nagar", slug: "ramamurthy-nagar", isActive: true, seoEnabled: true },
                            { name: "Whitefield", slug: "whitefield", isActive: true, seoEnabled: true },
                            { name: "ITPL", slug: "itpl", isActive: true, seoEnabled: true },
                            { name: "Brookefield", slug: "brookefield", isActive: true, seoEnabled: true },
                            { name: "Seegehalli", slug: "seegehalli", isActive: true, seoEnabled: true },
                            { name: "Varthur", slug: "varthur", isActive: true, seoEnabled: true },
                            { name: "Bellandur", slug: "bellandur", isActive: true, seoEnabled: true },
                            { name: "Kadubeesanahalli", slug: "kadubeesanahalli", isActive: true, seoEnabled: true },
                            { name: "Marathahalli", slug: "marathahalli", isActive: true, seoEnabled: true },
                            { name: "Panathur", slug: "panathur", isActive: true, seoEnabled: true }
                        ]
                    },
                    {
                        name: "North Bengaluru", slug: "north-bengaluru", isActive: true, seoEnabled: true,
                        subAreas: [
                            { name: "Hebbal", slug: "hebbal", isActive: true, seoEnabled: true },
                            { name: "Yelahanka", slug: "yelahanka", isActive: true, seoEnabled: true },
                            { name: "Yelahanka New Town", slug: "yelahanka-new-town", isActive: true, seoEnabled: true },
                            { name: "Jakkur", slug: "jakkur", isActive: true, seoEnabled: true },
                            { name: "Thanisandra", slug: "thanisandra", isActive: true, seoEnabled: true },
                            { name: "Nagavara", slug: "nagavara", isActive: true, seoEnabled: true },
                            { name: "RT Nagar", slug: "rt-nagar", isActive: true, seoEnabled: true },
                            { name: "Kalyan Nagar", slug: "kalyan-nagar", isActive: true, seoEnabled: true },
                            { name: "HRBR Layout", slug: "hrbr-layout", isActive: true, seoEnabled: true },
                            { name: "Banaswadi", slug: "banaswadi", isActive: true, seoEnabled: true },
                            { name: "Kammanahalli", slug: "kammanahalli", isActive: true, seoEnabled: true },
                            { name: "Hennur", slug: "hennur", isActive: true, seoEnabled: true },
                            { name: "Hennur Road", slug: "hennur-road", isActive: true, seoEnabled: true },
                            { name: "Vidyaranyapura", slug: "vidyaranyapura", isActive: true, seoEnabled: true },
                            { name: "Yeshwanthpur", slug: "yeshwanthpur", isActive: true, seoEnabled: true },
                            { name: "Peenya", slug: "peenya", isActive: true, seoEnabled: true },
                            { name: "Nandini Layout", slug: "nandini-layout", isActive: true, seoEnabled: true },
                            { name: "Dasarahalli", slug: "dasarahalli", isActive: true, seoEnabled: true }
                        ]
                    },
                    {
                        name: "West Bengaluru", slug: "west-bengaluru", isActive: true, seoEnabled: true,
                        subAreas: [
                            { name: "Vijayanagar", slug: "vijayanagar", isActive: true, seoEnabled: true },
                            { name: "Nagarbhavi", slug: "nagarbhavi", isActive: true, seoEnabled: true },
                            { name: "Basaveshwaranagar", slug: "basaveshwaranagar", isActive: true, seoEnabled: true },
                            { name: "Kamakshipalya", slug: "kamakshipalya", isActive: true, seoEnabled: true },
                            { name: "Magadi Road", slug: "magadi-road", isActive: true, seoEnabled: true },
                            { name: "Attiguppe", slug: "attiguppe", isActive: true, seoEnabled: true },
                            { name: "Rpc Layout", slug: "rpc-layout", isActive: true, seoEnabled: true },
                            { name: "Rajarajeshwari Nagar", slug: "rajarajeshwari-nagar", isActive: true, seoEnabled: true },
                            { name: "RR Nagar", slug: "rr-nagar", isActive: true, seoEnabled: true },
                            { name: "Kengeri", slug: "kengeri", isActive: true, seoEnabled: true },
                            { name: "Kengeri Satellite Town", slug: "kengeri-satellite-town", isActive: true, seoEnabled: true }
                        ]
                    },
                    {
                        name: "ORR Corridor", slug: "orr-corridor", isActive: true, seoEnabled: true,
                        subAreas: [
                            { name: "Sarjapur Road", slug: "sarjapur-road", isActive: true, seoEnabled: true },
                            { name: "Hsr Sector 1", slug: "hsr-sector-1", isActive: true, seoEnabled: true },
                            { name: "Hsr Sector 2", slug: "hsr-sector-2", isActive: true, seoEnabled: true },
                            { name: "Hsr Sector 3", slug: "hsr-sector-3", isActive: true, seoEnabled: true },
                            { name: "Hsr Sector 4", slug: "hsr-sector-4", isActive: true, seoEnabled: true },
                            { name: "Hsr Sector 5", slug: "hsr-sector-5", isActive: true, seoEnabled: true },
                            { name: "Hsr Sector 6", slug: "hsr-sector-6", isActive: true, seoEnabled: true },
                            { name: "Bellandur Ecospace", slug: "bellandur-ecospace", isActive: true, seoEnabled: true },
                            { name: "Ecosystem", slug: "ecosystem", isActive: true, seoEnabled: true }
                        ]
                    }
                ]
            }
        ]
    },
    {
        name: "Tamil Nadu",
        slug: "tamil-nadu",
        isActive: true,
        seoEnabled: true,
        cities: [
            {
                name: "Chennai", slug: "chennai", isActive: true, seoEnabled: true, areas: [
                    {
                        name: "Central Chennai", slug: "central-chennai", isActive: true, seoEnabled: true,
                        subAreas: [
                            { name: "Egmore", slug: "egmore", isActive: true, seoEnabled: true },
                            { name: "Nungambakkam", slug: "nungambakkam", isActive: true, seoEnabled: true },
                            { name: "Chetpet", slug: "chetpet", isActive: true, seoEnabled: true },
                            { name: "Kilpauk", slug: "kilpauk", isActive: true, seoEnabled: true },
                            { name: "Purasawalkam", slug: "purasawalkam", isActive: true, seoEnabled: true },
                            { name: "Anna Salai", slug: "anna-salai", isActive: true, seoEnabled: true },
                            { name: "Triplicane", slug: "triplicane", isActive: true, seoEnabled: true },
                            { name: "Royapettah", slug: "royapettah", isActive: true, seoEnabled: true },
                            { name: "Mylapore", slug: "mylapore", isActive: true, seoEnabled: true },
                            { name: "Alwarpet", slug: "alwarpet", isActive: true, seoEnabled: true },
                            { name: "Teynampet", slug: "teynampet", isActive: true, seoEnabled: true },
                            { name: "Thousand Lights", slug: "thousand-lights", isActive: true, seoEnabled: true },
                            { name: "George Town", slug: "george-town", isActive: true, seoEnabled: true },
                            { name: "Parrys", slug: "parrys", isActive: true, seoEnabled: true },
                            { name: "Broadway", slug: "broadway", isActive: true, seoEnabled: true }
                        ]
                    },
                    {
                        name: "North Chennai", slug: "north-chennai", isActive: true, seoEnabled: true,
                        subAreas: [
                            { name: "Tiruvottiyur", slug: "tiruvottiyur", isActive: true, seoEnabled: true },
                            { name: "Ennore", slug: "ennore", isActive: true, seoEnabled: true },
                            { name: "Washermanpet", slug: "washermanpet", isActive: true, seoEnabled: true },
                            { name: "Royapuram", slug: "royapuram", isActive: true, seoEnabled: true },
                            { name: "Tollgate", slug: "tollgate", isActive: true, seoEnabled: true },
                            { name: "Tondiarpet", slug: "tondiarpet", isActive: true, seoEnabled: true },
                            { name: "Korukkupet", slug: "korukkupet", isActive: true, seoEnabled: true },
                            { name: "Vyasarpadi", slug: "vyasarpadi", isActive: true, seoEnabled: true },
                            { name: "Perambur", slug: "perambur", isActive: true, seoEnabled: true },
                            { name: "Kolathur", slug: "kolathur", isActive: true, seoEnabled: true },
                            { name: "Madhavaram", slug: "madhavaram", isActive: true, seoEnabled: true },
                            { name: "Red Hills", slug: "red-hills", isActive: true, seoEnabled: true },
                            { name: "Manali", slug: "manali", isActive: true, seoEnabled: true },
                            { name: "Moolakadai", slug: "moolakadai", isActive: true, seoEnabled: true }
                        ]
                    },
                    {
                        name: "West Chennai", slug: "west-chennai", isActive: true, seoEnabled: true,
                        subAreas: [
                            { name: "Anna Nagar", slug: "anna-nagar", isActive: true, seoEnabled: true },
                            { name: "Anna Nagar East", slug: "anna-nagar-east", isActive: true, seoEnabled: true },
                            { name: "Anna Nagar West", slug: "anna-nagar-west", isActive: true, seoEnabled: true },
                            { name: "Mogappair", slug: "mogappair", isActive: true, seoEnabled: true },
                            { name: "Mogappair East", slug: "mogappair-east", isActive: true, seoEnabled: true },
                            { name: "Mogappair West", slug: "mogappair-west", isActive: true, seoEnabled: true },
                            { name: "Ambattur", slug: "ambattur", isActive: true, seoEnabled: true },
                            { name: "Avadi", slug: "avadi", isActive: true, seoEnabled: true },
                            { name: "Ayapakkam", slug: "ayapakkam", isActive: true, seoEnabled: true },
                            { name: "Korattur", slug: "korattur", isActive: true, seoEnabled: true },
                            { name: "Porur", slug: "porur", isActive: true, seoEnabled: true },
                            { name: "Valasaravakkam", slug: "valasaravakkam", isActive: true, seoEnabled: true },
                            { name: "Virugambakkam", slug: "virugambakkam", isActive: true, seoEnabled: true },
                            { name: "Koyambedu", slug: "koyambedu", isActive: true, seoEnabled: true },
                            { name: "Saligramam", slug: "saligramam", isActive: true, seoEnabled: true },
                            { name: "Vadapalani", slug: "vadapalani", isActive: true, seoEnabled: true },
                            { name: "Arumbakkam", slug: "arumbakkam", isActive: true, seoEnabled: true }
                        ]
                    },
                    {
                        name: "South Chennai", slug: "south-chennai", isActive: true, seoEnabled: true,
                        subAreas: [
                            { name: "Adyar", slug: "adyar", isActive: true, seoEnabled: true },
                            { name: "Besant Nagar", slug: "besant-nagar", isActive: true, seoEnabled: true },
                            { name: "Thiruvanmiyur", slug: "thiruvanmiyur", isActive: true, seoEnabled: true },
                            { name: "Velachery", slug: "velachery", isActive: true, seoEnabled: true },
                            { name: "Taramani", slug: "taramani", isActive: true, seoEnabled: true },
                            { name: "Perungudi", slug: "perungudi", isActive: true, seoEnabled: true },
                            { name: "Saidapet", slug: "saidapet", isActive: true, seoEnabled: true },
                            { name: "Guindy", slug: "guindy", isActive: true, seoEnabled: true },
                            { name: "Ashok Nagar", slug: "ashok-nagar", isActive: true, seoEnabled: true },
                            { name: "K K Nagar", slug: "k-k-nagar", isActive: true, seoEnabled: true },
                            { name: "West Mambalam", slug: "west-mambalam", isActive: true, seoEnabled: true },
                            { name: "T Nagar", slug: "t-nagar", isActive: true, seoEnabled: true },
                            { name: "Nandanam", slug: "nandanam", isActive: true, seoEnabled: true },
                            { name: "Mandaveli", slug: "mandaveli", isActive: true, seoEnabled: true },
                            { name: "R A Puram", slug: "r-a-puram", isActive: true, seoEnabled: true },
                            { name: "Pallikaranai", slug: "pallikaranai", isActive: true, seoEnabled: true },
                            { name: "Keelkattalai", slug: "keelkattalai", isActive: true, seoEnabled: true },
                            { name: "Medavakkam", slug: "medavakkam", isActive: true, seoEnabled: true },
                            { name: "Madipakkam", slug: "madipakkam", isActive: true, seoEnabled: true },
                            { name: "Nanganallur", slug: "nanganallur", isActive: true, seoEnabled: true },
                            { name: "Thiruneermalai", slug: "thiruneermalai", isActive: true, seoEnabled: true }
                        ]
                    },
                    {
                        name: "OMR Corridor", slug: "omr-corridor", isActive: true, seoEnabled: true,
                        subAreas: [
                            { name: "Sholinganallur", slug: "sholinganallur", isActive: true, seoEnabled: true },
                            { name: "Karapakkam", slug: "karapakkam", isActive: true, seoEnabled: true },
                            { name: "Thoraipakkam", slug: "thoraipakkam", isActive: true, seoEnabled: true },
                            { name: "Perungudi", slug: "perungudi", isActive: true, seoEnabled: true },
                            { name: "Siruseri", slug: "siruseri", isActive: true, seoEnabled: true },
                            { name: "Kelambakkam", slug: "kelambakkam", isActive: true, seoEnabled: true },
                            { name: "Navalur", slug: "navalur", isActive: true, seoEnabled: true },
                            { name: "Semmancheri", slug: "semmancheri", isActive: true, seoEnabled: true },
                            { name: "Kanathur", slug: "kanathur", isActive: true, seoEnabled: true }
                        ]
                    },
                    {
                        name: "ECR Corridor", slug: "ecr-corridor", isActive: true, seoEnabled: true,
                        subAreas: [
                            { name: "Injambakkam", slug: "injambakkam", isActive: true, seoEnabled: true },
                            { name: "Neelankarai", slug: "neelankarai", isActive: true, seoEnabled: true },
                            { name: "Palavakkam", slug: "palavakkam", isActive: true, seoEnabled: true },
                            { name: "Kottivakkam", slug: "kottivakkam", isActive: true, seoEnabled: true },
                            { name: "Uthandi", slug: "uthandi", isActive: true, seoEnabled: true },
                            { name: "Kovalam", slug: "kovalam", isActive: true, seoEnabled: true }
                        ]
                    },
                    {
                        name: "South West Chennai", slug: "south-west-chennai", isActive: true, seoEnabled: true,
                        subAreas: [
                            { name: "Chromepet", slug: "chromepet", isActive: true, seoEnabled: true },
                            { name: "Pallavaram", slug: "pallavaram", isActive: true, seoEnabled: true },
                            { name: "Thoraipakkam Radial", slug: "thoraipakkam-radial", isActive: true, seoEnabled: true },
                            { name: "Tambaram", slug: "tambaram", isActive: true, seoEnabled: true },
                            { name: "Tambaram East", slug: "tambaram-east", isActive: true, seoEnabled: true },
                            { name: "Tambaram West", slug: "tambaram-west", isActive: true, seoEnabled: true },
                            { name: "Perungalathur", slug: "perungalathur", isActive: true, seoEnabled: true },
                            { name: "Vandalur", slug: "vandalur", isActive: true, seoEnabled: true },
                            { name: "Urapakkam", slug: "urapakkam", isActive: true, seoEnabled: true },
                            { name: "Guduvanchery", slug: "guduvanchery", isActive: true, seoEnabled: true }
                        ]
                    },
                    {
                        name: "North West Chennai", slug: "north-west-chennai", isActive: true, seoEnabled: true,
                        subAreas: [
                            { name: "Thirumangalam", slug: "thirumangalam", isActive: true, seoEnabled: true },
                            { name: "Villivakkam", slug: "villivakkam", isActive: true, seoEnabled: true },
                            { name: "Padi", slug: "padi", isActive: true, seoEnabled: true },
                            { name: "Nolambur", slug: "nolambur", isActive: true, seoEnabled: true },
                            { name: "Maduravoyal", slug: "maduravoyal", isActive: true, seoEnabled: true }
                        ]
                    }
                ]
            }
        ]
    },
    {
        name: "Telangana",
        slug: "telangana",
        isActive: true,
        seoEnabled: true,
        cities: [
            {
                name: "Hyderabad", slug: "hyderabad", isActive: true, seoEnabled: true, areas: [
                    {
                        name: "Central Hyderabad", slug: "central-hyderabad", isActive: true, seoEnabled: true,
                        subAreas: [
                            { name: "Abids", slug: "abids", isActive: true, seoEnabled: true },
                            { name: "Koti", slug: "koti", isActive: true, seoEnabled: true },
                            { name: "Nampally", slug: "nampally", isActive: true, seoEnabled: true },
                            { name: "Himayatnagar", slug: "himayatnagar", isActive: true, seoEnabled: true },
                            { name: "Basheerbagh", slug: "basheerbagh", isActive: true, seoEnabled: true },
                            { name: "Lakdikapul", slug: "lakdikapul", isActive: true, seoEnabled: true },
                            { name: "Khairatabad", slug: "khairatabad", isActive: true, seoEnabled: true },
                            { name: "Saifabad", slug: "saifabad", isActive: true, seoEnabled: true },
                            { name: "Domalguda", slug: "domalguda", isActive: true, seoEnabled: true },
                            { name: "RTC Cross Roads", slug: "rtc-cross-roads", isActive: true, seoEnabled: true },
                            { name: "Chikkadpally", slug: "chikkadpally", isActive: true, seoEnabled: true },
                            { name: "Narayanguda", slug: "narayanguda", isActive: true, seoEnabled: true }
                        ]
                    },
                    {
                        name: "Secunderabad", slug: "secunderabad", isActive: true, seoEnabled: true,
                        subAreas: [
                            { name: "Secunderabad", slug: "secunderabad", isActive: true, seoEnabled: true },
                            { name: "Paradise", slug: "paradise", isActive: true, seoEnabled: true },
                            { name: "Trimulgherry", slug: "trimulgherry", isActive: true, seoEnabled: true },
                            { name: "Begumpet", slug: "begumpet", isActive: true, seoEnabled: true },
                            { name: "Patny", slug: "patny", isActive: true, seoEnabled: true },
                            { name: "Bolarum", slug: "bolarum", isActive: true, seoEnabled: true },
                            { name: "Alwal", slug: "alwal", isActive: true, seoEnabled: true },
                            { name: "Malkajgiri", slug: "malkajgiri", isActive: true, seoEnabled: true },
                            { name: "Sainikpuri", slug: "sainikpuri", isActive: true, seoEnabled: true },
                            { name: "Kowkoor", slug: "kowkoor", isActive: true, seoEnabled: true },
                            { name: "Kapra", slug: "kapra", isActive: true, seoEnabled: true },
                            { name: "Tarnaka", slug: "tarnaka", isActive: true, seoEnabled: true }
                        ]
                    },
                    {
                        name: "West Hyderabad", slug: "west-hyderabad", isActive: true, seoEnabled: true,
                        subAreas: [
                            { name: "Banjara Hills", slug: "banjara-hills", isActive: true, seoEnabled: true },
                            { name: "Jubilee Hills", slug: "jubilee-hills", isActive: true, seoEnabled: true },
                            { name: "Yousufguda", slug: "yousufguda", isActive: true, seoEnabled: true },
                            { name: "Srinagar Colony", slug: "srinagar-colony", isActive: true, seoEnabled: true },
                            { name: "Ameerpet", slug: "ameerpet", isActive: true, seoEnabled: true },
                            { name: "Punjagutta", slug: "punjagutta", isActive: true, seoEnabled: true },
                            { name: "Somajiguda", slug: "somajiguda", isActive: true, seoEnabled: true },
                            { name: "Kukatpally", slug: "kukatpally", isActive: true, seoEnabled: true },
                            { name: "KPHB", slug: "kphb", isActive: true, seoEnabled: true },
                            { name: "Moosapet", slug: "moosapet", isActive: true, seoEnabled: true },
                            { name: "Balanagar", slug: "balanagar", isActive: true, seoEnabled: true },
                            { name: "Bowenpally", slug: "bowenpally", isActive: true, seoEnabled: true },
                            { name: "Quthbullapur", slug: "quthbullapur", isActive: true, seoEnabled: true },
                            { name: "Chandanagar", slug: "chandanagar", isActive: true, seoEnabled: true },
                            { name: "Miyapur", slug: "miyapur", isActive: true, seoEnabled: true },
                            { name: "Bachupally", slug: "bachupally", isActive: true, seoEnabled: true },
                            { name: "Nizampet", slug: "nizampet", isActive: true, seoEnabled: true },
                            { name: "Lingampally", slug: "lingampally", isActive: true, seoEnabled: true },
                            { name: "Patelguda", slug: "patelguda", isActive: true, seoEnabled: true }
                        ]
                    },
                    {
                        name: "IT Corridor", slug: "it-corridor", isActive: true, seoEnabled: true,
                        subAreas: [
                            { name: "Hitech City", slug: "hitech-city", isActive: true, seoEnabled: true },
                            { name: "Madhapur", slug: "madhapur", isActive: true, seoEnabled: true },
                            { name: "Gachibowli", slug: "gachibowli", isActive: true, seoEnabled: true },
                            { name: "Kondapur", slug: "kondapur", isActive: true, seoEnabled: true },
                            { name: "Nanakramguda", slug: "nanakramguda", isActive: true, seoEnabled: true },
                            { name: "Financial District", slug: "financial-district", isActive: true, seoEnabled: true },
                            { name: "Kokapet", slug: "kokapet", isActive: true, seoEnabled: true },
                            { name: "Puppalaguda", slug: "puppalaguda", isActive: true, seoEnabled: true },
                            { name: "Raidurg", slug: "raidurg", isActive: true, seoEnabled: true },
                            { name: "Manikonda", slug: "manikonda", isActive: true, seoEnabled: true },
                            { name: "Narsingi", slug: "narsingi", isActive: true, seoEnabled: true },
                            { name: "Khajaguda", slug: "khajaguda", isActive: true, seoEnabled: true }
                        ]
                    },
                    {
                        name: "South Hyderabad", slug: "south-hyderabad", isActive: true, seoEnabled: true,
                        subAreas: [
                            { name: "Mehdipatnam", slug: "mehdipatnam", isActive: true, seoEnabled: true },
                            { name: "Tolichowki", slug: "tolichowki", isActive: true, seoEnabled: true },
                            { name: "Attapur", slug: "attapur", isActive: true, seoEnabled: true },
                            { name: "Rajendranagar", slug: "rajendranagar", isActive: true, seoEnabled: true },
                            { name: "Bandlaguda", slug: "bandlaguda", isActive: true, seoEnabled: true },
                            { name: "Sun City", slug: "sun-city", isActive: true, seoEnabled: true },
                            { name: "Langar Houz", slug: "langar-houz", isActive: true, seoEnabled: true },
                            { name: "Upparpally", slug: "upparpally", isActive: true, seoEnabled: true }
                        ]
                    },
                    {
                        name: "East Hyderabad", slug: "east-hyderabad", isActive: true, seoEnabled: true,
                        subAreas: [
                            { name: "Dilsukhnagar", slug: "dilsukhnagar", isActive: true, seoEnabled: true },
                            { name: "Kothapet", slug: "kothapet", isActive: true, seoEnabled: true },
                            { name: "LB Nagar", slug: "lb-nagar", isActive: true, seoEnabled: true },
                            { name: "Nagole", slug: "nagole", isActive: true, seoEnabled: true },
                            { name: "Hayatnagar", slug: "hayatnagar", isActive: true, seoEnabled: true },
                            { name: "Vanasthalipuram", slug: "vanasthalipuram", isActive: true, seoEnabled: true },
                            { name: "Ramanthapur", slug: "ramanthapur", isActive: true, seoEnabled: true },
                            { name: "Amberpet", slug: "amberpet", isActive: true, seoEnabled: true },
                            { name: "Uppal", slug: "uppal", isActive: true, seoEnabled: true },
                            { name: "Boduppal", slug: "boduppal", isActive: true, seoEnabled: true },
                            { name: "Peerzadiguda", slug: "peerzadiguda", isActive: true, seoEnabled: true },
                            { name: "Gaddiannaram", slug: "gaddiannaram", isActive: true, seoEnabled: true }
                        ]
                    },
                    {
                        name: "North Hyderabad", slug: "north-hyderabad", isActive: true, seoEnabled: true,
                        subAreas: [
                            { name: "Kompally", slug: "kompally", isActive: true, seoEnabled: true },
                            { name: "Dulapally", slug: "dulapally", isActive: true, seoEnabled: true },
                            { name: "Shamirpet", slug: "shamirpet", isActive: true, seoEnabled: true },
                            { name: "Medchal", slug: "medchal", isActive: true, seoEnabled: true },
                            { name: "Old Alwal", slug: "old-alwal", isActive: true, seoEnabled: true },
                            { name: "Suchitra", slug: "suchitra", isActive: true, seoEnabled: true }
                        ]
                    },
                    {
                        name: "Old City", slug: "old-city", isActive: true, seoEnabled: true,
                        subAreas: [
                            { name: "Charminar", slug: "charminar", isActive: true, seoEnabled: true },
                            { name: "Pathergatti", slug: "pathergatti", isActive: true, seoEnabled: true },
                            { name: "Malakpet", slug: "malakpet", isActive: true, seoEnabled: true },
                            { name: "Santosh Nagar", slug: "santosh-nagar", isActive: true, seoEnabled: true },
                            { name: "Bahadurpura", slug: "bahadurpura", isActive: true, seoEnabled: true },
                            { name: "Falaknuma", slug: "falaknuma", isActive: true, seoEnabled: true },
                            { name: "Chandrayangutta", slug: "chandrayangutta", isActive: true, seoEnabled: true },
                            { name: "Yakutpura", slug: "yakutpura", isActive: true, seoEnabled: true },
                            { name: "Dabirpura", slug: "dabirpura", isActive: true, seoEnabled: true },
                            { name: "Saidabad", slug: "saidabad", isActive: true, seoEnabled: true }
                        ]
                    }
                ]
            }
        ]
    },
    {
        name: "West Bengal",
        slug: "west-bengal",
        isActive: true,
        seoEnabled: true,
        cities: [
            {
                name: "Kolkata", slug: "kolkata", isActive: true, seoEnabled: true, areas: [
                    {
                        name: "Central Kolkata", slug: "central-kolkata", isActive: true, seoEnabled: true,
                        subAreas: [
                            { name: "Esplanade", slug: "esplanade", isActive: true, seoEnabled: true },
                            { name: "Dalhousie", slug: "dalhousie", isActive: true, seoEnabled: true },
                            { name: "BBD Bagh", slug: "bbd-bagh", isActive: true, seoEnabled: true },
                            { name: "Chowringhee", slug: "chowringhee", isActive: true, seoEnabled: true },
                            { name: "Park Street", slug: "park-street", isActive: true, seoEnabled: true },
                            { name: "Maidan", slug: "maidan", isActive: true, seoEnabled: true },
                            { name: "Bowbazar", slug: "bowbazar", isActive: true, seoEnabled: true },
                            { name: "Sealdah", slug: "sealdah", isActive: true, seoEnabled: true },
                            { name: "Entally", slug: "entally", isActive: true, seoEnabled: true },
                            { name: "Moulali", slug: "moulali", isActive: true, seoEnabled: true },
                            { name: "Camac Street", slug: "camac-street", isActive: true, seoEnabled: true },
                            { name: "Ajad Hind Bag", slug: "ajad-hind-bag", isActive: true, seoEnabled: true }
                        ]
                    },
                    {
                        name: "North Kolkata", slug: "north-kolkata", isActive: true, seoEnabled: true,
                        subAreas: [
                            { name: "Shyambazar", slug: "shyambazar", isActive: true, seoEnabled: true },
                            { name: "Bagbazar", slug: "bagbazar", isActive: true, seoEnabled: true },
                            { name: "Sovabazar", slug: "sovabazar", isActive: true, seoEnabled: true },
                            { name: "Hatibagan", slug: "hatibagan", isActive: true, seoEnabled: true },
                            { name: "Ultadanga", slug: "ultadanga", isActive: true, seoEnabled: true },
                            { name: "Maniktala", slug: "maniktala", isActive: true, seoEnabled: true },
                            { name: "Kankurgachi", slug: "kankurgachi", isActive: true, seoEnabled: true },
                            { name: "Dumdum", slug: "dumdum", isActive: true, seoEnabled: true },
                            { name: "Nagerbazar", slug: "nagerbazar", isActive: true, seoEnabled: true },
                            { name: "Lake Town", slug: "lake-town", isActive: true, seoEnabled: true },
                            { name: "Bangur Avenue", slug: "bangur-avenue", isActive: true, seoEnabled: true },
                            { name: "Sinthi", slug: "sinthi", isActive: true, seoEnabled: true },
                            { name: "Baranagar", slug: "baranagar", isActive: true, seoEnabled: true },
                            { name: "Dakshineswar", slug: "dakshineswar", isActive: true, seoEnabled: true }
                        ]
                    },
                    {
                        name: "South Kolkata", slug: "south-kolkata", isActive: true, seoEnabled: true,
                        subAreas: [
                            { name: "Ballygunge", slug: "ballygunge", isActive: true, seoEnabled: true },
                            { name: "Gariahat", slug: "gariahat", isActive: true, seoEnabled: true },
                            { name: "Rashbehari", slug: "rashbehari", isActive: true, seoEnabled: true },
                            { name: "Kalighat", slug: "kalighat", isActive: true, seoEnabled: true },
                            { name: "Bhowanipore", slug: "bhowanipore", isActive: true, seoEnabled: true },
                            { name: "Alipore", slug: "alipore", isActive: true, seoEnabled: true },
                            { name: "Tollygunge", slug: "tollygunge", isActive: true, seoEnabled: true },
                            { name: "Golf Green", slug: "golf-green", isActive: true, seoEnabled: true },
                            { name: "Jadavpur", slug: "jadavpur", isActive: true, seoEnabled: true },
                            { name: "Garia", slug: "garia", isActive: true, seoEnabled: true },
                            { name: "Netaji Nagar", slug: "netaji-nagar", isActive: true, seoEnabled: true },
                            { name: "Regent Park", slug: "regent-park", isActive: true, seoEnabled: true },
                            { name: "Behala", slug: "behala", isActive: true, seoEnabled: true },
                            { name: "Sakherbazar", slug: "sakherbazar", isActive: true, seoEnabled: true },
                            { name: "Thakurpukur", slug: "thakurpukur", isActive: true, seoEnabled: true },
                            { name: "Panchasayar", slug: "panchasayar", isActive: true, seoEnabled: true },
                            { name: "Garfa", slug: "garfa", isActive: true, seoEnabled: true }
                        ]
                    },
                    {
                        name: "East Kolkata", slug: "east-kolkata", isActive: true, seoEnabled: true,
                        subAreas: [
                            { name: "Salt Lake Sector 1", slug: "salt-lake-sector-1", isActive: true, seoEnabled: true },
                            { name: "Salt Lake Sector 2", slug: "salt-lake-sector-2", isActive: true, seoEnabled: true },
                            { name: "Salt Lake Sector 3", slug: "salt-lake-sector-3", isActive: true, seoEnabled: true },
                            { name: "Bidhannagar", slug: "bidhannagar", isActive: true, seoEnabled: true },
                            { name: "Ultadanga Main Road", slug: "ultadanga-main-road", isActive: true, seoEnabled: true },
                            { name: "Phoolbagan", slug: "phoolbagan", isActive: true, seoEnabled: true },
                            { name: "Kasba", slug: "kasba", isActive: true, seoEnabled: true },
                            { name: "Anandapur", slug: "anandapur", isActive: true, seoEnabled: true },
                            { name: "Ruby", slug: "ruby", isActive: true, seoEnabled: true },
                            { name: "Beliaghata", slug: "beliaghata", isActive: true, seoEnabled: true },
                            { name: "Topsia", slug: "topsia", isActive: true, seoEnabled: true },
                            { name: "EM Bypass", slug: "em-bypass", isActive: true, seoEnabled: true },
                            { name: "Bantala", slug: "bantala", isActive: true, seoEnabled: true }
                        ]
                    },
                    {
                        name: "New Town", slug: "new-town", isActive: true, seoEnabled: true,
                        subAreas: [
                            { name: "New Town Action Area 1", slug: "new-town-action-area-1", isActive: true, seoEnabled: true },
                            { name: "New Town Action Area 2", slug: "new-town-action-area-2", isActive: true, seoEnabled: true },
                            { name: "New Town Action Area 3", slug: "new-town-action-area-3", isActive: true, seoEnabled: true },
                            { name: "Rajarhat", slug: "rajarhat", isActive: true, seoEnabled: true },
                            { name: "Rajarhat Gopalpur", slug: "rajarhat-gopalpur", isActive: true, seoEnabled: true },
                            { name: "Rajarhat Chinar Park", slug: "rajarhat-chinar-park", isActive: true, seoEnabled: true },
                            { name: "Eco Park", slug: "eco-park", isActive: true, seoEnabled: true },
                            { name: "Baguiati", slug: "baguiati", isActive: true, seoEnabled: true },
                            { name: "Kaikhali", slug: "kaikhali", isActive: true, seoEnabled: true }
                        ]
                    },
                    {
                        name: "West Kolkata", slug: "west-kolkata", isActive: true, seoEnabled: true,
                        subAreas: [
                            { name: "Howrah", slug: "howrah", isActive: true, seoEnabled: true },
                            { name: "Shibpur", slug: "shibpur", isActive: true, seoEnabled: true },
                            { name: "Salkia", slug: "salkia", isActive: true, seoEnabled: true },
                            { name: "Bally", slug: "bally", isActive: true, seoEnabled: true },
                            { name: "Liluah", slug: "liluah", isActive: true, seoEnabled: true },
                            { name: "Santragachi", slug: "santragachi", isActive: true, seoEnabled: true },
                            { name: "Jagatdal", slug: "jagatdal", isActive: true, seoEnabled: true }
                        ]
                    },
                    {
                        name: "South East Kolkata", slug: "south-east-kolkata", isActive: true, seoEnabled: true,
                        subAreas: [
                            { name: "Tiljala", slug: "tiljala", isActive: true, seoEnabled: true },
                            { name: "Garden Reach", slug: "garden-reach", isActive: true, seoEnabled: true },
                            { name: "Metiabruz", slug: "metiabruz", isActive: true, seoEnabled: true },
                            { name: "Khidirpur", slug: "khidirpur", isActive: true, seoEnabled: true },
                            { name: "Mahesh Tala", slug: "mahesh-tala", isActive: true, seoEnabled: true }
                        ]
                    }
                ]
            }
        ]
    },
    {
        name: "Gujarat",
        slug: "gujarat",
        isActive: true,
        seoEnabled: true,
        cities: [
            {
                name: "Ahmedabad", slug: "ahmedabad", isActive: true, seoEnabled: true, areas: [
                    {
                        name: "Satellite", slug: "satellite", isActive: true, seoEnabled: true,
                        subAreas: [
                            { name: "Satellite", slug: "satellite", isActive: true, seoEnabled: true },
                            { name: "Prahlad Nagar", slug: "prahlad-nagar", isActive: true, seoEnabled: true },
                            { name: "Ambawadi", slug: "ambawadi", isActive: true, seoEnabled: true }
                        ]
                    },
                    {
                        name: "Navrangpura", slug: "navrangpura", isActive: true, seoEnabled: true,
                        subAreas: [
                            { name: "Navrangpura", slug: "navrangpura", isActive: true, seoEnabled: true },
                            { name: "C G Road", slug: "c-g-road", isActive: true, seoEnabled: true },
                            { name: "University Area", slug: "university-area", isActive: true, seoEnabled: true }
                        ]
                    },
                    {
                        name: "Bodakdev", slug: "bodakdev", isActive: true, seoEnabled: true,
                        subAreas: [
                            { name: "Bodakdev", slug: "bodakdev", isActive: true, seoEnabled: true },
                            { name: "Sindhu Bhavan Road", slug: "sindhu-bhavan-road", isActive: true, seoEnabled: true },
                            { name: "Thaltej", slug: "thaltej", isActive: true, seoEnabled: true }
                        ]
                    }
                ]
            },
            {
                name: "Surat", slug: "surat", isActive: true, seoEnabled: true, areas: [
                    {
                        name: "Adajan", slug: "adajan", isActive: true, seoEnabled: true,
                        subAreas: [
                            { name: "Adajan", slug: "adajan", isActive: true, seoEnabled: true },
                            { name: "Pal", slug: "pal", isActive: true, seoEnabled: true },
                            { name: "L P Savani", slug: "l-p-savani", isActive: true, seoEnabled: true }
                        ]
                    },
                    {
                        name: "Vesu", slug: "vesu", isActive: true, seoEnabled: true,
                        subAreas: [
                            { name: "Vesu", slug: "vesu", isActive: true, seoEnabled: true },
                            { name: "VIP Road", slug: "vip-road", isActive: true, seoEnabled: true },
                            { name: "Piplod", slug: "piplod", isActive: true, seoEnabled: true }
                        ]
                    }
                ]
            }
        ]
    },
    {
        name: "Haryana",
        slug: "haryana",
        isActive: true,
        seoEnabled: true,
        cities: [
            {
                name: "Gurgaon", slug: "gurgaon", isActive: true, seoEnabled: true, areas: [
                    {
                        name: "DLF Phase 1-5", slug: "dlf-phase-1-5", isActive: true, seoEnabled: true,
                        subAreas: [
                            { name: "DLF Phase 1", slug: "dlf-phase-1", isActive: true, seoEnabled: true },
                            { name: "DLF Phase 2", slug: "dlf-phase-2", isActive: true, seoEnabled: true },
                            { name: "DLF Phase 3", slug: "dlf-phase-3", isActive: true, seoEnabled: true },
                            { name: "DLF Phase 4", slug: "dlf-phase-4", isActive: true, seoEnabled: true },
                            { name: "DLF Phase 5", slug: "dlf-phase-5", isActive: true, seoEnabled: true }
                        ]
                    },
                    {
                        name: "Sushant Lok", slug: "sushant-lok", isActive: true, seoEnabled: true,
                        subAreas: [
                            { name: "Sushant Lok 1", slug: "sushant-lok-1", isActive: true, seoEnabled: true },
                            { name: "Sushant Lok 2", slug: "sushant-lok-2", isActive: true, seoEnabled: true },
                            { name: "Sushant Lok 3", slug: "sushant-lok-3", isActive: true, seoEnabled: true }
                        ]
                    },
                    {
                        name: "Golf Course Road", slug: "golf-course-road", isActive: true, seoEnabled: true,
                        subAreas: [
                            { name: "Golf Course Road", slug: "golf-course-road", isActive: true, seoEnabled: true },
                            { name: "Sector 42", slug: "sector-42", isActive: true, seoEnabled: true },
                            { name: "Sector 43", slug: "sector-43", isActive: true, seoEnabled: true }
                        ]
                    }
                ]
            }
        ]
    },
    {
        name: "Uttar Pradesh",
        slug: "uttar-pradesh",
        isActive: true,
        seoEnabled: true,
        cities: [
            {
                name: "Noida", slug: "noida", isActive: true, seoEnabled: true, areas: [
                    {
                        name: "Noida Sectors 1-50", slug: "noida-sectors-1-50", isActive: true, seoEnabled: true,
                        subAreas: [
                            { name: "Sector 15", slug: "sector-15", isActive: true, seoEnabled: true },
                            { name: "Sector 18", slug: "sector-18", isActive: true, seoEnabled: true },
                            { name: "Sector 44", slug: "sector-44", isActive: true, seoEnabled: true }
                        ]
                    }
                ]
            }
        ]
    }
];
