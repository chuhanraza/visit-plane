/**
 * Crawler policy, in two tiers.
 *
 * 1. BLOCKED — SEO-audit scrapers (used by competitors against us, not for our own
 *    indexing) and AI *training* crawlers. They send no traffic back but burn Worker
 *    CPU, bandwidth and ISR writes by crawling every page. Blocked everywhere.
 *
 * 2. AI SEARCH — crawlers that build the index behind AI answers (ChatGPT search,
 *    Perplexity, Claude search, DuckDuckGo's AI answers). They do send readers back
 *    through citations, so they are allowed, but ONLY on the content that is cheap to
 *    serve and worth citing. The site has ~39,000 programmatic visa-pair URLs rendered
 *    on demand; an index crawler walking those is exactly how the Cloudflare bill ran
 *    past $5, so everything outside the allowed prefixes stays blocked for them.
 *
 * Deliberately excluded from both: Googlebot, Bingbot (real search indexing — never
 * block), social link-preview bots (Twitterbot, LinkedInBot, WhatsApp, Slackbot,
 * facebookexternalhit/meta-externalagent) — low volume, and blocking them would break
 * rich link previews when people share our pages — and the user-triggered fetchers
 * (ChatGPT-User, Claude-User, Perplexity-User), which load one page when a person asks
 * an assistant about it. Google-Extended is a robots.txt token only (Google crawls with
 * Googlebot either way), so it costs nothing and is left allowed; blocking it would
 * remove us from Gemini answers.
 *
 * Single source of truth for app/robots.ts (advisory) and middleware.ts (enforced —
 * polite bots obey robots.txt, rude ones don't).
 */
export const BLOCKED_BOT_USER_AGENTS = [
  'AhrefsBot',
  'SemrushBot',
  'MJ12bot',
  'DotBot',
  'DataForSeoBot',
  'PetalBot',
  'Bytespider',
  'GPTBot',
  'ClaudeBot',
  'anthropic-ai',
  'CCBot',
  'Amazonbot',
  'Applebot-Extended',
  'Dragonfly', // publisherdiscovery.com
  'AuditBot',
  'SleepBot',
] as const

/** Index crawlers behind AI answers. Allowed only under AI_SEARCH_ALLOWED_PREFIXES. */
export const AI_SEARCH_BOT_USER_AGENTS = [
  'OAI-SearchBot',
  'PerplexityBot',
  'Claude-SearchBot',
  'DuckAssistBot',
] as const

/** Path prefixes AI search crawlers may fetch: the letter tool and its guides, and the blog. */
export const AI_SEARCH_ALLOWED_PREFIXES = ['/support-letter', '/blog'] as const

/** Exact paths they also need in order to follow the rules and find pages. */
const AI_SEARCH_ALLOWED_EXACT = new Set(['/robots.txt', '/sitemap.xml', '/sitemap-blog.xml'])

// Escape regex metacharacters just in case any token above ever contains one.
function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

const toPattern = (list: readonly string[]) => new RegExp(list.map(escapeRegExp).join('|'), 'i')

export const BLOCKED_BOT_UA_PATTERN = toPattern(BLOCKED_BOT_USER_AGENTS)
export const AI_SEARCH_BOT_UA_PATTERN = toPattern(AI_SEARCH_BOT_USER_AGENTS)

/** Whether an AI search crawler may fetch this path. "/blog" matches "/blog/x" but not "/blogger". */
export function aiSearchBotMayFetch(pathname: string): boolean {
  if (AI_SEARCH_ALLOWED_EXACT.has(pathname)) return true
  return AI_SEARCH_ALLOWED_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`))
}
