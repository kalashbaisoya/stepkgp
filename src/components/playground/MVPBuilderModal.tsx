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
    <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-xl border border-stone-200 shadow-xl max-w-3xl w-full max-h-[90vh] flex flex-col relative overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-stone-200 flex justify-between items-start">
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
              STEP MVP ENGINEERING SPEC GENERATOR
            </span>
            <h2 className="text-xl font-black text-stone-900 mt-1">
              Architecture & System Blueprint Builder
            </h2>
            <p className="text-xs text-stone-600 font-medium">
              Generating engineering specs for <strong className="text-stone-900">{ideaState.title}</strong>
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-stone-400 hover:text-stone-700 font-bold text-sm"
          >
            ✕
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-xs font-medium">
          {!spec ? (
            <div className="py-12 text-center space-y-4">
              <div className="w-12 h-12 rounded-xl bg-stone-900 text-stone-50 flex items-center justify-center text-xl mx-auto shadow-sm">
                ⚙️
              </div>
              <div>
                <h3 className="text-sm font-bold text-stone-900">
                  Ready to construct technical architecture?
                </h3>
                <p className="text-xs text-stone-500 max-w-md mx-auto mt-1">
                  Evaluates domain requirements, recommends optimal tech stack, designs database & API microservices, and compiles a 4-week sprint roadmap.
                </p>
              </div>
              <button
                onClick={handleGenerateSpec}
                disabled={loading}
                className="px-6 py-2.5 rounded-lg bg-stone-900 hover:bg-stone-800 text-stone-50 font-bold shadow-sm transition disabled:opacity-50"
              >
                {loading ? 'Analyzing & Building Architecture...' : '⚡ Generate Engineering Blueprint'}
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Stack Grid */}
              <div>
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-stone-500 mb-3">
                  Recommended Tech Stack
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="p-3 rounded-lg bg-stone-50 border border-stone-200">
                    <span className="text-[10px] font-bold text-stone-400 uppercase">FRONTEND</span>
                    <p className="text-xs font-bold text-stone-900 mt-0.5">{spec.recommendedStack.frontend}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-stone-50 border border-stone-200">
                    <span className="text-[10px] font-bold text-stone-400 uppercase">BACKEND & API</span>
                    <p className="text-xs font-bold text-stone-900 mt-0.5">{spec.recommendedStack.backend}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-stone-50 border border-stone-200">
                    <span className="text-[10px] font-bold text-stone-400 uppercase">DATABASE & ORM</span>
                    <p className="text-xs font-bold text-stone-900 mt-0.5">{spec.recommendedStack.database}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-stone-50 border border-stone-200">
                    <span className="text-[10px] font-bold text-stone-400 uppercase">AI / EDGE PIPELINE</span>
                    <p className="text-xs font-bold text-stone-900 mt-0.5">{spec.recommendedStack.aiMlPipeline}</p>
                  </div>
                </div>
              </div>

              {/* Architecture Diagram */}
              <div>
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-stone-500 mb-2">
                  System Architecture Diagram
                </h3>
                <pre className="p-4 rounded-xl bg-stone-900 text-stone-100 font-mono text-[11px] leading-relaxed overflow-x-auto">
                  {spec.architectureDiagram}
                </pre>
              </div>

              {/* 4-Week Sprint Roadmap */}
              <div>
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-stone-500 mb-3">
                  4-Week MVP Sprint Roadmap
                </h3>
                <div className="space-y-3">
                  {spec.fourWeekSprintRoadmap.map((sprint) => (
                    <div key={sprint.week} className="p-3 rounded-lg bg-white border border-stone-200 space-y-1.5">
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-black text-stone-900">
                          Week {sprint.week}: {sprint.focus}
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-950">
                          Sprint {sprint.week}
                        </span>
                      </div>
                      <ul className="list-disc list-inside text-stone-600 text-[11px] space-y-0.5">
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
          <div className="p-4 border-t border-stone-200 bg-stone-50 flex justify-between items-center">
            <span className="text-xs text-stone-500 font-medium">
              Blueprint compiled and verified for STEP Incubation review.
            </span>
            <div className="flex gap-2">
              <button
                onClick={handleCopySpec}
                className="px-4 py-2 rounded-lg bg-stone-200 hover:bg-stone-300 text-stone-800 font-bold text-xs transition"
              >
                {copied ? '✓ Copied Markdown' : 'Copy Markdown Spec'}
              </button>
              <button
                onClick={onClose}
                className="px-4 py-2 rounded-lg bg-stone-900 hover:bg-stone-800 text-stone-50 font-bold text-xs transition"
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
