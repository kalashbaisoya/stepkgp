'use client';

import React, { useState } from 'react';
import { StartupIdeaState } from '@/app/(public)/playground/page';

type Props = {
  ideaState: StartupIdeaState;
};

const LEGAL_CHECKLIST = [
  {
    id: 'l-1',
    title: 'Founder Vesting & Equity Agreement',
    desc: '4-year vesting schedule with 1-year cliff between student co-founders.',
    status: 'Required',
    templateName: 'STEP_Founder_Vesting_Agreement_Template.pdf',
  },
  {
    id: 'l-2',
    title: 'IIT Kharagpur IP Assignment & Incubation Agreement',
    desc: 'Protects student IP developed using campus facilities & defines STEP equity share (typically 3-5%).',
    status: 'Required for STEP Incubation',
    templateName: 'IITKGP_IP_Assignment_Form.pdf',
  },
  {
    id: 'l-3',
    title: 'Mutual Non-Disclosure Agreement (NDA)',
    desc: 'Standard mutual NDA for discussions with external vendors and design partners.',
    status: 'Recommended',
    templateName: 'Standard_Mutual_NDA_STEP.pdf',
  },
  {
    id: 'l-4',
    title: 'Private Limited Company Incorporation (DPIIT Recognized)',
    desc: 'Company registration under Ministry of Corporate Affairs with Startup India recognition.',
    status: 'Incorporation Stage',
    templateName: 'DPIIT_Registration_Guide.pdf',
  },
];

export default function LegalVault({ ideaState }: Props) {
  const [completedItems, setCompletedItems] = useState<string[]>(['l-3']);
  const [aiQuestion, setAiQuestion] = useState('');
  const [aiAnswer, setAiAnswer] = useState<string | null>(null);
  const [isAsking, setIsAsking] = useState(false);

  const toggleChecklist = (id: string) => {
    if (completedItems.includes(id)) {
      setCompletedItems(completedItems.filter((item) => item !== id));
    } else {
      setCompletedItems([...completedItems, id]);
    }
  };

  const handleAskAI = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiQuestion.trim()) return;
    setIsAsking(true);

    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(aiQuestion)}`);
      const data = await res.json();
      if (data.results && data.results.length > 0) {
        const top = data.results[0];
        setAiAnswer(`Relevant STEP guideline found: "${top.title}". ${top.description}`);
      } else {
        setAiAnswer(
          `For ${ideaState.category} startups at IIT Kharagpur: IP assignment must be cleared with Dean R&D prior to external incorporation. STEP holds a standard 3% equity cap until Series A funding.`
        );
      }
    } catch (err) {
      setAiAnswer('IP assignment must be cleared with Dean R&D prior to external incorporation.');
    } finally {
      setIsAsking(false);
    }
  };

  return (
    <div className="clay p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-extrabold flex items-center gap-2">
            <span>⚖️</span> STEP Legal Vault &amp; Startup Compliance Checklist
          </h2>
          <p className="text-xs text-muted-foreground font-medium">
            Essential legal agreements, IP assignment guidelines, and compliance documentation for campus founders.
          </p>
        </div>
        <span className="clay-chip clay-soft text-xs self-start sm:self-auto">
          Compliance Progress: {completedItems.length}/{LEGAL_CHECKLIST.length} Done
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Interactive Legal Checklist & Templates */}
        <div className="lg:col-span-2 space-y-3">
          {LEGAL_CHECKLIST.map((item) => {
            const isDone = completedItems.includes(item.id);
            return (
              <div
                key={item.id}
                className={`clay p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                  isDone ? 'clay-mint' : 'clay-plain'
                }`}
              >
                <div className="flex items-start gap-3">
                  <button
                    onClick={() => toggleChecklist(item.id)}
                    aria-label={isDone ? `Mark ${item.title} incomplete` : `Mark ${item.title} complete`}
                    className={`clay-btn mt-0.5 w-6 h-6 shrink-0 rounded-lg text-xs ${
                      isDone ? 'clay-primary' : 'clay-plain'
                    }`}
                  >
                    {isDone ? '✓' : ''}
                  </button>

                  <div>
                    <h4 className={`text-xs font-bold ${isDone ? 'line-through' : ''}`}>
                      {item.title}
                    </h4>
                    <p className="text-[13px] opacity-70 mt-0.5 font-medium">{item.desc}</p>
                    <span className="inline-block text-xs font-mono mt-1.5 opacity-80">
                      📄 Template: {item.templateName}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => alert(`Downloading template: ${item.templateName}`)}
                  className="clay-btn clay-plain text-xs px-3.5 py-2 self-start sm:self-center shrink-0"
                >
                  📥 Download PDF
                </button>
              </div>
            );
          })}
        </div>

        {/* Right Column: AI Compliance & Legal Copilot */}
        <div className="clay clay-well p-5 space-y-4 self-start">
          <h3 className="text-sm font-bold flex items-center gap-1.5">
            <span>🛡️</span> Legal &amp; Compliance Search
          </h3>
          <p className="text-[13px] text-muted-foreground font-medium">Ask questions about IP ownership, founder vesting, or STEP incubation policies.</p>

          <form onSubmit={handleAskAI} className="space-y-3">
            <input
              type="text"
              placeholder="e.g. How does IP ownership work for lab projects?"
              value={aiQuestion}
              onChange={(e) => setAiQuestion(e.target.value)}
              className="clay-field text-xs"
            />
            <button
              type="submit"
              disabled={isAsking}
              className="clay-btn clay-dark w-full py-2.5 text-xs"
            >
              {isAsking ? 'Searching...' : 'Search Policy'}
            </button>
          </form>

          {aiAnswer && (
            <div className="clay-sm clay-plain p-3.5 text-xs leading-relaxed font-medium">
              {aiAnswer}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
