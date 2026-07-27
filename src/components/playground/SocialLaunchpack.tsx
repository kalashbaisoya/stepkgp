'use client';

import React, { useState, useEffect } from 'react';
import { StartupIdeaState } from '@/app/(public)/playground/page';

type Props = {
  ideaState: StartupIdeaState;
  setIdeaState: React.Dispatch<React.SetStateAction<StartupIdeaState>>;
  onNext: () => void;
  onPrev: () => void;
};

export default function SocialLaunchpack({ ideaState, onNext, onPrev }: Props) {
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState<string | null>(null);
  const [launchCopy, setLaunchCopy] = useState<any>(null);

  const fetchLaunchpack = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/playground/social-launchpack', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: ideaState.title,
          category: ideaState.category,
          problemStatement: ideaState.problemStatement,
          proposedSolution: ideaState.proposedSolution,
          targetAudience: ideaState.targetAudience,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setLaunchCopy(data.data);
      }
    } catch (err) {
      console.error('Launchpack error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLaunchpack();
  }, [ideaState.title]);

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopied(label);
    setTimeout(() => setCopied(null), 3000);
  };

  return (
    <div className="space-y-6">
      <div className="p-4 rounded-2xl bg-white border border-stone-200 shadow-xs flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-stone-900">Stage 4: Social Launchpack & Pitch Generator</h2>
          <p className="text-xs text-stone-500">
            Generate viral LinkedIn posts, X threads & elevator pitches for STEP campus validation.
          </p>
        </div>
        <button
          onClick={fetchLaunchpack}
          className="text-xs font-bold px-3 py-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-800 border border-stone-300"
        >
          🔄 Regenerate Copy
        </button>
      </div>

      {loading ? (
        <div className="p-12 text-center text-stone-500 text-xs font-semibold animate-pulse">
          Generating AI Launchpack Copy for "{ideaState.title}"...
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* LinkedIn Post Copy */}
          <div className="p-5 rounded-2xl bg-white border border-stone-200 shadow-xs space-y-3 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex justify-between items-center border-b border-stone-100 pb-2">
                <h3 className="text-sm font-bold text-stone-900 flex items-center gap-2">
                  <span>💼</span> Generated LinkedIn Post
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-800">Ready</span>
              </div>
              <pre className="text-xs text-stone-800 bg-stone-50 p-4 rounded-xl font-sans whitespace-pre-wrap leading-relaxed border border-stone-200">
                {launchCopy?.linkedinPost}
              </pre>
            </div>

            <button
              onClick={() => copyToClipboard(launchCopy?.linkedinPost, 'linkedin')}
              className="w-full py-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-stone-50 font-bold text-xs shadow-xs transition"
            >
              {copied === 'linkedin' ? '✓ Copied to Clipboard!' : '📋 Copy LinkedIn Post'}
            </button>
          </div>

          {/* Elevator Pitch */}
          <div className="p-5 rounded-2xl bg-white border border-stone-200 shadow-xs space-y-3 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex justify-between items-center border-b border-stone-100 pb-2">
                <h3 className="text-sm font-bold text-stone-900 flex items-center gap-2">
                  <span>🎤</span> 30-Second Elevator Pitch
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-50 text-amber-800">Pitch Deck</span>
              </div>
              <div className="text-xs text-stone-800 bg-stone-50 p-4 rounded-xl leading-relaxed border border-stone-200 italic font-serif">
                {launchCopy?.elevatorPitch}
              </div>
            </div>

            <button
              onClick={() => copyToClipboard(launchCopy?.elevatorPitch, 'pitch')}
              className="w-full py-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-stone-50 font-bold text-xs shadow-xs transition"
            >
              {copied === 'pitch' ? '✓ Copied to Clipboard!' : '📋 Copy Elevator Pitch'}
            </button>
          </div>
        </div>
      )}

      <div className="flex justify-between pt-4">
        <button onClick={onPrev} className="px-4 py-2 rounded-lg bg-stone-100 text-stone-700 text-xs font-semibold">
          ← Back
        </button>
        <button onClick={onNext} className="px-6 py-2 rounded-lg bg-stone-900 text-stone-50 text-xs font-bold">
          Proceed to VC Pitch Portal →
        </button>
      </div>
    </div>
  );
}
