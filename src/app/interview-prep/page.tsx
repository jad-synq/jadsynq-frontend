'use client'

import { Suspense, useMemo, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { Briefcase, MessageCircle, Search, Sparkles, Globe2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  ALL_CATEGORIES, STAR_TIPS, VISA_INTERVIEW_TIPS, findRoleCategory, RoleCategory,
} from '@/lib/interview-prep'

function QuestionList({ title, questions }: { title: string; questions: string[] }) {
  if (!questions.length) return null
  return (
    <div className="mb-6">
      <p className="text-xs font-bold uppercase tracking-wide text-gray-400 mb-2">{title}</p>
      <ul className="space-y-2">
        {questions.map((q, i) => (
          <li key={i} className="flex items-start gap-2 text-sm text-gray-700 bg-gray-50 rounded-xl p-3">
            <MessageCircle className="w-4 h-4 text-[#16a34a] shrink-0 mt-0.5" />
            <span>{q}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

function InterviewPrepContent() {
  const searchParams = useSearchParams()
  const roleParam = searchParams.get('role')
  const [query, setQuery] = useState('')
  const [selected, setSelected] = useState<RoleCategory>(() =>
    roleParam ? findRoleCategory(roleParam) : ALL_CATEGORIES[0]
  )

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return ALL_CATEGORIES
    return ALL_CATEGORIES.filter(c => c.label.toLowerCase().includes(q))
  }, [query])

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 py-10">
        <div className="flex items-center gap-2 mb-2">
          <Briefcase className="w-5 h-5 text-[#16a34a]" />
          <h1 className="text-xl font-bold text-gray-900">Interview Prep</h1>
        </div>
        <p className="text-sm text-gray-500 mb-6">
          Common questions and tips by role -- including guidance for talking about visa sponsorship.
        </p>

        <div className="grid lg:grid-cols-[220px_1fr] gap-6">
          {/* Role picker */}
          <div>
            <div className="relative mb-3">
              <Search className="w-4 h-4 text-gray-300 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Search roles..."
                className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#16a34a]"
              />
            </div>
            <div className="flex lg:flex-col gap-2 overflow-x-auto lg:overflow-visible pb-2 lg:pb-0">
              {filtered.map(c => (
                <button
                  key={c.id}
                  onClick={() => setSelected(c)}
                  className={cn(
                    'shrink-0 text-left px-3 py-2 rounded-xl text-sm font-semibold transition-colors whitespace-nowrap lg:whitespace-normal',
                    selected.id === c.id
                      ? 'bg-[#16a34a] text-white'
                      : 'bg-white border border-gray-200 text-gray-600 hover:border-[#16a34a] hover:text-[#16a34a]'
                  )}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>

          {/* Content */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <h2 className="font-bold text-gray-900 mb-4">{selected.label}</h2>
              <QuestionList title="Technical / Role-Specific" questions={selected.technicalQuestions} />
              <QuestionList title="Behavioral" questions={selected.behavioralQuestions} />
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="w-4 h-4 text-[#16a34a]" />
                <h2 className="font-bold text-gray-900">Answering with the STAR Method</h2>
              </div>
              <ul className="space-y-2">
                {STAR_TIPS.map((tip, i) => (
                  <li key={i} className="text-sm text-gray-700">&bull; {tip}</li>
                ))}
              </ul>
            </div>

            <div className="bg-white rounded-2xl border border-green-100 p-6">
              <div className="flex items-center gap-2 mb-4">
                <Globe2 className="w-4 h-4 text-[#16a34a]" />
                <h2 className="font-bold text-gray-900">Talking About Visa Sponsorship</h2>
              </div>
              <ul className="space-y-2">
                {VISA_INTERVIEW_TIPS.map((tip, i) => (
                  <li key={i} className="text-sm text-gray-700">&bull; {tip}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}

export default function InterviewPrepPage() {
  return (
    <Suspense fallback={null}>
      <InterviewPrepContent />
    </Suspense>
  )
}
