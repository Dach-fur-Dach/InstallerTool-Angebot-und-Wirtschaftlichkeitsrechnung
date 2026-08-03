"use client";

import { Collapse } from "@/components/ui/Collapse";
import { CollapsibleBox } from "@/components/ui/CollapsibleBox";
import { FieldLabel, NumberInput, SelectInput, YesNoToggle } from "@/components/ui/Field";
import type { MieterstromCalculator } from "@/hooks/useMieterstromCalculator";

export function MieterstromModelBox({ calc }: { calc: MieterstromCalculator }) {
  const {
    form,
    onNum,
    onText,
    setBool,
    box2Open,
    setBox2Open,
    wandlerWarning,
    messkonzeptExpanded,
    setMesskonzeptExpanded,
    messkonzeptSlots,
    setMesskonzeptLabel,
  } = calc;

  return (
    <CollapsibleBox
      number={2}
      title="Mieterstrom-Modell, Messkonzept & Energiesystem"
      open={box2Open}
      onToggle={() => setBox2Open(!box2Open)}
    >
      <div className="mb-4 grid grid-cols-2 gap-4">
        <div className="col-span-2">
          <FieldLabel label="Mieterstrom-Modell" />
          <SelectInput value={form.mieterstromModell} onChange={onText("mieterstromModell")}>
            <option value="physischer_sz">Physischer Summenzähler</option>
            <option value="ggv">GGV</option>
            <option value="virtueller_sz">Virtueller SZ</option>
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
              <option value="nein">Nein (Standard)</option>
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

      <Collapse open={wandlerWarning} innerClassName="mb-4 flex items-start gap-2.5 rounded-[10px] border border-[#F0D3AE] bg-[#FDF0E3] px-3.5 py-3">
        <span className="text-[15px] leading-none">⚠</span>
        <span className="text-[12.5px] font-semibold text-[#8A5A24]">Wandlermessung für Summenzähler prüfen</span>
      </Collapse>

      <div
        onClick={() => setMesskonzeptExpanded(!messkonzeptExpanded)}
        className="mt-[18px] flex cursor-pointer items-center justify-between border-t border-[#EDF1F6] pt-3.5"
      >
        <span className="text-[13px] font-bold text-[#5B6472]">Messkonzept (erweitert)</span>
        <span className="text-xs font-bold text-[#3AA8DC]">{messkonzeptExpanded ? "Einklappen −" : "Ausklappen +"}</span>
      </div>

      <Collapse open={messkonzeptExpanded} innerClassName="mt-3.5">
        <div className="mb-2.5 text-[11.5px] text-[#98A2B3]">
          Reihenfolge der Zähler am Summenzähler — klicken zum Umbenennen.
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          {messkonzeptSlots.map((slot, i) => (
            <div key={i} className="flex items-center gap-1.5">
              <input
                type="text"
                value={slot.label}
                onChange={(e) => setMesskonzeptLabel(i, e.target.value)}
                className="w-[76px] rounded-lg border border-[#D0D5DD] bg-[#F8FAFC] px-1.5 py-2 text-center text-xs font-bold text-[#0A1628]"
              />
              {slot.hasArrow && <span className="text-sm text-[#B0B8C4]">→</span>}
            </div>
          ))}
        </div>
      </Collapse>
    </CollapsibleBox>
  );
}
