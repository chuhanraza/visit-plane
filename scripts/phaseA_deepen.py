#!/usr/bin/env python3
"""Phase A deepen: insert Quick Answer blocks + cross-links into .md bodies,
add comparison tables + affiliate paragraphs to the two thin cheapest listicles,
and expand FAQ arrays in src/lib/posts.ts to 8-10 per page.
Idempotent: skips a file if the Quick Answer marker already present."""
import re, sys

ROOT = '/Users/muhammadhamadashraf/dev/visitplane'

# ── Quick Answer paragraphs (50-70 words, snippet-optimized) ──────────────────
QUICK = {
 '15-cheapest-countries-to-visit-from-pakistan-in-2026':
  "The cheapest countries to visit from Pakistan in 2026 include Thailand, Indonesia, Vietnam, Cambodia, Nepal, Sri Lanka, Georgia, Azerbaijan, Egypt, and Turkey — destinations where low airfares and modest daily costs stretch a tight budget furthest. Most can be done comfortably on a low daily spend. Visa rules vary by passport, so confirm each route with the [VisitPlane Visa Wizard](/wizard) before booking anything non-refundable.",
 '15-cheapest-countries-to-visit-from-philippines-in-2026':
  "The cheapest countries to visit from the Philippines in 2026 include Thailand, Malaysia, Indonesia, Vietnam, Cambodia, India, Sri Lanka, Georgia, and Turkey — mostly across accessible Asia where flights, food, and stays keep overall costs low. Filipino passport holders enjoy visa-free or visa-on-arrival access to several of these, but rules change, so confirm each route with the [Visa Wizard](/wizard) first.",
 '15-cheapest-countries-to-visit-from-bangladesh-in-2026':
  "The cheapest countries to visit from Bangladesh in 2026 include Thailand, Malaysia, Indonesia, Nepal, Sri Lanka, India, Maldives, Georgia, and Azerbaijan — destinations where low airfares and daily costs work hardest for a modest budget. Bangladeshi passport visa rules differ by country and change often, so confirm each route with the [VisitPlane Visa Wizard](/wizard) before you book.",
 'how-much-does-a-saudi-arabia-visa-cost-from-pakistan-2026-fees-hidden-charges':
  "A Saudi Arabia tourist e-visa from Pakistan costs around SAR 535, a fee that already bundles the mandatory medical insurance. The all-in cost is higher once you add any service charge, passport photos, document costs, and card or currency-conversion fees. Umrah and Hajj are arranged separately through approved operators. Always confirm the current fee on the official Visit Saudi portal before paying.",
 'how-much-does-a-saudi-arabia-visa-cost-from-philippines-2026-fees-hidden-charges':
  "A Saudi Arabia tourist e-visa from the Philippines costs around SAR 535, including the mandatory insurance. The real all-in cost is higher once you add the visa-centre service charge, photos, supporting documents, and any courier or card fees. Confirm the current government fee on the official Visit Saudi portal before paying, and check your eligibility for the e-visa first.",
 'how-much-does-a-south-korea-visa-cost-from-nigeria-2026-fees-hidden-charges':
  "A South Korea short-stay (C-3) visa from Nigeria has a government fee of about USD 40 for single entry, with multiple-entry visas higher. The all-in cost is more once you add the visa-centre service charge, biometrics, travel insurance, photos, and documents. Confirm the current consular fee with the Korea Visa Application Centre before applying, since fees and rules change.",
 'turkey-evisa-for-pakistanis':
  "Pakistani passport holders need a Turkey eVisa, applied for entirely online at the official portal evisa.gov.tr in about five minutes. The fee is around USD 90, the eVisa is usually issued within 24-72 hours, and it allows stays of up to 30 days. Only use the official site — third-party resellers charge more for the same document. Confirm the current fee before paying.",
 'france-student-visa-financial-requirements-2026-proof-of-funds-explained':
  "For a France student visa (VLS-TS) in 2026, plan for about EUR 615 per month — roughly EUR 7,380 a year — in living costs on top of tuition. Proof of funds can be your savings, a scholarship, or a sponsor guarantee, but the money must be genuinely yours and stable over several months. Confirm the current figure on the official France-Visas and Campus France sites before applying.",
 'ireland-student-visa-financial-requirements-2026-proof-of-funds-explained':
  "For an Ireland student visa in 2026, courses longer than 8 months require proof of at least EUR 10,000 (about EUR 833 per month) for the first year, on top of tuition, with the same available for each later year. Funds should be held for at least 28 days in your or your sponsor name. These figures took effect 30 June 2025 — confirm the latest on the official Irish immigration site.",
 'pakistan-to-oman-visa-requirements-how-to-apply-2026':
  "Pakistani travellers need an Oman tourist e-visa, applied for online through the Royal Oman Police (ROP) portal. A short-stay visa costs around OMR 5, with longer multiple-entry visas costing more. You will need a valid passport, photo, proof of funds, and evidence of ties to Pakistan. Confirm the current fee and your eligibility on the official ROP e-visa portal before applying.",
 'bangladesh-to-uae-visa-requirements-2026':
  "Bangladeshi passport holders need a UAE visit (tourist) visa — there is no visa on arrival. It is applied for entirely online, sponsored by an airline (Emirates, flydubai, Air Arabia), a hotel, or an authorised agent, in 30-day or 60-day options. Use a reputable sponsor and confirm the current fee before paying. Processing is typically a few business days.",
 '40-visa-free-countries-for-sri-lanka-passport-holders-2026-list':
  "A Sri Lanka passport offers visa-free or visa-on-arrival access to roughly 40 destinations in 2026, spanning South and Southeast Asia, the Caucasus, and several African, Caribbean, and Pacific island nations. The exact list changes frequently as governments update policy, so treat any published number as a starting point and confirm the current rule for each country with the [VisitPlane Visa Wizard](/wizard) before booking.",
}

