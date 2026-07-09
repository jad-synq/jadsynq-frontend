import axios from 'axios'
import { cacheGet, cacheSet } from './cache'

const API_URL = process.env.NEXT_PUBLIC_API_URL ||
  (process.env.NODE_ENV === 'production'
    ? 'https://jadsynq-backend.onrender.com'
    : 'http://localhost:8000')

export const api = axios.create({
  baseURL: API_URL,
  timeout: 45000,
})

// Attach Supabase JWT to every request if user is logged in
api.interceptors.request.use(async (config) => {
  const { supabase } = await import('./supabase')
  const { data: { session } } = await supabase.auth.getSession()
  if (session?.access_token) {
    config.headers.Authorization = `Bearer ${session.access_token}`
  }
  return config
})

export interface SearchResult {
  id: string
  legal_name: string
  dba_name: string | null
  everify_status: string
  h1b_petitions_last_year: number
  approval_rate: number | null
  avg_wage: number | null
  match_confidence: number
  logo_url: string | null
  domain: string | null
  careers_url: string | null
}

export interface CompanyProfile {
  id: string
  legal_name: string
  dba_name: string | null
  ein: string | null
  website: string | null
  logo_url: string | null
  careers_url: string | null
  domain: string | null
  industry: string | null
  aliases: string[]
  everify: {
    status: string
    enrollment_date: string | null
    termination_date: string | null
    is_federal_contractor: boolean
    workforce_size: string | null
    hiring_site_count: number | null
    hiring_states: string[]
  } | null
  h1b_summary: {
    total_petitions_last_year: number
    approval_rate: number
    avg_wage: number
    top_job_titles: string[]
  } | null
  opt_support: null
  open_jobs_count: number
  // Enrichment fields
  is_public: boolean | null
  employee_count: number | null
  sic_code: string | null
  sic_description: string | null
  founded_year: number | null
  funding_stage: string | null
  total_funding_usd: number | null
  incorporation_state: string | null
}

export interface H1BYearSummary {
  fiscal_year: number
  petitions: number
  certified: number
  denied: number
  withdrawn: number
  avg_wage: number
}

export const searchCompanies = (q: string, params?: {
  state?: string
  everify_only?: boolean
  h1b_only?: boolean
  limit?: number
}) => api.get<SearchResult[]>('/api/search', { params: { q, ...params } })

export const getCompany = (id: string) =>
  api.get<CompanyProfile>(`/api/companies/${id}`)

export const getCompanyH1B = (id: string) =>
  api.get<H1BYearSummary[]>(`/api/companies/${id}/h1b`)

export interface SavedCompany {
  company_id: string
  legal_name: string
  alert_jobs: boolean
  saved_at: string
}

export const getSavedCompanies = () =>
  api.get<SavedCompany[]>('/api/users/me/saved-companies')

export const saveCompany = (companyId: string, alertJobs = false) =>
  api.put(`/api/users/me/saved-companies/${companyId}`, { alert_jobs: alertJobs })

export const unsaveCompany = (companyId: string) =>
  api.delete(`/api/users/me/saved-companies/${companyId}`)

export interface CompanyListItem {
  id: string
  legal_name: string
  dba_name: string | null
  everify_status: string
  h1b_petitions_last_year: number
  approval_rate: number | null
  avg_wage: number | null
  logo_url: string | null
  domain: string | null
  match_confidence: number
  petition_trend: number[]
}

export interface CompaniesListResponse {
  companies: CompanyListItem[]
  total: number
  page: number
  per_page: number
}

export const getCompanies = (params: {
  q?: string
  page?: number
  per_page?: number
  everify_only?: boolean
  h1b_only?: boolean
  sort?: 'petitions' | 'approval_rate' | 'avg_wage' | 'name'
}) => api.get<CompaniesListResponse>('/api/companies', { params })

export type VisaType = 'OPT' | 'STEM_OPT' | 'H1B' | 'GC' | 'CITIZEN' | 'OTHER'
export type AppStatus = 'applied' | 'phone_screen' | 'onsite' | 'offer' | 'rejected' | 'withdrawn'

export interface UserProfile {
  id: string
  email: string | null
  visa_type: VisaType | null
}

export const getMe = () => api.get<UserProfile>('/api/users/me')

export const updateMe = (visa_type: VisaType) =>
  api.patch<UserProfile>('/api/users/me', { visa_type })

export interface JobApplication {
  id: string
  company_id: string | null
  company_name: string
  job_title: string | null
  job_url: string | null
  status: AppStatus
  applied_date: string | null
  notes: string | null
  updated_at: string
}

export const getApplications = (status?: AppStatus) =>
  api.get<JobApplication[]>('/api/users/me/applications', { params: status ? { status } : {} })

export const createApplication = (data: {
  company_name: string
  company_id?: string
  job_title?: string
  job_url?: string
  status?: AppStatus
  applied_date?: string
  notes?: string
}) => api.post<JobApplication>('/api/users/me/applications', data)

