'use client';

import React, { useState, useEffect } from 'react';

type SearchResultItem = {
  type: 'faculty' | 'alumni' | 'profile' | 'problem' | 'startup' | 'policy';
  id: string;
  title: string;
  subtitle: string;
  description: string;
  tags: string[];
  relevanceScore: number;
  href?: string;
  presentedAt?: string;
};

type Props = {
  isOpen: boolean;
  onClose: () => void;
};

const STATES = [
  { id: 'all', name: '🌐 All States & Central' },
  { id: 'iitkgp', name: '🔬 IIT Kharagpur (65 Academic R&D Units & Faculty)' },
  { id: 'Central', name: '🇮🇳 Central (DPIIT / DST / MeitY / ISTI)' },
  { id: 'Defence', name: '🛡️ Ministry of Defence (iDEX)' },
  { id: 'Gujarat', name: '🦁 Gujarat (Startup Gujarat)' },
  { id: 'Uttar Pradesh', name: '🟢 Uttar Pradesh (StartInUP)' },
  { id: 'West Bengal', name: '🏛️ West Bengal (STEP KGP)' },
  { id: 'Karnataka', name: '🏙️ Karnataka (Elevate)' },
  { id: 'Kerala', name: '🌴 Kerala (KSUM)' },
  { id: 'Maharashtra', name: '🌊 Maharashtra (MSINS)' },
  { id: 'Telangana', name: '🦚 Telangana (T-Hub)' },
  { id: 'Rajasthan', name: '🏰 Rajasthan (iStart)' },
  { id: 'Tamil Nadu', name: '🌊 Tamil Nadu (StartupTN)' },
  { id: 'Punjab', name: '🌾 Punjab (Startup Punjab)' },
  { id: 'Odisha', name: '🌄 Odisha (Startup Odisha)' },
  { id: 'Bihar', name: '🚩 Bihar (Startup Bihar)' },
  { id: 'Assam', name: '🏞️ Assam (The Nest)' },
  { id: 'Goa', name: '🏖️ Goa (Startup Goa)' },
  { id: 'Haryana', name: '🏭 Haryana (Startup Haryana)' },
  { id: 'Madhya Pradesh', name: '🐅 Madhya Pradesh' },
  { id: 'Uttarakhand', name: '🏔️ Uttarakhand' },
  { id: 'Delhi NCR', name: '🏛️ Delhi NCR' },
];

type FacultyItem = {
  id: string;
  name: string;
  department: string;
  labName: string;
  email: string;
  officialUrl: string;
  researchAreas: string[];
  lastScrapedAt: string;
  mentorshipAvailable: boolean;
};

