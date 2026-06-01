/**
 * data/officialSources.ts
 *
 * Verified official sources for visa routes.
 * ALL URLs here have been confirmed to exist as real government/official sites.
 * Run `npx tsx scripts/check-official-sources.ts` to re-verify HTTP 200 status.
 *
 * Key format: `${passportCountry.toLowerCase()}→${destinationCountry.toLowerCase()}`
 * e.g. "pakistan→uae"
 *
 * source_status values:
 *   'verified'             — ≥1 real official source confirmed
 *   'pending_verification' — no confirmed source yet; show badge instead of link
 */

export type OfficialSourceType = 'mofa' | 'embassy' | 'evisa_portal' | 'iata' | 'other'

export type OfficialSource = {
  type: OfficialSourceType
  label: string
  url: string          // MUST be real HTTPS, MUST return HTTP 200
  verified_at: string  // ISO date YYYY-MM-DD
  is_authoritative: boolean
}

export type RouteSourceData = {
  sources: OfficialSource[]
  source_status: 'verified' | 'pending_verification'
}

// ─── Top 20 Pakistan routes — manually verified 2026-06-02 ───────────────────

export const OFFICIAL_SOURCES: Record<string, RouteSourceData> = {

  // ── 1. Pakistan → UAE ────────────────────────────────────────────────────────
  'pakistan→uae': {
    source_status: 'verified',
    sources: [
      {
        type: 'mofa',
        label: 'Federal Authority for Identity, Citizenship, Customs & Port Security (ICP)',
        url: 'https://icp.gov.ae',
        verified_at: '2026-06-02',
        is_authoritative: true,
      },
      {
        type: 'embassy',
        label: 'UAE Embassy Islamabad — Visa Services',
        url: 'https://www.mofa.gov.ae/en/missions/islamabad/services/visas',
        verified_at: '2026-06-02',
        is_authoritative: true,
      },
      {
        type: 'evisa_portal',
        label: 'UAE Official Government Portal — Visa Information',
        url: 'https://u.ae/en/information-and-services/visa-and-emirates-id',
        verified_at: '2026-06-02',
        is_authoritative: true,
      },
    ],
  },

  // ── 2. Pakistan → Saudi Arabia ──────────────────────────────────────────────
  'pakistan→saudi arabia': {
    source_status: 'verified',
    sources: [
      {
        type: 'evisa_portal',
        label: 'Visit Saudi — Official eVisa Portal',
        url: 'https://visa.visitsaudi.com/',
        verified_at: '2026-06-02',
        is_authoritative: true,
      },
      {
        type: 'mofa',
        label: 'Saudi Arabia Ministry of Foreign Affairs — Visa Types',
        url: 'https://www.mofa.gov.sa/en/Visas/Pages/VisaTypes.aspx',
        verified_at: '2026-06-02',
        is_authoritative: true,
      },
    ],
  },

  // ── 3. Pakistan → Turkey ────────────────────────────────────────────────────
  'pakistan→turkey': {
    source_status: 'verified',
    sources: [
      {
        type: 'evisa_portal',
        label: 'Republic of Türkiye — Official eVisa System',
        url: 'https://www.evisa.gov.tr/en/',
        verified_at: '2026-06-02',
        is_authoritative: true,
      },
      {
        type: 'mofa',
        label: 'Turkish Ministry of Foreign Affairs — Visa Information for Foreigners',
        url: 'https://www.mfa.gov.tr/visa-information-for-foreigners.en.mfa',
        verified_at: '2026-06-02',
        is_authoritative: true,
      },
      {
        type: 'embassy',
        label: 'Turkish Embassy Islamabad',
        url: 'https://islamabad-emb.mfa.gov.tr',
        verified_at: '2026-06-02',
        is_authoritative: false,
      },
    ],
  },

  // ── 4. Pakistan → Thailand ──────────────────────────────────────────────────
  'pakistan→thailand': {
    source_status: 'verified',
    sources: [
      {
        type: 'evisa_portal',
        label: 'Royal Thai Ministry of Foreign Affairs — Official eVisa',
        url: 'https://www.thaievisa.go.th/',
        verified_at: '2026-06-02',
        is_authoritative: true,
      },
      {
        type: 'embassy',
        label: 'Royal Thai Embassy Islamabad',
        url: 'https://islamabad.thaiembassy.org/en/index',
        verified_at: '2026-06-02',
        is_authoritative: false,
      },
    ],
  },

  // ── 5. Pakistan → Malaysia ──────────────────────────────────────────────────
  'pakistan→malaysia': {
    source_status: 'verified',
    sources: [
      {
        type: 'evisa_portal',
        label: 'MyVISA — Official Malaysia eVisa Portal (Immigration Dept.)',
        url: 'https://malaysiavisa.imi.gov.my/',
        verified_at: '2026-06-02',
        is_authoritative: true,
      },
      {
        type: 'mofa',
        label: 'Malaysian Immigration Department — Visa Requirements',
        url: 'https://www.imi.gov.my/index.php/en/main-services/visa/visa-requirement-by-country/',
        verified_at: '2026-06-02',
        is_authoritative: true,
      },
    ],
  },

  // ── 6. Pakistan → United Kingdom ────────────────────────────────────────────
  'pakistan→united kingdom': {
    source_status: 'verified',
    sources: [
      {
        type: 'evisa_portal',
        label: 'UK Visas and Immigration — Apply on GOV.UK',
        url: 'https://www.gov.uk/browse/visas-immigration',
        verified_at: '2026-06-02',
        is_authoritative: true,
      },
      {
        type: 'mofa',
        label: 'UK Home Office — Visa Fees for Pakistan',
        url: 'https://visa-fees.homeoffice.gov.uk/y/pakistan/pkr',
        verified_at: '2026-06-02',
        is_authoritative: true,
      },
    ],
  },

  // ── 7. Pakistan → Germany (Schengen) ────────────────────────────────────────
  'pakistan→germany': {
    source_status: 'verified',
    sources: [
      {
        type: 'mofa',
        label: 'German Federal Foreign Office — Visas for Germany',
        url: 'https://www.auswaertiges-amt.de/en/visa-service/215870-215870',
        verified_at: '2026-06-02',
        is_authoritative: true,
      },
      {
        type: 'embassy',
        label: 'German Missions in Pakistan — Federal Foreign Office',
        url: 'https://www.auswaertiges-amt.de/en/aussenpolitik/laenderinformationen/pakistan-node/pakistan-209322',
        verified_at: '2026-06-02',
        is_authoritative: true,
      },
    ],
  },

  // ── 8. Pakistan → USA ───────────────────────────────────────────────────────
  'pakistan→usa': {
    source_status: 'verified',
    sources: [
      {
        type: 'embassy',
        label: 'U.S. Embassy & Consulates in Pakistan — Visa Services',
        url: 'https://pk.usembassy.gov/visas/',
        verified_at: '2026-06-02',
        is_authoritative: true,
      },
      {
        type: 'mofa',
        label: 'U.S. Department of State — Travel to Pakistan',
        url: 'https://travel.state.gov/content/travel/en/us-visas/Visa-Reciprocity-and-Civil-Documents-by-Country/Pakistan.html',
        verified_at: '2026-06-02',
        is_authoritative: true,
      },
    ],
  },

  // ── 9. Pakistan → China ─────────────────────────────────────────────────────
  'pakistan→china': {
    source_status: 'verified',
    sources: [
      {
        type: 'evisa_portal',
        label: 'Chinese Visa Application Service Center — Islamabad',
        url: 'https://www.visaforchina.cn/ISB3_EN/',
        verified_at: '2026-06-02',
        is_authoritative: true,
      },
      {
        type: 'evisa_portal',
        label: 'Chinese Visa Application Service Center — Karachi',
        url: 'https://www.visaforchina.cn/KHI3_EN/',
        verified_at: '2026-06-02',
        is_authoritative: true,
      },
    ],
  },

  // ── 10. Pakistan → Singapore ────────────────────────────────────────────────
  'pakistan→singapore': {
    source_status: 'verified',
    sources: [
      {
        type: 'mofa',
        label: 'Singapore ICA — Visa Requirements for Pakistan',
        url: 'https://www.ica.gov.sg/enter-transit-depart/entering-singapore/visa_requirements/visa-detail-page/pakistan',
        verified_at: '2026-06-02',
        is_authoritative: true,
      },
      {
        type: 'mofa',
        label: 'Singapore Ministry of Foreign Affairs — Check if You Need a Visa',
        url: 'https://www.mfa.gov.sg/visiting-singapore/check-if-you-need-a-singapore-visa/',
        verified_at: '2026-06-02',
        is_authoritative: true,
      },
    ],
  },

  // ── 11. Pakistan → Indonesia ────────────────────────────────────────────────
  'pakistan→indonesia': {
    source_status: 'verified',
    sources: [
      {
        type: 'evisa_portal',
        label: 'Indonesia Official eVisa — Directorate General of Immigration',
        url: 'https://evisa.imigrasi.go.id/',
        verified_at: '2026-06-02',
        is_authoritative: true,
      },
      {
        type: 'mofa',
        label: 'Direktorat Jenderal Imigrasi Indonesia',
        url: 'https://www.imigrasi.go.id/',
        verified_at: '2026-06-02',
        is_authoritative: true,
      },
    ],
  },

  // ── 12. Pakistan → Sri Lanka ────────────────────────────────────────────────
  'pakistan→sri lanka': {
    source_status: 'verified',
    sources: [
      {
        type: 'evisa_portal',
        label: 'Sri Lanka ETA — Official Online Visa Application',
        url: 'https://eta.gov.lk/slvisa/',
        verified_at: '2026-06-02',
        is_authoritative: true,
      },
    ],
  },

  // ── 13. Pakistan → Maldives ─────────────────────────────────────────────────
  'pakistan→maldives': {
    source_status: 'verified',
    sources: [
      {
        type: 'mofa',
        label: 'Maldives Immigration — Tourist Visa (On Arrival)',
        url: 'https://www.immigration.gov.mv/visa/tourist-visa',
        verified_at: '2026-06-02',
        is_authoritative: true,
      },
      {
        type: 'evisa_portal',
        label: 'IMUGA — Maldives Traveller Declaration Portal',
        url: 'https://imuga.immigration.gov.mv/',
        verified_at: '2026-06-02',
        is_authoritative: true,
      },
    ],
  },

  // ── 14. Pakistan → Qatar ────────────────────────────────────────────────────
  'pakistan→qatar': {
    source_status: 'verified',
    sources: [
      {
        type: 'mofa',
        label: 'Qatar Ministry of Interior — Visa Services',
        url: 'https://portal.moi.gov.qa/qatarvisas/',
        verified_at: '2026-06-02',
        is_authoritative: true,
      },
    ],
  },

  // ── 15. Pakistan → Oman ─────────────────────────────────────────────────────
  'pakistan→oman': {
    source_status: 'verified',
    sources: [
      {
        type: 'evisa_portal',
        label: 'Royal Oman Police — Official eVisa Portal',
        url: 'https://evisa.rop.gov.om/',
        verified_at: '2026-06-02',
        is_authoritative: true,
      },
      {
        type: 'mofa',
        label: 'Royal Oman Police — Visa Types',
        url: 'https://www.rop.gov.om/english/Visas.aspx',
        verified_at: '2026-06-02',
        is_authoritative: true,
      },
    ],
  },

  // ── 16. Pakistan → Azerbaijan ───────────────────────────────────────────────
  'pakistan→azerbaijan': {
    source_status: 'verified',
    sources: [
      {
        type: 'evisa_portal',
        label: 'Republic of Azerbaijan — Official ASAN eVisa Portal',
        url: 'https://evisa.gov.az/en/',
        verified_at: '2026-06-02',
        is_authoritative: true,
      },
    ],
  },

  // ── 17. Pakistan → Georgia ──────────────────────────────────────────────────
  'pakistan→georgia': {
    source_status: 'verified',
    sources: [
      {
        type: 'evisa_portal',
        label: 'Georgia — Official eVisa Portal',
        url: 'https://www.evisa.gov.ge/GeoVisa/en/VisaApp',
        verified_at: '2026-06-02',
        is_authoritative: true,
      },
    ],
  },

  // ── 18. Pakistan → Japan ────────────────────────────────────────────────────
  'pakistan→japan': {
    source_status: 'verified',
    sources: [
      {
        type: 'mofa',
        label: 'Japan Ministry of Foreign Affairs — Visa Information',
        url: 'https://www.mofa.go.jp/j_info/visit/visa/index.html',
        verified_at: '2026-06-02',
        is_authoritative: true,
      },
      {
        type: 'embassy',
        label: 'Embassy of Japan in Pakistan',
        url: 'https://www.pk.emb-japan.go.jp/itprtop_en/index.html',
        verified_at: '2026-06-02',
        is_authoritative: true,
      },
    ],
  },

  // ── 19. Pakistan → South Korea ──────────────────────────────────────────────
  'pakistan→south korea': {
    source_status: 'verified',
    sources: [
      {
        type: 'embassy',
        label: 'Embassy of the Republic of Korea in Pakistan — Visa Requirements',
        url: 'https://overseas.mofa.go.kr/pk-en/wpge/m_3159/contents.do',
        verified_at: '2026-06-02',
        is_authoritative: true,
      },
      {
        type: 'evisa_portal',
        label: 'Korea Immigration Service — Visa Online (Hi Korea)',
        url: 'https://www.hikorea.go.kr/',
        verified_at: '2026-06-02',
        is_authoritative: false,
      },
    ],
  },

  // ── 20. Pakistan → Nepal ────────────────────────────────────────────────────
  'pakistan→nepal': {
    source_status: 'verified',
    sources: [
      {
        type: 'mofa',
        label: 'Nepal Department of Immigration — Tourist Visa',
        url: 'https://www.immigration.gov.np/en/page/tourist-visa',
        verified_at: '2026-06-02',
        is_authoritative: true,
      },
      {
        type: 'evisa_portal',
        label: 'Nepal Immigration — Online Visa Application',
        url: 'https://nepaliport.immigration.gov.np/onlinevisa-mission/application',
        verified_at: '2026-06-02',
        is_authoritative: true,
      },
    ],
  },
}

/**
 * Look up official sources for a given route.
 * Returns null if no sources are available (→ show pending_verification badge).
 */
export function getOfficialSources(
  passportName: string,
  destinationName: string,
): RouteSourceData {
  const key = `${passportName.toLowerCase()}→${destinationName.toLowerCase()}`
  return OFFICIAL_SOURCES[key] ?? { source_status: 'pending_verification', sources: [] }
}
