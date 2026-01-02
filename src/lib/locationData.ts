// Données géographiques pour Kily
// Pays pilote : Côte d'Ivoire avec focus sur Abidjan et ses communes

export const countries = [
  { code: "CI", name: "Côte d'Ivoire", flag: "🇨🇮" },
  { code: "GH", name: "Ghana", flag: "🇬🇭" },
  { code: "SN", name: "Sénégal", flag: "🇸🇳" },
  { code: "CM", name: "Cameroun", flag: "🇨🇲" },
  { code: "ML", name: "Mali", flag: "🇲🇱" },
  { code: "BF", name: "Burkina Faso", flag: "🇧🇫" },
  { code: "NG", name: "Nigeria", flag: "🇳🇬" },
  { code: "KE", name: "Kenya", flag: "🇰🇪" },
  { code: "CD", name: "RD Congo", flag: "🇨🇩" },
  { code: "MA", name: "Maroc", flag: "🇲🇦" },
  { code: "TN", name: "Tunisie", flag: "🇹🇳" },
  { code: "GN", name: "Guinée", flag: "🇬🇳" },
];

// Communes officielles d'Abidjan (12 communes)
export const abidjanCommunes = [
  "Abobo",
  "Adjamé",
  "Anyama",
  "Attécoubé",
  "Cocody",
  "Koumassi",
  "Marcory",
  "Le Plateau",
  "Port-Bouët",
  "Songon",
  "Treichville",
  "Yopougon",
];

// Villes de Côte d'Ivoire
export const coteIvoireCities = [
  "Abidjan", // Avec communes
  "Bouaké",
  "Daloa",
  "Korhogo",
  "San-Pédro",
  "Yamoussoukro", // Capitale
  "Man",
  "Divo",
  "Gagnoa",
  "Abengourou",
  "Bondoukou",
  "Agboville",
  "Dabou",
  "Grand-Bassam",
  "Katiola",
  "Odienné",
  "Séguéla",
  "Toumodi",
  "Bingerville",
  "Issia",
];

// Villes par pays (pour les autres pays)
export const citiesByCountry: Record<string, string[]> = {
  "Côte d'Ivoire": coteIvoireCities,
  "Ghana": ["Accra", "Kumasi", "Tamale", "Takoradi", "Ashaiman"],
  "Sénégal": ["Dakar", "Thiès", "Rufisque", "Kaolack", "Ziguinchor"],
  "Cameroun": ["Douala", "Yaoundé", "Garoua", "Bafoussam", "Bamenda"],
  "Mali": ["Bamako", "Sikasso", "Mopti", "Koutiala", "Kayes"],
  "Burkina Faso": ["Ouagadougou", "Bobo-Dioulasso", "Koudougou", "Ouahigouya", "Banfora"],
  "Nigeria": ["Lagos", "Kano", "Ibadan", "Abuja", "Port Harcourt"],
  "Kenya": ["Nairobi", "Mombasa", "Kisumu", "Nakuru", "Eldoret"],
  "RD Congo": ["Kinshasa", "Lubumbashi", "Mbuji-Mayi", "Kananga", "Kisangani"],
  "Maroc": ["Casablanca", "Rabat", "Fès", "Marrakech", "Tanger"],
  "Tunisie": ["Tunis", "Sfax", "Sousse", "Kairouan", "Bizerte"],
  "Guinée": ["Conakry", "Nzérékoré", "Kindia", "Boké", "Labé"],
};

// Liste complète des villes (pour compatibilité avec l'ancien système)
export const allCities = Object.values(citiesByCountry).flat();

// Fonction utilitaire pour vérifier si une ville nécessite une commune
export const requiresCommune = (country: string, city: string): boolean => {
  return country === "Côte d'Ivoire" && city === "Abidjan";
};

// Fonction utilitaire pour obtenir les villes d'un pays
export const getCitiesByCountry = (country: string): string[] => {
  return citiesByCountry[country] || [];
};

