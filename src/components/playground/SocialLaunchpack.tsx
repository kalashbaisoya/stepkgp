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
      <div className="clay p-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold">Stage 4: Social Launchpack &amp; Pitch Generator</h2>
          <p className="text-xs text-muted-foreground">
            Generate viral LinkedIn posts, X threads &amp; elevator pitches for STEP campus validation.
          </p>
        </div>
        <button
          onClick={fetchLaunchpack}
          className="clay-btn clay-plain text-xs px-4 py-2.5"
        >
          🔄 Regenerate Copy
        </button>
      </div>

      {loading ? (
        <div className="clay-inset p-12 text-center text-muted-foreground text-xs font-semibold animate-pulse">
          Generating AI Launchpack Copy for &ldquo;{ideaState.title}&rdquo;...
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* LinkedIn Post Copy */}
          <div className="clay p-5 space-y-3 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex justify-between items-center gap-2 border-b border-border/70 pb-2">
                <h3 className="text-sm font-bold flex items-center gap-2">
                  <span>💼</span> Generated LinkedIn Post
                </h3>
                <span className="clay-chip clay-sky text-xs">Ready</span>
              </div>
              <pre className="clay-inset text-xs p-4 font-sans whitespace-pre-wrap leading-relaxed">
                {launchCopy?.linkedinPost}
              </pre>
            </div>

            <button
              onClick={() => copyToClipboard(launchCopy?.linkedinPost, 'linkedin')}
              className="clay-btn clay-dark w-full py-2.5 text-xs"
            >
              {copied === 'linkedin' ? '✓ Copied to Clipboard!' : '📋 Copy LinkedIn Post'}
            </button>
          </div>

          {/* Elevator Pitch */}
          <div className="clay p-5 space-y-3 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex justify-between items-center gap-2 border-b border-border/70 pb-2">
                <h3 className="text-sm font-bold flex items-center gap-2">
                  <span>🎤</span> 30-Second Elevator Pitch
                </h3>
                <span className="clay-chip clay-sun text-xs">Pitch Deck</span>
              </div>
              <div className="clay-inset text-xs p-4 leading-relaxed italic">
                {launchCopy?.elevatorPitch}
              </div>
            </div>

            <button
              onClick={() => copyToClipboard(launchCopy?.elevatorPitch, 'pitch')}
              className="clay-btn clay-dark w-full py-2.5 text-xs"
            >
              {copied === 'pitch' ? '✓ Copied to Clipboard!' : '📋 Copy Elevator Pitch'}
            </button>
          </div>
        </div>
      )}

      <div className="clay flex flex-wrap justify-between gap-3 p-4">
        <button onClick={onPrev} className="clay-btn clay-plain px-4 py-2.5 text-xs">
          ← Back
        </button>
        <button onClick={onNext} className="clay-btn clay-dark px-6 py-2.5 text-xs">
          Proceed to VC Pitch Portal →
        </button>
      </div>
    </div>
  );
}
