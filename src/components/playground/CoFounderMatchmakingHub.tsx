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
      <div className="clay clay-dark p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-2xl">🤝</span>
            <h2 className="text-xl font-bold tracking-tight">
              STEP Co-Founder &amp; Engineering Talent Directory
            </h2>
          </div>
          <p className="text-xs opacity-70 mt-1 max-w-2xl">
            Find technical co-founders, CTOs, lead AI researchers, and founding engineers from IIT Kharagpur with verified education and capabilities.
          </p>
        </div>

        <button
          onClick={onOpenRegisterModal}
          className="clay-btn clay-sun px-4 py-2.5 text-xs whitespace-nowrap"
        >
          + Join Co-Founder Directory
        </button>
      </div>

      {/* Search & Filter Bar */}
      <div className="clay flex flex-col sm:flex-row items-center gap-3 p-3">
        <div className="relative flex-1 w-full">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by skill (PyTorch, CUDA, Microfluidics), role, or degree..."
            className="clay-field pl-9 text-xs"
          />
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-xs">🔍</span>
        </div>

        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="clay-field w-full sm:w-auto text-xs font-semibold"
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
        <div className="clay-inset text-center py-12 text-muted-foreground text-xs font-semibold animate-pulse">
          Loading IIT Kharagpur Co-Founders &amp; Engineers...
        </div>
      ) : talents.length === 0 ? (
        <div className="clay-inset text-center py-12 p-6">
          <p className="text-sm font-semibold">No candidates found matching your criteria</p>
          <p className="text-xs text-muted-foreground mt-1">Try clearing filters or search terms.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {talents.map((t) => (
            <div
              key={t.id}
              className="clay clay-hover p-5 space-y-3 flex flex-col justify-between"
            >
              <div>
                {/* Header */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-bold text-base flex flex-wrap items-center gap-1.5">
                      {t.name}
                      {t.featured && (
                        <span className="clay-chip clay-sun text-xs">
                          VERIFIED KGP
                        </span>
                      )}
                    </h3>
                    <p className="text-xs font-bold text-brand mt-0.5">{t.roleTarget}</p>
                  </div>
                  <span className="clay-chip clay-soft text-[13px] whitespace-nowrap">
                    {t.availability}
                  </span>
                </div>

                {/* Education */}
                <div className="mt-2.5 text-xs text-muted-foreground flex items-center gap-1.5">
                  <span>🎓</span>
                  <span className="font-semibold text-foreground">{t.education}</span>
                </div>

                {/* Bio */}
                <p className="clay-inset mt-2.5 text-xs text-muted-foreground leading-relaxed line-clamp-3 p-3">
                  {t.bio}
                </p>

                {/* Capabilities */}
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {t.capabilities?.map((cap: string, idx: number) => (
                    <span
                      key={idx}
                      className="text-xs px-2 py-0.5 bg-black/6 text-muted-foreground font-semibold rounded-full"
                    >
                      {cap}
                    </span>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-border/70 flex flex-wrap items-center justify-between gap-3 mt-2">
                <div className="flex items-center gap-3 text-xs">
                  {t.linkedinUrl && (
                    <a
                      href={t.linkedinUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-brand hover:underline font-semibold"
                    >
                      LinkedIn ↗
                    </a>
                  )}
                  {t.githubUrl && (
                    <a
                      href={t.githubUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-muted-foreground hover:underline font-semibold"
                    >
                      GitHub ↗
                    </a>
                  )}
                </div>

                <button
                  onClick={() => handleContact(t)}
                  className={`clay-btn text-xs px-4 py-2 ${
                    contactedId === t.id ? "clay-mint" : "clay-dark"
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
