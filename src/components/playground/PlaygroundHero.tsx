'use client';

import React, { useState, useEffect } from 'react';

type Props = {
  onStartBuilding: () => void;
};

const JOURNEY_STEPS = [
  {
    id: 1,
    stage: '0.0',
    name: 'Idea Discovery',
    icon: '💡',
    desc: 'Uncovering validated problems from IIT KGP research directories & industry challenges.',
    tint: 'clay-sun',
    nodeColor: '#ffc46b',
    cx: 40,
    cy: 100,
  },
  {
    id: 2,
    stage: '0.25',
    name: 'Faculty & Lab Match',
    icon: '🔬',
    desc: 'Scraper matching with 100+ IIT KGP research labs & expert alumni mentors.',
    tint: 'clay-sky',
    nodeColor: '#8ab4f8',
    cx: 120,
    cy: 50,
  },
  {
    id: 3,
    stage: '0.50',
    name: 'Surds BI & Viability',
    icon: '📊',
    desc: 'TAM/SAM/SOM precision calculation, risk radar, and competitor analysis.',
    tint: 'clay-mint',
    nodeColor: '#7fd6ad',
    cx: 200,
    cy: 140,
  },
  {
    id: 4,
    stage: '0.75',
    name: 'Social & Pitch Deck',
    icon: '🚀',
    desc: 'AI launch copy, 30-sec elevator pitch, and virality campaign studio.',
    tint: 'clay-lilac',
    nodeColor: '#b8a6f5',
    cx: 280,
    cy: 50,
  },
  {
    id: 5,
    stage: '1.0',
    name: 'VC Dispatch & Incubation',
    icon: '🏆',
    desc: 'Automated pitch deck dispatch to 4 VC funds & STEP incubation approval.',
    tint: 'clay-rose',
    nodeColor: '#f7a1a5',
    cx: 360,
    cy: 100,
  },
];

