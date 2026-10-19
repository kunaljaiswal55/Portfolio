/* ==========================================================================
   CONTENT — THE ONLY FILE YOU NEED TO EDIT
   --------------------------------------------------------------------------
   Every remaining ⟪TODO⟫ is a PLACEHOLDER for something that cannot be
   derived from your public work. Search this file for "⟪TODO⟫" to find them.

   Nothing here invents facts about you. There are no fabricated employers,
   client names, performance metrics, awards, testimonials or results. Every
   project entry below is sourced from your own GitHub repositories (repo
   description, README, dependency list) — keep it truthful when you edit.

   Remaining ⟪TODO⟫s:
     • LinkedIn handle   — supply your profile URL
     • Internship dates — you have not published them anywhere public
   ========================================================================== */

export type ProjectVisual = 'bars' | 'grid' | 'orbit' | 'wave';

export interface Project {
  id: string;
  index: string;
  title: string;
  category: string;
  year: string;
  role: string;
  tagline: string;
  summary: string;
  tags: string[];
  /** Short label describing the stack family, e.g. "Next.js · MongoDB". */
  stackLabel: string;
  visual: ProjectVisual;
  /** Live URL. Leave as `null` while unreleased — a disabled state is
   *  rendered instead of a broken link. */
  url: string | null;
  /** Source repository URL. Same null behaviour. */
  repoUrl: string | null;
}

export interface Role {
  period: string;
  role: string;
  company: string;
  detail: string;
  current: boolean;
}

export interface SkillGroup {
  label: string;
  items: string[];
}

export interface ProcessStage {
  step: string;
  title: string;
  detail: string;
}

export interface SocialLink {
  label: string;
  handle: string;
  href: string | null;
}

export const identity = {
  firstName: 'Kunal',
  lastName: 'Jaiswal',
  fullName: 'Kunal Jaiswal',
  /** Short line under the name in the opening sequence. */
  descriptor: 'Engineer. Builder. Creator.',
  /** Hero eyebrow. */
  role: 'Software Engineer',
  /** Hero positioning statement. */
  statement:
    'I build software where the hard part is the logic — AI pipelines, compliance engines, and interfaces that stay fast and legible under real data.',
  /** Short pillars shown under the hero statement. */
  focus: [
    { label: 'AI & data systems', note: 'Document intelligence, retrieval, analysis' },
    { label: 'Full-stack product', note: 'API to interface, end to end' },
    { label: 'Interface engineering', note: 'Motion, state, performance' },
  ],
  availability: 'Available for new work',
  location: 'Indore, India',
  timezone: 'IST — UTC+5:30',
  email: 'jaiswalkunal555@gmail.com',
  github: 'https://github.com/kunaljaiswal55',
  updated: 'Portfolio — 2026',
} as const;

export const navLinks = [
  { id: 'work', label: 'Work', index: '01' },
  { id: 'about', label: 'About', index: '02' },
  { id: 'skills', label: 'Skills', index: '03' },
  { id: 'experience', label: 'Experience', index: '04' },
  { id: 'process', label: 'Process', index: '05' },
  { id: 'contact', label: 'Contact', index: '06' },
] as const;

export const projects: Project[] = [
  {
    id: 'bidsure',
    index: '01',
    title: 'BidSure AI',
    category: 'AI / Government Procurement',
    tagline: 'Verify. Analyze. Detect. Decide.',
    year: '2026',
    role: 'Solo Build',
    summary:
      'An AI-powered bid compliance and verification platform for government procurement. BidSure brings multi-portal verification, document intelligence, compliance analysis, risk detection, bidder comparison, AI-assisted forensic analysis, reporting, and audit trails into one unified workspace — with a client portal so bidders can upload documents, raise queries and track validation. Built with React and TypeScript, with Gemini handling document analysis and Tesseract handling OCR.',
    tags: ['React', 'TypeScript', 'Gemini API', 'OCR'],
    stackLabel: 'React · TypeScript',
    visual: 'bars',
    url: null,
    repoUrl: 'https://github.com/kunaljaiswal55/BidSure',
  },
  {
    id: 'fittrack',
    index: '02',
    title: 'FitTrack',
    category: 'Application',
    tagline: 'Memberships, bookings and progress in one place.',
    year: '2026',
    role: 'Solo Build',
    summary:
      'A gym membership management system covering the day-to-day of running a fitness floor: memberships, trainer management, attendance, class booking, workout tracking and fitness progress. Built with HTML, CSS and JavaScript on a Node.js and Express.js backend with MongoDB for storage.',
    tags: ['JavaScript', 'Node.js', 'Express', 'MongoDB'],
    stackLabel: 'Node · Express · MongoDB',
    visual: 'grid',
    url: null,
    repoUrl: 'https://github.com/kunaljaiswal55/FitTrack',
  },
  {
    id: 'focus-reset',
    index: '03',
    title: 'Focus Reset',
    category: 'Productivity',
    tagline: 'Physical, mental, financial, social — tracked together.',
    year: '2026',
    role: 'Solo Build',
    summary:
      'A self-tracking dashboard built around four pillars — physical, mental, financial and social. It pairs a Pomodoro focus timer with a daily journal, priority objectives, a curriculum tracker and a YouTube tracker, backed by Next.js API routes for AI-companion chat, focus sessions, social metrics and goal images. Next.js and React on the front, MongoDB for persistence, Gemini for the AI features.',
    tags: ['Next.js', 'React', 'MongoDB', 'Gemini API'],
    stackLabel: 'Next.js · MongoDB',
    visual: 'orbit',
    url: null,
    repoUrl: 'https://github.com/kunaljaiswal55/focus-reset-version-4',
  },
];

