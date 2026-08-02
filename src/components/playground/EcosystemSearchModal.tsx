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

/** Badge reflects what the link actually opens, so "PDF" only ever means a download. */
function linkBadge(form: any) {
  if (form.isDirectDownload || form.documentType === 'PDF') return '📄 PDF ↗';
  if (form.documentType === 'Direct Form') return '📝 Form ↗';
  return '🔗 Open ↗';
}

/** One official form / PDF row. The state chip is hidden inside a state group. */
function FormLink({ form, showState }: { form: any; showState: boolean }) {
  return (
    <a
      href={form.directUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="clay-sm clay-plain p-3 text-left transition hover:-translate-y-0.5 flex items-center justify-between group"
    >
      <div className="min-w-0">
        <div className="flex items-center gap-1.5">
          <span className="clay-chip clay-sun text-[11px] uppercase">{form.category}</span>
          {showState && (
            <span className="text-xs font-semibold text-muted-foreground">[{form.state}]</span>
          )}
        </div>
        <h5 className="font-bold text-sm mt-1 group-hover:text-brand line-clamp-1">{form.title}</h5>
        <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">{form.description}</p>
      </div>
      <span className="text-brand font-bold text-xs shrink-0 ml-2 group-hover:translate-x-0.5 transition">
        {linkBadge(form)}
      </span>
    </a>
  );
}

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

  // On the "All States & Central" tab the form list mixes every state together,
  // so bucket it by state and give each bucket its own heading. Central sits
  // first, then states alphabetically.
  const formsByState: Record<string, any[]> = {};
  directForms.forEach((df) => {
    const key = df.state || 'Central';
    if (!formsByState[key]) formsByState[key] = [];
    formsByState[key].push(df);
  });

  const formStateOrder = Object.keys(formsByState).sort((a, b) => {
    if (a === 'Central') return -1;
    if (b === 'Central') return 1;
    return a.localeCompare(b);
  });

  const showStateGroups = selectedState === 'all' && formStateOrder.length > 1;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-start justify-center pt-12 p-4">
      <div className="clay-lg max-w-3xl w-full flex flex-col max-h-[90vh] overflow-hidden">
        {/* Top Header & Search Input */}
        <div className="p-4 border-b border-border/70 space-y-3 bg-surface-2 sticky top-0 z-10 rounded-t-[2rem]">
          <div className="flex items-center gap-3">
            <span className="text-lg">🔍</span>
            <input
              autoFocus
              type="text"
              placeholder="Search policies, SOPs, faculty, alumni, student skills..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full text-sm font-medium focus:outline-none text-foreground placeholder:text-muted-foreground bg-transparent"
            />
            {totalMatches > 0 && (
              <span className="clay-chip clay-soft text-xs shrink-0">
                {totalMatches} Results
              </span>
            )}
            <button
              onClick={onClose}
              className="clay-btn clay-plain h-8 w-8 rounded-full text-xs"
            >
              ESC
            </button>
          </div>

          {/* State-Specific Navigation Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 border-b border-border/70 no-scrollbar">
            {STATES.map((st) => {
              const isActive = selectedState === st.id;
              return (
                <button
                  key={st.id}
                  onClick={() => setSelectedState(st.id)}
                  className={`text-xs font-bold px-3.5 py-1.5 rounded-t-lg transition-all shrink-0 border-b-2 ${
                    isActive
                      ? 'clay-sm clay-dark'
                      : 'text-muted-foreground hover:text-foreground'
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
          <div className="clay clay-dark mx-4 mt-3 px-4 py-3 text-xs flex flex-wrap gap-2 items-center justify-between shrink-0">
            <div className="flex items-center gap-2">
              <span className="font-bold">🏛️ {selectedState} Startup Ecosystem Hub</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-white/15 font-semibold">
                OFFICIAL PORTAL &amp; SCHEMES
              </span>
            </div>
            <div className="text-[13px] text-muted-foreground">
              Direct Forms: <strong className="text-white">{directForms.length}</strong> | Synced Schemes: <strong>{results.filter(r => r.type === 'policy').length}</strong>
            </div>
          </div>
        )}

        {/* Scrollable Results List for Long Databases */}
        <div className="p-4 overflow-y-auto space-y-3 flex-1 text-xs font-medium max-h-[70vh] divide-y-0 scroll-smooth">
          {loading && (
            <div className="text-center py-10 text-muted-foreground animate-pulse space-y-2">
              <div className="w-6 h-6 border-2 border-brand border-t-transparent rounded-full animate-spin mx-auto" />
              <div>{selectedState === 'iitkgp' ? 'Loading IIT Kharagpur Faculty Database...' : 'Fetching & matching database entries...'}</div>
            </div>
          )}

          {/* ===== IIT KHARAGPUR FACULTY DATABASE TAB ===== */}
          {selectedState === 'iitkgp' && !loading && (
            <div className="space-y-4">
              {/* Department Filter Bar */}
              <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
                <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider shrink-0">Department:</span>
                <button
                  onClick={() => setSelectedDept('all')}
                  className={`text-xs font-semibold px-2.5 py-1.5 transition shrink-0 ${selectedDept === 'all' ? 'clay-sm clay-dark' : 'clay-sm clay-plain text-muted-foreground'}`}
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
                      className={`text-xs font-semibold px-2.5 py-1.5 transition shrink-0 ${selectedDept === d.code ? 'clay-sm clay-dark' : 'clay-sm clay-plain text-muted-foreground'}`}
                    >
                      {d.code} ({count})
                    </button>
                  );
                })}
              </div>

              {/* Stats Bar */}
              <div className="clay clay-dark flex flex-wrap gap-2 items-center justify-between p-3.5">
                <div className="flex items-center gap-3">
                  <span className="font-bold">🔬 IIT Kharagpur Faculty & R&D Database</span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-white/15 font-semibold">
                    {filteredFaculties.length} FACULTY MEMBERS
                  </span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-white/15 font-semibold">
                    {Object.keys(groupedByDept).length} DEPARTMENTS
                  </span>
                </div>
                <span className="text-xs text-muted-foreground">
                  65 Academic Units Scraped
                </span>
              </div>

              {/* Faculty Cards by Department */}
              {Object.entries(groupedByDept).map(([dept, members]) => (
                <div key={dept} className="space-y-2">
                  <div className="flex items-center gap-2 pt-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-brand" />
                    <h4 className="text-sm font-bold uppercase tracking-wide">{dept}</h4>
                    <span className="text-xs font-bold text-muted-foreground bg-black/6 px-2 py-0.5 rounded-full">{members.length}</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {members.map(f => (
                      <a
                        key={f.id}
                        href={f.officialUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="clay clay-hover clay-plain p-3.5 text-left group"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <h5 className="font-bold text-sm group-hover:text-brand truncate">{f.name}</h5>
                            <p className="text-xs text-muted-foreground font-semibold truncate">{f.labName}</p>
                          </div>
                          <span className="text-brand shrink-0 text-xs font-bold group-hover:translate-x-0.5 transition">↗</span>
                        </div>
                        <div className="flex flex-wrap gap-1 mt-1.5">
                          {f.researchAreas.slice(0, 3).map((area, i) => (
                            <span key={i} className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-black/6 text-muted-foreground">
                              {area}
                            </span>
                          ))}
                          {f.researchAreas.length > 3 && (
                            <span className="clay-chip clay-sun text-[11px]">
                              +{f.researchAreas.length - 3} more
                            </span>
                          )}
                        </div>
                        <div className="flex items-center justify-between mt-2 pt-1.5 border-t border-border/70">
                          <span className="text-[11px] text-muted-foreground truncate">{f.email}</span>
                          {f.mentorshipAvailable && (
                            <span className="clay-chip clay-mint text-[11px]">✓ Mentorship</span>
                          )}
                        </div>
                      </a>
                    ))}
                  </div>
                </div>
              ))}

              {filteredFaculties.length === 0 && (
                <div className="text-center py-10 text-muted-foreground">
                  <p>No faculty members match &quot;{query}&quot;{selectedDept !== 'all' ? ` in department ${selectedDept}` : ''}.</p>
                  <p className="text-[13px] text-muted-foreground mt-1">Try a broader search or select &quot;All&quot; departments.</p>
                </div>
              )}
            </div>
          )}

          {/* ===== STATE POLICIES & FORMS (non-iitkgp tabs) ===== */}

          {/* Direct State Application Forms & Policy PDFs */}
          {selectedState !== 'iitkgp' && !loading && directForms.length > 0 && (
            <div className="mb-4 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="font-bold text-[13px] uppercase tracking-wider flex items-center gap-1.5">
                  <span>📑 Direct Official Application Forms &amp; Policy PDFs</span>
                  <span className="clay-chip clay-sun text-xs">
                    {directForms.length} DIRECT LINKS
                  </span>
                </span>
                <span className="text-xs text-muted-foreground">Redirects directly to official document / form</span>
              </div>

              {showStateGroups ? (
                <>
                  {/* Jump bar: hop straight to a state instead of scrolling */}
                  <div className="flex flex-wrap gap-1.5">
                    {formStateOrder.map((stateName) => (
                      <button
                        key={stateName}
                        onClick={() =>
                          document
                            .getElementById(`forms-${stateName.replace(/\s+/g, '-')}`)
                            ?.scrollIntoView({ behavior: 'smooth', block: 'start' })
                        }
                        className="clay-chip clay-plain text-xs transition hover:-translate-y-0.5"
                      >
                        {stateName === 'Central' ? '🇮🇳 Central' : stateName}
                        <span className="opacity-60">{formsByState[stateName].length}</span>
                      </button>
                    ))}
                  </div>

                  {/* Each state gets its own box, so the groups read as separate blocks */}
                  {formStateOrder.map((stateName) => (
                    <section
                      key={stateName}
                      id={`forms-${stateName.replace(/\s+/g, '-')}`}
                      className="clay clay-sun space-y-3 p-4 scroll-mt-4"
                    >
                      <div className="flex flex-wrap items-center gap-2">
                        <h4 className="clay-chip clay-dark text-[13px] uppercase tracking-wider">
                          {stateName === 'Central' ? '🇮🇳 Central' : stateName}
                        </h4>
                        <span className="text-xs font-semibold opacity-70">
                          {formsByState[stateName].length} link
                          {formsByState[stateName].length === 1 ? '' : 's'}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {formsByState[stateName].map((df) => (
                          <FormLink key={df.id} form={df} showState={false} />
                        ))}
                      </div>
                    </section>
                  ))}
                </>
              ) : (
                <div className="clay clay-sun grid grid-cols-1 sm:grid-cols-2 gap-2 p-4">
                  {directForms.map((df) => (
                    <FormLink key={df.id} form={df} showState />
                  ))}
                </div>
              )}
            </div>
          )}

          {selectedState !== 'iitkgp' && !loading && results.length === 0 && directForms.length === 0 && (
            <div className="text-center py-12 text-muted-foreground space-y-1">
              <p>No matching policies, SOPs, or entities found for &quot;{query}&quot; in {selectedState}.</p>
              <p className="text-[13px] text-muted-foreground">
                Try selecting <strong className="text-foreground/80">&quot;Uttar Pradesh (StartInUP)&quot;</strong> or <strong className="text-foreground/80">&quot;Gujarat (Policies & SOPs)&quot;</strong>.
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
                      ? 'clay clay-hover clay-sun'
                      : isUpScheme
                      ? 'clay clay-hover clay-mint'
                      : isGujaratScheme
                      ? 'clay clay-hover clay-soft'
                      : 'clay clay-hover clay-plain'
                  }`}
                >
                  <div className="flex justify-between items-start gap-2">
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[11px] font-extrabold uppercase px-2 py-0.5 rounded ${
                          isGujaratSop
                            ? 'clay-chip clay-sun'
                            : isUpScheme
                            ? 'clay-chip clay-mint'
                            : item.type === 'policy'
                            ? 'clay-chip clay-dark'
                            : 'clay-chip clay-plain'
                        }`}
                      >
                        {isGujaratSop ? 'GUJARAT SOP' : isUpScheme ? 'STARTINUP UP' : item.type}
                      </span>
                      <h4 className="text-sm font-bold">{item.title}</h4>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {item.presentedAt && (
                        <span className="text-xs font-semibold text-muted-foreground bg-black/6 px-2 py-0.5 rounded-full">
                          📅 Presented: {item.presentedAt}
                        </span>
                      )}
                      <span className="text-xs font-bold text-muted-foreground">
                        Score: {item.relevanceScore}%
                      </span>
                    </div>
                  </div>

                  <p className="text-[13px] font-semibold text-foreground/80">{item.subtitle}</p>
                  <p className="text-[13px] text-muted-foreground leading-relaxed">{item.description}</p>

                  <div className="flex justify-between items-center pt-2 border-t border-border/70 mt-2">
                    <div className="flex flex-wrap gap-1">
                      {item.tags.map((tag, idx) => (
                        <span
                          key={idx}
                          className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-black/6 text-muted-foreground"
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
                        className="text-xs font-bold hover:underline flex items-center gap-1 shrink-0"
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
