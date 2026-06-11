import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.NEON_DB_URL!);

async function seed() {
  // Truncate all tables
  await sql`TRUNCATE TABLE public.programs, public.events, public.news_articles, public.testimonials, public.team_members, public.impact_stats, public.gallery_items, public.partners, public.site_settings RESTART IDENTITY CASCADE`;

  // Programs
  await sql`INSERT INTO public.programs (id, title, description, long_desc, img_url, icon_name, color_class, details, status, landing_page, skills, faqs) VALUES
    ('public-speaking', 'Public Speaking', 'Master the art of confident communication...', 'Our Public Speaking program is designed to transform shy individuals into confident orators...', '/images/public-speaking.jpg', 'MicVocal', 'text-emerald-400', '12 weeks | Saturdays 10am-12pm | Open to ages 13-18', 'published', true, '["Commanding presence","Rhetorical techniques","Critical thinking","Emotional connection","Storytelling","Leadership communication"]', '[{"q":"Is this for beginners?","a":"Yes."},{"q":"Any fees?","a":"Free for members."}]'),
    ('literary-arts', 'Literary Arts', 'Explore creative writing, poetry, and storytelling...', 'The Literary Arts track nurtures young writers through workshops in poetry, short fiction...', '/images/literary-arts.jpg', 'BookOpen', 'text-blue-400', '10 weeks | Wednesdays 2pm-4pm | Open to ages 14-19', 'published', true, '["Narrative structure","Voice and style","Literary analysis","Portfolio building","Poetry delivery","Published author networking"]', '[{"q":"Need experience?","a":"No."},{"q":"Will my work be published?","a":"Yes."}]'),
    ('digital-literacy', 'Digital Literacy', 'Navigate the digital world with confidence...', 'Digital Literacy bridges the technology gap...', '/images/digital-literacy.jpg', 'Monitor', 'text-purple-400', '8 weeks | Tue & Thu 3pm-5pm | Open to ages 12-17', 'published', true, '["Computer literacy","Productivity suite","Online research","Cybersecurity","Content creation","Social media literacy"]', '[{"q":"Need my own computer?","a":"We provide laptops."},{"q":"Class size?","a":"Max 15 per instructor."}]'),
    ('mentorship', 'Mentorship Program', 'One-on-one guidance from accomplished professionals...', 'Our Mentorship Program pairs each participant with a dedicated mentor...', '/images/mentorship.jpg', 'Users', 'text-amber-400', '6 months | Monthly sessions | Ages 15-20', 'published', false, '["Goal setting","Career exploration","Academic strategies","Network building","Personal brand","Resilience"]', '[{"q":"How are mentors matched?","a":"Based on interests."},{"q":"Time commitment?","a":"2-3 hrs/month."}]'),
    ('debate-argumentation', 'Debate & Argumentation', 'Build critical thinking and structured argumentation skills...', 'Debate & Argumentation teaches the art of structured discourse...', '/images/competitions.jpg', 'Scale', 'text-rose-400', '12 weeks | Fridays 2pm-5pm | Ages 14-18', 'published', false, '["Parliamentary debate","Argument construction","Research","Ethical persuasion","Impromptu speaking","Case building"]', '[{"q":"Competitive?","a":"Yes."},{"q":"Need to be extrovert?","a":"No."}]'),
    ('creative-writing', 'Creative Writing', 'Unlock imagination through storytelling...', 'Creative Writing takes young authors from blank page to finished stories...', '/images/literary-arts.jpg', 'Feather', 'text-cyan-400', '10 weeks | Saturdays 11am-1pm | Ages 13-17', 'published', false, '["Character development","Plot structure","Setting","Revision","Genre exploration","Peer feedback"]', '[{"q":"What type of writing?","a":"All genres."},{"q":"Final project?","a":"Published anthology."}]')
  `;

  // Events
  await sql`INSERT INTO public.events (id, title, event_date, time, venue, description, long_description, category, is_paid, price, features) VALUES
    ('event-1', 'Annual Speech Championship', '2026-07-15', '10:00 AM', 'Plateau State Cultural Centre, Jos', 'Witness the finest young orators compete for the coveted BMAC Speech Championship trophy.', 'The Annual Speech Championship is the highlight of BMAC public speaking calendar.', 'Competition', false, 0, '["Persuasive speaking","Live adjudication","Prize ceremony"]'),
    ('event-2', 'Digital Skills Bootcamp', '2026-08-10', '9:00 AM', 'BMAC Learning Hub, Jos', 'A 3-day intensive bootcamp covering web design, digital content creation, and online safety.', 'This hands-on bootcamp immerses participants in practical digital skills.', 'Workshop', true, 5000, '["Hands-on labs","Expert facilitation","Certificate"]'),
    ('event-3', 'Literary Open Mic Night', '2026-06-20', '5:00 PM', 'The Reading Room, Jos', 'An evening of poetry, spoken word, and storytelling featuring BMAC participants.', 'Our quarterly Open Mic Night provides a platform for young writers.', 'Culture', false, 0, '["Poetry slam","Story circle","Guest artist"]'),
    ('event-4', 'Career Day 2026', '2026-09-05', '10:00 AM', 'Hill Station Hotel, Jos', 'Connect with professionals from diverse fields.', 'Career Day brings together professionals from various fields.', 'Mentorship', false, 0, '["Keynote sessions","Breakout tracks","Networking"]'),
    ('event-5', 'Community Clean-Up & Outreach', '2026-07-25', '7:00 AM', 'Jos City Centre', 'Join fellow BMAC ambassadors for a day of community service.', 'This community outreach event embodies BMAC commitment to civic responsibility.', 'Community', false, 0, '["Team volunteering","Tree planting","Football match"]'),
    ('event-6', 'Partnership Gala & Fundraiser', '2026-10-12', '4:00 PM', 'Jos Museum Events Hall', 'Annual fundraising gala celebrating BMAC achievements.', 'The Partnership Gala brings together donors, partners, alumni.', 'Partnership', true, 15000, '["Impact showcase","Testimonials","Fundraising auction"]')
  `;

  // News
  await sql`INSERT INTO public.news_articles (id, title, date, category, featured, description, content, img_url) VALUES
    ('news-1', 'BMAC Ambassadors Shine at National Debate Championship', '2026-05-10', 'Achievements', false, 'Three BMAC ambassadors brought home gold medals from the National Youth Debate Championship.', 'Three BMAC ambassadors representing Plateau State emerged victorious at the National Youth Debate Championship held in Abuja.', '/images/award.jpg'),
    ('news-2', 'Digital Literacy Program Expands to Rural Communities', '2026-04-22', 'Programs', false, 'BMAC launches mobile digital literacy units to bring computer skills training to underserved rural areas.', 'BMAC Digital Literacy Program is going mobile.', '/images/digital-literacy.jpg'),
    ('news-3', 'Alumni Spotlight: From BMAC to Law School', '2026-03-15', 'Alumni', true, 'Meet Joshua Tanko, BMAC first alumnus to gain admission to the Nigerian Law School.', 'Joshua Tanko, 19, credits BMAC public speaking program for his confidence.', '/images/jagabs.jpg'),
    ('news-4', 'BMAC Partners with Tech Hub for Digital Skills Initiative', '2026-02-28', 'Partnerships', false, 'New partnership with Jos Tech Hub will provide advanced digital skills training.', 'BMAC has signed a MoU with Jos Tech Hub.', '/images/competitions.jpg'),
    ('news-5', 'Open Mic Night Draws Record Crowd', '2026-02-10', 'Events', false, 'The quarterly Literary Open Mic Night attracted over 300 attendees.', 'BMAC quarterly Open Mic Night set a new attendance record.', '/images/ws.jpg'),
    ('news-6', 'Call for Mentors: Shape the Next Generation', '2026-01-20', 'Announcements', false, 'BMAC is seeking professionals from all fields to serve as mentors.', 'BMAC mentorship program is recruiting professionals.', '/images/mentorship.jpg')
  `;

  // Testimonials
  await sql`INSERT INTO public.testimonials (id, quote, name, designation, src, status) VALUES
    ('test-1', 'BMAC transformed me from a shy girl who could not speak in class to a confident young woman who represented Plateau State at the National Debate Championship.', 'Maryam Abdullah', 'Debate Champion, Class of 2025', '/images/maryam1.jpg', 'published'),
    ('test-2', 'The mentorship program connected me with a lawyer who guided me through my university applications. I am now studying law.', 'Joshua Tanko', 'Law Student, University of Jos', '/images/jagabs.jpg', 'published'),
    ('test-3', 'Before BMAC, I had never touched a computer. After Digital Literacy, I built my first website. Now I am teaching coding.', 'Aisha Mohammed', 'Digital Literacy Graduate, 2025', '/images/peace.jpg', 'published'),
    ('test-4', 'The literary arts program helped me discover my voice as a poet. I have been published in two anthologies.', 'Chinedu Okafor', 'Published Poet, Class of 2024', '/images/sun.jpg', 'published')
  `;

  // Team
  await sql`INSERT INTO public.team_members (id, name, role, img, status) VALUES
    ('team-1', 'Sarah Adeyemi', 'Executive Director', '/images/maryam.jpg', 'published'),
    ('team-2', 'Emmanuel Bature', 'Programs Coordinator', '/images/maryam1.jpg', 'published'),
    ('team-3', 'Grace Okonkwo', 'Digital Literacy Lead', '/images/maryam2.jpg', 'published'),
    ('team-4', 'Daniel Pwajok', 'Mentorship Director', '/images/maryam3.jpg', 'published')
  `;

  // Impact Stats
  await sql`INSERT INTO public.impact_stats (id, num, label, icon, status) VALUES
    ('stat-1', '500+', 'Students Reached', 'Users', 'published'),
    ('stat-2', '12', 'Programs Offered', 'BookOpen', 'published'),
    ('stat-3', '15+', 'Partner Schools', 'School', 'published'),
    ('stat-4', '98%', 'Graduation Rate', 'Award', 'published')
  `;

  // Gallery
  await sql`INSERT INTO public.gallery_items (id, img, category, alt, status) VALUES
    ('gallery-1', '/images/competitions.jpg', 'Events', 'BMAC Debate Championship', 'published'),
    ('gallery-2', '/images/ws.jpg', 'Workshops', 'Digital Literacy Workshop', 'published'),
    ('gallery-3', '/images/public-speaking.jpg', 'Programs', 'Public Speaking Session', 'published'),
    ('gallery-4', '/images/mentorship.jpg', 'Mentorship', 'Mentorship Meeting', 'published'),
    ('gallery-5', '/images/award.jpg', 'Events', 'Award Ceremony', 'published'),
    ('gallery-6', '/images/digital-literacy.jpg', 'Workshops', 'Computer Lab Session', 'published'),
    ('gallery-7', '/images/literary-arts.jpg', 'Programs', 'Literary Arts Workshop', 'published'),
    ('gallery-8', '/images/peace.jpg', 'Community', 'Community Outreach', 'published')
  `;

  // Partners
  await sql`INSERT INTO public.partners (id, name, logo, url, status, "order") VALUES
    ('partner-1', 'UNICEF', '/images/partner-placeholder.svg', 'https://www.unicef.org', 'active', 1),
    ('partner-2', 'British Council', '/images/partner-placeholder.svg', NULL, 'active', 2),
    ('partner-3', 'Plateau State Government', '/images/partner-placeholder.svg', NULL, 'active', 3),
    ('partner-4', 'Tech Hub Jos', '/images/partner-placeholder.svg', NULL, 'active', 4),
    ('partner-5', 'African Leadership Academy', '/images/partner-placeholder.svg', NULL, 'active', 5),
    ('partner-6', 'MTN Foundation', '/images/partner-placeholder.svg', NULL, 'active', 6)
  `;

  // Site settings
  await sql`INSERT INTO public.site_settings (id, logo_text, navigation, copyright, social_links) VALUES (
    'settings-1',
    'BMAC',
    ${JSON.stringify([{ name: 'Home', href: '/' }, { name: 'Programs', href: '/programs' }, { name: 'Events', href: '/events' }, { name: 'News', href: '/news' }, { name: 'Gallery', href: '/gallery' }, { name: 'About', href: '/about' }, { name: 'Contact', href: '/contact' }])},
    ${'(c) 2026 Brilliant Minds Ambassadors Club. All rights reserved.'},
    ${JSON.stringify([{ name: 'Instagram', href: 'https://instagram.com/bmac', icon: 'Instagram' }, { name: 'Twitter', href: 'https://twitter.com/bmac', icon: 'Twitter' }, { name: 'YouTube', href: 'https://youtube.com/@bmac', icon: 'Youtube' }])}
  )`;

  console.log("Seed complete!");
}

seed().catch(console.error);
