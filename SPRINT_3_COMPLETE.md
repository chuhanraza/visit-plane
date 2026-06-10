# Sprint 3 Complete — Homepage Light Redesign + Auto-Redirect Search

**Completed:** 2026-06-10  
**Branch:** main  

---

## Changes Shipped

### Phase 1 — CSS Color Variables (`app/globals.css`)
Added light color system under `:root`:
- `--bg-primary: #FAFAF7` (warm off-white)
- `--bg-secondary: #FFFFFF`
- `--bg-accent: #ECFDF5` (soft mint)
- `--text-primary: #0F1419`, `--text-secondary: #4A5568`, `--text-tertiary: #94A3B8`
- `--accent-green: #10B981`, `--accent-cyan: #06B6D4`
- `--border-soft: #E2E8F0`, `--shadow-soft: 0 4px 24px rgba(15,20,25,0.06)`

### Phase 2–5 — Homepage Hero (already applied in prior work, verified)
- Background: `#FAFAF7` with top-right radial mint accent
- Trust banner: green pill with embassy data disclaimer
- H1: "Know Exactly Which Visa You Need — In 10 Seconds." (64px desktop / 40px mobile, weight 800, letter-spacing -0.02em)
- Gradient on "In 10 Seconds.": `linear-gradient(135deg, #10B981 0%, #06B6D4 100%)`
- Subtitle: 197 countries, updated daily, no signup
- Search card: white `#FFFFFF` background, 16px border-radius, soft shadow
- Entire hero + search bar visible above fold at 1440×900

### Phase 3 — Auto-Redirect Search (verified in `app/page.tsx`)
- Passport dropdown: updates state only, no redirect
- Destination dropdown: triggers `router.push(/visa/{passport}/{dest})` after 300ms
- No passport selected → inline error "Please select your passport first."
- Popular chips: auto-redirect to `/visa/{passport}/{chip}`
- Fallback "Check Visa Requirements" ghost button retained for keyboard-only users

### Phase 4 — Unverifiable Claims Removed (`app/globals.css`)
| Before | After |
|--------|-------|
| `10,000+ Travelers Helped` | `6 Free Tools` |
| `24/7 Support` | `Free / No Signup Required` |

Stats grid fixed from `sm:grid-cols-4` (broken with 3 items) → `sm:grid-cols-3`.

### Phase 7 — Live Searches Ticker Duplication Fixed
- DOM now renders `LIVE_SEARCHES` (10 entries) **once** for screen readers
- Second visual copy rendered with `aria-hidden="true"` — invisible to assistive tech
- CSS animation `translateX(-50%)` handles seamless loop (unchanged)
- Total unique entries shown to screen readers: **10** (was 20)

---

## Verification Checklist

| Check | Status |
|-------|--------|
| Homepage background is off-white (#FAFAF7), no blue/indigo | ✅ |
| Hero + search bar visible above fold at 1440×900 | ✅ |
| Mobile: H1 fits on 3 lines, search bar visible | ✅ |
| Passport dropdown opens with search-as-you-type | ✅ |
| Selecting passport → no redirect | ✅ |
| Selecting destination → auto-redirects within 500ms | ✅ |
| Popular chip click → auto-redirects | ✅ |
| Stats row: verifiable claims only (197 / 6 Free Tools / No Signup) | ✅ |
| Live Searches ticker: 10 unique DOM entries, smooth scroll | ✅ |
| Other pages untouched | ✅ |
| SiteHeader / SiteFooter untouched | ✅ |
| IP detection / language selection untouched | ✅ |
