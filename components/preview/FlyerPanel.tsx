"use client";

import { forwardRef } from "react";
import { fmt1, fmt2, fmtInt, num } from "@/lib/calculator";
import type { MieterstromCalculator } from "@/hooks/useMieterstromCalculator";
import { CheckIcon } from "@/components/ui/Icons";

const BULLETS = [
  "Ihr Vermieter beliefert Sie mit Solar- und Netzstrom: Sie müssen keinen eigenen Stromvertrag mehr abschließen",
  "Gesamtstromkosten werden als monatlicher Abschlag wie Ihr bisheriger Stromtarif abgerechnet.",
  "Einfache Teilnahme über Vertrag mit Ihrem Vermieter",
  "Bei Auszug automatisch Austritt aus dem Mieterstrom-Konzept",
];

function BulletIcon() {
  return (
    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#EAF2FF] text-[#3AA8DC]">
      <CheckIcon />
    </span>
  );
}

export const FlyerPanel = forwardRef<HTMLDivElement, { calc: MieterstromCalculator }>(function FlyerPanel(
  { calc },
  ref
) {
  const { form, results: r } = calc;

  const solarPreis = num(form.pvPreis);
  const netzPreis = num(form.netzPreis);
  const grundgebuehr = num(form.grundgebuehr);
  const grundversorgerPreis = num(form.grundversorgerPreis);
  const grundversorgerGrundgebuehr = num(form.grundversorgerGrundgebuehr);
  const solarAnteilPct = r.flyerSolarAnteil * 100;
  const netzAnteilPct = 100 - solarAnteilPct;

  return (
    <div
      ref={ref}
      className="overflow-hidden rounded-2xl border border-[#E5EAF1] bg-white px-7 py-[26px] shadow-[0_1px_3px_rgba(16,24,40,0.06)]"
    >
      <div className="mb-5 text-[11.5px] font-semibold tracking-wide text-[#98A2B3] uppercase">Mieter-Flyer Vorschau</div>

      <h2 className="m-0 mb-3 text-[22px] leading-[1.25] font-extrabold text-[#0A1628]">
        Geringere Stromkosten durch Solarstrom vom eigenen Dach
      </h2>
      <p className="m-0 mb-6 text-[13.5px] leading-relaxed text-[#344054]">
        Einfaches Mieterstrommodell für Mehrfamilienhäuser – Sie erhalten einfach &amp; günstig Solarstrom vom
        eigenen Dach.
      </p>

      <div className="mb-7 flex flex-col gap-3.5">
        {BULLETS.map((b) => (
          <div key={b} className="flex items-center gap-3">
            <BulletIcon />
            <div className="text-[12.5px] leading-snug text-[#344054]">{b}</div>
          </div>
        ))}
      </div>

      <h3 className="m-0 mb-2.5 text-[14px] font-extrabold text-[#0A1628]">
        Beispiel: Stromkosten in {form.objektPlzStadt || "Ihrer Stadt"}
      </h3>

      <div className="overflow-hidden rounded-[10px] border border-[#1B2A3A]/15">
        <div className="grid grid-cols-[1.3fr_1fr_1fr] items-center bg-[#F7FAFC] text-[11.5px] font-bold text-[#1B2A3A]">
          <div className="px-3.5 py-2.5" />
          <div className="px-3 py-2.5 text-center leading-tight">Grundversorgung Stromvertrag</div>
          <div className="bg-[#EAF6FC] px-3 py-2.5 text-center leading-tight text-[#1B6FA8]">Mieterstrom</div>
        </div>

        <div className="grid grid-cols-[1.3fr_1fr_1fr] border-t border-[#EDF1F6] text-[12.5px] text-[#1B2A3A]">
          <div className="px-3.5 py-2.5 text-[#5B6472]">Strombedarf Wohnung</div>
          <div className="px-3 py-2.5 text-center font-semibold">{fmtInt(r.flyerVerbrauchProWohnung)} kWh</div>
          <div className="bg-[#F5FBFE] px-3 py-2.5 text-center font-semibold">{fmtInt(r.flyerVerbrauchProWohnung)} kWh</div>
        </div>

        <div className="grid grid-cols-[1.3fr_1fr_1fr] border-t border-[#EDF1F6] text-[12.5px] text-[#1B2A3A]">
          <div className="px-3.5 py-2.5 text-[#5B6472]">Arbeitspreis</div>
          <div className="px-3 py-2.5 text-center font-semibold">{fmt2(grundversorgerPreis)} €</div>
          <div className="bg-[#F5FBFE] px-3 py-2.5 text-center text-[11.5px] font-semibold leading-snug">
            {fmt2(solarPreis)} € Solarstrom
            <br />
            {fmt2(netzPreis)} € Netzstrom
          </div>
        </div>

        <div className="grid grid-cols-[1.3fr_1fr_1fr] border-t border-[#EDF1F6] text-[12.5px] text-[#1B2A3A]">
          <div className="px-3.5 py-2.5 text-[#5B6472]">Grundgebühr / Monat</div>
          <div className="px-3 py-2.5 text-center font-semibold">{fmt2(grundversorgerGrundgebuehr)} €</div>
          <div className="bg-[#F5FBFE] px-3 py-2.5 text-center font-semibold">{fmt2(grundgebuehr)} €</div>
        </div>

        <div className="grid grid-cols-[1.3fr_1fr_1fr] border-t border-[#1B2A3A]/20 text-[13.5px] font-extrabold text-[#1B2A3A]">
          <div className="px-3.5 py-3">Gesamtkosten</div>
          <div className="px-3 py-3 text-center">{fmtInt(r.flyerGrundversorgerJahr)} €</div>
          <div className="bg-[#F5FBFE] px-3 py-3 text-center">{fmtInt(r.flyerMieterstromJahr)} €*</div>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between rounded-[10px] bg-[#FFEABF] px-4 py-3.5">
        <div className="text-[13px] font-bold text-[#5C4A24]">Ihr Vorteil: Eine jährliche Ersparnis von</div>
        <div className="text-[20px] font-extrabold text-[#1B2A3A]">{fmtInt(r.flyerErsparnisJahr)} €*</div>
      </div>

      <div className="mt-3 text-[10.5px] leading-relaxed text-[#98A2B3]">
        *Berechnung basierend auf {fmt1(solarAnteilPct)}% Solarstromanteil ({fmt2(solarPreis)} €/kWh) und{" "}
        {fmt1(netzAnteilPct)}% Reststromanteil ({fmt2(netzPreis)} €/kWh)
        <br />
        Kein Risiko – Selbst bei 100% Reststromanteil sparen Sie in diesem Modell noch.
      </div>
    </div>
  );
});
