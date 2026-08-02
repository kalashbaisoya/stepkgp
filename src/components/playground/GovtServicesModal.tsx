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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="clay-lg relative w-full max-w-4xl max-h-[90vh] overflow-y-auto p-6">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 border-b border-border/70 pb-4 mb-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-2xl">🏛️</span>
              <h2 className="text-xl font-bold">
                Government Portals & IP Services Integration Hub
              </h2>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Direct API integrations for IP India Trademark Search, DPIIT Startup Recognition, MCA Incorporation, and State Portals
            </p>
          </div>
          <button
            onClick={onClose}
            className="clay-btn clay-plain h-9 w-9 shrink-0 rounded-full text-xs"
          >
            ✕
          </button>
        </div>

        {/* Tab Buttons */}
        <div className="clay-inset flex flex-wrap gap-1.5 p-1.5 rounded-[1rem] mb-6">
          <button
            onClick={() => setActiveTab("trademark")}
            className={`px-4 py-2 text-sm font-semibold rounded-xl transition ${
              activeTab === "trademark"
                ? "clay-sm clay-dark"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            🔍 Live Trademark & Patent Search
          </button>
          <button
            onClick={() => setActiveTab("prefill")}
            className={`px-4 py-2 text-sm font-semibold rounded-xl transition ${
              activeTab === "prefill"
                ? "clay-sm clay-dark"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            📋 Auto-Fill Govt Registration Packet
          </button>
          <button
            onClick={() => setActiveTab("direct")}
            className={`px-4 py-2 text-sm font-semibold rounded-xl transition ${
              activeTab === "direct"
                ? "clay-sm clay-dark"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            🌐 28 State & Central Direct Portals
          </button>
          <button
            onClick={() => setActiveTab("autosync")}
            className={`px-4 py-2 text-sm font-semibold rounded-xl transition ${
              activeTab === "autosync"
                ? "clay-sm clay-dark"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            🔄 Auto-Sync Scraper Engine
          </button>
        </div>

        {/* TAB 1: TRADEMARK SEARCH */}
        {activeTab === "trademark" && (
          <div className="space-y-6">
            <form onSubmit={handleTrademarkSearch} className="clay clay-well space-y-4 p-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold mb-1.5">Brand / Startup Name to Search</label>
                  <input
                    type="text"
                    value={brandInput}
                    onChange={(e) => setBrandInput(e.target.value)}
                    placeholder="e.g. AeroGrid, Intinno, MedSense"
                    className="clay-field text-sm"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1.5">Industry Sector (Determines NICE Class)</label>
                  <select
                    value={sectorInput}
                    onChange={(e) => setSectorInput(e.target.value)}
                    className="clay-field text-sm"
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
                className="clay-btn clay-primary w-full py-3 text-sm"
              >
                {tmLoading ? "Searching IP India Registry..." : "Run IP India Trademark Public Availability Search"}
              </button>
            </form>

            {tmResult && (
              <div className="clay clay-sun p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-muted-foreground">Class Classification:</span>
                  <span className="clay-chip clay-sun text-xs font-mono">
                    {tmResult.classCategory}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <div
                    className={`clay-chip text-xs ${
                      tmResult.status === "AVAILABLE"
                        ? "clay-mint"
                        : "clay-sun"
                    }`}
                  >
                    STATUS: {tmResult.status}
                  </div>
                  <span className="text-xs text-muted-foreground">Conflict Score: {tmResult.similarityScore}%</span>
                </div>

                <p className="clay-inset text-xs p-3.5 leading-relaxed">
                  {tmResult.details}
                </p>

                <div>
                  <h4 className="text-sm font-bold mb-2">Recommended Action Steps:</h4>
                  <ul className="space-y-1.5 text-xs text-muted-foreground">
                    {tmResult.recommendedNextSteps?.map((step: string, idx: number) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-brand font-bold">✓</span>
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
            <form onSubmit={handleGeneratePrefill} className="clay clay-well space-y-4 p-5">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold mb-1.5">Startup Entity Name</label>
                  <input
                    type="text"
                    value={startupName}
                    onChange={(e) => setStartupName(e.target.value)}
                    placeholder="e.g. AeroGrid Dynamics Pvt Ltd"
                    className="clay-field text-sm"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1.5">CIN / LLP Identification No.</label>
                  <input
                    type="text"
                    value={cinInput}
                    onChange={(e) => setCinInput(e.target.value)}
                    placeholder="e.g. U72900WB2026PTC998877"
                    className="clay-field text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1.5">Registered State</label>
                  <input
                    type="text"
                    value={stateInput}
                    onChange={(e) => setStateInput(e.target.value)}
                    className="clay-field text-sm"
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={prefillLoading}
                className="clay-btn clay-primary w-full py-3 text-sm"
              >
                {prefillLoading ? "Generating Prefilled Packet..." : "Generate Auto-Filled DPIIT, Udyam & SISFS Registration Packet"}
              </button>
            </form>

            {prefillData && (
              <div className="clay clay-well p-5 space-y-6 text-xs">
                {/* DPIIT Recognition Card */}
                <div className="clay clay-plain p-4 space-y-2">
                  <div className="flex flex-wrap gap-2 items-center justify-between border-b border-black/8 pb-2">
                    <h3 className="font-bold text-sm">1. DPIIT Startup Recognition Form Data</h3>
                    <a
                      href={prefillData.dpiitRecognitionForm.portalUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="clay-btn clay-sun px-3 py-1.5 text-xs"
                    >
                      Open DPIIT Portal ↗
                    </a>
                  </div>
                  <pre className="clay-inset p-3.5 font-mono overflow-x-auto text-[13px]">
                    {JSON.stringify(prefillData.dpiitRecognitionForm.fields, null, 2)}
                  </pre>
                </div>

                {/* MSME Udyam Card */}
                <div className="clay clay-plain p-4 space-y-2">
                  <div className="flex flex-wrap gap-2 items-center justify-between border-b border-black/8 pb-2">
                    <h3 className="font-bold text-sm">2. MSME Udyam Registration Data</h3>
                    <a
                      href={prefillData.msmeUdyamRegistrationForm.portalUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="clay-btn clay-mint px-3 py-1.5 text-xs"
                    >
                      Open Udyam Portal ↗
                    </a>
                  </div>
                  <pre className="clay-inset p-3.5 font-mono overflow-x-auto text-[13px]">
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
            <p className="text-muted-foreground">
              Direct access to all official Government of India, State Startup Missions, MCA V3, and IP Registries:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <a
                href="https://www.startupindia.gov.in/"
                target="_blank"
                rel="noopener noreferrer"
                className="clay-btn clay-plain p-3.5 w-full text-left flex items-center justify-between"
              >
                <div>
                  <span className="font-bold block text-sm">Startup India (DPIIT)</span>
                  <span className="text-muted-foreground text-[13px]">SISFS Seed Fund, 80-IAC Tax Exemption, CGSS Credit Cover</span>
                </div>
                <span className="text-brand">↗</span>
              </a>

              <a
                href="https://ipindia.gov.in/"
                target="_blank"
                rel="noopener noreferrer"
                className="clay-btn clay-plain p-3.5 w-full text-left flex items-center justify-between"
              >
                <div>
                  <span className="font-bold block text-sm">IP India (Patent & Trademark Registry)</span>
                  <span className="text-muted-foreground text-[13px]">Public Patent Search, Form TM-A, 80% Patent Fee Rebate</span>
                </div>
                <span className="text-brand">↗</span>
              </a>

              <a
                href="https://www.mca.gov.in/"
                target="_blank"
                rel="noopener noreferrer"
                className="clay-btn clay-plain p-3.5 w-full text-left flex items-center justify-between"
              >
                <div>
                  <span className="font-bold block text-sm">MCA V3 (Ministry of Corporate Affairs)</span>
                  <span className="text-muted-foreground text-[13px]">SPICe+ Incorporation, RUN Name Reservation, DIN Issuance</span>
                </div>
                <span className="text-brand">↗</span>
              </a>

              <a
                href="https://gem.gov.in/"
                target="_blank"
                rel="noopener noreferrer"
                className="clay-btn clay-plain p-3.5 w-full text-left flex items-center justify-between"
              >
                <div>
                  <span className="font-bold block text-sm">Government e-Marketplace (GeM)</span>
                  <span className="text-muted-foreground text-[13px]">Startup Runway, EMD Waiver, Public Procurement Tenders</span>
                </div>
                <span className="text-brand">↗</span>
              </a>
            </div>
          </div>
        )}

        {/* TAB 4: AUTO-SYNC SCRAPER ENGINE */}
        {activeTab === "autosync" && (
          <div className="space-y-6">
            <div className="clay p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-brand animate-ping" />
                  <h3 className="text-base font-bold">Live Auto-Sync Scraper Daemon</h3>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Keeps 65 IIT Kharagpur department rosters, MP Startup Portal 2025/2022, Gujarat REST schemes, UP StartInUP, and Ministry of Defence iDEX challenges auto-updating in SQLite database.
                </p>
              </div>

              <button
                onClick={handleRunAutoSync}
                disabled={syncLoading}
                className="clay-btn clay-primary px-5 py-2.5 text-xs whitespace-nowrap"
              >
                {syncLoading ? "⏳ Scraping All Portals..." : "⚡ Trigger Scraper Sync Now"}
              </button>
            </div>

            {/* Target Scraper Engine Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="clay clay-plain p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold">🏛️ IIT Kharagpur Academic Roster</span>
                  <span className="clay-chip clay-mint text-xs">65 UNITS</span>
                </div>
                <p className="text-muted-foreground">
                  Scrapes live faculty rosters, lab titles, and research areas across all 65 departments (`AE`, `AG`, `CS`, `EE`, `EC`, `BT`, `ME`, `CE`, `CH`, `BM`, `DS`, `RJ`, `AI`, `CY`, etc.) and upserts into `FacultyMember`.
                </p>
              </div>

              <div className="clay clay-plain p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold">🐅 MP Startup Portal (startup.mp.gov.in)</span>
                  <span className="clay-chip clay-mint text-xs">MP 2025/2022</span>
                </div>
                <p className="text-muted-foreground">
                  Scrapes Gazette Notifications, SOPs, ₹1Cr Innovation Challenge Grants, ₹15L Product Assistance, Electricity Duty Exemption, and Store Purchase Rules.
                </p>
              </div>

              <div className="clay clay-plain p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold">🛡️ Ministry of Defence iDEX Portal</span>
                  <span className="clay-chip clay-mint text-xs">DISC 14 / ADITI</span>
                </div>
                <p className="text-muted-foreground">
                  Scrapes Defence India Startup Challenges (DISC 14), iDEX Prime ₹10Cr grants, ADITI ₹25Cr scheme, and SPARK ₹1.5Cr grants.
                </p>
              </div>

              <div className="clay clay-plain p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold">🦁 Gujarat REST API & UP StartInUP</span>
                  <span className="clay-chip clay-mint text-xs">MD5 HASH DIFF</span>
                </div>
                <p className="text-muted-foreground">
                  Performs automatic MD5 hash diff checks against Gujarat Industries REST API, StartInUP, DST NIDHI, MeitY MSH, and Startup India portals.
                </p>
              </div>
            </div>

            {/* Sync Results Box */}
            {syncReport && (
              <div className="clay clay-mint p-4 text-xs space-y-3">
                <div className="flex flex-wrap gap-2 items-center justify-between border-b border-black/8 pb-2">
                  <span className="font-bold">✅ Scraper Sync Report Summary</span>
                  <span className="text-muted-foreground">Duration: {syncReport.durationMs}ms</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="clay-inset p-3">
                    <span className="text-muted-foreground block text-xs">IIT KGP FACULTIES</span>
                    <strong className="text-sm font-bold">
                      {syncReport.modulesSynced?.iitkgpFaculties?.totalSynced ?? 0} Synced
                    </strong>
                  </div>

                  <div className="clay-inset p-3">
                    <span className="text-muted-foreground block text-xs">GOVT POLICIES & SOPS</span>
                    <strong className="text-sm font-bold">
                      {syncReport.modulesSynced?.governmentPolicies?.totalSynced ?? 0} Synced
                    </strong>
                  </div>

                  <div className="clay-inset p-3">
                    <span className="text-muted-foreground block text-xs">MD5 CONTENT HASH</span>
                    <span className="text-xs font-mono font-bold block truncate">
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
