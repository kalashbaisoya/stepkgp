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
    duration: '15:20',
    youtubeUrl: 'https://www.youtube.com/watch?v=Th8JoIan4dg',
    embedId: 'Th8JoIan4dg',
    thumbnail: 'https://img.youtube.com/vi/Th8JoIan4dg/hqdefault.jpg',
    description: 'Y Combinator Partner Jared Friedman breaks down how to evaluate market demand and solve real problems.',
  },
  {
    id: '2',
    title: 'How to Talk to Users & Conduct Market Research',
    category: 'Stage 2: Customer Interviews',
    duration: '21:45',
    youtubeUrl: 'https://www.youtube.com/watch?v=MT4Hg8E0jL0',
    embedId: 'MT4Hg8E0jL0',
    thumbnail: 'https://img.youtube.com/vi/MT4Hg8E0jL0/hqdefault.jpg',
    description: 'Learn the Mom Test framework to extract honest feedback without bias.',
  },
  {
    id: '3',
    title: 'How to Calculate TAM, SAM & SOM Market Sizing',
    category: 'Stage 3: Financial BI',
    duration: '18:10',
    youtubeUrl: 'https://www.youtube.com/watch?v=gTj-xQ2-0Z8',
    embedId: 'gTj-xQ2-0Z8',
    thumbnail: 'https://img.youtube.com/vi/gTj-xQ2-0Z8/hqdefault.jpg',
    description: 'Step-by-step masterclass on bottom-up vs top-down market estimation for VCs.',
  },
  {
    id: '4',
    title: 'How to Write a Pitch Deck that Raises $1M+',
    category: 'Stage 5: VC Pitch',
    duration: '24:05',
    youtubeUrl: 'https://www.youtube.com/watch?v=Xvnt51qYl8w',
    embedId: 'Xvnt51qYl8w',
    thumbnail: 'https://img.youtube.com/vi/Xvnt51qYl8w/hqdefault.jpg',
    description: 'Teardown of successful seed pitch decks with slide-by-slide breakdowns.',
  },
];

export default function StartupVideoHub() {
  const [activeVideo, setActiveVideo] = useState<VideoItem | null>(null);

  return (
    <div className="p-6 md:p-8 rounded-none bg-white border-2 border-stone-900 shadow-[6px_6px_0px_0px_rgba(28,25,23,1)] space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b-2 border-stone-900 pb-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-none bg-amber-400 text-stone-950 text-[10px] font-black uppercase tracking-wider border-2 border-stone-900 shadow-[2px_2px_0px_0px_rgba(28,25,23,1)] mb-1">
            📺 STEP FOUNDER ACADEMY
          </div>
          <h2 className="text-xl font-black text-stone-900 tracking-tight">
            Founder Masterclasses & Course Hub
          </h2>
          <p className="text-xs text-stone-600 font-medium">
            Curated Y Combinator & Stanford founder talks covering every stage of the incubation journey.
          </p>
        </div>
      </div>

      {/* Video Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {VIDEOS.map((video) => (
          <div
            key={video.id}
            onClick={() => setActiveVideo(video)}
            className="p-3.5 rounded-none bg-[#FAF9F5] border-2 border-stone-900 hover:border-amber-500 transition-all cursor-pointer flex flex-col justify-between group shadow-[4px_4px_0px_0px_rgba(28,25,23,1)] hover:shadow-[6px_6px_0px_0px_rgba(217,119,6,1)] hover:-translate-y-0.5"
          >
            <div className="space-y-3">
              {/* Thumbnail Container */}
              <div className="relative aspect-video rounded-none overflow-hidden border-2 border-stone-900 bg-stone-950">
                <img
                  src={video.thumbnail}
                  alt={video.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 opacity-90 group-hover:opacity-100"
                />
                <div className="absolute inset-0 bg-stone-950/20 group-hover:bg-stone-950/0 transition-colors flex items-center justify-center">
                  <div className="w-10 h-10 rounded-none bg-amber-400 text-stone-950 border-2 border-stone-900 flex items-center justify-center text-sm font-black shadow-[2px_2px_0px_0px_rgba(28,25,23,1)] group-hover:scale-110 transition-transform">
                    ▶
                  </div>
                </div>
                <span className="absolute bottom-2 right-2 text-[9px] font-black bg-stone-900 text-stone-50 px-2 py-0.5 rounded-none border border-stone-900">
                  {video.duration}
                </span>
              </div>

              <span className="text-[10px] font-black px-2 py-0.5 rounded-none bg-stone-900 text-stone-50 border border-stone-900 inline-block">
                {video.category}
              </span>

              <h3 className="text-xs font-black text-stone-900 group-hover:text-amber-800 transition line-clamp-2 leading-snug">
                {video.title}
              </h3>

              <p className="text-[11px] text-stone-600 font-medium line-clamp-2 leading-relaxed">
                {video.description}
              </p>
            </div>

            <div className="mt-4 pt-3 border-t-2 border-stone-900 flex items-center justify-between text-[10px] font-black text-stone-900">
              <span>Watch Video</span>
              <span className="group-hover:translate-x-1 transition">→</span>
            </div>
          </div>
        ))}
      </div>

      {/* Embedded Video Modal */}
      {activeVideo && (
        <div className="fixed inset-0 z-50 bg-stone-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#FAF9F5] border-4 border-stone-900 rounded-none max-w-3xl w-full p-6 space-y-4 shadow-[12px_12px_0px_0px_rgba(28,25,23,1)]">
            <div className="flex justify-between items-center border-b-2 border-stone-900 pb-3">
              <div>
                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-none bg-amber-400 text-stone-950 border border-stone-900">
                  {activeVideo.category}
                </span>
                <h3 className="text-sm font-black text-stone-900 mt-1">{activeVideo.title}</h3>
              </div>
              <button
                onClick={() => setActiveVideo(null)}
                className="w-8 h-8 rounded-none bg-stone-900 text-stone-50 font-black text-xs border border-stone-900 hover:bg-amber-400 hover:text-stone-950 transition"
              >
                ✕
              </button>
            </div>

            <div className="aspect-video w-full rounded-none overflow-hidden border-2 border-stone-900 shadow-md">
              <iframe
                src={`https://www.youtube.com/embed/${activeVideo.embedId}?autoplay=1`}
                title={activeVideo.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-full"
              />
            </div>

            <div className="flex justify-between items-center text-xs font-semibold text-stone-700">
              <p>{activeVideo.description}</p>
              <a
                href={activeVideo.youtubeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 rounded-none bg-stone-900 text-stone-50 font-black text-xs hover:bg-amber-400 hover:text-stone-950 transition shrink-0 border border-stone-900"
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
