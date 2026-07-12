import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Terms of Service — JAD Synq',
  description: 'Terms and conditions for using the JAD Synq platform.',
}

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-paper">
      <div className="max-w-3xl mx-auto px-6 py-12">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
          <h1 className="text-2xl font-black text-gray-900 mb-2">Terms of Service</h1>
          <p className="text-sm text-gray-400 mb-8">Last updated: July 2026</p>

          <div className="prose prose-sm max-w-none text-gray-600 space-y-6">
            <section>
              <h2 className="text-base font-bold text-gray-900 mb-2">Acceptance of Terms</h2>
              <p>
                By accessing or using JAD Synq (&ldquo;the Service&rdquo;), you agree to be bound by
                these Terms of Service. If you do not agree, do not use the Service.
              </p>
            </section>

            <section>
              <h2 className="text-base font-bold text-gray-900 mb-2">Use of the Service</h2>
              <p>You may use JAD Synq for lawful personal job-search purposes only. You agree not to:</p>
              <ul className="list-disc pl-5 space-y-1 mt-2">
                <li>Scrape, copy, or systematically download data from the Service</li>
                <li>Use the Service for commercial data resale or aggregation</li>
                <li>Attempt to access systems or data beyond your own account</li>
                <li>Submit false or misleading information</li>
              </ul>
            </section>

            <section>
              <h2 className="text-base font-bold text-gray-900 mb-2">Account Responsibility</h2>
              <p>
                You are responsible for maintaining the security of your account credentials.
                You are responsible for all activity that occurs under your account.
              </p>
            </section>

            <section>
              <h2 className="text-base font-bold text-gray-900 mb-2">Intellectual Property</h2>
              <p>
                The JAD Synq platform, design, and original content are owned by JAD Synq. Government
                data (H-1B, E-Verify) is public domain. Resume content you upload remains yours.
              </p>
            </section>

            <section>
              <h2 className="text-base font-bold text-gray-900 mb-2">Disclaimer of Warranties</h2>
              <p>
                The Service is provided &ldquo;as is&rdquo; without warranties of any kind. We do not
                warrant that the Service will be uninterrupted, error-free, or that data will be
                accurate or current. See our{' '}
                <Link href="/disclaimer" className="text-brand hover:underline">
                  Data Disclaimer
                </Link>{' '}
                for details on data accuracy.
              </p>
            </section>

            <section>
              <h2 className="text-base font-bold text-gray-900 mb-2">Limitation of Liability</h2>
              <p>
                JAD Synq is not liable for any indirect, incidental, or consequential damages arising
                from your use of the Service, including employment decisions made based on data
                displayed on the platform.
              </p>
            </section>

            <section>
              <h2 className="text-base font-bold text-gray-900 mb-2">Changes to Terms</h2>
              <p>
                We may update these terms at any time. Continued use of the Service after changes
                constitutes acceptance of the new terms.
              </p>
            </section>

            <section>
              <h2 className="text-base font-bold text-gray-900 mb-2">Governing Law</h2>
              <p>These terms are governed by the laws of the State of Delaware, United States.</p>
            </section>

            <section>
              <h2 className="text-base font-bold text-gray-900 mb-2">Contact</h2>
              <p>
                Questions about these terms:{' '}
                <a href="mailto:hello@jadsynq.com" className="text-brand hover:underline">
                  hello@jadsynq.com
                </a>
              </p>
            </section>
          </div>

          <div className="mt-8 pt-6 border-t border-gray-100 flex gap-4 text-xs text-gray-400">
            <Link href="/disclaimer" className="hover:text-brand">Data Disclaimer</Link>
            <Link href="/privacy" className="hover:text-brand">Privacy Policy</Link>
            <Link href="/" className="hover:text-brand ml-auto">← Back to home</Link>
          </div>
        </div>
      </div>
    </div>
  )
}
