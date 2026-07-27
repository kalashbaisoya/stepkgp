import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { recipients, ideaTitle, problemStatement, proposedSolution, senderName } = body;

    if (!recipients || !Array.isArray(recipients) || recipients.length === 0) {
      return NextResponse.json({ success: false, error: 'No recipients selected' }, { status: 400 });
    }

    const dispatchedRecords = [];

    for (const recipient of recipients) {
      const email = recipient.email || `${recipient.name.toLowerCase().replace(/[^a-z]/g, '')}@iitkgp.ac.in`;
      const subject = `[STEP IIT KGP Research Brief] Founder Outreach: ${ideaTitle}`;
      const content = `
Dear ${recipient.name},

Student Founder (${senderName || 'STEP Founder'}) from IIT Kharagpur has created an incubation blueprint targeting your research domain (${recipient.department || recipient.domain || 'DeepTech'}).

Startup Idea: ${ideaTitle}
Problem Statement: ${problemStatement}
Proposed Solution: ${proposedSolution}

We kindly request a brief 15-minute consultation or lab guidance session.

Best regards,
STEP Incubation Team & Playground Dispatcher
IIT Kharagpur
      `.trim();

      const record = await prisma.researchBriefDispatch.create({
        data: {
          recipientEmail: email,
          recipientName: recipient.name,
          subject,
          content,
          status: 'dispatched',
        },
      });

      dispatchedRecords.push(record);
    }

    return NextResponse.json({
      success: true,
      count: dispatchedRecords.length,
      dispatched: dispatchedRecords,
      message: `Successfully dispatched research briefs to ${dispatchedRecords.length} IIT KGP mentors!`,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
