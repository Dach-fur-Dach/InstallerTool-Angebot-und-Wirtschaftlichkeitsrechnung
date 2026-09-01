"use client";

import { ReactNode, useRef, useState } from "react";
import { FormState, num } from "@/lib/calculator";

function buildUnitLabels(prefix: string, count: number, maxShown = 3): string[] {
  if (count <= 0) return [];
  if (count <= maxShown + 1) return Array.from({ length: count }, (_, i) => `${prefix}${i + 1}`);
  return [`${prefix}1`, `${prefix}2`, "…", `${prefix}${count}`];
}

function buildNodes(form: FormState): string[] {
  const nodes: string[] = ["PV"];
  if (form.waermepumpeModus === "eigener_zaehler") nodes.push("WP");
  if (form.wallboxModus === "eigener_zaehler") nodes.push("WB");
  if (form.allgemeinstrom) nodes.push("AS");
  nodes.push(...buildUnitLabels("WE", num(form.wohneinheiten)));
  nodes.push(...buildUnitLabels("GE", num(form.gewerbeeinheiten)));
  return nodes;
}

const NODE_TOOLTIPS: Record<string, string> = {
  PV: "PV-Anlage — eigener Zähler für den erzeugten Solarstrom",
  WP: "Wärmepumpe — eigener Zähler für die Wärmepumpe",
  WB: "Wallbox — eigener Zähler für die Ladeinfrastruktur",
  AS: "Allgemeinstrom — Zähler für Gemeinschaftsflächen (z. B. Treppenhaus, Aufzug)",
};

function nodeTooltip(label: string): string | undefined {
  if (NODE_TOOLTIPS[label]) return NODE_TOOLTIPS[label];
  if (/^WE\d+$/.test(label)) return `Wohneinheit ${label.slice(2)} — eigener Zähler für eine Mietwohnung`;
  if (/^GE\d+$/.test(label)) return `Gewerbeeinheit ${label.slice(2)} — eigener Zähler für eine gewerbliche Einheit`;
  return undefined;
}

// Shows instantly on mouseenter via a JS-measured `fixed` coordinate instead of the native
// `title` attribute (which carries the OS's own ~600ms hover delay) or CSS group-hover
// (which would still get clipped by the collapsible section's `overflow-hidden`).
function HoverTip({ text, children, className = "" }: { text?: string; children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null);

  if (!text) return <>{children}</>;

  const show = () => {
    const rect = ref.current?.getBoundingClientRect();
    if (rect) setPos({ top: rect.bottom + 6, left: rect.left + rect.width / 2 });
  };

  return (
    <div ref={ref} onMouseEnter={show} onMouseLeave={() => setPos(null)} className={`cursor-help ${className}`}>
      {children}
      {pos && (
        <span
          style={{ top: pos.top, left: pos.left }}
          className="pointer-events-none fixed z-50 w-max max-w-[220px] -translate-x-1/2 rounded-lg bg-[#1B2A3A] px-2.5 py-1.5 text-[11px] font-normal leading-snug text-white shadow-lg"
        >
          {text}
        </span>
      )}
    </div>
  );
}

function NodeBox({ label }: { label: string }) {
  if (label === "…") {
    return <div className="flex h-8 items-end pb-1.5 text-[13px] font-bold text-[#98A2B3]">···</div>;
  }
  return (
    <HoverTip text={nodeTooltip(label)}>
      <div className="flex h-8 min-w-[42px] items-center justify-center rounded-md border border-[#D0D5DD] bg-[#F8FAFC] px-2 text-[11px] font-bold text-[#0A1628]">
        {label}
      </div>
    </HoverTip>
  );
}

function NodeRow({ nodes }: { nodes: string[] }) {
  return (
    <div className="flex justify-between gap-2">
      {nodes.map((n, i) => (
        <div key={i} className="flex flex-1 flex-col items-center gap-1">
          <div className="h-2.5 w-px bg-[#3AA8DC]" />
          <NodeBox label={n} />
        </div>
      ))}
    </div>
  );
}

// The bus line always starts at Netz (the left edge of this column, right after the Netz/Z1
// label) and stops at the last meter's connector rather than running past it. Each connector
// sits at the horizontal center of its (equal-width) column, so the last one's center is at
// (count - 0.5) / count of the row's width, giving a right inset of 50/count %.
function Bus({ nodes }: { nodes: string[] }) {
  const rightInset = `${50 / nodes.length}%`;
  return (
    <div>
      <div className="h-px bg-[#3AA8DC]" style={{ marginRight: rightInset }} />
      <NodeRow nodes={nodes} />
    </div>
  );
}

const MODELL_CAPTION: Record<FormState["mieterstromModell"], string> = {
  physischer_sz:
    "Ein physischer Summenzähler (Z1) erfasst den Gesamtbezug; alle Einheiten hängen über eigene Unterzähler daran.",
  virtueller_sz:
    "Kein physischer Summenzähler nötig — die Einzelzähler werden softwareseitig virtuell zu Z1 zusammengefasst.",
  ggv: "Jede Einheit bezieht direkt über ihren Standardzähler vom Netz; die PV-Erzeugung wird gemeinschaftlich verteilt.",
};

export function MesskonzeptDiagram({ form, bare = false }: { form: FormState; bare?: boolean }) {
  const nodes = buildNodes(form);
  const modell = form.mieterstromModell;

  const isPhysisch = modell === "physischer_sz";
  const isVirtuell = modell === "virtueller_sz";

  return (
    <div className={bare ? "" : "rounded-[10px] border border-[#EDF1F6] bg-white px-4 py-5"}>
      {/* Grid keeps the Netz/Z1 labels in their own column(s) so the bus line + node row — the
          last column — always get the exact same width, however wide those labels are. Netz and
          Z1 sit visually on the line via -translate-y-1/2 against the row's top edge. */}
      <div
        className="grid items-start gap-x-2"
        style={{ gridTemplateColumns: isPhysisch ? "auto auto 1fr" : "auto 1fr" }}
      >
        <HoverTip text="Öffentliches Stromnetz">
          <span className="-translate-y-1/2 block whitespace-nowrap text-[10px] font-bold uppercase tracking-wide text-[#5B6472]">
            Netz
          </span>
        </HoverTip>

        {isPhysisch && (
          <HoverTip text="Summenzähler — erfasst den Gesamtbezug aller angeschlossenen Einheiten">
            <div className="-translate-y-1/2 flex h-7 items-center justify-center rounded-md border-2 border-[#3AA8DC] bg-[#EAF6FC] px-2.5 text-[11px] font-bold text-[#1B2A3A]">
              Z1
            </div>
          </HoverTip>
        )}

        {isVirtuell ? (
          <div className="relative rounded-lg border border-dashed border-[#3AA8DC] px-2 pb-3 pt-4">
            <span className="absolute -top-2.5 left-3 bg-white px-1.5 text-[10px] font-bold text-[#3AA8DC]">
              Z1 (vSZ)
            </span>
            <Bus nodes={nodes} />
          </div>
        ) : (
          <Bus nodes={nodes} />
        )}
      </div>

      <p className="mt-3.5 text-[11.5px] leading-snug text-[#98A2B3]">{MODELL_CAPTION[modell]}</p>
    </div>
  );
}
