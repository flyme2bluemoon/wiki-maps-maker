export interface Continent {
  id: string;
  name: string;
}

export interface Country {
  id: string;
  name: string;
  code: string;
  continent: string;
  capital: string;
}

export interface UNCountry {
  id: string;
  name: string;
  continent: string;
}

export interface GroupColor {
  id: string;
  value: string;
}

export interface GradientEndpoint {
  id: string;
  value: string;
}

export interface GradientPreset {
  id: string;
  name: string;
  start: string;
  end: string;
}

export interface Subdivision {
  regions: string[];
}

export const CONTINENTS: Continent[] = [
  { id: 'NA', name: 'North America' },
  { id: 'SA', name: 'South America' },
  { id: 'EU', name: 'Europe' },
  { id: 'AF', name: 'Africa' },
  { id: 'AS', name: 'Asia' },
];

export const COUNTRIES: Country[] = [
  { id: 'ca', name: 'Canada',        code: 'CA', continent: 'NA', capital: 'Ottawa' },
  { id: 'us', name: 'United States', code: 'US', continent: 'NA', capital: 'Washington, D.C.' },
  { id: 'fr', name: 'France',        code: 'FR', continent: 'EU', capital: 'Paris' },
  { id: 'cn', name: 'China',         code: 'CN', continent: 'AS', capital: 'Beijing' },
  { id: 'au', name: 'Australia',     code: 'AU', continent: 'AS', capital: 'Canberra' },
];

