'use client';

import React, { useState, useEffect } from 'react';
import { StartupIdeaState } from '@/app/(public)/playground/page';

type Props = {
  ideaState: StartupIdeaState;
  setIdeaState: React.Dispatch<React.SetStateAction<StartupIdeaState>>;
  onNext: () => void;
  onPrev: () => void;
};

export default function ValidationDirectory({ ideaState, setIdeaState, onNext, onPrev }: Props) {
  const [faculty, setFaculty] = useState<any[]>([]);
  const [alumni, setAlumni] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dispatching, setDispatching] = useState(false);
  const [dispatchSuccess, setDispatchSuccess] = useState<string | null>(null);

  const fetchDirectory = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/playground/faculty');
      const data = await res.json();
      if (data.success) {
        setFaculty(data.data.faculty);
        setAlumni(data.data.alumni);
      }
    } catch (err) {
      console.error('Failed to fetch faculty directory:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDirectory();
  }, []);

  const toggleFacultySelect = (name: string) => {
    setIdeaState((prev) => {
      const exists = prev.selectedFaculty.includes(name);
      return {
        ...prev,
        selectedFaculty: exists
          ? prev.selectedFaculty.filter((f) => f !== name)
          : [...prev.selectedFaculty, name],
      };
    });
  };

  const toggleAlumniSelect = (name: string) => {
    setIdeaState((prev) => {
      const exists = prev.selectedAlumni.includes(name);
      return {
        ...prev,
        selectedAlumni: exists
          ? prev.selectedAlumni.filter((a) => a !== name)
          : [...prev.selectedAlumni, name],
      };
    });
  };

  const handleDispatchBriefs = async () => {
    if (ideaState.selectedFaculty.length === 0 && ideaState.selectedAlumni.length === 0) {
      alert('Please select at least one faculty member or alumni mentor to dispatch briefs to.');
      return;
    }

    setDispatching(true);
    setDispatchSuccess(null);

    const recipients = [
      ...faculty
        .filter((f) => ideaState.selectedFaculty.includes(f.name))
        .map((f) => ({ name: f.name, email: f.email, department: f.department })),
      ...alumni
        .filter((a) => ideaState.selectedAlumni.includes(a.name))
        .map((a) => ({ name: a.name, email: a.email, domain: a.domain })),
    ];

    try {
      const res = await fetch('/api/playground/dispatch-brief', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipients,
          ideaTitle: ideaState.title,
          problemStatement: ideaState.problemStatement,
          proposedSolution: ideaState.proposedSolution,
          senderName: 'IIT KGP Student Founder',
        }),
      });

      const data = await res.json();
      if (data.success) {
        setDispatchSuccess(data.message);
      }
    } catch (err) {
      alert('Dispatch failed! Please try again.');
    } finally {
      setDispatching(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="p-4 rounded-2xl bg-white border border-stone-200 shadow-xs flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-stone-900">Stage 2: Faculty & Market Validation</h2>
          <p className="text-xs text-stone-500">
            Connect your startup idea with IIT Kharagpur faculty labs and alumni mentors.
          </p>
        </div>
        <div className="text-xs font-semibold text-stone-600 bg-stone-100 px-3 py-1.5 rounded-lg border border-stone-200">
          Selected: <strong className="text-stone-900">{ideaState.selectedFaculty.length} Faculty</strong> • <strong className="text-stone-900">{ideaState.selectedAlumni.length} Alumni</strong>
        </div>
      </div>

      {dispatchSuccess && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs font-bold flex items-center justify-between">
          <span>🎉 {dispatchSuccess}</span>
          <button onClick={() => setDispatchSuccess(null)} className="text-emerald-700 hover:text-emerald-950 font-bold">✕ Close</button>
        </div>
      )}

      {loading ? (
        <div className="p-12 text-center text-stone-500 text-xs font-semibold animate-pulse">
          Indexing IIT Kharagpur Faculty Directory & Research Labs...
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* IIT KGP Faculty List */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-stone-900 flex items-center gap-2">
              <span>🔬</span> Scraped IIT KGP Faculty Mentors ({faculty.length})
            </h3>

            <div className="space-y-3">
              {faculty.map((fac) => {
                const isSelected = ideaState.selectedFaculty.includes(fac.name);
                let areas: string[] = [];
                try {
                  areas = typeof fac.researchAreas === 'string' ? JSON.parse(fac.researchAreas) : fac.researchAreas;
                } catch (e) {
                  areas = [];
                }

                return (
                  <div
                    key={fac.id}
                    onClick={() => toggleFacultySelect(fac.name)}
                    className={`p-4 rounded-xl border cursor-pointer transition ${
                      isSelected
                        ? 'bg-stone-900 text-stone-50 border-stone-900 shadow-md'
                        : 'bg-white border-stone-200 text-stone-800 hover:border-stone-400'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="text-xs font-bold">{fac.name}</h4>
                        <p className={`text-[11px] ${isSelected ? 'text-stone-300' : 'text-stone-500'}`}>
                          {fac.department} • <em>{fac.labName}</em>
                        </p>
                      </div>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        isSelected ? 'bg-amber-400 text-stone-950' : 'bg-stone-100 text-stone-600'
                      }`}>
                        {isSelected ? '✓ SELECTED' : '+ ADD'}
                      </span>
                    </div>

                    <div className="mt-3 flex flex-wrap gap-1">
                      {areas.map((a: string) => (
                        <span key={a} className={`text-[9px] px-2 py-0.5 rounded ${
                          isSelected ? 'bg-stone-800 text-stone-300' : 'bg-stone-100 text-stone-600'
                        }`}>
                          {a}
                        </span>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Alumni Mentor List */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-stone-900 flex items-center gap-2">
              <span>🎓</span> IIT KGP Alumni Mentors ({alumni.length})
            </h3>

            <div className="space-y-3">
              {alumni.map((alum) => {
                const isSelected = ideaState.selectedAlumni.includes(alum.name);
                return (
                  <div
                    key={alum.id}
                    onClick={() => toggleAlumniSelect(alum.name)}
                    className={`p-4 rounded-xl border cursor-pointer transition ${
                      isSelected
                        ? 'bg-stone-900 text-stone-50 border-stone-900 shadow-md'
                        : 'bg-white border-stone-200 text-stone-800 hover:border-stone-400'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="text-xs font-bold">{alum.name}</h4>
                        <p className={`text-[11px] ${isSelected ? 'text-stone-300' : 'text-stone-500'}`}>
                          {alum.role} at <strong>{alum.company}</strong> ({alum.batch})
                        </p>
                      </div>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        isSelected ? 'bg-amber-400 text-stone-950' : 'bg-stone-100 text-stone-600'
                      }`}>
                        {isSelected ? '✓ SELECTED' : '+ ADD'}
                      </span>
                    </div>
                    <div className="mt-2 text-[10px] font-semibold opacity-80">
                      Domain: {alum.domain} • {alum.location}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Action Controls */}
      <div className="flex items-center justify-between p-4 rounded-2xl bg-white border border-stone-200 shadow-xs">
        <button
          onClick={handleDispatchBriefs}
          disabled={dispatching}
          className="px-5 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-500 text-stone-950 font-bold text-xs shadow-xs transition disabled:opacity-50"
        >
          {dispatching ? 'Dispatching Research Briefs...' : '✉️ Dispatch Automated Research Briefs'}
        </button>

        <div className="flex gap-3">
          <button onClick={onPrev} className="px-4 py-2 rounded-lg bg-stone-100 text-stone-700 text-xs font-semibold">
            ← Back
          </button>
          <button onClick={onNext} className="px-6 py-2 rounded-lg bg-stone-900 text-stone-50 text-xs font-bold">
            Proceed to Surds BI →
          </button>
        </div>
      </div>
    </div>
  );
}