export default function EcosystemSearchModal({ isOpen, onClose }: Props) {
  const [query, setQuery] = useState('');
  const [selectedState, setSelectedState] = useState<string>('all');
  const [results, setResults] = useState<SearchResultItem[]>([]);
  const [directForms, setDirectForms] = useState<any[]>([]);
  const [faculties, setFaculties] = useState<FacultyItem[]>([]);
  const [deptList, setDeptList] = useState<{code: string; name: string}[]>([]);
  const [selectedDept, setSelectedDept] = useState<string>('all');
  const [totalMatches, setTotalMatches] = useState(0);
  const [loading, setLoading] = useState(false);

  // Fetch IIT KGP faculties when iitkgp tab is active
  useEffect(() => {
    if (selectedState !== 'iitkgp') return;
    setLoading(true);
    fetch('/api/search/iitkgp-faculties')
      .then(r => r.json())
      .then(data => {
        setFaculties(data.faculties || []);
        setDeptList(data.availableDepartments || []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [selectedState]);

  // Fetch policies & state forms for non-iitkgp tabs
  useEffect(() => {
    if (selectedState === 'iitkgp') return;
    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const stateParam = selectedState !== 'all' ? `&state=${encodeURIComponent(selectedState)}` : '';
        const [resSearch, resForms] = await Promise.all([
          fetch(`/api/search?q=${encodeURIComponent(query)}${stateParam}`),
          fetch(`/api/search/state-forms?state=${encodeURIComponent(selectedState)}`),
        ]);

        const dataSearch = await resSearch.json();
        const dataForms = await resForms.json();

        if (dataSearch.results) {
          setResults(dataSearch.results);
          setTotalMatches(dataSearch.totalMatches || dataSearch.results.length);
        }
        if (dataForms.formsAndPDFs) {
          setDirectForms(dataForms.formsAndPDFs);
        }
      } catch (err) {
        console.error('Search failed:', err);
      } finally {
        setLoading(false);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [query, selectedState]);

  // Filter faculties by search query and selected department
  const filteredFaculties = faculties.filter(f => {
    const matchesDept = selectedDept === 'all' || f.department === deptList.find(d => d.code === selectedDept)?.name;
    const matchesQuery = !query || f.name.toLowerCase().includes(query.toLowerCase())
      || f.department.toLowerCase().includes(query.toLowerCase())
      || f.labName.toLowerCase().includes(query.toLowerCase())
      || f.researchAreas.some(a => a.toLowerCase().includes(query.toLowerCase()));
    return matchesDept && matchesQuery;
  });

  // Group faculties by department
  const groupedByDept: Record<string, FacultyItem[]> = {};
  filteredFaculties.forEach(f => {
    if (!groupedByDept[f.department]) groupedByDept[f.department] = [];
    groupedByDept[f.department].push(f);
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-start justify-center pt-12 p-4">
      <div className="bg-white rounded-xl border border-stone-200 shadow-2xl max-w-3xl w-full flex flex-col max-h-[90vh] overflow-hidden">
        {/* Top Header & Search Input */}
        <div className="p-4 border-b border-stone-200 space-y-3 bg-stone-50/80 sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <span className="text-lg">🔍</span>
            <input
              autoFocus
              type="text"
              placeholder="Search policies, SOPs, faculty, alumni, student skills..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full text-sm font-medium focus:outline-none text-stone-900 placeholder:text-stone-400 bg-transparent"
            />
            {totalMatches > 0 && (
              <span className="text-[10px] font-bold px-2 py-1 rounded bg-stone-200 text-stone-700 shrink-0">
                {totalMatches} Results
              </span>
            )}
            <button
              onClick={onClose}
              className="text-stone-400 hover:text-stone-700 font-bold text-xs px-2.5 py-1 bg-stone-200 rounded"
            >
              ESC
            </button>
          </div>

          {/* State-Specific Navigation Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 border-b border-stone-200 no-scrollbar">
            {STATES.map((st) => {
              const isActive = selectedState === st.id;
              return (
                <button
                  key={st.id}
                  onClick={() => setSelectedState(st.id)}
                  className={`text-xs font-bold px-3.5 py-1.5 rounded-t-lg transition-all shrink-0 border-b-2 ${
                    isActive
                      ? 'bg-stone-900 text-amber-300 border-amber-400 shadow-xs'
                      : 'bg-white text-stone-600 border-transparent hover:bg-stone-100 hover:text-stone-900'
                  }`}
                >
                  {st.name}
                </button>
              );
            })}
          </div>
        </div>

        {/* State-Specific Info Banner (When a specific State Tab is selected) */}
        {selectedState !== 'all' && (
          <div className="px-4 py-2.5 bg-gradient-to-r from-stone-900 to-slate-900 text-stone-100 text-xs flex items-center justify-between border-b border-stone-800 shrink-0">
            <div className="flex items-center gap-2">
              <span className="text-amber-400 font-bold">🏛️ {selectedState} Startup Ecosystem Hub</span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-amber-400/20 text-amber-300 font-bold border border-amber-400/30">
                OFFICIAL PORTAL &amp; SCHEMES
              </span>
            </div>
            <div className="text-[11px] text-stone-400">
              Direct Forms: <strong className="text-white">{directForms.length}</strong> | Synced Schemes: <strong className="text-amber-300">{results.filter(r => r.type === 'policy').length}</strong>
            </div>
          </div>
        )}

        {/* Scrollable Results List for Long Databases */}
        <div className="p-4 overflow-y-auto space-y-3 flex-1 text-xs font-medium max-h-[70vh] divide-y-0 scroll-smooth">
          {loading && (
            <div className="text-center py-10 text-stone-400 animate-pulse space-y-2">
              <div className="w-6 h-6 border-2 border-stone-900 border-t-transparent rounded-full animate-spin mx-auto" />
              <div>{selectedState === 'iitkgp' ? 'Loading IIT Kharagpur Faculty Database...' : 'Fetching & matching database entries...'}</div>
            </div>
          )}

          {/* ===== IIT KHARAGPUR FACULTY DATABASE TAB ===== */}
          {selectedState === 'iitkgp' && !loading && (
            <div className="space-y-4">
              {/* Department Filter Bar */}
              <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
                <span className="text-[10px] font-bold text-stone-500 uppercase tracking-wider shrink-0">Department:</span>
                <button
                  onClick={() => setSelectedDept('all')}
                  className={`text-[10px] font-bold px-2.5 py-1 rounded-md transition shrink-0 ${selectedDept === 'all' ? 'bg-stone-900 text-amber-300' : 'bg-stone-100 text-stone-600 hover:bg-stone-200'}`}
                >
                  All ({faculties.length})
                </button>
                {deptList.map(d => {
                  const count = faculties.filter(f => f.department === d.name).length;
                  if (count === 0) return null;
                  return (
                    <button
                      key={d.code}
                      onClick={() => setSelectedDept(d.code)}
                      className={`text-[10px] font-bold px-2.5 py-1 rounded-md transition shrink-0 ${selectedDept === d.code ? 'bg-stone-900 text-amber-300' : 'bg-stone-100 text-stone-600 hover:bg-stone-200'}`}
                    >
                      {d.code} ({count})
                    </button>
                  );
                })}
              </div>

              {/* Stats Bar */}
              <div className="flex items-center justify-between p-3 bg-stone-900 rounded-xl text-white">
                <div className="flex items-center gap-3">
                  <span className="text-amber-400 font-bold">🔬 IIT Kharagpur Faculty & R&D Database</span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-amber-400/20 text-amber-300 border border-amber-400/30 font-bold">
                    {filteredFaculties.length} FACULTY MEMBERS
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-400/20 text-emerald-300 border border-emerald-400/30 font-bold">
                    {Object.keys(groupedByDept).length} DEPARTMENTS
                  </span>
                </div>
                <span className="text-[10px] text-stone-400">
                  65 Academic Units Scraped
                </span>
              </div>

              {/* Faculty Cards by Department */}
              {Object.entries(groupedByDept).map(([dept, members]) => (
                <div key={dept} className="space-y-2">
                  <div className="flex items-center gap-2 pt-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                    <h4 className="text-xs font-black text-stone-900 uppercase tracking-wide">{dept}</h4>
                    <span className="text-[10px] font-bold text-stone-500 bg-stone-200 px-1.5 py-0.5 rounded">{members.length}</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {members.map(f => (
                      <a
                        key={f.id}
                        href={f.officialUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-3 bg-white hover:bg-stone-50 rounded-xl border border-stone-200 hover:border-amber-400 transition group shadow-2xs"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <h5 className="font-bold text-stone-900 text-xs group-hover:text-amber-800 truncate">{f.name}</h5>
                            <p className="text-[10px] text-stone-500 font-semibold truncate">{f.labName}</p>
                          </div>
                          <span className="text-amber-600 shrink-0 text-[10px] font-bold group-hover:translate-x-0.5 transition">↗</span>
                        </div>
                        <div className="flex flex-wrap gap-1 mt-1.5">
                          {f.researchAreas.slice(0, 3).map((area, i) => (
                            <span key={i} className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-stone-100 text-stone-700 border border-stone-200">
                              {area}
                            </span>
                          ))}
                          {f.researchAreas.length > 3 && (
                            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-amber-100 text-amber-800">
                              +{f.researchAreas.length - 3} more
                            </span>
                          )}
                        </div>
                        <div className="flex items-center justify-between mt-2 pt-1.5 border-t border-stone-100">
                          <span className="text-[9px] text-stone-400 truncate">{f.email}</span>
                          {f.mentorshipAvailable && (
                            <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">✓ Mentorship</span>
                          )}
                        </div>
                      </a>
                    ))}
                  </div>
                </div>
              ))}

              {filteredFaculties.length === 0 && (
                <div className="text-center py-10 text-stone-500">
                  <p>No faculty members match &quot;{query}&quot;{selectedDept !== 'all' ? ` in department ${selectedDept}` : ''}.</p>
                  <p className="text-[11px] text-stone-400 mt-1">Try a broader search or select &quot;All&quot; departments.</p>
                </div>
              )}
            </div>
          )}

          {/* ===== STATE POLICIES & FORMS (non-iitkgp tabs) ===== */}

          {/* Direct State Application Forms & Policy PDFs */}
          {selectedState !== 'iitkgp' && !loading && directForms.length > 0 && (
            <div className="mb-4 space-y-2 p-3 bg-amber-500/10 rounded-xl border border-amber-500/30">
              <div className="flex items-center justify-between">
                <span className="font-bold text-amber-900 text-[11px] uppercase tracking-wider flex items-center gap-1.5">
                  <span>📑 Direct Official Application Forms &amp; Policy PDFs</span>
                  <span className="px-1.5 py-0.5 rounded bg-amber-200 text-amber-900 text-[10px]">
                    {directForms.length} DIRECT LINKS
                  </span>
                </span>
                <span className="text-[10px] text-stone-500">Redirects directly to official document / form</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                {directForms.map((df) => (
                  <a
                    key={df.id}
                    href={df.directUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2.5 bg-white hover:bg-amber-50 rounded-lg border border-amber-200 hover:border-amber-400 transition flex items-center justify-between group shadow-2xs"
                  >
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[9px] font-bold uppercase px-1.5 py-0.2 rounded bg-amber-100 text-amber-800 border border-amber-300">
                          {df.category}
                        </span>
                        <span className="text-[10px] font-semibold text-stone-500">[{df.state}]</span>
                      </div>
                      <h5 className="font-bold text-stone-900 text-xs mt-1 group-hover:text-amber-900 line-clamp-1">
                        {df.title}
                      </h5>
                      <p className="text-[10px] text-stone-600 line-clamp-1 mt-0.5">{df.description}</p>
                    </div>
                    <span className="text-amber-700 font-bold text-xs shrink-0 ml-2 group-hover:translate-x-0.5 transition">
                      {df.isDirectDownload ? "📄 PDF ↗" : "📝 Form ↗"}
                    </span>
                  </a>
                ))}
              </div>
            </div>
          )}

          {selectedState !== 'iitkgp' && !loading && results.length === 0 && directForms.length === 0 && (
            <div className="text-center py-12 text-stone-500 space-y-1">
              <p>No matching policies, SOPs, or entities found for &quot;{query}&quot; in {selectedState}.</p>
              <p className="text-[11px] text-stone-400">
                Try selecting <strong className="text-stone-700">&quot;Uttar Pradesh (StartInUP)&quot;</strong> or <strong className="text-stone-700">&quot;Gujarat (Policies & SOPs)&quot;</strong>.
              </p>
            </div>
          )}

          {selectedState !== 'iitkgp' && !loading &&
            results.map((item) => {
              const isGujaratSop = item.subtitle.includes('GUJARAT SOP') || item.title.includes('SOP');
              const isGujaratScheme = item.subtitle.includes('GUJARAT SCHEME') || item.tags.includes('Gujarat Govt');
              const isUpScheme = item.tags.includes('StartInUP') || item.tags.includes('Uttar Pradesh');

              return (
                <div
                  key={`${item.type}-${item.id}`}
                  className={`p-4 rounded-xl border transition space-y-2 ${
                    isGujaratSop
                      ? 'bg-amber-50/80 border-amber-300 hover:border-amber-400'
                      : isUpScheme
                      ? 'bg-emerald-50/60 border-emerald-300 hover:border-emerald-400'
                      : isGujaratScheme
                      ? 'bg-amber-50/40 border-amber-200 hover:border-amber-300'
                      : 'bg-stone-50/60 border-stone-200 hover:border-stone-400'
                  }`}
                >
                  <div className="flex justify-between items-start gap-2">
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[9px] font-extrabold uppercase px-2 py-0.5 rounded ${
                          isGujaratSop
                            ? 'bg-amber-900 text-amber-50'
                            : isUpScheme
                            ? 'bg-emerald-800 text-emerald-50'
                            : item.type === 'policy'
                            ? 'bg-stone-900 text-stone-50'
                            : 'bg-stone-200 text-stone-800'
                        }`}
                      >
                        {isGujaratSop ? 'GUJARAT SOP' : isUpScheme ? 'STARTINUP UP' : item.type}
                      </span>
                      <h4 className="text-xs font-black text-stone-900">{item.title}</h4>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {item.presentedAt && (
                        <span className="text-[10px] font-semibold text-stone-500 bg-stone-200/80 px-2 py-0.5 rounded">
                          📅 Presented: {item.presentedAt}
                        </span>
                      )}
                      <span className="text-[10px] font-bold text-stone-500">
                        Score: {item.relevanceScore}%
                      </span>
                    </div>
                  </div>

                  <p className="text-[11px] font-semibold text-stone-700">{item.subtitle}</p>
                  <p className="text-[11px] text-stone-600 leading-relaxed">{item.description}</p>

                  <div className="flex justify-between items-center pt-2 border-t border-stone-200/60 mt-2">
                    <div className="flex flex-wrap gap-1">
                      {item.tags.map((tag, idx) => (
                        <span
                          key={idx}
                          className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-stone-200/70 text-stone-700"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>

                    {item.href && (
                      <a
                        href={item.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[10px] font-black text-stone-900 hover:underline flex items-center gap-1 shrink-0"
                      >
                        {isUpScheme ? 'View StartInUP Official Portal ↗' : 'View Details ↗'}
                      </a>
                    )}
                  </div>
                </div>
              );
            })}
        </div>
      </div>
    </div>
  );
}