export const UN_COUNTRIES: UNCountry[] = [
  // Africa
  { id: 'dz',  name: 'Algeria',                        continent: 'AF' },
  { id: 'ao',  name: 'Angola',                         continent: 'AF' },
  { id: 'bj',  name: 'Benin',                          continent: 'AF' },
  { id: 'bw',  name: 'Botswana',                       continent: 'AF' },
  { id: 'bf',  name: 'Burkina Faso',                   continent: 'AF' },
  { id: 'bi',  name: 'Burundi',                        continent: 'AF' },
  { id: 'cv',  name: 'Cabo Verde',                     continent: 'AF' },
  { id: 'cm',  name: 'Cameroon',                       continent: 'AF' },
  { id: 'cf',  name: 'Central African Republic',       continent: 'AF' },
  { id: 'td',  name: 'Chad',                           continent: 'AF' },
  { id: 'km',  name: 'Comoros',                        continent: 'AF' },
  { id: 'cg',  name: 'Congo',                          continent: 'AF' },
  { id: 'ci',  name: "Côte d'Ivoire",                  continent: 'AF' },
  { id: 'cd',  name: 'DR Congo',                       continent: 'AF' },
  { id: 'dj',  name: 'Djibouti',                       continent: 'AF' },
  { id: 'eg',  name: 'Egypt',                          continent: 'AF' },
  { id: 'gq',  name: 'Equatorial Guinea',              continent: 'AF' },
  { id: 'er',  name: 'Eritrea',                        continent: 'AF' },
  { id: 'sz',  name: 'Eswatini',                       continent: 'AF' },
  { id: 'et',  name: 'Ethiopia',                       continent: 'AF' },
  { id: 'ga',  name: 'Gabon',                          continent: 'AF' },
  { id: 'gm',  name: 'Gambia',                         continent: 'AF' },
  { id: 'gh',  name: 'Ghana',                          continent: 'AF' },
  { id: 'gn',  name: 'Guinea',                         continent: 'AF' },
  { id: 'gw',  name: 'Guinea-Bissau',                  continent: 'AF' },
  { id: 'ke',  name: 'Kenya',                          continent: 'AF' },
  { id: 'ls',  name: 'Lesotho',                        continent: 'AF' },
  { id: 'lr',  name: 'Liberia',                        continent: 'AF' },
  { id: 'ly',  name: 'Libya',                          continent: 'AF' },
  { id: 'mg',  name: 'Madagascar',                     continent: 'AF' },
  { id: 'mw',  name: 'Malawi',                         continent: 'AF' },
  { id: 'ml',  name: 'Mali',                           continent: 'AF' },
  { id: 'mr',  name: 'Mauritania',                     continent: 'AF' },
  { id: 'mu',  name: 'Mauritius',                      continent: 'AF' },
  { id: 'ma',  name: 'Morocco',                        continent: 'AF' },
  { id: 'mz',  name: 'Mozambique',                     continent: 'AF' },
  { id: 'na',  name: 'Namibia',                        continent: 'AF' },
  { id: 'ne',  name: 'Niger',                          continent: 'AF' },
  { id: 'ng',  name: 'Nigeria',                        continent: 'AF' },
  { id: 'rw',  name: 'Rwanda',                         continent: 'AF' },
  { id: 'st',  name: 'São Tomé and Príncipe',          continent: 'AF' },
  { id: 'sn',  name: 'Senegal',                        continent: 'AF' },
  { id: 'sc',  name: 'Seychelles',                     continent: 'AF' },
  { id: 'sl',  name: 'Sierra Leone',                   continent: 'AF' },
  { id: 'so',  name: 'Somalia',                        continent: 'AF' },
  { id: 'za',  name: 'South Africa',                   continent: 'AF' },
  { id: 'ss',  name: 'South Sudan',                    continent: 'AF' },
  { id: 'sd',  name: 'Sudan',                          continent: 'AF' },
  { id: 'tz',  name: 'Tanzania',                       continent: 'AF' },
  { id: 'tg',  name: 'Togo',                           continent: 'AF' },
  { id: 'tn',  name: 'Tunisia',                        continent: 'AF' },
  { id: 'ug',  name: 'Uganda',                         continent: 'AF' },
  { id: 'zm',  name: 'Zambia',                         continent: 'AF' },
  { id: 'zw',  name: 'Zimbabwe',                       continent: 'AF' },
  // Asia + Oceania
  { id: 'af',  name: 'Afghanistan',                    continent: 'AS' },
  { id: 'bh',  name: 'Bahrain',                        continent: 'AS' },
  { id: 'bd',  name: 'Bangladesh',                     continent: 'AS' },
  { id: 'bt',  name: 'Bhutan',                         continent: 'AS' },
  { id: 'bn',  name: 'Brunei',                         continent: 'AS' },
  { id: 'kh',  name: 'Cambodia',                       continent: 'AS' },
  { id: 'cn',  name: 'China',                          continent: 'AS' },
  { id: 'cy',  name: 'Cyprus',                         continent: 'AS' },
  { id: 'in',  name: 'India',                          continent: 'AS' },
  { id: 'id',  name: 'Indonesia',                      continent: 'AS' },
  { id: 'ir',  name: 'Iran',                           continent: 'AS' },
  { id: 'iq',  name: 'Iraq',                           continent: 'AS' },
  { id: 'il',  name: 'Israel',                         continent: 'AS' },
  { id: 'jp',  name: 'Japan',                          continent: 'AS' },
  { id: 'jo',  name: 'Jordan',                         continent: 'AS' },
  { id: 'kz',  name: 'Kazakhstan',                     continent: 'AS' },
  { id: 'kw',  name: 'Kuwait',                         continent: 'AS' },
  { id: 'kg',  name: 'Kyrgyzstan',                     continent: 'AS' },
  { id: 'la',  name: 'Laos',                           continent: 'AS' },
  { id: 'lb',  name: 'Lebanon',                        continent: 'AS' },
  { id: 'my',  name: 'Malaysia',                       continent: 'AS' },
  { id: 'mv',  name: 'Maldives',                       continent: 'AS' },
  { id: 'mn',  name: 'Mongolia',                       continent: 'AS' },
  { id: 'mm',  name: 'Myanmar',                        continent: 'AS' },
  { id: 'np',  name: 'Nepal',                          continent: 'AS' },
  { id: 'kp',  name: 'North Korea',                    continent: 'AS' },
  { id: 'om',  name: 'Oman',                           continent: 'AS' },
  { id: 'pk',  name: 'Pakistan',                       continent: 'AS' },
  { id: 'ph',  name: 'Philippines',                    continent: 'AS' },
  { id: 'qa',  name: 'Qatar',                          continent: 'AS' },
  { id: 'sa',  name: 'Saudi Arabia',                   continent: 'AS' },
  { id: 'sg',  name: 'Singapore',                      continent: 'AS' },
  { id: 'kr',  name: 'South Korea',                    continent: 'AS' },
  { id: 'lk',  name: 'Sri Lanka',                      continent: 'AS' },
  { id: 'sy',  name: 'Syria',                          continent: 'AS' },
  { id: 'tj',  name: 'Tajikistan',                     continent: 'AS' },
  { id: 'th',  name: 'Thailand',                       continent: 'AS' },
  { id: 'tl',  name: 'Timor-Leste',                    continent: 'AS' },
  { id: 'tr',  name: 'Türkiye',                        continent: 'AS' },
  { id: 'tm',  name: 'Turkmenistan',                   continent: 'AS' },
  { id: 'ae',  name: 'United Arab Emirates',           continent: 'AS' },
  { id: 'uz',  name: 'Uzbekistan',                     continent: 'AS' },
  { id: 'vn',  name: 'Vietnam',                        continent: 'AS' },
  { id: 'ye',  name: 'Yemen',                          continent: 'AS' },
  { id: 'au',  name: 'Australia',                      continent: 'AS' },
  { id: 'fj',  name: 'Fiji',                           continent: 'AS' },
  { id: 'ki',  name: 'Kiribati',                       continent: 'AS' },
  { id: 'mh',  name: 'Marshall Islands',               continent: 'AS' },
  { id: 'fm',  name: 'Micronesia',                     continent: 'AS' },
  { id: 'nr',  name: 'Nauru',                          continent: 'AS' },
  { id: 'nz',  name: 'New Zealand',                    continent: 'AS' },
  { id: 'pw',  name: 'Palau',                          continent: 'AS' },
  { id: 'pg',  name: 'Papua New Guinea',               continent: 'AS' },
  { id: 'ws',  name: 'Samoa',                          continent: 'AS' },
  { id: 'sb',  name: 'Solomon Islands',                continent: 'AS' },
  { id: 'to',  name: 'Tonga',                          continent: 'AS' },
  { id: 'tv',  name: 'Tuvalu',                         continent: 'AS' },
  { id: 'vu',  name: 'Vanuatu',                        continent: 'AS' },
  // Europe
  { id: 'al',  name: 'Albania',                        continent: 'EU' },
  { id: 'ad',  name: 'Andorra',                        continent: 'EU' },
  { id: 'am',  name: 'Armenia',                        continent: 'EU' },
  { id: 'at',  name: 'Austria',                        continent: 'EU' },
  { id: 'az',  name: 'Azerbaijan',                     continent: 'EU' },
  { id: 'by',  name: 'Belarus',                        continent: 'EU' },
  { id: 'be',  name: 'Belgium',                        continent: 'EU' },
  { id: 'ba',  name: 'Bosnia and Herzegovina',         continent: 'EU' },
  { id: 'bg',  name: 'Bulgaria',                       continent: 'EU' },
  { id: 'hr',  name: 'Croatia',                        continent: 'EU' },
  { id: 'cz',  name: 'Czechia',                        continent: 'EU' },
  { id: 'dk',  name: 'Denmark',                        continent: 'EU' },
  { id: 'ee',  name: 'Estonia',                        continent: 'EU' },
  { id: 'fi',  name: 'Finland',                        continent: 'EU' },
  { id: 'fr',  name: 'France',                         continent: 'EU' },
  { id: 'ge',  name: 'Georgia',                        continent: 'EU' },
  { id: 'de',  name: 'Germany',                        continent: 'EU' },
  { id: 'gr',  name: 'Greece',                         continent: 'EU' },
  { id: 'hu',  name: 'Hungary',                        continent: 'EU' },
  { id: 'is',  name: 'Iceland',                        continent: 'EU' },
  { id: 'ie',  name: 'Ireland',                        continent: 'EU' },
  { id: 'it',  name: 'Italy',                          continent: 'EU' },
  { id: 'lv',  name: 'Latvia',                         continent: 'EU' },
  { id: 'li',  name: 'Liechtenstein',                  continent: 'EU' },
  { id: 'lt',  name: 'Lithuania',                      continent: 'EU' },
  { id: 'lu',  name: 'Luxembourg',                     continent: 'EU' },
  { id: 'mt',  name: 'Malta',                          continent: 'EU' },
  { id: 'md',  name: 'Moldova',                        continent: 'EU' },
  { id: 'mc',  name: 'Monaco',                         continent: 'EU' },
  { id: 'me',  name: 'Montenegro',                     continent: 'EU' },
  { id: 'nl',  name: 'Netherlands',                    continent: 'EU' },
  { id: 'mk',  name: 'North Macedonia',                continent: 'EU' },
  { id: 'no',  name: 'Norway',                         continent: 'EU' },
  { id: 'pl',  name: 'Poland',                         continent: 'EU' },
  { id: 'pt',  name: 'Portugal',                       continent: 'EU' },
  { id: 'ro',  name: 'Romania',                        continent: 'EU' },
  { id: 'ru',  name: 'Russia',                         continent: 'EU' },
  { id: 'sm',  name: 'San Marino',                     continent: 'EU' },
  { id: 'rs',  name: 'Serbia',                         continent: 'EU' },
  { id: 'sk',  name: 'Slovakia',                       continent: 'EU' },
  { id: 'si',  name: 'Slovenia',                       continent: 'EU' },
  { id: 'es',  name: 'Spain',                          continent: 'EU' },
  { id: 'se',  name: 'Sweden',                         continent: 'EU' },
  { id: 'ch',  name: 'Switzerland',                    continent: 'EU' },
  { id: 'ua',  name: 'Ukraine',                        continent: 'EU' },
  { id: 'gb',  name: 'United Kingdom',                 continent: 'EU' },
  // North America
  { id: 'ag',  name: 'Antigua and Barbuda',            continent: 'NA' },
  { id: 'bs',  name: 'Bahamas',                        continent: 'NA' },
  { id: 'bb',  name: 'Barbados',                       continent: 'NA' },
  { id: 'bz',  name: 'Belize',                         continent: 'NA' },
  { id: 'ca',  name: 'Canada',                         continent: 'NA' },
  { id: 'cr',  name: 'Costa Rica',                     continent: 'NA' },
  { id: 'cu',  name: 'Cuba',                           continent: 'NA' },
  { id: 'dm',  name: 'Dominica',                       continent: 'NA' },
  { id: 'do',  name: 'Dominican Republic',             continent: 'NA' },
  { id: 'sv',  name: 'El Salvador',                    continent: 'NA' },
  { id: 'gd',  name: 'Grenada',                        continent: 'NA' },
  { id: 'gt',  name: 'Guatemala',                      continent: 'NA' },
  { id: 'ht',  name: 'Haiti',                          continent: 'NA' },
  { id: 'hn',  name: 'Honduras',                       continent: 'NA' },
  { id: 'jm',  name: 'Jamaica',                        continent: 'NA' },
  { id: 'mx',  name: 'Mexico',                         continent: 'NA' },
  { id: 'ni',  name: 'Nicaragua',                      continent: 'NA' },
  { id: 'pa',  name: 'Panama',                         continent: 'NA' },
  { id: 'kn',  name: 'Saint Kitts and Nevis',          continent: 'NA' },
  { id: 'lc',  name: 'Saint Lucia',                    continent: 'NA' },
  { id: 'vc',  name: 'Saint Vincent and the Grenadines', continent: 'NA' },
  { id: 'tt',  name: 'Trinidad and Tobago',            continent: 'NA' },
  { id: 'us',  name: 'United States',                  continent: 'NA' },
  // South America
  { id: 'ar',  name: 'Argentina',                      continent: 'SA' },
  { id: 'bo',  name: 'Bolivia',                        continent: 'SA' },
  { id: 'br',  name: 'Brazil',                         continent: 'SA' },
  { id: 'cl',  name: 'Chile',                          continent: 'SA' },
  { id: 'co',  name: 'Colombia',                       continent: 'SA' },
  { id: 'ec',  name: 'Ecuador',                        continent: 'SA' },
  { id: 'gy',  name: 'Guyana',                         continent: 'SA' },
  { id: 'py',  name: 'Paraguay',                       continent: 'SA' },
  { id: 'pe',  name: 'Peru',                           continent: 'SA' },
  { id: 'sr',  name: 'Suriname',                       continent: 'SA' },
  { id: 'uy',  name: 'Uruguay',                        continent: 'SA' },
  { id: 've',  name: 'Venezuela',                      continent: 'SA' },
];

