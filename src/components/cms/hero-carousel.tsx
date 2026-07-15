"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

type Slide = { src: string; caption?: string };

export function HeroCarousel({
  eyebrow,
  heading,
  subheading,
  ctaLabel,
  ctaHref,
  secondaryLabel,
  secondaryHref,
  slides,
  stats,
}: {
  eyebrow?: string;
  heading?: string;
  subheading?: string;
  ctaLabel?: string;
  ctaHref?: string;
  secondaryLabel?: string;
  secondaryHref?: string;
  slides: Slide[];
  stats?: { value: string; label: string }[];
}) {
  const [i, setI] = useState(0);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);
  const n = slides.length;

  useEffect(() => {
    if (n <= 1) return;
    timer.current = setInterval(() => setI((p) => (p + 1) % n), 6000);
    return () => { if (timer.current) clearInterval(timer.current); };
  }, [n]);

  function go(next: number) {
    setI((next + n) % n);
    if (timer.current) clearInterval(timer.current);
  }

  return (
    <section className="relative isolate overflow-hidden border-b border-border">
      {/* Slides */}
      <div className="absolute inset-0 -z-10">
        {slides.map((s, idx) => (
          <div
            key={idx}
            className="absolute inset-0 transition-opacity duration-1000 ease-in-out"
            style={{ opacity: idx === i ? 1 : 0 }}
            aria-hidden={idx !== i}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={s.src} alt={s.caption ?? ""} className="h-full w-full object-cover" />
          </div>
        ))}
        {/* Overlay for legibility */}
        <div className="absolute inset-0 bg-linear-to-t from-black/85 via-black/55 to-black/45" />
        <div className="absolute inset-0 bg-linear-to-r from-black/50 to-transparent" />
      </div>

      <div className="mx-auto flex min-h-[38rem] max-w-6xl flex-col justify-center px-6 py-28 text-white sm:min-h-[42rem]">
        {eyebrow && (
          <span className="reveal inline-flex w-fit items-center gap-2 rounded-full border border-white/25 bg-white/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest backdrop-blur">
            <span className="h-1.5 w-1.5 rounded-full bg-brand-accent" />
            {eyebrow}
          </span>
        )}
        <h1 className="reveal mt-6 max-w-3xl text-5xl font-semibold leading-[1.05] tracking-tight sm:text-7xl" style={{ animationDelay: "80ms" }}>
          {heading}
        </h1>
        <p className="reveal mt-6 max-w-2xl text-lg text-white/80 sm:text-xl" style={{ animationDelay: "160ms" }}>
          {subheading}
        </p>
        <div className="reveal mt-9 flex flex-wrap gap-3" style={{ animationDelay: "240ms" }}>
          {ctaHref && ctaLabel && (
            <Link href={ctaHref} className="inline-flex h-12 items-center justify-center rounded-full bg-brand px-7 text-sm font-semibold text-brand-foreground shadow-lg transition-opacity hover:opacity-90">
              {ctaLabel}
            </Link>
          )}
          {secondaryHref && secondaryLabel && (
            <Link href={secondaryHref} className="inline-flex h-12 items-center justify-center rounded-full border border-white/30 bg-white/10 px-7 text-sm font-semibold text-white backdrop-blur transition-colors hover:bg-white/20">
              {secondaryLabel}
            </Link>
          )}
        </div>

        {stats && stats.length > 0 && (
          <div className="reveal mt-16 flex flex-wrap gap-x-12 gap-y-6" style={{ animationDelay: "320ms" }}>
            {stats.map((s, idx) => (
              <div key={idx}>
                <div className="text-4xl font-semibold">{s.value}</div>
                <div className="mt-1 text-sm text-white/70">{s.label}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Controls */}
      {n > 1 && (
        <div className="absolute bottom-6 left-1/2 flex -translate-x-1/2 items-center gap-3">
          {slides.map((_, idx) => (
            <button
              key={idx}
              onClick={() => go(idx)}
              aria-label={`Go to slide ${idx + 1}`}
              className={`h-1.5 rounded-full transition-all ${idx === i ? "w-8 bg-white" : "w-2.5 bg-white/50 hover:bg-white/80"}`}
            />
          ))}
        </div>
      )}
      {slides[i]?.caption && (
        <div className="absolute bottom-5 right-6 hidden rounded-full bg-black/40 px-3 py-1 text-xs text-white/80 backdrop-blur sm:block">
          {slides[i].caption}
        </div>
      )}
    </section>
  );
}
