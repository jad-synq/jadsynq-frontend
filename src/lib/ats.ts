// Shared ATS scoring engine — used by both /ats-check and /resume-builder

// ── Word lists ────────────────────────────────────────────────────────────────

export const STOP_WORDS = new Set([
  'the','a','an','is','are','was','were','be','been','being','have','has','had',
  'do','does','did','will','would','shall','should','may','might','must','can',
  'could','in','on','at','to','for','of','and','or','but','not','with','from',
  'by','as','we','you','our','your','they','their','it','its','this','that',
  'these','those','i','me','my','he','she','him','her','his','hers','them',
  'us','who','what','which','when','where','why','how','all','each','every',
  'both','few','more','most','other','some','such','no','nor','too','very',
  'just','because','if','then','than','so','also','into','over','after','under',
  'about','up','out','through','during','before','above','below','between',
  'while','against','there','here','please','must','new','good','high','strong',
  'well','great','experience','work','working','works','years','year','team',
  'company','role','position','join','based','including','ability','using','use',
  'used','uses','help','within','across','ensure','support','responsible',
  'provide','develop','manage','maintain','implement','build','create','define',
])

export const ACTION_VERBS = new Set([
  'developed','designed','implemented','managed','led','created','built',
  'improved','increased','decreased','achieved','delivered','launched',
  'collaborated','coordinated','established','analyzed','researched',
  'presented','trained','mentored','optimized','automated','integrated',
  'maintained','monitored','resolved','tested','documented','spearheaded',
  'orchestrated','streamlined','deployed','migrated','architected','scaled',
  'reduced','drove','generated','executed','engineered','transformed',
  'accelerated','expanded','negotiated','authored','planned','oversaw',
  'facilitated','partnered','administered','configured','debugged','reviewed',
  'designed','identified','evaluated','assessed','developed','prioritized',
  'enhanced','simplified','standardized','consolidated','refactored',
])

export const TECH_SKILLS = new Set([
  'python','javascript','typescript','java','golang','go','rust','c++','c#',
  'ruby','scala','kotlin','swift','php','r','matlab','perl','haskell',
  'react','vue','angular','nextjs','next.js','svelte','redux','tailwind',
  'node','nodejs','express','fastapi','django','flask','spring','rails','laravel',
  'graphql','rest','grpc','websocket','oauth','jwt','api',
  'sql','postgresql','postgres','mysql','sqlite','oracle','mssql',
  'mongodb','redis','cassandra','dynamodb','elasticsearch','neo4j','supabase',
  'machine learning','deep learning','nlp','computer vision','llm','rag',
  'tensorflow','pytorch','scikit-learn','keras','pandas','numpy','scipy','huggingface',
  'spark','hadoop','kafka','airflow','dbt','flink','databricks','snowflake',
  'microservices','distributed systems','algorithms','data structures',
  'html','css','sass','webpack','vite','jest','cypress','selenium',
  'ios','android','react native','flutter','mobile',
])

export const TOOLS_PLATFORMS = new Set([
  'aws','gcp','azure','google cloud',
  'docker','kubernetes','k8s','helm','terraform','ansible','puppet',
  'jenkins','github actions','gitlab ci','circleci','travis','argocd',
  'git','github','gitlab','bitbucket',
  'jira','confluence','slack','notion','linear','asana',
  'figma','sketch','zeplin',
  'linux','unix','bash','shell','powershell',
  'nginx','apache','haproxy','istio','envoy',
  'prometheus','grafana','datadog','splunk','newrelic','pagerduty','sentry',
  'vercel','netlify','heroku','cloudflare','firebase',
  'postman','swagger','openapi','insomnia',
])

export const SOFT_SKILLS_WORDS = new Set([
  'communication','leadership','teamwork','collaboration','mentoring','coaching',
  'problem-solving','analytical','critical thinking','innovative','creativity',
  'agile','scrum','kanban','cross-functional','stakeholder','initiative',
  'ownership','accountability','detail-oriented','self-motivated','adaptability',
  'strategic','time management','organizational','interpersonal',
])

// ── Extraction helpers ────────────────────────────────────────────────────────