# ── In-body cross-links to sibling LIVE winners (+ relevant /visa routes) ─────
RELATED = {
 '15-cheapest-countries-to-visit-from-pakistan-in-2026':
  "**Related on VisitPlane:** [Saudi Arabia visa cost from Pakistan](/blog/how-much-does-a-saudi-arabia-visa-cost-from-pakistan-2026-fees-hidden-charges) · [Turkey eVisa for Pakistanis](/blog/turkey-evisa-for-pakistanis) · [Pakistan to Oman visa](/blog/pakistan-to-oman-visa-requirements-how-to-apply-2026)",
 '15-cheapest-countries-to-visit-from-philippines-in-2026':
  "**Related on VisitPlane:** [Saudi Arabia visa cost from the Philippines](/blog/how-much-does-a-saudi-arabia-visa-cost-from-philippines-2026-fees-hidden-charges) · [Philippines to Thailand visa requirements](/visa/Philippines/Thailand)",
 '15-cheapest-countries-to-visit-from-bangladesh-in-2026':
  "**Related on VisitPlane:** [Bangladesh to UAE (Dubai) visa](/blog/bangladesh-to-uae-visa-requirements-2026) · [Bangladesh to Thailand visa requirements](/visa/Bangladesh/Thailand)",
 'how-much-does-a-saudi-arabia-visa-cost-from-pakistan-2026-fees-hidden-charges':
  "**Related on VisitPlane:** [15 cheapest countries to visit from Pakistan](/blog/15-cheapest-countries-to-visit-from-pakistan-in-2026) · [Turkey eVisa for Pakistanis](/blog/turkey-evisa-for-pakistanis)",
 'how-much-does-a-saudi-arabia-visa-cost-from-philippines-2026-fees-hidden-charges':
  "**Related on VisitPlane:** [15 cheapest countries to visit from the Philippines](/blog/15-cheapest-countries-to-visit-from-philippines-in-2026) · [Philippines to Saudi Arabia visa requirements](/visa/Philippines/Saudi%20Arabia)",
 'how-much-does-a-south-korea-visa-cost-from-nigeria-2026-fees-hidden-charges':
  "**Related on VisitPlane:** [Nigeria to South Korea visa requirements](/visa/Nigeria/South%20Korea) · [Check any route with the Visa Wizard](/wizard)",
 'turkey-evisa-for-pakistanis':
  "**Related on VisitPlane:** [15 cheapest countries to visit from Pakistan](/blog/15-cheapest-countries-to-visit-from-pakistan-in-2026) · [Saudi Arabia visa cost from Pakistan](/blog/how-much-does-a-saudi-arabia-visa-cost-from-pakistan-2026-fees-hidden-charges)",
 'france-student-visa-financial-requirements-2026-proof-of-funds-explained':
  "**Related on VisitPlane:** [Ireland student visa financial requirements](/blog/ireland-student-visa-financial-requirements-2026-proof-of-funds-explained) · [Visa document checklist](/checklist)",
 'ireland-student-visa-financial-requirements-2026-proof-of-funds-explained':
  "**Related on VisitPlane:** [France student visa financial requirements](/blog/france-student-visa-financial-requirements-2026-proof-of-funds-explained) · [Visa document checklist](/checklist)",
 'pakistan-to-oman-visa-requirements-how-to-apply-2026':
  "**Related on VisitPlane:** [15 cheapest countries to visit from Pakistan](/blog/15-cheapest-countries-to-visit-from-pakistan-in-2026) · [Saudi Arabia visa cost from Pakistan](/blog/how-much-does-a-saudi-arabia-visa-cost-from-pakistan-2026-fees-hidden-charges)",
 'bangladesh-to-uae-visa-requirements-2026':
  "**Related on VisitPlane:** [15 cheapest countries to visit from Bangladesh](/blog/15-cheapest-countries-to-visit-from-bangladesh-in-2026) · [Bangladesh to UAE visa requirements](/visa/Bangladesh/United%20Arab%20Emirates)",
 '40-visa-free-countries-for-sri-lanka-passport-holders-2026-list':
  "**Related on VisitPlane:** [15 cheapest countries to visit from Sri Lanka](/blog/15-cheapest-countries-to-visit-from-sri-lanka-in-2026) · [Check any route with the Visa Wizard](/wizard)",
}

