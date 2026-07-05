"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import {
  BLOCK_CATALOG,
  BLOCK_TYPES,
  defaultBlockData,
  type Block,
  type BlockType,
  type FieldDescriptor,
} from "@/modules/cms/blocks";
import { saveBlocksAction, publishPageAction } from "@/modules/cms/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

let tmpId = 0;
const newId = () => `tmp-${tmpId++}`;

export function PageEditor({
  pageKey,
  title,
  status,
  initialBlocks,
  canPublish,
}: {
  pageKey: string;
  title: string;
  status: string;
  initialBlocks: Block[];
  canPublish: boolean;
}) {
  const [blocks, setBlocks] = useState<Block[]>(initialBlocks);
  const [dirty, setDirty] = useState(false);
  const [note, setNote] = useState<string>("");
  const [pending, start] = useTransition();

  function update(next: Block[]) {
    setBlocks(next.map((b, i) => ({ ...b, order: i })));
    setDirty(true);
  }

  function setField(idx: number, key: string, value: unknown) {
    const next = blocks.slice();
    next[idx] = { ...next[idx], data: { ...next[idx].data, [key]: value } };
    update(next);
  }

  function addBlock(type: BlockType) {
    update([...blocks, { id: newId(), type, data: defaultBlockData(type), order: blocks.length }]);
  }
  function removeBlock(idx: number) {
    update(blocks.filter((_, i) => i !== idx));
  }
  function move(idx: number, dir: -1 | 1) {
    const j = idx + dir;
    if (j < 0 || j >= blocks.length) return;
    const next = blocks.slice();
    [next[idx], next[j]] = [next[j], next[idx]];
    update(next);
  }

  function save() {
    start(async () => {
      await saveBlocksAction(
        pageKey,
        blocks.map((b, i) => ({ type: b.type, data: b.data, order: i })),
      );
      setDirty(false);
      setNote("Draft saved.");
    });
  }
  function publish() {
    start(async () => {
      await saveBlocksAction(pageKey, blocks.map((b, i) => ({ type: b.type, data: b.data, order: i })));
      const res = await publishPageAction(pageKey);
      setDirty(false);
      setNote(`Published v${res.version}. Live on the site.`);
    });
  }

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <Link href="/admin/cms/pages" className="text-sm text-muted-foreground hover:text-foreground">
            ← Pages
          </Link>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight">{title}</h1>
          <p className="text-sm text-muted-foreground">
            /{pageKey === "home" ? "" : pageKey} · {status}
            {dirty && <span className="text-status-progress"> · unsaved changes</span>}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {note && <span className="text-sm text-status-success">{note}</span>}
          <Button variant="secondary" onClick={save} disabled={pending}>
            {pending ? "Saving…" : "Save draft"}
          </Button>
          {canPublish && (
            <Button onClick={publish} disabled={pending}>
              Publish
            </Button>
          )}
        </div>
      </div>

      <div className="space-y-4">
        {blocks.map((block, idx) => (
          <BlockCard
            key={block.id}
            block={block}
            index={idx}
            total={blocks.length}
            onField={(k, v) => setField(idx, k, v)}
            onMove={(d) => move(idx, d)}
            onRemove={() => removeBlock(idx)}
          />
        ))}
        {blocks.length === 0 && (
          <p className="rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
            No blocks yet. Add one below.
          </p>
        )}
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-2 rounded-xl border border-border bg-surface p-4">
        <span className="text-sm text-muted-foreground">Add block:</span>
        {BLOCK_TYPES.map((t) => (
          <button
            key={t}
            onClick={() => addBlock(t)}
            className="rounded-md border border-border px-2.5 py-1 text-xs font-medium hover:bg-muted"
          >
            + {BLOCK_CATALOG[t].label}
          </button>
        ))}
      </div>
    </div>
  );
}

function BlockCard({
  block,
  index,
  total,
  onField,
  onMove,
  onRemove,
}: {
  block: Block;
  index: number;
  total: number;
  onField: (key: string, value: unknown) => void;
  onMove: (dir: -1 | 1) => void;
  onRemove: () => void;
}) {
  const def = BLOCK_CATALOG[block.type];
  return (
    <div className="rounded-xl border border-border bg-surface p-5">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <span className="text-sm font-medium">{def.label}</span>
          <span className="ml-2 text-xs text-muted-foreground">{def.description}</span>
        </div>
        <div className="flex items-center gap-1 text-muted-foreground">
          <button onClick={() => onMove(-1)} disabled={index === 0} className="rounded px-2 py-1 hover:bg-muted disabled:opacity-30">↑</button>
          <button onClick={() => onMove(1)} disabled={index === total - 1} className="rounded px-2 py-1 hover:bg-muted disabled:opacity-30">↓</button>
          <button onClick={onRemove} className="rounded px-2 py-1 text-status-danger hover:bg-status-danger/10">Remove</button>
        </div>
      </div>
      <div className="space-y-4">
        {def.fields.map((f) => (
          <FieldEditor key={f.key} field={f} value={block.data[f.key]} onChange={(v) => onField(f.key, v)} />
        ))}
      </div>
    </div>
  );
}

function FieldEditor({
  field,
  value,
  onChange,
}: {
  field: FieldDescriptor;
  value: unknown;
  onChange: (v: unknown) => void;
}) {
  if (field.type === "list" && field.itemFields) {
    const items = (Array.isArray(value) ? value : []) as Record<string, unknown>[];
    const itemFields = field.itemFields;
    return (
      <div>
        <label className="mb-1.5 block text-sm font-medium">{field.label}</label>
        <div className="space-y-2">
          {items.map((item, i) => (
            <div key={i} className="flex flex-wrap items-start gap-2 rounded-md border border-border p-2">
              {itemFields.map((itf) => (
                <div key={itf.key} className="flex-1 min-w-[8rem]">
                  <span className="mb-1 block text-xs text-muted-foreground">{itf.label}</span>
                  <Input
                    value={String(item[itf.key] ?? "")}
                    onChange={(e) => {
                      const next = items.slice();
                      next[i] = { ...next[i], [itf.key]: e.target.value };
                      onChange(next);
                    }}
                  />
                </div>
              ))}
              <button
                onClick={() => onChange(items.filter((_, j) => j !== i))}
                className="mt-5 rounded px-2 py-1 text-xs text-status-danger hover:bg-status-danger/10"
              >
                ✕
              </button>
            </div>
          ))}
          <button
            onClick={() => onChange([...items, Object.fromEntries(itemFields.map((f) => [f.key, ""]))])}
            className="rounded-md border border-border px-2.5 py-1 text-xs font-medium hover:bg-muted"
          >
            + Add item
          </button>
        </div>
      </div>
    );
  }

  const str = String(value ?? "");
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium">{field.label}</label>
      {field.type === "textarea" ? (
        <textarea
          value={str}
          onChange={(e) => onChange(e.target.value)}
          rows={3}
          className="flex w-full rounded-md border border-border bg-surface px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
      ) : (
        <Input type={field.type === "url" ? "text" : "text"} value={str} onChange={(e) => onChange(e.target.value)} />
      )}
    </div>
  );
}
