'use client';

import React, { useState } from 'react';
import Link from 'next/link';
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
import EcosystemSearchModal from '@/components/playground/EcosystemSearchModal';
import ProfileRegistrationModal from '@/components/playground/ProfileRegistrationModal';
import MVPBuilderModal from '@/components/playground/MVPBuilderModal';
import GovtServicesModal from '@/components/playground/GovtServicesModal';
import CoFounderMatchmakingHub from '@/components/playground/CoFounderMatchmakingHub';
import RegisterTalentModal from '@/components/playground/RegisterTalentModal';

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
  lastExecutionData?: any;
};

const STAGES = [
  { id: 1, name: 'Idea & Problem Discovery', icon: '💡', desc: 'Browse Seeded Issues or Blueprint Your Idea' },
  { id: 2, name: 'Faculty & Market Validation', icon: '🔬', desc: 'IIT KGP Research Lookup & Alumni Reachout' },
  { id: 3, name: 'Surds Business Intelligence', icon: '📊', desc: 'TAM/SAM, Competitor Analysis & Viability' },
  { id: 4, name: 'Social Launchpack', icon: '🚀', desc: 'LinkedIn Post & Elevator Pitch Generator' },
  { id: 5, name: 'VC Dispatch & Legal Vault', icon: '⚖️', desc: 'Incubation Pitch & Compliance Checklist' },
  { id: 6, name: 'Co-Founder & Talent Matchmaking', icon: '🤝', desc: 'Find Co-Founders, CTOs & Engineers' },
];

