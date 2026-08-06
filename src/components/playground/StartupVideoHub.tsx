'use client';

import React, { useState } from 'react';

type VideoItem = {
  id: string;
  title: string;
  category: string;
  duration: string;
  youtubeUrl: string;
  embedId: string;
  thumbnail: string;
  description: string;
};

const VIDEOS: VideoItem[] = [
  {
    id: '1',
    title: 'How to Find & Validate Startup Ideas',
    category: 'Stage 1: Validation',
    duration: '32:21',
    youtubeUrl: 'https://www.youtube.com/watch?v=Th8JoIan4dg',
    embedId: 'Th8JoIan4dg',
    thumbnail: 'https://img.youtube.com/vi/Th8JoIan4dg/hqdefault.jpg',
    description: 'Y Combinator Partner Jared Friedman breaks down how to evaluate market demand and solve real problems.',
  },
  {
    id: '2',
    title: 'How to Talk to Users & Conduct Market Research',
    category: 'Stage 2: Customer Interviews',
    duration: '31:37',
    youtubeUrl: 'https://www.youtube.com/watch?v=MT4Ig2uqjTc',
    embedId: 'MT4Ig2uqjTc',
    thumbnail: 'https://img.youtube.com/vi/MT4Ig2uqjTc/hqdefault.jpg',
    description: 'YC partner Eric Migicovsky on how to run user interviews that surface honest feedback.',
  },
  {
    id: '3',
    title: 'How to Calculate TAM, SAM & SOM Market Sizing',
    category: 'Stage 3: Financial BI',
    duration: '8:28',
    youtubeUrl: 'https://www.youtube.com/watch?v=j7wwVo-zJ3c',
    embedId: 'j7wwVo-zJ3c',
    thumbnail: 'https://img.youtube.com/vi/j7wwVo-zJ3c/hqdefault.jpg',
    description: 'Walkthrough of top-down versus bottom-up market estimation, and when each holds up.',
  },
  {
    id: '4',
    title: 'How to Pitch Your Seed Stage Startup',
    category: 'Stage 5: VC Pitch',
    duration: '29:26',
    youtubeUrl: 'https://www.youtube.com/watch?v=lw2X3PxKlAY',
    embedId: 'lw2X3PxKlAY',
    thumbnail: 'https://img.youtube.com/vi/lw2X3PxKlAY/hqdefault.jpg',
    description: "YC's Michael Seibel on what a seed pitch has to say, and in what order.",
  },
];

export default function StartupVideoHub() {
  const [activeVideo, setActiveVideo] = useState<VideoItem | null>(null);

  return (
    <div className="clay-lg p-6 md:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-border/70 pb-4">
        <div className="space-y-1.5">
          <span className="clay-chip clay-sun text-xs uppercase tracking-wider">
            📺 STEP Founder Academy
          </span>
          <h2 className="text-xl font-extrabold tracking-tight">
            Founder Masterclasses &amp; Course Hub
          </h2>
          <p className="text-xs text-muted-foreground font-medium">
            Curated founder talks covering every stage of the incubation journey.
          </p>
        </div>
      </div>

      {/* Video Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {VIDEOS.map((video) => (
          <div
            key={video.id}
            onClick={() => setActiveVideo(video)}
            className="clay clay-hover clay-plain p-3.5 cursor-pointer flex flex-col justify-between group"
          >
            <div className="space-y-3">
              {/* Thumbnail Container */}
              <div className="clay-inset relative aspect-video overflow-hidden rounded-2xl">
                <img
                  src={video.thumbnail}
                  alt={video.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  // A pulled or renamed video serves a 120x90 grey placeholder rather
                  // than a 404, so it fails silently. Drop to the lower-res still,
                  // which survives more often, and only then give up.
                  onError={(e) => {
                    const img = e.currentTarget;
                    const fallback = `https://img.youtube.com/vi/${video.embedId}/mqdefault.jpg`;
                    if (img.src !== fallback) {
                      img.src = fallback;
                    } else {
                      img.style.display = 'none';
                    }
                  }}
                />
                <div className="absolute inset-0 bg-black/25 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                  <div className="clay-sm clay-primary w-11 h-11 rounded-full flex items-center justify-center text-sm group-hover:scale-110 transition-transform">
                    ▶
                  </div>
                </div>
                <span className="absolute bottom-2 right-2 text-[11px] font-semibold bg-black/55 text-white px-2 py-0.5 rounded-full backdrop-blur">
                  {video.duration}
                </span>
              </div>

              <span className="clay-chip clay-sky text-xs">
                {video.category}
              </span>

              <h3 className="text-sm font-bold group-hover:text-brand transition line-clamp-2 leading-snug">
                {video.title}
              </h3>

              <p className="text-[13px] text-muted-foreground font-medium line-clamp-2 leading-relaxed">
                {video.description}
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-border/70 flex items-center justify-between text-xs font-bold">
              <span>Watch Video</span>
              <span className="group-hover:translate-x-1 transition">→</span>
            </div>
          </div>
        ))}
      </div>

      {/* Embedded Video Modal */}
      {activeVideo && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="clay-lg max-w-3xl w-full p-6 space-y-4">
            <div className="flex justify-between items-start gap-3 border-b border-border/70 pb-3">
              <div className="space-y-1.5">
                <span className="clay-chip clay-sun text-xs uppercase">
                  {activeVideo.category}
                </span>
                <h3 className="text-sm font-bold">{activeVideo.title}</h3>
              </div>
              <button
                onClick={() => setActiveVideo(null)}
                aria-label="Close video"
                className="clay-btn clay-plain w-9 h-9 shrink-0 rounded-full text-xs"
              >
                ✕
              </button>
            </div>

            <div className="clay-inset aspect-video w-full overflow-hidden rounded-2xl">
              <iframe
                src={`https://www.youtube.com/embed/${activeVideo.embedId}?autoplay=1`}
                title={activeVideo.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-full"
              />
            </div>

            <div className="flex flex-wrap justify-between items-center gap-3 text-xs font-medium text-muted-foreground">
              <p>{activeVideo.description}</p>
              <a
                href={activeVideo.youtubeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="clay-btn clay-primary px-4 py-2 text-xs shrink-0"
              >
                Open on YouTube ↗
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
