'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { TrendingUp, Briefcase, Flame, Building2 } from 'lucide-react'
import { getMarketInsights, MarketInsights } from '@/lib/api'
import { PageLoader } from '@/components/ui/Skeleton'
import CompanyLogo from '@/components/ui/CompanyLogo'

function HorizontalBarList({ items }: { items: { label: string; value: number; href?: string }[] }) {
  const max = Math.max(...items.map(i => i.value), 1)
  return (
    <div className="space-y-3">
      {items.map(item => {
        const row = (
          <div className="flex items-center gap-3">
            <span className="text-sm text-ink-soft font-medium w-40 sm:w-48 shrink-0 truncate">{item.label}</span>
            <div className="flex-1 h-2.5 bg-line rounded-full overflow-hidden">
              <div
                className="h-full bg-brand rounded-full"
                style={{ width: `${Math.max(4, (item.value / max) * 100)}%` }}
              />
            </div>
            <span className="text-xs font-bold text-ink-soft w-14 text-right shrink-0 tabular-nums">
              {item.value.toLocaleString()}
            </span>
          </div>
        )
        return item.href ? (
          <Link key={item.label} href={item.href} className="block hover:opacity-80 transition-opacity">{row}</Link>
        ) : (
          <div key={item.label}>{row}</div>
        )
      })}
    </div>
  )
}

export default function InsightsPage() {
  const [data, setData] = useState<MarketInsights | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getMarketInsights()
      .then(res => setData(res.data))
      .catch(() => setData(null))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <PageLoader message="Crunching market data…" />

  if (!data) {
    return (
      <main className="min-h-screen bg-paper flex items-center justify-center px-4">
        <p className="text-muted">Couldn&apos;t load market insights right now.</p>
      </main>
    )
  }

  const maxPetitions = Math.max(...data.h1b_trend.map(t => t.total_petitions), 1)

  return (
    <main className="min-h-screen bg-paper">
      <div className="bg-paper-raised border-b border-line">
        <div className="max-w-4xl mx-auto px-6 py-8">
          <p className="text-xs font-bold uppercase tracking-widest text-muted mb-2">Market Insights</p>
          <h1 className="font-display text-3xl font-bold text-ink mb-2">Where the sponsorship activity is</h1>
          <p className="text-muted max-w-xl">
            Aggregate, platform-wide trends across every H-1B filing and live job posting we track —
            not personalized to you.
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8 space-y-6">

        {/* H-1B trend */}
        <div className="bg-paper-raised rounded-2xl border border-line p-6">
          <h2 className="font-display font-bold text-lg text-ink mb-1 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-brand" /> H-1B Filings &amp; Approval Rate by Year
          </h2>
          <p className="text-sm text-muted mb-5">Across every company we track, not just active sponsors.</p>

          <div className="flex items-end gap-3 h-32 mb-4">
            {data.h1b_trend.map(year => (
              <div key={year.fiscal_year} className="flex-1 flex flex-col items-center gap-1.5 group">
                <span className="text-[11px] font-bold text-ink-soft tabular-nums">
                  {year.approval_rate !== null ? `${Math.round(year.approval_rate * 100)}%` : '—'}
                </span>
                <div
                  className="w-full bg-brand rounded-t-md group-hover:bg-brand-deep transition-colors cursor-default"
                  style={{ height: `${Math.max(6, (year.total_petitions / maxPetitions) * 96)}px` }}
                  title={`FY${year.fiscal_year}: ${year.total_petitions.toLocaleString()} petitions`}
                />
                <span className="text-xs text-muted font-medium">FY{year.fiscal_year}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Top hiring companies */}
        <div className="bg-paper-raised rounded-2xl border border-line p-6">
          <h2 className="font-display font-bold text-lg text-ink mb-1 flex items-center gap-2">
            <Flame className="w-5 h-5 text-gold-deep" /> Most Actively Hiring Right Now
          </h2>
          <p className="text-sm text-muted mb-5">Ranked by number of live open roles.</p>
          <div className="space-y-3">
            {data.top_hiring_companies.map((c, i) => (
              <Link
                key={c.id}
                href={`/companies/${c.id}`}
                className="flex items-center gap-3 hover:bg-paper rounded-lg -mx-2 px-2 py-1.5 transition-colors"
              >
                <span className="text-xs text-muted font-semibold w-4 shrink-0">{i + 1}</span>
                <CompanyLogo logoUrl={c.logo_url} domain={null} name={c.legal_name} size="sm" />
                <span className="flex-1 text-sm font-medium text-ink truncate">{c.legal_name}</span>
                <span className="text-xs font-bold text-brand-deep bg-brand/10 px-2 py-1 rounded-full shrink-0">
                  {c.active_listings} open
                </span>
              </Link>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* Top roles */}
          <div className="bg-paper-raised rounded-2xl border border-line p-6">
            <h2 className="font-display font-bold text-lg text-ink mb-1 flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-brand" /> Most In-Demand Titles
            </h2>
            <p className="text-sm text-muted mb-5">By number of live open listings.</p>
            <HorizontalBarList
              items={data.top_roles.map(r => ({
                label: r.title,
                value: r.listing_count,
                href: `/jobs?title=${encodeURIComponent(r.title)}`,
              }))}
            />
          </div>

          {/* Top industries */}
          <div className="bg-paper-raised rounded-2xl border border-line p-6">
            <h2 className="font-display font-bold text-lg text-ink mb-1 flex items-center gap-2">
              <Building2 className="w-5 h-5 text-gold-deep" /> Top Industries by H-1B Volume
            </h2>
            <p className="text-sm text-muted mb-5">Total petitions filed, all years.</p>
            <HorizontalBarList
              items={data.top_industries.map(i => ({ label: i.industry, value: i.total_petitions }))}
            />
          </div>
        </div>
      </div>
    </main>
  )
}
