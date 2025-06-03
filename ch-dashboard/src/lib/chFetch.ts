export async function chFetch(path: string) {
  const key = process.env.CH_API_KEY
  const res = await fetch(`https://api.company-information.service.gov.uk${path}`, {
    headers: {
      Authorization: `Basic ${Buffer.from(key + ':').toString('base64')}`
    },
    // ISR caching: revalidate every 10 min
    next: { revalidate: Number(process.env.NEXT_PUBLIC_POLL_INTERVAL) / 1000 }
  })
  if (!res.ok) throw new Error(`CH API ${res.status}`)
  return res.json()
}