MARKER = '## Quick Answer'

def insert_quick_answer(slug):
    p = f'{ROOT}/content/blog/{slug}.md'
    t = open(p).read()
    if MARKER in t:
        print('  md SKIP (already has Quick Answer):', slug); return
    block = f"\n## Quick Answer\n\n{QUICK[slug]}\n\n{RELATED[slug]}\n"
    # insert before the first H2 after frontmatter
    m = re.search(r'\n## ', t)
    if not m:
        print('  md NO H2:', slug); return
    i = m.start()
    t = t[:i] + block + t[i:]
    open(p, 'w').write(t)
    print('  md OK:', slug)

# ── Comparison tables for the two thin cheapest listicles ─────────────────────
TABLE_PH = """## Quick Comparison

| # | Country | Why it is good value | Daily budget feel |
|---|---|---|---|
| 1 | Thailand | Cheap street food, transport, beaches | Very low |
| 2 | Malaysia | Low-cost hub, islands, cities | Low |
| 3 | Indonesia | Bali guesthouses, cheap eats | Very low |
| 4 | Vietnam | Outstanding street-food value | Very low |
| 5 | Cambodia | Very low day-to-day costs | Very low |
| 6 | Singapore | Pricey beds, but many free attractions | Mid |
| 7 | India | Vast, varied, very affordable | Very low |
| 8 | Sri Lanka | Compact, affordable island | Very low |
| 9 | UAE | Free beaches, frequent flight deals | Mid |
| 10 | Turkey | Europe-lite at a fraction of the price | Low |
| 11 | Georgia | Very low cost, dramatic scenery | Very low |
| 12 | Maldives | Local-island guesthouses | Low-mid |
| 13 | Qatar | Free attractions, stopover deals | Mid |
| 14 | Kenya | Safari and beaches, off-peak value | Mid |
| 15 | Morocco | Souks, coast, and desert on a budget | Low |

"Daily budget feel" is a rough guide to on-the-ground spending, not flight cost. Use it to shortlist, then compare live fares from Manila or Cebu.

"""

