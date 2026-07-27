'use client';

import React from 'react';
import { StartupIdeaState } from '@/app/(public)/playground/page';

type Props = {
  ideaState: StartupIdeaState;
  currentStage: number;
  onSelectStage: (stageId: number) => void;
};

export default function FigmaGraphCanvas({ ideaState, currentStage, onSelectStage }: Props) {
  const NODES = [
    {
      id: 1,
      title: '1. Seeded Problem Discovery',
      tag: 'Problem Feed',
      icon: '💡',
      color: 'bg-[#FAF9F5]',
      accentColor: 'bg-amber-400',
      description: ideaState.problemStatement.slice(0, 75) + '...',
      subText: `Category: ${ideaState.category}`,
    },
    {
      id: 2,
      title: '2. Faculty & Alumni Lookup',
      tag: 'Validation Directory',
      icon: '🔬',
      color: 'bg-[#FAF9F5]',
      accentColor: 'bg-blue-400',
      description: `Matched with ${ideaState.selectedFaculty.length} IIT KGP Labs & ${ideaState.selectedAlumni.length} Alumni Mentors.`,
      subText: 'Automated Briefs Dispatched',
    },
    {
      id: 3,
      title: '3. Surds BI Intelligence',
      tag: 'Market Sizing',
      icon: '📊',
      color: 'bg-[#FAF9F5]',
      accentColor: 'bg-emerald-400',
      description: `Viability Index: ${ideaState.viabilityScore || 91}/100 • TAM/SAM Precision: ${ideaState.tamSamScore || 84}%`,
      subText: 'Competitor Risk Radar Active',
    },
    {
      id: 4,
      title: '4. Social Launchpack',
      tag: 'Founder Studio',
      icon: '🚀',
      color: 'bg-[#FAF9F5]',
      accentColor: 'bg-purple-400',
      description: 'Auto-generated LinkedIn launch copy, X thread & 30-sec elevator pitch deck.',
      subText: 'Virality Engine Ready',
    },
    {
      id: 5,
      title: '5. VC Pitch & Legal Vault',
      tag: 'Incubation Dispatch',
      icon: '⚖️',
      color: 'bg-[#FAF9F5]',
      accentColor: 'bg-rose-400',
      description: 'Pitch deck evaluated and dispatched to 4 Partner VC Funds + STEP legal checklist.',
      subText: 'Approved for Pre-Seed Pipeline',
    },
  ];

  return (
    <div className="p-6 md:p-8 rounded-none bg-white border-2 border-stone-900 shadow-[6px_6px_0px_0px_rgba(28,25,23,1)] space-y-6 relative overflow-hidden">
      {/* Background Canvas Grid Pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(#a8a29e_1px,transparent_1px)] [background-size:16px_16px] opacity-25 pointer-events-none" />

      {/* Figma Flow Controls Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b-2 border-stone-900 pb-4 relative z-10">
        <div className="flex items-center gap-2">
          <div className="px-3 py-1 rounded-none bg-stone-900 text-amber-400 font-black text-xs uppercase tracking-wider border-2 border-stone-900 shadow-[2px_2px_0px_0px_rgba(217,119,6,1)]">
            📐 FIGMA NODE TOPOLOGY CANVAS
          </div>
          <span className="text-stone-400 font-bold hidden sm:inline">•</span>
          <span className="text-xs font-black text-stone-900 hidden sm:inline">
            Interactive Founder Journey Map
          </span>
        </div>

        <div className="flex items-center gap-2 text-xs font-bold text-stone-700 bg-[#FAF9F5] px-3 py-1.5 rounded-none border-2 border-stone-900 shadow-[2px_2px_0px_0px_rgba(28,25,23,1)]">
          <span>Current Active Node:</span>
          <span className="px-2 py-0.5 rounded-none bg-stone-900 text-stone-50 text-[10px] font-black">
            Node {currentStage}
          </span>
        </div>
      </div>

      {/* Figma Topology Canvas Nodes */}
      <div className="relative z-10 py-4">
        {/* Horizontal Topology Node Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 relative">
          {NODES.map((node) => {
            const isActive = node.id === currentStage;
            const isCompleted = node.id < currentStage;

            return (
              <div
                key={node.id}
                onClick={() => onSelectStage(node.id)}
                className={`p-4 rounded-none border-2 transition-all cursor-pointer flex flex-col justify-between space-y-3 relative group ${
                  isActive
                    ? 'bg-stone-900 text-stone-50 border-stone-900 shadow-[6px_6px_0px_0px_rgba(217,119,6,1)] -translate-y-1'
                    : isCompleted
                    ? 'bg-[#FAF9F5] border-stone-900 text-stone-900 shadow-[4px_4px_0px_0px_rgba(6,78,59,1)] hover:shadow-[6px_6px_0px_0px_rgba(28,25,23,1)]'
                    : 'bg-white border-stone-900 text-stone-800 shadow-[4px_4px_0px_0px_rgba(28,25,23,1)] hover:shadow-[6px_6px_0px_0px_rgba(28,25,23,1)]'
                }`}
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xl">{node.icon}</span>
                    <span
                      className={`text-[9px] font-black px-2 py-0.5 rounded-none border border-stone-900 ${
                        isActive
                          ? 'bg-amber-400 text-stone-950'
                          : isCompleted
                          ? 'bg-emerald-100 text-emerald-950'
                          : 'bg-stone-100 text-stone-800'
                      }`}
                    >
                      {isCompleted ? '✓ COMPLETED' : isActive ? 'ACTIVE NODE' : `NODE ${node.id}`}
                    </span>
                  </div>

                  <h3 className={`text-xs font-black leading-snug ${isActive ? 'text-stone-50' : 'text-stone-900'}`}>
                    {node.title}
                  </h3>

                  <p className={`text-[11px] font-medium leading-relaxed ${isActive ? 'text-stone-300' : 'text-stone-600'}`}>
                    {node.description}
                  </p>
                </div>

                <div className={`pt-2 border-t-2 ${isActive ? 'border-stone-700' : 'border-stone-900'} flex items-center justify-between text-[10px] font-bold`}>
                  <span className={isActive ? 'text-amber-300' : 'text-stone-700'}>{node.subText}</span>
                  <span className="group-hover:translate-x-1 transition">→</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
