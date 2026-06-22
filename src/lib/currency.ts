export type CurrencyCode = 'MYR' | 'SGD' | 'USD' | 'EUR'

const EXCHANGE_RATES: Record<CurrencyCode, number> = {
  MYR: 1,
  SGD: 0.30,
  USD: 0.22,
  EUR: 0.20,
}

const SYMBOLS: Record<CurrencyCode, string> = {
  MYR: 'RM',
  SGD: 'SGD',
  USD: 'USD',
  EUR: '€',
}

export const CURRENCIES: CurrencyCode[] = ['MYR', 'SGD', 'USD', 'EUR']

export function convertPrice(amountMYR: number, currency: CurrencyCode): number {
  return Math.round(amountMYR * EXCHANGE_RATES[currency])
}

export function formatPrice(amountMYR: number, currency: CurrencyCode): string {
  const converted = convertPrice(amountMYR, currency)
  const symbol = SYMBOLS[currency]
  if (currency === 'EUR') {
    return `€${converted.toLocaleString()}`
  }
  return `${symbol} ${converted.toLocaleString()}`
}

export function detectCurrency(): CurrencyCode {
  if (typeof navigator === 'undefined') return 'MYR'

  const lang = navigator.language || ''
  const region = lang.split('-')[1]?.toUpperCase() || ''

  if (region === 'SG' || lang === 'en-SG') return 'SGD'
  if (region === 'US' || lang === 'en-US') return 'USD'
  if (['DE', 'FR', 'IT', 'ES', 'NL', 'AT', 'BE', 'PT', 'IE', 'FI', 'GR'].includes(region)) return 'EUR'

  return 'MYR'
}
