'use client';

import React, { useState } from 'react';
import { StartupIdeaState } from '@/app/(public)/playground/page';

type MVPSpecData = {
  title: string;
  recommendedStack: {
    frontend: string;
    backend: string;
    database: string;
    aiMlPipeline: string;
    deployment: string;
  };
  coreModules: { name: string; description: string; priority: 'High' | 'Medium' | 'Low' }[];
  architectureDiagram: string;
  fourWeekSprintRoadmap: { week: number; focus: string; deliverables: string[] }[];
};

type Props = {
  isOpen: boolean;
  onClose: () => void;
  ideaState: StartupIdeaState;
};

export default function MVPBuilderModal({ isOpen, onClose, ideaState }: Props) {
  const [spec, setSpec] = useState<MVPSpecData | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleGenerateSpec = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/playground/mvp-builder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ideaState }),
      });
      const data = await res.json();
      if (res.ok) {
        setSpec(data);
      }
    } catch (err) {
      console.error('Failed to generate MVP spec:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCopySpec = () => {
    if (!spec) return;
    const text = `# ${spec.title}\n\n## Tech Stack\n- Frontend: ${spec.recommendedStack.frontend}\n- Backend: ${spec.recommendedStack.backend}\n- DB: ${spec.recommendedStack.database}\n- AI/ML Pipeline: ${spec.recommendedStack.aiMlPipeline}\n- Deployment: ${spec.recommendedStack.deployment}\n\n## Architecture Diagram\n\`\`\`\n${spec.architectureDiagram}\n\`\`\`\n\n## 4-Week Roadmap\n${spec.fourWeekSprintRoadmap.map((r) => `### Week ${r.week}: ${r.focus}\n${r.deliverables.map((d) => `- ${d}`).join('\n')}`).join('\n\n')}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="clay-lg max-w-3xl w-full max-h-[90vh] flex flex-col relative overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-border/70 flex justify-between items-start gap-3">
          <div>
            <span className="clay-chip clay-mint text-xs uppercase tracking-wider">
              STEP MVP ENGINEERING SPEC GENERATOR
            </span>
            <h2 className="text-xl font-extrabold mt-1.5">
              Architecture & System Blueprint Builder
            </h2>
            <p className="text-xs text-muted-foreground font-medium">
              Generating engineering specs for <strong className="text-foreground">{ideaState.title}</strong>
            </p>
          </div>
          <button
            onClick={onClose}
            className="clay-btn clay-plain h-9 w-9 shrink-0 rounded-full text-xs"
          >
            ✕
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-xs font-medium">
          {!spec ? (
            <div className="py-12 text-center space-y-4">
              <div className="clay-sm clay-primary w-14 h-14 flex items-center justify-center text-xl mx-auto">
                ⚙️
              </div>
              <div>
                <h3 className="text-sm font-bold">
                  Ready to construct technical architecture?
                </h3>
                <p className="text-xs text-muted-foreground max-w-md mx-auto mt-1">
                  Evaluates domain requirements, recommends optimal tech stack, designs database & API microservices, and compiles a 4-week sprint roadmap.
                </p>
              </div>
              <button
                onClick={handleGenerateSpec}
                disabled={loading}
                className="clay-btn clay-dark px-6 py-2.5"
              >
                {loading ? 'Analyzing & Building Architecture...' : '⚡ Generate Engineering Blueprint'}
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Stack Grid */}
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-3">
                  Recommended Tech Stack
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="clay-inset p-3">
                    <span className="text-xs font-bold text-muted-foreground uppercase">FRONTEND</span>
                    <p className="text-xs font-bold mt-0.5">{spec.recommendedStack.frontend}</p>
                  </div>
                  <div className="clay-inset p-3">
                    <span className="text-xs font-bold text-muted-foreground uppercase">BACKEND & API</span>
                    <p className="text-xs font-bold mt-0.5">{spec.recommendedStack.backend}</p>
                  </div>
                  <div className="clay-inset p-3">
                    <span className="text-xs font-bold text-muted-foreground uppercase">DATABASE & ORM</span>
                    <p className="text-xs font-bold mt-0.5">{spec.recommendedStack.database}</p>
                  </div>
                  <div className="clay-inset p-3">
                    <span className="text-xs font-bold text-muted-foreground uppercase">AI / EDGE PIPELINE</span>
                    <p className="text-xs font-bold mt-0.5">{spec.recommendedStack.aiMlPipeline}</p>
                  </div>
                </div>
              </div>

              {/* Architecture Diagram */}
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-2">
                  System Architecture Diagram
                </h3>
                <pre className="clay clay-dark p-4 font-mono text-[13px] leading-relaxed overflow-x-auto">
                  {spec.architectureDiagram}
                </pre>
              </div>

              {/* 4-Week Sprint Roadmap */}
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-3">
                  4-Week MVP Sprint Roadmap
                </h3>
                <div className="space-y-3">
                  {spec.fourWeekSprintRoadmap.map((sprint) => (
                    <div key={sprint.week} className="clay-sm clay-plain p-3 space-y-1.5">
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-bold">
                          Week {sprint.week}: {sprint.focus}
                        </span>
                        <span className="clay-chip clay-mint text-xs">
                          Sprint {sprint.week}
                        </span>
                      </div>
                      <ul className="list-disc list-inside text-muted-foreground text-[13px] space-y-0.5">
                        {sprint.deliverables.map((d, i) => (
                          <li key={i}>{d}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        {spec && (
          <div className="p-4 border-t border-border/70 bg-surface-2 flex flex-wrap gap-3 justify-between items-center">
            <span className="text-xs text-muted-foreground font-medium">
              Blueprint compiled and verified for STEP Incubation review.
            </span>
            <div className="flex gap-2">
              <button
                onClick={handleCopySpec}
                className="clay-btn clay-plain px-4 py-2 text-xs"
              >
                {copied ? '✓ Copied Markdown' : 'Copy Markdown Spec'}
              </button>
              <button
                onClick={onClose}
                className="clay-btn clay-dark px-4 py-2 text-xs"
              >
                Done
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
