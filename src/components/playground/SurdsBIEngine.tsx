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
      <div className="clay p-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold">Stage 3: Surds Business Intelligence Engine</h2>
          <p className="text-xs text-muted-foreground">
            Real-time market sizing, TAM/SAM/SOM breakdown, competitor benchmarking &amp; risk scoring.
          </p>
        </div>
        <button
          onClick={fetchBiData}
          className="clay-btn clay-plain text-xs px-4 py-2.5"
        >
          🔄 Re-Scan Market Metrics
        </button>
      </div>

      {loading ? (
        <div className="clay-inset p-12 text-center text-muted-foreground text-xs font-semibold animate-pulse">
          Surds BI Intelligence Engine Analyzing TAM/SAM/SOM Metrics for &ldquo;{ideaState.title}&rdquo;...
        </div>
      ) : (
        <div className="space-y-6">
          {/* Key Metrics Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <div className="clay clay-hover clay-sky p-5 space-y-1">
              <span className="text-xs font-bold uppercase tracking-wider opacity-70">Total Addressable Market</span>
              <div className="text-2xl font-extrabold">{biData?.tam}</div>
              <p className="text-[13px] opacity-70">Global Annual TAM</p>
            </div>

            <div className="clay clay-hover clay-mint p-5 space-y-1">
              <span className="text-xs font-bold uppercase tracking-wider opacity-70">Serviceable Addressable Market</span>
              <div className="text-2xl font-extrabold">{biData?.sam}</div>
              <p className="text-[13px] opacity-70">India &amp; South Asia SAM</p>
            </div>

            <div className="clay clay-hover clay-sun p-5 space-y-1">
              <span className="text-xs font-bold uppercase tracking-wider opacity-70">Surds Viability Score</span>
              <div className="text-2xl font-extrabold">{biData?.viabilityScore} / 100</div>
              <p className="text-[13px] opacity-70">High Product-Market Fit</p>
            </div>

            <div className="clay clay-hover clay-lilac p-5 space-y-1">
              <span className="text-xs font-bold uppercase tracking-wider opacity-70">TAM/SAM Precision</span>
              <div className="text-2xl font-extrabold">{biData?.tamSamScore}%</div>
              <p className="text-[13px] opacity-70">Surds Intelligence Index</p>
            </div>
          </div>

          {/* Competitor Benchmarking & Risk Radar */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="clay p-5 space-y-4">
              <h3 className="text-sm font-bold flex items-center gap-2">
                <span>⚔️</span> Competitor Benchmarking
              </h3>

              <div className="space-y-3">
                {biData?.competitors?.map((comp: any, idx: number) => (
                  <div key={idx} className="clay-inset p-3.5 text-xs space-y-1">
                    <div className="flex justify-between font-bold">
                      <span>{comp.name}</span>
                      <span className="text-muted-foreground">{comp.marketShare} Share</span>
                    </div>
                    <p className="text-muted-foreground">Weakness: {comp.weakness}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="clay p-5 space-y-4">
              <h3 className="text-sm font-bold flex items-center gap-2">
                <span>🛡️</span> Risk Radar &amp; Mitigation
              </h3>

              <div className="space-y-3">
                {biData?.riskRadar?.map((risk: any, idx: number) => (
                  <div key={idx} className="clay-inset p-3.5 text-xs space-y-1">
                    <div className="flex justify-between items-center gap-2 font-bold">
                      <span>{risk.factor}</span>
                      <span className={`clay-chip text-xs ${risk.level === 'High' ? 'clay-rose' : 'clay-sun'}`}>
                        {risk.level} Risk
                      </span>
                    </div>
                    <p className="text-muted-foreground">Mitigation: {risk.mitigation}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="clay flex flex-wrap justify-between gap-3 p-4">
        <button onClick={onPrev} className="clay-btn clay-plain px-4 py-2.5 text-xs">
          ← Back
        </button>
        <button onClick={onNext} className="clay-btn clay-dark px-6 py-2.5 text-xs">
          Proceed to Launchpack →
        </button>
      </div>
    </div>
  );
}
