'use client';

import React, { useState, useEffect } from 'react';
import { StartupIdeaState } from '@/app/(public)/playground/page';

type Props = {
  ideaState: StartupIdeaState;
  setIdeaState: React.Dispatch<React.SetStateAction<StartupIdeaState>>;
  onNext: () => void;
  onPrev: () => void;
};

export default function SurdsBIEngine({ ideaState, setIdeaState, onNext, onPrev }: Props) {
  const [loading, setLoading] = useState(true);
  const [biData, setBiData] = useState<any>(null);

  const fetchBiData = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/playground/surds-bi', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: ideaState.title,
          category: ideaState.category,
          problemStatement: ideaState.problemStatement,
          targetAudience: ideaState.targetAudience,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setBiData(data.data);
        setIdeaState((prev) => ({
          ...prev,
          tamSamScore: data.data.tamSamScore,
          viabilityScore: data.data.viabilityScore,
        }));
      }
    } catch (err) {
      console.error('Surds BI fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBiData();
  }, [ideaState.title]);

  return (
    <div className="space-y-6">
      <div className="p-4 rounded-2xl bg-white border border-stone-200 shadow-xs flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-stone-900">Stage 3: Surds Business Intelligence Engine</h2>
          <p className="text-xs text-stone-500">
            Real-time market sizing, TAM/SAM/SOM breakdown, competitor benchmarking & risk scoring.
          </p>
        </div>
        <button
          onClick={fetchBiData}
          className="text-xs font-bold px-3 py-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-800 border border-stone-300"
        >
          🔄 Re-Scan Market Metrics
        </button>
      </div>

      {loading ? (
        <div className="p-12 text-center text-stone-500 text-xs font-semibold animate-pulse">
          Surds BI Intelligence Engine Analyzing TAM/SAM/SOM Metrics for "{ideaState.title}"...
        </div>
      ) : (
        <div className="space-y-6">
          {/* Key Metrics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl bg-white border border-stone-200 shadow-xs space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400">Total Addressable Market</span>
              <div className="text-2xl font-black text-stone-900">{biData?.tam}</div>
              <p className="text-[11px] text-stone-500">Global Annual TAM</p>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-stone-200 shadow-xs space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400">Serviceable Addressable Market</span>
              <div className="text-2xl font-black text-emerald-700">{biData?.sam}</div>
              <p className="text-[11px] text-stone-500">India & South Asia SAM</p>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-stone-200 shadow-xs space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700">Surds Viability Score</span>
              <div className="text-2xl font-black text-stone-900">{biData?.viabilityScore} / 100</div>
              <p className="text-[11px] text-stone-500">High Product-Market Fit</p>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-stone-200 shadow-xs space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400">TAM/SAM Precision</span>
              <div className="text-2xl font-black text-stone-900">{biData?.tamSamScore}%</div>
              <p className="text-[11px] text-stone-500">Surds Intelligence Index</p>
            </div>
          </div>

          {/* Competitor Benchmarking & Risk Radar */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="p-5 rounded-2xl bg-white border border-stone-200 shadow-xs space-y-4">
              <h3 className="text-sm font-bold text-stone-900 flex items-center gap-2">
                <span>⚔️</span> Competitor Benchmarking
              </h3>

              <div className="space-y-3">
                {biData?.competitors?.map((comp: any, idx: number) => (
                  <div key={idx} className="p-3.5 rounded-xl bg-stone-50 border border-stone-200 text-xs space-y-1">
                    <div className="flex justify-between font-bold text-stone-900">
                      <span>{comp.name}</span>
                      <span className="text-stone-500">{comp.marketShare} Share</span>
                    </div>
                    <p className="text-stone-600">Weakness: {comp.weakness}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-stone-200 shadow-xs space-y-4">
              <h3 className="text-sm font-bold text-stone-900 flex items-center gap-2">
                <span>🛡️</span> Risk Radar & Mitigation
              </h3>

              <div className="space-y-3">
                {biData?.riskRadar?.map((risk: any, idx: number) => (
                  <div key={idx} className="p-3.5 rounded-xl bg-stone-50 border border-stone-200 text-xs space-y-1">
                    <div className="flex justify-between font-bold text-stone-900">
                      <span>{risk.factor}</span>
                      <span className={`px-2 py-0.5 rounded text-[10px] ${
                        risk.level === 'High' ? 'bg-red-100 text-red-800 font-bold' : 'bg-amber-100 text-amber-900 font-bold'
                      }`}>
                        {risk.level} Risk
                      </span>
                    </div>
                    <p className="text-stone-600">Mitigation: {risk.mitigation}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-between pt-4">
        <button onClick={onPrev} className="px-4 py-2 rounded-lg bg-stone-100 text-stone-700 text-xs font-semibold">
          ← Back
        </button>
        <button onClick={onNext} className="px-6 py-2 rounded-lg bg-stone-900 text-stone-50 text-xs font-bold">
          Proceed to Launchpack →
        </button>
      </div>
    </div>
  );
}
