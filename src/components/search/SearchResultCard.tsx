'use client'

import Link from 'next/link'
import { useState } from 'react'
import { CheckCircle, XCircle, TrendingUp, DollarSign, ChevronRight, Bookmark, BookmarkCheck } from 'lucide-react'
import { cn, formatWage, formatApprovalRate } from '@/lib/utils'
import { saveCompany, unsaveCompany } from '@/lib/api'
import type { SearchResult } from '@/lib/api'
import { useAuth } from '@/hooks/useAuth'
import { useRouter } from 'next/navigation'
import CompanyLogo, { linkedinCompanyUrl } from '@/components/ui/CompanyLogo'

interface SearchResultCardProps {
  result: SearchResult
}

export default function SearchResultCard({ result }: SearchResultCardProps) {
  const isEnrolled = result.everify_status === 'enrolled'
  const hasH1B = result.h1b_petitions_last_year > 0
  const { user } = useAuth()
  const router = useRouter()
  const [saved, setSaved] = useState(false)
  const [saveLoading, setSaveLoading] = useState(false)

  const handleSave = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (!user) { router.push('/auth'); return }
    setSaveLoading(true)
    try {
      if (saved) { await unsaveCompany(result.id); setSaved(false) }
      else { await saveCompany(result.id); setSaved(true) }
    } catch { /* ignore */ } finally { setSaveLoading(false) }
  }

  return (
    <Link href={`/companies/${result.id}`}>
      <div className={cn(
        "bg-white rounded-2xl border border-gray-100 p-5 hover:border-blue-200",
        "hover:shadow-md transition-all cursor-pointer group"
      )}>
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            <CompanyLogo
              logoUrl={result.logo_url}
              domain={result.domain}
              name={result.legal_name}
              size="sm"
            />
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors truncate">
                {result.legal_name}
              </h3>
              {result.dba_name && (
                <p className="text-sm text-gray-500 mt-0.5">DBA: {result.dba_name}</p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            {isEnrolled ? (
              <span className="flex items-center gap-1 text-xs font-medium text-[#14532d] bg-[#f0fdf4] px-2 py-1 rounded-full">
                <CheckCircle className="w-3 h-3" />
                E-Verify
              </span>
            ) : (
              <span className="flex items-center gap-1 text-xs font-medium text-gray-400 bg-gray-50 px-2 py-1 rounded-full">
                <XCircle className="w-3 h-3" />
                No E-Verify
              </span>
            )}
            <button
              onClick={handleSave}
              disabled={saveLoading}
              title={saved ? 'Remove from saved' : 'Save company'}
              className={cn(
                'p-1.5 rounded-lg transition-colors disabled:opacity-40',
                saved ? 'text-blue-600 bg-blue-50 hover:bg-blue-100' : 'text-gray-300 hover:text-gray-500 hover:bg-gray-50'
              )}
            >
              {saved ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <div className="mt-3 flex flex-wrap gap-4">
          <div className="flex items-center gap-1.5 text-sm">
            <TrendingUp className={cn("w-4 h-4", hasH1B ? "text-blue-500" : "text-gray-300")} />
            <span className={cn("font-medium", hasH1B ? "text-gray-900" : "text-gray-400")}>
              {hasH1B ? `${result.h1b_petitions_last_year.toLocaleString()} H-1B petitions` : 'No H-1B history'}
            </span>
          </div>
          {result.approval_rate !== null && (
            <div className="flex items-center gap-1.5 text-sm">
              <span className="text-gray-500">Approval:</span>
              <span className={cn(
                "font-medium",
                result.approval_rate >= 0.95 ? "text-[#16a34a]" :
                result.approval_rate >= 0.80 ? "text-yellow-600" : "text-red-600"
              )}>
                {formatApprovalRate(result.approval_rate)}
              </span>
            </div>
          )}
          {result.avg_wage !== null && (
            <div className="flex items-center gap-1.5 text-sm">
              <DollarSign className="w-4 h-4 text-gray-300" />
              <span className="text-gray-600">{formatWage(result.avg_wage)} avg</span>
            </div>
          )}
        </div>

        {result.match_confidence < 0.85 && (
          <p className="mt-2 text-xs text-gray-400">
            Fuzzy match — {Math.round(result.match_confidence * 100)}% confidence
          </p>
        )}

        <div className="mt-3 pt-3 border-t border-gray-50 flex items-center justify-between">
          <div className="flex gap-2 items-center">
            {result.careers_url && (
              <span className="text-xs text-gray-400 bg-gray-50 px-2 py-1 rounded-full">
                Careers page
              </span>
            )}
            <a
              href={linkedinCompanyUrl(result.domain, result.legal_name)}
              target="_blank"
              rel="noopener noreferrer"
              onClick={e => e.stopPropagation()}
              title="View on LinkedIn"
              className="flex items-center gap-1 text-xs text-[#0a66c2] hover:underline"
            >
              <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
              </svg>
              LinkedIn
            </a>
          </div>
          <span className="text-xs font-medium text-blue-600 group-hover:text-blue-700 flex items-center gap-0.5">
            View Details <ChevronRight className="w-3 h-3" />
          </span>
        </div>
      </div>
    </Link>
  )
}
