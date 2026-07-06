"use client";

import { useTransition } from "react";
import { createApplicationAction } from "@/modules/applications/actions";
import { Button } from "@/components/ui/button";

export function StartApplication({
  cycleId,
  cycleName,
  categories,
}: {
  cycleId: string;
  cycleName: string;
  categories: { key: string; name: string }[];
}) {
  const [pending, start] = useTransition();
  return (
    <section className="rounded-xl border border-border bg-surface p-6">
      <h2 className="text-sm font-medium text-muted-foreground">Start a new application</h2>
      <p className="mt-1 text-lg font-semibold">{cycleName}</p>
      <p className="mt-1 text-sm text-muted-foreground">Choose the category you&rsquo;re applying under:</p>
      <div className="mt-4 flex flex-wrap gap-2">
        {categories.map((c) => (
          <Button
            key={c.key}
            variant="secondary"
            disabled={pending}
            onClick={() => start(() => createApplicationAction(cycleId, c.key))}
          >
            {c.name}
          </Button>
        ))}
      </div>
    </section>
  );
}
