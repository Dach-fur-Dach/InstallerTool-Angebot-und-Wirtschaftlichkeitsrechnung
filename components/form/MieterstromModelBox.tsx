"use client";

import { Collapse } from "@/components/ui/Collapse";
import { CollapsibleBox } from "@/components/ui/CollapsibleBox";
import { ButtonGroup, FieldLabel, NumberInput, SelectInput, SliderField, SwitchRow } from "@/components/ui/Field";
import { ChevronIcon, DiagramIcon, WarningIcon } from "@/components/ui/Icons";
import type { MieterstromCalculator } from "@/hooks/useMieterstromCalculator";
import { MesskonzeptDiagram } from "@/components/form/MesskonzeptDiagram";

export function MieterstromModelBox({ calc }: { calc: MieterstromCalculator }) {
  const {
    form,
    onNum,
    onText,
    setNum,
    setWaermepumpe,
    setMieterstromModell,
    setBool,
    box2Open,
    setBox2Open,
    wandlerWarning,
    messkonzeptExpanded,
    setMesskonzeptExpanded,
  } = calc;

  return (
    <CollapsibleBox
      number={2}
      title="Mieterstrom-Modell & Messkonzept"
      open={box2Open}
      onToggle={() => setBox2Open(!box2Open)}
    >
      <div className="mb-4 flex flex-col gap-4">
        <div>
          <FieldLabel label="Mieterstrom-Modell" />
          <ButtonGroup
            value={form.mieterstromModell === "physischer_sz" ? "physischer_sz_sw" : form.mieterstromModell}
            onChange={setMieterstromModell}
            options={[
              { value: "physischer_sz_sw", label: "Mieterstrom (phys. Summenzähler)" },
              { value: "virtueller_sz", label: "Mieterstrom (virt. Summenzähler)" },
              { value: "ggv", label: "GGV (Gemeinschaftliche Gebäudeversorgung)" },
            ]}
          />
        </div>
        <SliderField
          label="Wohneinheiten"
          min={0}
          max={40}
          value={form.wohneinheiten}
          onChange={(v) => setNum("wohneinheiten", v)}
        />
        <SliderField
          label="Gewerbeeinheiten"
          min={0}
          max={20}
          value={form.gewerbeeinheiten}
          onChange={(v) => setNum("gewerbeeinheiten", v)}
        />
      </div>

      <div className="my-1 mb-[18px] h-px bg-[#EDF1F6]" />

      <div className="mb-4 flex flex-col gap-4">
        <div className="grid grid-cols-2 gap-x-6 gap-y-1">
          <SwitchRow
            label="Wärmepumpe"
            value={form.waermepumpeModus !== "nein"}
            onChange={(v) => setWaermepumpe(v)}
          />
          <SwitchRow
            label="Allgemeinstrom"
            value={form.allgemeinstrom}
            onChange={(v) => setBool("allgemeinstrom", v)}
          />
          <SwitchRow
            label="Wandlermessung"
            value={form.wandlermessung}
            onChange={(v) => setBool("wandlermessung", v)}
          />
          <SwitchRow
            label="Durchlauferhitzer vorhanden"
            value={form.durchlauferhitzer}
            onChange={(v) => setBool("durchlauferhitzer", v)}
          />
        </div>
        <Collapse open={form.durchlauferhitzer} innerClassName="border-l-2 border-[#EDF1F6] pl-3">
          <FieldLabel label="Durchlauferhitzer: Anzahl" />
          <NumberInput integer min={0} value={form.durchlauferhitzerAnzahl} onChange={onNum("durchlauferhitzerAnzahl")} />
        </Collapse>
        <div>
          <FieldLabel label="Wallbox / Ladeinfrastruktur" />
          <SelectInput value={form.wallboxModus} onChange={onText("wallboxModus")}>
            <option value="nein">Nein </option>
            <option value="hinter_zaehler">Ja, hinter Mieter-/Allgemeinstromzähler</option>
            <option value="eigener_zaehler">Ja mit eigenem Zähler für Ladeinfrastruktur</option>
          </SelectInput>
        </div>
        <Collapse open={form.wallboxModus !== "nein"} innerClassName="border-l-2 border-[#EDF1F6] pl-3">
          <SliderField
            label="Wallbox: Anzahl"
            min={0}
            max={15}
            value={form.wallboxAnzahl}
            onChange={(v) => setNum("wallboxAnzahl", v)}
          />
        </Collapse>
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

        <Collapse open={messkonzeptExpanded} innerClassName="border-t border-[#EDF1F6] px-3.5 pt-3.5 pb-3.5">
          <MesskonzeptDiagram form={form} bare />
        </Collapse>
      </div>
    </CollapsibleBox>
  );
}
