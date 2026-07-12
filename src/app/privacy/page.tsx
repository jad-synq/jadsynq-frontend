import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Privacy Policy — JAD Synq',
  description: 'How JAD Synq collects, uses, and protects your personal information.',
}

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-paper">
      <div className="max-w-3xl mx-auto px-6 py-12">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
          <h1 className="text-2xl font-black text-gray-900 mb-2">Privacy Policy</h1>
          <p className="text-sm text-gray-400 mb-8">Last updated: July 2026</p>

          <div className="prose prose-sm max-w-none text-gray-600 space-y-6">
            <section>
              <h2 className="text-base font-bold text-gray-900 mb-2">Information We Collect</h2>
              <p>We collect information you provide directly:</p>
              <ul className="list-disc pl-5 space-y-1 mt-2">
                <li>Account information (email address) when you sign up</li>
                <li>Resume text you upload or build in the Resume Builder</li>
                <li>Job applications you log in the application tracker</li>
                <li>Companies you save to your watchlist</li>
                <li>Visa status you select in your profile</li>
              </ul>
            </section>

            <section>
              <h2 className="text-base font-bold text-gray-900 mb-2">How We Use Your Information</h2>
              <ul className="list-disc pl-5 space-y-1">
                <li>To provide personalised job matching based on your resume</li>
                <li>To calculate ATS compatibility scores for job listings</li>
                <li>To show visa-relevant guidance based on your status</li>
                <li>To maintain your application tracker history</li>
              </ul>
              <p className="mt-3">
                We do not sell your personal data to third parties. We do not share your resume or
                application data with employers.
              </p>
            </section>

            <section>
              <h2 className="text-base font-bold text-gray-900 mb-2">Data Storage</h2>
              <p>
                Your data is stored securely in Supabase (PostgreSQL), hosted on AWS infrastructure
                in the US East region. We use row-level security to ensure your data is only
                accessible to you.
              </p>
            </section>

            <section>
              <h2 className="text-base font-bold text-gray-900 mb-2">Authentication</h2>
              <p>
                We use Supabase Auth for authentication. Passwords are hashed and never stored in
                plain text. Session tokens are stored as HTTP-only cookies.
              </p>
            </section>

            <section>
              <h2 className="text-base font-bold text-gray-900 mb-2">Analytics</h2>
              <p>
                We use Vercel Analytics to understand aggregate page usage. This is privacy-friendly
                analytics that does not use cookies or track individuals across sites.
              </p>
            </section>

            <section>
              <h2 className="text-base font-bold text-gray-900 mb-2">Your Rights</h2>
              <p>You may at any time:</p>
              <ul className="list-disc pl-5 space-y-1 mt-2">
                <li>Delete your saved resume from your Profile page</li>
                <li>Delete your account by contacting us</li>
                <li>Request an export of your data by contacting us</li>
              </ul>
            </section>

            <section>
              <h2 className="text-base font-bold text-gray-900 mb-2">Contact</h2>
              <p>
                Privacy questions:{' '}
                <a href="mailto:hello@jadsynq.com" className="text-brand hover:underline">
                  hello@jadsynq.com
                </a>
              </p>
            </section>
          </div>

          <div className="mt-8 pt-6 border-t border-gray-100 flex gap-4 text-xs text-gray-400">
            <Link href="/disclaimer" className="hover:text-brand">Data Disclaimer</Link>
            <Link href="/terms" className="hover:text-brand">Terms of Service</Link>
            <Link href="/" className="hover:text-brand ml-auto">← Back to home</Link>
          </div>
        </div>
      </div>
    </div>
  )
}
