'use client';

import React, { useState } from 'react';
import SeededProblemFeed from '@/components/playground/SeededProblemFeed';
import ValidationDirectory from '@/components/playground/ValidationDirectory';
import SurdsBIEngine from '@/components/playground/SurdsBIEngine';
import SocialLaunchpack from '@/components/playground/SocialLaunchpack';
import VCDeckPortal from '@/components/playground/VCDeckPortal';
import LegalVault from '@/components/playground/LegalVault';
import StartupVideoHub from '@/components/playground/StartupVideoHub';
import HalfBakedNewsletterSection from '@/components/playground/HalfBakedNewsletterSection';
import FigmaGraphCanvas from '@/components/playground/FigmaGraphCanvas';
import PlaygroundHero from '@/components/playground/PlaygroundHero';

export type StartupIdeaState = {
  id?: string;
  title: string;
  category: string;
  problemStatement: string;
  targetAudience: string;
  proposedSolution: string;
  selectedFaculty: string[];
  selectedAlumni: string[];
  tamSamScore?: number;
  viabilityScore?: number;
  pitchDeckFile?: string;
};

const STAGES = [
  { id: 1, name: 'Idea & Problem Discovery', icon: '💡', desc: 'Browse Seeded Issues or Blueprint Your Idea' },
  { id: 2, name: 'Faculty & Market Validation', icon: '🔬', desc: 'IIT KGP Research Lookup & Alumni Reachout' },
  { id: 3, name: 'Surds Business Intelligence', icon: '📊', desc: 'TAM/SAM, Competitor Analysis & Viability' },
  { id: 4, name: 'Social Launchpack', icon: '🚀', desc: 'LinkedIn Post & Elevator Pitch Generator' },
  { id: 5, name: 'VC Dispatch & Legal Vault', icon: '⚖️', desc: 'Incubation Pitch & Compliance Checklist' },
];

