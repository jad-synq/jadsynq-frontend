import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Jobs — H-1B Sponsor Openings',
  description: 'Browse live job openings at H-1B sponsoring companies. Filter by visa type, E-Verify enrollment, and get ATS match scores for your resume.',
  openGraph: {
    title: 'Jobs at H-1B Sponsors | JAD Synq',
    description: 'Live job openings ranked by how well they match your resume. Built for OPT and H-1B candidates.',
    url: 'https://jadsynq.com/jobs',
  },
}

export default function JobsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
