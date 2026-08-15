-- 016: Detail page content fields (events + programs)
-- Safe to re-apply. Adds columns with defaults, then backfills seeded rows.

-- Events
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS img text DEFAULT '';
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS agenda jsonb DEFAULT '[]'::jsonb;
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS audience_for jsonb DEFAULT '[]'::jsonb;
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS audience_not_for jsonb DEFAULT '[]'::jsonb;
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS faqs jsonb DEFAULT '[]'::jsonb;
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS policies text DEFAULT '';

-- Programs
ALTER TABLE public.programs ADD COLUMN IF NOT EXISTS curriculum jsonb DEFAULT '[]'::jsonb;
ALTER TABLE public.programs ADD COLUMN IF NOT EXISTS audience_for jsonb DEFAULT '[]'::jsonb;
ALTER TABLE public.programs ADD COLUMN IF NOT EXISTS audience_not_for jsonb DEFAULT '[]'::jsonb;
ALTER TABLE public.programs ADD COLUMN IF NOT EXISTS instructor_name text DEFAULT '';
ALTER TABLE public.programs ADD COLUMN IF NOT EXISTS instructor_bio text DEFAULT '';
ALTER TABLE public.programs ADD COLUMN IF NOT EXISTS instructor_photo text DEFAULT '';
ALTER TABLE public.programs ADD COLUMN IF NOT EXISTS duration text DEFAULT '';
ALTER TABLE public.programs ADD COLUMN IF NOT EXISTS effort text DEFAULT '';
ALTER TABLE public.programs ADD COLUMN IF NOT EXISTS includes jsonb DEFAULT '[]'::jsonb;
ALTER TABLE public.programs ADD COLUMN IF NOT EXISTS refund_policy text DEFAULT '';
ALTER TABLE public.programs ADD COLUMN IF NOT EXISTS testimonials jsonb DEFAULT '[]'::jsonb;

-- Backfill: events ----------------------------------------------------------
UPDATE public.events SET
  img = '/images/public-speaking.jpg',
  audience_for = '["Students and young orators ages 13-18","School debate clubs and teams","Parents and guardians"]'::jsonb,
  audience_not_for = '["Children under 13 without a school team"]'::jsonb,
  agenda = '[{"time":"09:00 AM","title":"Arrival and registration"},{"time":"10:00 AM","title":"Opening address and judges introduction"},{"time":"11:00 AM","title":"Preliminary rounds"},{"time":"02:00 PM","title":"Semi-finals"},{"time":"04:00 PM","title":"Grand finale and prize ceremony"}]'::jsonb,
  faqs = '[{"q":"Can I attend as a spectator?","a":"Yes - general admission is free and open to the public."},{"q":"Can schools enter a team?","a":"Yes - schools may register teams of up to three speakers."}]'::jsonb,
  policies = 'Free event. Cancellations are not required, but we appreciate notice at least 48 hours before the event.'
WHERE id = 'event-1';

UPDATE public.events SET
  img = '/images/digital-literacy.jpg',
  audience_for = '["Teens ages 12-17","Complete beginners with no tech background","Learners building their first portfolio"]'::jsonb,
  audience_not_for = '["Advanced or professional developers"]'::jsonb,
  agenda = '[{"time":"Day 1","title":"Web design foundations"},{"time":"Day 2","title":"Digital content creation"},{"time":"Day 3","title":"Online safety and project showcase"}]'::jsonb,
  faqs = '[{"q":"Do I need my own laptop?","a":"We provide laptops for the duration of the bootcamp."},{"q":"Will I get a certificate?","a":"Yes - all participants who complete the 3 days receive a certificate."}]'::jsonb,
  policies = 'Full refund if you cancel at least 72 hours before the bootcamp start date.'
WHERE id = 'event-2';

