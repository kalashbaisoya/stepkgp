import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { startupName, cinOrLlp, state, sector, founderName, email, phone } = body;

    if (!startupName) {
      return NextResponse.json({ error: "Startup name is required" }, { status: 400 });
    }

    const prefilledPacket = {
      generatedAt: new Date().toISOString(),
      dpiitRecognitionForm: {
        portalUrl: "https://www.startupindia.gov.in/content/sih/en/startupgov/startup-recognition-page.html",
        fields: {
          entityName: startupName,
          entityType: cinOrLlp?.includes("LLP") ? "LLP" : "Private Limited Company",
          cinOrLlpNo: cinOrLlp || "U72900WB2026PTC998877",
          state: state || "West Bengal",
          city: "Kharagpur",
          incubatorName: "STEP IIT Kharagpur (TBI-DST-088)",
          industrySector: sector || "DeepTech / Software",
          founderName: founderName || "Lead Founder",
          email: email || "founder@startup.com",
          mobile: phone || "+91 9876543210",
        },
        eligibleBenefits: [
          "100% Tax Holiday for 3 Years (Section 80-IAC)",
          "80% Rebate on Patent Filing Fees + 50% Trademark Rebate",
          "Collateral-Free Loan Guarantee Cover up to ₹10 Crores (CGSS)",
          "EMD Waiver on GeM Public Procurement Tenders",
        ],
      },
      msmeUdyamRegistrationForm: {
        portalUrl: "https://udyamregistration.gov.in/Udyam_Registration.aspx",
        fields: {
          enterpriseName: startupName,
          organizationType: "Private Limited / LLP",
          state: state || "West Bengal",
          district: "Paschim Medinipur",
          pincode: "721302",
          nic2DigitCode: "72 - Computer programming, consultancy and related activities",
          bankAccountType: "Current Account",
        },
      },
      sisFsSeedFundApplication: {
        portalUrl: "https://seedfund.startupindia.gov.in/",
        fields: {
          startupName: startupName,
          selectedIncubator: "STEP IIT Kharagpur Incubator",
          requestedGrantAmount: "₹20,00,000 (₹20 Lakhs Proof of Concept Grant)",
          prototypeStage: "Working Prototype / MVP Ready",
        },
      },
    };

    return NextResponse.json(prefilledPacket);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to generate prefilled registration packet" }, { status: 500 });
  }
}
