import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  const base = 'https://jadsynq.com'
  const now = new Date()

  return [
    { url: base,                     lastModified: now, changeFrequency: 'daily',   priority: 1.0 },
    { url: `${base}/jobs`,           lastModified: now, changeFrequency: 'daily',   priority: 0.9 },
    { url: `${base}/companies-list`, lastModified: now, changeFrequency: 'weekly',  priority: 0.8 },
    { url: `${base}/ats-check`,      lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${base}/resume-builder`, lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${base}/profile`,        lastModified: now, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${base}/disclaimer`,     lastModified: now, changeFrequency: 'yearly',  priority: 0.3 },
    { url: `${base}/privacy`,        lastModified: now, changeFrequency: 'yearly',  priority: 0.3 },
    { url: `${base}/terms`,          lastModified: now, changeFrequency: 'yearly',  priority: 0.3 },
  ]
}
