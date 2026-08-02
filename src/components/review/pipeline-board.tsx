"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { transitionAction, assignReviewersAction } from "@/modules/lifecycle/actions";

type Card = { id: string; applicant: string; category: string; status: string; reviewerCount: number };
type State = { key: string; name: string };

export function PipelineBoard({
  states,
  columns,
  transitionMap,
  reviewers,
  canTransition,
}: {
  states: State[];
  columns: Record<string, Card[]>;
  transitionMap: Record<string, string[]>;
  reviewers: { id: string; name: string }[];
  canTransition: boolean;
}) {
  const stateName = Object.fromEntries(states.map((s) => [s.key, s.name]));
  const [assignFor, setAssignFor] = useState<string | null>(null);

  return (
    <div className="mt-6 flex gap-4 overflow-x-auto pb-4">
      {states.map((s) => {
        const cards = columns[s.key] ?? [];
        return (
          <div key={s.key} className="w-72 shrink-0">
            <div className="mb-2 flex items-center justify-between px-1">
              <h2 className="text-sm font-medium">{s.name}</h2>
              <span className="rounded-full bg-muted px-2 text-xs text-muted-foreground">{cards.length}</span>
            </div>
            <div className="space-y-2">
              {cards.map((c) => (
                <PipelineCard
                  key={c.id}
                  card={c}
                  nextStates={(transitionMap[c.status] ?? []).map((k) => ({ key: k, name: stateName[k] ?? k }))}
                  canTransition={canTransition}
                  onAssign={() => setAssignFor(c.id)}
                />
              ))}
              {cards.length === 0 && <div className="clay-inset p-3 text-center text-xs text-muted-foreground">-</div>}
            </div>
          </div>
        );
      })}

      {assignFor && (
        <AssignDialog applicationId={assignFor} reviewers={reviewers} onClose={() => setAssignFor(null)} />
      )}
    </div>
  );
}

function PipelineCard({
  card,
  nextStates,
  canTransition,
  onAssign,
}: {
  card: Card;
  nextStates: State[];
  canTransition: boolean;
  onAssign: () => void;
}) {
  const [pending, start] = useTransition();
  return (
    <div className="clay p-3 text-sm">
      <Link href={`/app/review/${card.id}`} className="font-medium hover:underline">
        {card.applicant}
      </Link>
      <p className="text-xs text-muted-foreground">{card.category} · {card.reviewerCount} reviewer{card.reviewerCount === 1 ? "" : "s"}</p>
      <div className="mt-2 flex flex-wrap items-center gap-1">
        {canTransition && nextStates.length > 0 && (
          <select
            defaultValue=""
            disabled={pending}
            onChange={(e) => {
              const to = e.target.value;
              if (to) start(async () => { await transitionAction(card.id, to); });
            }}
            className="rounded border border-border bg-surface px-1.5 py-1 text-xs"
          >
            <option value="">Move to…</option>
            {nextStates.map((s) => <option key={s.key} value={s.key}>{s.name}</option>)}
          </select>
        )}
        <button onClick={onAssign} className="rounded border border-border px-1.5 py-1 text-xs hover:bg-muted">Assign</button>
      </div>
    </div>
  );
}

function AssignDialog({
  applicationId,
  reviewers,
  onClose,
}: {
  applicationId: string;
  reviewers: { id: string; name: string }[];
  onClose: () => void;
}) {
  const [selected, setSelected] = useState<string[]>([]);
  const [pending, start] = useTransition();
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4" onClick={onClose}>
      <div className="w-full max-w-sm clay p-6" onClick={(e) => e.stopPropagation()}>
        <h3 className="font-semibold">Assign reviewers</h3>
        <div className="mt-3 max-h-64 space-y-1.5 overflow-y-auto">
          {reviewers.map((r) => (
            <label key={r.id} className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={selected.includes(r.id)}
                onChange={(e) => setSelected((prev) => (e.target.checked ? [...prev, r.id] : prev.filter((x) => x !== r.id)))}
              />
              {r.name}
            </label>
          ))}
        </div>
        <div className="mt-4 flex justify-end gap-2">
          <button onClick={onClose} className="clay-btn clay-plain px-4 py-2 text-sm">Cancel</button>
          <button
            disabled={pending || selected.length === 0}
            onClick={() => start(async () => { await assignReviewersAction(applicationId, selected); onClose(); })}
            className="rounded-md bg-brand px-3 py-1.5 text-sm font-medium text-brand-foreground hover:opacity-90 disabled:opacity-50"
          >
            Assign
          </button>
        </div>
      </div>
    </div>
  );
}
