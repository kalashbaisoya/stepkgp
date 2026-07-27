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
    <div className="p-6 rounded-2xl bg-white border border-stone-200 shadow-xs space-y-6">
      <div className="flex items-center justify-between border-b border-stone-100 pb-4">
        <div>
          <h2 className="text-lg font-bold text-stone-900">Stage 5: VC Pitch Deck Dispatch & Incubation Portal</h2>
          <p className="text-xs text-stone-500">
            Upload your pitch deck to trigger automated AI evaluation and dispatch to partner VCs.
          </p>
        </div>
        <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-100 text-emerald-900">
          STEP Approved Pipeline
        </span>
      </div>

      {/* Drag & Drop File Upload Area */}
      <div className="p-6 rounded-xl border-2 border-dashed border-stone-300 hover:border-stone-400 bg-stone-50 text-center transition space-y-3">
        <div className="text-3xl">📄</div>
        <div>
          <h3 className="text-xs font-bold text-stone-800">
            {pitchDeck ? `Selected Deck: ${pitchDeck.name}` : 'Upload Pitch Deck (PDF / PPTX)'}
          </h3>
          <p className="text-[10px] text-stone-500">Max file size 25MB • Standard STEP Format</p>
        </div>

        <label className="inline-block px-4 py-2 rounded-lg bg-stone-900 text-stone-50 text-xs font-bold cursor-pointer hover:bg-stone-800 transition">
          {pitchDeck ? 'Change File' : 'Choose File'}
          <input type="file" accept=".pdf,.pptx" onChange={handleFileUpload} className="hidden" />
        </label>
      </div>

      {/* Automated Dispatch Trigger Button */}
      <button
        onClick={handleVCDispatch}
        disabled={dispatching}
        className="w-full py-3 rounded-xl bg-stone-900 hover:bg-stone-800 text-stone-50 font-bold text-xs shadow-md transition disabled:opacity-50 flex items-center justify-center gap-2"
      >
        <span>🚀</span> {dispatching ? 'Running AI Evaluation & VC Dispatch...' : 'Dispatch Pitch Deck to Partner VCs'}
      </button>

      {/* Dispatch Results Panel */}
      {dispatchResult && (
        <div className="p-5 rounded-xl bg-emerald-50 border border-emerald-300 space-y-4">
          <div className="flex justify-between items-center border-b border-emerald-200 pb-2">
            <h3 className="text-xs font-bold text-emerald-950 flex items-center gap-2">
              <span>🎉</span> {dispatchResult.dispatchStatus}
            </h3>
            <span className="text-[10px] font-bold px-2.5 py-0.5 rounded bg-emerald-700 text-white">
              Score: {dispatchResult.evaluation.score}/100
            </span>
          </div>

          <div className="space-y-2">
            <h4 className="text-[11px] font-bold text-emerald-900">Partner VCs Included in Dispatch:</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {dispatchResult.dispatchedVCs.map((vc: any, idx: number) => (
                <div key={idx} className="p-2.5 rounded-lg bg-white border border-emerald-200 text-xs">
                  <div className="font-bold text-stone-900">{vc.name}</div>
                  <div className="text-[10px] text-stone-500">{vc.domain} • {vc.ticketSize}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