TABLE_BD = """## Quick Comparison

| # | Country | Why it is good value | Daily budget feel |
|---|---|---|---|
| 1 | Thailand | Cheap street food, transport, beaches | Very low |
| 2 | Malaysia | Low-cost hub, islands, cities | Low |
| 3 | Indonesia | Bali guesthouses, cheap eats | Very low |
| 4 | Maldives | Local-island guesthouses | Low-mid |
| 5 | Nepal | Himalayas and trekking, low cost | Very low |
| 6 | Sri Lanka | Compact, affordable island | Very low |
| 7 | India | Vast, varied, very affordable | Very low |
| 8 | UAE | Free beaches, frequent flight deals | Mid |
| 9 | Turkey | Europe-lite at a fraction of the price | Low |
| 10 | Georgia | Very low cost, dramatic scenery | Very low |
| 11 | Azerbaijan | Short flights, modest prices | Low |
| 12 | Vietnam | Outstanding street-food value | Very low |
| 13 | Cambodia | Very low day-to-day costs | Very low |
| 14 | Kenya | Safari and beaches, off-peak value | Mid |
| 15 | Qatar | Free attractions, stopover deals | Mid |

"Daily budget feel" is a rough guide to on-the-ground spending, not flight cost. Use it to shortlist, then compare live fares from Dhaka.

"""

def affiliate_para(slug):
    return (
     "Two small things make a budget trip smoother. Travel-medical cover protects you if "
     "a clinic visit or a cancelled flight would otherwise blow your budget — a flexible plan "
     f"such as **[SafetyWing](/go/safetywing?placement=cheapest_listicle&slug={slug})** lets you "
     "match the cover window to your exact dates. And instead of paying roaming charges or queueing "
     "for a local SIM, a travel **eSIM** from "
     f"**[Airalo](/go/airalo?placement=cheapest_listicle&slug={slug})** gets maps and ride-hailing "
     "working the moment you land. *(Affiliate links — we may earn a small commission at no cost to you.)*\n\n"
    )

def add_table_and_affiliate(slug, table):
    p = f'{ROOT}/content/blog/{slug}.md'
    t = open(p).read()
    if '## Quick Comparison' not in t:
        t = t.replace('## The List', table + '## The List', 1)
    # affiliate paragraph under the insurance section
    hdr = "## Don't Forget Insurance and the Essentials\n"
    if '/go/safetywing' not in t and hdr in t:
        t = t.replace(hdr, hdr + '\n' + affiliate_para(slug), 1)
    open(p, 'w').write(t)
    print('  md table+affiliate OK:', slug)

