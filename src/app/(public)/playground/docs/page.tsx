'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';

type Doc = {
  id: string;
  slug: string;
  title: string;
  category: string;
  summary: string;
  content: string;
  order: number;
};

export default function PlaygroundDocsPage() {
  const [docs, setDocs] = useState<Doc[]>([]);
  const [activeSlug, setActiveSlug] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDocs() {
      try {
        const res = await fetch('/api/docs');
        const data = await res.json();
        if (Array.isArray(data)) {
          setDocs(data);
          if (data.length > 0) {
            setActiveSlug(data[0].slug);
          }
        }
      } catch (err) {
        console.error('Failed to load docs:', err);
      } finally {
        setLoading(false);
      }
    }
    loadDocs();
  }, []);

  const activeDoc = docs.find((d) => d.slug === activeSlug);

  return (
    <div className="min-h-screen bg-[#FAF9F6] text-stone-900 font-sans selection:bg-stone-900 selection:text-stone-50 pb-24">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-[#FAF9F6]/90 backdrop-blur-md border-b border-stone-200 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/playground"
              className="text-xs font-semibold text-stone-600 hover:text-stone-900 transition flex items-center gap-1"
            >
              ← Back to Playground Workspace
            </Link>
            <span className="text-stone-300">•</span>
            <span className="text-xs font-bold uppercase tracking-wider text-stone-700">
              System Docs & Execution Guide
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/playground"
              className="text-xs font-bold px-3 py-1.5 rounded-lg bg-stone-900 text-stone-50 hover:bg-stone-800 transition"
            >
              Open Interactive Topology Canvas →
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content Layout */}
      <main className="max-w-7xl mx-auto px-4 md:px-6 pt-8 grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Sidebar Navigation */}
        <aside className="md:col-span-1 space-y-4">
          <div className="p-4 rounded-xl bg-white border border-stone-200 shadow-xs">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-stone-500 mb-3">
              Learning Modules
            </h3>
            {loading ? (
              <div className="text-xs text-stone-400 animate-pulse">Loading guides...</div>
            ) : (
              <nav className="space-y-1">
                {docs.map((doc) => {
                  const isActive = doc.slug === activeSlug;
                  return (
                    <button
                      key={doc.id}
                      onClick={() => setActiveSlug(doc.slug)}
                      className={`w-full text-left text-xs font-bold p-2.5 rounded-lg transition-all ${
                        isActive
                          ? 'bg-stone-900 text-stone-50 shadow-xs'
                          : 'text-stone-700 hover:bg-stone-100'
                      }`}
                    >
                      <div className="truncate">{doc.title}</div>
                      <div
                        className={`text-[10px] truncate mt-0.5 ${
                          isActive ? 'text-stone-300' : 'text-stone-500'
                        }`}
                      >
                        {doc.summary}
                      </div>
                    </button>
                  );
                })}
              </nav>
            )}
          </div>

          <div className="p-4 rounded-xl bg-amber-50/80 border border-amber-200 text-amber-900 space-y-2">
            <h4 className="text-xs font-bold flex items-center gap-1.5">
              <span>💡</span> Need Technical Support?
            </h4>
            <p className="text-xs leading-relaxed text-amber-800 font-medium">
              Join STEP IIT Kharagpur office hours every Wednesday at 4 PM in the Science Park building.
            </p>
          </div>
        </aside>

        {/* Documentation Content Viewer */}
        <section className="md:col-span-3">
          {activeDoc ? (
            <article className="p-6 md:p-8 rounded-xl bg-white border border-stone-200 shadow-xs space-y-6">
              <div className="border-b border-stone-200 pb-4">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded bg-stone-100 text-stone-700">
                  CATEGORY: {activeDoc.category}
                </span>
                <h1 className="text-2xl font-black tracking-tight text-stone-900 mt-2">
                  {activeDoc.title}
                </h1>
                <p className="text-sm text-stone-600 font-medium mt-1">
                  {activeDoc.summary}
                </p>
              </div>

              {/* Clean Markdown Rendering */}
              <div className="prose prose-stone max-w-none text-xs leading-relaxed space-y-4 font-medium">
                {activeDoc.content.split('\n\n').map((paragraph, idx) => {
                  if (paragraph.startsWith('# ')) {
                    return (
                      <h2 key={idx} className="text-lg font-extrabold text-stone-900 pt-2">
                        {paragraph.replace('# ', '')}
                      </h2>
                    );
                  }
                  if (paragraph.startsWith('## ')) {
                    return (
                      <h3 key={idx} className="text-base font-bold text-stone-800 pt-1">
                        {paragraph.replace('## ', '')}
                      </h3>
                    );
                  }
                  if (paragraph.startsWith('### ')) {
                    return (
                      <h4 key={idx} className="text-sm font-bold text-stone-800">
                        {paragraph.replace('### ', '')}
                      </h4>
                    );
                  }
                  if (paragraph.startsWith('```')) {
                    const code = paragraph.replace(/```[a-z]*/g, '').trim();
                    return (
                      <pre key={idx} className="p-3 rounded-lg bg-stone-900 text-stone-100 font-mono text-[11px] overflow-x-auto">
                        <code>{code}</code>
                      </pre>
                    );
                  }
                  return (
                    <p key={idx} className="text-stone-700 leading-relaxed">
                      {paragraph}
                    </p>
                  );
                })}
              </div>
            </article>
          ) : (
            <div className="p-12 text-center text-stone-500 font-medium">
              Select a documentation module from the left navigation bar.
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
