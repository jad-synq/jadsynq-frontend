import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Resume Builder',
  description: 'Build a professional resume optimised for ATS systems. Choose from 5 templates and get a live ATS score as you type.',
  openGraph: {
    title: 'Free ATS-Optimised Resume Builder | JAD Synq',
    description: 'Build your resume with 5 professional templates and get a live ATS compatibility score for every job you apply to.',
    url: 'https://jadsynq.com/resume-builder',
  },
}

export default function ResumeBuilderLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
