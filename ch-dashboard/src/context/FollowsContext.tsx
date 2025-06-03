'use client'
import React, { createContext, useState, useEffect } from 'react'

interface FollowsCtx {
  follows: string[]
  add: (num: string) => void
}
export const FollowsContext = createContext<FollowsCtx>({ follows: [], add: () => {} })

export function FollowsProvider({ children }: { children: React.ReactNode }) {
  const [follows, setFollows] = useState<string[]>([])
  
  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem('follows') || '[]')
    setFollows(saved)
  }, [])
  
  const add = (num: string) => {
    if (!follows.includes(num)) {
      const updated = [...follows, num]
      setFollows(updated)
      localStorage.setItem('follows', JSON.stringify(updated))
    }
  }

  return (
    <FollowsContext.Provider value={{ follows, add }}>
      {children}
    </FollowsContext.Provider>
  )
}
