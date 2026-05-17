export type Q = { q: string; answer: string; notSay?: string; tip: string }

export const QUESTIONS: Record<string, Record<string, Q[]>> = {
  "United States": {
    "Tourist": [
      { q: "What is the purpose of your visit?", answer: "I am visiting for tourism to explore New York and Washington DC. I have booked hotels and a return flight.", notSay: "I might look for work opportunities while there.", tip: "Be specific about tourist attractions you plan to visit." },
      { q: "How long do you plan to stay?", answer: "I plan to stay for 2 weeks and will return before my visa expires. My return flight is already booked.", notSay: "As long as possible or until my visa runs out.", tip: "Always mention your specific return date and booked ticket." },
      { q: "What is your job and income source?", answer: "I work as [position] at [company] for [X] years earning [salary]. I have approved annual leave for this trip.", notSay: "I'm between jobs right now.", tip: "Strong employment = strong reason to return home." },
      { q: "What ties do you have to your home country?", answer: "I own property, have a permanent job, and my family lives here. I have every reason to return after my trip.", notSay: "I don't have many ties here, I prefer America.", tip: "Ties = property, job, family, assets. Show all of them." },
      { q: "Who is sponsoring your trip?", answer: "I am self-sponsoring. My savings and monthly salary fully cover all trip expenses including hotel and flights.", notSay: "A friend in America is paying for everything.", tip: "Self-sponsoring shows financial independence." },
      { q: "Have you been to the USA before?", answer: "Yes, I visited in [year] and returned on time as required. OR: No, this is my first visit and I plan to follow all visa rules.", notSay: "I overstayed before but it was just a few days.", tip: "Previous visits with no violations strengthen your case." },
      { q: "Do you have family or friends in the USA?", answer: "I have a [relation] in [city] but I am staying in a hotel and funding my trip independently.", notSay: "My whole family is there, I want to join them.", tip: "Having relatives is fine, but clarify you will return." },
      { q: "Can you show proof of sufficient funds?", answer: "Yes. I have bank statements showing [amount] which comfortably covers my entire trip including all expenses.", notSay: "I have some savings, not sure of the exact amount.", tip: "Bring 3-6 months of bank statements showing consistent balance." },
    ],
    "Student": [
      { q: "Which university have you been accepted to?", answer: "I have been accepted to [University Name] in [City] to study [Course Name] starting [Month Year].", notSay: "I applied to several, not sure which one yet.", tip: "Know your university details thoroughly before the interview." },
      { q: "How will you finance your studies?", answer: "My education is funded by [scholarship/family/self]. I have [amount] in a dedicated education fund plus my family's support.", notSay: "I will work part-time to pay my tuition.", tip: "Show clear financial plan covering full tuition + living costs." },
      { q: "What will you do after completing your degree?", answer: "I plan to return to [home country] and apply my degree at [industry/company]. The skills are highly needed back home.", notSay: "I hope to find a job and stay in the USA permanently.", tip: "Always emphasize your plan to RETURN home after studies." },
      { q: "Why study in USA instead of your home country?", answer: "USA universities offer world-class research facilities and global exposure that [home country] universities cannot match for [my field].", notSay: "Education back home is bad quality.", tip: "Frame it positively about USA's strengths, not home country weakness." },
      { q: "Do you speak English fluently?", answer: "Yes. I scored [IELTS/TOEFL score] and have been studying and working in English for [X] years.", notSay: "I will improve my English once I get there.", tip: "High English test scores eliminate this concern completely." },
      { q: "Why did you choose this university?", answer: "It is ranked top [X] globally for [subject]. It offers [specific program feature] which matches my career goals perfectly.", notSay: "It was the only one that accepted me.", tip: "Show genuine research into the university and program." },
    ],
    "Work": [
      { q: "What company has sponsored your work visa?", answer: "I have been hired by [Company Name] as a [Job Title]. They have obtained H-1B/L-1 approval for my position.", notSay: "I'm still negotiating the employment contract.", tip: "Have your employment contract and visa petition ready." },
      { q: "What will your job responsibilities be?", answer: "I will be responsible for [specific duties]. My role requires [specialized skills] which the company cannot find locally.", notSay: "I'm not sure yet, HR will tell me when I arrive.", tip: "Know your job description in detail before the interview." },
      { q: "What is your salary package?", answer: "My annual salary is [amount] which meets the prevailing wage requirement for this position in [location].", notSay: "I don't know the exact amount yet.", tip: "Know your exact salary. H-1B requires prevailing wage compliance." },
      { q: "What are your qualifications for this role?", answer: "I have a [degree] in [field] from [university] plus [X] years of experience specifically in [skill area].", notSay: "I have general experience in many areas.", tip: "Specialty occupation requires specific qualifications. Be precise." },
      { q: "Do you plan to apply for a green card?", answer: "I am focused on my current assignment. H-1B allows dual intent so I will explore options as my career develops.", notSay: "No I will definitely leave after my visa expires.", tip: "H-1B is dual intent. Honesty about future plans is acceptable." },
    ],
  },
  "United Kingdom": {
    "Tourist": [
      { q: "Why do you want to visit the UK?", answer: "I want to visit specific attractions like the British Museum, Buckingham Palace, and the Scottish Highlands. I have a detailed 10-day itinerary planned.", notSay: "I heard there are good job opportunities there.", tip: "Research specific UK attractions and mention them by name." },
      { q: "Where will you stay during your visit?", answer: "I have booked [Hotel Name] in [City] for the duration of my stay. Here is my confirmed booking showing full payment.", notSay: "I'll figure out accommodation when I arrive.", tip: "Pre-booked hotels with confirmation are essential." },
      { q: "How will you fund your trip?", answer: "I have £[amount] in savings specifically for this trip, plus my monthly salary of [amount]. My bank statements confirm sufficient funds.", notSay: "My friend in UK will pay for most things.", tip: "Show 6 months of bank statements with consistent balance." },
      { q: "When will you return to your home country?", answer: "My return flight is booked for [specific date]. I must return to start work at [company] on [date].", notSay: "I'm not sure yet, depends how much I enjoy it.", tip: "A booked return ticket + employment letter is your strongest proof." },
      { q: "What do you do for work back home?", answer: "I work as [position] at [company] for [X] years. I have approved annual leave for this trip and a job to return to.", notSay: "I'm currently unemployed but looking for work.", tip: "Stable employment is your strongest tie to home country." },
    ],
    "Student": [
      { q: "Which UK university will you attend?", answer: "I will attend [University] in [City] to study [Course] for [duration]. I hold an unconditional offer letter.", notSay: "I have applied but not confirmed yet.", tip: "Have your CAS (Confirmation of Acceptance for Studies) ready." },
      { q: "Why did you choose to study in the UK?", answer: "UK universities are globally ranked for [my subject]. [University] specifically offers [unique feature] that aligns with my career in [field].", notSay: "UK was easier to get into than USA.", tip: "Show deep research into UK education quality and specific program." },
      { q: "How will you support yourself financially?", answer: "I have £[amount] in a dedicated account covering tuition and living costs. My [parents/scholarship] provide ongoing support.", notSay: "I plan to work part-time to cover my expenses.", tip: "UK requires proof of £1,334/month for living costs in London." },
      { q: "What are your plans after graduation?", answer: "I plan to return to [country] and work in [industry]. The Graduate Route visa might allow me to gain some UK experience first.", notSay: "I want to stay in UK permanently after graduating.", tip: "Mentioning Graduate Route visa shows you know the legal options." },
    ],
    "Work": [
      { q: "Who is your UK employer?", answer: "I have been hired by [Company Name] in [City] as a [Job Title]. They hold a valid Sponsor Licence and issued my Certificate of Sponsorship.", notSay: "I'm still finalizing the employment details.", tip: "The Certificate of Sponsorship (CoS) is your key document." },
      { q: "What is your salary in the UK role?", answer: "My salary is £[amount] per year which exceeds the Skilled Worker visa minimum threshold for my occupation code.", notSay: "I'm not sure, we haven't finalized compensation.", tip: "Know the exact salary threshold for your SOC code." },
    ],
  },
  "Canada": {
    "Tourist": [
      { q: "What is the main purpose of your visit to Canada?", answer: "I am visiting Canada for tourism. I plan to see Niagara Falls, explore Vancouver, and visit Toronto. I have a 14-day itinerary planned.", notSay: "I want to explore job opportunities there.", tip: "Mention specific Canadian landmarks by name." },
      { q: "Do you have relatives or friends in Canada?", answer: "I have a [relation] in [city] but I am staying in a hotel and funding my trip completely independently.", notSay: "Yes, I'm hoping they can help me settle there.", tip: "Having contacts is fine. Clarify you plan to return home." },
      { q: "What are your ties to your home country?", answer: "I have a permanent job at [company], own property, and my immediate family lives here. I have very strong reasons to return.", notSay: "I don't have many ties, I'm quite free.", tip: "Property ownership is the single strongest tie you can show." },
      { q: "How long do you plan to stay in Canada?", answer: "I plan to stay for exactly [X days]. My return flight is booked and I must return to work on [date].", notSay: "Maybe 6 months if I can extend.", tip: "Short, specific answer with return flight confirmation." },
      { q: "How much money are you bringing for the trip?", answer: "I have CAD [amount] budgeted for this trip including flights, hotel, food, and activities. My bank statements confirm this.", notSay: "I'm not sure, enough to get by.", tip: "Canada recommends CAD $100/day minimum for tourists." },
    ],
    "Student": [
      { q: "Which Canadian institution will you study at?", answer: "I will study [Program] at [Institution Name] in [City]. It is a Designated Learning Institution (DLI). I have my Letter of Acceptance.", notSay: "I applied to several schools in Canada.", tip: "Only DLI-approved institutions qualify for student visa." },
      { q: "Prove you are a genuine student who will return home.", answer: "I have strong family ties, property, and career plans in [country]. I am studying [subject] to improve my career prospects back home.", notSay: "Canada is great, I might try to stay if I can.", tip: "This is Canada's version of Australia's GTE requirement." },
    ],
    "Work": [
      { q: "Do you have a valid Canadian job offer?", answer: "Yes. I have a positive LMIA-supported job offer from [Company] in [Province] as a [Job Title] at [salary] per year.", notSay: "I plan to find a job once I arrive in Canada.", tip: "LMIA (Labour Market Impact Assessment) is mandatory for most work permits." },
    ],
  },
  "Australia": {
    "Tourist": [
      { q: "Are you a genuine temporary entrant (GTE)?", answer: "Yes absolutely. I have strong personal ties to [country] including property, employment, and family. I am visiting purely for tourism for [X weeks].", notSay: "I might extend my stay if I like it there.", tip: "GTE is Australia's most important visa criterion. Emphasize it." },
      { q: "What specifically will you do in Australia?", answer: "I plan to visit the Sydney Opera House, Great Barrier Reef, and Uluru. I have a detailed day-by-day itinerary and all accommodation booked.", notSay: "I'll figure it out when I get there.", tip: "Specific, researched itinerary proves genuine tourist intent." },
      { q: "How will you fund your Australian trip?", answer: "I have AUD [amount] saved for this trip. My bank statements show consistent savings over [X months] with no sudden deposits.", notSay: "A friend will help me pay for some things.", tip: "Australia looks for consistent savings, not recent large deposits." },
    ],
    "Student": [
      { q: "Why did you choose Australia for your studies?", answer: "Australia is ranked globally for [my field]. [University] specifically offers [unique aspect]. The practical learning approach matches my learning style.", notSay: "It was easier than USA or UK to get into.", tip: "Australia checks Genuine Student (GS) status. Show real motivation." },
      { q: "What are your plans after completing your degree?", answer: "I plan to return to [country] and work in [industry]. The knowledge I gain will be highly valuable in my home market.", notSay: "I hope to get a 485 visa and stay in Australia.", tip: "While 485 visa exists legally, emphasize home country return plans." },
    ],
    "Work": [
      { q: "What skilled occupation are you applying under?", answer: "I am applying under [occupation] on the Medium and Long Term Strategic Skills List (MLTSSL). My skills assessment from [assessing body] is approved.", notSay: "I'm not sure which occupation code applies to me.", tip: "Skills assessment from the relevant authority is mandatory." },
    ],
  },
  "Germany": {
    "Tourist": [
      { q: "Why do you want to visit Germany specifically?", answer: "I want to experience German culture and history. I plan to visit Berlin's Brandenburg Gate, Neuschwanstein Castle, and Munich's museums.", notSay: "Germany has good job opportunities I want to explore.", tip: "Show cultural and tourism interest. Never mention job searching." },
      { q: "Do you have travel insurance for the Schengen zone?", answer: "Yes. I have comprehensive travel insurance covering the entire Schengen zone with €30,000 minimum medical coverage as required.", notSay: "I have some basic insurance, I think it covers Europe.", tip: "Schengen REQUIRES minimum €30,000 medical coverage. No exceptions." },
      { q: "Have you traveled to Schengen countries before?", answer: "Yes, I visited [country] in [year] and followed all visa rules, departing before my authorized stay expired. OR: No, this is my first Schengen visit.", notSay: "I overstayed a bit last time but it was not long.", tip: "Clean travel history across all countries is very important." },
      { q: "What is your itinerary for Germany?", answer: "I have [X] days planned. Berlin for [X] days, Munich for [X] days, then [other city]. All accommodation is pre-booked and paid.", notSay: "I'll travel around and see what I find.", tip: "Day-by-day itinerary with hotel bookings shows serious preparation." },
    ],
    "Student": [
      { q: "Which German university accepted you?", answer: "I have been accepted to [University] in [City] for [Program]. Germany's higher education is tuition-free for international students which is a huge advantage.", notSay: "I applied to several universities in Germany.", tip: "Most German public universities are tuition-free. Show you know this." },
      { q: "Do you speak German?", answer: "I have [A1/A2/B1/B2] level German certified by [Goethe Institut]. My program is taught in English so language will not be a barrier.", notSay: "I will learn German when I arrive.", tip: "German language proof or English-taught program confirmation is key." },
    ],
    "Work": [
      { q: "Do you have a recognized qualification for Germany?", answer: "Yes. My [degree/qualification] has been recognized by [anabin database / relevant authority]. This qualifies me for the Skilled Immigration Act pathway.", notSay: "I have international experience that should count.", tip: "Germany requires formal qualification recognition. Check anabin database." },
      { q: "Do you have a job offer from a German employer?", answer: "Yes. I have a binding job offer from [Company] in [City] as a [Position] with a salary of €[amount] per year.", notSay: "I plan to find a job once I arrive in Germany.", tip: "Germany also offers Job Seeker Visa (6 months) to find work in-country." },
    ],
  },
}

