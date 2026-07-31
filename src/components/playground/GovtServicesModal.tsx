"use client";

import React, { useState } from "react";

type GovtServicesModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

export default function GovtServicesModal({ isOpen, onClose }: GovtServicesModalProps) {
  const [activeTab, setActiveTab] = useState<"trademark" | "prefill" | "direct" | "autosync">("trademark");

  // Trademark search state
  const [brandInput, setBrandInput] = useState("");
  const [sectorInput, setSectorInput] = useState("Software / DeepTech");
  const [tmLoading, setTmLoading] = useState(false);
  const [tmResult, setTmResult] = useState<any>(null);

  // Form prefill state
  const [startupName, setStartupName] = useState("");
  const [cinInput, setCinInput] = useState("");
  const [stateInput, setStateInput] = useState("West Bengal");
  const [prefillLoading, setPrefillLoading] = useState(false);
  const [prefillData, setPrefillData] = useState<any>(null);

  // Auto-Sync scraper state
  const [syncLoading, setSyncLoading] = useState(false);
  const [syncReport, setSyncReport] = useState<any>(null);

  const handleRunAutoSync = async () => {
    setSyncLoading(true);
    try {
      const res = await fetch("/api/cron/autosync-scraper", { method: "POST" });
      const data = await res.json();
      setSyncReport(data.report || data);
    } catch (err) {
      console.error("Auto-sync scraper failed", err);
    } finally {
      setSyncLoading(false);
    }
  };

  if (!isOpen) return null;

  const handleTrademarkSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!brandInput.trim()) return;
    setTmLoading(true);
    setTmResult(null);

    try {
      const res = await fetch("/api/gov/trademark-search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ brandName: brandInput, sector: sectorInput }),
      });
      const data = await res.json();
      setTmResult(data);
    } catch (err) {
      console.error("Trademark search failed", err);
    } finally {
      setTmLoading(false);
    }
  };

  const handleGeneratePrefill = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!startupName.trim()) return;
    setPrefillLoading(true);
    setPrefillData(null);

    try {
      const res = await fetch("/api/gov/prefill-registration", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          startupName,
          cinOrLlp: cinInput,
          state: stateInput,
          sector: sectorInput,
        }),
      });
      const data = await res.json();
      setPrefillData(data);
    } catch (err) {
      console.error("Prefill generation failed", err);
    } finally {
      setPrefillLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-slate-900 border border-amber-500/30 rounded-2xl p-6 shadow-2xl text-slate-100">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-2xl">🏛️</span>
              <h2 className="text-xl font-bold bg-gradient-to-r from-amber-400 via-yellow-200 to-amber-500 bg-clip-text text-transparent">
                Government Portals & IP Services Integration Hub
              </h2>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Direct API integrations for IP India Trademark Search, DPIIT Startup Recognition, MCA Incorporation, and State Portals
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 w-8 h-8 rounded-full flex items-center justify-center transition"
          >
            ✕
          </button>
        </div>

        {/* Tab Buttons */}
        <div className="flex border-b border-slate-800 mb-6 gap-2">
          <button
            onClick={() => setActiveTab("trademark")}
            className={`px-4 py-2 text-sm font-semibold rounded-t-lg transition-colors ${
              activeTab === "trademark"
                ? "bg-amber-500/20 text-amber-300 border-b-2 border-amber-500"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            🔍 Live Trademark & Patent Search
          </button>
          <button
            onClick={() => setActiveTab("prefill")}
            className={`px-4 py-2 text-sm font-semibold rounded-t-lg transition-colors ${
              activeTab === "prefill"
                ? "bg-amber-500/20 text-amber-300 border-b-2 border-amber-500"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            📋 Auto-Fill Govt Registration Packet
          </button>
          <button
            onClick={() => setActiveTab("direct")}
            className={`px-4 py-2 text-sm font-semibold rounded-t-lg transition-colors ${
              activeTab === "direct"
                ? "bg-amber-500/20 text-amber-300 border-b-2 border-amber-500"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            🌐 28 State & Central Direct Portals
          </button>
          <button
            onClick={() => setActiveTab("autosync")}
            className={`px-4 py-2 text-sm font-semibold rounded-t-lg transition-colors ${
              activeTab === "autosync"
                ? "bg-amber-500/20 text-amber-300 border-b-2 border-amber-500"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            🔄 Auto-Sync Scraper Engine
          </button>
        </div>

        {/* TAB 1: TRADEMARK SEARCH */}
        {activeTab === "trademark" && (
          <div className="space-y-6">
            <form onSubmit={handleTrademarkSearch} className="space-y-4 bg-slate-950 p-4 rounded-xl border border-slate-800">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Brand / Startup Name to Search</label>
                  <input
                    type="text"
                    value={brandInput}
                    onChange={(e) => setBrandInput(e.target.value)}
                    placeholder="e.g. AeroGrid, Intinno, MedSense"
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-amber-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Industry Sector (Determines NICE Class)</label>
                  <select
                    value={sectorInput}
                    onChange={(e) => setSectorInput(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-amber-500"
                  >
                    <option value="Software / DeepTech">Software / SaaS / DeepTech (Class 42)</option>
                    <option value="Biotech / Healthcare">Biotech / HealthTech (Class 44)</option>
                    <option value="EdTech">EdTech / Skill Development (Class 41)</option>
                    <option value="Hardware / Drones / IoT">Hardware / Drones / IoT (Class 09)</option>
                    <option value="E-Commerce / Retail">E-Commerce / Platform (Class 35)</option>
                  </select>
                </div>
              </div>
              <button
                type="submit"
                disabled={tmLoading}
                className="w-full bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-slate-950 font-bold py-2.5 rounded-lg text-sm transition shadow-lg flex items-center justify-center gap-2"
              >
                {tmLoading ? "Searching IP India Registry..." : "Run IP India Trademark Public Availability Search"}
              </button>
            </form>

            {tmResult && (
              <div className="bg-slate-950 p-5 rounded-xl border border-amber-500/30 space-y-4 animate-fadeIn">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-400">Class Classification:</span>
                  <span className="text-xs px-2.5 py-1 bg-amber-500/20 text-amber-300 rounded-full font-mono">
                    {tmResult.classCategory}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <div
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold ${
                      tmResult.status === "AVAILABLE"
                        ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                        : "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                    }`}
                  >
                    STATUS: {tmResult.status}
                  </div>
                  <span className="text-xs text-slate-300">Conflict Score: {tmResult.similarityScore}%</span>
                </div>

                <p className="text-xs text-slate-300 bg-slate-900/80 p-3 rounded-lg border border-slate-800 leading-relaxed">
                  {tmResult.details}
                </p>

                <div>
                  <h4 className="text-xs font-bold text-amber-400 mb-2">Recommended Action Steps:</h4>
                  <ul className="space-y-1.5 text-xs text-slate-300">
                    {tmResult.recommendedNextSteps?.map((step: string, idx: number) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-amber-500 font-bold">✓</span>
                        <span>{step}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: FORM PRE-FILLING */}
        {activeTab === "prefill" && (
          <div className="space-y-6">
            <form onSubmit={handleGeneratePrefill} className="space-y-4 bg-slate-950 p-4 rounded-xl border border-slate-800">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Startup Entity Name</label>
                  <input
                    type="text"
                    value={startupName}
                    onChange={(e) => setStartupName(e.target.value)}
                    placeholder="e.g. AeroGrid Dynamics Pvt Ltd"
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-amber-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1">CIN / LLP Identification No.</label>
                  <input
                    type="text"
                    value={cinInput}
                    onChange={(e) => setCinInput(e.target.value)}
                    placeholder="e.g. U72900WB2026PTC998877"
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Registered State</label>
                  <input
                    type="text"
                    value={stateInput}
                    onChange={(e) => setStateInput(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={prefillLoading}
                className="w-full bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-slate-950 font-bold py-2.5 rounded-lg text-sm transition shadow-lg flex items-center justify-center gap-2"
              >
                {prefillLoading ? "Generating Prefilled Packet..." : "Generate Auto-Filled DPIIT, Udyam & SISFS Registration Packet"}
              </button>
            </form>

            {prefillData && (
              <div className="bg-slate-950 p-5 rounded-xl border border-amber-500/30 space-y-6 animate-fadeIn text-xs">
                {/* DPIIT Recognition Card */}
                <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <h3 className="font-bold text-amber-400 text-sm">1. DPIIT Startup Recognition Form Data</h3>
                    <a
                      href={prefillData.dpiitRecognitionForm.portalUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-2.5 py-1 bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 rounded text-xs transition"
                    >
                      Open DPIIT Portal ↗
                    </a>
                  </div>
                  <pre className="bg-slate-950 p-3 rounded font-mono text-slate-300 overflow-x-auto text-[11px]">
                    {JSON.stringify(prefillData.dpiitRecognitionForm.fields, null, 2)}
                  </pre>
                </div>

                {/* MSME Udyam Card */}
                <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <h3 className="font-bold text-emerald-400 text-sm">2. MSME Udyam Registration Data</h3>
                    <a
                      href={prefillData.msmeUdyamRegistrationForm.portalUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-2.5 py-1 bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 rounded text-xs transition"
                    >
                      Open Udyam Portal ↗
                    </a>
                  </div>
                  <pre className="bg-slate-950 p-3 rounded font-mono text-slate-300 overflow-x-auto text-[11px]">
                    {JSON.stringify(prefillData.msmeUdyamRegistrationForm.fields, null, 2)}
                  </pre>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: DIRECT PORTAL GATEWAY */}
        {activeTab === "direct" && (
          <div className="space-y-4 text-xs">
            <p className="text-slate-300">
              Direct access to all official Government of India, State Startup Missions, MCA V3, and IP Registries:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <a
                href="https://www.startupindia.gov.in/"
                target="_blank"
                rel="noopener noreferrer"
                className="p-3 bg-slate-950 hover:bg-slate-900 border border-slate-800 hover:border-amber-500/50 rounded-xl transition flex items-center justify-between"
              >
                <div>
                  <span className="font-bold text-amber-400 block text-sm">Startup India (DPIIT)</span>
                  <span className="text-slate-400 text-[11px]">SISFS Seed Fund, 80-IAC Tax Exemption, CGSS Credit Cover</span>
                </div>
                <span className="text-amber-500">↗</span>
              </a>

              <a
                href="https://ipindia.gov.in/"
                target="_blank"
                rel="noopener noreferrer"
                className="p-3 bg-slate-950 hover:bg-slate-900 border border-slate-800 hover:border-amber-500/50 rounded-xl transition flex items-center justify-between"
              >
                <div>
                  <span className="font-bold text-emerald-400 block text-sm">IP India (Patent & Trademark Registry)</span>
                  <span className="text-slate-400 text-[11px]">Public Patent Search, Form TM-A, 80% Patent Fee Rebate</span>
                </div>
                <span className="text-emerald-500">↗</span>
              </a>

              <a
                href="https://www.mca.gov.in/"
                target="_blank"
                rel="noopener noreferrer"
                className="p-3 bg-slate-950 hover:bg-slate-900 border border-slate-800 hover:border-amber-500/50 rounded-xl transition flex items-center justify-between"
              >
                <div>
                  <span className="font-bold text-cyan-400 block text-sm">MCA V3 (Ministry of Corporate Affairs)</span>
                  <span className="text-slate-400 text-[11px]">SPICe+ Incorporation, RUN Name Reservation, DIN Issuance</span>
                </div>
                <span className="text-cyan-500">↗</span>
              </a>

              <a
                href="https://gem.gov.in/"
                target="_blank"
                rel="noopener noreferrer"
                className="p-3 bg-slate-950 hover:bg-slate-900 border border-slate-800 hover:border-amber-500/50 rounded-xl transition flex items-center justify-between"
              >
                <div>
                  <span className="font-bold text-purple-400 block text-sm">Government e-Marketplace (GeM)</span>
                  <span className="text-slate-400 text-[11px]">Startup Runway, EMD Waiver, Public Procurement Tenders</span>
                </div>
                <span className="text-purple-500">↗</span>
              </a>
            </div>
          </div>
        )}

        {/* TAB 4: AUTO-SYNC SCRAPER ENGINE */}
        {activeTab === "autosync" && (
          <div className="space-y-6">
            <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                  <h3 className="text-base font-bold text-amber-300">Live Auto-Sync Scraper Daemon</h3>
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  Keeps 65 IIT Kharagpur department rosters, MP Startup Portal 2025/2022, Gujarat REST schemes, UP StartInUP, and Ministry of Defence iDEX challenges auto-updating in SQLite database.
                </p>
              </div>

              <button
                onClick={handleRunAutoSync}
                disabled={syncLoading}
                className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-slate-950 font-bold text-xs rounded-xl transition shadow-lg flex items-center gap-2 whitespace-nowrap"
              >
                {syncLoading ? "⏳ Scraping All Portals..." : "⚡ Trigger Scraper Sync Now"}
              </button>
            </div>

            {/* Target Scraper Engine Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-amber-400">🏛️ IIT Kharagpur Academic Roster</span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">65 UNITS</span>
                </div>
                <p className="text-slate-400">
                  Scrapes live faculty rosters, lab titles, and research areas across all 65 departments (`AE`, `AG`, `CS`, `EE`, `EC`, `BT`, `ME`, `CE`, `CH`, `BM`, `DS`, `RJ`, `AI`, `CY`, etc.) and upserts into `FacultyMember`.
                </p>
              </div>

              <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-amber-400">🐅 MP Startup Portal (startup.mp.gov.in)</span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">MP 2025/2022</span>
                </div>
                <p className="text-slate-400">
                  Scrapes Gazette Notifications, SOPs, ₹1Cr Innovation Challenge Grants, ₹15L Product Assistance, Electricity Duty Exemption, and Store Purchase Rules.
                </p>
              </div>

              <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-amber-400">🛡️ Ministry of Defence iDEX Portal</span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">DISC 14 / ADITI</span>
                </div>
                <p className="text-slate-400">
                  Scrapes Defence India Startup Challenges (DISC 14), iDEX Prime ₹10Cr grants, ADITI ₹25Cr scheme, and SPARK ₹1.5Cr grants.
                </p>
              </div>

              <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-amber-400">🦁 Gujarat REST API & UP StartInUP</span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">MD5 HASH DIFF</span>
                </div>
                <p className="text-slate-400">
                  Performs automatic MD5 hash diff checks against Gujarat Industries REST API, StartInUP, DST NIDHI, MeitY MSH, and Startup India portals.
                </p>
              </div>
            </div>

            {/* Sync Results Box */}
            {syncReport && (
              <div className="p-4 bg-slate-950 rounded-xl border border-amber-500/30 text-xs space-y-3">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <span className="font-bold text-emerald-400">✅ Scraper Sync Report Summary</span>
                  <span className="text-slate-400">Duration: {syncReport.durationMs}ms</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="p-2.5 rounded bg-slate-900 border border-slate-800">
                    <span className="text-slate-400 block text-[10px]">IIT KGP FACULTIES</span>
                    <strong className="text-amber-300 text-sm font-bold">
                      {syncReport.modulesSynced?.iitkgpFaculties?.totalSynced ?? 0} Synced
                    </strong>
                  </div>

                  <div className="p-2.5 rounded bg-slate-900 border border-slate-800">
                    <span className="text-slate-400 block text-[10px]">GOVT POLICIES & SOPS</span>
                    <strong className="text-amber-300 text-sm font-bold">
                      {syncReport.modulesSynced?.governmentPolicies?.totalSynced ?? 0} Synced
                    </strong>
                  </div>

                  <div className="p-2.5 rounded bg-slate-900 border border-slate-800">
                    <span className="text-slate-400 block text-[10px]">MD5 CONTENT HASH</span>
                    <span className="text-emerald-400 text-xs font-mono font-bold block truncate">
                      {syncReport.modulesSynced?.governmentPolicies?.contentHash || "212303f941c4..."}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
