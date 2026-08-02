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
      <div className="clay p-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold">Stage 2: Faculty &amp; Market Validation</h2>
          <p className="text-xs text-muted-foreground">
            Connect your startup idea with IIT Kharagpur faculty labs and alumni mentors.
          </p>
        </div>
        <div className="clay-inset text-xs font-semibold text-muted-foreground px-3.5 py-2.5">
          Selected: <strong className="text-foreground">{ideaState.selectedFaculty.length} Faculty</strong> • <strong className="text-foreground">{ideaState.selectedAlumni.length} Alumni</strong>
        </div>
      </div>

      {dispatchSuccess && (
        <div className="clay clay-mint p-4 text-xs font-semibold flex items-center justify-between gap-3">
          <span>🎉 {dispatchSuccess}</span>
          <button onClick={() => setDispatchSuccess(null)} className="font-bold opacity-70 hover:opacity-100">✕ Close</button>
        </div>
      )}

      {loading ? (
        <div className="clay-inset p-12 text-center text-muted-foreground text-xs font-semibold animate-pulse">
          Indexing IIT Kharagpur Faculty Directory &amp; Research Labs...
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* IIT KGP Faculty List */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold flex items-center gap-2">
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
                    className={`clay clay-hover p-4 cursor-pointer ${isSelected ? 'clay-dark' : 'clay-plain'}`}
                  >
                    <div className="flex justify-between items-start gap-2">
                      <div>
                        <h4 className="text-sm font-bold">{fac.name}</h4>
                        <p className="text-[13px] opacity-70">
                          {fac.department} • <em>{fac.labName}</em>
                        </p>
                      </div>
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full shrink-0 ${
                        isSelected ? 'bg-white/15' : 'bg-black/6'
                      }`}>
                        {isSelected ? '✓ SELECTED' : '+ ADD'}
                      </span>
                    </div>

                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {areas.map((a: string) => (
                        <span key={a} className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${
                          isSelected ? 'bg-white/12' : 'bg-black/6'
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
            <h3 className="text-sm font-bold flex items-center gap-2">
              <span>🎓</span> IIT KGP Alumni Mentors ({alumni.length})
            </h3>

            <div className="space-y-3">
              {alumni.map((alum) => {
                const isSelected = ideaState.selectedAlumni.includes(alum.name);
                return (
                  <div
                    key={alum.id}
                    onClick={() => toggleAlumniSelect(alum.name)}
                    className={`clay clay-hover p-4 cursor-pointer ${isSelected ? 'clay-dark' : 'clay-plain'}`}
                  >
                    <div className="flex justify-between items-start gap-2">
                      <div>
                        <h4 className="text-sm font-bold">{alum.name}</h4>
                        <p className="text-[13px] opacity-70">
                          {alum.role} at <strong>{alum.company}</strong> ({alum.batch})
                        </p>
                      </div>
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full shrink-0 ${
                        isSelected ? 'bg-white/15' : 'bg-black/6'
                      }`}>
                        {isSelected ? '✓ SELECTED' : '+ ADD'}
                      </span>
                    </div>
                    <div className="mt-2 text-xs font-semibold opacity-70">
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
      <div className="clay flex flex-wrap items-center justify-between gap-3 p-4">
        <button
          onClick={handleDispatchBriefs}
          disabled={dispatching}
          className="clay-btn clay-sun px-5 py-2.5 text-xs"
        >
          {dispatching ? 'Dispatching Research Briefs...' : '✉️ Dispatch Automated Research Briefs'}
        </button>

        <div className="flex gap-2.5">
          <button onClick={onPrev} className="clay-btn clay-plain px-4 py-2.5 text-xs">
            ← Back
          </button>
          <button onClick={onNext} className="clay-btn clay-dark px-6 py-2.5 text-xs">
            Proceed to Surds BI →
          </button>
        </div>
      </div>
    </div>
  );
}
