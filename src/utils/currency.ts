// Currency conversion utilities
export const EXCHANGE_RATES: Record<string, number> = {
  // Base currency is USD
  'USD': 1,
  'EUR': 0.85,
  'COP': 4100,
  'MXN': 18.5,
  'ARS': 350,
  'CLP': 950,
  'PEN': 3.8,
  'BRL': 5.2,
  'GBP': 0.73,
  'CAD': 1.25,
  'AUD': 1.35,
  'JPY': 110,
  'CNY': 6.45,
  'INR': 74,
  'RUB': 75,
  'ZAR': 14.5,
  'UYU': 42,
  'BOB': 6.9,
  'PYG': 7000,
  'GTQ': 7.8,
  'HNL': 24.5,
};

export const CURRENCY_SYMBOLS: Record<string, string> = {
  'USD': '$',
  'EUR': '€',
  'COP': '$',
  'MXN': '$',
  'ARS': '$',
  'CLP': '$',
  'PEN': 'S/',
  'BRL': 'R$',
  'GBP': '£',
  'CAD': 'C$',
  'AUD': 'A$',
  'JPY': '¥',
  'CNY': '¥',
  'INR': '₹',
  'RUB': '₽',
  'ZAR': 'R',
  'UYU': '$U',
  'BOB': 'Bs.',
  'PYG': '₲',
  'GTQ': 'Q',
  'HNL': 'L',
};

export const CURRENCY_NAMES: Record<string, string> = {
  'USD': 'US Dollar',
  'EUR': 'Euro',
  'COP': 'Colombian Peso',
  'MXN': 'Mexican Peso',
  'ARS': 'Argentine Peso',
  'CLP': 'Chilean Peso',
  'PEN': 'Peruvian Sol',
  'BRL': 'Brazilian Real',
  'GBP': 'British Pound',
  'CAD': 'Canadian Dollar',
  'AUD': 'Australian Dollar',
  'JPY': 'Japanese Yen',
  'CNY': 'Chinese Yuan',
  'INR': 'Indian Rupee',
  'RUB': 'Russian Ruble',
  'ZAR': 'South African Rand',
  'UYU': 'Uruguayan Peso',
  'BOB': 'Bolivian Boliviano',
  'PYG': 'Paraguayan Guarani',
  'GTQ': 'Guatemalan Quetzal',
  'HNL': 'Honduran Lempira',
};

export function convertCurrency(amount: number, fromCurrency: string, toCurrency: string): number {
  // Convert to USD first, then to target currency
  const amountInUSD = amount / EXCHANGE_RATES[fromCurrency];
  const convertedAmount = amountInUSD * EXCHANGE_RATES[toCurrency];
  return Math.round(convertedAmount * 100) / 100; // Round to 2 decimal places
}

export function formatCurrency(amount: number, currency: string, locale: string = 'en-US'): string {
  const symbol = CURRENCY_SYMBOLS[currency] || currency;

  // Special formatting for some currencies
  if (currency === 'COP' || currency === 'ARS' || currency === 'CLP') {
    // No decimals for these currencies
    return `${symbol}${Math.round(amount).toLocaleString(locale === 'es' ? 'es-ES' : 'en-US')}`;
  }

  return new Intl.NumberFormat(locale === 'es' ? 'es-ES' : 'en-US', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function getDefaultCurrencyForCountry(country: string): string {
  const defaults: Record<string, string> = {
    'Colombia': 'COP',
    'España': 'EUR',
    'Estados Unidos': 'USD',
    'México': 'MXN',
    'Argentina': 'ARS',
    'Chile': 'CLP',
    'Perú': 'PEN',
    'Brasil': 'BRL',
    'Italia': 'EUR',
    'Francia': 'EUR',
    'Alemania': 'EUR',
    'Venezuela': 'USD',
    'Uruguay': 'UYU',
    'Ecuador': 'USD',
    'Bolivia': 'BOB',
    'Paraguay': 'PYG',
    'Guatemala': 'GTQ',
    'Honduras': 'HNL',
    'El Salvador': 'USD',
    'Canadá': 'CAD',
    'Reino Unido': 'GBP',
    'Australia': 'AUD',
    'Japón': 'JPY',
    'China': 'CNY',
    'India': 'INR',
    'Rusia': 'RUB',
    'Sudáfrica': 'ZAR',
  };

  return defaults[country] || 'USD';
}
