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
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-5 rounded-none bg-white border-2 border-stone-900 shadow-[4px_4px_0px_0px_rgba(28,25,23,1)]">
        <div>
          <h2 className="text-base font-black text-stone-900">Stage 1: Idea & Problem Discovery</h2>
          <p className="text-xs text-stone-600 font-medium">
            Select a verified problem seeded by alumni & professors, or blueprint your custom idea.
          </p>
        </div>

        <div className="flex bg-[#FAF9F5] p-1 rounded-none border-2 border-stone-900 shadow-[2px_2px_0px_0px_rgba(28,25,23,1)] w-full sm:w-auto">
          <button
            onClick={() => setActiveTab('feed')}
            className={`flex-1 sm:flex-initial text-xs font-black px-4 py-2 rounded-none transition border-2 ${
              activeTab === 'feed' ? 'bg-stone-900 text-stone-50 border-stone-900 shadow-[2px_2px_0px_0px_rgba(217,119,6,1)]' : 'bg-transparent text-stone-700 hover:text-stone-950 border-transparent'
            }`}
          >
            🌱 Seeded Issues Feed ({problems.length})
          </button>
          <button
            onClick={() => setActiveTab('custom')}
            className={`flex-1 sm:flex-initial text-xs font-black px-4 py-2 rounded-none transition border-2 ${
              activeTab === 'custom' ? 'bg-stone-900 text-stone-50 border-stone-900 shadow-[2px_2px_0px_0px_rgba(217,119,6,1)]' : 'bg-transparent text-stone-700 hover:text-stone-950 border-transparent'
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
              className="flex-1 px-4 py-2.5 rounded-none bg-white border-2 border-stone-900 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-stone-900 text-stone-900 shadow-[3px_3px_0px_0px_rgba(28,25,23,1)]"
            />
          </div>

          {loading ? (
            <div className="p-12 text-center text-stone-600 text-xs font-black animate-pulse">
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
                    className={`p-5 rounded-none border-2 transition-all flex flex-col justify-between ${
                      isSelected
                        ? 'bg-stone-900 text-stone-50 border-stone-900 shadow-[6px_6px_0px_0px_rgba(217,119,6,1)]'
                        : 'bg-white border-stone-900 text-stone-800 shadow-[4px_4px_0px_0px_rgba(28,25,23,1)] hover:shadow-[6px_6px_0px_0px_rgba(28,25,23,1)]'
                    }`}
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between gap-2">
                        <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-none border border-stone-900 ${
                          isSelected ? 'bg-amber-400 text-stone-950' : 'bg-[#FAF9F5] text-stone-900'
                        }`}>
                          {prob.category}
                        </span>
                        <span className={`text-xs font-bold ${isSelected ? 'text-stone-300' : 'text-stone-600'}`}>
                          ▲ {prob.upvotes} Founder Upvotes
                        </span>
                      </div>

                      <h3 className="text-base font-black leading-snug">{prob.title}</h3>
                      <p className={`text-xs leading-relaxed font-medium ${isSelected ? 'text-stone-300' : 'text-stone-700'}`}>
                        {prob.description}
                      </p>

                      {/* Author Tag */}
                      <div className={`text-[11px] font-bold flex items-center gap-1.5 ${isSelected ? 'text-amber-300' : 'text-stone-800'}`}>
                        <span>👤</span> Seeded by {prob.authorName} ({prob.authorRole})
                      </div>
                    </div>

                    <div className="mt-5 pt-4 border-t-2 border-stone-900 flex items-center justify-between">
                      <div className="flex flex-wrap gap-1">
                        {tags.map((t: string) => (
                          <span key={t} className={`text-[9px] font-bold px-2 py-0.5 rounded-none border border-stone-900 ${
                            isSelected ? 'bg-stone-800 text-amber-300' : 'bg-stone-100 text-stone-800'
                          }`}>
                            #{t}
                          </span>
                        ))}
                      </div>

                      <button
                        onClick={() => handleSelectProblem(prob)}
                        className={`text-xs font-black px-4 py-2 rounded-none border-2 border-stone-900 transition ${
                          isSelected
                            ? 'bg-amber-400 hover:bg-amber-500 text-stone-950 shadow-[2px_2px_0px_0px_rgba(28,25,23,1)]'
                            : 'bg-stone-900 hover:bg-stone-800 text-stone-50 shadow-[2px_2px_0px_0px_rgba(217,119,6,1)]'
                        }`}
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
              className="px-6 py-3 rounded-none bg-stone-900 hover:bg-stone-800 text-stone-50 font-black text-xs border-2 border-stone-900 shadow-[4px_4px_0px_0px_rgba(217,119,6,1)] transition"
            >
              Confirm Idea & Proceed to Validation →
            </button>
          </div>
        </div>
      ) : (
        /* Custom Blueprint Form - Rectangular Neo-Brutalist Layout */
        <form onSubmit={handleCustomSubmit} className="p-6 rounded-none bg-white border-2 border-stone-900 shadow-[6px_6px_0px_0px_rgba(28,25,23,1)] space-y-6">
          <div className="flex items-center justify-between border-b-2 border-stone-900 pb-3">
            <h3 className="text-base font-black text-stone-900 uppercase tracking-wider flex items-center gap-2">
              <span>✍️</span> BLUEPRINT CUSTOM STARTUP IDEA
            </h3>
            <span className="text-[10px] font-black px-2.5 py-0.5 rounded-none bg-amber-400 text-stone-950 border border-stone-900">
              STEP Incubator Format
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-2">
              <label className="text-xs font-black uppercase text-stone-900 flex items-center gap-1">
                <span>📌</span> Startup Title
              </label>
              <input
                type="text"
                required
                value={customIdea.title}
                onChange={(e) => setCustomIdea({ ...customIdea, title: e.target.value })}
                placeholder="e.g. Autonomous Agri-Drone Mesh Network"
                className="w-full px-4 py-3 rounded-none bg-[#FAF9F5] border-2 border-stone-900 text-xs font-semibold focus:ring-2 focus:ring-amber-400 text-stone-900 shadow-[3px_3px_0px_0px_rgba(28,25,23,1)]"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black uppercase text-stone-900 flex items-center gap-1">
                <span>🏷️</span> Category / Domain
              </label>
              <select
                value={customIdea.category}
                onChange={(e) => setCustomIdea({ ...customIdea, category: e.target.value })}
                className="w-full px-4 py-3 rounded-none bg-[#FAF9F5] border-2 border-stone-900 text-xs font-bold focus:ring-2 focus:ring-amber-400 text-stone-900 shadow-[3px_3px_0px_0px_rgba(28,25,23,1)]"
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
            <label className="text-xs font-black uppercase text-stone-900 flex items-center gap-1">
              <span>⚠️</span> Problem Statement
            </label>
            <textarea
              required
              rows={3}
              value={customIdea.problemStatement}
              onChange={(e) => setCustomIdea({ ...customIdea, problemStatement: e.target.value })}
              placeholder="Describe the specific problem or market pain point you are solving..."
              className="w-full px-4 py-3 rounded-none bg-[#FAF9F5] border-2 border-stone-900 text-xs font-medium focus:ring-2 focus:ring-amber-400 text-stone-900 shadow-[3px_3px_0px_0px_rgba(28,25,23,1)]"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-2">
              <label className="text-xs font-black uppercase text-stone-900 flex items-center gap-1">
                <span>💡</span> Proposed Solution
              </label>
              <textarea
                required
                rows={3}
                value={customIdea.proposedSolution}
                onChange={(e) => setCustomIdea({ ...customIdea, proposedSolution: e.target.value })}
                placeholder="Explain your technical solution, product, or service..."
                className="w-full px-4 py-3 rounded-none bg-[#FAF9F5] border-2 border-stone-900 text-xs font-medium focus:ring-2 focus:ring-amber-400 text-stone-900 shadow-[3px_3px_0px_0px_rgba(28,25,23,1)]"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black uppercase text-stone-900 flex items-center gap-1">
                <span>🎯</span> Target Audience / Market
              </label>
              <textarea
                required
                rows={3}
                value={customIdea.targetAudience}
                onChange={(e) => setCustomIdea({ ...customIdea, targetAudience: e.target.value })}
                placeholder="Who are your primary buyers, users, or industry partners?"
                className="w-full px-4 py-3 rounded-none bg-[#FAF9F5] border-2 border-stone-900 text-xs font-medium focus:ring-2 focus:ring-amber-400 text-stone-900 shadow-[3px_3px_0px_0px_rgba(28,25,23,1)]"
              />
            </div>
          </div>

          <div className="flex justify-end pt-3">
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-3 rounded-none bg-stone-900 hover:bg-stone-800 text-stone-50 font-black text-xs border-2 border-stone-900 shadow-[4px_4px_0px_0px_rgba(217,119,6,1)] transition active:translate-x-0.5 active:translate-y-0.5 disabled:opacity-50"
            >
              {isSubmitting ? 'Saving to STEP Database...' : 'Save Blueprint & Proceed →'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
