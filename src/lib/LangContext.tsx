'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import type { Lang } from './i18n'

type LangContextType = {
  lang: Lang
  toggle: () => void
}

const LangContext = createContext<LangContextType>({ lang: 'zh', toggle: () => {} })

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>('zh')

  useEffect(() => {
    const saved = localStorage.getItem('lang') as Lang | null
    if (saved === 'zh' || saved === 'en') setLang(saved)
  }, [])

  const toggle = () => {
    setLang((prev) => {
      const next = prev === 'zh' ? 'en' : prev === 'en' ? 'ja' : 'zh'
      localStorage.setItem('lang', next)
      return next
    })
  }

  return <LangContext.Provider value={{ lang, toggle }}>{children}</LangContext.Provider>
}

export const useLang = () => useContext(LangContext)
