CREATE TABLE IF NOT EXISTS public.paystack_payments (
  id TEXT PRIMARY KEY,
  reference TEXT UNIQUE NOT NULL,
  source_type TEXT NOT NULL,
  source_id TEXT NOT NULL,
  amount INTEGER NOT NULL,
  currency TEXT DEFAULT 'NGN',
  payer_email TEXT NOT NULL,
  payer_name TEXT DEFAULT '',
  status TEXT NOT NULL DEFAULT 'pending',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.people (
  id TEXT PRIMARY KEY,
  first_name TEXT NOT NULL DEFAULT '',
  last_name TEXT NOT NULL DEFAULT '',
  email TEXT NOT NULL DEFAULT '',
  phone TEXT NOT NULL DEFAULT '',
  roles JSONB NOT NULL DEFAULT '[]',
  notes TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS people_email_lower_idx ON public.people (lower(email)) WHERE (email <> '');
CREATE UNIQUE INDEX IF NOT EXISTS people_phone_idx ON public.people (phone) WHERE (phone <> '');

CREATE TABLE IF NOT EXISTS public.person_records (
  id TEXT PRIMARY KEY,
  person_id TEXT NOT NULL,
  kind TEXT NOT NULL,
  ref_id TEXT NOT NULL DEFAULT '',
  ref_title TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'pending',
  meta JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS person_records_person_idx ON public.person_records (person_id);
CREATE INDEX IF NOT EXISTS person_records_kind_idx ON public.person_records (kind);

CREATE TABLE IF NOT EXISTS public.page_views (
  id text PRIMARY KEY DEFAULT gen_random_uuid(),
  path text NOT NULL,
  referrer text NOT NULL DEFAULT '',
  user_agent text NOT NULL DEFAULT '',
  session_id text NOT NULL DEFAULT '',
  view_date date NOT NULL DEFAULT CURRENT_DATE,
  utm_source text NOT NULL DEFAULT '',
  utm_medium text NOT NULL DEFAULT '',
  utm_campaign text NOT NULL DEFAULT '',
  device_type text NOT NULL DEFAULT '',
  browser text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS page_views_date_idx ON public.page_views (view_date);
CREATE INDEX IF NOT EXISTS page_views_path_date_idx ON public.page_views (path, view_date);
CREATE INDEX IF NOT EXISTS page_views_session_idx ON public.page_views (session_id);
CREATE INDEX IF NOT EXISTS page_views_referrer_idx ON public.page_views (referrer);

CREATE TABLE IF NOT EXISTS public.analytics_events (
  id text PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  path text NOT NULL DEFAULT '',
  referrer text NOT NULL DEFAULT '',
  utm_source text NOT NULL DEFAULT '',
  utm_medium text NOT NULL DEFAULT '',
  utm_campaign text NOT NULL DEFAULT '',
  properties jsonb NOT NULL DEFAULT '{}'::jsonb,
  session_id text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS analytics_events_name_date_idx ON public.analytics_events (name, created_at);
CREATE INDEX IF NOT EXISTS analytics_events_created_idx ON public.analytics_events (created_at);

TRUNCATE TABLE public.programs, public.events, public.news_articles, public.testimonials, public.team_members, public.impact_stats, public.gallery_items, public.partners, public.site_settings, public.activity_logs, public.paystack_payments, public.people, public.person_records RESTART IDENTITY CASCADE;

INSERT INTO public.programs (id, title, description, long_desc, img, icon, color, details, variant, status, skills, faqs, landing_page, duration, effort, audience_for, audience_not_for, instructor_name, instructor_bio, instructor_photo, curriculum, includes, refund_policy, testimonials) VALUES
('public-speaking', 'Public Speaking', 'Master the art of confident communication...', 'Our Public Speaking program is designed to transform shy individuals into confident orators...', '/images/public-speaking.jpg', 'MicVocal', 'text-emerald-400', '12 weeks | Saturdays 10am-12pm | Open to ages 13-18', 'default', 'published', '["Commanding presence","Rhetorical techniques","Critical thinking","Emotional connection","Storytelling","Leadership communication"]', '[{"q":"Is this for beginners?","a":"Yes."},{"q":"Any fees?","a":"Free for members."}]', true, '12 weeks', '2 hours per week', '["Teens ages 13-18","Students who freeze in class presentations","Future leaders of clubs and teams"]', '["Adults seeking corporate communication training"]', 'Emmanuel Bature', 'Programs Coordinator and lead speaking coach with over 10 years training young orators across Plateau State.', '/images/maryam1.jpg', '[{"title":"Foundations of confident speaking","outcome":"Deliver a short self-introduction without notes"},{"title":"Body and voice","outcome":"Command a room with pace, pitch and posture"},{"title":"Structuring speeches","outcome":"Build an opening, argument and close that land"},{"title":"Persuasion and rhetoric","outcome":"Argue a position convincingly in under five minutes"},{"title":"Storytelling","outcome":"Weave personal narrative into any talk"},{"title":"Capstone showcase","outcome":"Present a full speech to a live audience"}]', '["Live weekly sessions","Personalised feedback on every speech","Certification on completion","Access to the alumni community"]', 'Full refund if you withdraw within the first two weeks of the program.', '[{"name":"Maryam Abdullah","designation":"Debate Champion, Class of 2025","quote":"BMAC transformed me from a shy girl who could not speak in class to a confident young woman who represented Plateau State at the National Debate Championship."}]'),
('literary-arts', 'Literary Arts', 'Explore creative writing, poetry, and storytelling...', 'The Literary Arts track nurtures young writers through workshops in poetry, short fiction...', '/images/literary-arts.jpg', 'BookOpen', 'text-blue-400', '10 weeks | Wednesdays 2pm-4pm | Open to ages 14-19', 'default', 'published', '["Narrative structure","Voice and style","Literary analysis","Portfolio building","Poetry delivery","Published author networking"]', '[{"q":"Need experience?","a":"No."},{"q":"Will my work be published?","a":"Yes."}]', true, '10 weeks', '2-3 hours per week', '["Writers ages 14-19","Young poets and storytellers","Teens building a writing portfolio"]', '["Established authors seeking an MFA"]', 'Grace Okonkwo', 'Literary Arts Lead and published poet who has mentored over 200 young writers in Jos.', '/images/maryam2.jpg', '[{"title":"Finding your voice","outcome":"Write a first draft of a personal essay or poem"},{"title":"Narrative structure","outcome":"Shape a story with a clear beginning, middle and end"},{"title":"Voice and style","outcome":"Edit your own work for clarity and rhythm"},{"title":"Poetry delivery","outcome":"Perform a piece at a public open mic"},{"title":"Portfolio building","outcome":"Compile a submission-ready portfolio"},{"title":"Anthology","outcome":"Publish a piece in the BMAC annual anthology"}]', '["Weekly writing workshops","One-on-one editorial feedback","Open mic performance slots","Publication in the annual anthology"]', 'Full refund if you withdraw within the first two weeks of the program.', '[{"name":"Chinedu Okafor","designation":"Published Poet, Class of 2024","quote":"The literary arts program helped me discover my voice as a poet. I have been published in two anthologies."}]'),
('digital-literacy', 'Digital Literacy', 'Navigate the digital world with confidence...', 'Digital Literacy bridges the technology gap...', '/images/digital-literacy.jpg', 'Monitor', 'text-purple-400', '8 weeks | Tue & Thu 3pm-5pm | Open to ages 12-17', 'default', 'published', '["Computer literacy","Productivity suite","Online research","Cybersecurity","Content creation","Social media literacy"]', '[{"q":"Need my own computer?","a":"We provide laptops."},{"q":"Class size?","a":"Max 15 per instructor."}]', true, '8 weeks', '3-4 hours per week', '["Teens ages 12-17","Complete beginners with no computer","Learners curious about the digital world"]', '["Advanced programmers"]', 'Grace Okonkwo', 'Digital Literacy Lead who has equipped over 500 students with their first computer skills.', '/images/maryam2.jpg', '[{"title":"Computer foundations","outcome":"Use a computer, keyboard and files with confidence"},{"title":"Productivity suite","outcome":"Create documents, spreadsheets and slides"},{"title":"Online research","outcome":"Find and evaluate information safely online"},{"title":"Cybersecurity","outcome":"Protect accounts and spot online scams"},{"title":"Content creation","outcome":"Design a simple digital poster or video"},{"title":"Capstone project","outcome":"Build and present a personal digital portfolio"}]', '["Use of BMAC laptops during sessions","Structured practice tasks","Certification on completion","A mentor for one month after graduation"]', 'Full refund if you withdraw within the first two weeks of the program.', '[{"name":"Aisha Mohammed","designation":"Digital Literacy Graduate, 2025","quote":"Before BMAC, I had never touched a computer. After Digital Literacy, I built my first website. Now I am teaching coding."}]'),
('mentorship', 'Mentorship Program', 'One-on-one guidance from accomplished professionals...', 'Our Mentorship Program pairs each participant with a dedicated mentor...', '/images/mentorship.jpg', 'Users', 'text-amber-400', '6 months | Monthly sessions | Ages 15-20', 'default', 'published', '["Goal setting","Career exploration","Academic strategies","Network building","Personal brand","Resilience"]', '[{"q":"How are mentors matched?","a":"Based on interests."},{"q":"Time commitment?","a":"2-3 hrs/month."}]', false, '6 months', '2-3 hours per month', '["Students ages 15-20","Young people exploring career paths","Those who want a trusted adult in their corner"]', '["Learners seeking academic tutoring only"]', 'Daniel Pwajok', 'Mentorship Director who has matched over 150 students with professionals across 20 fields.', '/images/maryam3.jpg', '[{"title":"Goal setting","outcome":"Define one clear goal and a plan to reach it"},{"title":"Career exploration","outcome":"Map three possible career paths with next steps"},{"title":"Academic strategies","outcome":"Build a study routine that works"},{"title":"Network building","outcome":"Hold your first professional conversation"},{"title":"Personal brand","outcome":"Present yourself confidently in any room"},{"title":"Sustained accountability","outcome":"Close the mentorship with a progress report"}]', '["A matched one-on-one mentor","Monthly guided sessions","Quarterly career workshops","Alumni network access"]', 'No fees - the mentorship program is free for all participants.', '[{"name":"Joshua Tanko","designation":"Law Student, University of Jos","quote":"The mentorship program connected me with a lawyer who guided me through my university applications. I am now studying law."}]'),
('debate-argumentation', 'Debate & Argumentation', 'Build critical thinking and structured argumentation skills...', 'Debate & Argumentation teaches the art of structured discourse...', '/images/competitions.jpg', 'Scale', 'text-rose-400', '12 weeks | Fridays 2pm-5pm | Ages 14-18', 'default', 'published', '["Parliamentary debate","Argument construction","Research","Ethical persuasion","Impromptu speaking","Case building"]', '[{"q":"Competitive?","a":"Yes."},{"q":"Need to be extrovert?","a":"No."}]', false, '12 weeks', '3 hours per week', '["Students ages 14-18","Budding debaters and public speakers","Those who want to argue with evidence, not emotion"]', '["Anyone looking for a casual conversation club"]', 'Emmanuel Bature', 'Programs Coordinator and coach for multiple Plateau State debating champions.', '/images/maryam1.jpg', '[{"title":"Parliamentary debate","outcome":"Understand and follow the debate format"},{"title":"Argument construction","outcome":"Build a motion statement with three clear points"},{"title":"Research","outcome":"Find and cite evidence under pressure"},{"title":"Impromptu speaking","outcome":"Deliver a two-minute unprepared response"},{"title":"Case building","outcome":"Prepare a complete team case in 30 minutes"},{"title":"Tournament ready","outcome":"Compete in a BMAC tournament"}]', '["Weekly coached debates","Team practice matches","Entry to BMAC debate tournaments","Certification on completion"]', 'Full refund if you withdraw within the first two weeks of the program.', '[]'),
('creative-writing', 'Creative Writing', 'Unlock imagination through storytelling...', 'Creative Writing takes young authors from blank page to finished stories...', '/images/literary-arts.jpg', 'Feather', 'text-cyan-400', '10 weeks | Saturdays 11am-1pm | Ages 13-17', 'default', 'published', '["Character development","Plot structure","Setting","Revision","Genre exploration","Peer feedback"]', '[{"q":"What type of writing?","a":"All genres."},{"q":"Final project?","a":"Published anthology."}]', false, '10 weeks', '2-3 hours per week', '["Writers ages 13-17","Storytellers with ideas but no finished draft","Those who want feedback that actually helps"]', '["Writers who only want to publish, not revise"]', 'Grace Okonkwo', 'Literary Arts Lead and editor of two BMAC anthologies.', '/images/maryam2.jpg', '[{"title":"Character development","outcome":"Create a protagonist readers will follow"},{"title":"Plot structure","outcome":"Map a story from hook to resolution"},{"title":"Setting","outcome":"Make place feel alive on the page"},{"title":"Revision","outcome":"Cut, sharpen and polish a full draft"},{"title":"Genre exploration","outcome":"Try a genre you have never written before"},{"title":"Anthology","outcome":"Submit a finished story for publication"}]', '["Weekly writing workshops","Peer critique circles","Editorial feedback on your draft","Publication in the annual anthology"]', 'Full refund if you withdraw within the first two weeks of the program.', '[]');

INSERT INTO public.events (id, date, title, venue, time, category, description, long_desc, is_paid, price, features, status, img, agenda, audience_for, audience_not_for, faqs, policies) VALUES
('event-1', '2026-07-15', 'Annual Speech Championship', 'Plateau State Cultural Centre, Jos', '10:00 AM', 'Competition', 'Witness the finest young orators compete for the coveted BMAC Speech Championship trophy.', 'The Annual Speech Championship is the highlight of BMAC public speaking calendar.', false, 0, '["Persuasive speaking","Live adjudication","Prize ceremony"]', 'published', '/images/public-speaking.jpg', '[{"time":"09:00 AM","title":"Arrival and registration"},{"time":"10:00 AM","title":"Opening address and judges introduction"},{"time":"11:00 AM","title":"Preliminary rounds"},{"time":"02:00 PM","title":"Semi-finals"},{"time":"04:00 PM","title":"Grand finale and prize ceremony"}]', '["Students and young orators ages 13-18","School debate clubs and teams","Parents and guardians"]', '["Children under 13 without a school team"]', '[{"q":"Can I attend as a spectator?","a":"Yes - general admission is free and open to the public."},{"q":"Can schools enter a team?","a":"Yes - schools may register teams of up to three speakers."}]', 'Free event. Cancellations are not required, but we appreciate notice at least 48 hours before the event.'),
('event-2', '2026-08-10', 'Digital Skills Bootcamp', 'BMAC Learning Hub, Jos', '9:00 AM', 'Workshop', 'A 3-day intensive bootcamp covering web design, digital content creation, and online safety.', 'This hands-on bootcamp immerses participants in practical digital skills.', true, 5000, '["Hands-on labs","Expert facilitation","Certificate"]', 'published', '/images/digital-literacy.jpg', '[{"time":"Day 1","title":"Web design foundations"},{"time":"Day 2","title":"Digital content creation"},{"time":"Day 3","title":"Online safety and project showcase"}]', '["Teens ages 12-17","Complete beginners with no tech background","Learners building their first portfolio"]', '["Advanced or professional developers"]', '[{"q":"Do I need my own laptop?","a":"We provide laptops for the duration of the bootcamp."},{"q":"Will I get a certificate?","a":"Yes - all participants who complete the 3 days receive a certificate."}]', 'Full refund if you cancel at least 72 hours before the bootcamp start date.'),
('event-3', '2026-06-20', 'Literary Open Mic Night', 'The Reading Room, Jos', '5:00 PM', 'Culture', 'An evening of poetry, spoken word, and storytelling featuring BMAC participants.', 'Our quarterly Open Mic Night provides a platform for young writers.', false, 0, '["Poetry slam","Story circle","Guest artist"]', 'published', '/images/literary-arts.jpg', '[{"time":"05:00 PM","title":"Doors open and open mic sign-up"},{"time":"06:00 PM","title":"Poetry slam"},{"time":"07:00 PM","title":"Story circle"},{"time":"08:00 PM","title":"Guest artist and close"}]', '["Writers, poets and storytellers of all ages","Emerging spoken-word artists","Book and arts lovers"]', '["Closed-door private events - this is a public showcase"]', '[{"q":"Can I perform on the night?","a":"Yes - sign up at the door; slots are first come, first served."},{"q":"Is there an entry fee?","a":"No - admission is free."}]', 'Free event. No tickets or refunds required.'),
('event-4', '2026-09-05', 'Career Day 2026', 'Hill Station Hotel, Jos', '10:00 AM', 'Mentorship', 'Connect with professionals from diverse fields.', 'Career Day brings together professionals from various fields.', false, 0, '["Keynote sessions","Breakout tracks","Networking"]', 'published', '/images/mentorship.jpg', '[{"time":"10:00 AM","title":"Keynote sessions"},{"time":"12:00 PM","title":"Breakout tracks by field"},{"time":"02:00 PM","title":"Networking lunch"},{"time":"03:00 PM","title":"Mentor speed-matching"}]', '["Students ages 15-20 exploring careers","Final-year secondary students","Young graduates seeking direction"]', '["Working professionals seeking job placement"]', '[{"q":"How do I prepare?","a":"Bring your CV or a list of questions for mentors."},{"q":"Is lunch included?","a":"Yes - a networking lunch is provided."}]', 'Free event. Please cancel at least 48 hours in advance if you can no longer attend.'),
('event-5', '2026-07-25', 'Community Clean-Up & Outreach', 'Jos City Centre', '7:00 AM', 'Community', 'Join fellow BMAC ambassadors for a day of community service.', 'This community outreach event embodies BMAC commitment to civic responsibility.', false, 0, '["Team volunteering","Tree planting","Football match"]', 'published', '/images/peace.jpg', '[{"time":"07:00 AM","title":"Gathering and briefing"},{"time":"08:00 AM","title":"Clean-up and tree planting"},{"time":"12:00 PM","title":"Rest, lunch and football match"}]', '["BMAC ambassadors and alumni","Volunteers of all ages","Community groups and schools"]', '["Those unable to commit to outdoor work in the morning"]', '[{"q":"What should I bring?","a":"Gloves, water bottle and sun protection. Tools are provided."},{"q":"Can children join?","a":"Yes - under 14s should be accompanied by a guardian."}]', 'Free event. Rain or shine.'),
('event-6', '2026-10-12', 'Partnership Gala & Fundraiser', 'Jos Museum Events Hall', '4:00 PM', 'Partnership', 'Annual fundraising gala celebrating BMAC achievements.', 'The Partnership Gala brings together donors, partners, alumni.', true, 15000, '["Impact showcase","Testimonials","Fundraising auction"]', 'published', '/images/award.jpg', '[{"time":"04:00 PM","title":"Arrival and welcome drinks"},{"time":"05:00 PM","title":"Impact showcase and testimonials"},{"time":"06:00 PM","title":"Fundraising auction"},{"time":"08:00 PM","title":"Gala dinner and close"}]', '["Donors, partners and sponsors","Alumni and BMAC families","Friends of the movement"]', '["Casual drop-ins - this is a ticketed formal event"]', '[{"q":"What does my ticket include?","a":"Full access, welcome drinks, gala dinner and the auction."},{"q":"Is the ticket tax-deductible?","a":"A portion of your ticket is a donation and qualifies for a receipt."}]', 'Tickets are non-refundable but fully transferable up to 48 hours before the gala.');

INSERT INTO public.news_articles (id, date, title, description, content, img, category, featured, status) VALUES
('news-1', '2026-05-10', 'BMAC Ambassadors Shine at National Debate Championship', 'Three BMAC ambassadors brought home gold medals from the National Youth Debate Championship.', 'Three BMAC ambassadors representing Plateau State emerged victorious at the National Youth Debate Championship held in Abuja.', '/images/award.jpg', 'Achievements', false, 'published'),
('news-2', '2026-04-22', 'Digital Literacy Program Expands to Rural Communities', 'BMAC launches mobile digital literacy units to bring computer skills training to underserved rural areas.', 'BMAC Digital Literacy Program is going mobile.', '/images/digital-literacy.jpg', 'Programs', false, 'published'),
('news-3', '2026-03-15', 'Alumni Spotlight: From BMAC to Law School', 'Meet Joshua Tanko, BMAC first alumnus to gain admission to the Nigerian Law School.', 'Joshua Tanko, 19, credits BMAC public speaking program for his confidence.', '/images/jagabs.jpg', 'Alumni', true, 'published'),
('news-4', '2026-02-28', 'BMAC Partners with Tech Hub for Digital Skills Initiative', 'New partnership with Jos Tech Hub will provide advanced digital skills training.', 'BMAC has signed a MoU with Jos Tech Hub.', '/images/competitions.jpg', 'Partnerships', false, 'published'),
('news-5', '2026-02-10', 'Open Mic Night Draws Record Crowd', 'The quarterly Literary Open Mic Night attracted over 300 attendees.', 'BMAC quarterly Open Mic Night set a new attendance record.', '/images/ws.jpg', 'Events', false, 'published'),
('news-6', '2026-01-20', 'Call for Mentors: Shape the Next Generation', 'BMAC is seeking professionals from all fields to serve as mentors.', 'BMAC mentorship program is recruiting professionals.', '/images/mentorship.jpg', 'Announcements', false, 'published');

INSERT INTO public.testimonials (id, name, designation, quote, src, status) VALUES
('test-1', 'Maryam Abdullah', 'Debate Champion, Class of 2025', 'BMAC transformed me from a shy girl who could not speak in class to a confident young woman who represented Plateau State at the National Debate Championship.', '/images/maryam1.jpg', 'published'),
('test-2', 'Joshua Tanko', 'Law Student, University of Jos', 'The mentorship program connected me with a lawyer who guided me through my university applications. I am now studying law.', '/images/jagabs.jpg', 'published'),
('test-3', 'Aisha Mohammed', 'Digital Literacy Graduate, 2025', 'Before BMAC, I had never touched a computer. After Digital Literacy, I built my first website. Now I am teaching coding.', '/images/peace.jpg', 'published'),
('test-4', 'Chinedu Okafor', 'Published Poet, Class of 2024', 'The literary arts program helped me discover my voice as a poet. I have been published in two anthologies.', '/images/sun.jpg', 'published');

INSERT INTO public.team_members (id, name, role, img, status) VALUES
('team-1', 'Sarah Adeyemi', 'Executive Director', '/images/maryam.jpg', 'published'),
('team-2', 'Emmanuel Bature', 'Programs Coordinator', '/images/maryam1.jpg', 'published'),
('team-3', 'Grace Okonkwo', 'Digital Literacy Lead', '/images/maryam2.jpg', 'published'),
('team-4', 'Daniel Pwajok', 'Mentorship Director', '/images/maryam3.jpg', 'published');

INSERT INTO public.impact_stats (id, num, label, icon, status, "order") VALUES
('stat-1', '500+', 'Students Reached', 'Users', 'published', 1),
('stat-2', '12', 'Programs Offered', 'BookOpen', 'published', 2),
('stat-3', '15+', 'Partner Schools', 'School', 'published', 3),
('stat-4', '98%', 'Graduation Rate', 'Award', 'published', 4);

INSERT INTO public.gallery_items (id, img, category, alt, status) VALUES
('gallery-1', '/images/competitions.jpg', 'Events', 'BMAC Debate Championship', 'published'),
('gallery-2', '/images/ws.jpg', 'Workshops', 'Digital Literacy Workshop', 'published'),
('gallery-3', '/images/public-speaking.jpg', 'Programs', 'Public Speaking Session', 'published'),
('gallery-4', '/images/mentorship.jpg', 'Mentorship', 'Mentorship Meeting', 'published'),
('gallery-5', '/images/award.jpg', 'Events', 'Award Ceremony', 'published'),
('gallery-6', '/images/digital-literacy.jpg', 'Workshops', 'Computer Lab Session', 'published'),
('gallery-7', '/images/literary-arts.jpg', 'Programs', 'Literary Arts Workshop', 'published'),
('gallery-8', '/images/peace.jpg', 'Community', 'Community Outreach', 'published');

INSERT INTO public.partners (id, name, logo, url, status, "order") VALUES
('partner-1', 'UNICEF', '/images/partner-placeholder.svg', 'https://www.unicef.org', 'active', 1),
('partner-2', 'British Council', '/images/partner-placeholder.svg', '', 'active', 2),
('partner-3', 'Plateau State Government', '/images/partner-placeholder.svg', '', 'active', 3),
('partner-4', 'Tech Hub Jos', '/images/partner-placeholder.svg', '', 'active', 4),
('partner-5', 'African Leadership Academy', '/images/partner-placeholder.svg', '', 'active', 5),
('partner-6', 'MTN Foundation', '/images/partner-placeholder.svg', '', 'active', 6);

INSERT INTO public.site_settings (id, logo_text, navigation, social_links, copyright) VALUES
('settings-1', 'BMAC', '[{"name":"Home","href":"/"},{"name":"Programs","href":"/programs"},{"name":"Events","href":"/events"},{"name":"News","href":"/news"},{"name":"Gallery","href":"/gallery"},{"name":"About","href":"/about"},{"name":"Contact","href":"/contact"}]', '[{"name":"Instagram","href":"https://instagram.com/bmac","icon":"Instagram"},{"name":"Twitter","href":"https://twitter.com/bmac","icon":"Twitter"},{"name":"YouTube","href":"https://youtube.com/@bmac","icon":"Youtube"}]', '(c) 2026 Brilliant Minds Ambassadors Club. All rights reserved.');

INSERT INTO public.activity_logs (id, "user", action, resource, resource_id, details, timestamp) VALUES
('log-1', 'Sarah Adeyemi', 'login', 'session', 'admin-1', 'Admin logged in', NOW() - INTERVAL '2 hours'),
('log-2', 'Sarah Adeyemi', 'create', 'news_articles', 'news-7', 'Created article: BMAC Summer Workshop Registration Open', NOW() - INTERVAL '3 hours'),
('log-3', 'Emmanuel Bature', 'update', 'events', 'event-1', 'Updated event: Annual Speech Championship', NOW() - INTERVAL '5 hours'),
('log-4', 'Grace Okonkwo', 'delete', 'testimonials', 'test-5', 'Deleted testimonial from John Doe', NOW() - INTERVAL '1 day'),
('log-5', 'Sarah Adeyemi', 'create', 'programs', 'debate-advanced', 'Created program: Advanced Debate', NOW() - INTERVAL '2 days'),
('log-6', 'Daniel Pwajok', 'update', 'team_members', 'team-3', 'Updated role for Grace Okonkwo', NOW() - INTERVAL '2 days'),
('log-7', 'Emmanuel Bature', 'login', 'session', 'admin-2', 'Admin logged in', NOW() - INTERVAL '3 days'),
('log-8', 'Grace Okonkwo', 'create', 'gallery_items', 'gallery-9', 'Added gallery image: Workshop Group Photo', NOW() - INTERVAL '3 days'),
('log-9', 'Sarah Adeyemi', 'update', 'site_settings', 'settings-1', 'Updated navigation links', NOW() - INTERVAL '4 days'),
('log-10', 'Emmanuel Bature', 'publish', 'events', 'event-4', 'Published event: Career Day 2026', NOW() - INTERVAL '5 days'),
('log-11', 'Daniel Pwajok', 'create', 'news_articles', 'news-8', 'Created article: Mentorship Impact Report 2026', NOW() - INTERVAL '6 days'),
('log-12', 'Sarah Adeyemi', 'login', 'session', 'admin-1', 'Admin logged in', NOW() - INTERVAL '7 days'),
('log-13', 'Grace Okonkwo', 'update', 'programs', 'digital-literacy', 'Updated program description', NOW() - INTERVAL '8 days'),
('log-14', 'Emmanuel Bature', 'delete', 'gallery_items', 'gallery-3', 'Deleted outdated gallery image', NOW() - INTERVAL '9 days'),
('log-15', 'Sarah Adeyemi', 'create', 'events', 'event-7', 'Created event: End of Year Gala', NOW() - INTERVAL '10 days');
