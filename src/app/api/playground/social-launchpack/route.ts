import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { title, category, problemStatement, proposedSolution, targetAudience } = body;

    const linkedinPost = `
🚀 Excited to announce what we are building at STEP IIT Kharagpur!

💡 Startup: ${title || 'Our DeepTech Startup'} (${category || 'Tech'})
❓ Problem: ${problemStatement || 'Solving critical industry bottlenecks.'}
⚡ Solution: ${proposedSolution || 'Next-gen technology powered by IIT KGP research.'}

🎯 Target Market: ${targetAudience || 'Founders & Enterprise Buyers'}

Grateful to our faculty mentors and the STEP incubation ecosystem for supporting this launch! 

What do you think of this approach? Drop your thoughts below! 👇

#StartupPlayground #IITKharagpur #STEPIITKGP #DeepTech #Innovation #Entrepreneurship
    `.trim();

    const twitterThread = [
      `1/ 🚀 Big news from @STEPIITKGP! We're building ${title || 'our new venture'} to solve: ${problemStatement || 'a massive industry challenge'} 🧵👇`,
      `2/ How it works: ${proposedSolution || 'Advanced technology developed at IIT Kharagpur.'}`,
      `3/ We are currently piloting with target partners in ${category || 'DeepTech'}. DM us if you'd like an early demo! 🔥`,
    ];

    const elevatorPitch = `
"We are building ${title || 'our startup'} at STEP IIT Kharagpur to solve ${problemStatement || 'a major industry issue'}. By leveraging ${proposedSolution || 'our proprietary solution'}, we empower ${targetAudience || 'our customers'} to achieve unprecedented efficiency with lower costs."
    `.trim();

    return NextResponse.json({
      success: true,
      data: {
        linkedinPost,
        twitterThread,
        elevatorPitch,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
