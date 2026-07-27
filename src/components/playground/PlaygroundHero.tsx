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
    color: 'bg-amber-400',
    nodeColor: '#fbbf24',
    cx: 40,
    cy: 100,
  },
  {
    id: 2,
    stage: '0.25',
    name: 'Faculty & Lab Match',
    icon: '🔬',
    desc: 'Scraper matching with 100+ IIT KGP research labs & expert alumni mentors.',
    color: 'bg-blue-400',
    nodeColor: '#60a5fa',
    cx: 120,
    cy: 50,
  },
  {
    id: 3,
    stage: '0.50',
    name: 'Surds BI & Viability',
    icon: '📊',
    desc: 'TAM/SAM/SOM precision calculation, risk radar, and competitor analysis.',
    color: 'bg-emerald-400',
    nodeColor: '#34d399',
    cx: 200,
    cy: 140,
  },
  {
    id: 4,
    stage: '0.75',
    name: 'Social & Pitch Deck',
    icon: '🚀',
    desc: 'AI launch copy, 30-sec elevator pitch, and virality campaign studio.',
    color: 'bg-purple-400',
    nodeColor: '#c084fc',
    cx: 280,
    cy: 50,
  },
  {
    id: 5,
    stage: '1.0',
    name: 'VC Dispatch & Incubation',
    icon: '🏆',
    desc: 'Automated pitch deck dispatch to 4 VC funds & STEP incubation approval.',
    color: 'bg-rose-400',
    nodeColor: '#f87171',
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
    <div className="p-6 md:p-10 rounded-none bg-[#FAF9F5] border-2 border-stone-900 shadow-[8px_8px_0px_0px_rgba(28,25,23,1)] relative overflow-hidden space-y-8">
      {/* Top Banner Header */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        <div className="lg:col-span-6 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-none bg-amber-400 text-stone-950 text-xs font-black uppercase tracking-wider border-2 border-stone-900 shadow-[2px_2px_0px_0px_rgba(28,25,23,1)]">
            🚀 STEP INCUBATION ECOSYSTEM • IIT KHARAGPUR
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-stone-900 tracking-tight leading-tight">
            Turn Your Idea into a VC-Funded Startup
          </h1>

          <p className="text-sm text-stone-700 font-medium leading-relaxed max-w-xl">
            The <strong>STEP Startup Playground</strong> connects student founders with scraped IIT KGP research labs, alumni mentors, Surds Business Intelligence, and automated VC pitch dispatchers.
          </p>

          <div className="pt-2 flex flex-wrap gap-4 items-center">
            <button
              onClick={onStartBuilding}
              className="px-6 py-3 rounded-none bg-stone-900 hover:bg-stone-800 text-stone-50 font-black text-xs transition border-2 border-stone-900 shadow-[4px_4px_0px_0px_rgba(217,119,6,1)] active:translate-x-0.5 active:translate-y-0.5"
            >
              ⚡ Enter Playground Canvas →
            </button>

            <a
              href="https://www.stepiitkgp.org"
              target="_blank"
              rel="noopener noreferrer"
              className="px-5 py-3 rounded-none bg-white hover:bg-stone-100 text-stone-900 font-bold text-xs transition border-2 border-stone-900 shadow-[3px_3px_0px_0px_rgba(28,25,23,1)]"
            >
              🌐 Official STEP Portal ↗
            </a>
          </div>
        </div>

        {/* Dynamic 0 to 1 Startup Journey SVG Animation Visualizer */}
        <div className="lg:col-span-6 relative">
          <div className="p-5 rounded-none bg-white border-2 border-stone-900 shadow-[6px_6px_0px_0px_rgba(28,25,23,1)] space-y-4">
            {/* Animation Top Bar */}
            <div className="flex justify-between items-center border-b-2 border-stone-900 pb-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-black text-stone-900 uppercase tracking-wider">
                  0 ➔ 1 STARTUP JOURNEY ANIMATION
                </span>
                <span className="px-2 py-0.5 text-[10px] font-black bg-amber-400 text-stone-950 border border-stone-900">
                  STAGE {currentStepInfo.stage}
                </span>
              </div>

              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="px-2.5 py-1 rounded-none bg-stone-900 text-stone-50 text-[10px] font-black border border-stone-900 hover:bg-amber-400 hover:text-stone-950 transition"
              >
                {isPlaying ? '⏸ Pause' : '▶ Play'}
              </button>
            </div>

            {/* SVG Path Animation Canvas */}
            <div className="w-full h-48 rounded-none bg-[#FAF9F5] border-2 border-stone-900 flex items-center justify-center p-2 relative overflow-hidden">
              <svg className="w-full h-full" viewBox="0 0 400 200" fill="none" xmlns="http://www.w3.org/2000/svg">
                {/* Background Connecting Path (0 to 1) */}
                <path
                  d="M40 100 L120 50 L200 140 L280 50 L360 100"
                  stroke="#e7e5e4"
                  strokeWidth="6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />

                {/* Animated Glowing Trail Line */}
                <path
                  d="M40 100 L120 50 L200 140 L280 50 L360 100"
                  stroke="#1c1917"
                  strokeWidth="3"
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
                        fill={isPassed ? step.nodeColor : '#ffffff'}
                        stroke="#1c1917"
                        strokeWidth="3"
                        className="transition-all duration-300"
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
                        fill="#1c1917"
                        fontSize="9"
                        fontWeight="900"
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
                  <circle r="6" fill="#1c1917" className="animate-bounce" />
                </g>
              </svg>
            </div>

            {/* Dynamic Step Detail Card */}
            <div className="p-3.5 bg-[#FAF9F5] border-2 border-stone-900 rounded-none space-y-1.5 shadow-[3px_3px_0px_0px_rgba(28,25,23,1)]">
              <div className="flex justify-between items-center text-xs font-black">
                <span className="text-stone-900 flex items-center gap-1.5">
                  <span>{currentStepInfo.icon}</span>
                  <span>
                    Stage {currentStepInfo.stage}: {currentStepInfo.name}
                  </span>
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-none bg-stone-900 text-stone-50 font-bold">
                  Step {activeStep + 1} of 5
                </span>
              </div>
              <p className="text-[11px] text-stone-700 font-medium leading-relaxed">
                {currentStepInfo.desc}
              </p>
            </div>

            {/* Bottom 0 to 1 Stage Progress Stepper Bar */}
            <div className="grid grid-cols-5 gap-1.5 pt-1">
              {JOURNEY_STEPS.map((step, idx) => (
                <button
                  key={step.id}
                  onClick={() => setActiveStep(idx)}
                  className={`h-2 rounded-none transition-all ${
                    idx === activeStep
                      ? 'bg-amber-400 border border-stone-900 ring-1 ring-stone-900'
                      : idx < activeStep
                      ? 'bg-stone-900'
                      : 'bg-stone-200'
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
