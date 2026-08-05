"use client";

import Image from "next/image";
import { ReactNode } from "react";
import { Collapse } from "@/components/ui/Collapse";
import { ChevronIcon } from "@/components/ui/Icons";

interface CollapsibleSectionProps {
  icon?: string;
  title: string;
  valueLabel?: ReactNode;
  valueColor?: string;
  open: boolean;
  onToggle: () => void;
  children: ReactNode;
  printMode?: boolean;
}

export function CollapsibleSection({
  icon,
  title,
  valueLabel,
  valueColor = "#8A5A24",
  open,
  onToggle,
  children,
  printMode = false,
}: CollapsibleSectionProps) {
  const effectiveOpen = printMode || open;
  return (
    <div className="break-inside-avoid">
      <div
        onClick={printMode ? undefined : onToggle}
        className={`mt-[22px] flex items-center gap-2.5 rounded-[10px] border border-[#EDF1F6] bg-[#F7FAFC] px-3.5 py-2.5 select-none ${printMode ? "" : "cursor-pointer"}`}
      >
        {icon && <Image src={icon} alt="" width={20} height={20} className="h-5 w-5" />}
        <h3 className="m-0 flex-1 text-[13px] font-bold tracking-wide text-[#1B2A3A] uppercase">{title}</h3>
        {valueLabel != null && (
          <span className="text-[13.5px] font-extrabold" style={{ color: valueColor }}>
            {valueLabel}
          </span>
        )}
        {!printMode && (
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#EAF2FF] text-[#3AA8DC]">
            <ChevronIcon
              style={{ transform: effectiveOpen ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s ease" }}
            />
          </span>
        )}
      </div>
      <Collapse open={effectiveOpen} printMode={printMode} innerClassName="mt-3 flex flex-col text-[12.5px]">
        {children}
      </Collapse>
    </div>
  );
}
