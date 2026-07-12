import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Data Disclaimer — JAD Synq',
  description: 'Important information about the H-1B and E-Verify data provided by JAD Synq.',
}

export default function DisclaimerPage() {
  return (
    <div className="min-h-screen bg-paper">
      <div className="max-w-3xl mx-auto px-6 py-12">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
          <h1 className="text-2xl font-black text-gray-900 mb-2">Data Disclaimer</h1>
          <p className="text-sm text-gray-400 mb-8">Last updated: July 2026</p>

          <div className="prose prose-sm max-w-none text-gray-600 space-y-6">
            <section>
              <h2 className="text-base font-bold text-gray-900 mb-2">Source of Data</h2>
              <p>
                JAD Synq aggregates publicly available data from U.S. government sources including the
                Department of Labor (DOL) H-1B LCA disclosure data, the U.S. Citizenship and Immigration
                Services (USCIS) E-Verify employer database, and the Securities and Exchange Commission
                (SEC) EDGAR filing database. All underlying data is published by the respective agencies
                under open-data policies.
              </p>
            </section>

            <section>
              <h2 className="text-base font-bold text-gray-900 mb-2">Accuracy and Completeness</h2>
              <p>
                While we make every effort to present data accurately, JAD Synq does not guarantee the
                completeness, accuracy, or timeliness of any information displayed. H-1B approval rates,
                petition counts, and E-Verify enrollment status reflect historical data as reported in
                government filings and may not reflect a company&apos;s current sponsorship practices or
                policies.
              </p>
            </section>

            <section>
              <h2 className="text-base font-bold text-gray-900 mb-2">Not Legal or Immigration Advice</h2>
              <p>
                Nothing on JAD Synq constitutes legal advice, immigration advice, or a guarantee of
                employment sponsorship. A company&apos;s past H-1B filing history does not obligate them
                to sponsor future employees. Always consult a qualified immigration attorney for advice
                specific to your situation.
              </p>
            </section>

            <section>
              <h2 className="text-base font-bold text-gray-900 mb-2">Company Matching</h2>
              <p>
                Company names across datasets are matched using automated fuzzy-matching algorithms.
                Mismatches may occur, particularly for companies with common names or that have undergone
                mergers and acquisitions. If you believe a company&apos;s data is incorrectly attributed,
                please contact us.
              </p>
            </section>

            <section>
              <h2 className="text-base font-bold text-gray-900 mb-2">No Warranty</h2>
              <p>
                JAD Synq is provided &ldquo;as is&rdquo; without warranty of any kind. We are not liable
                for any decisions made based on data displayed on this platform.
              </p>
            </section>

            <section>
              <h2 className="text-base font-bold text-gray-900 mb-2">Contact</h2>
              <p>
                For data corrections or questions, email{' '}
                <a href="mailto:hello@jadsynq.com" className="text-brand hover:underline">
                  hello@jadsynq.com
                </a>.
              </p>
            </section>
          </div>

          <div className="mt-8 pt-6 border-t border-gray-100 flex gap-4 text-xs text-gray-400">
            <Link href="/privacy" className="hover:text-brand">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-brand">Terms of Service</Link>
            <Link href="/" className="hover:text-brand ml-auto">← Back to home</Link>
          </div>
        </div>
      </div>
    </div>
  )
}
