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
    <div className="min-h-screen bg-background text-foreground font-sans pb-24">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-[#FAF9F6]/90 backdrop-blur-md border-b border-border/70 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/playground"
              className="text-xs font-semibold text-muted-foreground hover:text-foreground transition flex items-center gap-1"
            >
              ← Back to Playground Workspace
            </Link>
            <span className="text-muted-foreground">•</span>
            <span className="text-xs font-bold uppercase tracking-wider text-foreground/80">
              System Docs & Execution Guide
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/playground"
              className="clay-btn clay-dark text-xs px-4 py-2.5"
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
          <div className="clay p-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-3">
              Learning Modules
            </h3>
            {loading ? (
              <div className="text-xs text-muted-foreground animate-pulse">Loading guides...</div>
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
                          ? 'clay-sm clay-dark'
                          : 'text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      <div className="truncate">{doc.title}</div>
                      <div
                        className={`text-xs truncate mt-0.5 ${
                          isActive ? 'opacity-70' : 'text-muted-foreground'
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

          <div className="clay clay-sun p-4 space-y-2">
            <h4 className="text-sm font-bold flex items-center gap-1.5">
              <span>💡</span> Need Technical Support?
            </h4>
            <p className="text-xs leading-relaxed font-medium opacity-80">
              Join STEP IIT Kharagpur office hours every Wednesday at 4 PM in the Science Park building.
            </p>
          </div>
        </aside>

        {/* Documentation Content Viewer */}
        <section className="md:col-span-3">
          {activeDoc ? (
            <article className="clay-lg p-6 md:p-8 space-y-6">
              <div className="border-b border-border/70 pb-4">
                <span className="clay-chip clay-soft text-xs uppercase tracking-wider">
                  CATEGORY: {activeDoc.category}
                </span>
                <h1 className="text-2xl font-bold tracking-tight text-foreground mt-2">
                  {activeDoc.title}
                </h1>
                <p className="text-sm text-muted-foreground font-medium mt-1">
                  {activeDoc.summary}
                </p>
              </div>

              {/* Clean Markdown Rendering */}
              <div className="prose prose-stone max-w-none text-xs leading-relaxed space-y-4 font-medium">
                {activeDoc.content.split('\n\n').map((paragraph, idx) => {
                  if (paragraph.startsWith('# ')) {
                    return (
                      <h2 key={idx} className="text-lg font-extrabold text-foreground pt-2">
                        {paragraph.replace('# ', '')}
                      </h2>
                    );
                  }
                  if (paragraph.startsWith('## ')) {
                    return (
                      <h3 key={idx} className="text-base font-bold text-foreground pt-1">
                        {paragraph.replace('## ', '')}
                      </h3>
                    );
                  }
                  if (paragraph.startsWith('### ')) {
                    return (
                      <h4 key={idx} className="text-sm font-bold text-foreground">
                        {paragraph.replace('### ', '')}
                      </h4>
                    );
                  }
                  if (paragraph.startsWith('```')) {
                    const code = paragraph.replace(/```[a-z]*/g, '').trim();
                    return (
                      <pre key={idx} className="clay-sm clay-dark p-3.5 font-mono text-[13px] overflow-x-auto">
                        <code>{code}</code>
                      </pre>
                    );
                  }
                  return (
                    <p key={idx} className="text-foreground/80 leading-relaxed">
                      {paragraph}
                    </p>
                  );
                })}
              </div>
            </article>
          ) : (
            <div className="p-12 text-center text-muted-foreground font-medium">
              Select a documentation module from the left navigation bar.
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
