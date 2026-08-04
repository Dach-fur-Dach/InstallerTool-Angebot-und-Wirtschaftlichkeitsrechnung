"use client";

import { Fragment } from "react";
import Image from "next/image";
import { MODELL_LABEL, UST, fmt2 } from "@/lib/calculator";
import type { MieterstromCalculator } from "@/hooks/useMieterstromCalculator";
import { ChevronIcon } from "@/components/ui/Icons";

const money = (n: number) => `${fmt2(n)} €`;
const brutto = (n: number) => n * (1 + UST);

export function AngebotPanel({ calc }: { calc: MieterstromCalculator }) {
  const { angebotReady, results: r, loading, form, messtechnikExpanded, setMesstechnikExpanded } = calc;
  const messkonzeptLabel = MODELL_LABEL[form.mieterstromModell] ?? "GGV";
  const todayFmt = new Date().toLocaleDateString("de-DE");
  const dashboardOpacity = loading ? 0.55 : 1;

  const messtechnikComponents = ["PV-Anlage"];
  if (r.wpOwnMeter) messtechnikComponents.push("WP");
  if (r.wallboxOwnMeter) messtechnikComponents.push("Wallbox");
  const messtechnikLabel = messtechnikComponents.join(" / ");

  const messtechnikRows: { label: string; price: number }[] = [{ label: "Zähler PV-Anlage", price: r.zaehlerStueckpreis }];
  if (r.wpOwnMeter) messtechnikRows.push({ label: "Zähler Wärmepumpe", price: r.zaehlerStueckpreis });
  if (r.wallboxOwnMeter) messtechnikRows.push({ label: "Zähler Wallbox / Ladeinfrastruktur", price: r.zaehlerStueckpreis });

  return (
    <div className="relative rounded-2xl border border-[#E5EAF1] bg-[#FCFBF9] px-7 py-[26px] shadow-[0_1px_3px_rgba(16,24,40,0.06)]">
      <div className="relative mb-5 flex items-start justify-between">
        <div className="text-[12.5px] font-medium text-[#5B6472]">{todayFmt}</div>
        <Image src="/logo.png" alt="Dach für Dach" height={22} width={92} className="h-[22px] w-auto" />
      </div>

      <h3 className="mb-4 text-base font-extrabold text-[#1B2A3A]">
        Leistungsübersicht: Mieterstrom ({messkonzeptLabel})
      </h3>

      {angebotReady ? (
        <div style={{ opacity: dashboardOpacity, transition: "opacity 0.25s ease" }}>
          <div className="mb-2 grid grid-cols-[1.6fr_0.8fr_0.7fr_0.8fr] gap-x-2 gap-y-1 border-b border-[#E5EAF1] pb-2 text-[11.5px] font-bold tracking-wide text-[#5B6472] uppercase">
            <div>Position</div>
            <div className="text-right">Preis (netto)</div>
            <div className="text-right">USt. (19%)</div>
            <div className="text-right">Preis (brutto)</div>
          </div>

          <div className="mb-1 grid grid-cols-[1.6fr_0.8fr_0.7fr_0.8fr] gap-x-2 gap-y-1.5 text-[12.5px] text-[#1B2A3A]">
            <div className="font-bold">Projekt Einrichtung</div>
            <div className="text-right font-semibold">{money(r.projektNetto)}</div>
            <div className="text-right text-[#98A2B3]">{money(r.projektNetto * UST)}</div>
            <div className="text-right font-semibold">{money(brutto(r.projektNetto))}</div>

            <div className="col-span-4 mt-2 font-bold">Messtechnik Einrichtung</div>

            <div className="pl-1 text-[#5B6472]">{r.zaehlerWEAnzahl}x Zähler Wohneinheit</div>
            <div className="text-right">{money(r.zaehlerWENetto)}</div>
            <div className="text-right text-[#98A2B3]">{money(r.zaehlerWENetto * UST)}</div>
            <div className="text-right">{money(brutto(r.zaehlerWENetto))}</div>

            <div className="pl-1 text-[#5B6472]">{r.zaehlerASAnzahl}x Zähler Allgemeinstrom</div>
            <div className="text-right">{money(r.zaehlerASNetto)}</div>
            <div className="text-right text-[#98A2B3]">{money(r.zaehlerASNetto * UST)}</div>
            <div className="text-right">{money(brutto(r.zaehlerASNetto))}</div>

            <div
              onClick={() => setMesstechnikExpanded(!messtechnikExpanded)}
              className="relative cursor-pointer pl-1 text-[#5B6472] select-none"
            >
              <ChevronIcon
                className="absolute top-1/2 -left-3.5 text-[#C2C9D3] transition-transform"
                style={{ transform: `translateY(-50%) rotate(${messtechnikExpanded ? 180 : 0}deg)` }}
              />
              {r.pvWpWallboxAnzahl}x Zähler {messtechnikLabel}
            </div>
            <div className="text-right">{money(r.zaehlerPVNetto)}</div>
            <div className="text-right text-[#98A2B3]">{money(r.zaehlerPVNetto * UST)}</div>
            <div className="text-right">{money(brutto(r.zaehlerPVNetto))}</div>

            {messtechnikExpanded &&
              messtechnikRows.map((row) => (
                <Fragment key={row.label}>
                  <div className="pl-6 text-[11.5px] text-[#98A2B3]">1x {row.label}</div>
                  <div className="text-right text-[11.5px] text-[#98A2B3]">{money(row.price)}</div>
                  <div className="text-right text-[11.5px] text-[#98A2B3]">{money(row.price * UST)}</div>
                  <div className="text-right text-[11.5px] text-[#98A2B3]">{money(brutto(row.price))}</div>
                </Fragment>
              ))}

            <div className="pl-1 text-[#5B6472]">1x Gateway</div>
            <div className="text-right">{money(r.gatewayNetto)}</div>
            <div className="text-right text-[#98A2B3]">{money(r.gatewayNetto * UST)}</div>
            <div className="text-right">{money(brutto(r.gatewayNetto))}</div>

            <div className="pl-1 text-[#5B6472]">{r.funkadapterAnzahl}x Funkadapter für Zähler</div>
            <div className="text-right">{money(r.funkadapterNetto)}</div>
            <div className="text-right text-[#98A2B3]">{money(r.funkadapterNetto * UST)}</div>
            <div className="text-right">{money(brutto(r.funkadapterNetto))}</div>
          </div>

          <div className="mt-1.5 grid grid-cols-[1.6fr_0.8fr_0.7fr_0.8fr] gap-2 border-t border-[#1B2A3A] py-2.5 text-[13px] font-extrabold text-[#1B2A3A]">
            <div>Summe einmalige Kosten:</div>
            <div className="text-right">{money(r.einmaligNetto)}</div>
            <div className="text-right">{money(r.einmaligUst)}</div>
            <div className="text-right">{money(r.einmaligBrutto)}</div>
          </div>

          <div className="mt-5 grid grid-cols-[1.6fr_0.8fr_0.7fr_0.8fr] gap-x-2 gap-y-1.5 text-[12.5px] text-[#1B2A3A]">
            <div className="font-bold">Abrechnung (Standard)</div>
            <div className="text-right font-semibold">{money(r.abrechnungNetto)}</div>
            <div className="text-right text-[#98A2B3]">{money(r.abrechnungNetto * UST)}</div>
            <div className="text-right font-semibold">{money(brutto(r.abrechnungNetto))}</div>
            <div className="col-span-4 -mt-1 text-[11px] text-[#98A2B3]">Für Zählpunkte: {r.zaehlpunkte}</div>

            <div className="mt-2.5 font-bold">Zählergebühren</div>
            <div className="mt-2.5 text-right font-semibold">{money(r.zaehlgebuehrNetto)}</div>
            <div className="mt-2.5 text-right text-[#98A2B3]">{money(r.zaehlgebuehrNetto * UST)}</div>
            <div className="mt-2.5 text-right font-semibold">{money(brutto(r.zaehlgebuehrNetto))}</div>
            <div className="col-span-4 -mt-1 text-[11px] text-[#98A2B3]">
              {form.mieterstromModell === "physischer_sz"
                ? "Entfällt für teilnehmende Wohneinheiten durch Messkonzept mit physischem Summenzähler"
                : `Für Zählpunkte: ${r.zaehlpunkte} inkl. ${messkonzeptLabel}`}
            </div>
          </div>

          <div className="mt-2.5 grid grid-cols-[1.6fr_0.8fr_0.7fr_0.8fr] gap-2 border-t border-[#1B2A3A] py-2.5 text-[13px] font-extrabold text-[#1B2A3A]">
            <div>Summe jährliche Kosten:</div>
            <div className="text-right">{money(r.jaehrlichNetto)}</div>
            <div className="text-right">{money(r.jaehrlichUst)}</div>
            <div className="text-right">{money(r.jaehrlichBrutto)}</div>
          </div>

          <div className="mt-[18px] text-[11px] leading-relaxed text-[#98A2B3]">
            Hinweis: Einmalige und jährliche Kosten werden mit Beauftragung in Rechnung gestellt. Einbaukosten für die
            Installation sowie Zählergebühren des Partner-Messstellenbetreibers werden ggf. separat abgerechnet.
          </div>
        </div>
      ) : (
        <div>
          <div className="mb-3 h-3.5 w-[70%] rounded-md bg-[#F1F4F8]" />
          <div className="mb-3 h-3.5 w-[90%] rounded-md bg-[#F1F4F8]" />
          <div className="mb-3 h-3.5 w-[60%] rounded-md bg-[#F1F4F8]" />
          <div className="mb-[30px] h-3.5 w-[80%] rounded-md bg-[#F1F4F8]" />
          <div className="text-center text-[12.5px] text-[#98A2B3]">
            Bitte Objektadresse (Box 1) angeben, um das Angebot zu erstellen.
          </div>
        </div>
      )}
    </div>
  );
}
