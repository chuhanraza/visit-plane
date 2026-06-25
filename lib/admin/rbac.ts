/**
 * Role-based access control. Roles map to per-module capability levels.
 * The legacy admin_secret login and any 'owner' always get full access.
 * Per-admin `permissions` jsonb can override individual modules.
 */

export const ROLES = ['owner', 'admin', 'analyst', 'support', 'viewer'] as const
export type Role = (typeof ROLES)[number]

export const MODULES = [
  'dashboard', 'analytics', 'leads', 'revenue', 'orders', 'affiliates',
  'content', 'email', 'marketing', 'developers', 'audit', 'ops', 'settings', 'admins',
] as const
export type Module = (typeof MODULES)[number]

export type Level = 'none' | 'view' | 'edit'
const RANK: Record<Level, number> = { none: 0, view: 1, edit: 2 }

const V: Level = 'view', E: Level = 'edit', N: Level = 'none'

// Per-role default capability per module.
export const ROLE_PERMISSIONS: Record<Role, Partial<Record<Module, Level>>> = {
  owner: Object.fromEntries(MODULES.map(m => [m, E])) as Record<Module, Level>,
  admin: {
    dashboard: E, analytics: E, leads: E, revenue: E, orders: E, affiliates: E,
    content: E, email: E, marketing: E, developers: E, audit: V, ops: E, settings: E, admins: V,
  },
  analyst: {
    dashboard: V, analytics: E, leads: E, revenue: E, orders: V, affiliates: E,
    content: E, email: E, marketing: E, developers: N, audit: V, ops: V, settings: N, admins: N,
  },
  support: {
    dashboard: V, analytics: V, leads: E, revenue: V, orders: E, affiliates: V,
    content: N, email: N, marketing: N, developers: N, audit: N, ops: V, settings: N, admins: N,
  },
  viewer: {
    dashboard: V, analytics: V, leads: V, revenue: V, orders: V, affiliates: V,
    content: V, email: V, marketing: V, developers: N, audit: V, ops: V, settings: N, admins: N,
  },
}

export interface AdminContext {
  isAdmin: boolean
  actor: string
  role: Role
  permissions: Partial<Record<Module, Level>>
}

export function levelFor(ctx: Pick<AdminContext, 'role' | 'permissions'>, module: Module): Level {
  if (ctx.role === 'owner') return 'edit'
  return ctx.permissions?.[module] ?? ROLE_PERMISSIONS[ctx.role]?.[module] ?? 'none'
}

export function can(ctx: Pick<AdminContext, 'role' | 'permissions'>, module: Module, level: Level = 'view'): boolean {
  return RANK[levelFor(ctx, module)] >= RANK[level]
}