export const SUBDIVISIONS: Record<string, { regions: string[] }> = {
  ca: { regions: ['British Columbia','Alberta','Saskatchewan','Manitoba','Ontario','Quebec','New Brunswick','Nova Scotia','Prince Edward Island','Newfoundland & Labrador','Yukon','Northwest Territories','Nunavut'] },
  us: { regions: ['Alabama','Alaska','Arizona','Arkansas','California','Colorado','Connecticut','Delaware','Florida','Georgia','Hawaii','Idaho','Illinois','Indiana','Iowa','Kansas','Kentucky','Louisiana','Maine','Maryland','Massachusetts','Michigan','Minnesota','Mississippi','Missouri','Montana','Nebraska','Nevada','New Hampshire','New Jersey','New Mexico','New York','North Carolina','North Dakota','Ohio','Oklahoma','Oregon','Pennsylvania','Rhode Island','South Carolina','South Dakota','Tennessee','Texas','Utah','Vermont','Virginia','Washington','West Virginia','Wisconsin','Wyoming'] },
  fr: { regions: ['Auvergne-Rhône-Alpes','Bourgogne-Franche-Comté','Bretagne','Centre-Val de Loire','Corse','Grand Est','Hauts-de-France','Île-de-France','Normandie','Nouvelle-Aquitaine','Occitanie','Pays de la Loire','Provence-Alpes-Côte d’Azur'] },
  cn: { regions: ['Anhui','Beijing','Chongqing','Fujian','Gansu','Guangdong','Guangxi','Guizhou','Hainan','Hebei','Heilongjiang','Henan','Hong Kong','Hubei','Hunan','Inner Mongolia','Jiangsu','Jiangxi','Jilin','Liaoning','Macau','Ningxia','Qinghai','Shaanxi','Shandong','Shanghai','Shanxi','Sichuan','Tianjin','Tibet','Xinjiang','Yunnan','Zhejiang'] },
  au: { regions: ['Australian Capital Territory','New South Wales','Northern Territory','Queensland','South Australia','Tasmania','Victoria','Western Australia'] },
};