export default function StartupPlaygroundPage() {
  const [currentStage, setCurrentStage] = useState(1);
  const [viewMode, setViewMode] = useState<'canvas' | 'stepper'>('canvas');
  const [executingNode, setExecutingNode] = useState(false);

  // Modals state
  const [searchOpen, setSearchOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [mvpOpen, setMvpOpen] = useState(false);
  const [govtOpen, setGovtOpen] = useState(false);
  const [talentModalOpen, setTalentModalOpen] = useState(false);

  React.useEffect(() => {
    const checkSearchParam = () => {
      if (typeof window !== 'undefined') {
        const params = new URLSearchParams(window.location.search);
        if (params.get('search') === 'open' || params.has('search')) {
          setSearchOpen(true);
        }
      }
    };

    checkSearchParam();
    window.addEventListener('popstate', checkSearchParam);
    return () => window.removeEventListener('popstate', checkSearchParam);
  }, []);

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

  const handleExecuteBackendNode = async (nodeId: number) => {
    setExecutingNode(true);
    try {
      const res = await fetch('/api/playground/execute-node', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nodeId, ideaState }),
      });
      const data = await res.json();
      if (res.ok) {
        setIdeaState((prev) => ({
          ...prev,
          lastExecutionData: data,
          tamSamScore: data.data?.tamSamScore || prev.tamSamScore,
          viabilityScore: data.data?.viabilityScore || prev.viabilityScore,
        }));
      }
    } catch (err) {
      console.error('Node execution failed:', err);
    } finally {
      setExecutingNode(false);
    }
  };

  const handleExecuteFullGraph = async () => {
    setExecutingNode(true);
    try {
      const res = await fetch('/api/playground/execute-graph', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ideaState }),
      });
      const data = await res.json();
      if (res.ok) {
        setIdeaState((prev) => ({
          ...prev,
          lastExecutionData: data,
          tamSamScore: data.summary?.tamSamScore || prev.tamSamScore,
          viabilityScore: data.summary?.viabilityScore || prev.viabilityScore,
        }));
        alert('🎉 Full Graph Pipeline executed successfully! Results saved to database.');
      }
    } catch (err) {
      console.error('Graph execution failed:', err);
    } finally {
      setExecutingNode(false);
    }
  };

  const handleNextStage = () => {
    if (currentStage < STAGES.length) {
      const nextStage = currentStage + 1;
      setCurrentStage(nextStage);
      handleExecuteBackendNode(nextStage);
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
      {/* Background Soft Subtle Grid Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />

      {/* Top Header Navigation */}
      <header className="sticky top-0 z-40 backdrop-blur-md bg-[#FAF9F6]/90 border-b border-stone-200/90 px-6 py-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-stone-900 flex items-center justify-center font-black text-stone-50 shadow-xs">
              ⚡
            </div>
            <div>
              <h1 className="text-xl font-extrabold tracking-tight text-stone-900">
                STEP Startup Playground
              </h1>
              <p className="text-xs text-stone-500 font-medium">
                IIT Kharagpur Incubation & Node Graph Execution Engine
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Govt & IP Services Direct Action Button */}
            <button
              onClick={() => setGovtOpen(true)}
              className="text-xs font-bold px-3 py-1.5 rounded-lg bg-amber-400 text-stone-950 hover:bg-amber-500 border border-stone-900 transition shadow-2xs flex items-center gap-1.5"
            >
              <span>🏛️</span> Govt &amp; IP Services
            </button>

            {/* Statewise Policies & SOPs Direct Action Button */}
            <button
              onClick={() => setSearchOpen(true)}
              className="text-xs font-bold px-3 py-1.5 rounded-lg bg-stone-900 text-stone-50 hover:bg-stone-800 border border-stone-900 transition shadow-2xs flex items-center gap-1.5"
            >
              <span>📜</span> Statewise Policies &amp; SOPs
            </button>

            {/* Hybrid Search Button */}
            <button
              onClick={() => setSearchOpen(true)}
              className="text-xs font-bold px-3 py-1.5 rounded-lg bg-white border border-stone-300 text-stone-700 hover:bg-stone-100 transition shadow-2xs flex items-center gap-1.5"
            >
              <span>🔍</span> Search Ecosystem
            </button>

            {/* Claim Profile Button */}
            <button
              onClick={() => setProfileOpen(true)}
              className="text-xs font-bold px-3 py-1.5 rounded-lg bg-amber-100 border border-amber-300 text-amber-900 hover:bg-amber-200 transition shadow-2xs flex items-center gap-1.5"
            >
              <span>👤</span> Claim Profile
            </button>

            {/* MVP Spec Builder */}
            <button
              onClick={() => setMvpOpen(true)}
              className="text-xs font-bold px-3 py-1.5 rounded-lg bg-emerald-100 border border-emerald-300 text-emerald-950 hover:bg-emerald-200 transition shadow-2xs flex items-center gap-1.5"
            >
              <span>⚙️</span> MVP Spec Builder
            </button>

            {/* System Docs Link */}
            <Link
              href="/playground/docs"
              className="text-xs font-bold px-3 py-1.5 rounded-lg bg-stone-900 text-stone-50 hover:bg-stone-800 transition shadow-2xs flex items-center gap-1.5"
            >
              <span>📚</span> Docs & System Guide
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 md:px-6 pt-8 relative z-10 space-y-8">
        {/* Top Hero Section with Embedded AI Banner Image & Infographic Stats */}
        <PlaygroundHero onStartBuilding={scrollToWorkspace} />

        {/* Workspace Toolbar: Execute Graph & View Toggle */}
        <div id="playground-workspace" className="scroll-mt-24 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 rounded-xl border border-stone-200 shadow-xs">
          <div className="flex items-center gap-3">
            <button
              onClick={handleExecuteFullGraph}
              disabled={executingNode}
              className="px-4 py-2 rounded-lg bg-stone-900 hover:bg-stone-800 text-stone-50 font-bold text-xs shadow-xs transition flex items-center gap-2 disabled:opacity-50"
            >
              <span>⚡</span> {executingNode ? 'Executing Node Engine...' : 'Run Full Graph Execution'}
            </button>

            <span className="text-xs text-stone-500 font-medium hidden md:inline">
              Executes Nodes 1–5 backend pipeline synchronously
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-stone-400 font-bold">Topology Layout:</span>
            <div className="flex bg-stone-100 p-1 rounded-lg border border-stone-200">
              <button
                onClick={() => setViewMode('canvas')}
                className={`text-xs font-bold px-3 py-1 rounded-md transition ${
                  viewMode === 'canvas' ? 'bg-stone-900 text-stone-50 shadow-2xs' : 'text-stone-700 hover:text-stone-950'
                }`}
              >
                📐 Canvas Graph
              </button>
              <button
                onClick={() => setViewMode('stepper')}
                className={`text-xs font-bold px-3 py-1 rounded-md transition ${
                  viewMode === 'stepper' ? 'bg-stone-900 text-stone-50 shadow-2xs' : 'text-stone-700 hover:text-stone-950'
                }`}
              >
                📊 Linear Stepper
              </button>
            </div>
          </div>
        </div>

        {/* 1st Level: Dynamic Founder Topology (Figma Canvas or Stepper) */}
        <div>
          {viewMode === 'canvas' ? (
            <FigmaGraphCanvas
              ideaState={ideaState}
              currentStage={currentStage}
              onSelectStage={(id) => {
                setCurrentStage(id);
                handleExecuteBackendNode(id);
              }}
            />
          ) : (
            <div className="p-6 rounded-xl bg-white border border-stone-200/90 shadow-xs">
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
                      onClick={() => {
                        setCurrentStage(s.id);
                        handleExecuteBackendNode(s.id);
                      }}
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

        {/* Startup Academy & Video Hub */}
        <StartupVideoHub />

        {/* Half Baked Newsletter Integration */}
        <HalfBakedNewsletterSection />

        {/* Active Stage Workspace Banner */}
        <div className="p-4 md:p-5 rounded-xl bg-white border border-stone-300 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="text-2xl p-2 rounded-lg bg-amber-100 border border-amber-300">
              {STAGES[currentStage - 1].icon}
            </span>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-900 px-2 py-0.5 rounded bg-amber-100 inline-block mb-1">
                STAGE WORKSPACE {currentStage}
              </span>
              <h3 className="text-base font-bold text-stone-900 leading-tight">
                {STAGES[currentStage - 1].name}
              </h3>
            </div>
          </div>
          <div className="text-xs font-semibold text-stone-700 bg-stone-50 px-3.5 py-2 rounded-lg border border-stone-200 flex items-center gap-2">
            <span>Selected Idea:</span>
            <strong className="text-stone-900 font-bold px-2 py-0.5 rounded bg-amber-100">
              {ideaState.title}
            </strong>
          </div>
        </div>

        {/* Stage Content Renderer */}
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

          {currentStage === 6 && (
            <CoFounderMatchmakingHub onOpenRegisterModal={() => setTalentModalOpen(true)} />
          )}
        </div>

        {/* Navigation Controls */}
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
              className="px-6 py-2.5 rounded-lg bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs shadow-sm transition"
            >
              🎉 Submit to STEP Incubation
            </button>
          )}
        </div>
      </main>

      {/* Ecosystem Search Modal */}
      <EcosystemSearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} />

      {/* Claim Profile Registration Modal */}
      <ProfileRegistrationModal isOpen={profileOpen} onClose={() => setProfileOpen(false)} />

      {/* MVP Spec Engineering Builder Modal */}
      <MVPBuilderModal isOpen={mvpOpen} onClose={() => setMvpOpen(false)} ideaState={ideaState} />

      {/* Government & IP Services Integration Modal */}
      <GovtServicesModal isOpen={govtOpen} onClose={() => setGovtOpen(false)} />

      {/* Register Talent & Co-Founder Modal */}
      <RegisterTalentModal isOpen={talentModalOpen} onClose={() => setTalentModalOpen(false)} />
    </div>
  );
}
