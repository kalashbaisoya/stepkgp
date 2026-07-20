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

  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-center overflow-hidden rounded-lg border border-border bg-surface",
        className ?? "h-12 w-12",
      )}
    >
      {showImg ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
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
