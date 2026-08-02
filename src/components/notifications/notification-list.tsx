"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { markReadAction, markAllReadAction, savePreferenceAction } from "@/modules/notifications/actions";
import { Button } from "@/components/ui/button";

type Item = { id: string; title: string; body: string; href: string | null; read: boolean; at: string };

export function NotificationList({
  items,
  pref,
}: {
  items: Item[];
  pref: { emailEnabled: boolean; inappEnabled: boolean };
}) {
  const [emailOn, setEmailOn] = useState(pref.emailEnabled);
  const [inappOn, setInappOn] = useState(pref.inappEnabled);
  const [pending, start] = useTransition();

  return (
    <div className="mt-6">
      {/* Preferences */}
      <div className="mb-6 flex flex-wrap items-center gap-4 clay p-4 text-sm">
        <span className="font-medium">Delivery:</span>
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={inappOn} onChange={(e) => { setInappOn(e.target.checked); start(() => savePreferenceAction(emailOn, e.target.checked).then(() => {})); }} />
          In-app
        </label>
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={emailOn} onChange={(e) => { setEmailOn(e.target.checked); start(() => savePreferenceAction(e.target.checked, inappOn).then(() => {})); }} />
          Email
        </label>
        <div className="ml-auto">
          <Button variant="secondary" onClick={() => start(() => markAllReadAction().then(() => {}))} disabled={pending || items.every((i) => i.read)}>
            Mark all read
          </Button>
        </div>
      </div>

      <div className="space-y-2">
        {items.map((n) => (
          <NotificationRow key={n.id} n={n} />
        ))}
        {items.length === 0 && (
          <p className="rounded-xl border border-dashed border-border p-10 text-center text-muted-foreground">No notifications yet.</p>
        )}
      </div>
    </div>
  );
}

function NotificationRow({ n }: { n: Item }) {
  const [, start] = useTransition();
  const onClick = () => { if (!n.read) start(() => markReadAction(n.id).then(() => {})); };
  const className = `block rounded-xl border p-4 transition-colors ${n.read ? "border-border bg-surface" : "border-brand/30 bg-brand/5"}`;
  const inner = (
    <div className="flex items-start justify-between gap-3">
      <div>
        <p className="font-medium">
          {!n.read && <span className="mr-2 inline-block h-2 w-2 rounded-full bg-brand align-middle" />}
          {n.title}
        </p>
        <p className="mt-1 text-sm text-muted-foreground">{n.body}</p>
      </div>
      <span className="shrink-0 text-xs text-muted-foreground">{new Date(n.at).toLocaleDateString()}</span>
    </div>
  );
  return n.href ? (
    <Link href={n.href} onClick={onClick} className={className}>{inner}</Link>
  ) : (
    <div onClick={onClick} className={className}>{inner}</div>
  );
}
