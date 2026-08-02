"use client";

import { useState, useTransition } from "react";
import { runElevenMonthScanAction } from "@/modules/incubation/actions";
import { Button } from "@/components/ui/button";

export function ScanButton() {
  const [pending, start] = useTransition();
  const [msg, setMsg] = useState("");
  return (
    <div className="flex items-center gap-3">
      {msg && <span className="text-sm text-muted-foreground">{msg}</span>}
      <Button
        variant="secondary"
        disabled={pending}
        onClick={() => start(async () => {
          const res = await runElevenMonthScanAction();
          setMsg(res.ok ? `Scan complete. ${res.flagged} flagged.` : "Scan failed.");
        })}
      >
        {pending ? "Scanning…" : "Run 11-month scan"}
      </Button>
    </div>
  );
}
