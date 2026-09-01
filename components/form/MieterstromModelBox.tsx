"use client";

import { Collapse } from "@/components/ui/Collapse";
import { CollapsibleBox } from "@/components/ui/CollapsibleBox";
import { FieldLabel, NumberInput, SelectInput, YesNoToggle } from "@/components/ui/Field";
import { ChevronIcon, DiagramIcon, WarningIcon } from "@/components/ui/Icons";
import type { MieterstromCalculator } from "@/hooks/useMieterstromCalculator";
import { MesskonzeptDiagram } from "@/components/form/MesskonzeptDiagram";

export function MieterstromModelBox({ calc }: { calc: MieterstromCalculator }) {
  const { form, onNum, onText, setBool, box2Open, setBox2Open, wandlerWarning, messkonzeptExpanded, setMesskonzeptExpanded } =
    calc;

  return (
    <CollapsibleBox
      number={2}
      title="Mieterstrom-Modell & Messkonzept"
      open={box2Open}
      onToggle={() => setBox2Open(!box2Open)}
    >
      <div className="mb-4 grid grid-cols-2 gap-4">
        <div className="col-span-2">
          <FieldLabel label="Mieterstrom-Modell" />
          <SelectInput value={form.mieterstromModell} onChange={onText("mieterstromModell")}>
            <option value="physischer_sz">Physischer Summenzähler</option>
            <option value="virtueller_sz">Virtueller Summenzähler</option>
            <option value="ggv">Gemeinschaftliche Gebäudeversorgung (GGV)</option>
          </SelectInput>
        </div>
        <div>
          <FieldLabel label="Wohneinheiten" />
          <NumberInput min={0} value={form.wohneinheiten} onChange={onNum("wohneinheiten")} />
        </div>
        <div>
          <FieldLabel label="Gewerbeeinheiten" />
          <NumberInput min={0} value={form.gewerbeeinheiten} onChange={onNum("gewerbeeinheiten")} />
        </div>
      </div>

      <div className="my-1 mb-[18px] h-px bg-[#EDF1F6]" />

      <div className="mb-4 grid grid-cols-2 gap-x-6 gap-y-3.5">
        <div className="flex flex-col gap-3.5">
          <div>
            <FieldLabel label="Wärmepumpe" />
            <SelectInput value={form.waermepumpeModus} onChange={onText("waermepumpeModus")}>
              <option value="nein">Nein</option>
              <option value="eigener_zaehler">Ja, mit eigenem Zähler</option>
              <option value="allgemeinstrom">Ja, läuft auf Allgemeinstromzähler</option>
            </SelectInput>
          </div>
          <div>
            <FieldLabel label="Wallbox / Ladeinfrastruktur" />
            <SelectInput value={form.wallboxModus} onChange={onText("wallboxModus")}>
              <option value="nein">Nein </option>
              <option value="hinter_zaehler">Ja, hinter Mieter-/Allgemeinstromzähler</option>
              <option value="eigener_zaehler">Ja mit eigenem Zähler für Ladeinfrastruktur</option>
            </SelectInput>
          </div>
          <Collapse open={form.wallboxModus === "eigener_zaehler"} innerClassName="border-l-2 border-[#EDF1F6] pl-3">
            <FieldLabel label="Wallbox: Anzahl" />
            <NumberInput min={0} value={form.wallboxAnzahl} onChange={onNum("wallboxAnzahl")} />
          </Collapse>
        </div>
        <div className="flex flex-col gap-3.5">
          <YesNoToggle
            label="Allgemeinstrom"
            value={form.allgemeinstrom}
            onChange={(v) => setBool("allgemeinstrom", v)}
          />
          <YesNoToggle
            label="Wandlermessung"
            value={form.wandlermessung}
            onChange={(v) => setBool("wandlermessung", v)}
          />
          <YesNoToggle
            label="Durchlauferhitzer vorhanden"
            value={form.durchlauferhitzer}
            onChange={(v) => setBool("durchlauferhitzer", v)}
          />
          <Collapse open={form.durchlauferhitzer} innerClassName="border-l-2 border-[#EDF1F6] pl-3">
            <FieldLabel label="Durchlauferhitzer: Anzahl" />
            <NumberInput min={0} value={form.durchlauferhitzerAnzahl} onChange={onNum("durchlauferhitzerAnzahl")} />
          </Collapse>
        </div>
      </div>

      <Collapse open={wandlerWarning} innerClassName="mb-4 flex items-start gap-2.5 rounded-[10px] border border-[#CFE3F0] bg-[#EAF6FC] px-3.5 py-3">
        <WarningIcon className="mt-0.5 shrink-0 text-[#3AA8DC]" />
        <span className="text-[12.5px] font-semibold text-[#1B2A3A]">Wandlermessung für Summenzähler prüfen</span>
      </Collapse>

      <div className="mt-[18px] overflow-hidden rounded-[10px] border border-[#EDF1F6] bg-white">
        <button
          type="button"
          onClick={() => setMesskonzeptExpanded(!messkonzeptExpanded)}
          className="flex w-full cursor-pointer appearance-none items-center justify-between gap-2.5 bg-transparent px-3.5 py-3 text-left outline-none transition-colors hover:bg-[#F7FAFC]"
        >
          <span className="flex items-center gap-2.5">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center text-[#3AA8DC]">
              <DiagramIcon />
            </span>
            <span className="flex flex-col">
              <span className="text-[13px] font-bold text-[#1B2A3A]">Messkonzept-Diagramm</span>
              <span className="text-[11px] text-[#98A2B3]">Zeigt die Zähler- und Verteilungsstruktur der Anlage</span>
            </span>
          </span>
          <ChevronIcon
            className="shrink-0 text-[#3AA8DC] transition-transform"
            style={{ transform: messkonzeptExpanded ? "rotate(180deg)" : "rotate(0deg)" }}
          />
        </button>

        <Collapse open={messkonzeptExpanded} innerClassName="border-t border-[#EDF1F6] px-3.5 pt-8 pb-3.5">
          <MesskonzeptDiagram form={form} bare />
        </Collapse>
      </div>
    </CollapsibleBox>
  );
}
