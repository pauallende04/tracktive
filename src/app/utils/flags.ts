export const countryFlags: Record<string, string> = {
    AL: '🇦🇱', // Albania
    AD: '🇦🇩', // Andorra
    AM: '🇦🇲', // Armenia
    AT: '🇦🇹', // Austria
    AZ: '🇦🇿', // Azerbaijan
    BY: '🇧🇾', // Belarus
    BE: '🇧🇪', // Belgium
    BA: '🇧🇦', // Bosnia and Herzegovina
    BG: '🇧🇬', // Bulgaria
    HR: '🇭🇷', // Croatia
    CY: '🇨🇾', // Cyprus
    CZ: '🇨🇿', // Czech Republic
    DK: '🇩🇰', // Denmark
    EE: '🇪🇪', // Estonia
    FI: '🇫🇮', // Finland
    FR: '🇫🇷', // France
    GE: '🇬🇪', // Georgia
    DE: '🇩🇪', // Germany
    GR: '🇬🇷', // Greece
    HU: '🇭🇺', // Hungary
    IS: '🇮🇸', // Iceland
    IE: '🇮🇪', // Ireland
    IT: '🇮🇹', // Italy
    KZ: '🇰🇿', // Kazakhstan
    LV: '🇱🇻', // Latvia
    LI: '🇱🇮', // Liechtenstein
    LT: '🇱🇹', // Lithuania
    LU: '🇱🇺', // Luxembourg
    MT: '🇲🇹', // Malta
    MD: '🇲🇩', // Moldova
    MC: '🇲🇨', // Monaco
    ME: '🇲🇪', // Montenegro
    NL: '🇳🇱', // Netherlands
    MK: '🇲🇰', // North Macedonia
    NO: '🇳🇴', // Norway
    PL: '🇵🇱', // Poland
    PT: '🇵🇹', // Portugal
    RO: '🇷🇴', // Romania
    RU: '🇷🇺', // Russia
    SM: '🇸🇲', // San Marino
    RS: '🇷🇸', // Serbia
    SK: '🇸🇰', // Slovakia
    SI: '🇸🇮', // Slovenia
    ES: '🇪🇸', // Spain
    SE: '🇸🇪', // Sweden
    CH: '🇨🇭', // Switzerland
    TR: '🇹🇷', // Turkey
    UA: '🇺🇦', // Ukraine
    GB: '🇬🇧', // United Kingdom
    VA: '🇻🇦', // Vatican City
    AF: '🇦🇫', // Afghanistan
    BH: '🇧🇭', // Bahrain
    BD: '🇧🇩', // Bangladesh
    BT: '🇧🇹', // Bhutan
    BN: '🇧🇳', // Brunei
    KH: '🇰🇭', // Cambodia
    CN: '🇨🇳', // China
    IN: '🇮🇳', // India
    ID: '🇮🇩', // Indonesia
    IR: '🇮🇷', // Iran
    IQ: '🇮🇶', // Iraq
    IL: '🇮🇱', // Israel
    JP: '🇯🇵', // Japan
    JO: '🇯🇴', // Jordan
    KW: '🇰🇼', // Kuwait
    KG: '🇰🇬', // Kyrgyzstan
    LA: '🇱🇦', // Laos
    LB: '🇱🇧', // Lebanon
    MY: '🇲🇾', // Malaysia
    MV: '🇲🇻', // Maldives
    MN: '🇲🇳', // Mongolia
    MM: '🇲🇲', // Myanmar
    NP: '🇳🇵', // Nepal
    KP: '🇰🇵', // North Korea
    OM: '🇴🇲', // Oman
    PK: '🇵🇰', // Pakistan
    PS: '🇵🇸', // Palestine
    PH: '🇵🇭', // Philippines
    QA: '🇶🇦', // Qatar
    SA: '🇸🇦', // Saudi Arabia
    SG: '🇸🇬', // Singapore
    KR: '🇰🇷', // South Korea
    LK: '🇱🇰', // Sri Lanka
    SY: '🇸🇾', // Syria
    TW: '🇹🇼', // Taiwan
    TJ: '🇹🇯', // Tajikistan
    TH: '🇹🇭', // Thailand
    TL: '🇹🇱', // Timor-Leste
    TM: '🇹🇲', // Turkmenistan
    AE: '🇦🇪', // United Arab Emirates
    UZ: '🇺🇿', // Uzbekistan
    VN: '🇻🇳', // Vietnam
    YE: '🇾🇪', // Yemen
    AG: '🇦🇬', // Antigua and Barbuda
    BS: '🇧🇸', // Bahamas
    BB: '🇧🇧', // Barbados
    BZ: '🇧🇿', // Belize
    CA: '🇨🇦', // Canada
    CR: '🇨🇷', // Costa Rica
    CU: '🇨🇺', // Cuba
    DM: '🇩🇲', // Dominica
    DO: '🇩🇴', // Dominican Republic
    SV: '🇸🇻', // El Salvador
    GD: '🇬🇩', // Grenada
    GT: '🇬🇹', // Guatemala
    HT: '🇭🇹', // Haiti
    HN: '🇭🇳', // Honduras
    JM: '🇯🇲', // Jamaica
    MX: '🇲🇽', // Mexico
    NI: '🇳🇮', // Nicaragua
    PA: '🇵🇦', // Panama
    KN: '🇰🇳', // Saint Kitts and Nevis
    LC: '🇱🇨', // Saint Lucia
    VC: '🇻🇨', // Saint Vincent and the Grenadines
    TT: '🇹🇹', // Trinidad and Tobago
    US: '🇺🇸', // United States
    AR: '🇦🇷', // Argentina
    BO: '🇧🇴', // Bolivia
    BR: '🇧🇷', // Brazil
    CL: '🇨🇱', // Chile
    CO: '🇨🇴', // Colombia
    EC: '🇪🇨', // Ecuador
    GY: '🇬🇾', // Guyana
    PY: '🇵🇾', // Paraguay
    PE: '🇵🇪', // Peru
    SR: '🇸🇷', // Suriname
    UY: '🇺🇾', // Uruguay
    VE: '🇻🇪', // Venezuela
  };
  
  export const getFlagEmoji = (countryCode: string): string => {
    return countryFlags[countryCode] || "🏳️";
  };
  