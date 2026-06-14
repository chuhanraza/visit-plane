# TODO — Interview Question Bank (remaining toward 50/country)

Close-loops sprint shipped **30 questions per country** (US 31), 211 total, all
schema fields populated and sourced from official government pages. Remaining work
to reach the 50/country target from the brief:

## Per-country gap to 50 (+20 each, ~+19 US)
- US (B1/B2 + F1 + H1B): deepen to 50 — add Section 214(b) intent variants,
  first-time-visitor scenarios, past-travel-history probes, and dedicated F-1 and
  H-1B subsets (currently US is mostly B1/B2-weighted).
- UK: +20 — add Student and Skilled Worker depth (currently mostly Standard Visitor).
- Canada: +20 — add Study Permit and Work Permit depth.
- Australia: +20 — add Student (500) depth and Business Visitor stream.
- Germany/Schengen: +20 — add Student depth and family-visit (Verpflichtungserklärung) cases.
- UAE: +20 — add relative-sponsored vs. tourist-agency-sponsored variants and
  long-stay (60/90-day) nuances.
- Japan: +20 — add inviter/guarantor document scenarios and eVISA-specific items.

## Notes
- Keep `QUALITY OVER SPEED`: every new entry must populate all fields and cite an
  official `source_url` (travel.state.gov, gov.uk, canada.ca, immi.homeaffairs.gov.au,
  auswaertiges-amt.de, u.ae/icp.gov.ae, mofa.go.jp).
- IDs added this sprint use the `cl-<country>-NN` prefix to avoid collisions.
- Accessors (`getQuestions`, `buildMockSet`, `countByCategory`) are volume-agnostic,
  so adding more entries needs no code changes.
