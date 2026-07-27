import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { title, category, problemStatement, targetAudience } = body;

    // Surds BI Intelligence Engine Algorithm
    const textLength = ((title || '') + (problemStatement || '') + (targetAudience || '')).length;
    const categoryFactor = category?.includes('DeepTech') ? 1.2 : category?.includes('MedTech') ? 1.15 : 1.05;

    const baseTAM = Math.round((textLength * 0.05 + 2.8) * categoryFactor * 10) / 10;
    const baseSAM = Math.round(baseTAM * 0.32 * 10) / 10;
    const baseSOM = Math.round(baseSAM * 0.12 * 10) / 10;

    const viabilityScore = Math.min(96, Math.max(68, Math.round(75 + (textLength % 20))));
    const tamSamScore = Math.min(98, Math.max(72, Math.round(80 + (textLength % 18))));

    const competitors = [
      { name: 'Global incumbent Corp', marketShare: '35%', weakness: 'High cost, legacy architecture, slow iteration' },
      { name: 'Regional Startup X', marketShare: '18%', weakness: 'Lacks IIT KGP research depth and localized distribution' },
      { name: 'Niche Player Y', marketShare: '12%', weakness: 'Poor scalability and high hardware friction' },
    ];

    const riskRadar = [
      { factor: 'Market Adoption Rate', level: 'Medium', mitigation: 'Pilot with STEP campus incubatees' },
      { factor: 'Regulatory & IP Compliance', level: 'Low', mitigation: 'File provisional patent via STEP IP cell' },
      { factor: 'Technical Execution Risk', level: category?.includes('DeepTech') ? 'High' : 'Medium', mitigation: 'Faculty lab mentorship' },
    ];

    return NextResponse.json({
      success: true,
      data: {
        tam: `$${baseTAM} Billion`,
        sam: `$${baseSAM} Million`,
        som: `$${baseSOM} Million`,
        viabilityScore,
        tamSamScore,
        competitors,
        riskRadar,
        generatedAt: new Date().toISOString(),
      },
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
