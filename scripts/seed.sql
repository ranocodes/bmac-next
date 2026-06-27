TRUNCATE TABLE public.programs, public.events, public.news_articles, public.testimonials, public.team_members, public.impact_stats, public.gallery_items, public.partners, public.site_settings, public.activity_logs RESTART IDENTITY CASCADE;

INSERT INTO public.programs (id, title, description, long_desc, img, icon, color, details, variant, status, skills, faqs, landing_page) VALUES
('public-speaking', 'Public Speaking', 'Master the art of confident communication...', 'Our Public Speaking program is designed to transform shy individuals into confident orators...', '/images/public-speaking.jpg', 'MicVocal', 'text-emerald-400', '12 weeks | Saturdays 10am-12pm | Open to ages 13-18', 'default', 'published', '["Commanding presence","Rhetorical techniques","Critical thinking","Emotional connection","Storytelling","Leadership communication"]', '[{"q":"Is this for beginners?","a":"Yes."},{"q":"Any fees?","a":"Free for members."}]', true),
('literary-arts', 'Literary Arts', 'Explore creative writing, poetry, and storytelling...', 'The Literary Arts track nurtures young writers through workshops in poetry, short fiction...', '/images/literary-arts.jpg', 'BookOpen', 'text-blue-400', '10 weeks | Wednesdays 2pm-4pm | Open to ages 14-19', 'default', 'published', '["Narrative structure","Voice and style","Literary analysis","Portfolio building","Poetry delivery","Published author networking"]', '[{"q":"Need experience?","a":"No."},{"q":"Will my work be published?","a":"Yes."}]', true),
('digital-literacy', 'Digital Literacy', 'Navigate the digital world with confidence...', 'Digital Literacy bridges the technology gap...', '/images/digital-literacy.jpg', 'Monitor', 'text-purple-400', '8 weeks | Tue & Thu 3pm-5pm | Open to ages 12-17', 'default', 'published', '["Computer literacy","Productivity suite","Online research","Cybersecurity","Content creation","Social media literacy"]', '[{"q":"Need my own computer?","a":"We provide laptops."},{"q":"Class size?","a":"Max 15 per instructor."}]', true),
('mentorship', 'Mentorship Program', 'One-on-one guidance from accomplished professionals...', 'Our Mentorship Program pairs each participant with a dedicated mentor...', '/images/mentorship.jpg', 'Users', 'text-amber-400', '6 months | Monthly sessions | Ages 15-20', 'default', 'published', '["Goal setting","Career exploration","Academic strategies","Network building","Personal brand","Resilience"]', '[{"q":"How are mentors matched?","a":"Based on interests."},{"q":"Time commitment?","a":"2-3 hrs/month."}]', false),
('debate-argumentation', 'Debate & Argumentation', 'Build critical thinking and structured argumentation skills...', 'Debate & Argumentation teaches the art of structured discourse...', '/images/competitions.jpg', 'Scale', 'text-rose-400', '12 weeks | Fridays 2pm-5pm | Ages 14-18', 'default', 'published', '["Parliamentary debate","Argument construction","Research","Ethical persuasion","Impromptu speaking","Case building"]', '[{"q":"Competitive?","a":"Yes."},{"q":"Need to be extrovert?","a":"No."}]', false),
('creative-writing', 'Creative Writing', 'Unlock imagination through storytelling...', 'Creative Writing takes young authors from blank page to finished stories...', '/images/literary-arts.jpg', 'Feather', 'text-cyan-400', '10 weeks | Saturdays 11am-1pm | Ages 13-17', 'default', 'published', '["Character development","Plot structure","Setting","Revision","Genre exploration","Peer feedback"]', '[{"q":"What type of writing?","a":"All genres."},{"q":"Final project?","a":"Published anthology."}]', false);

INSERT INTO public.events (id, date, title, venue, time, category, description, long_desc, is_paid, price, features, status) VALUES
('event-1', '2026-07-15', 'Annual Speech Championship', 'Plateau State Cultural Centre, Jos', '10:00 AM', 'Competition', 'Witness the finest young orators compete for the coveted BMAC Speech Championship trophy.', 'The Annual Speech Championship is the highlight of BMAC public speaking calendar.', false, 0, '["Persuasive speaking","Live adjudication","Prize ceremony"]', 'published'),
('event-2', '2026-08-10', 'Digital Skills Bootcamp', 'BMAC Learning Hub, Jos', '9:00 AM', 'Workshop', 'A 3-day intensive bootcamp covering web design, digital content creation, and online safety.', 'This hands-on bootcamp immerses participants in practical digital skills.', true, 5000, '["Hands-on labs","Expert facilitation","Certificate"]', 'published'),
('event-3', '2026-06-20', 'Literary Open Mic Night', 'The Reading Room, Jos', '5:00 PM', 'Culture', 'An evening of poetry, spoken word, and storytelling featuring BMAC participants.', 'Our quarterly Open Mic Night provides a platform for young writers.', false, 0, '["Poetry slam","Story circle","Guest artist"]', 'published'),
('event-4', '2026-09-05', 'Career Day 2026', 'Hill Station Hotel, Jos', '10:00 AM', 'Mentorship', 'Connect with professionals from diverse fields.', 'Career Day brings together professionals from various fields.', false, 0, '["Keynote sessions","Breakout tracks","Networking"]', 'published'),
('event-5', '2026-07-25', 'Community Clean-Up & Outreach', 'Jos City Centre', '7:00 AM', 'Community', 'Join fellow BMAC ambassadors for a day of community service.', 'This community outreach event embodies BMAC commitment to civic responsibility.', false, 0, '["Team volunteering","Tree planting","Football match"]', 'published'),
('event-6', '2026-10-12', 'Partnership Gala & Fundraiser', 'Jos Museum Events Hall', '4:00 PM', 'Partnership', 'Annual fundraising gala celebrating BMAC achievements.', 'The Partnership Gala brings together donors, partners, alumni.', true, 15000, '["Impact showcase","Testimonials","Fundraising auction"]', 'published');

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
