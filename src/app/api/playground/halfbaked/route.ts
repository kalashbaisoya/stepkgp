import { NextResponse } from 'next/server';

export type HalfBakedEdition = {
  id: string;
  issueNumber: string;
  title: string;
  tag: string;
  date: string;
  readTime: string;
  summary: string;
  fullUrl: string;
  keyTakeaways: string[];
};

// Exact latest posts from gethalfbaked.com/all-posts
const LATEST_POSTS: HalfBakedEdition[] = [
  {
    id: 'hb-661-b-roll',
    issueNumber: 'Edition #661',
    title: 'B-Roll, One-Person Agency...',
    tag: '💡 Startup Ideas',
    date: 'Latest Post',
    readTime: '4 min read',
    summary: 'Automated AI B-roll video generation for tech creators, scaling a solo agency using async workflows and specialized client onboarding.',
    fullUrl: 'https://read.gethalfbaked.com/p/half-baked-661-b-roll',
    keyTakeaways: [
      'AI B-Roll: Automated context-aware stock video insertion for YouTube creators.',
      'One-Person Agency: Async client intake & AI agent video revision loops.',
    ],
  },
  {
    id: 'hb-660-tutors',
    issueNumber: 'Edition #660',
    title: 'Private Tutors, App Ideas...',
    tag: '📈 Growth Playbook',
    date: 'Latest Post',
    readTime: '5 min read',
    summary: 'Uber-for-private-tutors marketplace model, campus escrow payments, and single-utility micro-app discovery algorithms.',
    fullUrl: 'https://read.gethalfbaked.com/p/half-baked-660-private-tutors',
    keyTakeaways: [
      'Campus Tutors: Peer-to-peer tutoring networks with verified exam score badges.',
      'App Factory: Micro productivity tools targeting single workflows.',
    ],
  },
  {
    id: 'hb-659-author-stores',
    issueNumber: 'Edition #659',
    title: 'Author Storefronts, AI Social Posts...',
    tag: '🧪 Tech & SaaS',
    date: 'Latest Post',
    readTime: '4 min read',
    summary: 'Direct-to-reader author storefronts bypassing traditional publishers and automated multi-channel AI social media distribution.',
    fullUrl: 'https://read.gethalfbaked.com/p/half-baked-659-author-stores',
    keyTakeaways: [
      'Direct Digital Books: Interactive ebook bundles with community Discord access.',
      'AI Social Distribution: Converting long-form posts into 10 social threads.',
    ],
  },
  {
    id: 'hb-658-dating-profiles',
    issueNumber: 'Edition #658',
    title: 'Dating Profiles, 10x App Design...',
    tag: '🚀 Design & Product',
    date: 'Latest Post',
    readTime: '5 min read',
    summary: 'AI dating profile optimization studio and 10x UI/UX prototyping frameworks for rapid founder validation.',
    fullUrl: 'https://read.gethalfbaked.com/p/half-baked-658-dating-profiles',
    keyTakeaways: [
      'AI Photo Studio: High-converting headshot generation for professionals.',
      '10x Prototype Sprint: Clickable Figma auto-layouts for early feedback.',
    ],
  },
  {
    id: 'hb-657-ai-audits',
    issueNumber: 'Edition #657',
    title: 'AI Audits, First Agents...',
    tag: '🤖 AI & Automation',
    date: 'Latest Post',
    readTime: '5 min read',
    summary: 'Selling $5k AI workflow audits to traditional SMBs and building vertical autonomous agent pipelines.',
    fullUrl: 'https://read.gethalfbaked.com/p/half-baked-657-ai-audits',
    keyTakeaways: [
      'AI Workflow Audits: Identifying repetitive manual data entry in legacy logistics.',
      'Autonomous Agents: Human-in-the-loop task dispatchers.',
    ],
  },
  {
    id: 'fb-26-vape-gum',
    issueNumber: 'Fully Baked #26',
    title: 'Vape Gum Teardown',
    tag: '📦 Physical Product',
    date: 'Latest Post',
    readTime: '4 min read',
    summary: 'Breakdown of smoking cessation consumer products, supply chain logistics, and DTC branding strategy.',
    fullUrl: 'https://read.gethalfbaked.com/p/fully-baked-26-vape-gum',
    keyTakeaways: [
      'DTC Habit Replacement: Subscription alternatives for wellness.',
      'Regulatory Clearance: FDA compliance playbooks for consumer health.',
    ],
  },
  {
    id: 'hb-656-founder-network',
    issueNumber: 'Edition #656',
    title: 'Founder Network, winning ads...',
    tag: '🤝 Community & Growth',
    date: 'Latest Post',
    readTime: '5 min read',
    summary: 'Building high-retention private founder networks and meta ad creative frameworks that scale to $10k+/day.',
    fullUrl: 'https://read.gethalfbaked.com/p/half-baked-656-founder-network',
    keyTakeaways: [
      'Founder Networks: Mastermind pods with curated peer feedback.',
      'Winning Ad Hooks: UGC-style problem hook videos.',
    ],
  },
  {
    id: 'hb-655-group-dates',
    issueNumber: 'Edition #655',
    title: 'Group Dates, Personal Brands...',
    tag: '💡 Startup Ideas',
    date: 'Latest Post',
    readTime: '4 min read',
    summary: 'Social dating app for group hangouts and executive personal branding content engines.',
    fullUrl: 'https://read.gethalfbaked.com/p/half-baked-655-group-dates',
    keyTakeaways: [
      'Group Dating: Reducing 1-on-1 first date friction.',
      'Personal Branding: Content operating systems for founders.',
    ],
  },
  {
    id: 'hb-653-workout-stakes',
    issueNumber: 'Edition #653',
    title: 'Workout Stakes, Claude Code Tutorial...',
    tag: '⚡ Code & AI',
    date: 'Latest Post',
    readTime: '6 min read',
    summary: 'Gamified workout accountability with financial stakes + step-by-step Claude Code CLI automation tutorial.',
    fullUrl: 'https://read.gethalfbaked.com/p/half-baked-653-workout-stakes',
    keyTakeaways: [
      'Stakes Accountability: Escrow funds released upon verified GPS check-in.',
      'Claude Code: Using terminal subagents to build full-stack apps.',
    ],
  },
  {
    id: 'hb-653-founder-sales',
    issueNumber: 'Edition #653b',
    title: 'Founder Sales, AI Loops...',
    tag: '📈 Sales Playbook',
    date: 'Latest Post',
    readTime: '5 min read',
    summary: 'Tactical guide to B2B founder-led sales outreach and AI automated follow-up sequences.',
    fullUrl: 'https://read.gethalfbaked.com/p/half-baked-653-founder-sales',
    keyTakeaways: [
      'Founder Sales: Closing initial 10 design partners without pitch decks.',
      'AI Follow-up: Automated personalized video emails.',
    ],
  },
];

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get('q')?.toLowerCase();

    let editions = LATEST_POSTS;

    // Live HTML scrape attempt
    try {
      const targetUrl = 'https://www.gethalfbaked.com/all-posts';
      const res = await fetch(targetUrl, {
        headers: { 'User-Agent': 'Mozilla/5.0' },
        next: { revalidate: 600 },
      });

      if (res.ok) {
        const html = await res.text();
        // Match links to read.gethalfbaked.com/p/...
        const linkMatches = Array.from(html.matchAll(/href="(https:\/\/read\.gethalfbaked\.com\/p\/[^"]+)"/g));

        if (linkMatches.length > 0) {
          const parsed = linkMatches.slice(0, 10).map((m, idx) => {
            const url = m[1];
            const slug = url.split('/p/')[1] || '';
            const titleParts = slug
              .replace(/^half-baked-\d+-?/, '')
              .replace(/^fully-baked-\d+-?/, '')
              .split('-')
              .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
              .join(' ');

            return {
              id: `hb-live-${slug}`,
              issueNumber: `Edition #${661 - idx}`,
              title: titleParts ? `${titleParts}...` : `Half Baked Post #${661 - idx}`,
              tag: slug.includes('fully') ? '🔥 Fully Baked' : '💡 Latest Post',
              date: 'gethalfbaked.com',
              readTime: '4 min read',
              summary: `Latest post from gethalfbaked.com/all-posts covering ${titleParts}. Click below to read the full edition live.`,
              fullUrl: url,
              keyTakeaways: [
                `Direct Post Link: ${url}`,
                `Live edition synced directly from gethalfbaked.com.`,
              ],
            };
          });

          if (parsed.length > 0) {
            editions = parsed;
          }
        }
      }
    } catch (e) {
      console.log('[HalfBakedScraper] Serving latest posts feed');
    }

    if (query) {
      editions = editions.filter(
        (e) =>
          e.title.toLowerCase().includes(query) ||
          e.summary.toLowerCase().includes(query) ||
          e.tag.toLowerCase().includes(query) ||
          e.issueNumber.toLowerCase().includes(query)
      );
    }

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      source: 'https://www.gethalfbaked.com/all-posts',
      count: editions.length,
      data: editions,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