export default function StartupPlaygroundPage() {
  const [currentStage, setCurrentStage] = useState(1);
  const [viewMode, setViewMode] = useState<'canvas' | 'stepper'>('canvas');
  const [ideaState, setIdeaState] = useState<StartupIdeaState>({
    title: 'Autonomous Agri-Drone Mesh Network',
    category: 'DeepTech / Robotics',
    problemStatement: 'Crop loss due to undetected pest infestations in large-scale farms across eastern India.',
    targetAudience: 'Agritech collectives, medium-to-large farm owners, and agricultural research institutes.',
    proposedSolution: 'Solar-assisted thermal imaging drones using edge-AI for real-time pest detection & local automated spraying.',
    selectedFaculty: ['Prof. A. K. Deb (Electrical Engg / Robotics)', 'Prof. S. Mukhopadhyay (Agri & Food Engg)'],
    selectedAlumni: ['Rahul Sharma (Founding Partner, AgriNext)', 'Priya Nair (VP Engineering, RoboticsCo)'],
    tamSamScore: 84,
    viabilityScore: 91,
  });

  const handleNextStage = () => {
    if (currentStage < STAGES.length) {
      setCurrentStage((prev) => prev + 1);
    }
  };

  const handlePrevStage = () => {
    if (currentStage > 1) {
      setCurrentStage((prev) => prev - 1);
    }
  };

  const scrollToWorkspace = () => {
    const el = document.getElementById('playground-workspace');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF9F6] text-stone-800 selection:bg-stone-900 selection:text-stone-50 font-sans pb-24 relative overflow-hidden">
      {/* Background Soft Subtle Chalk Texture */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />

      {/* Top Header Navigation */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-[#FAF9F6]/90 border-b border-stone-200/90 px-6 py-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-stone-900 flex items-center justify-center font-black text-stone-50 shadow-md">
              ⚡
            </div>
            <div>
              <h1 className="text-xl font-extrabold tracking-tight text-stone-900">
                STEP Startup Playground
              </h1>
              <p className="text-xs text-stone-500 font-medium">
                IIT Kharagpur Incubation & Surds Intelligence Workspace
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* View Mode Toggle */}
            <div className="flex bg-stone-200/80 p-1 rounded-xl border border-stone-300">
              <button
                onClick={() => setViewMode('canvas')}
                className={`text-xs font-bold px-3.5 py-1.5 rounded-lg transition ${
                  viewMode === 'canvas' ? 'bg-stone-900 text-stone-50 shadow-xs' : 'text-stone-700 hover:text-stone-950'
                }`}
              >
                📐 Figma Canvas
              </button>
              <button
                onClick={() => setViewMode('stepper')}
                className={`text-xs font-bold px-3.5 py-1.5 rounded-lg transition ${
                  viewMode === 'stepper' ? 'bg-stone-900 text-stone-50 shadow-xs' : 'text-stone-700 hover:text-stone-950'
                }`}
              >
                📊 Linear Stepper
              </button>
            </div>

            <span className="text-xs px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-300 flex items-center gap-2 font-bold shadow-2xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Surds BI Active
            </span>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 md:px-6 pt-8 relative z-10 space-y-8">
        {/* Top Hero Section with Embedded AI Banner Image & Infographic Stats */}
        <PlaygroundHero onStartBuilding={scrollToWorkspace} />

        {/* 1st Level: Dynamic Founder Topology (Figma Canvas or Stepper) */}
        <div id="playground-workspace" className="scroll-mt-24">
          {viewMode === 'canvas' ? (
            <FigmaGraphCanvas
              ideaState={ideaState}
              currentStage={currentStage}
              onSelectStage={(id) => setCurrentStage(id)}
            />
          ) : (
            <div className="p-6 rounded-2xl bg-white border border-stone-200/90 shadow-sm">
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-stone-900">STAGE {currentStage} OF {STAGES.length}</span>
                  <span className="text-stone-300">•</span>
                  <span className="text-sm font-semibold text-stone-700">{STAGES[currentStage - 1].name}</span>
                </div>
                <div className="text-xs font-semibold text-stone-500">
                  Progress: {Math.round((currentStage / STAGES.length) * 100)}%
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                {STAGES.map((s) => {
                  const isActive = s.id === currentStage;
                  const isCompleted = s.id < currentStage;
                  return (
                    <button
                      key={s.id}
                      onClick={() => setCurrentStage(s.id)}
                      className={`flex flex-col p-3.5 rounded-xl border text-left transition-all relative ${
                        isActive
                          ? 'bg-stone-900 text-stone-50 border-stone-900 shadow-md ring-2 ring-stone-900/10'
                          : isCompleted
                          ? 'bg-stone-100/90 border-stone-300 text-stone-800 hover:border-stone-400'
                          : 'bg-white border-stone-200 text-stone-400 hover:border-stone-300'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-lg">{s.icon}</span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                          isActive ? 'bg-stone-50 text-stone-950' : isCompleted ? 'bg-emerald-100 text-emerald-800' : 'bg-stone-100 text-stone-500'
                        }`}>
                          {isCompleted ? '✓ DONE' : isActive ? 'ACTIVE' : `STEP ${s.id}`}
                        </span>
                      </div>
                      <span className="text-xs font-bold truncate">{s.name}</span>
                      <span className="text-[10px] opacity-75 truncate">{s.desc}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* 2nd Level: Startup Academy & Embedded Video Hub (Right after Figma Flow) */}
        <StartupVideoHub />

        {/* 2nd Level: Half Baked Newsletter Section (gethalfbaked.com integration) */}
        <HalfBakedNewsletterSection />

        {/* 3rd Level: Focus Workspace Header Banner for Active Stage */}
        <div className="p-4 md:p-5 rounded-none bg-white border-2 border-stone-900 shadow-[4px_4px_0px_0px_rgba(28,25,23,1)] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="text-2xl p-2 rounded-none bg-amber-400 border-2 border-stone-900 shadow-[2px_2px_0px_0px_rgba(28,25,23,1)]">
              {STAGES[currentStage - 1].icon}
            </span>
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-stone-900 px-2 py-0.5 rounded-none bg-amber-100 border border-stone-900 inline-block mb-1">
                STAGE WORKSPACE {currentStage}
              </span>
              <h3 className="text-base font-black text-stone-900 leading-tight">
                {STAGES[currentStage - 1].name}
              </h3>
            </div>
          </div>
          <div className="text-xs font-bold text-stone-900 bg-[#FAF9F5] px-3.5 py-2 rounded-none border-2 border-stone-900 shadow-[2px_2px_0px_0px_rgba(28,25,23,1)] flex items-center gap-2">
            <span>Selected Idea:</span>
            <strong className="text-stone-950 font-black px-2 py-0.5 rounded-none bg-amber-400 border border-stone-900">
              {ideaState.title}
            </strong>
          </div>
        </div>

        {/* 3rd Level: Dynamic Stage Content Renderer */}
        <div className="transition-all duration-300">
          {currentStage === 1 && (
            <SeededProblemFeed ideaState={ideaState} setIdeaState={setIdeaState} onNext={handleNextStage} />
          )}

          {currentStage === 2 && (
            <ValidationDirectory ideaState={ideaState} setIdeaState={setIdeaState} onNext={handleNextStage} onPrev={handlePrevStage} />
          )}

          {currentStage === 3 && (
            <SurdsBIEngine ideaState={ideaState} setIdeaState={setIdeaState} onNext={handleNextStage} onPrev={handlePrevStage} />
          )}

          {currentStage === 4 && (
            <SocialLaunchpack ideaState={ideaState} setIdeaState={setIdeaState} onNext={handleNextStage} onPrev={handlePrevStage} />
          )}

          {currentStage === 5 && (
            <div className="space-y-8">
              <VCDeckPortal ideaState={ideaState} />
              <LegalVault ideaState={ideaState} />
            </div>
          )}
        </div>

        {/* Global Bottom Stage Navigation Controls */}
        <div className="mt-12 flex items-center justify-between p-4 rounded-xl bg-white border border-stone-200 shadow-xs">
          <button
            disabled={currentStage === 1}
            onClick={handlePrevStage}
            className="px-5 py-2.5 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 border border-stone-300 disabled:opacity-40 disabled:cursor-not-allowed font-semibold text-xs transition"
          >
            ← Previous Stage
          </button>

          <div className="text-xs text-stone-500 hidden sm:block">
            Currently working on: <span className="text-stone-900 font-bold">{ideaState.title}</span>
          </div>

          {currentStage < STAGES.length ? (
            <button
              onClick={handleNextStage}
              className="px-6 py-2.5 rounded-lg bg-stone-900 hover:bg-stone-800 text-stone-50 font-bold text-xs shadow-sm transition"
            >
              Continue to {STAGES[currentStage].name} →
            </button>
          ) : (
            <button
              onClick={() => alert('Congratulations! Your startup package is ready for STEP Incubation Review.')}
              className="px-6 py-2.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-sm transition"
            >
              🎉 Submit to STEP Incubation
            </button>
          )}
        </div>
      </main>
    </div>
  );
}
