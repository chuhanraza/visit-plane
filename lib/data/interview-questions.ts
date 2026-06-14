// ── VisitPlane Interview Question Bank ───────────────────────────────────────
// Pre-seeded, structured visa-interview questions. AI (Gemini) is used only to
// SCORE user answers (see /api/interview/*), never to generate this bank.
//
// This is a growing foundation: US B1/B2 is seeded comprehensively across every
// category; UK and Canada have starter sets. Add more entries over time to reach
// ~50 per country — the accessor functions below work regardless of volume.

export type QuestionCategory =
  | 'personal'
  | 'purpose'
  | 'financial'
  | 'ties'
  | 'trip_details'
  | 'post_travel'
  | 'red_flag'

export interface InterviewQuestion {
  id: string
  country_iso: string
  visa_types: string[]
  category: QuestionCategory
  question: string
  why_asked: string
  strong_answer_pattern: string
  weak_answer_pattern: string
  pro_tip: string
  keywords_to_use: string[]
  keywords_to_avoid: string[]
  difficulty: 1 | 2 | 3
  source_url?: string
}

// ── Category display metadata ────────────────────────────────────────────────
export const CATEGORY_META: Record<QuestionCategory, { label: string; icon: string }> = {
  personal: { label: 'Personal', icon: '👤' },
  purpose: { label: 'Purpose', icon: '🎯' },
  financial: { label: 'Financial', icon: '💰' },
  ties: { label: 'Ties to Home', icon: '🏠' },
  trip_details: { label: 'Trip Details', icon: '✈️' },
  post_travel: { label: 'After Travel', icon: '🔁' },
  red_flag: { label: 'Red-Flag Avoidance', icon: '🚩' },
}

// ── Country + visa-type metadata (drives selectors and routing) ───────────────
export interface InterviewCountry {
  iso: string
  name: string
  flag: string
  slug: string
  visa_types: { code: string; label: string }[]
}

export const INTERVIEW_COUNTRIES: InterviewCountry[] = [
  {
    iso: 'US', name: 'United States', flag: '🇺🇸', slug: 'us',
    visa_types: [
      { code: 'B1B2', label: 'B1/B2 Tourist / Business' },
      { code: 'F1', label: 'F-1 Student' },
      { code: 'H1B', label: 'H-1B Work' },
    ],
  },
  {
    iso: 'GB', name: 'United Kingdom', flag: '🇬🇧', slug: 'uk',
    visa_types: [
      { code: 'VISITOR', label: 'Standard Visitor' },
      { code: 'STUDENT', label: 'Student' },
      { code: 'SKILLED', label: 'Skilled Worker' },
    ],
  },
  {
    iso: 'CA', name: 'Canada', flag: '🇨🇦', slug: 'canada',
    visa_types: [
      { code: 'TRV', label: 'Visitor (TRV)' },
      { code: 'STUDY', label: 'Study Permit' },
      { code: 'WORK', label: 'Work Permit' },
    ],
  },
  {
    iso: 'AU', name: 'Australia', flag: '🇦🇺', slug: 'australia',
    visa_types: [
      { code: 'VISITOR', label: 'Visitor (600)' },
      { code: 'STUDENT', label: 'Student (500)' },
    ],
  },
  {
    iso: 'DE', name: 'Germany (Schengen)', flag: '🇩🇪', slug: 'germany',
    visa_types: [
      { code: 'SCHENGEN', label: 'Schengen Short-Stay' },
      { code: 'STUDENT', label: 'Student' },
    ],
  },
  {
    iso: 'AE', name: 'United Arab Emirates', flag: '🇦🇪', slug: 'uae',
    visa_types: [{ code: 'TOURIST', label: 'Tourist' }],
  },
  {
    iso: 'JP', name: 'Japan', flag: '🇯🇵', slug: 'japan',
    visa_types: [{ code: 'TOURIST', label: 'Tourist' }],
  },
]

