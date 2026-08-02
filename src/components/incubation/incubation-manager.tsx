"use client";

import { useState, useTransition } from "react";
import {
  updateIncubationAction, addMilestoneAction, toggleMilestoneAction,
  addFundingAction, addReviewScheduleAction, assignMentorAction,
  graduateAction, publishShowcaseAction,
} from "@/modules/incubation/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type Incubation = {
  id: string;
  applicant: string;
  startupName: string | null;
  cycleName: string;
  status: string;
  startDate: string;
  agreementDate: string | null;
  officeSpace: string | null;
  monthsElapsed: number;
  elevenMonthFlagged: boolean;
  graduatedAt: string | null;
  milestones: { id: string; title: string; status: string; dueDate: string | null }[];
  funding: { id: string; source: string; amount: string; date: string; notes: string | null }[];
  mentors: { id: string; name: string }[];
  reviews: { id: string; scheduledFor: string; type: string; status: string }[];
  showcase: { slug: string; published: boolean } | null;
};

export function IncubationManager({
  incubation, mentorOptions, canManage, canGraduate, canPublish,
}: {
  incubation: Incubation;
  mentorOptions: { id: string; name: string }[];
  canManage: boolean;
  canGraduate: boolean;
  canPublish: boolean;
}) {
  const i = incubation;
  const [pending, start] = useTransition();
  const [office, setOffice] = useState(i.officeSpace ?? "");
  const [agreement, setAgreement] = useState(i.agreementDate ? i.agreementDate.slice(0, 10) : "");
  const [mTitle, setMTitle] = useState("");
  const [mDue, setMDue] = useState("");
  const [fSource, setFSource] = useState(""); const [fAmount, setFAmount] = useState("");
  const [rDate, setRDate] = useState("");
  const [mentor, setMentor] = useState("");
  const [msg, setMsg] = useState("");
  const run = (fn: () => Promise<unknown>, note?: string) => start(async () => { await fn(); if (note) setMsg(note); });

  return (
    <div className="mt-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{i.startupName || i.applicant}</h1>
          <p className="text-sm text-muted-foreground">
            {i.cycleName} · {i.applicant} · Month {i.monthsElapsed}/11
            {i.elevenMonthFlagged && <span className="ml-2 rounded-full bg-status-progress/10 px-2 py-0.5 text-xs font-medium text-status-progress">11-month reached</span>}
            {i.status === "graduated" && <span className="ml-2 rounded-full bg-status-success/10 px-2 py-0.5 text-xs font-medium text-status-success">Graduated</span>}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {msg && <span className="text-sm text-status-success">{msg}</span>}
          {canGraduate && i.status !== "graduated" && (
            <Button onClick={() => run(() => graduateAction(i.id), "Graduated.")} disabled={pending}>Graduate</Button>
          )}
          {canPublish && i.status === "graduated" && (
            <Button variant="secondary" onClick={() => run(() => publishShowcaseAction(i.id), "Published to showcase.")} disabled={pending}>
              {i.showcase?.published ? "Re-publish showcase" : "Publish to showcase"}
            </Button>
          )}
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        {/* Details */}
        <Card title="Details">
          <Field label="Start date" value={new Date(i.startDate).toLocaleDateString()} />
          <div className="mt-3 space-y-2">
            <div>
              <label className="text-xs text-muted-foreground">Agreement date</label>
              <Input type="date" value={agreement} onChange={(e) => setAgreement(e.target.value)} disabled={!canManage} />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Office allocation</label>
              <Input value={office} onChange={(e) => setOffice(e.target.value)} placeholder="e.g. B-204" disabled={!canManage} />
            </div>
            {canManage && (
              <Button variant="secondary" onClick={() => run(() => updateIncubationAction(i.id, { agreementDate: agreement || null, officeSpace: office }), "Saved.")} disabled={pending}>Save details</Button>
            )}
          </div>
        </Card>

        {/* Mentors */}
        <Card title="Mentors">
          <ul className="space-y-1 text-sm">
            {i.mentors.map((m) => <li key={m.id}>{m.name}</li>)}
            {i.mentors.length === 0 && <li className="text-muted-foreground">None assigned.</li>}
          </ul>
          {canManage && (
            <div className="mt-3 flex gap-2">
              <select value={mentor} onChange={(e) => setMentor(e.target.value)} className="clay-field h-10 flex-1 text-sm">
                <option value="">Select mentor…</option>
                {mentorOptions.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
              </select>
              <Button variant="secondary" disabled={pending || !mentor} onClick={() => run(() => assignMentorAction(i.id, mentor), "Mentor assigned.")}>Assign</Button>
            </div>
          )}
        </Card>

        {/* Milestones */}
        <Card title="Milestones">
          <ul className="space-y-1.5 text-sm">
            {i.milestones.map((m) => (
              <li key={m.id} className="flex items-center gap-2">
                <button
                  onClick={() => canManage && run(() => toggleMilestoneAction(i.id, m.id))}
                  className={`inline-flex h-4 w-4 items-center justify-center rounded-full text-[10px] ${m.status === "done" ? "bg-status-success text-white" : "border border-border"}`}
                >{m.status === "done" ? "✓" : ""}</button>
                <span className={m.status === "done" ? "line-through text-muted-foreground" : ""}>{m.title}</span>
                {m.dueDate && <span className="ml-auto text-xs text-muted-foreground">{new Date(m.dueDate).toLocaleDateString()}</span>}
              </li>
            ))}
            {i.milestones.length === 0 && <li className="text-muted-foreground">No milestones.</li>}
          </ul>
          {canManage && (
            <div className="mt-3 flex gap-2">
              <Input value={mTitle} onChange={(e) => setMTitle(e.target.value)} placeholder="Milestone" className="flex-1" />
              <Input type="date" value={mDue} onChange={(e) => setMDue(e.target.value)} className="w-40" />
              <Button variant="secondary" disabled={pending || !mTitle} onClick={() => run(async () => { await addMilestoneAction(i.id, mTitle, mDue || null); setMTitle(""); setMDue(""); })}>Add</Button>
            </div>
          )}
        </Card>

        {/* Funding */}
        <Card title="Funding">
          <ul className="space-y-1 text-sm">
            {i.funding.map((f) => (
              <li key={f.id} className="flex justify-between">
                <span>{f.source}</span>
                <span className="text-muted-foreground">₹{f.amount}</span>
              </li>
            ))}
            {i.funding.length === 0 && <li className="text-muted-foreground">No funding recorded.</li>}
          </ul>
          {canManage && (
            <div className="mt-3 flex gap-2">
              <Input value={fSource} onChange={(e) => setFSource(e.target.value)} placeholder="Source" className="flex-1" />
              <Input value={fAmount} onChange={(e) => setFAmount(e.target.value)} placeholder="Amount" className="w-28" />
              <Button variant="secondary" disabled={pending || !fSource || !fAmount} onClick={() => run(async () => { await addFundingAction(i.id, fSource, fAmount, null); setFSource(""); setFAmount(""); })}>Add</Button>
            </div>
          )}
        </Card>

        {/* Review schedule */}
        <Card title="Review schedule">
          <ul className="space-y-1 text-sm">
            {i.reviews.map((r) => (
              <li key={r.id} className="flex justify-between">
                <span className="capitalize">{r.type}</span>
                <span className="text-muted-foreground">{new Date(r.scheduledFor).toLocaleDateString()} · {r.status}</span>
              </li>
            ))}
            {i.reviews.length === 0 && <li className="text-muted-foreground">No reviews scheduled.</li>}
          </ul>
          {canManage && (
            <div className="mt-3 flex gap-2">
              <Input type="date" value={rDate} onChange={(e) => setRDate(e.target.value)} className="flex-1" />
              <Button variant="secondary" disabled={pending || !rDate} onClick={() => run(async () => { await addReviewScheduleAction(i.id, rDate, "monthly"); setRDate(""); })}>Schedule</Button>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="clay p-5">
      <h2 className="mb-3 font-semibold">{title}</h2>
      {children}
    </section>
  );
}
function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span>{value}</span>
    </div>
  );
}
