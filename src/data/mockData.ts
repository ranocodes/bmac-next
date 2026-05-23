import React from "react";
import { 
  Mic, BookOpen, Users, Trophy, Cpu, 
  ShieldCheck, Zap, Sparkles, Target, Calendar
} from "lucide-react";
import { Program, EventPass, NewsArticle, TeamMember, ImpactStat, GalleryItem } from "@/types/cms";

export const programsData: Program[] = [
  {
    id: "public-speaking",
    title: "Public Speaking",
    desc: "Build confidence and master the art of compelling delivery through live practice.",
    longDesc: "Our Public Speaking workshop is the cornerstone of the BMAC experience. We take members through a journey from overcoming stage fright to mastering the nuances of rhetorical persuasion. Weekly sessions involve impromptu speaking drills, prepared speech feedback, and workshops on vocal projection and body language.",
    img: "/images/public-speaking.jpg",
    icon: React.createElement(Mic, { className: "w-6 h-6" }),
    color: "bg-emerald-50 text-emerald-600",
    details: "Every Saturday, 9am-12pm|BMAC Hall, Jos|Open to all members|Facilitated by experts",
    variant: "featured",
  },
  {
    id: "literary-arts",
    title: "Literary & Spoken Word",
    desc: "Explore creative writing and performance in a space that celebrates expression.",
    longDesc: "The Literary Arts program is where pens meet performance. Members explore various forms of creative writing, from traditional poetry and prose to modern spoken word. We focus on storytelling techniques, rhythmic flow, and emotional connection, culminating in regular performance showcases and published anthologies.",
    img: "/images/literary-arts.jpg",
    icon: React.createElement(BookOpen, { className: "w-6 h-6" }),
    color: "bg-amber-50 text-amber-600",
    details: "Biweekly Wednesdays, 4pm|Monthly open mics|Quarterly showcases|Annual anthology",
    variant: "default",
  },
  {
    id: "mentorship",
    title: "Mentorship",
    desc: "Connect with professionals who guide your personal and career development.",
    longDesc: "Our Mentorship program bridges the gap between ambition and experience. We pair members with professionals and BMAC alumni who provide one-on-one guidance on career planning, leadership development, and personal growth. This 6-month commitment ensures meaningful, life-changing connections.",
    img: "/images/mentorship.jpg",
    icon: React.createElement(Users, { className: "w-6 h-6" }),
    color: "bg-blue-50 text-blue-600",
    details: "Monthly 1-on-1 sessions|Matched by interest|Career focus|6-month minimum",
    variant: "default",
  },
  {
    id: "competitions",
    title: "Competitions",
    desc: "Test your skills in debates, writing contests, and academic challenges.",
    longDesc: "BMAC Ambassadors are known for their competitive spirit. We organize and participate in regional and national debate championships, creative writing contests, and academic quiz tournaments. These competitions provide high-stakes environments for members to apply the skills they've learned in our workshops.",
    img: "/images/digital-literacy.jpg",
    icon: React.createElement(Trophy, { className: "w-6 h-6" }),
    color: "bg-rose-50 text-rose-600",
    details: "Inter-school debates|Writing contests|Regional travel|Medals and trophies",
    variant: "default",
  },
  {
    id: "digital-literacy",
    title: "Digital Literacy",
    desc: "Develop essential digital skills and analytical thinking for the modern world.",
    longDesc: "Our Digital Literacy program ensures that ambassadors are not just confident speakers, but technically proficient leaders. We cover essential tools for research, productivity, and online safety, ensuring our members can navigate the digital landscape with integrity and skill.",
    img: "/images/gallery-hero.jpg",
    icon: React.createElement(Cpu, { className: "w-6 h-6" }),
    color: "bg-indigo-50 text-indigo-600",
    details: "6-week curriculum|Research tools|Online safety|Tech partnerships",
    variant: "default",
  },
];