export const GROUP_COLORS: GroupColor[] = [
  { id: 'red',    value: 'oklch(0.66 0.18 25)'  },
  { id: 'orange', value: 'oklch(0.73 0.16 60)'  },
  { id: 'amber',  value: 'oklch(0.82 0.14 90)'  },
  { id: 'green',  value: 'oklch(0.65 0.14 145)' },
  { id: 'teal',   value: 'oklch(0.65 0.12 195)' },
  { id: 'blue',   value: 'oklch(0.60 0.15 250)' },
  { id: 'purple', value: 'oklch(0.55 0.18 305)' },
  { id: 'pink',   value: 'oklch(0.70 0.16 350)' },
  { id: 'slate',  value: 'oklch(0.55 0.02 240)' },
];

export const GRADIENT_ENDPOINTS: GradientEndpoint[] = [
  { id: 'cream',  value: 'oklch(0.96 0.02 80)'  },
  { id: 'slate',  value: 'oklch(0.55 0.02 240)' },
  { id: 'ink',    value: 'oklch(0.25 0.01 240)' },
  { id: 'red',    value: 'oklch(0.55 0.20 25)'  },
  { id: 'orange', value: 'oklch(0.65 0.18 50)'  },
  { id: 'amber',  value: 'oklch(0.80 0.16 85)'  },
  { id: 'green',  value: 'oklch(0.55 0.16 145)' },
  { id: 'teal',   value: 'oklch(0.55 0.14 195)' },
  { id: 'blue',   value: 'oklch(0.50 0.18 250)' },
  { id: 'purple', value: 'oklch(0.45 0.18 305)' },
  { id: 'pink',   value: 'oklch(0.60 0.18 350)' },
];

