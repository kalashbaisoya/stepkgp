"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

/**
 * Company logo with a graceful fallback: if the remote logo fails to load
 * (or none is set) we render a branded monogram instead of a broken image.
 */
export function CompanyLogo({
  name,
  src,
  className,
}: {
  name: string;
  src?: string | null;
  className?: string;
}) {
  const [failed, setFailed] = useState(false);
  const showImg = src && !failed;

  // The img is server-rendered, so the browser may finish (and fail) the request
  // before React hydrates and attaches onError. That error is never dispatched to
  // us, and a broken glyph sticks forever. Re-check on mount: a finished image
  // with no intrinsic width is a failed one.
  const checkOnMount = (node: HTMLImageElement | null) => {
    if (node?.complete && node.naturalWidth === 0) setFailed(true);
  };

  return (
    <div
      className={cn(
        "clay-sm flex shrink-0 items-center justify-center overflow-hidden bg-surface",
        className ?? "h-12 w-12",
      )}
    >
      {showImg ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          ref={checkOnMount}
          src={src}
          alt={`${name} logo`}
          className="h-full w-full object-contain p-1.5"
          loading="lazy"
          onError={() => setFailed(true)}
        />
      ) : (
        <span className="font-bold text-brand" aria-hidden>
          {name.charAt(0).toUpperCase()}
        </span>
      )}
    </div>
  );
}