# ── Extra FAQs to append into posts.ts (curly apostrophe is safe in TS '...') ─
A = '’'  # right single quote
EXTRA = {
 '15-cheapest-countries-to-visit-from-pakistan-in-2026': [
  ("Which is the single cheapest country to visit from Pakistan?",
   "Day to day, Southeast Asian destinations like Thailand, Vietnam, and Cambodia, plus Nepal and Georgia, tend to offer the lowest daily costs. The cheapest overall trip depends on airfare from your city on your dates, so compare live flight prices alongside the daily budget."),
  ("Are these cheapest destinations visa-free for Pakistani passport holders?",
   "Some offer visa-on-arrival or e-visas for Pakistani travellers, while others need a visa in advance. Access changes, so confirm the current rule for each country with the VisitPlane Visa Wizard before booking."),
 ],
 '15-cheapest-countries-to-visit-from-philippines-in-2026': [
  ("How many countries can Filipino passport holders visit visa-free?",
   "Filipino passport holders have visa-free or visa-on-arrival access to a substantial number of countries, including much of ASEAN. The exact list changes, so confirm each destination with the Visa Wizard before you book."),
  ("Which is the cheapest country to visit from the Philippines?",
   "Southeast Asian neighbours such as Thailand, Vietnam, Cambodia, and Indonesia usually offer the lowest daily costs and the cheapest flights from Manila or Cebu. Compare live airfares for your dates to find the best-value trip."),
  ("Do Filipinos need a visa for Thailand?",
   f"Filipino passport holders typically enjoy visa-free entry to Thailand for short tourist stays, but conditions and limits change. Always confirm the current Philippines to Thailand rule with the Visa Wizard before travel."),
  ("When is the cheapest time to visit Southeast Asia from the Philippines?",
   "Shoulder seasons generally bring lower flight and hotel prices than peak holiday periods. Travelling outside school holidays and major festivals usually stretches a tight budget furthest."),
 ],
 '15-cheapest-countries-to-visit-from-bangladesh-in-2026': [
  ("Which is the cheapest country to visit from Bangladesh?",
   "Nepal and Sri Lanka are among the cheapest to reach from Dhaka, while Thailand, Indonesia, and Vietnam offer very low daily costs. The cheapest overall trip depends on live airfare for your dates, so compare flights alongside daily budgets."),
  ("Do Bangladeshi passport holders get visa-on-arrival anywhere on this list?",
   "Some destinations offer visa-on-arrival or e-visas to Bangladeshi travellers and others require a visa in advance. Rules change often, so confirm each route with the VisitPlane Visa Wizard before booking."),
  ("Is Nepal visa-free for Bangladeshi citizens?",
   "Bangladeshi passport holders can usually obtain a visa-on-arrival for Nepal, but conditions and fees change. Confirm the current Bangladesh to Nepal rule with the Visa Wizard before you travel."),
  ("When is the cheapest time to travel from Bangladesh?",
   "Travelling in shoulder seasons and avoiding Eid and peak holiday periods typically brings the lowest flight and accommodation prices, making a modest budget go further."),
 ],
 'how-much-does-a-saudi-arabia-visa-cost-from-pakistan-2026-fees-hidden-charges': [
  ("Can I perform Umrah on a Saudi tourist visa from Pakistan?",
   f"Under current rules, tourist e-visa holders can generally perform Umrah outside peak Hajj periods, but policy changes — confirm the live rule first. For a pilgrimage-focused trip, an Umrah package through an approved operator may be better value."),
 ],
 'how-much-does-a-saudi-arabia-visa-cost-from-philippines-2026-fees-hidden-charges': [
  ("Does the Saudi visa fee include insurance for Filipino applicants?",
   "The roughly SAR 535 tourist e-visa fee bundles the mandatory medical insurance Saudi Arabia requires of tourist-visa holders. Some travellers still add extra travel-medical cover for peace of mind beyond the basic policy."),
  ("Can Filipinos perform Umrah on a Saudi tourist visa?",
   "Under current rules, tourist-visa holders can generally perform Umrah outside peak Hajj periods, but policy changes — confirm the live rule before relying on it. A dedicated Umrah package may suit a pilgrimage-focused trip better."),
  ("Do I get a refund if my Saudi visa is refused?",
   "Generally no. The visa fee is a processing fee that pays for the assessment, so it is not refunded on refusal, and service charges are non-refundable once the work is done."),
  ("How long does the Saudi tourist e-visa take from the Philippines?",
   "Complete, eligible e-visa applications are often issued within a few days, sometimes faster. Apply two to three weeks before travel to allow for any document re-request, and add buffer during Umrah season and major events."),
 ],
 'how-much-does-a-south-korea-visa-cost-from-nigeria-2026-fees-hidden-charges': [
  ("Do Nigerians need a visa for South Korea?",
   "Yes. Nigerian passport holders need a visa for South Korea and apply through the Korea Visa Application Centre. Confirm the current requirement and document list on the official Korea Visa Portal before applying."),
  ("What is K-ETA and do Nigerians need it?",
   "K-ETA is an electronic travel authorisation for visa-waiver nationalities. Nigerian travellers who require a visa do not use K-ETA — they apply for the consular visa instead. Confirm your category before paying."),
  ("Is the South Korea visa fee refundable if refused?",
   "Generally no. The consular fee is a processing fee and is not refunded if your application is refused, so prepare a complete, consistent file the first time."),
  ("How long does a South Korea visa take from Nigeria?",
   "Short-stay visa processing varies by season and individual case and can take several working days to a few weeks. Apply well before travel and confirm current timelines with the visa centre."),
 ],
 'turkey-evisa-for-pakistanis': [
  ("Can Pakistani citizens get a Turkey visa on arrival?",
   "No. There is no visa on arrival for Pakistani passport holders — the eVisa must be obtained before travel at the official portal evisa.gov.tr."),
  ("How long is the Turkey eVisa valid for Pakistanis?",
   "The Turkey eVisa is generally valid for 180 days from issue and allows stays of up to 30 days per entry. Confirm the validity shown on your approved eVisa."),
  ("What passport validity do I need for a Turkey eVisa?",
   "Pakistani applicants generally need a passport valid at least 150 days beyond the entry date into Turkey, plus a return or onward ticket and accommodation details."),
  ("Is the Turkey eVisa fee refundable if rejected?",
   "No. The eVisa fee is non-refundable even if your application is rejected, which is why it is important to enter your passport details exactly and apply only on the official site."),
 ],
 'france-student-visa-financial-requirements-2026-proof-of-funds-explained': [
  ("How much money do I need for a France student visa in 2026?",
   "Plan for about EUR 615 per month — roughly EUR 7,380 a year — in living costs on top of tuition. Confirm the current figure on the official France-Visas and Campus France sites before applying."),
  ("What counts as proof of funds for a France student visa?",
   f"Acceptable evidence includes bank statements showing the required balance, a scholarship award letter, or a sponsor{A}s guarantee (attestation de prise en charge) with their bank statements. The document must be recent, legible, and clearly linked to you."),
  ("Does the France financial requirement include tuition?",
   "No. The living-cost figure sits on top of tuition. Build your total from living costs plus your actual programme fees, then add a buffer for exchange-rate movement."),
  ("Can a sponsor cover my France student visa funds?",
   f"Yes. A sponsor can provide a guarantee with their identity document, proof of relationship, income evidence, and the monthly commitment. A French guarantor{A}s commitment is particularly strong."),
 ],
 'ireland-student-visa-financial-requirements-2026-proof-of-funds-explained': [
  ("How much money do I need for an Ireland student visa in 2026?",
   "For courses longer than 8 months you must show at least EUR 10,000 (about EUR 833 per month) for the first year on top of tuition, with the same available each subsequent year. For shorter courses the requirement is EUR 833 per month, capped near EUR 6,665."),
  ("How long must funds be held for an Ireland student visa?",
   "Ireland generally expects the money to be held for at least 28 days and genuinely accessible. Document the source of any large deposit so it does not look like borrowed-for-the-photo money."),
  ("When did the new Ireland student finance figures take effect?",
   "The current amounts took effect from 30 June 2025 and apply to both visa-required and non-visa-required nationals. Always confirm the latest figure on the official Irish immigration site."),
  ("What counts as proof of funds for Ireland?",
   f"Your own or your sponsor{A}s bank statements, a scholarship letter, or an education loan, held in the student{A}s or sponsor{A}s name and dated within one month of your application."),
 ],
 'pakistan-to-oman-visa-requirements-how-to-apply-2026': [
  ("How much does an Oman visa cost from Pakistan?",
   "A short-stay Oman tourist e-visa is around OMR 5, with longer multiple-entry visas costing more. Fees change, so confirm the current amount on the official Royal Oman Police e-visa portal before paying."),
  ("How do Pakistani citizens apply for an Oman visa?",
   "Most Pakistani travellers apply online through the Royal Oman Police (ROP) e-visa portal. Confirm your eligibility route first, since applying through the wrong channel is a common cause of delay."),
  ("What documents do I need for an Oman visa from Pakistan?",
   "Typically a passport valid well beyond your trip with blank pages, a spec-compliant photo, proof of funds, your trip purpose or bookings, evidence of ties to Pakistan, and travel medical insurance where required."),
  ("How long does the Oman e-visa take?",
   "Processing varies by case and season. Apply at least a couple of weeks before travel so a document re-request does not derail your plans, and keep every payment receipt."),
 ],
 'bangladesh-to-uae-visa-requirements-2026': [
  ("Do Bangladeshi citizens need a visa for the UAE?",
   "Yes. Bangladeshi passport holders are not eligible for UAE visa on arrival and must obtain a visit visa before travel, applied for online and sponsored by an airline, hotel, or authorised agent."),
  ("What is the difference between the 30-day and 60-day UAE visa?",
   "Both are tourist visit visas issued electronically; the 60-day option allows a longer stay and costs more. Single and multiple-entry versions exist. Choose based on your trip length and confirm the current fee with your sponsor."),
  ("Who can sponsor a UAE visit visa for a Bangladeshi traveller?",
   "Airlines such as Emirates, flydubai, Etihad, and Air Arabia, many UAE hotels, authorised travel agents, and sometimes a UAE-resident relative. Use a reputable sponsor and avoid unverified cheap-visa sellers."),
  ("How long does a UAE visit visa take for Bangladeshi applicants?",
   "Electronic visit visas are typically processed within a few business days for complete applications. Apply at least a week or two before travel and check all passport details are correct."),
 ],
 '40-visa-free-countries-for-sri-lanka-passport-holders-2026-list': [
  ("How many countries can Sri Lankan passport holders visit visa-free in 2026?",
   "A Sri Lanka passport offers visa-free or visa-on-arrival access to roughly 40 destinations, but the figure shifts as countries change policy. Confirm the current rule for each country with the VisitPlane Visa Wizard before booking."),
  ("What is the difference between visa-free, visa-on-arrival, and e-visa?",
   "Visa-free means no visa at all; visa-on-arrival is issued at the border; an e-visa or e-Travel Authorisation is a quick online approval before you fly. The documents and steps differ, so check which applies to your destination."),
  ("Which regions are easiest for Sri Lankan travellers to visit?",
   "Access commonly extends across South and Southeast Asia, the Caucasus, and various African, Caribbean, and Pacific island nations that offer visa-on-arrival or visa-free entry. Always verify each specific destination."),
  ("Why do visa-free lists change so often?",
   "Governments adjust access for reciprocity, security, or tourism reasons, sometimes with little notice. A published list is never a substitute for a real-time check for your passport on the day you plan to travel."),
 ],
}

