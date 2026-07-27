import { NextResponse } from 'next/server';
import { db as prisma } from '@/lib/db';

const SEEDED_INITIAL_PROBLEMS = [
  {
    title: 'Autonomous Agricultural Drone Mesh Networks',
    category: 'DeepTech / Robotics',
    description: 'Crop loss due to undetected pest infestations in large-scale farms across eastern India. Need edge-AI powered thermal imaging drones with automated local spraying.',
    tags: JSON.stringify(['AgriTech', 'Drones', 'Edge AI', 'Robotics']),
    authorName: 'Prof. S. Mukhopadhyay',
    authorRole: 'Head, Precision Agriculture Hub (IIT KGP)',
    upvotes: 42,
  },
  {
    title: 'Point-of-Care Microfluidics for Rapid Sepsis Detection',
    category: 'MedTech / BioTech',
    description: 'Delayed sepsis diagnosis in tier-2 rural hospitals leading to high mortality. Need portable microfluidic bio-chips giving results within 15 minutes.',
    tags: JSON.stringify(['MedTech', 'Microfluidics', 'Diagnostics']),
    authorName: 'Prof. S. K. Roy',
    authorRole: 'School of Medical Science & Tech (IIT KGP)',
    upvotes: 38,
  },
  {
    title: 'Decentralized Grid Micro-Storage for Rural Microgrids',
    category: 'CleanTech / Energy',
    description: 'Solar microgrids in tribal belts suffer from voltage fluctuations and battery degradation. Need affordable sodium-ion battery management systems.',
    tags: JSON.stringify(['Energy', 'Batteries', 'SmartGrid']),
    authorName: 'Rahul Sharma',
    authorRole: 'Alum (2014) • Partner, AgriNext Ventures',
    upvotes: 29,
  },
];

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get('q')?.toLowerCase();

    let problems = await prisma.seededProblem.findMany({
      orderBy: { upvotes: 'desc' },
    });

    if (problems.length === 0) {
      for (const p of SEEDED_INITIAL_PROBLEMS) {
        await prisma.seededProblem.create({ data: p });
      }
      problems = await prisma.seededProblem.findMany({ orderBy: { upvotes: 'desc' } });
    }

    if (query) {
      problems = problems.filter(
        (p) =>
          p.title.toLowerCase().includes(query) ||
          p.category.toLowerCase().includes(query) ||
          p.description.toLowerCase().includes(query)
      );
    }

    return NextResponse.json({ success: true, count: problems.length, data: problems });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { title, category, description, authorName, authorRole, tags } = body;

    if (!title || !category || !description) {
      return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 });
    }

    const newProblem = await prisma.seededProblem.create({
      data: {
        title,
        category,
        description,
        authorName: authorName || 'Anonymous Founder',
        authorRole: authorRole || 'IIT KGP Student',
        tags: JSON.stringify(tags || []),
        upvotes: 1,
      },
    });

    return NextResponse.json({ success: true, data: newProblem });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