UPDATE public.events SET
  img = '/images/literary-arts.jpg',
  audience_for = '["Writers, poets and storytellers of all ages","Emerging spoken-word artists","Book and arts lovers"]'::jsonb,
  audience_not_for = '["Closed-door private events - this is a public showcase"]'::jsonb,
  agenda = '[{"time":"05:00 PM","title":"Doors open and open mic sign-up"},{"time":"06:00 PM","title":"Poetry slam"},{"time":"07:00 PM","title":"Story circle"},{"time":"08:00 PM","title":"Guest artist and close"}]'::jsonb,
  faqs = '[{"q":"Can I perform on the night?","a":"Yes - sign up at the door; slots are first come, first served."},{"q":"Is there an entry fee?","a":"No - admission is free."}]'::jsonb,
  policies = 'Free event. No tickets or refunds required.'
WHERE id = 'event-3';

UPDATE public.events SET
  img = '/images/mentorship.jpg',
  audience_for = '["Students ages 15-20 exploring careers","Final-year secondary students","Young graduates seeking direction"]'::jsonb,
  audience_not_for = '["Working professionals seeking job placement"]'::jsonb,
  agenda = '[{"time":"10:00 AM","title":"Keynote sessions"},{"time":"12:00 PM","title":"Breakout tracks by field"},{"time":"02:00 PM","title":"Networking lunch"},{"time":"03:00 PM","title":"Mentor speed-matching"}]'::jsonb,
  faqs = '[{"q":"How do I prepare?","a":"Bring your CV or a list of questions for mentors."},{"q":"Is lunch included?","a":"Yes - a networking lunch is provided."}]'::jsonb,
  policies = 'Free event. Please cancel at least 48 hours in advance if you can no longer attend.'
WHERE id = 'event-4';

UPDATE public.events SET
  img = '/images/peace.jpg',
  audience_for = '["BMAC ambassadors and alumni","Volunteers of all ages","Community groups and schools"]'::jsonb,
  audience_not_for = '["Those unable to commit to outdoor work in the morning"]'::jsonb,
  agenda = '[{"time":"07:00 AM","title":"Gathering and briefing"},{"time":"08:00 AM","title":"Clean-up and tree planting"},{"time":"12:00 PM","title":"Rest, lunch and football match"}]'::jsonb,
  faqs = '[{"q":"What should I bring?","a":"Gloves, water bottle and sun protection. Tools are provided."},{"q":"Can children join?","a":"Yes - under 14s should be accompanied by a guardian."}]'::jsonb,
  policies = 'Free event. Rain or shine.'
WHERE id = 'event-5';

UPDATE public.events SET
  img = '/images/award.jpg',
  audience_for = '["Donors, partners and sponsors","Alumni and BMAC families","Friends of the movement"]'::jsonb,
  audience_not_for = '["Casual drop-ins - this is a ticketed formal event"]'::jsonb,
  agenda = '[{"time":"04:00 PM","title":"Arrival and welcome drinks"},{"time":"05:00 PM","title":"Impact showcase and testimonials"},{"time":"06:00 PM","title":"Fundraising auction"},{"time":"08:00 PM","title":"Gala dinner and close"}]'::jsonb,
  faqs = '[{"q":"What does my ticket include?","a":"Full access, welcome drinks, gala dinner and the auction."},{"q":"Is the ticket tax-deductible?","a":"A portion of your ticket is a donation and qualifies for a receipt."}]'::jsonb,
  policies = 'Tickets are non-refundable but fully transferable up to 48 hours before the gala.'
WHERE id = 'event-6';