export function extractKeywords(text: string): string[] {
  const words = text
    .toLowerCase()
    .replace(/[^a-z0-9+#.\s-]/g, ' ')
    .split(/\s+/)
    .filter(w => w.length >= 3 && !STOP_WORDS.has(w))

  const tokens = text.toLowerCase().split(/\s+/)
  const bigrams: string[] = []
  for (let i = 0; i < tokens.length - 1; i++) {
    const bi = `${tokens[i]} ${tokens[i + 1]}`
    if (!STOP_WORDS.has(tokens[i]) && !STOP_WORDS.has(tokens[i + 1]) &&
        tokens[i].length >= 3 && tokens[i + 1].length >= 3) {
      bigrams.push(bi)
    }
  }
  return [...new Set([...words, ...bigrams])]
}

export function detectSections(resume: string) {
  const r = resume.toLowerCase()
  return {
    contact:    /(\b[\w.+-]+@[\w-]+\.[a-z]{2,}\b|linkedin\.com\/in\/|\(\d{3}\)|\d{3}[-.\s]\d{3})/.test(r),
    summary:    /\b(summary|objective|profile|about me|professional summary|career summary)\b/.test(r),
    experience: /\b(experience|employment|work history|professional experience|positions held)\b/.test(r),
    education:  /\b(education|degree|bachelor|master|phd|mba|university|college|b\.s\.|m\.s\.|b\.e\.|m\.e\.)\b/.test(r),
    skills:     /\b(skills|technologies|tools|technical skills|competencies|proficiencies|languages)\b/.test(r),
    projects:   /\b(projects?|portfolio|contributions?|github)\b/.test(r),
  }
}

export function countActionVerbs(resume: string): number {
  const words = new Set(resume.toLowerCase().split(/\W+/))
  return [...words].filter(w => ACTION_VERBS.has(w)).length
}

// ── Keyword bucketing ─────────────────────────────────────────────────────────

export interface BucketedKeywords {
  tech: string[]
  tools: string[]
  soft: string[]
  other: string[]
}

export function bucketKeywords(keywords: string[]): BucketedKeywords {
  const tech: string[] = [], tools: string[] = [], soft: string[] = [], other: string[] = []
  for (const k of keywords) {
    const first = k.split(' ')[0]
    if (TECH_SKILLS.has(k) || TECH_SKILLS.has(first)) tech.push(k)
    else if (TOOLS_PLATFORMS.has(k) || TOOLS_PLATFORMS.has(first)) tools.push(k)
    else if (SOFT_SKILLS_WORDS.has(k) || SOFT_SKILLS_WORDS.has(first)) soft.push(k)
    else other.push(k)
  }
  return { tech, tools, soft, other }
}

// ── ATS Score ─────────────────────────────────────────────────────────────────

export interface ATSResult {
  score: number
  keywordScore: number
  sectionScore: number
  lengthScore: number
  verbScore: number
  matched: string[]
  missing: string[]
  matchedBuckets: BucketedKeywords
  missingBuckets: BucketedKeywords
  sections: Record<string, boolean>
  wordCount: number
  verbCount: number
  tips: string[]
}

export function analyze(resume: string, jd: string): ATSResult {
  const jdKeywords = extractKeywords(jd)
  const resumeLower = resume.toLowerCase()

  const matched = jdKeywords.filter(k => resumeLower.includes(k))
  const missing = jdKeywords
    .filter(k => !resumeLower.includes(k))
    .filter(k => k.length > 3 && !k.includes(' ') ? true : k.split(' ').length > 1)
    .slice(0, 40)

  const sections = detectSections(resume)
  const wordCount = resume.split(/\s+/).filter(Boolean).length
  const verbCount = countActionVerbs(resume)

  const keywordScore = jdKeywords.length > 0
    ? Math.round((matched.length / Math.min(jdKeywords.length, 50)) * 40)
    : 0

  const sectionScore = Math.min(
    (sections.contact ? 6 : 0) + (sections.summary ? 6 : 0) + (sections.experience ? 8 : 0) +
    (sections.education ? 6 : 0) + (sections.skills ? 6 : 0) + (sections.projects ? 3 : 0),
    30
  )

  const lengthScore =
    wordCount >= 300 && wordCount <= 800 ? 15 :
    wordCount >= 200 || (wordCount > 800 && wordCount <= 1200) ? 10 :
    wordCount >= 100 ? 5 : 2

  const verbScore = Math.min(verbCount * 2, 15)

  const score = Math.min(keywordScore + sectionScore + lengthScore + verbScore, 100)

  const tips: string[] = []
  if (keywordScore < 20) tips.push('Add more keywords from the job description to your resume.')
  if (!sections.summary) tips.push('Add a Professional Summary section at the top.')
  if (!sections.skills) tips.push('Add a dedicated Skills or Technologies section.')
  if (!sections.contact) tips.push('Include your email, phone, and LinkedIn URL.')
  if (wordCount < 300) tips.push(`Resume is too short (${wordCount} words). Aim for 350–700 words.`)
  if (wordCount > 900) tips.push(`Resume may be too long (${wordCount} words). Trim to 1–2 pages.`)
  if (verbCount < 5) tips.push('Use more action verbs (e.g. developed, optimized, led, delivered).')
  if (missing.length > 10) tips.push(`Add missing keywords: ${missing.slice(0, 5).join(', ')}…`)

  return {
    score, keywordScore, sectionScore, lengthScore, verbScore,
    matched, missing,
    matchedBuckets: bucketKeywords(matched),
    missingBuckets: bucketKeywords(missing),
    sections, wordCount, verbCount, tips,
  }
}

// ── Readability / Format Score ────────────────────────────────────────────────

export interface ReadabilityResult {
  score: number
  sectionOrderScore: number
  bulletQualityScore: number
  dateConsistencyScore: number
  formatScore: number
  issues: string[]
  passes: string[]
}

export function scoreReadability(resume: string): ReadabilityResult {
  const lines = resume.split('\n').map(l => l.trim()).filter(Boolean)
  const lower = resume.toLowerCase()
  const issues: string[] = []
  const passes: string[] = []

  // 1. Section order (30 pts)
  const pos = (re: RegExp) => { const m = lower.search(re); return m === -1 ? Infinity : m }
  const contactPos    = pos(/(\b[\w.+-]+@[\w-]+\.[a-z]{2,}\b|\(\d{3}\)|\d{3}[-.\s]\d{3})/)
  const summaryPos    = pos(/\b(summary|objective|profile)\b/)
  const experiencePos = pos(/\b(experience|employment|work history)\b/)
  const educationPos  = pos(/\b(education|degree|bachelor|master|phd)\b/)
  const skillsPos     = pos(/\b(skills|technologies|tools)\b/)

  let sectionOrderScore = 30
  if (contactPos > 300) { sectionOrderScore -= 8; issues.push('Contact info not found near the top of the resume') }
  else passes.push('Contact info appears at the top')

  if (summaryPos === Infinity) { sectionOrderScore -= 5; issues.push('No Summary or Objective section found') }
  if (experiencePos === Infinity) { sectionOrderScore -= 5; issues.push('No Experience section detected') }
  if (skillsPos === Infinity) { sectionOrderScore -= 5; issues.push('No Skills section detected') }
  else passes.push('All key sections present')

  if (experiencePos !== Infinity && educationPos !== Infinity && educationPos < experiencePos && educationPos < 500) {
    sectionOrderScore -= 7
    issues.push('Education appears before Experience — move Experience higher for tech roles')
  } else if (experiencePos !== Infinity && educationPos !== Infinity) {
    passes.push('Section order looks correct (Experience before Education)')
  }

  // 2. Bullet quality (25 pts)
  const bulletLines = lines.filter(l => /^[•\-–*]\s*\w/.test(l))
  let bulletQualityScore = 25
  if (bulletLines.length === 0) {
    bulletQualityScore = 0
    issues.push('No bullet points found — use bullets in Experience to describe accomplishments')
  } else {
    const actionBullets = bulletLines.filter(b => {
      const first = b.replace(/^[•\-–*\s]+/, '').split(/\s/)[0]?.toLowerCase() ?? ''
      return ACTION_VERBS.has(first) || ACTION_VERBS.has(first + 'd') || ACTION_VERBS.has(first + 'ed')
    })
    const ratio = actionBullets.length / bulletLines.length
    if (ratio < 0.3) {
      bulletQualityScore -= 10
      issues.push(`Only ${Math.round(ratio * 100)}% of bullets start with action verbs (aim for 70%+)`)
    } else {
      passes.push(`${bulletLines.length} bullets — ${Math.round(ratio * 100)}% start with action verbs`)
    }

    const tooLong = bulletLines.filter(b => b.split(/\s+/).length > 35)
    if (tooLong.length > 2) { bulletQualityScore -= 5; issues.push('Some bullet points are too long (>35 words) — be concise') }

    const tooShort = bulletLines.filter(b => b.split(/\s+/).length < 5)
    if (tooShort.length > 3) { bulletQualityScore -= 5; issues.push('Some bullets are too short (<5 words) — add more detail') }
    else passes.push('Bullet point lengths look appropriate')

    const quantified = bulletLines.filter(b => /\d+[%x]?|\$[\d]+|[\d]+[kKmMbB]/.test(b))
    if (quantified.length < 2) {
      bulletQualityScore -= 5
      issues.push('Add quantified achievements (%, $, numbers) — e.g. "reduced latency by 40%"')
    } else {
      passes.push(`${quantified.length} bullets include measurable results`)
    }
  }

  // 3. Date consistency (20 pts)
  let dateConsistencyScore = 20
  const dateRe = /\b(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec|january|february|march|april|june|july|august|september|october|november|december)\b.{0,5}\d{4}|\b\d{4}\s*[-–]\s*(\d{4}|present)\b/i
  const expIdx = lower.search(/\b(experience|employment)\b/)
  const expSection = expIdx >= 0 ? lower.slice(expIdx, expIdx + 2000) : ''
  if (expSection && !dateRe.test(expSection)) {
    dateConsistencyScore -= 15
    issues.push('No dates found in Experience section — always include start and end dates')
  } else if (expSection) {
    passes.push('Dates present in Experience section')
  }

  const hasPresent = /\b(present|current|now)\b/i.test(resume)
  const hasYearRange = /\d{4}\s*[-–]\s*\d{4}/.test(resume)
  if (!hasPresent && !hasYearRange) {
    dateConsistencyScore -= 5
    issues.push('Date format looks inconsistent — use "Month Year – Month Year" or "Month Year – Present"')
  } else {
    passes.push('Date formats look consistent')
  }

  // 4. Format cleanliness (25 pts)
  let formatScore = 25

  const tableChars = (resume.match(/\|/g) ?? []).length
  if (tableChars > 6) {
    formatScore -= 10
    issues.push('Table/column formatting detected — ATS parsers often fail on tables, use plain text')
  } else {
    passes.push('No table formatting detected')
  }

  const allCapsLines = lines.filter(l => l.length > 10 && l === l.toUpperCase() && /[A-Z]{3}/.test(l))
  if (allCapsLines.length > 4) {
    formatScore -= 5
    issues.push('Multiple ALL CAPS lines — only use caps for section headers')
  }

  if (lines.length < 20) {
    formatScore -= 10
    issues.push('Resume is very sparse — add more detail to Experience and Skills')
  } else if (lines.length > 160) {
    formatScore -= 5
    issues.push('Resume may be too long — aim for 1–2 pages')
  } else {
    passes.push('Resume length and density looks appropriate')
  }

  const specialChars = (resume.match(/[★✓✗●◆■▪☑☐→]/g) ?? []).length
  if (specialChars > 8) {
    formatScore -= 5
    issues.push('Special symbols may not render correctly in ATS parsers')
  } else {
    passes.push('No problematic special characters')
  }

  const emailPresent = /[\w.+\-]+@[\w-]+\.[a-z]{2,}/i.test(resume)
  const phonePresent = /\(?\d{3}\)?[\s.\-]\d{3}[\s.\-]\d{4}/.test(resume)
  if (!emailPresent || !phonePresent) {
    formatScore -= 5
    issues.push('Missing email or phone number in contact section')
  } else {
    passes.push('Email and phone number present')
  }

  const score = Math.max(0, Math.min(100,
    Math.max(0, sectionOrderScore) + Math.max(0, bulletQualityScore) +
    Math.max(0, dateConsistencyScore) + Math.max(0, formatScore)
  ))

  return {
    score,
    sectionOrderScore: Math.max(0, sectionOrderScore),
    bulletQualityScore: Math.max(0, bulletQualityScore),
    dateConsistencyScore: Math.max(0, dateConsistencyScore),
    formatScore: Math.max(0, formatScore),
    issues,
    passes,
  }
}

// ── Cover letter generator ────────────────────────────────────────────────────

export function generateCoverLetter(resumeText: string, jd: string): string {
  const lines = resumeText.split('\n').map(l => l.trim()).filter(Boolean)

  // Name: first line that looks like a name
  const contactChars = /[@\d()\-+.·|•\/\\]|linkedin|github|http/i
  let name = 'I'
  for (const line of lines.slice(0, 8)) {
    const words = line.split(/\s+/)
    if (!contactChars.test(line) && words.length >= 2 && words.length <= 5 &&
        words.every(w => /^[A-Za-z.\-']+$/.test(w))) {
      name = line; break
    }
  }

  // Company from JD
  const companyPatterns = [
    /(?:at|join(?:ing)?|about)\s+([A-Z][a-zA-Z0-9\s&.,]+?)(?:\s*[,.\n]|\s+is\s|\s+are\s|\s+we\s)/m,
    /([A-Z][a-zA-Z0-9]+(?:\s+[A-Z][a-zA-Z0-9]+)*)\s+is\s+(?:a|an|the)\s+(?:leading|fast|growing)/m,
    /^([A-Z][a-zA-Z0-9\s&]+?)\n/m,
  ]
  let company = 'your company'
  for (const re of companyPatterns) {
    const m = jd.match(re)
    if (m?.[1] && m[1].trim().length > 1 && m[1].trim().length < 50) {
      company = m[1].trim(); break
    }
  }

  // Role from JD
  const roleMatch = jd.match(/\b(senior|junior|lead|staff|principal|sr\.?|jr\.?)?\s*(software|frontend|backend|full.?stack|data|ml|machine learning|devops|platform|site reliability|mobile|ios|android|cloud|security|qa|test)?\s*(engineer|developer|scientist|analyst|architect|manager|designer|consultant|specialist)\b/im)
  const role = roleMatch?.[0]?.trim() ?? 'the open position'

  // Most recent title + company from resume
  const expIdx = resumeText.toLowerCase().search(/\b(experience|employment)\b/)
  const expSection = expIdx >= 0 ? resumeText.slice(expIdx, expIdx + 1500) : resumeText
  const expLines = expSection.split('\n').map(l => l.trim()).filter(l => l && !contactChars.test(l) && !/^(experience|employment)/i.test(l))
  const recentTitle = expLines[0] ?? ''
  const recentOrg = expLines[1] ?? ''

  // Top JD keywords for body paragraph
  const jdKw = extractKeywords(jd)
    .filter(k => !k.includes(' ') && (TECH_SKILLS.has(k) || TOOLS_PLATFORMS.has(k)))
    .slice(0, 5)
  const techList = jdKw.length > 0 ? jdKw.join(', ') : 'relevant technologies'

  // Achievement bullets from resume
  const achievementBullets = resumeText
    .match(/[•\-–]\s*(.{25,120})/g)
    ?.slice(0, 3)
    .map(b => b.replace(/^[•\-–]\s*/, '').trim()) ?? []

  const bodyParagraph = recentTitle
    ? `In my current role as ${recentTitle}${recentOrg ? ` at ${recentOrg}` : ''}, I have built expertise in ${techList}. ${achievementBullets[0] ? achievementBullets[0] + '.' : ''} ${achievementBullets[1] ? achievementBullets[1] + '.' : ''}`
    : `I have developed strong expertise in ${techList} through hands-on project work and professional experience. ${achievementBullets[0] ? achievementBullets[0] + '.' : ''}`

  return `Dear Hiring Manager,

I am writing to express my strong interest in the ${role} position at ${company}. With my background in ${techList}, I am excited about the opportunity to contribute to your team and help drive meaningful impact.

${bodyParagraph.trim()}

Your job description resonates closely with my experience — particularly the emphasis on ${jdKw.slice(0, 3).join(', ') || 'delivering high-quality solutions'}. I thrive in collaborative environments and take pride in writing clean, well-tested code that solves real problems.

I would welcome the opportunity to discuss how my background aligns with the needs of ${company}. Thank you for considering my application — I look forward to the possibility of speaking with you.

Warm regards,
${name}`
}