export const GRADIENT_PRESETS: GradientPreset[] = [
  { id: 'blue-seq',  name: 'Blues',        start: 'cream', end: 'blue'   },
  { id: 'red-seq',   name: 'Reds',         start: 'cream', end: 'red'    },
  { id: 'green-seq', name: 'Greens',       start: 'cream', end: 'green'  },
  { id: 'yo-red',    name: 'Yellow → Red', start: 'amber', end: 'red'    },
  { id: 'br-div',    name: 'Blue ↔ Red',   start: 'blue',  end: 'red'    },
  { id: 'gray-seq',  name: 'Greys',        start: 'cream', end: 'ink'    },
];

export function colorById(id: string): string {
  return (GROUP_COLORS.find(c => c.id === id) ?? GROUP_COLORS[0]).value;
}

export function gradientColorById(id: string): string {
  return (GRADIENT_ENDPOINTS.find(c => c.id === id) ?? GRADIENT_ENDPOINTS[0]).value;
}

export function continentById(id: string): Continent | undefined {
  return CONTINENTS.find(c => c.id === id);
}

export function countryById(id: string): Country | undefined {
  return COUNTRIES.find(c => c.id === id);
}

export function unCountryById(id: string): UNCountry | undefined {
  return UN_COUNTRIES.find(c => c.id === id);
}

