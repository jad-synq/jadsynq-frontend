import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'ATS Resume Checker',
  description: 'Check how well your resume scores against a job description. Get keyword match scores, readability analysis, and a generated cover letter.',
  openGraph: {
    title: 'Free ATS Resume Checker | JAD Synq',
    description: 'Score your resume against any job description. See matched and missing keywords, readability analysis, and generate a cover letter.',
    url: 'https://jadsynq.com/ats-check',
  },
}

export default function ATSLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