export const COUNTRIES = [
  { value: "United States", label: "🇺🇸 United States", flag: "🇺🇸", embassy: "US Embassy" },
  { value: "United Kingdom", label: "🇬🇧 United Kingdom", flag: "🇬🇧", embassy: "UK Visa Centre" },
  { value: "Canada",         label: "🇨🇦 Canada",         flag: "🇨🇦", embassy: "Canada Visa Office" },
  { value: "Australia",      label: "🇦🇺 Australia",      flag: "🇦🇺", embassy: "Australian Embassy" },
  { value: "Germany",        label: "🇩🇪 Germany",        flag: "🇩🇪", embassy: "German Consulate" },
]

export const VISA_TYPES = ["Tourist", "Student", "Work"]

export const TIPS = [
  { icon: "👔", title: "Dress Like You Mean It",  body: "Officers form impressions in 7 seconds. Formal dress signals respect and seriousness." },
  { icon: "📁", title: "The Folder Rule",          body: "Organized documents = organized life. Officers trust tidy applicants more." },
  { icon: "⏰", title: "The 15-Minute Rule",       body: "Arrive early. Nervous rushing shows. Calm confidence is your secret weapon." },
  { icon: "👁️", title: "Eye Contact Wins",         body: "Look at the officer, not the floor. Confidence without arrogance is the goal." },
  { icon: "🎯", title: "STAR Method Answers",      body: "Situation → Task → Action → Result. Short, specific, honest answers always win." },
]

export const CHECKLIST = [
  "Valid passport (6+ months validity)",
  "Visa appointment confirmation letter",
  "Completed DS-160 / visa application form",
  "Bank statements (last 3–6 months)",
  "Employment letter with leave approval",
  "Return flight ticket confirmation",
  "Hotel/accommodation booking",
  "Travel insurance certificate",
  "Recent passport photos (2 copies)",
  "Property documents (if applicable)",
]

export const TOOLS = [
  { label: "💪 Passport Strength",  href: "/passport-strength" },
  { label: "⚖️ Compare Visas",      href: "/compare"           },
  { label: "📋 Checklist",           href: "/checklist"         },
  { label: "⏱️ Processing Times",    href: "/processing-times"  },
  { label: "🛡️ Travel Insurance",   href: "/travel-insurance"  },
  { label: "🏛️ Embassy Finder",     href: "/embassy-finder"    },
  { label: "💱 Currency Converter", href: "/currency-converter"},
  { label: "📊 Visa Tracker",       href: "/visa-tracker"      },
  { label: "🎤 Interview Prep",     href: "/interview-prep"    },
]
