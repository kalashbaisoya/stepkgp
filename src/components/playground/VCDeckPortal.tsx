'use client';

import React, { useState } from 'react';
import { StartupIdeaState } from '@/app/(public)/playground/page';

type Props = {
  ideaState: StartupIdeaState;
};

export default function VCDeckPortal({ ideaState }: Props) {
  const [pitchDeck, setPitchDeck] = useState<File | null>(null);
  const [dispatching, setDispatching] = useState(false);
  const [dispatchResult, setDispatchResult] = useState<any>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setPitchDeck(e.target.files[0]);
    }
  };

  const handleVCDispatch = async () => {
    setDispatching(true);
    setDispatchResult(null);

    try {
      const res = await fetch('/api/playground/vc-dispatch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ideaTitle: ideaState.title,
          category: ideaState.category,
          problemStatement: ideaState.problemStatement,
          tamSamScore: ideaState.tamSamScore,
          viabilityScore: ideaState.viabilityScore,
          pitchDeckFile: pitchDeck?.name || 'AgriDrone_PitchDeck.pdf',
        }),
      });

      const data = await res.json();
      if (data.success) {
        setDispatchResult(data.data);
      }
    } catch (err) {
      alert('VC Dispatch failed! Please try again.');
    } finally {
      setDispatching(false);
    }
  };

  return (
    <div className="clay p-6 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/70 pb-4">
        <div>
          <h2 className="text-lg font-bold">Stage 5: VC Pitch Deck Dispatch &amp; Incubation Portal</h2>
          <p className="text-xs text-muted-foreground">
            Upload your pitch deck to trigger automated AI evaluation and dispatch to partner VCs.
          </p>
        </div>
        <span className="clay-chip clay-mint text-xs">
          STEP Approved Pipeline
        </span>
      </div>

      {/* Drag & Drop File Upload Area */}
      <div className="clay-inset p-6 text-center space-y-3">
        <div className="text-3xl">📄</div>
        <div>
          <h3 className="text-sm font-bold">
            {pitchDeck ? `Selected Deck: ${pitchDeck.name}` : 'Upload Pitch Deck (PDF / PPTX)'}
          </h3>
          <p className="text-xs text-muted-foreground">Max file size 25MB • Standard STEP Format</p>
        </div>

        <label className="clay-btn clay-dark inline-flex px-4 py-2 text-xs">
          {pitchDeck ? 'Change File' : 'Choose File'}
          <input type="file" accept=".pdf,.pptx" onChange={handleFileUpload} className="hidden" />
        </label>
      </div>

      {/* Automated Dispatch Trigger Button */}
      <button
        onClick={handleVCDispatch}
        disabled={dispatching}
        className="clay-btn clay-primary w-full py-3 text-xs"
      >
        <span>🚀</span> {dispatching ? 'Running AI Evaluation & VC Dispatch...' : 'Dispatch Pitch Deck to Partner VCs'}
      </button>

      {/* Dispatch Results Panel */}
      {dispatchResult && (
        <div className="clay clay-mint p-5 space-y-4">
          <div className="flex flex-wrap justify-between items-center gap-2 border-b border-black/8 pb-2">
            <h3 className="text-sm font-bold flex items-center gap-2">
              <span>🎉</span> {dispatchResult.dispatchStatus}
            </h3>
            <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-black/8">
              Score: {dispatchResult.evaluation.score}/100
            </span>
          </div>

          <div className="space-y-2">
            <h4 className="text-[13px] font-bold">Partner VCs Included in Dispatch:</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {dispatchResult.dispatchedVCs.map((vc: any, idx: number) => (
                <div key={idx} className="clay-sm clay-plain p-3 text-xs">
                  <div className="font-bold">{vc.name}</div>
                  <div className="text-xs text-muted-foreground">{vc.domain} • {vc.ticketSize}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