export const updateApplication = (id: string, data: {
  status?: AppStatus
  job_title?: string
  job_url?: string
  applied_date?: string
  notes?: string
}) => api.patch<JobApplication>(`/api/users/me/applications/${id}`, data)

export const deleteApplication = (id: string) =>
  api.delete(`/api/users/me/applications/${id}`)

export const submitOPTReport = (companyId: string, data: { supports_opt: boolean; supports_stem_opt: boolean }) =>
  api.post(`/api/companies/${companyId}/opt-report`, data)

// ── Jobs ─────────────────────────────────────────────────────────────────────

export interface JobRoleResult {
  company_id: string
  legal_name: string
  logo_url: string | null
  careers_url: string | null
  domain: string | null
  everify_status: string
  job_title: string
  petitions: number
  approved: number
  denied: number
  approval_rate: number | null
  avg_wage: number | null
}

export interface JobTitleSuggestion {
  title: string
  company_count: number
  total_petitions: number
}

export interface JobListingResult {
  id: string
  company_id: string
  legal_name: string
  logo_url: string | null
  domain: string | null
  ats_source: string
  title: string
  department: string | null
  location: string | null
  employment_type: string | null
  url: string
  posted_at: string | null
  scraped_at: string
  avg_wage: number | null
}

export interface JobListingsResponse {
  listings: JobListingResult[]
  total: number
  limit: number
  offset: number
}

export interface JobSearchResponse {
  jobs: JobRoleResult[]
  total: number
  limit: number
  offset: number
}

export const searchJobs = (params: {
  title: string
  everify_only?: boolean
  min_petitions?: number
  limit?: number
  offset?: number
}) => api.get<JobSearchResponse>('/api/jobs/search', { params })

const TTL_30S  = 30_000
const TTL_5MIN = 5 * 60_000
const TTL_1HR  = 60 * 60_000

// Cached: popular titles change rarely; cache 5 min per query string
export async function getJobTitleSuggestions(q: string): Promise<{ data: JobTitleSuggestion[] }> {
  const key = `/api/jobs/titles?q=${q}`
  const cached = cacheGet<JobTitleSuggestion[]>(key)
  if (cached) return { data: cached }
  const res = await api.get<JobTitleSuggestion[]>('/api/jobs/titles', { params: { q, limit: 8 } })
  cacheSet(key, res.data, q ? TTL_5MIN : TTL_1HR)
  return res
}

// Cached: company job roles are stable within a session
export async function getCompanyJobRoles(companyId: string): Promise<{ data: JobRoleResult[] }> {
  const key = `/api/jobs/company/${companyId}`
  const cached = cacheGet<JobRoleResult[]>(key)
  if (cached) return { data: cached }
  const res = await api.get<JobRoleResult[]>(key)
  cacheSet(key, res.data, TTL_1HR)
  return res
}

export const getJobListings = (params: {
  company_id?: string
  title?: string
  location?: string
  ats_source?: string
  limit?: number
  offset?: number
}) => api.get<JobListingsResponse>('/api/jobs/listings', { params })

// Cached: company profile is stable within a session
export async function getCompanyCached(id: string): Promise<{ data: CompanyProfile }> {
  const key = `/api/companies/${id}`
  const cached = cacheGet<CompanyProfile>(key)
  if (cached) return { data: cached }
  const res = await api.get<CompanyProfile>(key)
  cacheSet(key, res.data, TTL_1HR)
  return res
}

// Cached: companies list with params, 30s TTL (user may filter)
export async function getCompaniesCached(params: Parameters<typeof getCompanies>[0]): Promise<{ data: CompaniesListResponse }> {
  const key = `/api/companies?${new URLSearchParams(Object.entries(params).filter(([,v]) => v !== undefined).map(([k,v]) => [k, String(v)])).toString()}`
  const cached = cacheGet<CompaniesListResponse>(key)
  if (cached) return { data: cached }
  const res = await getCompanies(params)
  cacheSet(key, res.data, TTL_30S)
  return res
}

// ── Resume ────────────────────────────────────────────────────────────────────

export interface UserResume {
  resume_text: string
  resume_data: object | null
  updated_at: string
}

export interface JobMatchResult {
  id: string
  company_id: string
  legal_name: string
  logo_url: string | null
  domain: string | null
  ats_source: string
  title: string
  department: string | null
  location: string | null
  employment_type: string | null
  url: string
  description_snippet: string | null
  posted_at: string | null
}

export interface JobMatchesResponse {
  jobs: JobMatchResult[]
  total: number
  resume_word_count: number
}

export const getResume = () => api.get<UserResume>('/api/resume')

export const saveResume = (data: { resume_text: string; resume_data?: object | null }) =>
  api.put<UserResume>('/api/resume', data)

export const getJobMatches = (params?: { limit?: number }) =>
  api.get<JobMatchesResponse>('/api/resume/matches', { params })