// ── The question bank ────────────────────────────────────────────────────────
export const QUESTION_BANK: InterviewQuestion[] = [
  // ═══════════════ UNITED STATES — B1/B2 ═══════════════
  {
    id: 'us-b1b2-purpose-01', country_iso: 'US', visa_types: ['B1B2'], category: 'purpose',
    question: 'Why do you want to visit the United States?',
    why_asked: 'Officers test whether your trip purpose is specific and credible. Vague answers trigger Section 214(b) concerns about non-immigrant intent.',
    strong_answer_pattern: 'I am visiting my brother in Houston for two weeks. He recently had his first child and I want to see my nephew. I will stay with him for the trip and return on the 20th.',
    weak_answer_pattern: 'I want to see America. / I just want to travel. / I want a vacation.',
    pro_tip: 'Name a specific place, person, or event. Vague answers signal weak ties or overstay risk.',
    keywords_to_use: ['specific city', 'specific person', 'specific dates', 'return date'],
    keywords_to_avoid: ['settle', 'find work', 'stay forever', 'might stay'],
    difficulty: 1,
    source_url: 'https://travel.state.gov/content/travel/en/us-visas/tourism-visit/visitor.html',
  },
  {
    id: 'us-b1b2-purpose-02', country_iso: 'US', visa_types: ['B1B2'], category: 'purpose',
    question: 'Why do you want to travel now, at this particular time?',
    why_asked: 'Officers check that there is a genuine, time-bound reason for the trip rather than an open-ended plan to relocate.',
    strong_answer_pattern: 'My sister graduates in May and I want to attend the ceremony, then travel for a week before returning to work.',
    weak_answer_pattern: 'No particular reason, I just have free time now.',
    pro_tip: 'Tie the timing to a concrete event or your approved leave dates.',
    keywords_to_use: ['event', 'graduation', 'approved leave', 'specific month'],
    keywords_to_avoid: ['whenever', 'no reason', 'open-ended'],
    difficulty: 2,
  },
  {
    id: 'us-b1b2-personal-01', country_iso: 'US', visa_types: ['B1B2'], category: 'personal',
    question: 'What do you do for a living?',
    why_asked: 'Your job is a primary tie to home. Officers gauge whether you have a stable reason to return.',
    strong_answer_pattern: 'I am a senior accountant at Khan & Co. in Lahore. I have worked there six years and have approved leave for this trip.',
    weak_answer_pattern: 'I am between jobs. / I do a bit of everything.',
    pro_tip: 'State role, employer, tenure, and that your leave is approved. Stability signals return.',
    keywords_to_use: ['job title', 'employer name', 'years employed', 'approved leave'],
    keywords_to_avoid: ['unemployed', 'looking for work', 'freelance gigs'],
    difficulty: 1,
  },
  {
    id: 'us-b1b2-personal-02', country_iso: 'US', visa_types: ['B1B2'], category: 'personal',
    question: 'Are you married? Do you have children?',
    why_asked: 'Family ties at home are strong evidence you intend to return.',
    strong_answer_pattern: 'Yes, I am married and have two children in school here. They are staying home while I travel.',
    weak_answer_pattern: 'No family, I am completely free to go anywhere.',
    pro_tip: 'If you have dependents staying home, say so — it is a powerful tie.',
    keywords_to_use: ['spouse', 'children', 'staying home', 'school here'],
    keywords_to_avoid: ['no ties', 'free to relocate'],
    difficulty: 1,
  },
  {
    id: 'us-b1b2-financial-01', country_iso: 'US', visa_types: ['B1B2'], category: 'financial',
    question: 'How will you pay for this trip?',
    why_asked: 'Officers confirm you can fund the trip without working illegally in the US.',
    strong_answer_pattern: 'I am self-funding from my savings. I have around $8,000 set aside, and my bank statements show consistent balances over the last six months.',
    weak_answer_pattern: 'A friend in the US is paying for everything. / I am not sure of the amount.',
    pro_tip: 'Self-funding shows independence. Know your numbers; avoid sudden large deposits.',
    keywords_to_use: ['savings', 'specific amount', 'bank statements', 'self-funded'],
    keywords_to_avoid: ['not sure', 'someone else pays', 'borrowed'],
    difficulty: 2,
  },
  {
    id: 'us-b1b2-financial-02', country_iso: 'US', visa_types: ['B1B2'], category: 'financial',
    question: 'What is your monthly income?',
    why_asked: 'Income demonstrates you can afford the trip and have an economic anchor at home.',
    strong_answer_pattern: 'I earn about $1,800 a month after tax, and I have additional rental income from a property I own.',
    weak_answer_pattern: 'I do not really track it. / It varies a lot.',
    pro_tip: 'Give a clear figure. Mention any additional income or assets.',
    keywords_to_use: ['specific salary', 'rental income', 'assets'],
    keywords_to_avoid: ['varies', 'cash only', 'no fixed income'],
    difficulty: 2,
  },
  {
    id: 'us-b1b2-ties-01', country_iso: 'US', visa_types: ['B1B2'], category: 'ties',
    question: 'What ties do you have to your home country?',
    why_asked: 'The single most important factor. Officers look for concrete reasons you will return.',
    strong_answer_pattern: 'I own my apartment, I have a permanent job I have held for six years, and my immediate family lives here. I must return for a work project in August.',
    weak_answer_pattern: 'Not many, honestly. I am quite free. I like it better abroad.',
    pro_tip: 'List property, job, family, and commitments. The more concrete, the stronger.',
    keywords_to_use: ['own property', 'permanent job', 'family', 'commitment to return'],
    keywords_to_avoid: ['no ties', 'prefer abroad', 'nothing keeping me'],
    difficulty: 1,
    source_url: 'https://travel.state.gov/content/travel/en/us-visas/tourism-visit/visitor.html',
  },
  {
    id: 'us-b1b2-ties-02', country_iso: 'US', visa_types: ['B1B2'], category: 'ties',
    question: 'Will you return to your home country?',
    why_asked: 'Directly probes immigrant intent. Hesitation or conditional answers are red flags.',
    strong_answer_pattern: 'Yes, absolutely. My job, my home, and my children are here. My return flight is booked for the 20th.',
    weak_answer_pattern: 'I might stay if I find a good opportunity. / We will see how it goes.',
    pro_tip: 'Answer with a confident "yes" and back it with concrete ties and a booked return.',
    keywords_to_use: ['yes', 'return flight booked', 'job', 'family'],
    keywords_to_avoid: ['might', 'maybe', 'if I find', 'we will see'],
    difficulty: 1,
  },
  {
    id: 'us-b1b2-trip-01', country_iso: 'US', visa_types: ['B1B2'], category: 'trip_details',
    question: 'How long do you plan to stay and where?',
    why_asked: 'A clear, bounded itinerary signals a genuine short visit, not an open-ended stay.',
    strong_answer_pattern: 'Two weeks. Five days in New York, then a week with my brother in Houston, returning on the 20th.',
    weak_answer_pattern: 'As long as possible. / Until my visa runs out.',
    pro_tip: 'Give a specific duration and a rough route, plus your return date.',
    keywords_to_use: ['specific days', 'cities', 'return date'],
    keywords_to_avoid: ['as long as possible', 'until visa expires', 'not sure'],
    difficulty: 1,
  },
  {
    id: 'us-b1b2-trip-02', country_iso: 'US', visa_types: ['B1B2'], category: 'trip_details',
    question: 'Where will you stay?',
    why_asked: 'Confirms the trip is planned and you are accountable for your accommodation.',
    strong_answer_pattern: 'I have hotel bookings in New York and will stay with my brother in Houston. I can show the confirmations.',
    weak_answer_pattern: 'I will figure it out when I arrive.',
    pro_tip: 'Have confirmations ready; vagueness here undermines the whole application.',
    keywords_to_use: ['hotel booking', 'confirmation', 'host address'],
    keywords_to_avoid: ['not decided', 'figure it out there'],
    difficulty: 1,
  },
  {
    id: 'us-b1b2-posttravel-01', country_iso: 'US', visa_types: ['B1B2'], category: 'post_travel',
    question: 'What will you do when you come back?',
    why_asked: 'Forces you to articulate the life you are returning to — a strong return signal.',
    strong_answer_pattern: 'I return to my job on the 22nd and have a project deadline at the end of the month.',
    weak_answer_pattern: 'I have not really thought about it.',
    pro_tip: 'Name a concrete commitment waiting for you at home.',
    keywords_to_use: ['return to work', 'deadline', 'responsibility'],
    keywords_to_avoid: ['no plans', 'nothing specific'],
    difficulty: 2,
  },
  {
    id: 'us-b1b2-redflag-01', country_iso: 'US', visa_types: ['B1B2'], category: 'red_flag',
    question: 'Do you have relatives in the United States?',
    why_asked: 'Having close relatives is fine, but officers check it does not signal intent to immigrate.',
    strong_answer_pattern: 'Yes, my brother lives in Houston, but I am visiting briefly and returning to my job and family at home.',
    weak_answer_pattern: 'My whole family is there and I want to be with them.',
    pro_tip: 'Acknowledge relatives honestly, then immediately reaffirm your intent to return.',
    keywords_to_use: ['visiting briefly', 'returning', 'job at home'],
    keywords_to_avoid: ['join them', 'be with them permanently', 'whole family there'],
    difficulty: 2,
  },
  {
    id: 'us-b1b2-redflag-02', country_iso: 'US', visa_types: ['B1B2'], category: 'red_flag',
    question: 'Have you ever overstayed a visa anywhere?',
    why_asked: 'Prior immigration violations strongly predict future risk; honesty is essential.',
    strong_answer_pattern: 'No, I have always returned within my authorized stay. I visited the UK in 2023 and left on time.',
    weak_answer_pattern: 'Just once, a few extra days, but it was no big deal.',
    pro_tip: 'A clean record is a major asset — state it clearly. Never minimise a past violation.',
    keywords_to_use: ['always returned on time', 'clean record', 'left on time'],
    keywords_to_avoid: ['a few extra days', 'no big deal', 'overstayed but'],
    difficulty: 2,
  },

  // ═══════════════ UNITED STATES — F1 (Student) ═══════════════
  {
    id: 'us-f1-purpose-01', country_iso: 'US', visa_types: ['F1'], category: 'purpose',
    question: 'Why do you want to study in the United States?',
    why_asked: 'Officers test genuine academic intent and that the US program fits your goals.',
    strong_answer_pattern: 'My program at Purdue is ranked top-10 for chemical engineering and has research labs my home universities lack. It directly supports my plan to work in petrochemicals back home.',
    weak_answer_pattern: 'Education back home is bad. / It is easier to get a job there.',
    pro_tip: 'Frame it around the US program’s strengths and your career plan at home.',
    keywords_to_use: ['specific program', 'ranking', 'research', 'career plan at home'],
    keywords_to_avoid: ['bad back home', 'stay and work', 'green card'],
    difficulty: 2,
  },
  {
    id: 'us-f1-financial-01', country_iso: 'US', visa_types: ['F1'], category: 'financial',
    question: 'How will you fund your studies?',
    why_asked: 'You must prove full funding for tuition and living costs without unauthorized work.',
    strong_answer_pattern: 'My father is sponsoring me. We have a dedicated education fund of $60,000 plus his annual income, shown on the I-20 and bank statements.',
    weak_answer_pattern: 'I will work part-time to pay tuition.',
    pro_tip: 'Show clear, sufficient funding. Relying on US work is a red flag for F-1.',
    keywords_to_use: ['sponsor', 'education fund', 'I-20 amount', 'scholarship'],
    keywords_to_avoid: ['work to pay tuition', 'find a job there'],
    difficulty: 2,
  },
  {
    id: 'us-f1-posttravel-01', country_iso: 'US', visa_types: ['F1'], category: 'post_travel',
    question: 'What are your plans after graduation?',
    why_asked: 'F-1 requires non-immigrant intent — a credible plan to return home.',
    strong_answer_pattern: 'I plan to return to Pakistan and join my family’s manufacturing business, where this degree is directly needed.',
    weak_answer_pattern: 'I hope to find a job and settle in the US.',
    pro_tip: 'Emphasise returning home; mention OPT only as short, optional training if at all.',
    keywords_to_use: ['return home', 'family business', 'skills needed at home'],
    keywords_to_avoid: ['settle', 'stay permanently', 'green card'],
    difficulty: 3,
  },

  // ═══════════════ UNITED KINGDOM — Standard Visitor ═══════════════
  {
    id: 'gb-visitor-purpose-01', country_iso: 'GB', visa_types: ['VISITOR'], category: 'purpose',
    question: 'Why do you want to visit the UK?',
    why_asked: 'UK officers assess the "genuine visitor" requirement — a real, temporary purpose.',
    strong_answer_pattern: 'I am visiting for 10 days to see the British Museum and the Scottish Highlands. I have a day-by-day itinerary and booked accommodation.',
    weak_answer_pattern: 'I heard there are good job opportunities there.',
    pro_tip: 'Name specific attractions and show a planned, time-limited itinerary.',
    keywords_to_use: ['specific attractions', 'itinerary', 'booked accommodation', '10 days'],
    keywords_to_avoid: ['job', 'work', 'settle'],
    difficulty: 1,
    source_url: 'https://www.gov.uk/standard-visitor',
  },
  {
    id: 'gb-visitor-financial-01', country_iso: 'GB', visa_types: ['VISITOR'], category: 'financial',
    question: 'How will you fund your trip to the UK?',
    why_asked: 'You must show you can cover the trip without recourse to public funds or illegal work.',
    strong_answer_pattern: 'I have £4,000 saved for this trip plus my monthly salary. My six-month bank statements show a consistent balance.',
    weak_answer_pattern: 'My friend in the UK will cover most things.',
    pro_tip: 'Show six months of consistent statements; avoid unexplained large deposits.',
    keywords_to_use: ['savings', 'bank statements', 'consistent balance', 'self-funded'],
    keywords_to_avoid: ['friend pays', 'borrowed', 'public funds'],
    difficulty: 2,
  },
  {
    id: 'gb-visitor-ties-01', country_iso: 'GB', visa_types: ['VISITOR'], category: 'ties',
    question: 'What will make you return to your home country?',
    why_asked: 'Central to the genuine-visitor test: officers need evidence you will leave the UK.',
    strong_answer_pattern: 'My permanent job, my home, and my children’s school are all here. My return flight is booked and I resume work on the 18th.',
    weak_answer_pattern: 'Nothing really, I am flexible about where I live.',
    pro_tip: 'List concrete ties and a booked return; flexibility about living abroad is a red flag.',
    keywords_to_use: ['permanent job', 'home', 'children school', 'return flight'],
    keywords_to_avoid: ['flexible', 'might stay', 'nothing keeping me'],
    difficulty: 2,
  },

  // ═══════════════ CANADA — Visitor (TRV) ═══════════════
  {
    id: 'ca-trv-purpose-01', country_iso: 'CA', visa_types: ['TRV'], category: 'purpose',
    question: 'What is the main purpose of your visit to Canada?',
    why_asked: 'Officers verify a genuine, temporary visit consistent with your stated plans.',
    strong_answer_pattern: 'Tourism for 14 days — Niagara Falls, Toronto, and Vancouver. I have an itinerary and return flight booked.',
    weak_answer_pattern: 'I want to explore opportunities there.',
    pro_tip: 'Mention specific Canadian landmarks and a bounded itinerary.',
    keywords_to_use: ['tourism', 'specific landmarks', 'itinerary', 'return flight'],
    keywords_to_avoid: ['opportunities', 'work', 'settle'],
    difficulty: 1,
    source_url: 'https://www.canada.ca/en/immigration-refugees-citizenship.html',
  },
  {
    id: 'ca-trv-ties-01', country_iso: 'CA', visa_types: ['TRV'], category: 'ties',
    question: 'What ties do you have to your home country?',
    why_asked: 'Weak ties are the most common TRV refusal reason; officers need strong evidence you will return.',
    strong_answer_pattern: 'I have a permanent job, I own property, and my immediate family lives here. I must return to work after two weeks.',
    weak_answer_pattern: 'I do not have many ties, I am quite free.',
    pro_tip: 'Property ownership and stable employment are the strongest ties to cite.',
    keywords_to_use: ['permanent job', 'own property', 'family', 'must return'],
    keywords_to_avoid: ['no ties', 'free', 'prefer Canada'],
    difficulty: 2,
  },
  {
    id: 'ca-trv-financial-01', country_iso: 'CA', visa_types: ['TRV'], category: 'financial',
    question: 'How much money are you bringing for the trip?',
    why_asked: 'Officers confirm you can support yourself for the visit.',
    strong_answer_pattern: 'I have budgeted about CAD 3,000 for two weeks, covering flights, hotels, and activities, shown in my bank statements.',
    weak_answer_pattern: 'Not sure, just enough to get by.',
    pro_tip: 'Give a concrete budget aligned to your trip length; Canada suggests ~CAD 100/day.',
    keywords_to_use: ['specific budget', 'bank statements', 'covers trip'],
    keywords_to_avoid: ['not sure', 'get by', 'minimal'],
    difficulty: 2,
  },

  // ── more US B1/B2 ──
  {
    id: 'us-b1b2-personal-03', country_iso: 'US', visa_types: ['B1B2'], category: 'personal',
    question: 'How long have you been at your current job?',
    why_asked: 'Job tenure shows stability and a continuing reason to return home.',
    strong_answer_pattern: 'Six years at the same firm. I was promoted to team lead last year.',
    weak_answer_pattern: 'I just started a few weeks ago. / I change jobs often.',
    pro_tip: 'Longer tenure reads as stability. Mention promotions or responsibilities.',
    keywords_to_use: ['years', 'promotion', 'responsibility'],
    keywords_to_avoid: ['just started', 'temporary', 'between jobs'],
    difficulty: 1,
  },
  {
    id: 'us-b1b2-ties-03', country_iso: 'US', visa_types: ['B1B2'], category: 'ties',
    question: 'Do you own property or have other assets at home?',
    why_asked: 'Property and assets are tangible ties that anchor you to your home country.',
    strong_answer_pattern: 'Yes, I own my apartment and a small plot of land, and I have savings and a car.',
    weak_answer_pattern: 'No, I rent and don’t own much.',
    pro_tip: 'List anything you own. If you rent, emphasise job, family, and savings instead.',
    keywords_to_use: ['own apartment', 'land', 'savings', 'car'],
    keywords_to_avoid: ['nothing', 'don’t own anything'],
    difficulty: 2,
  },
  {
    id: 'us-b1b2-trip-03', country_iso: 'US', visa_types: ['B1B2'], category: 'trip_details',
    question: 'Have you booked your flights?',
    why_asked: 'A round-trip booking signals a planned, time-bound visit and intent to return.',
    strong_answer_pattern: 'Yes, I have a round-trip ticket departing the 5th and returning on the 20th.',
    weak_answer_pattern: 'Not yet, I’ll book after I get the visa and see how it goes.',
    pro_tip: 'A confirmed return flight is one of the strongest signals of intent to leave on time.',
    keywords_to_use: ['round-trip', 'return ticket', 'specific dates'],
    keywords_to_avoid: ['one-way', 'not booked', 'see how it goes'],
    difficulty: 1,
  },
  {
    id: 'us-b1b2-redflag-03', country_iso: 'US', visa_types: ['B1B2'], category: 'red_flag',
    question: 'Do you intend to work while in the United States?',
    why_asked: 'B1/B2 prohibits employment. Any hint of working is an immediate refusal.',
    strong_answer_pattern: 'No. This is purely a tourist visit and I have my job waiting at home.',
    weak_answer_pattern: 'Maybe some freelance work to cover costs. / If I find something.',
    pro_tip: 'Be unambiguous: no work of any kind. Reaffirm the trip is tourism/business meetings only.',
    keywords_to_use: ['no', 'tourism only', 'job at home'],
    keywords_to_avoid: ['freelance', 'side work', 'earn', 'if I find something'],
    difficulty: 2,
  },

  // ── more UK Standard Visitor ──
  {
    id: 'gb-visitor-personal-01', country_iso: 'GB', visa_types: ['VISITOR'], category: 'personal',
    question: 'What do you do for work back home?',
    why_asked: 'Stable employment is a core part of the genuine-visitor assessment.',
    strong_answer_pattern: 'I’m a project manager at an IT firm; I’ve been there five years and have approved leave.',
    weak_answer_pattern: 'I’m currently looking for work.',
    pro_tip: 'State role, employer, tenure, and approved leave — it shows you’ll return.',
    keywords_to_use: ['role', 'employer', 'years', 'approved leave'],
    keywords_to_avoid: ['unemployed', 'looking for work'],
    difficulty: 1,
  },
  {
    id: 'gb-visitor-trip-01', country_iso: 'GB', visa_types: ['VISITOR'], category: 'trip_details',
    question: 'Where will you stay during your visit?',
    why_asked: 'Confirmed accommodation shows the visit is planned and accountable.',
    strong_answer_pattern: 'I’ve booked a hotel in London for five nights, then an Airbnb in Edinburgh — I have both confirmations.',
    weak_answer_pattern: 'I’ll sort it out when I arrive.',
    pro_tip: 'Have booking confirmations ready; vagueness undermines the application.',
    keywords_to_use: ['hotel booking', 'confirmation', 'nights'],
    keywords_to_avoid: ['not decided', 'sort it out there'],
    difficulty: 1,
  },
  {
    id: 'gb-visitor-redflag-01', country_iso: 'GB', visa_types: ['VISITOR'], category: 'red_flag',
    question: 'Do you have family or friends living in the UK?',
    why_asked: 'Relatives are fine, but officers check it doesn’t indicate intent to stay.',
    strong_answer_pattern: 'A cousin lives in Manchester, but I’m staying in a hotel and returning to my job after 10 days.',
    weak_answer_pattern: 'Yes, and I’m hoping they can help me find work and settle.',
    pro_tip: 'Acknowledge relatives, then reaffirm your short, return-bound plan.',
    keywords_to_use: ['visiting briefly', 'hotel', 'returning'],
    keywords_to_avoid: ['settle', 'find work', 'stay with them long-term'],
    difficulty: 2,
  },

  // ── more Canada TRV ──
  {
    id: 'ca-trv-personal-01', country_iso: 'CA', visa_types: ['TRV'], category: 'personal',
    question: 'What do you do for a living?',
    why_asked: 'Employment is a key tie demonstrating you will return to your home country.',
    strong_answer_pattern: 'I run a small accounting practice with three employees; I’ll be back to manage it in two weeks.',
    weak_answer_pattern: 'I don’t have steady work right now.',
    pro_tip: 'Business ownership or stable employment are strong return signals — state them clearly.',
    keywords_to_use: ['business', 'employees', 'manage', 'return'],
    keywords_to_avoid: ['no steady work', 'unemployed'],
    difficulty: 1,
  },
  {
    id: 'ca-trv-posttravel-01', country_iso: 'CA', visa_types: ['TRV'], category: 'post_travel',
    question: 'What are you returning home to after the trip?',
    why_asked: 'Articulating what awaits you at home reinforces temporary intent.',
    strong_answer_pattern: 'My business, my family, and a contract that starts the week I get back.',
    weak_answer_pattern: 'Nothing fixed, I’m flexible.',
    pro_tip: 'Name a concrete commitment waiting at home.',
    keywords_to_use: ['business', 'family', 'contract', 'commitment'],
    keywords_to_avoid: ['nothing fixed', 'flexible', 'open'],
    difficulty: 2,
  },

  // ── Australia Visitor (600) ──
  {
    id: 'au-visitor-purpose-01', country_iso: 'AU', visa_types: ['VISITOR'], category: 'purpose',
    question: 'Are you a genuine temporary entrant?',
    why_asked: 'The Genuine Temporary Entrant (GTE) requirement is central to Australia’s visitor visa.',
    strong_answer_pattern: 'Yes. I’m visiting for three weeks of tourism and have strong ties — my job, home, and family — that I’m returning to.',
    weak_answer_pattern: 'I might extend my stay if I like it.',
    pro_tip: 'Emphasise GTE: temporary purpose plus strong home-country ties.',
    keywords_to_use: ['temporary', 'tourism', 'strong ties', 'returning'],
    keywords_to_avoid: ['extend', 'stay longer', 'settle'],
    difficulty: 2,
  },
  {
    id: 'au-visitor-ties-01', country_iso: 'AU', visa_types: ['VISITOR'], category: 'ties',
    question: 'What ties do you have to your home country?',
    why_asked: 'Strong ties underpin the GTE assessment and show you will depart.',
    strong_answer_pattern: 'A permanent job, a mortgage on my home, and my children in school here.',
    weak_answer_pattern: 'Not many — I’m quite free to move.',
    pro_tip: 'Property, employment, and dependents are the strongest ties to cite.',
    keywords_to_use: ['permanent job', 'mortgage', 'children', 'family'],
    keywords_to_avoid: ['free to move', 'no ties'],
    difficulty: 2,
  },
  {
    id: 'au-visitor-financial-01', country_iso: 'AU', visa_types: ['VISITOR'], category: 'financial',
    question: 'How will you fund your trip to Australia?',
    why_asked: 'Australia looks for genuine, consistent savings rather than sudden deposits.',
    strong_answer_pattern: 'I’ve saved about AUD 5,000 over the past year; my statements show a steady balance.',
    weak_answer_pattern: 'A large amount was just deposited last week to show funds.',
    pro_tip: 'Consistent savings history beats a recent lump sum, which raises questions.',
    keywords_to_use: ['consistent savings', 'statements', 'over the year'],
    keywords_to_avoid: ['just deposited', 'borrowed to show funds'],
    difficulty: 2,
  },

  // ── Germany / Schengen short-stay ──
  {
    id: 'de-schengen-purpose-01', country_iso: 'DE', visa_types: ['SCHENGEN'], category: 'purpose',
    question: 'Why do you want to visit Germany / the Schengen area?',
    why_asked: 'Officers confirm a genuine tourism or business purpose, not job-seeking.',
    strong_answer_pattern: 'I’m spending eight days seeing Berlin and Munich — museums, the Brandenburg Gate, and Neuschwanstein. Full itinerary and hotels booked.',
    weak_answer_pattern: 'Germany has good job opportunities I want to explore.',
    pro_tip: 'Show cultural/tourism intent with specifics. Never mention job-seeking.',
    keywords_to_use: ['specific cities', 'itinerary', 'hotels booked'],
    keywords_to_avoid: ['job', 'work', 'opportunities'],
    difficulty: 1,
  },
  {
    id: 'de-schengen-financial-01', country_iso: 'DE', visa_types: ['SCHENGEN'], category: 'financial',
    question: 'Do you have travel insurance for the Schengen zone?',
    why_asked: 'Schengen visas require travel insurance with at least €30,000 medical coverage — it is mandatory.',
    strong_answer_pattern: 'Yes, I have Schengen-wide travel insurance with €30,000 medical coverage for the full trip — here is the certificate.',
    weak_answer_pattern: 'I have some basic insurance, I think it covers Europe.',
    pro_tip: 'The €30,000 minimum is non-negotiable. Carry the certificate.',
    keywords_to_use: ['€30,000', 'Schengen-wide', 'certificate'],
    keywords_to_avoid: ['basic', 'I think', 'not sure'],
    difficulty: 1,
  },
  {
    id: 'de-schengen-redflag-01', country_iso: 'DE', visa_types: ['SCHENGEN'], category: 'red_flag',
    question: 'Have you ever overstayed in the Schengen area before?',
    why_asked: 'Prior overstays heavily affect future Schengen decisions; honesty is essential.',
    strong_answer_pattern: 'No. I visited France in 2023 and left well within my authorised stay.',
    weak_answer_pattern: 'Once, by a few days, but it wasn’t a big deal.',
    pro_tip: 'A clean Schengen record is a strong asset — state it clearly; never minimise a past overstay.',
    keywords_to_use: ['left on time', 'within authorised stay', 'clean record'],
    keywords_to_avoid: ['a few days over', 'not a big deal'],
    difficulty: 2,
  },

  // ── United Arab Emirates — Tourist ──
  {
    id: 'ae-tourist-purpose-01', country_iso: 'AE', visa_types: ['TOURIST'], category: 'purpose',
    question: 'What is the purpose of your visit to the UAE?',
    why_asked: 'Confirms a genuine tourist visit consistent with the visa type.',
    strong_answer_pattern: 'Tourism for one week — Dubai and Abu Dhabi. I have hotel bookings and a return flight.',
    weak_answer_pattern: 'I want to look for job opportunities in Dubai.',
    pro_tip: 'Keep it tourism-focused with concrete plans; never mention job-seeking.',
    keywords_to_use: ['tourism', 'Dubai', 'hotel booking', 'return flight'],
    keywords_to_avoid: ['job', 'work', 'opportunities'],
    difficulty: 1,
  },
  {
    id: 'ae-tourist-financial-01', country_iso: 'AE', visa_types: ['TOURIST'], category: 'financial',
    question: 'How will you fund your stay in the UAE?',
    why_asked: 'Officers confirm you can cover hotels and expenses for the visit.',
    strong_answer_pattern: 'I have around $3,000 saved for the trip, shown in my bank statements, covering hotels and expenses.',
    weak_answer_pattern: 'I’ll manage somehow once I’m there.',
    pro_tip: 'Give a clear figure backed by statements; the UAE is an expensive destination.',
    keywords_to_use: ['savings', 'bank statements', 'covers expenses'],
    keywords_to_avoid: ['manage somehow', 'not sure'],
    difficulty: 1,
  },
  {
    id: 'ae-tourist-ties-01', country_iso: 'AE', visa_types: ['TOURIST'], category: 'ties',
    question: 'What will make you return home after your visit?',
    why_asked: 'Even for tourist eVisas, ties reduce overstay concerns.',
    strong_answer_pattern: 'My job, my family, and my home are all back home, and I return to work right after the trip.',
    weak_answer_pattern: 'Nothing in particular, I’m flexible.',
    pro_tip: 'List job, family, and a booked return to show you’ll leave on time.',
    keywords_to_use: ['job', 'family', 'return to work', 'booked return'],
    keywords_to_avoid: ['flexible', 'nothing keeping me'],
    difficulty: 2,
  },
  {
    id: 'ae-tourist-trip-01', country_iso: 'AE', visa_types: ['TOURIST'], category: 'trip_details',
    question: 'Where will you stay in the UAE?',
    why_asked: 'Confirmed accommodation shows the trip is genuine and planned.',
    strong_answer_pattern: 'I’ve booked a hotel in Dubai Marina for six nights — here is the confirmation.',
    weak_answer_pattern: 'I’ll find something after I land.',
    pro_tip: 'Have your hotel confirmation ready; many UAE eVisas need proof of stay.',
    keywords_to_use: ['hotel booking', 'confirmation', 'nights'],
    keywords_to_avoid: ['not decided', 'after I land'],
    difficulty: 1,
  },

  // ── Japan — Tourist ──
  {
    id: 'jp-tourist-purpose-01', country_iso: 'JP', visa_types: ['TOURIST'], category: 'purpose',
    question: 'Why do you want to visit Japan?',
    why_asked: 'Japan’s tourist visa weighs a clear, planned sightseeing purpose.',
    strong_answer_pattern: 'A 10-day cultural trip — Tokyo, Kyoto, and Osaka — with a day-by-day itinerary and booked accommodation.',
    weak_answer_pattern: 'No firm plan, just want to look around.',
    pro_tip: 'A detailed day-by-day itinerary is highly valued for Japan visas.',
    keywords_to_use: ['itinerary', 'Tokyo', 'Kyoto', 'booked accommodation'],
    keywords_to_avoid: ['no plan', 'look around', 'work'],
    difficulty: 1,
  },
  {
    id: 'jp-tourist-financial-01', country_iso: 'JP', visa_types: ['TOURIST'], category: 'financial',
    question: 'How will you cover the cost of your trip to Japan?',
    why_asked: 'Japan requires proof of sufficient funds for the whole stay.',
    strong_answer_pattern: 'I’m self-funding from savings of about $4,000, with bank statements and my income tax certificate as proof.',
    weak_answer_pattern: 'A friend in Japan will pay for most of it.',
    pro_tip: 'Bank statements plus a tax certificate strengthen Japanese applications.',
    keywords_to_use: ['savings', 'bank statements', 'tax certificate', 'self-funded'],
    keywords_to_avoid: ['friend pays', 'not sure'],
    difficulty: 2,
  },
  {
    id: 'jp-tourist-ties-01', country_iso: 'JP', visa_types: ['TOURIST'], category: 'ties',
    question: 'What ties do you have that ensure you return home?',
    why_asked: 'Ties demonstrate you will leave Japan within the permitted stay.',
    strong_answer_pattern: 'A stable job I’ve held for years, my family, and property at home — I return to work after 10 days.',
    weak_answer_pattern: 'I don’t have strong ties, I’m open to staying longer.',
    pro_tip: 'Stable employment plus family and a booked return are the key signals.',
    keywords_to_use: ['stable job', 'family', 'property', 'return to work'],
    keywords_to_avoid: ['open to staying', 'no strong ties'],
    difficulty: 2,
  },

  // ── more US B1/B2 ──
  {
    id: 'us-b1b2-financial-03', country_iso: 'US', visa_types: ['B1B2'], category: 'financial',
    question: 'Who is paying for your trip?',
    why_asked: 'Clarifies the funding source and your financial independence.',
    strong_answer_pattern: 'I am paying for it myself from my own savings and salary.',
    weak_answer_pattern: 'Someone in the US is covering all my costs.',
    pro_tip: 'Self-funding is strongest. If sponsored, be ready to explain the relationship and their finances.',
    keywords_to_use: ['myself', 'own savings', 'salary'],
    keywords_to_avoid: ['someone else pays', 'sponsor I barely know'],
    difficulty: 1,
  },
  {
    id: 'us-b1b2-purpose-03', country_iso: 'US', visa_types: ['B1B2'], category: 'purpose',
    question: 'Is this your first time traveling abroad?',
    why_asked: 'Prior compliant travel history builds credibility for your intent to return.',
    strong_answer_pattern: 'No, I’ve travelled to the UK and UAE and returned on time each trip.',
    weak_answer_pattern: 'Yes, and I’m not sure how long I’ll stay.',
    pro_tip: 'Highlight prior trips where you returned on time. First-timers should stress strong ties.',
    keywords_to_use: ['previous travel', 'returned on time', 'visa history'],
    keywords_to_avoid: ['not sure how long', 'first time and unsure'],
    difficulty: 2,
  },

  // ── more UK / Canada ──
  {
    id: 'gb-visitor-posttravel-01', country_iso: 'GB', visa_types: ['VISITOR'], category: 'post_travel',
    question: 'When will you return to your home country?',
    why_asked: 'A definite return date supports the genuine-visitor requirement.',
    strong_answer_pattern: 'My return flight is on the 18th and I resume work the next day.',
    weak_answer_pattern: 'I’m not sure, it depends how it goes.',
    pro_tip: 'A booked return plus a work commitment is the strongest possible answer.',
    keywords_to_use: ['return flight', 'specific date', 'resume work'],
    keywords_to_avoid: ['not sure', 'depends', 'open'],
    difficulty: 1,
  },
  {
    id: 'ca-trv-trip-01', country_iso: 'CA', visa_types: ['TRV'], category: 'trip_details',
    question: 'How long will you stay in Canada and where?',
    why_asked: 'A bounded, specific plan signals a genuine temporary visit.',
    strong_answer_pattern: 'Two weeks — Toronto and Vancouver — returning on the 22nd. Hotels and flights are booked.',
    weak_answer_pattern: 'Maybe a month or two, I’ll see.',
    pro_tip: 'Specific duration, cities, and a booked return beat open-ended plans.',
    keywords_to_use: ['two weeks', 'cities', 'return date', 'booked'],
    keywords_to_avoid: ['a month or two', 'I’ll see'],
    difficulty: 1,
  },

  // ── batch 3: depth ──
  {
    id: 'us-b1b2-personal-04', country_iso: 'US', visa_types: ['B1B2'], category: 'personal',
    question: 'Are you traveling alone or with someone?',
    why_asked: 'Officers check the trip composition is consistent with your stated purpose and ties.',
    strong_answer_pattern: 'With my wife. Our children stay home with their grandparents and we return in two weeks.',
    weak_answer_pattern: 'Alone, and my whole family will join me later.',
    pro_tip: 'If family stays home, mention it — it strengthens your intent to return.',
    keywords_to_use: ['with spouse', 'children stay home', 'return together'],
    keywords_to_avoid: ['family will join', 'one by one'],
    difficulty: 2,
  },
  {
    id: 'us-b1b2-trip-04', country_iso: 'US', visa_types: ['B1B2'], category: 'trip_details',
    question: 'Do you have a detailed itinerary?',
    why_asked: 'A concrete plan signals a genuine, time-bound visit.',
    strong_answer_pattern: 'Yes — three days in New York, four with my brother in Houston, then home on the 20th.',
    weak_answer_pattern: 'Not really, I’ll decide there.',
    pro_tip: 'Even a rough day-by-day plan beats "I’ll decide there".',
    keywords_to_use: ['itinerary', 'days', 'cities', 'return'],
    keywords_to_avoid: ['decide there', 'no plan'],
    difficulty: 1,
  },
  {
    id: 'us-b1b2-ties-04', country_iso: 'US', visa_types: ['B1B2'], category: 'ties',
    question: 'Who will handle your work and responsibilities while you are away?',
    why_asked: 'Shows your life and obligations continue at home, pulling you back.',
    strong_answer_pattern: 'My deputy covers my role for two weeks; I’ve scheduled my return around a project I’m leading.',
    weak_answer_pattern: 'Nothing really depends on me, I can be away indefinitely.',
    pro_tip: 'Demonstrating that responsibilities await you is a strong return signal.',
    keywords_to_use: ['deputy covers', 'project', 'scheduled return'],
    keywords_to_avoid: ['nothing depends on me', 'indefinitely'],
    difficulty: 3,
  },
  {
    id: 'gb-visitor-purpose-02', country_iso: 'GB', visa_types: ['VISITOR'], category: 'purpose',
    question: 'How many times have you travelled abroad before?',
    why_asked: 'A compliant travel history supports the genuine-visitor assessment.',
    strong_answer_pattern: 'I’ve visited the UAE and Turkey and returned on time both times — stamps are in my passport.',
    weak_answer_pattern: 'Never, and I’m not sure about the rules.',
    pro_tip: 'Prior compliant trips build trust; first-timers should lean on strong ties.',
    keywords_to_use: ['previous trips', 'returned on time', 'passport stamps'],
    keywords_to_avoid: ['unsure of rules', 'overstayed'],
    difficulty: 2,
  },
  {
    id: 'ca-trv-purpose-02', country_iso: 'CA', visa_types: ['TRV'], category: 'purpose',
    question: 'Why are you visiting Canada at this time?',
    why_asked: 'A time-bound reason supports a genuine temporary visit.',
    strong_answer_pattern: 'My niece’s wedding is in October; I’ll attend and tour Toronto for a few days, then return to work.',
    weak_answer_pattern: 'No specific reason, just whenever.',
    pro_tip: 'Anchor the timing to an event or your approved leave.',
    keywords_to_use: ['event', 'wedding', 'approved leave', 'return to work'],
    keywords_to_avoid: ['whenever', 'no reason'],
    difficulty: 2,
  },
  {
    id: 'au-visitor-trip-01', country_iso: 'AU', visa_types: ['VISITOR'], category: 'trip_details',
    question: 'What is your itinerary in Australia?',
    why_asked: 'A specific, researched plan supports genuine tourist intent.',
    strong_answer_pattern: 'Sydney for five days, then the Gold Coast — Opera House, Bondi, and a reef tour. All booked.',
    weak_answer_pattern: 'I’ll just travel around and see what happens.',
    pro_tip: 'A researched, booked itinerary is strong evidence of genuine tourism.',
    keywords_to_use: ['specific cities', 'attractions', 'booked'],
    keywords_to_avoid: ['see what happens', 'no fixed plan'],
    difficulty: 1,
  },
  {
    id: 'au-visitor-posttravel-01', country_iso: 'AU', visa_types: ['VISITOR'], category: 'post_travel',
    question: 'What will you return to after your visit?',
    why_asked: 'Naming commitments at home reinforces the temporary nature of the visit.',
    strong_answer_pattern: 'My job and my family. I have a work deadline the week after I land back home.',
    weak_answer_pattern: 'Nothing pressing, I’m flexible.',
    pro_tip: 'Concrete commitments at home are the heart of the GTE assessment.',
    keywords_to_use: ['job', 'family', 'deadline'],
    keywords_to_avoid: ['nothing pressing', 'flexible'],
    difficulty: 2,
  },
  {
    id: 'de-schengen-ties-01', country_iso: 'DE', visa_types: ['SCHENGEN'], category: 'ties',
    question: 'What guarantees you will leave the Schengen area on time?',
    why_asked: 'Officers must be satisfied you will depart within the authorised stay.',
    strong_answer_pattern: 'My job, my home, and my family are at home, and my return flight is booked for the 12th.',
    weak_answer_pattern: 'I’m not certain, I may travel onward.',
    pro_tip: 'Pair concrete ties with a booked return flight.',
    keywords_to_use: ['job', 'home', 'family', 'return flight'],
    keywords_to_avoid: ['not certain', 'travel onward', 'maybe stay'],
    difficulty: 2,
  },
  {
    id: 'de-schengen-trip-01', country_iso: 'DE', visa_types: ['SCHENGEN'], category: 'trip_details',
    question: 'What is your travel itinerary within the Schengen area?',
    why_asked: 'A clear itinerary confirms the trip is planned and time-limited.',
    strong_answer_pattern: 'Eight days: four in Berlin, three in Munich, then a day in Salzburg — all accommodation pre-booked.',
    weak_answer_pattern: 'I’ll move around Europe and see where I end up.',
    pro_tip: 'Day-by-day plans with bookings are expected for Schengen visas.',
    keywords_to_use: ['days', 'cities', 'pre-booked'],
    keywords_to_avoid: ['see where I end up', 'no plan'],
    difficulty: 1,
  },

  // ═══════════════ US F-1 (more) ═══════════════
  {
    id: 'us-f1-ties-01', country_iso: 'US', visa_types: ['F1'], category: 'ties',
    question: 'What ties will bring you back home after your studies?',
    why_asked: 'F-1 requires non-immigrant intent — credible reasons to return.',
    strong_answer_pattern: 'My family business, property we own, and a clear career plan in my field at home.',
    weak_answer_pattern: 'I’d like to stay and work in the US if I can.',
    pro_tip: 'Tie your degree to a specific opportunity waiting at home.',
    keywords_to_use: ['family business', 'property', 'career at home'],
    keywords_to_avoid: ['stay', 'settle', 'green card'],
    difficulty: 3,
  },
  {
    id: 'us-f1-personal-01', country_iso: 'US', visa_types: ['F1'], category: 'personal',
    question: 'Why did you choose this specific university?',
    why_asked: 'Shows genuine academic intent and research, not just any admission.',
    strong_answer_pattern: 'Its program is ranked top-10 for my field, and Professor Lee’s lab matches my research interest.',
    weak_answer_pattern: 'It was the only one that accepted me.',
    pro_tip: 'Name the program strength, faculty, or facilities that drew you.',
    keywords_to_use: ['ranking', 'specific program', 'faculty', 'research'],
    keywords_to_avoid: ['only one that accepted me', 'easy to get in'],
    difficulty: 2,
  },

  // ═══════════════ US H-1B (Work) ═══════════════
  {
    id: 'us-h1b-purpose-01', country_iso: 'US', visa_types: ['H1B'], category: 'purpose',
    question: 'Which company has petitioned for your H-1B and what is the role?',
    why_asked: 'Confirms a valid, approved petition and a real specialty occupation.',
    strong_answer_pattern: 'I’m hired by Acme Corp in Seattle as a senior data engineer; my I-797 approval is here.',
    weak_answer_pattern: 'I’m still finalising which company I’ll join.',
    pro_tip: 'Know your employer, role, work location, and have your I-797 ready.',
    keywords_to_use: ['employer', 'role', 'I-797', 'work location'],
    keywords_to_avoid: ['still deciding', 'not finalised'],
    difficulty: 2,
  },
  {
    id: 'us-h1b-financial-01', country_iso: 'US', visa_types: ['H1B'], category: 'financial',
    question: 'What is your salary and does it meet the prevailing wage?',
    why_asked: 'H-1B requires the offered wage to meet or exceed the prevailing wage for the role and location.',
    strong_answer_pattern: 'My salary is $135,000, which exceeds the prevailing wage on my LCA for this role in Seattle.',
    weak_answer_pattern: 'I’m not sure of the exact figure yet.',
    pro_tip: 'Know your exact salary and that it satisfies the LCA prevailing wage.',
    keywords_to_use: ['exact salary', 'prevailing wage', 'LCA'],
    keywords_to_avoid: ['not sure', 'we’ll discuss later'],
    difficulty: 2,
  },
  {
    id: 'us-h1b-personal-01', country_iso: 'US', visa_types: ['H1B'], category: 'personal',
    question: 'What are your qualifications for this specialty role?',
    why_asked: 'A specialty occupation requires a relevant degree and specialised skills.',
    strong_answer_pattern: 'A master’s in computer science plus five years building distributed systems — directly matching the role.',
    weak_answer_pattern: 'I have broad experience in many areas.',
    pro_tip: 'Map your degree and specific experience to the job’s specialty requirement.',
    keywords_to_use: ['degree', 'specialised skills', 'years of experience'],
    keywords_to_avoid: ['general experience', 'a bit of everything'],
    difficulty: 2,
  },
  {
    id: 'us-h1b-redflag-01', country_iso: 'US', visa_types: ['H1B'], category: 'red_flag',
    question: 'Do you intend to immigrate permanently to the US?',
    why_asked: 'H-1B is dual-intent, so honesty is acceptable — but answer carefully.',
    strong_answer_pattern: 'I’m focused on my role now. H-1B allows dual intent, so I’ll consider options as my career develops.',
    weak_answer_pattern: 'No, I’ll definitely leave the moment my visa ends.',
    pro_tip: 'H-1B permits dual intent; a measured, honest answer is fine here.',
    keywords_to_use: ['focused on the role', 'dual intent', 'as career develops'],
    keywords_to_avoid: ['definitely leave', 'lie about intent'],
    difficulty: 3,
  },

  // ═══════════════ UK Student ═══════════════
  {
    id: 'gb-student-purpose-01', country_iso: 'GB', visa_types: ['STUDENT'], category: 'purpose',
    question: 'Which course and university will you attend, and why?',
    why_asked: 'Confirms a genuine student with a researched, credible study plan.',
    strong_answer_pattern: 'An MSc in Finance at the University of Manchester — it’s accredited and ranked for my field. I hold my CAS.',
    weak_answer_pattern: 'I applied to several, I’ll pick once I arrive.',
    pro_tip: 'Know your course, university, and have your CAS; show why this program fits.',
    keywords_to_use: ['course', 'university', 'CAS', 'ranking'],
    keywords_to_avoid: ['not decided', 'whichever accepts me'],
    difficulty: 2,
  },
  {
    id: 'gb-student-financial-01', country_iso: 'GB', visa_types: ['STUDENT'], category: 'financial',
    question: 'How will you cover tuition and living costs?',
    why_asked: 'The UK requires proof of tuition plus monthly maintenance funds.',
    strong_answer_pattern: 'Tuition is paid, and I hold the required maintenance funds (£1,334/month for London) in my account for the needed period.',
    weak_answer_pattern: 'I’ll work part-time to pay my way.',
    pro_tip: 'Meet the exact maintenance threshold held for the required 28 days.',
    keywords_to_use: ['tuition paid', 'maintenance funds', '£1,334'],
    keywords_to_avoid: ['work to pay tuition', 'borrow on arrival'],
    difficulty: 2,
  },
  {
    id: 'gb-student-posttravel-01', country_iso: 'GB', visa_types: ['STUDENT'], category: 'post_travel',
    question: 'What are your plans after your studies?',
    why_asked: 'Shows the course fits a coherent career path.',
    strong_answer_pattern: 'I plan to return home to work in finance; the Graduate Route could give me some UK experience first.',
    weak_answer_pattern: 'I want to stay in the UK permanently.',
    pro_tip: 'Mentioning the Graduate Route shows you know the legal options without implying overstay.',
    keywords_to_use: ['career path', 'return home', 'Graduate Route'],
    keywords_to_avoid: ['stay permanently', 'never leave'],
    difficulty: 2,
  },

  // ═══════════════ UK Skilled Worker ═══════════════
  {
    id: 'gb-skilled-purpose-01', country_iso: 'GB', visa_types: ['SKILLED'], category: 'purpose',
    question: 'Who is your UK sponsor and what is the role?',
    why_asked: 'A valid Certificate of Sponsorship from a licensed sponsor is mandatory.',
    strong_answer_pattern: 'I’m sponsored by a licensed employer as a software developer; I have my Certificate of Sponsorship reference.',
    weak_answer_pattern: 'I’m still looking for a company to sponsor me.',
    pro_tip: 'The Certificate of Sponsorship (CoS) is the key document — know its details.',
    keywords_to_use: ['licensed sponsor', 'Certificate of Sponsorship', 'role'],
    keywords_to_avoid: ['still looking', 'no sponsor yet'],
    difficulty: 2,
  },
  {
    id: 'gb-skilled-financial-01', country_iso: 'GB', visa_types: ['SKILLED'], category: 'financial',
    question: 'Does your salary meet the Skilled Worker threshold?',
    why_asked: 'The role must meet the minimum salary for its occupation code.',
    strong_answer_pattern: 'Yes, my salary exceeds both the general threshold and the going rate for my occupation code.',
    weak_answer_pattern: 'I’m not sure what the threshold is.',
    pro_tip: 'Know the salary threshold and going rate for your SOC code.',
    keywords_to_use: ['salary threshold', 'going rate', 'occupation code'],
    keywords_to_avoid: ['not sure', 'below the minimum'],
    difficulty: 2,
  },

  // ═══════════════ Canada Study Permit ═══════════════
  {
    id: 'ca-study-purpose-01', country_iso: 'CA', visa_types: ['STUDY'], category: 'purpose',
    question: 'Which institution will you study at, and is it a DLI?',
    why_asked: 'Only Designated Learning Institutions qualify for a study permit.',
    strong_answer_pattern: 'I’ll study at a DLI-listed college in Ontario; I have my Letter of Acceptance and PAL.',
    weak_answer_pattern: 'I applied to a few schools, not sure if they’re DLIs.',
    pro_tip: 'Confirm DLI status and have your Letter of Acceptance ready.',
    keywords_to_use: ['DLI', 'Letter of Acceptance', 'program'],
    keywords_to_avoid: ['not sure if DLI', 'whichever accepts me'],
    difficulty: 2,
  },
  {
    id: 'ca-study-ties-01', country_iso: 'CA', visa_types: ['STUDY'], category: 'ties',
    question: 'How do we know you’ll leave Canada after your studies?',
    why_asked: 'Study permits weigh genuine-student status and intent to return.',
    strong_answer_pattern: 'I have family ties and a career plan at home; this program builds skills my home market needs.',
    weak_answer_pattern: 'I’d like to apply for PR and stay.',
    pro_tip: 'Emphasise home-country ties and how the program serves your home career.',
    keywords_to_use: ['family ties', 'career plan at home', 'skills needed'],
    keywords_to_avoid: ['apply for PR', 'stay permanently'],
    difficulty: 3,
  },
  {
    id: 'ca-study-financial-01', country_iso: 'CA', visa_types: ['STUDY'], category: 'financial',
    question: 'How will you fund tuition and living costs?',
    why_asked: 'You must prove tuition plus living funds (e.g. a GIC) for the study permit.',
    strong_answer_pattern: 'Tuition is paid and I hold a GIC plus family sponsorship covering my living costs.',
    weak_answer_pattern: 'I’ll rely on working off-campus to fund everything.',
    pro_tip: 'Show tuition + the required living funds (GIC is common) — not reliance on work.',
    keywords_to_use: ['tuition paid', 'GIC', 'sponsorship'],
    keywords_to_avoid: ['fund it all by working', 'no proof of funds'],
    difficulty: 2,
  },

  // ═══════════════ Canada Work Permit ═══════════════
  {
    id: 'ca-work-purpose-01', country_iso: 'CA', visa_types: ['WORK'], category: 'purpose',
    question: 'Do you have a valid Canadian job offer and LMIA (if required)?',
    why_asked: 'Most work permits need a job offer and a positive LMIA or an LMIA exemption.',
    strong_answer_pattern: 'Yes, a positive LMIA-supported offer from an employer in Alberta as a millwright at the stated wage.',
    weak_answer_pattern: 'I’ll find a job after I arrive in Canada.',
    pro_tip: 'Know whether your stream needs an LMIA and have the offer documents ready.',
    keywords_to_use: ['job offer', 'LMIA', 'employer', 'wage'],
    keywords_to_avoid: ['find a job after arriving', 'no offer yet'],
    difficulty: 2,
  },

  // ═══════════════ Australia Student (500) ═══════════════
  {
    id: 'au-student-purpose-01', country_iso: 'AU', visa_types: ['STUDENT'], category: 'purpose',
    question: 'Why did you choose this course in Australia?',
    why_asked: 'Australia assesses Genuine Student (GS) status — real academic motivation.',
    strong_answer_pattern: 'The course is industry-accredited and its practical focus suits my career goal back home in nursing.',
    weak_answer_pattern: 'It was easier to get into than the US or UK.',
    pro_tip: 'Show genuine motivation and how the course fits your career plan.',
    keywords_to_use: ['accredited', 'practical focus', 'career goal'],
    keywords_to_avoid: ['easier to get in', 'just to migrate'],
    difficulty: 2,
  },
  {
    id: 'au-student-posttravel-01', country_iso: 'AU', visa_types: ['STUDENT'], category: 'post_travel',
    question: 'What will you do after completing your degree?',
    why_asked: 'GS status weighs your stated intentions after study.',
    strong_answer_pattern: 'Return home to work in my field, where this qualification is in demand; I may use the 485 visa briefly first.',
    weak_answer_pattern: 'Stay in Australia and get PR.',
    pro_tip: 'Emphasise home return; you can mention the 485 visa as a legal option without implying migration intent.',
    keywords_to_use: ['return home', 'qualification in demand', '485 visa'],
    keywords_to_avoid: ['get PR', 'stay forever'],
    difficulty: 3,
  },
  {
    id: 'au-student-financial-01', country_iso: 'AU', visa_types: ['STUDENT'], category: 'financial',
    question: 'How will you cover tuition and living costs in Australia?',
    why_asked: 'You must show genuine capacity to fund tuition and living expenses.',
    strong_answer_pattern: 'Tuition is paid and I have the required living funds plus family support, with consistent bank history.',
    weak_answer_pattern: 'I’ll work full-time to pay for everything.',
    pro_tip: 'Student work hours are capped — don’t present work as your main funding.',
    keywords_to_use: ['tuition paid', 'living funds', 'family support'],
    keywords_to_avoid: ['work full-time to pay', 'no savings'],
    difficulty: 2,
  },

  // ═══════════════ Germany Student ═══════════════
  {
    id: 'de-student-purpose-01', country_iso: 'DE', visa_types: ['STUDENT'], category: 'purpose',
    question: 'Which German university admitted you and for what program?',
    why_asked: 'Confirms genuine admission and study intent.',
    strong_answer_pattern: 'I have admission to a master’s in mechanical engineering at a public university; the program is in English.',
    weak_answer_pattern: 'I’ve applied to several, nothing confirmed.',
    pro_tip: 'Have your admission letter; know whether your program is German- or English-taught.',
    keywords_to_use: ['admission letter', 'program', 'university'],
    keywords_to_avoid: ['not confirmed', 'still applying'],
    difficulty: 2,
  },
  {
    id: 'de-student-financial-01', country_iso: 'DE', visa_types: ['STUDENT'], category: 'financial',
    question: 'How will you prove you can support yourself?',
    why_asked: 'Germany requires proof of funds, typically via a blocked account.',
    strong_answer_pattern: 'I’ve opened a blocked account with the required annual amount, which covers my living costs.',
    weak_answer_pattern: 'I’ll figure out money once I’m there.',
    pro_tip: 'The blocked account (Sperrkonto) with the required yearly sum is the standard proof.',
    keywords_to_use: ['blocked account', 'required amount', 'living costs'],
    keywords_to_avoid: ['figure it out there', 'no proof'],
    difficulty: 2,
  },
]

