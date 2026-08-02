'use client';

import React, { useState, useEffect } from 'react';
import { StartupIdeaState } from '@/app/(public)/playground/page';

type Props = {
  ideaState: StartupIdeaState;
  setIdeaState: React.Dispatch<React.SetStateAction<StartupIdeaState>>;
  onNext: () => void;
};

export default function SeededProblemFeed({ ideaState, setIdeaState, onNext }: Props) {
  const [activeTab, setActiveTab] = useState<'feed' | 'custom'>('feed');
  const [problems, setProblems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [customIdea, setCustomIdea] = useState({
    title: ideaState.title,
    category: ideaState.category,
    problemStatement: ideaState.problemStatement,
    proposedSolution: ideaState.proposedSolution,
    targetAudience: ideaState.targetAudience,
  });

  const fetchProblems = async (query = '') => {
    setLoading(true);
    try {
      const res = await fetch(`/api/playground/problems${query ? `?q=${encodeURIComponent(query)}` : ''}`);
      const data = await res.json();
      if (data.success) {
        setProblems(data.data);
      }
    } catch (err) {
      console.error('Failed to fetch seeded problems:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProblems(searchQuery);
  }, [searchQuery]);

  const handleSelectProblem = (prob: any) => {
    let parsedTags: string[] = [];
    try {
      parsedTags = typeof prob.tags === 'string' ? JSON.parse(prob.tags) : prob.tags;
    } catch (e) {
      parsedTags = [];
    }

    setIdeaState((prev) => ({
      ...prev,
      id: prob.id,
      title: prob.title,
      category: prob.category,
      problemStatement: prob.description,
      proposedSolution: prev.proposedSolution || 'AI-assisted solution under active design.',
    }));
  };

  const handleCustomSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/playground/problems', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: customIdea.title,
          category: customIdea.category,
          description: customIdea.problemStatement,
          authorName: 'Student Founder',
          authorRole: 'IIT KGP Incubatee',
          tags: [customIdea.category],
        }),
      });

      const data = await res.json();

      setIdeaState((prev) => ({
        ...prev,
        title: customIdea.title,
        category: customIdea.category,
        problemStatement: customIdea.problemStatement,
        proposedSolution: customIdea.proposedSolution,
        targetAudience: customIdea.targetAudience,
      }));

      onNext();
    } catch (err) {
      alert('Error saving custom idea to backend!');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Sub-Header Mode Switcher */}
      <div className="clay flex flex-col sm:flex-row items-center justify-between gap-4 p-5">
        <div>
          <h2 className="text-base font-bold">Stage 1: Idea &amp; Problem Discovery</h2>
          <p className="text-xs text-muted-foreground font-medium">
            Select a verified problem seeded by alumni &amp; professors, or blueprint your custom idea.
          </p>
        </div>

        <div className="clay-inset flex gap-1 p-1.5 rounded-[1rem] w-full sm:w-auto">
          <button
            onClick={() => setActiveTab('feed')}
            className={`flex-1 sm:flex-initial text-xs font-semibold px-4 py-2 rounded-xl transition ${
              activeTab === 'feed' ? 'clay-sm clay-dark' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            🌱 Seeded Issues Feed ({problems.length})
          </button>
          <button
            onClick={() => setActiveTab('custom')}
            className={`flex-1 sm:flex-initial text-xs font-semibold px-4 py-2 rounded-xl transition ${
              activeTab === 'custom' ? 'clay-sm clay-dark' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            ✍️ Custom Blueprint
          </button>
        </div>
      </div>

      {activeTab === 'feed' ? (
        <div className="space-y-4">
          {/* Search Bar */}
          <div className="flex gap-2">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="🔍 Search seeded problems by keyword, domain (AgriTech, Robotics, MedTech...)..."
              className="clay-field flex-1 text-xs font-medium"
            />
          </div>

          {loading ? (
            <div className="clay-inset p-12 text-center text-muted-foreground text-xs font-semibold animate-pulse">
              Loading Seeded Problems from STEP Database...
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {problems.map((prob) => {
                const isSelected = ideaState.title === prob.title;
                let tags: string[] = [];
                try {
                  tags = typeof prob.tags === 'string' ? JSON.parse(prob.tags) : prob.tags;
                } catch (e) {
                  tags = [];
                }

                return (
                  <div
                    key={prob.id}
                    className={`clay clay-hover p-5 flex flex-col justify-between ${
                      isSelected ? 'clay-dark' : 'clay-plain'
                    }`}
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between gap-2">
                        <span className={`clay-chip text-xs ${isSelected ? 'clay-sun' : 'clay-soft'}`}>
                          {prob.category}
                        </span>
                        <span className="text-xs font-semibold opacity-70">
                          ▲ {prob.upvotes} Founder Upvotes
                        </span>
                      </div>

                      <h3 className="text-base font-bold leading-snug">{prob.title}</h3>
                      <p className="text-xs leading-relaxed font-medium opacity-75">
                        {prob.description}
                      </p>

                      {/* Author Tag */}
                      <div className="text-[13px] font-semibold flex items-center gap-1.5 opacity-80">
                        <span>👤</span> Seeded by {prob.authorName} ({prob.authorRole})
                      </div>
                    </div>

                    <div className={`mt-5 pt-4 border-t ${isSelected ? 'border-white/15' : 'border-border/70'} flex flex-wrap items-center justify-between gap-3`}>
                      <div className="flex flex-wrap gap-1.5">
                        {tags.map((t: string) => (
                          <span key={t} className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                            isSelected ? 'bg-white/12' : 'bg-black/6'
                          }`}>
                            #{t}
                          </span>
                        ))}
                      </div>

                      <button
                        onClick={() => handleSelectProblem(prob)}
                        className={`clay-btn text-xs px-4 py-2 ${isSelected ? 'clay-sun' : 'clay-primary'}`}
                      >
                        {isSelected ? '✓ Selected Idea' : 'Select Idea'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <div className="flex justify-end pt-4">
            <button
              onClick={onNext}
              className="clay-btn clay-primary px-6 py-3 text-xs"
            >
              Confirm Idea &amp; Proceed to Validation →
            </button>
          </div>
        </div>
      ) : (
        /* Custom Blueprint Form */
        <form onSubmit={handleCustomSubmit} className="clay p-6 space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/70 pb-3">
            <h3 className="text-base font-bold flex items-center gap-2">
              <span>✍️</span> Blueprint a custom startup idea
            </h3>
            <span className="clay-chip clay-sun text-xs">
              STEP Incubator Format
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-2">
              <label className="text-xs font-bold text-foreground flex items-center gap-1.5">
                <span>📌</span> Startup Title
              </label>
              <input
                type="text"
                required
                value={customIdea.title}
                onChange={(e) => setCustomIdea({ ...customIdea, title: e.target.value })}
                placeholder="e.g. Autonomous Agri-Drone Mesh Network"
                className="clay-field text-xs font-semibold"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-foreground flex items-center gap-1.5">
                <span>🏷️</span> Category / Domain
              </label>
              <select
                value={customIdea.category}
                onChange={(e) => setCustomIdea({ ...customIdea, category: e.target.value })}
                className="clay-field text-xs font-semibold"
              >
                <option value="DeepTech / Robotics">DeepTech / Robotics</option>
                <option value="MedTech / BioTech">MedTech / BioTech</option>
                <option value="CleanTech / Energy">CleanTech / Energy</option>
                <option value="FinTech / SaaS">FinTech / SaaS</option>
                <option value="EdTech / AI">EdTech / AI</option>
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-foreground flex items-center gap-1.5">
              <span>⚠️</span> Problem Statement
            </label>
            <textarea
              required
              rows={3}
              value={customIdea.problemStatement}
              onChange={(e) => setCustomIdea({ ...customIdea, problemStatement: e.target.value })}
              placeholder="Describe the specific problem or market pain point you are solving..."
              className="clay-field text-xs font-medium"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-2">
              <label className="text-xs font-bold text-foreground flex items-center gap-1.5">
                <span>💡</span> Proposed Solution
              </label>
              <textarea
                required
                rows={3}
                value={customIdea.proposedSolution}
                onChange={(e) => setCustomIdea({ ...customIdea, proposedSolution: e.target.value })}
                placeholder="Explain your technical solution, product, or service..."
                className="clay-field text-xs font-medium"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-foreground flex items-center gap-1.5">
                <span>🎯</span> Target Audience / Market
              </label>
              <textarea
                required
                rows={3}
                value={customIdea.targetAudience}
                onChange={(e) => setCustomIdea({ ...customIdea, targetAudience: e.target.value })}
                placeholder="Who are your primary buyers, users, or industry partners?"
                className="clay-field text-xs font-medium"
              />
            </div>
          </div>

          <div className="flex justify-end pt-3">
            <button
              type="submit"
              disabled={isSubmitting}
              className="clay-btn clay-primary px-6 py-3 text-xs"
            >
              {isSubmitting ? 'Saving to STEP Database...' : 'Save Blueprint & Proceed →'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