-- Backfill: programs ---------------------------------------------------------
UPDATE public.programs SET
  duration = '12 weeks',
  effort = '2 hours per week',
  audience_for = '["Teens ages 13-18","Students who freeze in class presentations","Future leaders of clubs and teams"]'::jsonb,
  audience_not_for = '["Adults seeking corporate communication training"]'::jsonb,
  instructor_name = 'Emmanuel Bature',
  instructor_bio = 'Programs Coordinator and lead speaking coach with over 10 years training young orators across Plateau State.',
  instructor_photo = '/images/maryam1.jpg',
  curriculum = '[{"title":"Foundations of confident speaking","outcome":"Deliver a short self-introduction without notes"},{"title":"Body and voice","outcome":"Command a room with pace, pitch and posture"},{"title":"Structuring speeches","outcome":"Build an opening, argument and close that land"},{"title":"Persuasion and rhetoric","outcome":"Argue a position convincingly in under five minutes"},{"title":"Storytelling","outcome":"Weave personal narrative into any talk"},{"title":"Capstone showcase","outcome":"Present a full speech to a live audience"}]'::jsonb,
  includes = '["Live weekly sessions","Personalised feedback on every speech","Certification on completion","Access to the alumni community"]'::jsonb,
  refund_policy = 'Full refund if you withdraw within the first two weeks of the program.',
  testimonials = '[{"name":"Maryam Abdullah","designation":"Debate Champion, Class of 2025","quote":"BMAC transformed me from a shy girl who could not speak in class to a confident young woman who represented Plateau State at the National Debate Championship."}]'::jsonb
WHERE id = 'public-speaking';

UPDATE public.programs SET
  duration = '10 weeks',
  effort = '2-3 hours per week',
  audience_for = '["Writers ages 14-19","Young poets and storytellers","Teens building a writing portfolio"]'::jsonb,
  audience_not_for = '["Established authors seeking an MFA"]'::jsonb,
  instructor_name = 'Grace Okonkwo',
  instructor_bio = 'Literary Arts Lead and published poet who has mentored over 200 young writers in Jos.',
  instructor_photo = '/images/maryam2.jpg',
  curriculum = '[{"title":"Finding your voice","outcome":"Write a first draft of a personal essay or poem"},{"title":"Narrative structure","outcome":"Shape a story with a clear beginning, middle and end"},{"title":"Voice and style","outcome":"Edit your own work for clarity and rhythm"},{"title":"Poetry delivery","outcome":"Perform a piece at a public open mic"},{"title":"Portfolio building","outcome":"Compile a submission-ready portfolio"},{"title":"Anthology","outcome":"Publish a piece in the BMAC annual anthology"}]'::jsonb,
  includes = '["Weekly writing workshops","One-on-one editorial feedback","Open mic performance slots","Publication in the annual anthology"]'::jsonb,
  refund_policy = 'Full refund if you withdraw within the first two weeks of the program.',
  testimonials = '[{"name":"Chinedu Okafor","designation":"Published Poet, Class of 2024","quote":"The literary arts program helped me discover my voice as a poet. I have been published in two anthologies."}]'::jsonb
WHERE id = 'literary-arts';

UPDATE public.programs SET
  duration = '8 weeks',
  effort = '3-4 hours per week',
  audience_for = '["Teens ages 12-17","Complete beginners with no computer","Learners curious about the digital world"]'::jsonb,
  audience_not_for = '["Advanced programmers"]'::jsonb,
  instructor_name = 'Grace Okonkwo',
  instructor_bio = 'Digital Literacy Lead who has equipped over 500 students with their first computer skills.',
  instructor_photo = '/images/maryam2.jpg',
  curriculum = '[{"title":"Computer foundations","outcome":"Use a computer, keyboard and files with confidence"},{"title":"Productivity suite","outcome":"Create documents, spreadsheets and slides"},{"title":"Online research","outcome":"Find and evaluate information safely online"},{"title":"Cybersecurity","outcome":"Protect accounts and spot online scams"},{"title":"Content creation","outcome":"Design a simple digital poster or video"},{"title":"Capstone project","outcome":"Build and present a personal digital portfolio"}]'::jsonb,
  includes = '["Use of BMAC laptops during sessions","Structured practice tasks","Certification on completion","A mentor for one month after graduation"]'::jsonb,
  refund_policy = 'Full refund if you withdraw within the first two weeks of the program.',
  testimonials = '[{"name":"Aisha Mohammed","designation":"Digital Literacy Graduate, 2025","quote":"Before BMAC, I had never touched a computer. After Digital Literacy, I built my first website. Now I am teaching coding."}]'::jsonb
WHERE id = 'digital-literacy';

