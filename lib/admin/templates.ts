import { getServiceClient } from '@/lib/supabase/admin'

/** Stored email templates (transactional + marketing). Service-role, behind requireAdmin(). */

export interface EmailTemplate {
  id: string; key: string; name: string; kind: 'transactional' | 'marketing'
  subject: string; body_html: string; updated_at: string
}

export async function listTemplates(): Promise<EmailTemplate[]> {
  const svc = getServiceClient()
  const { data } = await svc.from('email_templates').select('id, key, name, kind, subject, body_html, updated_at').order('name')
  return (data ?? []) as EmailTemplate[]
}
