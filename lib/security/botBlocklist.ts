/**
 * Aggressive/non-essential crawlers we actively block — SEO-audit scrapers
 * (used by competitors against us, not for our own indexing) and AI
 * training/browsing bots that send us zero search traffic but do burn ISR
 * writes, function invocations, and bandwidth by crawling every page.
 *
 * Deliberately excluded: Googlebot, Bingbot (real search indexing — never
 * block), and social link-preview bots (Twitterbot, LinkedInBot, WhatsApp,
 * Slackbot, facebookexternalhit/meta-externalagent) — low-volume, and
 * blocking them would break rich link previews when people share our pages.
 *
 * Single source of truth for both app/robots.ts (advisory) and
 * middleware.ts (enforced — polite bots obey robots.txt, rude ones don't).
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
  'CCBot',
  'Amazonbot',
  'PerplexityBot',
  'OAI-SearchBot',
  'Applebot-Extended',
  'Dragonfly', // publisherdiscovery.com
  'AuditBot',
  'SleepBot',
] as const

// Escape regex metacharacters just in case any token above ever contains one.
function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

export const BLOCKED_BOT_UA_PATTERN = new RegExp(
  BLOCKED_BOT_USER_AGENTS.map(escapeRegExp).join('|'),
  'i'
)