def expand_faqs(src, slug, items):
    i = src.find("slug: '%s'" % slug)
    if i < 0:
        print('  posts MISSING', slug); return src
    fi = src.find('faqs: [', i)
    if fi < 0:
        print('  posts NO FAQS', slug); return src
    insert_at = fi + len('faqs: [')
    blocks = ''
    for q, a in items:
        q = q.replace("'", A); a = a.replace("'", A)
        blocks += "\n      { q: '%s', a: '%s' }," % (q, a)
    return src[:insert_at] + blocks + src[insert_at:]

def main():
    print('== .md Quick Answer blocks ==')
    for slug in QUICK:
        insert_quick_answer(slug)
    print('== thin listicle tables + affiliate ==')
    add_table_and_affiliate('15-cheapest-countries-to-visit-from-philippines-in-2026', TABLE_PH)
    add_table_and_affiliate('15-cheapest-countries-to-visit-from-bangladesh-in-2026', TABLE_BD)
    print('== posts.ts FAQ expansion ==')
    sp = f'{ROOT}/src/lib/posts.ts'
    src = open(sp).read()
    for slug, items in EXTRA.items():
        before = src.count("{ q:")
        src = expand_faqs(src, slug, items)
        print('  faqs +%d -> %s' % (len(items), slug))
    open(sp, 'w').write(src)
    print('DONE')

main()