export const eventsData: EventPass[] = [
  { 
    id: "public-speaking-march-2026",
    date: "March 15, 2026", 
    title: "Public Speaking Workshop", 
    venue: "BMAC Hall, Nalado Street", 
    time: "09:00 AM",
    category: "Workshop",
    desc: "An intensive training session focused on mastering impromptu speaking and commanding the stage with authority.",
    longDesc: "Join us for our monthly intensive workshop where we deep dive into the mechanics of effective communication. This month, we focus on the art of 'The Spontaneous Leader' — learning how to think on your feet and deliver compelling messages under pressure. Whether you are a beginner or looking to refine your expertise, our facilitators will guide you through practical exercises and live feedback sessions."
  },
  { 
    id: "inter-school-debate-april-2026",
    date: "April 2, 2026", 
    title: "Inter-School Debate", 
    venue: "Hillside Hotel, Jos", 
    time: "10:30 AM",
    category: "Competition",
    desc: "A high-stakes debate competition featuring top students from across Plateau State competing for the 2026 Trophy.",
    longDesc: "The BMAC Inter-School Debate Championship returns to Hillside Hotel. This year's competition brings together the brightest minds from across Jos to debate critical issues surrounding technology, governance, and the future of Plateau State. Come and support your school or witness the incredible rhetorical talent of our next generation of leaders."
  },
  { 
    id: "spoken-word-showcase-april-2026",
    date: "April 20, 2026", 
    title: "Spoken Word Showcase", 
    venue: "Museum Auditorium, Jos", 
    time: "04:00 PM",
    category: "Culture",
    desc: "An evening of poetic expression where ambassadors share their voices through powerful performance art.",
    longDesc: "Experience the power of the spoken word at our quarterly showcase. Our ambassadors will take you on a journey of identity, hope, and social commentary. This event is more than a performance; it is a movement that celebrates the rich cultural heritage and vibrant future of Nigerian youth. Admission is free for members and open to the general public with a token registration."
  },
];

export const newsArticles: NewsArticle[] = [
  {
    id: "spoken-word-night-2026",
    date: "Jan 28, 2026",
    title: "Annual Spoken Word Night Draws Record Crowd",
    desc: "Over 200 people attended our third annual open mic, celebrating 18 original performances. The event showcased the diversity of talent in Jos.",
    content: `Brilliant Minds Ambassadors Club (BMAC) recently hosted its highly anticipated Annual Spoken Word Night at the Jos Museum Auditorium. The event, which has grown significantly since its inception, saw a record-breaking attendance of over 200 poetry enthusiasts, students, and community leaders.

    Eighteen talented performers took to the stage, delivering powerful verses that touched on themes of identity, social change, and the unique cultural heritage of Plateau State. Suleiman Peace Jagaban, the founder of BMAC, remarked on the importance of providing such platforms: "Our goal is to ensure that every young voice in Jos feels heard and valued. Tonight proved that our youth have incredible stories to tell."

    The night wasn't just about performance; it was a celebration of community. Local artists collaborated with BMAC members to create a truly immersive experience, blending traditional spoken word with modern acoustic sounds. As BMAC looks toward the future, events like these remain central to our mission of building confidence and leadership through the arts.`,
    img: "/images/jj.jpg",
    category: "Culture",
    featured: true,
  },
  {
    id: "digital-literacy-2026",
    date: "Jan 10, 2026",
    title: "Digital Literacy Program Launches",
    desc: "A six-week digital skills curriculum covering research and online safety in partnership with tech hubs.",
    content: `In an era defined by rapid technological advancement, BMAC is proud to announce the launch of its comprehensive Digital Literacy Program. This initiative, developed in partnership with leading tech hubs in Jos, aims to equip young people with the essential digital skills required for the modern workforce.

    The six-week curriculum covers a wide range of topics, including advanced online research techniques, digital productivity tools, and critical training on online safety and data privacy. "Digital literacy is no longer optional; it is a fundamental requirement for leadership in the 21st century," said Amina Bello, BMAC Programs Director.

    Participants will have access to high-speed internet and modern computing facilities, ensuring a hands-on learning experience. Upon completion of the program, members will receive a certificate recognized by our technical partners, opening new doors for internships and career opportunities in the digital space.`,
    img: "/images/digital-literacy.jpg",
    category: "Education",
  },
  {
    id: "cohort-2026-announcement",
    date: "Dec 18, 2025",
    title: "Meet Our 2026 Cohort",
    desc: "72 new members joined BMAC this quarter — representing 14 local schools across Plateau State.",
    content: `We are thrilled to officially welcome 72 new ambassadors to the Brilliant Minds Ambassadors Club as part of our 2026 cohort. This group represents one of our most diverse intakes yet, with members coming from 14 different secondary schools and universities across Plateau State.

    The selection process was rigorous, focusing not just on academic excellence but on a demonstrated passion for community service and a desire to develop leadership potential. These new members will immediately begin their journey with our core workshops in public speaking and critical thinking.

    "Seeing the energy and potential in this new cohort is truly inspiring," noted Chinedu Okonkwo, Head of Communications. "They represent the future of BMAC and, more importantly, the future of leadership in Jos. We can't wait to see what they will achieve over the next year."`,
    img: "/images/IMG_1351.jpg",
    category: "Community",
  },
  {
    id: "partnership-progress-2025",
    date: "Nov 5, 2025",
    title: "Partnering for Progress",
    desc: "How collaboration is driving youth empowerment in the North Central region.",
    content: `BMAC's impact is amplified through the strength of our partnerships. Our latest initiative, "Partnering for Progress," highlights the vital role that local businesses, NGOs, and government agencies play in supporting youth development.

    By working together, we are able to provide our members with unique opportunities, from industry-specific mentorship to specialized vocational training. These collaborations ensure that our programs remain relevant and impactful, directly addressing the needs of the youth in Plateau State.

    We extend our sincere gratitude to all our community partners who share our vision of a confident and empowered next generation. Together, we are not just running a club; we are building a sustainable ecosystem for leadership and growth.`,
    img: "/images/cp1.jpg",
    category: "Partnership",
  },
];

