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
    <div className="p-6 md:p-8 rounded-none bg-[#FAF9F5] border-2 border-stone-900 shadow-[6px_6px_0px_0px_rgba(28,25,23,1)] relative overflow-hidden space-y-8">
      {/* Top Banner & Half Baked Editorial Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 border-b-2 border-stone-900 pb-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-none bg-amber-400 text-stone-950 text-xs font-black uppercase tracking-wider border-2 border-stone-900 shadow-[2px_2px_0px_0px_rgba(28,25,23,1)]">
            🔥 HALF BAKED x STEP NEWSLETTER
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-stone-900 tracking-tight">
            Vetted Startup Ideas & Campus Playbooks
          </h2>
          <p className="text-xs text-stone-700 font-medium max-w-2xl">
            In partnership with <strong>Half Baked (gethalfbaked.com)</strong> — join 100,000+ indie builders, student founders & VCs getting unbaked business ideas and growth breakdowns delivered weekly.
          </p>
        </div>

        <a
          href="https://gethalfbaked.com"
          target="_blank"
          rel="noopener noreferrer"
          className="px-5 py-2.5 rounded-none bg-stone-900 hover:bg-stone-800 text-stone-50 text-xs font-bold transition flex items-center gap-2 border-2 border-stone-900 shadow-[3px_3px_0px_0px_rgba(217,119,6,1)] shrink-0"
        >
          <span>🌐 Visit gethalfbaked.com</span> ↗
        </a>
      </div>

      {/* Subscribe Input Form styled like beehiiv / Half Baked */}
      <div className="p-6 rounded-none bg-white border-2 border-stone-900 shadow-[4px_4px_0px_0px_rgba(28,25,23,1)] flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="space-y-1 w-full sm:w-auto">
          <h3 className="text-sm font-black text-stone-900">Get Unbaked Ideas in Your Inbox</h3>
          <p className="text-xs text-stone-600">Every Tuesday: 3 new vetted startup ideas + 1 growth playbook.</p>
        </div>

        {subscribed ? (
          <div className="px-4 py-2 rounded-none bg-emerald-100 border-2 border-emerald-900 text-emerald-950 text-xs font-bold shadow-[2px_2px_0px_0px_rgba(6,78,59,1)]">
            🎉 You’re subscribed to Half Baked x STEP Edition!
          </div>
        ) : (
          <form onSubmit={handleSubscribe} className="flex w-full sm:w-auto gap-2">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your student email..."
              className="px-4 py-2.5 rounded-none border-2 border-stone-900 text-xs focus:ring-2 focus:ring-stone-900 text-stone-900 font-semibold w-full sm:w-64"
            />
            <button
              type="submit"
              className="px-5 py-2.5 rounded-none bg-amber-400 hover:bg-amber-500 text-stone-950 font-black text-xs transition border-2 border-stone-900 shadow-[3px_3px_0px_0px_rgba(28,25,23,1)] active:translate-x-0.5 active:translate-y-0.5 shrink-0"
            >
              Subscribe Free
            </button>
          </form>
        )}
      </div>

      {/* Filter & Live Search Bar for Real Editions */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <h3 className="text-xs font-black uppercase tracking-wider text-stone-900 flex items-center gap-2">
            <span>📰</span> LATEST HALF BAKED EDITIONS ({editions.length})
          </h3>

          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="🔍 Search editions (B-Roll, Private Tutors, AI Audits, Dating...)"
            className="px-3.5 py-1.5 rounded-none border-2 border-stone-900 text-xs bg-white text-stone-900 font-semibold w-full sm:w-80 shadow-[2px_2px_0px_0px_rgba(28,25,23,1)]"
          />
        </div>

        {loading ? (
          <div className="p-8 text-center text-stone-600 text-xs font-black animate-pulse">
            Fetching Live Half Baked Newsletter Editions from gethalfbaked.com API...
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {editions.map((issue) => (
              <div
                key={issue.id}
                onClick={() => setSelectedEdition(issue)}
                className="p-5 rounded-none bg-white border-2 border-stone-900 hover:border-amber-500 transition-all flex flex-col justify-between group space-y-4 shadow-[4px_4px_0px_0px_rgba(28,25,23,1)] hover:shadow-[6px_6px_0px_0px_rgba(217,119,6,1)] hover:-translate-y-0.5 cursor-pointer"
              >
                <div className="space-y-3">
                  <div className="flex justify-between items-center text-[10px] font-bold">
                    <span className="px-2 py-0.5 rounded-none bg-amber-400 text-stone-950 border border-stone-900 font-black">
                      {issue.issueNumber}
                    </span>
                    <span className="text-stone-500 font-semibold">{issue.date}</span>
                  </div>

                  <h4 className="text-xs font-black text-stone-900 group-hover:text-amber-800 transition leading-snug line-clamp-2">
                    {issue.title}
                  </h4>

                  <p className="text-[11px] text-stone-600 font-medium leading-relaxed line-clamp-3">
                    {issue.summary}
                  </p>
                </div>

                <div className="pt-3 border-t-2 border-stone-900">
                  <button className="w-full py-2 rounded-none bg-stone-900 group-hover:bg-amber-400 group-hover:text-stone-950 text-stone-50 text-[11px] font-black transition border border-stone-900 shadow-[2px_2px_0px_0px_rgba(28,25,23,1)] flex items-center justify-center gap-1.5">
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
        <div className="fixed inset-0 z-50 bg-stone-950/85 backdrop-blur-md flex items-center justify-center p-2 sm:p-6">
          <div className="bg-[#FAF9F5] border-4 border-stone-900 rounded-none max-w-5xl w-full h-[90vh] flex flex-col justify-between shadow-[16px_16px_0px_0px_rgba(28,25,23,1)] relative overflow-hidden">
            {/* Modal Top Bar */}
            <div className="p-4 bg-white border-b-2 border-stone-900 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <span className="px-2.5 py-0.5 rounded-none bg-amber-400 text-stone-950 border border-stone-900 text-xs font-black">
                  {selectedEdition.issueNumber}
                </span>
                <div>
                  <h3 className="text-sm font-black text-stone-900 truncate max-w-md sm:max-w-xl">
                    {selectedEdition.title}
                  </h3>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <a
                  href={selectedEdition.fullUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hidden sm:inline-flex px-3 py-1 rounded-none bg-stone-100 hover:bg-stone-200 text-stone-900 text-xs font-bold border border-stone-900"
                >
                  Open External ↗
                </a>

                <button
                  onClick={() => setSelectedEdition(null)}
                  className="w-8 h-8 rounded-none bg-stone-900 text-stone-50 font-black text-xs border border-stone-900 hover:bg-amber-400 hover:text-stone-950 transition"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Modal Body: Embedded Live Post iFrame */}
            <div className="flex-1 w-full bg-white relative">
              <iframe
                src={selectedEdition.fullUrl}
                title={selectedEdition.title}
                className="w-full h-full border-none"
                sandbox="allow-scripts allow-same-origin allow-popups"
              />
            </div>

            {/* Modal Bottom Bar */}
            <div className="p-3 bg-[#FAF9F5] border-t-2 border-stone-900 flex items-center justify-between text-xs font-bold text-stone-700 shrink-0">
              <span>🔥 Powered by Half Baked x STEP Live Edition Engine</span>
              <button
                onClick={() => setSelectedEdition(null)}
                className="px-4 py-1.5 rounded-none bg-stone-900 text-stone-50 hover:bg-amber-400 hover:text-stone-950 font-black text-xs transition border border-stone-900 shadow-[2px_2px_0px_0px_rgba(28,25,23,1)]"
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
