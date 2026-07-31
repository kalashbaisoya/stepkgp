"use client";

import React, { useEffect, useState } from "react";

export type CoFounderMatchmakingHubProps = {
  onOpenRegisterModal: () => void;
};

export default function CoFounderMatchmakingHub({ onOpenRegisterModal }: CoFounderMatchmakingHubProps) {
  const [talents, setTalents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [contactedId, setContactedId] = useState<string | null>(null);

  const fetchTalents = async () => {
    setLoading(true);
    try {
      const url = new URL("/api/talent", window.location.origin);
      if (searchQuery) url.searchParams.set("q", searchQuery);
      if (roleFilter !== "ALL") url.searchParams.set("role", roleFilter);

      const res = await fetch(url.toString());
      const data = await res.json();
      setTalents(data.talents || []);
    } catch (err) {
      console.error("Failed to fetch talent profiles:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTalents();
  }, [searchQuery, roleFilter]);

  const handleContact = (talent: any) => {
    setContactedId(talent.id);
    alert(`📩 Co-Founder Match Request Sent to ${talent.name} (${talent.email})! They will receive your startup overview.`);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-stone-900 via-stone-850 to-slate-900 text-stone-100 p-6 rounded-2xl border border-stone-800 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-2xl">🤝</span>
            <h2 className="text-xl font-bold tracking-tight text-white">
              STEP Co-Founder &amp; Engineering Talent Directory
            </h2>
          </div>
          <p className="text-xs text-stone-400 mt-1 max-w-2xl">
            Find technical co-founders, CTOs, lead AI researchers, and founding engineers from IIT Kharagpur with verified education and capabilities.
          </p>
        </div>

        <button
          onClick={onOpenRegisterModal}
          className="px-4 py-2.5 bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-500 hover:to-yellow-600 text-stone-950 font-bold text-xs rounded-xl transition shadow-md whitespace-nowrap"
        >
          + Join Co-Founder Directory
        </button>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-3 bg-white p-3 rounded-xl border border-stone-200 shadow-2xs">
        <div className="relative flex-1 w-full">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by skill (PyTorch, CUDA, Microfluidics), role, or degree..."
            className="w-full pl-9 pr-4 py-2 bg-stone-50 border border-stone-200 rounded-lg text-xs text-stone-900 focus:outline-none focus:border-stone-900"
          />
          <span className="absolute left-3 top-2.5 text-stone-400 text-xs">🔍</span>
        </div>

        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="w-full sm:w-auto px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-xs font-semibold text-stone-800 focus:outline-none focus:border-stone-900"
        >
          <option value="ALL">All Roles</option>
          <option value="CTO">Technical Co-Founder / CTO</option>
          <option value="Chief Scientist">Scientific Co-Founder / Chief Scientist</option>
          <option value="COO">Co-Founder &amp; COO</option>
          <option value="AI">AI &amp; Robotics Engineer</option>
          <option value="Founding">Founding Software Engineer</option>
        </select>
      </div>

      {/* Talent Cards Grid */}
      {loading ? (
        <div className="text-center py-12 text-stone-400 text-xs animate-pulse">
          Loading IIT Kharagpur Co-Founders &amp; Engineers...
        </div>
      ) : talents.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-2xl border border-stone-200 p-6">
          <p className="text-sm font-semibold text-stone-700">No candidates found matching your criteria</p>
          <p className="text-xs text-stone-500 mt-1">Try clearing filters or search terms.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {talents.map((t) => (
            <div
              key={t.id}
              className="bg-white p-5 rounded-2xl border border-stone-200/90 shadow-2xs hover:border-amber-400/80 transition-all space-y-3 flex flex-col justify-between"
            >
              <div>
                {/* Header */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-bold text-stone-900 text-base flex items-center gap-1.5">
                      {t.name}
                      {t.featured && (
                        <span className="text-[10px] px-2 py-0.5 bg-amber-100 text-amber-800 font-bold rounded-full border border-amber-300">
                          VERIFIED KGP
                        </span>
                      )}
                    </h3>
                    <p className="text-xs font-bold text-amber-700 mt-0.5">{t.roleTarget}</p>
                  </div>
                  <span className="text-[11px] px-2.5 py-1 bg-stone-100 text-stone-700 rounded-lg font-medium border border-stone-200 whitespace-nowrap">
                    {t.availability}
                  </span>
                </div>

                {/* Education */}
                <div className="mt-2.5 text-xs text-stone-600 flex items-center gap-1.5">
                  <span>🎓</span>
                  <span className="font-semibold text-stone-800">{t.education}</span>
                </div>

                {/* Bio */}
                <p className="mt-2 text-xs text-stone-600 leading-relaxed line-clamp-3 bg-stone-50/80 p-2.5 rounded-lg border border-stone-100">
                  {t.bio}
                </p>

                {/* Capabilities */}
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {t.capabilities?.map((cap: string, idx: number) => (
                    <span
                      key={idx}
                      className="text-[10px] px-2 py-0.5 bg-stone-100 text-stone-700 font-semibold rounded border border-stone-200"
                    >
                      {cap}
                    </span>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-stone-100 flex items-center justify-between mt-2">
                <div className="flex items-center gap-2 text-xs">
                  {t.linkedinUrl && (
                    <a
                      href={t.linkedinUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline font-semibold"
                    >
                      LinkedIn ↗
                    </a>
                  )}
                  {t.githubUrl && (
                    <a
                      href={t.githubUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-stone-700 hover:underline font-semibold"
                    >
                      GitHub ↗
                    </a>
                  )}
                </div>

                <button
                  onClick={() => handleContact(t)}
                  className={`text-xs font-bold px-3.5 py-1.5 rounded-lg transition ${
                    contactedId === t.id
                      ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                      : "bg-stone-900 hover:bg-stone-800 text-white shadow-2xs"
                  }`}
                >
                  {contactedId === t.id ? "✓ Match Request Sent" : "Connect & Match →"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
