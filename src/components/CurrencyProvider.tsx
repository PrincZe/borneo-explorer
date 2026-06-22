'use client'

import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import { type CurrencyCode, detectCurrency, formatPrice as formatPriceUtil, CURRENCIES } from '@/lib/currency'

interface CurrencyContextValue {
  currency: CurrencyCode
  setCurrency: (c: CurrencyCode) => void
  formatPrice: (amountMYR: number) => string
}

const CurrencyContext = createContext<CurrencyContextValue>({
  currency: 'MYR',
  setCurrency: () => {},
  formatPrice: (amount) => `RM ${amount.toLocaleString()}`,
})

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [currency, setCurrencyState] = useState<CurrencyCode>('MYR')

  useEffect(() => {
    const stored = localStorage.getItem('currency') as CurrencyCode | null
    if (stored && CURRENCIES.includes(stored)) {
      setCurrencyState(stored)
    } else {
      setCurrencyState(detectCurrency())
    }
  }, [])

  function setCurrency(c: CurrencyCode) {
    setCurrencyState(c)
    localStorage.setItem('currency', c)
  }

  function formatPrice(amountMYR: number) {
    return formatPriceUtil(amountMYR, currency)
  }

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency, formatPrice }}>
      {children}
    </CurrencyContext.Provider>
  )
}

export function useCurrency() {
  return useContext(CurrencyContext)
}

export function CurrencySwitcher() {
  const { currency, setCurrency } = useCurrency()

  return (
    <select
      value={currency}
      onChange={(e) => setCurrency(e.target.value as CurrencyCode)}
      className="bg-muted border border-border text-foreground rounded-lg px-2.5 py-1.5 text-xs font-medium cursor-pointer hover:bg-muted/80 transition-colors"
    >
      {CURRENCIES.map((c) => (
        <option key={c} value={c}>{c}</option>
      ))}
    </select>
  )
}
