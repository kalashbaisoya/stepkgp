import { NextResponse } from 'next/server';
import { db as prisma } from '@/lib/db';
import { scrapeAndSeedFacultyDirectory } from '@/lib/scrapers/facultyScraper';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const domain = searchParams.get('domain')?.toLowerCase();

    let faculty = await prisma.facultyMember.findMany();
    let alumni = await prisma.alumniMentor.findMany();

    if (faculty.length === 0 || alumni.length === 0) {
      await scrapeAndSeedFacultyDirectory();
      faculty = await prisma.facultyMember.findMany();
      alumni = await prisma.alumniMentor.findMany();
    }

    if (domain) {
      faculty = faculty.filter(
        (f) =>
          f.department.toLowerCase().includes(domain) ||
          f.labName.toLowerCase().includes(domain) ||
          JSON.stringify(f.researchAreas).toLowerCase().includes(domain)
      );
      alumni = alumni.filter((a) => a.domain.toLowerCase().includes(domain));
    }

    return NextResponse.json({
      success: true,
      data: {
        faculty,
        alumni,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
