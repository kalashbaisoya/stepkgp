import { StartupIdeaInput } from "./node-executor";

export type MVPSpec = {
  title: string;
  recommendedStack: {
    frontend: string;
    backend: string;
    database: string;
    aiMlPipeline: string;
    deployment: string;
  };
  coreModules: { name: string; description: string; priority: "High" | "Medium" | "Low" }[];
  architectureDiagram: string;
  fourWeekSprintRoadmap: { week: number; focus: string; deliverables: string[] }[];
};

export function generateMVPSpec(input: StartupIdeaInput): MVPSpec {
  const isDeepTech = input.category.toLowerCase().includes("deeptech") || input.category.toLowerCase().includes("robotics");
  const isAgri = input.category.toLowerCase().includes("agri") || input.category.toLowerCase().includes("hardware");

  return {
    title: `${input.title}: Technical MVP Architecture & Specification`,
    recommendedStack: {
      frontend: "Next.js 15 (React 19, Tailwind CSS v4, Lucide Icons)",
      backend: "Node.js / Express (or Next.js Route Handlers) + Python FastAPI microservices",
      database: "PostgreSQL / SQLite with Prisma ORM + Redis cache",
      aiMlPipeline: isDeepTech
        ? "PyTorch / ONNX Runtime + OpenCV edge-inference on Raspberry Pi/Jetson Nano"
        : "FastAPI + LangChain / LlamaIndex + OpenAI / Claude / Ollama API",
      deployment: isAgri
        ? "Edge Gateway (MQTT + LoRaWAN) + Vercel / AWS EC2 cloud control plane"
        : "Vercel / Docker + Supabase / Neon DB",
    },
    coreModules: [
      {
        name: "User & Role Authentication",
        description: "RBAC authentication for Founders, Mentors, and Field Operators.",
        priority: "High",
      },
      {
        name: "Core Domain Engine",
        description: input.proposedSolution,
        priority: "High",
      },
      {
        name: "Analytics & Telemetry Dashboard",
        description: "Real-time metrics, telemetry graphs, and status logging.",
        priority: "Medium",
      },
      {
        name: "Export & Reporting Module",
        description: "Automated PDF/CSV summary reports for incubation reviews.",
        priority: "Low",
      },
    ],
    architectureDiagram: `
[ Client / Web Portal ]  <--->  [ Next.js API Gateway ]
                                         |
                       +-----------------+-----------------+
                       |                                   |
              [ PostgreSQL / Prisma ]            [ Python AI Microservice ]
                       |                                   |
              [ Data Persistence ]               [ Model Inference & Edge ]
`,
    fourWeekSprintRoadmap: [
      {
        week: 1,
        focus: "System Architecture & Schema Design",
        deliverables: [
          "Setup repository, Next.js 15 template, & Prisma DB schema",
          "Build mock dataset and domain data models",
          "Deploy initial staging environment",
        ],
      },
      {
        week: 2,
        focus: "Core Engine & Primary Workflow",
        deliverables: [
          "Implement core algorithm / microservice for solution logic",
          "Connect REST / GraphQL endpoints to web interface",
          "Run initial unit tests and validation loops",
        ],
      },
      {
        week: 3,
        focus: "Faculty/Mentor Integration & Telemetry Dashboard",
        deliverables: [
          "Build analytics dashboard for monitoring outputs",
          "Integrate user profile and feedback submission system",
        ],
      },
      {
        week: 4,
        focus: "Pilot Testing, Security Audit & Incubation Submission",
        deliverables: [
          "End-to-end user testing with 5 target users",
          "Perform security, rate-limiting, and error handling audits",
          "Export MVP spec and submit to STEP Incubation pipeline",
        ],
      },
    ],
  };
}
