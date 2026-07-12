// Curated interview-prep content -- static reference data, no backend/LLM needed.
// Role categories mirror POPULAR_ROLES in src/app/jobs/page.tsx so deep-links from
// job cards land on a matching category.

export interface RoleCategory {
  id: string
  label: string
  /** Lowercase substrings checked against a job title to find the closest category. */
  aliases: string[]
  technicalQuestions: string[]
  behavioralQuestions: string[]
}

export const GENERAL_BEHAVIORAL_QUESTIONS: string[] = [
  'Tell me about yourself.',
  'Why do you want to work here?',
  'Tell me about a time you disagreed with a teammate or manager. How did you handle it?',
  'Describe a time you made a mistake at work. What did you do about it?',
  'Tell me about a time you had to meet a tight deadline.',
  'What are you looking for in your next role?',
  'Where do you see yourself in five years?',
  'Do you have any questions for us?',
]

export const STAR_TIPS: string[] = [
  'Structure behavioral answers as Situation → Task → Action → Result -- most of your answer should be the Action and Result, not scene-setting.',
  'Use real numbers wherever possible ("reduced page load time by 40%", "supported a team of 6") -- specifics are far more convincing than adjectives.',
  'Pick stories in advance for common themes (conflict, failure, leadership, ambiguity) so you are not improvising under pressure.',
  'It is fine for the Result to be an honest lesson learned, not just a win -- interviewers are often testing for self-awareness, not a perfect track record.',
]

export const VISA_INTERVIEW_TIPS: string[] = [
  'If asked about work authorization, answer factually and confidently -- e.g. "I am authorized to work under OPT/STEM OPT and will need H-1B sponsorship in the future" -- do not over-explain or apologize for it.',
  'Research the company\'s H-1B sponsorship history before the interview (this is exactly what JADsynq\'s company data is for) so you know whether the topic is likely to come up at all.',
  'It is illegal in the US for an interviewer to ask about your national origin or immigration status directly -- questions should be limited to whether you are authorized to work and whether you will need sponsorship now or in the future.',
  'If a recruiter says a role does not sponsor, it rarely helps to negotiate that point in the interview -- better to confirm sponsorship policy before investing interview time, using saved-company alerts and E-Verify/H-1B history on the company profile.',
  'Have your visa timeline (OPT end date, STEM OPT eligibility, remaining cap-subject H-1B attempts) ready to state plainly if asked -- vague answers here read as disorganized, not more likable.',
]

