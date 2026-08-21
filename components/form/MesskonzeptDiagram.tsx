"use client";

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

function NodeBox({ label }: { label: string }) {
  if (label === "…") {
    return <div className="flex h-8 items-end pb-1.5 text-[13px] font-bold text-[#98A2B3]">···</div>;
  }
  return (
    <div className="flex h-8 min-w-[42px] items-center justify-center rounded-md border border-[#D0D5DD] bg-[#F8FAFC] px-2 text-[11px] font-bold text-[#0A1628]">
      {label}
    </div>
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

const MODELL_CAPTION: Record<FormState["mieterstromModell"], string> = {
  physischer_sz:
    "Ein physischer Summenzähler (Z1) erfasst den Gesamtbezug; alle Einheiten hängen über eigene Unterzähler daran.",
  virtueller_sz:
    "Kein physischer Summenzähler nötig — die Einzelzähler werden softwareseitig virtuell zu Z1 zusammengefasst.",
  ggv: "Jede Einheit bezieht direkt über ihren Standardzähler vom Netz; die PV-Erzeugung wird gemeinschaftlich verteilt.",
};

export function MesskonzeptDiagram({ form }: { form: FormState }) {
  const nodes = buildNodes(form);
  const modell = form.mieterstromModell;

  const isPhysisch = modell === "physischer_sz";
  const isVirtuell = modell === "virtueller_sz";

  return (
    <div className="rounded-[10px] border border-[#EDF1F6] bg-white px-4 py-5">
      {/* Netz/Z1 labels are positioned absolutely so they never consume horizontal space from
          the bus line below — this keeps the line and the node row exactly the same width, so
          every meter's connector lines up under it regardless of how many units there are. */}
      <div className={`relative ${isPhysisch ? "pt-9" : "pt-4"}`}>
        <span className="absolute left-0 top-0 text-[10px] font-bold uppercase tracking-wide text-[#5B6472]">
          Netz
        </span>

        {isPhysisch && (
          <div className="absolute left-11 top-0 flex flex-col items-center">
            <div className="flex h-7 items-center justify-center rounded-md border-2 border-[#3AA8DC] bg-[#EAF6FC] px-2.5 text-[11px] font-bold text-[#1B2A3A]">
              Z1
            </div>
            <div className="h-1 w-px bg-[#3AA8DC]" />
          </div>
        )}

        <div className="h-px bg-[#3AA8DC]" />
        <NodeRow nodes={nodes} />

        {isVirtuell && (
          <div className="pointer-events-none absolute -inset-x-2 top-2 bottom-0 rounded-lg border border-dashed border-[#3AA8DC]">
            <span className="absolute -top-2.5 left-3 bg-white px-1.5 text-[10px] font-bold text-[#3AA8DC]">
              Z1 (vSZ)
            </span>
          </div>
        )}
      </div>

      <p className="mt-3.5 text-[11.5px] leading-snug text-[#98A2B3]">{MODELL_CAPTION[modell]}</p>
    </div>
  );
}
