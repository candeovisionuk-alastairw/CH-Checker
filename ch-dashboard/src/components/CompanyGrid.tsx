'use client'
import Link from 'next/link'

export type Company = { company_name: string; company_number: string }

export default function CompanyGrid({ companies }: { companies: Company[] }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 p-6">
      {companies.map((c) => (
        <div key={c.company_number} className="bg-white rounded-2xl shadow p-5">
          <h3 className="text-xl font-semibold">{c.company_name}</h3>
          <p className="text-gray-500">#{c.company_number}</p>
          <Link href={`/company/${c.company_number}`}>
            <button className="mt-4 px-4 py-2 border rounded-lg hover:bg-gray-100">
              View Details
            </button>
          </Link>
        </div>
      ))}
    </div>
  )
}