export default function PlaygroundHero({ onStartBuilding }: Props) {
  const [activeStep, setActiveStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);

  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % JOURNEY_STEPS.length);
    }, 2800);
    return () => clearInterval(interval);
  }, [isPlaying]);

  const currentStepInfo = JOURNEY_STEPS[activeStep];

  return (
    <div className="clay-lg p-6 md:p-10 relative overflow-hidden space-y-8">
      {/* Top Banner Header */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        <div className="lg:col-span-6 space-y-4">
          <span className="clay-chip clay-sun text-[13px] uppercase tracking-wider">
            🚀 STEP Incubation Ecosystem • IIT Kharagpur
          </span>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-[1.1]">
            Turn Your Idea into a VC-Funded Startup
          </h1>

          <p className="text-sm text-muted-foreground font-medium leading-relaxed max-w-xl">
            The <strong className="text-foreground">STEP Startup Playground</strong> connects student founders with scraped IIT KGP research labs, alumni mentors, Surds Business Intelligence, and automated VC pitch dispatchers.
          </p>

          <div className="pt-2 flex flex-wrap gap-3 items-center">
            <button
              onClick={onStartBuilding}
              className="clay-btn clay-primary px-6 py-3 text-xs"
            >
              ⚡ Enter Playground Canvas →
            </button>

            <a
              href="https://www.stepiitkgp.org"
              target="_blank"
              rel="noopener noreferrer"
              className="clay-btn clay-plain px-5 py-3 text-xs"
            >
              🌐 Official STEP Portal ↗
            </a>
          </div>
        </div>

        {/* Dynamic 0 to 1 Startup Journey SVG Animation Visualizer */}
        <div className="lg:col-span-6 relative">
          <div className="clay p-5 space-y-4">
            {/* Animation Top Bar */}
            <div className="flex flex-wrap justify-between items-center gap-2 border-b border-border/70 pb-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider">
                  0 ➔ 1 Startup journey
                </span>
                <span className="clay-chip clay-sun text-xs">
                  Stage {currentStepInfo.stage}
                </span>
              </div>

              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="clay-btn clay-dark px-3 py-1.5 text-xs"
              >
                {isPlaying ? '⏸ Pause' : '▶ Play'}
              </button>
            </div>

            {/* SVG Path Animation Canvas */}
            <div className="clay-inset w-full h-48 flex items-center justify-center p-2 relative overflow-hidden">
              <svg className="w-full h-full" viewBox="0 0 400 200" fill="none" xmlns="http://www.w3.org/2000/svg">
                {/* Background Connecting Path (0 to 1) */}
                <path
                  d="M40 100 L120 50 L200 140 L280 50 L360 100"
                  stroke="var(--border)"
                  strokeWidth="8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />

                {/* Animated Glowing Trail Line */}
                <path
                  d="M40 100 L120 50 L200 140 L280 50 L360 100"
                  stroke="var(--brand)"
                  strokeWidth="4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeDasharray="400"
                  strokeDashoffset={400 - (activeStep / (JOURNEY_STEPS.length - 1)) * 400}
                  className="transition-all duration-700 ease-in-out"
                />

                {/* Journey Stage Nodes */}
                {JOURNEY_STEPS.map((step, idx) => {
                  const isActive = idx === activeStep;
                  const isPassed = idx <= activeStep;

                  return (
                    <g
                      key={step.id}
                      onClick={() => setActiveStep(idx)}
                      className="cursor-pointer group"
                    >
                      {/* Outer Pulse Ring for Active Node */}
                      {isActive && (
                        <circle
                          cx={step.cx}
                          cy={step.cy}
                          r="22"
                          fill="none"
                          stroke={step.nodeColor}
                          strokeWidth="2"
                          className="animate-ping opacity-75"
                        />
                      )}

                      {/* Main Node Circle */}
                      <circle
                        cx={step.cx}
                        cy={step.cy}
                        r="18"
                        fill={isPassed ? step.nodeColor : 'var(--surface)'}
                        stroke="var(--clay-edge)"
                        strokeWidth="2"
                        className="transition-all duration-300 [filter:drop-shadow(0_4px_6px_rgba(94,84,72,0.25))]"
                      />

                      {/* Node Emoji Icon */}
                      <text
                        x={step.cx}
                        y={step.cy + 5}
                        textAnchor="middle"
                        fontSize="12"
                        className="pointer-events-none select-none"
                      >
                        {step.icon}
                      </text>

                      {/* Node Label Stage */}
                      <text
                        x={step.cx}
                        y={step.cy > 100 ? step.cy + 32 : step.cy - 24}
                        textAnchor="middle"
                        fill="var(--muted-foreground)"
                        fontSize="9"
                        fontWeight="700"
                        className="pointer-events-none"
                      >
                        {step.stage}
                      </text>
                    </g>
                  );
                })}

                {/* Moving Founder Pulse Rocket Indicator */}
                <g
                  transform={`translate(${currentStepInfo.cx}, ${currentStepInfo.cy})`}
                  className="transition-all duration-700 ease-in-out"
                >
                  <circle r="6" fill="var(--brand)" className="animate-bounce" />
                </g>
              </svg>
            </div>

            {/* Dynamic Step Detail Card */}
            <div className={`clay-sm ${currentStepInfo.tint} p-3.5 space-y-1.5`}>
              <div className="flex flex-wrap justify-between items-center gap-2 text-xs font-bold">
                <span className="flex items-center gap-1.5">
                  <span>{currentStepInfo.icon}</span>
                  <span>
                    Stage {currentStepInfo.stage}: {currentStepInfo.name}
                  </span>
                </span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-black/8 font-semibold">
                  Step {activeStep + 1} of 5
                </span>
              </div>
              <p className="text-[13px] font-medium leading-relaxed opacity-80">
                {currentStepInfo.desc}
              </p>
            </div>

            {/* Bottom 0 to 1 Stage Progress Stepper Bar */}
            <div className="clay-inset grid grid-cols-5 gap-1.5 rounded-full p-1.5">
              {JOURNEY_STEPS.map((step, idx) => (
                <button
                  key={step.id}
                  onClick={() => setActiveStep(idx)}
                  aria-label={`Go to stage ${step.stage}`}
                  className={`h-2 rounded-full transition-all ${
                    idx === activeStep
                      ? 'bg-brand'
                      : idx < activeStep
                      ? 'bg-brand/40'
                      : 'bg-border'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
