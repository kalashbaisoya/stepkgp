'use client';

import React, { useState, useEffect } from 'react';

type HalfBakedEdition = {
  id: string;
  issueNumber: string;
  title: string;
  tag: string;
  date: string;
  readTime: string;
  summary: string;
  fullUrl: string;
  keyTakeaways: string[];
};

export default function HalfBakedNewsletterSection() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [editions, setEditions] = useState<HalfBakedEdition[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEdition, setSelectedEdition] = useState<HalfBakedEdition | null>(null);

  const fetchEditions = async (query = '') => {
    setLoading(true);
    try {
      const res = await fetch(`/api/playground/halfbaked${query ? `?q=${encodeURIComponent(query)}` : ''}`);
      const data = await res.json();
      if (data.success) {
        setEditions(data.data);
      }
    } catch (err) {
      console.error('Failed to fetch Half Baked editions:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEditions(searchQuery);
  }, [searchQuery]);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
      setTimeout(() => setSubscribed(false), 5000);
      setEmail('');
    }
  };

  return (
    <div className="clay-lg clay-well p-6 md:p-8 relative overflow-hidden space-y-8">
      {/* Top Banner & Half Baked Editorial Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 border-b border-border/70 pb-6">
        <div className="space-y-2">
          <span className="clay-chip clay-sun text-[13px] uppercase tracking-wider">
            🔥 Half Baked x STEP Newsletter
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Vetted Startup Ideas &amp; Campus Playbooks
          </h2>
          <p className="text-xs text-muted-foreground font-medium max-w-2xl">
            In partnership with <strong className="text-foreground">Half Baked (gethalfbaked.com)</strong>. Join 100,000+ indie builders, student founders &amp; VCs getting unbaked business ideas and growth breakdowns delivered weekly.
          </p>
        </div>

        <a
          href="https://gethalfbaked.com"
          target="_blank"
          rel="noopener noreferrer"
          className="clay-btn clay-dark px-5 py-3 text-xs shrink-0"
        >
          <span>🌐 Visit gethalfbaked.com</span> ↗
        </a>
      </div>

      {/* Subscribe Input Form */}
      <div className="clay p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="space-y-1 w-full sm:w-auto">
          <h3 className="text-sm font-bold">Get Unbaked Ideas in Your Inbox</h3>
          <p className="text-xs text-muted-foreground">Every Tuesday: 3 new vetted startup ideas + 1 growth playbook.</p>
        </div>

        {subscribed ? (
          <div className="clay-chip clay-mint px-4 py-2 text-xs">
            🎉 You&rsquo;re subscribed to Half Baked x STEP Edition!
          </div>
        ) : (
          <form onSubmit={handleSubscribe} className="flex w-full sm:w-auto gap-2">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your student email..."
              className="clay-field text-xs font-medium w-full sm:w-64"
            />
            <button
              type="submit"
              className="clay-btn clay-primary px-5 py-2.5 text-xs shrink-0"
            >
              Subscribe Free
            </button>
          </form>
        )}
      </div>

      {/* Filter & Live Search Bar for Real Editions */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <h3 className="text-sm font-bold uppercase tracking-wider flex items-center gap-2">
            <span>📰</span> Latest Half Baked editions ({editions.length})
          </h3>

          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="🔍 Search editions (B-Roll, Private Tutors, AI Audits, Dating...)"
            className="clay-field text-xs font-medium w-full sm:w-80"
          />
        </div>

        {loading ? (
          <div className="clay-inset p-8 text-center text-muted-foreground text-xs font-semibold animate-pulse">
            Fetching Live Half Baked Newsletter Editions from gethalfbaked.com API...
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {editions.map((issue) => (
              <div
                key={issue.id}
                onClick={() => setSelectedEdition(issue)}
                className="clay clay-hover clay-plain p-5 flex flex-col justify-between group space-y-4 cursor-pointer"
              >
                <div className="space-y-3">
                  <div className="flex justify-between items-center gap-2 text-xs font-semibold">
                    <span className="clay-chip clay-sun text-xs">
                      {issue.issueNumber}
                    </span>
                    <span className="text-muted-foreground">{issue.date}</span>
                  </div>

                  <h4 className="text-sm font-bold group-hover:text-brand transition leading-snug line-clamp-2">
                    {issue.title}
                  </h4>

                  <p className="text-[13px] text-muted-foreground font-medium leading-relaxed line-clamp-3">
                    {issue.summary}
                  </p>
                </div>

                <div className="pt-3 border-t border-border/70">
                  <button className="clay-btn clay-dark w-full py-2.5 text-[13px]">
                    <span>📖 Read Edition</span> →
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Embedded Live Webpage Reader Modal */}
      {selectedEdition && (
        <div className="fixed inset-0 z-50 bg-black/55 backdrop-blur-md flex items-center justify-center p-2 sm:p-6">
          <div className="clay-lg max-w-5xl w-full h-[90vh] flex flex-col justify-between relative overflow-hidden p-2">
            {/* Modal Top Bar */}
            <div className="p-3 flex flex-wrap items-center justify-between gap-3 shrink-0">
              <div className="flex items-center gap-3 min-w-0">
                <span className="clay-chip clay-sun text-xs shrink-0">
                  {selectedEdition.issueNumber}
                </span>
                <h3 className="text-sm font-bold truncate max-w-md sm:max-w-xl">
                  {selectedEdition.title}
                </h3>
              </div>

              <div className="flex items-center gap-2.5">
                <a
                  href={selectedEdition.fullUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="clay-btn clay-plain hidden sm:inline-flex px-3.5 py-2 text-xs"
                >
                  Open External ↗
                </a>

                <button
                  onClick={() => setSelectedEdition(null)}
                  aria-label="Close reader"
                  className="clay-btn clay-plain w-9 h-9 rounded-full text-xs"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Modal Body: Embedded Live Post iFrame */}
            <div className="clay-inset flex-1 w-full relative overflow-hidden mx-1">
              <iframe
                src={selectedEdition.fullUrl}
                title={selectedEdition.title}
                className="w-full h-full border-none rounded-[1.25rem] bg-white"
                sandbox="allow-scripts allow-same-origin allow-popups"
              />
            </div>

            {/* Modal Bottom Bar */}
            <div className="p-3 flex flex-wrap items-center justify-between gap-3 text-xs font-semibold text-muted-foreground shrink-0">
              <span>🔥 Powered by Half Baked x STEP Live Edition Engine</span>
              <button
                onClick={() => setSelectedEdition(null)}
                className="clay-btn clay-dark px-4 py-2 text-xs"
              >
                Close Live Reader
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