export const about = {
  heading: ['I build', 'things that', 'hold up.'],
  body: [
    'I am a software engineer working end to end — data model, API, interface — because a product only holds together when the seams agree with each other. BidSure is the clearest example: multi-portal verification, document intelligence and forensic analysis sitting on one auditable spine, with a client portal feeding documents into that same flow.',
    'The rest of my work is smaller and more personal. FitTrack organises a gym floor; Focus Reset is a four-pillar tracker for physical, mental, financial and social habits. Different domains, the same instinct — put the messy real-world data somewhere it can be trusted, then make the interface honest about what it is showing.',
  ],
  facts: [
    { label: 'Discipline', value: 'Software Engineering' },
    { label: 'Focus', value: 'AI & data systems' },
    { label: 'Approach', value: 'Full-stack product' },
    { label: 'Based', value: 'Indore, India' },
  ],
} as const;

export const skillGroups: SkillGroup[] = [
  {
    label: 'Languages',
    items: ['JavaScript', 'TypeScript', 'Python', 'C++', 'HTML', 'CSS'],
  },
  {
    label: 'Frameworks',
    items: ['React', 'Next.js', 'Node.js', 'Express', 'Tailwind CSS', 'Vite'],
  },
  {
    label: 'Data & AI',
    items: ['MongoDB', 'Gemini API', 'OCR / Tesseract', 'REST APIs'],
  },
  {
    label: 'Tooling',
    items: ['Git & GitHub', 'npm', 'Vite', 'Responsive UI'],
  },
];

/** Generic method stages — edit freely, these describe a process, not results. */
export const processStages: ProcessStage[] = [
  {
    step: '01',
    title: 'Discovery',
    detail:
      'Understand the problem before touching the stack. Requirements, constraints, and the single outcome that defines success.',
  },
  {
    step: '02',
    title: 'Planning',
    detail:
      'Map the smallest architecture that solves the whole problem. Fewer moving parts, clearer tradeoffs, an honest timeline.',
  },
  {
    step: '03',
    title: 'Production',
    detail:
      'Build in visible increments. Every step is runnable, reviewable and honest about what is not finished yet.',
  },
  {
    step: '04',
    title: 'Delivery',
    detail:
      'Ship it, measure it, then keep it healthy. Documentation and maintenance are part of the product, not an afterthought.',
  },
];

export const roles: Role[] = [
  {
    period: '⟪TODO — dates⟫', // ⟪TODO⟫ — not published anywhere public
    role: 'Full Stack Intern',
    company: 'Coding Blocks',
    detail:
      '⟪TODO — what you built and owned during this internship: the features, the stack, and what you learned.⟫',
    current: false,
  },
  {
    period: '⟪TODO — dates⟫', // ⟪TODO⟫ — not published anywhere public
    role: 'Full Stack Intern',
    company: 'Sunstone SIP Program',
    detail: '⟪TODO — what you built and owned during this program.⟫',
    current: false,
  },
  {
    period: '2026 — Present',
    role: 'B.Tech Student & Independent Developer',
    company: 'Independent',
    detail:
      'Studying full-stack development while shipping projects end to end — BidSure AI, FitTrack and Focus Reset — each one owned from data model through interface. Currently learning React, MongoDB and applied AI tooling.',
    current: true,
  },
];

export const socials: SocialLink[] = [
  { label: 'GitHub', handle: '@kunaljaiswal55', href: 'https://github.com/kunaljaiswal55' },
  { label: 'BidSure AI', handle: 'github.com/kunaljaiswal55/BidSure', href: 'https://github.com/kunaljaiswal55/BidSure' },
  { label: 'LinkedIn', handle: '⟪TODO — @handle⟫', href: null }, // ⟪TODO⟫ — paste your profile URL
  { label: 'Email', handle: 'jaiswalkunal555@gmail.com', href: 'mailto:jaiswalkunal555@gmail.com' },
];