export function byContinent(continentId: string): UNCountry[] {
  return UN_COUNTRIES.filter(c => c.continent === continentId);
}

export function scaleRange(
  scaleType: string,
  dataMin: number,
  dataMax: number,
  customMin: string,
  customMax: string,
): [number, number] {
  if (scaleType === '0-100') return [0, 100];
  if (scaleType === 'custom') {
    const lo = Number(customMin);
    const hi = Number(customMax);
    if (Number.isNaN(lo) || Number.isNaN(hi)) return [0, 100];
    return [lo, hi];
  }
  if (dataMin === dataMax) {
    const v = Number.isFinite(dataMin) ? dataMin : 0;
    return [v, v === 0 ? 1 : v];
  }
  return [dataMin, dataMax];
}

export function parseGradientNumber(value: number | string): number | null {
  if (typeof value === 'number') return Number.isFinite(value) ? value : null;

  const trimmed = value.trim();
  if (trimmed === '' || trimmed === '-' || trimmed === '.' || trimmed === '-.') {
    return null;
  }

  const n = Number(trimmed);
  return Number.isFinite(n) ? n : null;
}

export function fmtNum(n: number): string {
  if (!Number.isFinite(n)) return '—';
  const r = Math.round(n * 100) / 100;
  return String(r);
}
