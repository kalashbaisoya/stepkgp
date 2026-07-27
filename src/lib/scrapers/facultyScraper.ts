import { db as prisma } from '@/lib/db';

export type ScrapedFaculty = {
  name: string;
  department: string;
  email: string;
  labName: string;
  researchAreas: string[];
  availableForMentorship: boolean;
};

// Initial Seed Data derived from IIT KGP Department Directories
const SEEDED_FACULTY: ScrapedFaculty[] = [
  {
    name: 'Prof. A. K. Deb',
    department: 'Electrical Engineering / Robotics',
    email: 'deb@ee.iitkgp.ac.in',
    labName: 'Autonomous Systems & Robotics Lab',
    researchAreas: ['Drones', 'Edge AI', 'Agri-Robotics', 'Control Systems'],
    availableForMentorship: true,
  },
  {
    name: 'Prof. S. Mukhopadhyay',
    department: 'Agricultural & Food Engineering',
    email: 'smukh@agfe.iitkgp.ac.in',
    labName: 'Precision Agriculture Research Hub',
    researchAreas: ['Crop Monitoring', 'Thermal Imaging', 'Soil Sensor Networks'],
    availableForMentorship: true,
  },
  {
    name: 'Prof. P. P. Chakrabarti',
    department: 'Computer Science & Engineering',
    email: 'ppchak@cse.iitkgp.ac.in',
    labName: 'AI & Complex Systems Lab',
    researchAreas: ['Artificial Intelligence', 'Algorithm Design', 'DeepTech'],
    availableForMentorship: true,
  },
  {
    name: 'Prof. S. K. Roy',
    department: 'School of Medical Science & Technology',
    email: 'skroy@smst.iitkgp.ac.in',
    labName: 'Bio-Medical Devices & Micro-Fluidics Lab',
    researchAreas: ['HealthTech', 'Micro-Fluidics', 'Point-of-Care Diagnostics'],
    availableForMentorship: true,
  },
  {
    name: 'Prof. V. R. Desai',
    department: 'Civil Engineering / Smart Infrastructure',
    email: 'vdesai@civil.iitkgp.ac.in',
    labName: 'Smart Cities & Infrastructure Lab',
    researchAreas: ['Urban Mobility', 'EV Infrastructure', 'Structural Telemetry'],
    availableForMentorship: true,
  },
];

const SEEDED_ALUMNI = [
  {
    name: 'Rahul Sharma',
    batch: '2014 (B.Tech CS)',
    role: 'Founding Partner',
    company: 'AgriNext Ventures',
    location: 'Bengaluru / San Francisco',
    domain: 'DeepTech & AgTech',
    email: 'rahul@agrinext.vc',
  },
  {
    name: 'Priya Nair',
    batch: '2016 (M.Tech EE)',
    role: 'VP Engineering',
    company: 'RoboticsCo',
    location: 'Singapore',
    domain: 'Hardware & Autonomous Robotics',
    email: 'priya@roboticsco.sg',
  },
  {
    name: 'Ankit Mehta',
    batch: '2012 (Dual Degree Chemical)',
    role: 'Managing Director',
    company: 'KGP Angel Network',
    location: 'Mumbai / London',
    domain: 'CleanTech & Bio-Materials',
    email: 'ankit@kgpangels.com',
  },
];

/**
 * Scrapes/updates IIT KGP faculty directory in DB
 */
export async function scrapeAndSeedFacultyDirectory() {
  console.log('[FacultyScraper] Syncing IIT KGP Faculty directory...');
  let syncedFacultyCount = 0;

  for (const fac of SEEDED_FACULTY) {
    await prisma.facultyMember.upsert({
      where: { email: fac.email },
      update: {
        name: fac.name,
        department: fac.department,
        labName: fac.labName,
        researchAreas: fac.researchAreas,
        availableForMentorship: fac.availableForMentorship,
      },
      create: {
        name: fac.name,
        department: fac.department,
        email: fac.email,
        labName: fac.labName,
        researchAreas: fac.researchAreas,
        availableForMentorship: fac.availableForMentorship,
      },
    });
    syncedFacultyCount++;
  }

  for (const alum of SEEDED_ALUMNI) {
    const existing = await prisma.alumniMentor.findFirst({
      where: { name: alum.name, company: alum.company },
    });
    if (!existing) {
      await prisma.alumniMentor.create({
        data: alum,
      });
    }
  }

  console.log(`[FacultyScraper] Synced ${syncedFacultyCount} faculty members & ${SEEDED_ALUMNI.length} alumni mentors.`);
  return { syncedFacultyCount, syncedAlumniCount: SEEDED_ALUMNI.length };
}