UPDATE public.programs SET
  duration = '6 months',
  effort = '2-3 hours per month',
  audience_for = '["Students ages 15-20","Young people exploring career paths","Those who want a trusted adult in their corner"]'::jsonb,
  audience_not_for = '["Learners seeking academic tutoring only"]'::jsonb,
  instructor_name = 'Daniel Pwajok',
  instructor_bio = 'Mentorship Director who has matched over 150 students with professionals across 20 fields.',
  instructor_photo = '/images/maryam3.jpg',
  curriculum = '[{"title":"Goal setting","outcome":"Define one clear goal and a plan to reach it"},{"title":"Career exploration","outcome":"Map three possible career paths with next steps"},{"title":"Academic strategies","outcome":"Build a study routine that works"},{"title":"Network building","outcome":"Hold your first professional conversation"},{"title":"Personal brand","outcome":"Present yourself confidently in any room"},{"title":"Sustained accountability","outcome":"Close the mentorship with a progress report"}]'::jsonb,
  includes = '["A matched one-on-one mentor","Monthly guided sessions","Quarterly career workshops","Alumni network access"]'::jsonb,
  refund_policy = 'No fees - the mentorship program is free for all participants.',
  testimonials = '[{"name":"Joshua Tanko","designation":"Law Student, University of Jos","quote":"The mentorship program connected me with a lawyer who guided me through my university applications. I am now studying law."}]'::jsonb
WHERE id = 'mentorship';

UPDATE public.programs SET
  duration = '12 weeks',
  effort = '3 hours per week',
  audience_for = '["Students ages 14-18","Budding debaters and public speakers","Those who want to argue with evidence, not emotion"]'::jsonb,
  audience_not_for = '["Anyone looking for a casual conversation club"]'::jsonb,
  instructor_name = 'Emmanuel Bature',
  instructor_bio = 'Programs Coordinator and coach for multiple Plateau State debating champions.',
  instructor_photo = '/images/maryam1.jpg',
  curriculum = '[{"title":"Parliamentary debate","outcome":"Understand and follow the debate format"},{"title":"Argument construction","outcome":"Build a motion statement with three clear points"},{"title":"Research","outcome":"Find and cite evidence under pressure"},{"title":"Impromptu speaking","outcome":"Deliver a two-minute unprepared response"},{"title":"Case building","outcome":"Prepare a complete team case in 30 minutes"},{"title":"Tournament ready","outcome":"Compete in a BMAC tournament"}]'::jsonb,
  includes = '["Weekly coached debates","Team practice matches","Entry to BMAC debate tournaments","Certification on completion"]'::jsonb,
  refund_policy = 'Full refund if you withdraw within the first two weeks of the program.',
  testimonials = '[]'::jsonb
WHERE id = 'debate-argumentation';

UPDATE public.programs SET
  duration = '10 weeks',
  effort = '2-3 hours per week',
  audience_for = '["Writers ages 13-17","Storytellers with ideas but no finished draft","Those who want feedback that actually helps"]'::jsonb,
  audience_not_for = '["Writers who only want to publish, not revise"]'::jsonb,
  instructor_name = 'Grace Okonkwo',
  instructor_bio = 'Literary Arts Lead and editor of two BMAC anthologies.',
  instructor_photo = '/images/maryam2.jpg',
  curriculum = '[{"title":"Character development","outcome":"Create a protagonist readers will follow"},{"title":"Plot structure","outcome":"Map a story from hook to resolution"},{"title":"Setting","outcome":"Make place feel alive on the page"},{"title":"Revision","outcome":"Cut, sharpen and polish a full draft"},{"title":"Genre exploration","outcome":"Try a genre you have never written before"},{"title":"Anthology","outcome":"Submit a finished story for publication"}]'::jsonb,
  includes = '["Weekly writing workshops","Peer critique circles","Editorial feedback on your draft","Publication in the annual anthology"]'::jsonb,
  refund_policy = 'Full refund if you withdraw within the first two weeks of the program.',
  testimonials = '[]'::jsonb
WHERE id = 'creative-writing';
