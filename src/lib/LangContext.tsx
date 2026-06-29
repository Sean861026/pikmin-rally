'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import type { Lang } from './i18n'

type LangContextType = {
  lang: Lang
  setLang: (lang: Lang) => void
}

const LangContext = createContext<LangContextType>({ lang: 'zh', setLang: () => {} })

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>('zh')

  useEffect(() => {
    const saved = localStorage.getItem('lang') as Lang | null
    if (saved === 'zh' || saved === 'en' || saved === 'ja') setLangState(saved)
  }, [])

  const setLang = (next: Lang) => {
    localStorage.setItem('lang', next)
    setLangState(next)
  }

  return <LangContext.Provider value={{ lang, setLang }}>{children}</LangContext.Provider>
}

export const useLang = () => useContext(LangContext)
