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

  const handleAskAI = (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiQuestion.trim()) return;
    setIsAsking(true);
    setTimeout(() => {
      setIsAsking(false);
      setAiAnswer(
        `Based on STEP IIT Kharagpur incubation guidelines and Indian corporate law: For student startups using campus lab infrastructure, IP assignment must be filed with the Dean of R&D before commercial incorporation. STEP holds a standard 3% non-dilutive equity cap until Series A.`
      );
    }, 1000);
  };

  return (
    <div className="p-6 rounded-2xl bg-white border border-stone-200/90 shadow-sm space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-stone-900 flex items-center gap-2">
            <span>⚖️</span> STEP Legal Vault & Startup Compliance Checklist
          </h2>
          <p className="text-xs text-stone-500">
            Essential legal agreements, IP assignment guidelines, and compliance documentation for campus founders.
          </p>
        </div>
        <span className="text-xs px-3 py-1 rounded-full bg-stone-100 text-stone-700 border border-stone-300 font-semibold self-start sm:self-auto">
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
                className={`p-4 rounded-xl border transition flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                  isDone ? 'bg-emerald-50/70 border-emerald-300' : 'bg-stone-50/80 border-stone-200'
                }`}
              >
                <div className="flex items-start gap-3">
                  <button
                    onClick={() => toggleChecklist(item.id)}
                    className={`mt-0.5 w-5 h-5 rounded flex items-center justify-center text-xs font-bold transition ${
                      isDone ? 'bg-emerald-700 text-white' : 'bg-white border border-stone-300 text-stone-400 hover:bg-stone-100'
                    }`}
                  >
                    {isDone ? '✓' : ''}
                  </button>

                  <div>
                    <h4 className={`text-xs font-bold ${isDone ? 'text-emerald-900 line-through' : 'text-stone-900'}`}>
                      {item.title}
                    </h4>
                    <p className="text-[11px] text-stone-600 mt-0.5 font-medium">{item.desc}</p>
                    <span className="inline-block text-[10px] text-stone-800 font-mono mt-1 font-semibold">
                      📄 Template: {item.templateName}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => alert(`Downloading template: ${item.templateName}`)}
                  className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-white hover:bg-stone-100 text-stone-800 border border-stone-300 transition self-start sm:self-center shrink-0 shadow-2xs"
                >
                  📥 Download PDF
                </button>
              </div>
            );
          })}
        </div>

        {/* Right Column: AI Compliance & Legal Copilot */}
        <div className="p-5 rounded-xl bg-stone-50 border border-stone-200 space-y-4">
          <h3 className="text-xs font-bold uppercase text-stone-700 flex items-center gap-1.5">
            <span>🤖</span> AI Legal & Compliance Copilot
          </h3>
          <p className="text-[11px] text-stone-500 font-medium">Ask questions about IP ownership, founder vesting, or STEP incubation policies.</p>

          <form onSubmit={handleAskAI} className="space-y-3">
            <input
              type="text"
              placeholder="e.g. How does IP ownership work for lab projects?"
              value={aiQuestion}
              onChange={(e) => setAiQuestion(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-white border border-stone-300 text-xs text-stone-900 focus:outline-none focus:border-stone-800"
            />
            <button
              type="submit"
              disabled={isAsking}
              className="w-full py-2 rounded-lg bg-stone-900 hover:bg-stone-800 text-stone-50 font-bold text-xs shadow-xs transition"
            >
              {isAsking ? 'Thinking...' : 'Ask AI Copilot'}
            </button>
          </form>

          {aiAnswer && (
            <div className="p-3 rounded-lg bg-white border border-stone-300 text-xs text-stone-800 leading-relaxed font-medium">
              {aiAnswer}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
