'use client'

import Link from 'next/link'
import { useState } from 'react'
import { CheckCircle, XCircle, TrendingUp, DollarSign, ChevronRight, Bookmark, BookmarkCheck } from 'lucide-react'
import { cn, formatWage, formatApprovalRate } from '@/lib/utils'
import { saveCompany, unsaveCompany } from '@/lib/api'
import type { SearchResult } from '@/lib/api'
import { useAuth } from '@/hooks/useAuth'
import { useRouter } from 'next/navigation'

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
            {result.logo_url && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={result.logo_url}
                alt={result.legal_name}
                className="w-9 h-9 rounded-lg object-contain border border-gray-100 bg-white p-0.5 shrink-0"
                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
              />
            )}
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
          <div className="flex gap-2">
            {result.careers_url && (
              <span className="text-xs text-gray-400 bg-gray-50 px-2 py-1 rounded-full">
                Careers page
              </span>
            )}
          </div>
          <span className="text-xs font-medium text-blue-600 group-hover:text-blue-700 flex items-center gap-0.5">
            View Details <ChevronRight className="w-3 h-3" />
          </span>
        </div>
      </div>
    </Link>
  )
}