export const ROLE_CATEGORIES: RoleCategory[] = [
  {
    id: 'software-engineer',
    label: 'Software Engineer',
    aliases: ['software engineer', 'swe', 'backend engineer', 'frontend engineer', 'full stack', 'fullstack', 'developer'],
    technicalQuestions: [
      'Walk me through how you would design a URL shortener (or similar system-design prompt appropriate to the seniority level).',
      'What happens when you type a URL into a browser and hit enter?',
      'How would you find and fix a memory leak / performance regression in a production service?',
      'Explain the tradeoffs between SQL and NoSQL for a given data access pattern.',
      'Walk through a recent pull request you are proud of -- what made it good?',
      'How do you approach code review, both giving and receiving feedback?',
    ],
    behavioralQuestions: [
      'Tell me about a time you had to push back on a product requirement for technical reasons.',
      'Describe a production incident you were involved in. What was your role and what did you learn?',
      'Tell me about a time you had to learn an unfamiliar codebase or technology quickly.',
    ],
  },
  {
    id: 'data-engineer',
    label: 'Data Engineer',
    aliases: ['data engineer', 'etl', 'data platform', 'analytics engineer'],
    technicalQuestions: [
      'How would you design a pipeline to ingest and transform data from multiple sources on a daily schedule?',
      'How do you handle schema changes in upstream data without breaking downstream consumers?',
      'Explain the tradeoffs between batch and streaming processing for a given use case.',
      'How would you debug a pipeline that is silently dropping rows?',
      'What is your approach to data quality testing and monitoring?',
    ],
    behavioralQuestions: [
      'Tell me about a time a pipeline failure caused a downstream problem -- how did you find and fix it?',
      'Describe a time you had to convince a stakeholder that a "quick" data request was more complex than it looked.',
    ],
  },
  {
    id: 'data-scientist',
    label: 'Data Scientist',
    aliases: ['data scientist', 'applied scientist'],
    technicalQuestions: [
      'Walk through how you would design an A/B test for a specific product change.',
      'How do you decide which model to use for a given prediction problem, and how do you validate it?',
      'How would you explain a model\'s prediction to a non-technical stakeholder?',
      'How do you detect and handle data leakage or bias in a dataset?',
      'Explain precision/recall tradeoffs and when you would optimize for one over the other.',
    ],
    behavioralQuestions: [
      'Tell me about a time an analysis you did directly changed a business decision.',
      'Describe a time your model or analysis was wrong in production -- what happened and what did you learn?',
    ],
  },
  {
    id: 'ml-engineer',
    label: 'Machine Learning Engineer',
    aliases: ['machine learning', 'ml engineer', 'mle', 'ai engineer'],
    technicalQuestions: [
      'How would you take a model from a notebook to a production serving pipeline?',
      'How do you monitor a deployed model for drift or degraded performance?',
      'Explain the tradeoffs between a larger, more accurate model and a smaller, faster one for this use case.',
      'How would you design a feature store or feature pipeline for reuse across models?',
      'Walk through how you would evaluate an LLM-based feature for correctness and cost.',
    ],
    behavioralQuestions: [
      'Tell me about a time a model performed well offline but poorly in production. What did you do?',
      'Describe how you have collaborated with product/eng teams who are not ML specialists.',
    ],
  },
  {
    id: 'product-manager',
    label: 'Product Manager',
    aliases: ['product manager', 'pm', 'product owner'],
    technicalQuestions: [
      'Walk me through how you would prioritize a backlog with limited engineering capacity.',
      'How do you decide whether a feature is ready to ship?',
      'Design a product improvement for [a product you use daily] -- how would you scope and measure it?',
      'How do you work with engineering when a timeline slips?',
      'How do you use data vs. qualitative feedback when making a product decision?',
    ],
    behavioralQuestions: [
      'Tell me about a time you had to say no to a feature request from a senior stakeholder.',
      'Describe a product launch that did not go as planned. What did you learn?',
      'Tell me about a time you had to align engineering, design, and business stakeholders who disagreed.',
    ],
  },
  {
    id: 'business-analyst',
    label: 'Business Analyst',
    aliases: ['business analyst', 'ba '],
    technicalQuestions: [
      'Walk through how you would gather requirements for a new internal tool.',
      'How do you validate that a proposed solution actually solves the underlying business problem?',
      'Describe how you would build a dashboard to track a KPI for the first time.',
      'How do you handle conflicting requirements from two stakeholders?',
    ],
    behavioralQuestions: [
      'Tell me about a time your analysis changed a decision that was already headed the other way.',
      'Describe a time you had to explain a technical or data concept to a non-technical audience.',
    ],
  },
  {
    id: 'financial-analyst',
    label: 'Financial Analyst',
    aliases: ['financial analyst', 'finance analyst', 'fp&a'],
    technicalQuestions: [
      'Walk me through building a 3-statement financial model.',
      'How would you evaluate whether a proposed investment or project is worth pursuing?',
      'Explain the difference between EBITDA and free cash flow, and when each matters more.',
      'How do you approach a variance analysis when actuals differ significantly from budget?',
    ],
    behavioralQuestions: [
      'Tell me about a time you found an error in a model or report before it went to leadership.',
      'Describe a time you had to deliver a forecast you were not confident in -- how did you communicate the uncertainty?',
    ],
  },
  {
    id: 'accountant',
    label: 'Accountant',
    aliases: ['accountant', 'accounting'],
    technicalQuestions: [
      'Walk through the month-end close process at your current or most recent job.',
      'How do you ensure accuracy when reconciling accounts?',
      'Explain how you would handle a discrepancy found during an audit.',
      'What controls do you use to prevent errors in financial reporting?',
    ],
    behavioralQuestions: [
      'Tell me about a time you identified an accounting error others had missed.',
      'Describe how you have handled a tight close deadline with incomplete information.',
    ],
  },
  {
    id: 'mechanical-engineer',
    label: 'Mechanical Engineer',
    aliases: ['mechanical engineer'],
    technicalQuestions: [
      'Walk through your design process for a component from requirements to manufacturing.',
      'How do you approach tolerance stack-up analysis?',
      'Describe a failure analysis you have performed -- what was the root cause and fix?',
      'How do you balance design-for-manufacturability against performance requirements?',
    ],
    behavioralQuestions: [
      'Tell me about a design that failed testing. What did you change?',
      'Describe working with a cross-functional team (manufacturing, electrical, supply chain) to ship a product.',
    ],
  },
  {
    id: 'electrical-engineer',
    label: 'Electrical Engineer',
    aliases: ['electrical engineer'],
    technicalQuestions: [
      'Walk through how you would debug a circuit that is not behaving as simulated.',
      'How do you approach power budget and thermal considerations in a design?',
      'Describe your experience with PCB layout tradeoffs (signal integrity, EMI, cost).',
      'How do you validate a design meets its required certifications/standards?',
    ],
    behavioralQuestions: [
      'Tell me about a hardware bug that only showed up after production. How did you find it?',
      'Describe collaborating with firmware/software engineers on a hardware-software boundary issue.',
    ],
  },
  {
    id: 'civil-engineer',
    label: 'Civil Engineer',
    aliases: ['civil engineer'],
    technicalQuestions: [
      'Walk through your process for a site design from initial survey to permitting.',
      'How do you approach load calculations and safety factors in a structural design?',
      'Describe how you coordinate with contractors during construction to resolve field issues.',
      'How do you keep a project on budget when unexpected site conditions appear?',
    ],
    behavioralQuestions: [
      'Tell me about a project where regulatory or permitting delays affected the timeline. How did you manage it?',
      'Describe a time you had to push back on a design change requested late in a project.',
    ],
  },
  {
    id: 'nurse',
    label: 'Nurse',
    aliases: ['nurse', 'rn ', 'registered nurse'],
    technicalQuestions: [
      'Walk me through how you prioritize care for multiple patients with competing needs.',
      'Describe your approach to medication administration and double-checking for errors.',
      'How do you handle a rapidly deteriorating patient before a physician arrives?',
      'What is your process for handoff communication at shift change?',
    ],
    behavioralQuestions: [
      'Tell me about a time you advocated for a patient when a family member or physician disagreed with you.',
      'Describe a high-stress shift and how you kept yourself and your patients safe.',
      'Tell me about a time you had to deliver difficult news to a patient or family.',
    ],
  },
]

const GENERAL_CATEGORY: RoleCategory = {
  id: 'general',
  label: 'General',
  aliases: [],
  technicalQuestions: [
    'Walk me through a project on your resume that best represents your skills for this role.',
    'What tools or methods do you rely on most in your day-to-day work?',
    'How do you approach learning a new skill or domain quickly when a role requires it?',
  ],
  behavioralQuestions: GENERAL_BEHAVIORAL_QUESTIONS,
}

export const ALL_CATEGORIES: RoleCategory[] = [...ROLE_CATEGORIES, GENERAL_CATEGORY]

/** Fuzzy-matches a free-text job title to the closest role category, falling back to General. */
export function findRoleCategory(jobTitle: string): RoleCategory {
  const lower = jobTitle.toLowerCase()
  for (const category of ROLE_CATEGORIES) {
    if (category.aliases.some(alias => lower.includes(alias))) return category
  }
  return GENERAL_CATEGORY
}
