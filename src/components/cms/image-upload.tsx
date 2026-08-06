"use client";

import { useRef, useState } from "react";

/**
 * Pick or drop an image, upload it, and hand back the served URL.
 *
 * The value stays a plain URL string so an editor can still paste a remote one,
 * and nothing downstream needs to know whether an image was uploaded or linked.
 */
export function ImageUpload({
  value,
  onChange,
  label,
  hint,
}: {
  value: string;
  onChange: (url: string) => void;
  label: string;
  hint?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [dragging, setDragging] = useState(false);

  async function send(file: File) {
    setError("");
    setBusy(true);
    try {
      const body = new FormData();
      body.append("file", file);
      const res = await fetch("/api/admin/media", { method: "POST", body });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload failed.");
      onChange(data.url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed.");
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium">{label}</label>

      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          const file = e.dataTransfer.files?.[0];
          if (file) send(file);
        }}
        className={`clay-inset flex items-center gap-4 p-3 transition-colors ${
          dragging ? "ring-2 ring-brand" : ""
        }`}
      >
        <div className="clay-sm flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden bg-surface">
          {value ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={value} alt="" className="h-full w-full object-contain p-1" />
          ) : (
            <span className="text-xs text-muted-foreground">None</span>
          )}
        </div>

        <div className="min-w-0 flex-1 space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              disabled={busy}
              className="clay-btn clay-plain px-3 py-1.5 text-xs"
            >
              {busy ? "Uploading..." : value ? "Replace image" : "Upload image"}
            </button>
            {value && (
              <button
                type="button"
                onClick={() => onChange("")}
                className="text-xs font-medium text-status-danger hover:underline"
              >
                Remove
              </button>
            )}
            <span className="text-xs text-muted-foreground">or drop a file here</span>
          </div>

          <input
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="or paste an image URL"
            className="clay-field h-9 w-full text-xs"
          />
        </div>

        <input
          ref={inputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp,image/gif,image/avif"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) send(file);
          }}
        />
      </div>

      {error && <p className="mt-1.5 text-xs font-medium text-status-danger">{error}</p>}
      {!error && hint && <p className="mt-1.5 text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}
