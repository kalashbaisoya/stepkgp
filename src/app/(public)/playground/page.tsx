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
  { id: 1, name: 'Idea & Problem Discovery', icon: '💡', tint: 'clay-sun', desc: 'Browse Seeded Issues or Blueprint Your Idea' },
  { id: 2, name: 'Faculty & Market Validation', icon: '🔬', tint: 'clay-sky', desc: 'IIT KGP Research Lookup & Alumni Reachout' },
  { id: 3, name: 'Surds Business Intelligence', icon: '📊', tint: 'clay-mint', desc: 'TAM/SAM, Competitor Analysis & Viability' },
  { id: 4, name: 'Social Launchpack', icon: '🚀', tint: 'clay-lilac', desc: 'LinkedIn Post & Elevator Pitch Generator' },
  { id: 5, name: 'VC Dispatch & Legal Vault', icon: '⚖️', tint: 'clay-rose', desc: 'Incubation Pitch & Compliance Checklist' },
  { id: 6, name: 'Co-Founder & Talent Matchmaking', icon: '🤝', tint: 'clay-soft', desc: 'Find Co-Founders, CTOs & Engineers' },
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
    <div className="min-h-screen bg-background text-foreground font-sans pb-24 relative">
      {/* Soft clay backdrop */}
      <div className="clay-blobs absolute inset-x-0 top-0 h-[36rem] pointer-events-none" aria-hidden />

      {/* No page-level header here: the site header in (public)/layout.tsx already
          carries the branding, and every tool now sits on its node in
          FigmaGraphCanvas. The hero is the first thing on the page. */}
      <main className="max-w-7xl mx-auto px-4 md:px-6 pt-8 relative z-10 space-y-8">
        {/* Top Hero Section with Embedded AI Banner Image & Infographic Stats */}
        <PlaygroundHero onStartBuilding={scrollToWorkspace} />

        {/* Workspace Toolbar: Execute Graph & View Toggle */}
        <div id="playground-workspace" className="clay scroll-mt-28 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 p-4">
          <div className="flex items-center gap-3">
            <button
              onClick={handleExecuteFullGraph}
              disabled={executingNode}
              className="clay-btn clay-dark px-4 py-2.5 text-xs"
            >
              <span>⚡</span> {executingNode ? 'Executing Node Engine...' : 'Run Full Graph Execution'}
            </button>

            <span className="text-xs text-muted-foreground font-medium hidden md:inline">
              Executes Nodes 1–5 backend pipeline synchronously
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground font-semibold">Topology Layout:</span>
            <div className="clay-inset flex gap-1 p-1.5 rounded-[1rem]">
              <button
                onClick={() => setViewMode('canvas')}
                className={`text-xs font-semibold px-3 py-1.5 rounded-xl transition ${
                  viewMode === 'canvas' ? 'clay-sm clay-dark' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                📐 Canvas Graph
              </button>
              <button
                onClick={() => setViewMode('stepper')}
                className={`text-xs font-semibold px-3 py-1.5 rounded-xl transition ${
                  viewMode === 'stepper' ? 'clay-sm clay-dark' : 'text-muted-foreground hover:text-foreground'
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
              onOpenSearch={() => setSearchOpen(true)}
              onOpenProfile={() => setProfileOpen(true)}
              onOpenMvp={() => setMvpOpen(true)}
              onOpenGovt={() => setGovtOpen(true)}
            />
          ) : (
            <div className="clay p-6">
              <div className="flex flex-wrap justify-between items-center gap-3 mb-6">
                <div className="flex items-center gap-2">
                  <span className="clay-chip clay-soft text-[13px] uppercase tracking-wider">
                    Stage {currentStage} of {STAGES.length}
                  </span>
                  <span className="text-sm font-semibold text-foreground/80">{STAGES[currentStage - 1].name}</span>
                </div>
                <div className="text-xs font-semibold text-muted-foreground">
                  Progress: {Math.round((currentStage / STAGES.length) * 100)}%
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-3">
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
                      className={`clay-btn clay-plain flex flex-col items-stretch justify-start gap-2 p-4 text-left ${
                        isActive ? 'ring-2 ring-brand' : ''
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className={`clay-sm ${s.tint} flex h-10 w-10 items-center justify-center text-lg`}>
                          {s.icon}
                        </span>
                        <span className={`text-[13px] font-bold px-2.5 py-1 rounded-full ${
                          isActive ? 'bg-brand text-white' : 'bg-black/6 text-muted-foreground'
                        }`}>
                          {isCompleted ? '✓ DONE' : isActive ? 'ACTIVE' : `STEP ${s.id}`}
                        </span>
                      </div>
                      <span className="text-sm font-bold leading-snug">{s.name}</span>
                      <span className="text-xs text-muted-foreground font-medium leading-snug">{s.desc}</span>
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
        <div className="clay p-4 md:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className={`clay-sm ${STAGES[currentStage - 1].tint} text-2xl flex h-12 w-12 items-center justify-center`}>
              {STAGES[currentStage - 1].icon}
            </span>
            <div>
              <span className="clay-chip clay-soft text-xs uppercase tracking-wider mb-1.5">
                Stage workspace {currentStage}
              </span>
              <h3 className="text-base font-bold leading-tight">
                {STAGES[currentStage - 1].name}
              </h3>
            </div>
          </div>
          <div className="clay-inset text-xs font-semibold text-foreground/80 px-3.5 py-2.5 flex flex-wrap items-center gap-2">
            <span className="text-muted-foreground">Selected Idea:</span>
            <strong className="clay-chip clay-sun text-[13px]">
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
        <div className="clay mt-12 flex flex-wrap items-center justify-between gap-3 p-4">
          <button
            disabled={currentStage === 1}
            onClick={handlePrevStage}
            className="clay-btn clay-plain px-5 py-2.5 text-xs"
          >
            ← Previous Stage
          </button>

          <div className="text-xs text-muted-foreground hidden sm:block">
            Currently working on: <span className="text-foreground font-bold">{ideaState.title}</span>
          </div>

          {currentStage < STAGES.length ? (
            <button
              onClick={handleNextStage}
              className="clay-btn clay-dark px-6 py-2.5 text-xs"
            >
              Continue to {STAGES[currentStage].name} →
            </button>
          ) : (
            <button
              onClick={() => alert('Congratulations! Your startup package is ready for STEP Incubation Review.')}
              className="clay-btn clay-mint px-6 py-2.5 text-xs"
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
