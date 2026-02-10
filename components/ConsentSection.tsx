"use client";

import { useState } from "react";

export type ConsentKey = "terms" | "privacy" | "thirdParty";

export default function ConsentSection(props: {
  label: string;
  checked: boolean;
  onChange: (next: boolean) => void;
  content: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="rounded border border-neutral-300 bg-white p-3">
      <div className="flex items-start justify-between gap-3">
        <label className="flex items-start gap-2">
          <input
            type="checkbox"
            checked={props.checked}
            onChange={(e) => props.onChange(e.target.checked)}
            className="mt-1 h-4 w-4"
          />
          <span className="text-sm font-semibold text-neutral-900">{props.label}</span>
        </label>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="shrink-0 rounded border border-neutral-300 bg-neutral-100 px-2 py-1 text-xs font-semibold text-neutral-800"
        >
          보기
        </button>
      </div>

      {open && (
        <pre className="mt-3 whitespace-pre-wrap rounded border border-neutral-200 bg-neutral-50 p-3 text-xs leading-5 text-neutral-700">
          {props.content}
        </pre>
      )}
    </div>
  );
}