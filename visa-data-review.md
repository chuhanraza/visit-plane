# VisitPlane — Visa Data Review & Confidence Report

**Generated:** 2026-06-24 · Sprint 16 (YMYL data-trust pass)
**Author:** Engineering (automated scan + manual review)
**Scope:** `destinations` table (Supabase project `wmoywcqadkjxujgwduup` / "Visit Plane 1 F")

> ⚠️ **This is a flag-only report. No visa rule, status, fee, allowed-stay, or duration
> was changed by this sprint.** Every item below is a TODO for a human to verify against
> the **official government source** before correcting. Do **not** treat any wording here
> as an assertion of the *correct* visa rule — it only says "this looks off, verify."
>
> The only logic changed this sprint: (a) the visa-free-map **count** aggregation
> (dedupe to distinct countries), and (b) the embassy-finder **direction** logic.
> Neither alters a stored visa value.

---

## 0. Dataset snapshot

| Metric | Value |
|---|---|
| Total rows | **73,366** |
| Distinct passport countries | 197 |
| Distinct destination countries | 197 |
| Distinct passport→destination pairs | 38,612 |
| Pairs with duplicate rows | 26,029 |
| Duplicate (redundant) rows | **34,754** (73,366 − 38,612) |
| Max rows for a single pair | 4 |
| Rows with `data_confidence = 'unverified'` | **73,366 (100%)** |
| Rows with empty `official_source_url` | **73,365 of 73,366 (99.99%)** |

---

## 1. 🔴 HIGH RISK — visa-free-map showed impossible totals (count bug; FIXED in logic)

The map previously counted **raw rows**, not distinct countries, so several passports
displayed more "visa-free" countries than exist on Earth (max ≈197). Examples of the
**old, impossible** counts (raw-row logic):

| Passport | Old "visa-free" count | Reality check |
|---|---|---|
| UAE | **293** | Impossible — exceeds 197 total countries |
| Malaysia | **280** | Impossible |
| Chile | **271** | Impossible |
| Brunei | **271** | Impossible |
| Norway | **264** | Impossible |
| Lithuania | **262** | Impossible |
| Netherlands | **262** | Impossible |
| Croatia | **262** | Impossible |

**Status:** The **counting/aggregation** was fixed this sprint (`app/api/visa-map/route.ts`)
by collapsing to **distinct destination countries** (first row per country, by id). After
the fix the maximum visa-free count is **170** and the maximum total is **196** — both
plausible (≤197).

