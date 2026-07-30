"use client";

import { CollapsibleBox } from "@/components/ui/CollapsibleBox";
import { FieldLabel, TextInput } from "@/components/ui/Field";
import type { MieterstromCalculator } from "@/hooks/useMieterstromCalculator";

export function CustomerBuildingBox({ calc }: { calc: MieterstromCalculator }) {
  const { form, onText, box1Open, setBox1Open, showRechnungsadresse, setShowRechnungsadresse } = calc;

  return (
    <CollapsibleBox number={1} title="Kunde & Gebäude" open={box1Open} onToggle={() => setBox1Open(!box1Open)}>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <FieldLabel label="Objekt Str. + Nr." required />
          <TextInput value={form.objektStrasse} onChange={onText("objektStrasse")} />
        </div>
        <div>
          <FieldLabel label="Objekt PLZ + Stadt" required />
          <TextInput value={form.objektPlzStadt} onChange={onText("objektPlzStadt")} />
        </div>
        <div>
          <FieldLabel label="Kundenname" />
          <TextInput value={form.kunde} onChange={onText("kunde")} placeholder="optional" />
        </div>
        <div>
          <FieldLabel label="Installer" />
          <TextInput value={form.installer} onChange={onText("installer")} placeholder="optional" />
        </div>
        <div className="col-span-2">
          <label className="flex cursor-pointer items-center gap-2.5">
            <input
              type="checkbox"
              checked={showRechnungsadresse}
              onChange={() => setShowRechnungsadresse(!showRechnungsadresse)}
              className="h-4 w-4 accent-[#3AA8DC]"
            />
            <span className="text-[13px] font-semibold text-[#344054]">Abweichende Rechnungsadresse</span>
          </label>
        </div>
        {showRechnungsadresse && (
          <>
            <div>
              <FieldLabel label="Rechnungsadresse Str. + Nr." />
              <TextInput value={form.rechnungStrasse} onChange={onText("rechnungStrasse")} placeholder="optional" />
            </div>
            <div>
              <FieldLabel label="Rechnungsadresse PLZ + Stadt" />
              <TextInput value={form.rechnungPlzStadt} onChange={onText("rechnungPlzStadt")} placeholder="optional" />
            </div>
          </>
        )}
      </div>
    </CollapsibleBox>
  );
}
