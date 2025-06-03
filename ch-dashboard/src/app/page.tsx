'use client'
import { useContext, useState, useEffect } from 'react'
import { FollowsContext } from '@/context/FollowsContext'
import CompanyGrid, { Company } from '@/components/CompanyGrid'
import useSWR from 'swr'
import fetcher from '@/lib/fetcher'

export default function Home() {
  const { follows, add } = useContext(FollowsContext)
  const [num, setNum] = useState('')
  const { data: profiles } = useSWR(
    follows.map(n => `/api/company/${n}`),
    (urls) => Promise.all(urls.map(url => fetcher(url))),
    { refreshInterval: Number(process.env.NEXT_PUBLIC_POLL_INTERVAL) }
  )

  return (
    <main>
      <div className="p-6">
        <input
          value={num}
          onChange={e => setNum(e.target.value)}
          placeholder="Company number"
          className="border p-2 rounded"
        />
        <button
          onClick={() => { add(num); setNum('') }}
          className="ml-2 px-4 py-2 bg-blue-600 text-white rounded"
        >
          Add
        </button>
      </div>
      {profiles && <CompanyGrid companies={profiles as Company[]} />}
    </main>
  )
}
