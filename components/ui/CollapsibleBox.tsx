"use client";

import { ReactNode } from "react";

interface CollapsibleBoxProps {
  number: number;
  title: string;
  open: boolean;
  onToggle: () => void;
  opacity?: number;
  children: ReactNode;
}

export function CollapsibleBox({ number, title, open, onToggle, opacity = 1, children }: CollapsibleBoxProps) {
  return (
    <div
      className="overflow-hidden rounded-[14px] border border-[#E5EAF1] bg-white shadow-[0_1px_2px_rgba(16,24,40,0.04)]"
      style={{ opacity }}
    >
      <div
        onClick={onToggle}
        className="flex cursor-pointer items-center gap-2.5 px-6 py-[18px]"
      >
        <div className="flex h-6 w-6 items-center justify-center rounded-md bg-[#EAF2FF] text-xs font-bold text-[#3AA8DC]">
          {number}
        </div>
        <h2 className="m-0 flex-1 text-base font-bold text-[#0A1628]">{title}</h2>
        <span className="text-[13px] font-bold text-[#98A2B3]">{open ? "−" : "+"}</span>
      </div>
      {open && <div className="px-6 pb-[22px]">{children}</div>}
    </div>
  );
}
