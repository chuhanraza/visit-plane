import { getServiceClient } from '@/lib/supabase/admin'

/**
 * Content manager data layer over `seo_page_content`. Quality flags are DETECTED
 * by the generation pipeline (quality_* columns) — never hardcoded here.
 * Service-role, behind requireAdmin().
 */

export interface ContentRow {
  id: string
  url_slug: string
  template: string
  title: string | null
  meta_description: string | null
  h1: string | null
  word_count: number | null
  reading_ease: number | null
  published: boolean
  published_at: string | null
  generation_status: string
  quality_passed: boolean
  quality_min_words_ok: boolean | null
  quality_links_ok: boolean | null
  quality_sources_count: number | null
  quality_uniqueness: number | null
  quality_notes: string | null
  gsc_clicks: number | null
  gsc_impressions: number | null
  updated_at: string
}

const COLS =
  'id, url_slug, template, title, meta_description, h1, word_count, reading_ease, published, published_at, generation_status, quality_passed, quality_min_words_ok, quality_links_ok, quality_sources_count, quality_uniqueness, quality_notes, gsc_clicks, gsc_impressions, updated_at'

export type ContentFilter = '' | 'published' | 'draft' | 'flagged'

export async function listContent(params: { q?: string; filter?: ContentFilter; page?: number; pageSize?: number }) {
  const svc = getServiceClient()
  const page = Math.max(1, params.page ?? 1)
  const pageSize = Math.min(100, params.pageSize ?? 25)
  const from = (page - 1) * pageSize
  let query = svc.from('seo_page_content').select(COLS, { count: 'exact' })
  if (params.q) {
    const q = params.q.replace(/[%,]/g, '')
    query = query.or(`url_slug.ilike.%${q}%,title.ilike.%${q}%`)
  }
  if (params.filter === 'published') query = query.eq('published', true)
  else if (params.filter === 'draft') query = query.eq('published', false)
  else if (params.filter === 'flagged') query = query.eq('quality_passed', false)
  query = query.order('updated_at', { ascending: false }).range(from, from + pageSize - 1)
  const { data, count } = await query
  return { rows: (data ?? []) as ContentRow[], total: count ?? 0, page, pageSize }
}

export async function contentStats() {
  const svc = getServiceClient()
  const [{ count: total }, { count: published }, { count: flagged }, { data: gsc }] = await Promise.all([
    svc.from('seo_page_content').select('id', { count: 'exact', head: true }),
    svc.from('seo_page_content').select('id', { count: 'exact', head: true }).eq('published', true),
    svc.from('seo_page_content').select('id', { count: 'exact', head: true }).eq('quality_passed', false),
    svc.from('seo_page_content').select('gsc_clicks').limit(10000),
  ])
  const clicks = (gsc ?? []).reduce((s, r) => s + Number((r as { gsc_clicks: number | null }).gsc_clicks || 0), 0)
  return { total: total ?? 0, published: published ?? 0, flagged: flagged ?? 0, gscClicks: clicks }
}
