export interface Country {
  code: string;
  name: string;
  phoneCode: string;
  flag: string;
}

export const countries: Country[] = [
  { code: 'SN', name: 'Sénégal', phoneCode: '+221', flag: '🇸🇳' },
  { code: 'FR', name: 'France', phoneCode: '+33', flag: '🇫🇷' },
  { code: 'US', name: 'États-Unis', phoneCode: '+1', flag: '🇺🇸' },
  { code: 'CA', name: 'Canada', phoneCode: '+1', flag: '🇨🇦' },
  { code: 'GB', name: 'Royaume-Uni', phoneCode: '+44', flag: '🇬🇧' },
  { code: 'DE', name: 'Allemagne', phoneCode: '+49', flag: '🇩🇪' },
  { code: 'IT', name: 'Italie', phoneCode: '+39', flag: '🇮🇹' },
  { code: 'ES', name: 'Espagne', phoneCode: '+34', flag: '🇪🇸' },
  { code: 'BE', name: 'Belgique', phoneCode: '+32', flag: '🇧🇪' },
  { code: 'CH', name: 'Suisse', phoneCode: '+41', flag: '🇨🇭' },
  { code: 'ML', name: 'Mali', phoneCode: '+223', flag: '🇲🇱' },
  { code: 'BF', name: 'Burkina Faso', phoneCode: '+226', flag: '🇧🇫' },
  { code: 'CI', name: 'Côte d\'Ivoire', phoneCode: '+225', flag: '🇨🇮' },
  { code: 'GN', name: 'Guinée', phoneCode: '+224', flag: '🇬🇳' },
  { code: 'GM', name: 'Gambie', phoneCode: '+220', flag: '🇬🇲' },
  { code: 'GW', name: 'Guinée-Bissau', phoneCode: '+245', flag: '🇬🇼' },
  { code: 'CV', name: 'Cap-Vert', phoneCode: '+238', flag: '🇨🇻' },
  { code: 'MR', name: 'Mauritanie', phoneCode: '+222', flag: '🇲🇷' },
  { code: 'DZ', name: 'Algérie', phoneCode: '+213', flag: '🇩🇿' },
  { code: 'MA', name: 'Maroc', phoneCode: '+212', flag: '🇲🇦' },
  { code: 'TN', name: 'Tunisie', phoneCode: '+216', flag: '🇹🇳' },
  { code: 'LY', name: 'Libye', phoneCode: '+218', flag: '🇱🇾' },
  { code: 'EG', name: 'Égypte', phoneCode: '+20', flag: '🇪🇬' },
  { code: 'SD', name: 'Soudan', phoneCode: '+249', flag: '🇸🇩' },
  { code: 'ET', name: 'Éthiopie', phoneCode: '+251', flag: '🇪🇹' },
  { code: 'KE', name: 'Kenya', phoneCode: '+254', flag: '🇰🇪' },
  { code: 'UG', name: 'Ouganda', phoneCode: '+256', flag: '🇺🇬' },
  { code: 'TZ', name: 'Tanzanie', phoneCode: '+255', flag: '🇹🇿' },
  { code: 'RW', name: 'Rwanda', phoneCode: '+250', flag: '🇷🇼' },
  { code: 'BI', name: 'Burundi', phoneCode: '+257', flag: '🇧🇮' },
  { code: 'CD', name: 'République démocratique du Congo', phoneCode: '+243', flag: '🇨🇩' },
  { code: 'CG', name: 'République du Congo', phoneCode: '+242', flag: '🇨🇬' },
  { code: 'CF', name: 'République centrafricaine', phoneCode: '+236', flag: '🇨🇫' },
  { code: 'TD', name: 'Tchad', phoneCode: '+235', flag: '🇹🇩' },
  { code: 'CM', name: 'Cameroun', phoneCode: '+237', flag: '🇨🇲' },
  { code: 'GQ', name: 'Guinée équatoriale', phoneCode: '+240', flag: '🇬🇶' },
  { code: 'GA', name: 'Gabon', phoneCode: '+241', flag: '🇬🇦' },
  { code: 'ST', name: 'Sao Tomé-et-Principe', phoneCode: '+239', flag: '🇸🇹' },
  { code: 'AO', name: 'Angola', phoneCode: '+244', flag: '🇦🇴' },
  { code: 'ZM', name: 'Zambie', phoneCode: '+260', flag: '🇿🇲' },
  { code: 'ZW', name: 'Zimbabwe', phoneCode: '+263', flag: '🇿🇼' },
  { code: 'BW', name: 'Botswana', phoneCode: '+267', flag: '🇧🇼' },
  { code: 'NA', name: 'Namibie', phoneCode: '+264', flag: '🇳🇦' },
  { code: 'ZA', name: 'Afrique du Sud', phoneCode: '+27', flag: '🇿🇦' },
  { code: 'LS', name: 'Lesotho', phoneCode: '+266', flag: '🇱🇸' },
  { code: 'SZ', name: 'Eswatini', phoneCode: '+268', flag: '🇸🇿' },
  { code: 'MG', name: 'Madagascar', phoneCode: '+261', flag: '🇲🇬' },
  { code: 'MU', name: 'Maurice', phoneCode: '+230', flag: '🇲🇺' },
  { code: 'SC', name: 'Seychelles', phoneCode: '+248', flag: '🇸🇨' },
  { code: 'KM', name: 'Comores', phoneCode: '+269', flag: '🇰🇲' },
  { code: 'DJ', name: 'Djibouti', phoneCode: '+253', flag: '🇩🇯' },
  { code: 'SO', name: 'Somalie', phoneCode: '+252', flag: '🇸🇴' },
  { code: 'ER', name: 'Érythrée', phoneCode: '+291', flag: '🇪🇷' },
  { code: 'SS', name: 'Soudan du Sud', phoneCode: '+211', flag: '🇸🇸' },
  { code: 'NE', name: 'Niger', phoneCode: '+227', flag: '🇳🇪' },
  { code: 'NG', name: 'Nigeria', phoneCode: '+234', flag: '🇳🇬' },
  { code: 'BJ', name: 'Bénin', phoneCode: '+229', flag: '🇧🇯' },
  { code: 'TG', name: 'Togo', phoneCode: '+228', flag: '🇹🇬' },
  { code: 'GH', name: 'Ghana', phoneCode: '+233', flag: '🇬🇭' },
  { code: 'LR', name: 'Libéria', phoneCode: '+231', flag: '🇱🇷' },
  { code: 'SL', name: 'Sierra Leone', phoneCode: '+232', flag: '🇸🇱' },
];

export const getCountryByCode = (code: string): Country | undefined => {
  return countries.find(country => country.code === code);
};

export const getCountryByPhoneCode = (phoneCode: string): Country | undefined => {
  return countries.find(country => country.phoneCode === phoneCode);
};
