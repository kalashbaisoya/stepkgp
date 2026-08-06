'use client';

import React from 'react';
import { StartupIdeaState } from '@/app/(public)/playground/page';

/** A tool that used to sit in the page header, now attached to the node it serves. */
type NodeTool = { label: string; icon: string; tint: string; run: () => void };

type Props = {
  ideaState: StartupIdeaState;
  currentStage: number;
  onSelectStage: (stageId: number) => void;
  onOpenSearch: () => void;
  onOpenProfile: () => void;
  onOpenMvp: () => void;
  onOpenGovt: () => void;
};

export default function FigmaGraphCanvas({
  ideaState,
  currentStage,
  onSelectStage,
  onOpenSearch,
  onOpenProfile,
  onOpenMvp,
  onOpenGovt,
}: Props) {
  const NODES: {
    id: number;
    title: string;
    tag: string;
    icon: string;
    tint: string;
    description: string;
    subText: string;
    tools: NodeTool[];
  }[] = [
    {
      id: 1,
      title: '1. Seeded Problem Discovery',
      tag: 'Problem Feed',
      icon: '💡',
      tint: 'clay-sun',
      description: ideaState.problemStatement.slice(0, 75) + '...',
      subText: `Category: ${ideaState.category}`,
      tools: [{ label: 'Search Ecosystem', icon: '🔍', tint: 'clay-plain', run: onOpenSearch }],
    },
    {
      id: 2,
      title: '2. Faculty & Alumni Lookup',
      tag: 'Validation Directory',
      icon: '🔬',
      tint: 'clay-sky',
      description: `Matched with ${ideaState.selectedFaculty.length} IIT KGP Labs & ${ideaState.selectedAlumni.length} Alumni Mentors.`,
      subText: 'Automated Briefs Dispatched',
      tools: [{ label: 'Claim Profile', icon: '👤', tint: 'clay-soft', run: onOpenProfile }],
    },
    {
      id: 3,
      title: '3. Surds BI Intelligence',
      tag: 'Market Sizing',
      icon: '📊',
      tint: 'clay-mint',
      description: `Viability Index: ${ideaState.viabilityScore || 91}/100 • TAM/SAM Precision: ${ideaState.tamSamScore || 84}%`,
      subText: 'Competitor Risk Radar Active',
      tools: [{ label: 'MVP Spec Builder', icon: '⚙️', tint: 'clay-mint', run: onOpenMvp }],
    },
    {
      id: 4,
      title: '4. Social Launchpack',
      tag: 'Founder Studio',
      icon: '🚀',
      tint: 'clay-lilac',
      description: 'Auto-generated LinkedIn launch copy, X thread & 30-sec elevator pitch deck.',
      subText: 'Virality Engine Ready',
      tools: [],
    },
    {
      id: 5,
      title: '5. VC Pitch & Legal Vault',
      tag: 'Incubation Dispatch',
      icon: '⚖️',
      tint: 'clay-rose',
      description: 'Pitch deck evaluated and dispatched to 4 Partner VC Funds + STEP legal checklist.',
      subText: 'Approved for Pre-Seed Pipeline',
      tools: [
        { label: 'Govt & IP Services', icon: '🏛️', tint: 'clay-sun', run: onOpenGovt },
        { label: 'Policies & SOPs', icon: '📜', tint: 'clay-dark', run: onOpenSearch },
      ],
    },
  ];

  return (
    <div className="clay-lg p-6 md:p-8 space-y-6 relative overflow-hidden">
      {/* Background Canvas Grid Pattern */}
      <div className="grid-bg absolute inset-0 opacity-50 pointer-events-none" aria-hidden />

      {/* Figma Flow Controls Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-border/70 pb-4 relative z-10">
        <div className="flex items-center gap-2.5">
          <span className="clay-chip clay-dark text-xs uppercase tracking-wider">
            📐 Node Topology Canvas
          </span>
          <span className="text-sm font-semibold text-muted-foreground hidden sm:inline">
            Interactive Founder Journey Map
          </span>
        </div>

        <div className="clay-inset flex items-center gap-2 text-sm font-semibold text-foreground/80 px-3.5 py-2.5">
          <span>Current Active Node:</span>
          <span className="clay-chip clay-primary text-xs">
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
                className={`clay clay-hover clay-plain p-5 cursor-pointer flex flex-col justify-between space-y-3 relative group ${
                  isActive ? '-translate-y-1 ring-2 ring-brand' : ''
                }`}
              >
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between gap-2">
                    <span className={`clay-sm ${node.tint} flex h-11 w-11 items-center justify-center text-xl`}>
                      {node.icon}
                    </span>
                    <span
                      className={`text-[11px] font-bold px-2.5 py-1 rounded-full whitespace-nowrap ${
                        isActive
                          ? 'bg-brand text-white'
                          : isCompleted
                          ? 'bg-black/8 text-foreground'
                          : 'bg-black/6 text-muted-foreground'
                      }`}
                    >
                      {isCompleted ? '✓ COMPLETED' : isActive ? 'ACTIVE NODE' : `NODE ${node.id}`}
                    </span>
                  </div>

                  <h3 className="text-[15px] font-bold leading-snug">{node.title}</h3>

                  <p className="text-[13px] font-medium leading-relaxed text-muted-foreground">
                    {node.description}
                  </p>
                </div>

                <div className="space-y-2.5">
                  {node.tools.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {node.tools.map((tool) => (
                        <button
                          key={tool.label}
                          type="button"
                          // The whole card selects the stage, so a tool click must not
                          // bubble up and yank the user to a different node.
                          onClick={(e) => {
                            e.stopPropagation();
                            tool.run();
                          }}
                          className={`clay-btn ${tool.tint} text-[11px] px-2.5 py-1.5`}
                        >
                          <span>{tool.icon}</span> {tool.label}
                        </button>
                      ))}
                    </div>
                  )}

                  <div className="pt-2.5 border-t border-black/8 flex items-center justify-between gap-2 text-xs font-semibold">
                    <span className={isActive ? 'text-brand' : 'text-muted-foreground'}>{node.subText}</span>
                    <span className="group-hover:translate-x-1 transition">→</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