// ── Accessors ────────────────────────────────────────────────────────────────
export function getCountryBySlug(slug: string): InterviewCountry | undefined {
  return INTERVIEW_COUNTRIES.find((c) => c.slug === slug.toLowerCase())
}

export function getVisaLabel(country: InterviewCountry, code: string): string | undefined {
  return country.visa_types.find((v) => v.code.toLowerCase() === code.toLowerCase())?.label
}

/** Questions for a country ISO, optionally filtered by visa-type code. */
export function getQuestions(countryIso: string, visaTypeCode?: string): InterviewQuestion[] {
  return QUESTION_BANK.filter((q) => {
    if (q.country_iso !== countryIso) return false
    if (visaTypeCode && !q.visa_types.includes(visaTypeCode)) return false
    return true
  })
}

/** Count of questions per category for a given country/visa-type. */
export function countByCategory(
  countryIso: string,
  visaTypeCode?: string
): Record<QuestionCategory, number> {
  const counts = {
    personal: 0, purpose: 0, financial: 0, ties: 0,
    trip_details: 0, post_travel: 0, red_flag: 0,
  } as Record<QuestionCategory, number>
  for (const q of getQuestions(countryIso, visaTypeCode)) counts[q.category]++
  return counts
}

export function getQuestionById(id: string): InterviewQuestion | undefined {
  return QUESTION_BANK.find((q) => q.id === id)
}

/** Balanced selection for a mock interview: spread across categories. */
export function buildMockSet(
  countryIso: string,
  visaTypeCode: string | undefined,
  size = 7
): InterviewQuestion[] {
  const pool = getQuestions(countryIso, visaTypeCode)
  const byCat = new Map<QuestionCategory, InterviewQuestion[]>()
  for (const q of pool) {
    const arr = byCat.get(q.category) ?? []
    arr.push(q)
    byCat.set(q.category, arr)
  }
  const order: QuestionCategory[] = ['purpose', 'personal', 'ties', 'financial', 'trip_details', 'post_travel', 'red_flag']
  const picked: InterviewQuestion[] = []
  // Round-robin across categories until we hit `size` or run out
  let progressed = true
  while (picked.length < size && progressed) {
    progressed = false
    for (const cat of order) {
      const arr = byCat.get(cat)
      if (arr && arr.length) {
        picked.push(arr.shift()!)
        progressed = true
        if (picked.length >= size) break
      }
    }
  }
  return picked
}
