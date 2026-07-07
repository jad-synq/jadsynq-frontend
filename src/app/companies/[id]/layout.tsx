import type { Metadata } from 'next'

const API = process.env.NEXT_PUBLIC_API_URL ?? 'https://jadsynq-backend.onrender.com'

export async function generateMetadata(
  { params }: { params: Promise<{ id: string }> }
): Promise<Metadata> {
  const { id } = await params
  try {
    const res = await fetch(`${API}/api/companies/${id}`, { next: { revalidate: 3600 } })
    if (res.ok) {
      const c = await res.json()
      const name = c.legal_name ?? 'Company'
      const rate = c.h1b_approval_rate != null ? `${Math.round(c.h1b_approval_rate)}% H-1B approval rate` : null
      const desc = [
        `${name} E-Verify and H-1B sponsorship data.`,
        rate,
        'View petition history, approval rates, and open jobs on JAD Synq.',
      ].filter(Boolean).join(' ')
      return {
        title: `${name} — H-1B & E-Verify Data`,
        description: desc,
        openGraph: {
          title: `${name} — H-1B Sponsorship Data | JAD Synq`,
          description: desc,
          url: `https://jadsynq.com/companies/${id}`,
        },
      }
    }
  } catch { /* fall through to default */ }
  return {
    title: 'Company Profile',
    description: 'View H-1B sponsorship history and E-Verify enrollment status on JAD Synq.',
  }
}

export default function CompanyLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
