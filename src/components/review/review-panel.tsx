"use client";

import { useMemo, useState, useTransition } from "react";
import { submitScoresAction, addNoteAction } from "@/modules/review/actions";
import { Button } from "@/components/ui/button";

type Criterion = { id: string; name: string; weight: number; maxScore: number };
type Assignment = {
  id: string;
  status: string;
  recommendation: string | null;
  rationale: string | null;
  scores: { criterionId: string; value: number }[];
};
type Aggregate = { reviewer: string; status: string; recommendation: string | null; total: number; max: number };
type Note = { id: string; body: string; at: string | Date };

export function ReviewPanel({
  applicationId,
  criteria,
  myAssignment,
  aggregate,
  averageTotal,
  notes,
  canScore,
  canNote,
}: {
  applicationId: string;
  criteria: Criterion[];
  myAssignment: Assignment | null;
  aggregate: Aggregate[];
  averageTotal: number | null;
  notes: Note[];
  canScore: boolean;
  canNote: boolean;
}) {
  const initialScores: Record<string, number> = {};
  for (const s of myAssignment?.scores ?? []) initialScores[s.criterionId] = s.value;

  const [scores, setScores] = useState<Record<string, number>>(initialScores);
  const [recommendation, setRecommendation] = useState(myAssignment?.recommendation ?? "");
  const [rationale, setRationale] = useState(myAssignment?.rationale ?? "");
  const [note, setNote] = useState("");
  const [msg, setMsg] = useState("");
  const [pending, start] = useTransition();

  const { total, max } = useMemo(() => {
    let t = 0, m = 0;
    for (const c of criteria) {
      m += c.maxScore * c.weight;
      if (scores[c.id] !== undefined) t += scores[c.id] * c.weight;
    }
    return { total: Math.round(t * 10) / 10, max: Math.round(m * 10) / 10 };
  }, [scores, criteria]);

  function saveScores() {
    start(async () => {
      const payload = criteria.filter((c) => scores[c.id] !== undefined).map((c) => ({ criterionId: c.id, value: scores[c.id] }));
      const res = await submitScoresAction(applicationId, payload, recommendation || undefined, rationale || undefined);
      setMsg(res.ok ? "Review submitted." : res.error ?? "Failed.");
    });
  }
  function saveNote() {
    start(async () => {
      const res = await addNoteAction(applicationId, note);
      if (res.ok) { setNote(""); setMsg("Note added."); }
      else setMsg(res.error ?? "Failed.");
    });
  }

  return (
    <aside className="space-y-6 lg:sticky lg:top-6 lg:self-start">
      {/* Scorecard */}
      <div className="clay p-5">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-semibold">Scorecard</h2>
          <span className="text-sm text-muted-foreground">{total} / {max}</span>
        </div>
        {canScore ? (
          <div className="space-y-3">
            {criteria.map((c) => (
              <div key={c.id}>
                <div className="flex items-center justify-between text-sm">
                  <label>{c.name} <span className="text-xs text-muted-foreground">×{c.weight}</span></label>
                  <span className="text-muted-foreground">{scores[c.id] ?? 0}/{c.maxScore}</span>
                </div>
                <input
                  type="range" min={0} max={c.maxScore} step={1}
                  value={scores[c.id] ?? 0}
                  onChange={(e) => setScores((p) => ({ ...p, [c.id]: Number(e.target.value) }))}
                  className="w-full"
                />
              </div>
            ))}
            <div>
              <label className="mb-1 block text-sm font-medium">Recommendation</label>
              <select value={recommendation} onChange={(e) => setRecommendation(e.target.value)} className="clay-field h-10 text-sm">
                <option value="">Select…</option>
                <option value="recommend">Recommend</option>
                <option value="hold">Hold</option>
                <option value="reject">Reject</option>
              </select>
            </div>
            <textarea value={rationale} onChange={(e) => setRationale(e.target.value)} rows={2} placeholder="Rationale (optional)" className="clay-field text-sm" />
            <Button onClick={saveScores} disabled={pending} className="w-full">
              {myAssignment?.status === "completed" ? "Update review" : "Submit review"}
            </Button>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            {myAssignment ? "You cannot score this application." : "You are not assigned to score this application."}
          </p>
        )}
        {msg && <p className="mt-2 text-sm text-status-success">{msg}</p>}
      </div>

      {/* Aggregate */}
      <div className="clay p-5">
        <div className="mb-2 flex items-center justify-between">
          <h2 className="font-semibold">All reviewers</h2>
          {averageTotal !== null && <span className="text-sm text-muted-foreground">avg {averageTotal}</span>}
        </div>
        <ul className="space-y-1.5 text-sm">
          {aggregate.map((a, i) => (
            <li key={i} className="flex items-center justify-between">
              <span>{a.reviewer}</span>
              <span className="text-muted-foreground">
                {a.status === "completed" ? `${a.total}/${a.max}` : "pending"}
                {a.recommendation && <span className="ml-1 capitalize">· {a.recommendation}</span>}
              </span>
            </li>
          ))}
          {aggregate.length === 0 && <li className="text-muted-foreground">No reviewers assigned.</li>}
        </ul>
      </div>

      {/* Internal notes */}
      <div className="clay p-5">
        <h2 className="mb-2 font-semibold">Internal notes</h2>
        {canNote && (
          <div className="mb-3">
            <textarea value={note} onChange={(e) => setNote(e.target.value)} rows={2} placeholder="Add an internal note…" className="clay-field text-sm" />
            <Button variant="secondary" onClick={saveNote} disabled={pending || !note.trim()} className="mt-2 w-full">Add note</Button>
          </div>
        )}
        <ul className="space-y-2 text-sm">
          {notes.map((n) => (
            <li key={n.id} className="rounded-md bg-surface-2 p-2">
              <p>{n.body}</p>
              <p className="mt-1 text-xs text-muted-foreground">{new Date(n.at).toLocaleString()}</p>
            </li>
          ))}
          {notes.length === 0 && <li className="text-muted-foreground">No notes yet.</li>}
        </ul>
      </div>
    </aside>
  );
}