export const teamData: TeamMember[] = [
  {
    name: "Suleiman Peace Jagaban",
    role: "Founder & Director",
    img: "/images/jagsba.jpg",
  },
  { 
    name: "Amina Bello", 
    role: "Programs Director", 
    img: "/images/maryam.jpg",
  },
  {
    name: "Chinedu Okonkwo",
    role: "Head of Communications",
    img: "/images/anu.jpg",
  },
  {
    name: "Fatima Abdullahi",
    role: "Mentorship Coordinator",
    img: "/images/maryam1.jpg",
  },
];

export const impactStats: ImpactStat[] = [
  { num: "350+", label: "Members Trained", icon: React.createElement(ShieldCheck, { size: 20 }) },
  { num: "48", label: "Events Hosted", icon: React.createElement(Zap, { size: 20 }) },
  { num: "12", label: "Community Partners", icon: React.createElement(Sparkles, { size: 20 }) },
  { num: "8", label: "Awards Won", icon: React.createElement(Target, { size: 20 }) },
];

export const galleryData: GalleryItem[] = [
  { img: "/images/public-speaking.jpg", category: "workshops", alt: "Public speaking workshop session" },
  { img: "/images/literary-arts.jpg", category: "workshops", alt: "Group discussion during workshop" },
  { img: "/images/competitions.jpg", category: "competitions", alt: "Debate competition on stage" },
  { img: "/images/award1.jpg", category: "competitions", alt: "Award presentation at competition" },
  { img: "/images/pre.jpg", category: "outreach", alt: "Community outreach in rural area" },
  { img: "/images/ws.jpg", category: "outreach", alt: "Students at school visit" },
  { img: "/images/anu.jpg", category: "events", alt: "Annual BMAC gathering" },
  { img: "/images/jj.jpg", category: "events", alt: "Spoken word performance night" },
  { img: "/images/digital-literacy.jpg", category: "workshops", alt: "Writing workshop with facilitator" },
  { img: "/images/award2.jpg", category: "competitions", alt: "Winners posing with trophies" },
  { img: "/images/jb.jpg", category: "events", alt: "Networking event for members" },
  { img: "/images/ws1.jpg", category: "outreach", alt: "Mentorship session at local school" },
];