**⚠️ Still needs Hamad:** The fix corrects the *count*. It does **not** verify whether each
country's stored `visa_type` is *correct*. The underlying per-country statuses remain
unverified (see §3). Spot-check the top passports' visa-free lists against an authoritative
index (e.g. each destination's official immigration site / a passport-index reference).

---

## 2. 🔴 HIGH RISK — conflicting visa status on the same route

**5,319 passport→destination pairs have rows that disagree on `visa_type`** (the same
route is stored as more than one visa category across its duplicate rows). When the app
picks one row to display, the traveller may see a *different* status than another part of
the site shows for the same route. This is the single most dangerous data-integrity issue.

- **Action:** For each conflicting pair, decide the single correct `visa_type` **from the
  official source** and remove/repair the contradicting rows.
- **Note:** The visa-free-map now deterministically keeps the **lowest-id** row per country,
  so its bucket is stable — but "stable" is not "verified." These conflicts must be resolved
  by a human against official sources.

*(Full list of 5,319 pairs is available via the query in the appendix; prioritise
high-traffic passports: India, Pakistan, Nigeria, Philippines, China, Bangladesh.)*

---

## 3. 🟠 MEDIUM RISK — entire table is unverified & unsourced

- **`data_confidence = 'unverified'` on 100% of rows.** No row is marked verified.
- **`official_source_url` is empty on 99.99% of rows** (only 1 row has any value).

**Action for Hamad:** This is the core YMYL gap. Even where a value is correct, the site
cannot prove it. Two complementary tracks now exist to close this safely **without** AI
inventing data:
1. **Per-route sources** — `data/officialSources.ts` (22 Pakistan→X routes already verified).
2. **Per-destination official portals** — `lib/data/officialPortals.ts` (49 destinations
   mapped to confident government URLs this sprint; see §5). Every destination & visa page
   now renders a "Verify at the official source" link or an honest search fallback.

The database's own `official_source_url` / `data_confidence` columns should be back-filled
from these verified sources over time.

---

## 4. 🟡 DATA HYGIENE — duplicate country rows

- **34,754 redundant rows** across 26,029 pairs (up to 4 rows per route).
- Many are *exact* duplicates (e.g. Pakistan→Turkey has 3 identical "Visa Required" rows).
- Others differ only by visa-type variant (legitimately multiple visa products) — those
  are **not** errors, but they must be distinguished from accidental dupes before any
  dedupe migration.

**Action:** Deliberate, human-reviewed dedupe migration. Do **not** blind-delete — separate
"true duplicate" (identical) from "visa-type variant" (intentional) first. The app side is
already defended: the visa-map dedupes to distinct countries at read time.

---

## 5. 🟡 OFFICIAL-SOURCE LINK COVERAGE (Part 1 deliverable)

`lib/data/officialPortals.ts` maps **49 destination countries** to confident, real
government portals. Examples actually used:

- 🇮🇳 India → `https://indianvisaonline.gov.in/evisa/`
- 🇦🇪 UAE → `https://icp.gov.ae/en/`
- 🇹🇷 Turkey → `https://www.evisa.gov.tr/en/`
- 🇬🇧 United Kingdom → `https://www.gov.uk/browse/visas-immigration`
- 🇺🇸 United States → `https://travel.state.gov/content/travel/en/us-visas.html`

**~148 destinations are intentionally left `null`** (no confident URL → honest
"search the official source" fallback shown, never a guessed link).

**Needs Hamad — fill these in (high-traffic first):** Brazil, Mexico, Kenya, Ghana,
Bangladesh, Kazakhstan, Jordan, Kuwait, Greece, Czech Republic, Poland, Belgium, and the
remaining ~135 destinations. Add each as `{ url, label }` to `PORTALS` only after
confirming the **official** domain.

---

## 6. 🟡 EMBASSY-FINDER — sparse data (direction bug FIXED in logic)

- **Direction fixed** (`app/embassy-finder/page.tsx`): the tool now returns *the
  **destination** country's embassy/consulate located in the applicant's **home**
  country* — the correct mission for a visa application. Previously the filter matched the
  wrong direction.
- **Data is very sparse:** only **5** verified missions exist, all hosted in just **2**
  countries (UK, USA): Pakistan→(UK, US), India→US, Nigeria→UK, Philippines→US.
- Every unmatched route (e.g. **Pakistan → Turkey**) now shows an **honest fallback**:
  "we don't have verified embassy details for this route" + a `[destination] embassy in
  [home]` search link + the official-source portal. **No embassy addresses are fabricated.**

**Needs Hamad:** Source verified embassy/consulate addresses (name, address, phone, hours)
for the high-traffic routes and add them to the `EMBASSIES` array using the documented
`ofCountry` (destination) / `inCountry` (home) field meaning.

---

## 7. ✅ Spot-checks that looked plausible (no action, recorded for transparency)

These high-traffic routes' **stored** statuses were sampled and look consistent with
common knowledge (still officially unverified — link provided on page):

| Route | Stored `visa_type` |
|---|---|
| Pakistan → United States | Visa Required |
| Pakistan → United Kingdom | Visa Required |
| Pakistan → Turkey | Visa Required |
| India → United States | Visa Required |
| India → United Kingdom | Visa Required |
| Afghanistan → United States | Visa Required |
| Nigeria → United Kingdom | Embassy Visa |

---

## Appendix — verification queries

```sql
-- Conflicting visa_type on the same route (§2)
select passport_country, country_name, count(distinct visa_type) v
from destinations group by 1,2 having count(distinct visa_type) > 1
order by v desc, 1, 2;

-- Duplicate rows (§4)
select passport_country, country_name, count(*) rows
from destinations group by 1,2 having count(*) > 1 order by rows desc;

-- Unsourced / unverified (§3)
select count(*) filter (where official_source_url is null or official_source_url='') as no_url,
       count(*) filter (where data_confidence is distinct from 'verified') as not_verified
from destinations;
```

---

### Summary for Hamad

1. **Verify conflicting-status routes (§2, 5,319 pairs)** — highest danger, do first.
2. **Back-fill `official_source_url` / `data_confidence`** from verified sources (§3).
3. **Fill the ~148 null destination portals** in `lib/data/officialPortals.ts` (§5).
4. **Plan a deliberate dedupe migration** for the 34,754 duplicate rows (§4).
5. **Add verified embassy addresses** for high-traffic routes (§6).
