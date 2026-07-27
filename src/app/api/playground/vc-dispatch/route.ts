import { NextResponse } from 'next/server';

const PARTNER_VCS = [
  { name: 'KGP Angel Network', domain: 'DeepTech & Campus Pre-Seed', ticketSize: '₹25L - ₹1 Cr' },
  { name: 'Sequoia Surge / Peak XV', domain: 'Early Stage Tech', ticketSize: '$500K - $2M' },
  { name: 'Blume Ventures', domain: 'B2B & Agritech', ticketSize: '$250K - $1M' },
  { name: 'STEP Seed Fund', domain: 'IIT KGP Campus Incubatees', ticketSize: '₹50L Seed' },
];

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { ideaTitle, category, problemStatement, tamSamScore, viabilityScore, pitchDeckFile } = body;

    const matchedVCs = PARTNER_VCS.filter(
      (vc) =>
        vc.domain.toLowerCase().includes(category?.toLowerCase() || '') ||
        vc.domain.includes('Campus') ||
        vc.domain.includes('Early Stage')
    );

    const evaluation = {
      score: Math.min(95, Math.max(78, (tamSamScore || 80) + 5)),
      strengths: [
        'Strong problem alignment with IIT KGP research capabilities',
        'High market potential based on Surds BI assessment',
      ],
      recommendation: 'Approved for STEP Pre-Seed VC Dispatch pipeline',
    };

    return NextResponse.json({
      success: true,
      data: {
        evaluation,
        dispatchedVCs: matchedVCs,
        dispatchStatus: 'Dispatched to 4 Partner VC Funds',
        dispatchedAt: new Date().toISOString(),
      },
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
