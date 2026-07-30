"use client";

import { fmt1 } from "@/lib/calculator";
import {
  chartBarsJaehrlich,
  chartBarsKumuliert,
  chartDonut,
  chartLine,
  chartPhase,
  chartYearLabels,
} from "@/lib/charts";
import type { ChartMode, MieterstromCalculator } from "@/hooks/useMieterstromCalculator";

const MODES: { key: ChartMode; label: string }[] = [
  { key: "kumuliert", label: "Kumuliert" },
  { key: "jaehrlich", label: "Jährlich" },
  { key: "verlauf", label: "Verlauf" },
  { key: "verteilung", label: "Verteilung" },
];

const CAPTIONS: Record<ChartMode, string> = {
  jaehrlich: "Jährlicher Gewinn/Verlust (Einnahmen abzüglich Betriebskosten), unter Annahme von 3% Strompreissteigerung p.a.",
  verlauf: "Verlauf des kumulierten Gewinns über die Laufzeit, mit Kennzeichnung von Defizit- und Gewinnphase.",
  verteilung: "Verteilung der Gesamteinnahmen über 20 Jahre auf Investition, Betriebskosten und Nettogewinn.",
  kumuliert: "Kumulierter Gewinn/Verlust nach Investition, unter Annahme von 3% Strompreissteigerung p.a.",
};

export function AmortisationChart({ calc }: { calc: MieterstromCalculator }) {
  const { results: r, chartMode, setChartMode } = calc;
  const showAxis = chartMode !== "verteilung";
  const phase = chartPhase(r);

  return (
    <div className="mt-3.5">
      <div className="mb-2.5 flex flex-wrap items-center justify-between gap-2">
        <div className="text-xs font-bold tracking-wide text-[#5B6472] uppercase">Amortisation über 20 Jahre</div>
        <div className="flex gap-1.5">
          {MODES.map((m) => (
            <button
              key={m.key}
              type="button"
              onClick={() => setChartMode(m.key)}
              className={
                chartMode === m.key
                  ? "cursor-pointer rounded-[7px] border border-[#3AA8DC] bg-[#3AA8DC] px-3.5 py-1.5 text-[12.5px] font-bold text-white"
                  : "cursor-pointer rounded-[7px] border border-[#D0D5DD] bg-white px-3.5 py-1.5 text-[12.5px] font-semibold text-[#667085]"
              }
            >
              {m.label}
            </button>
          ))}
        </div>
      </div>

      {showAxis && (
        <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
          <div className="text-[11px] text-[#98A2B3]">
            <span className="mr-1 inline-block h-2 w-2 rounded-sm bg-[#3AA8DC]" />
            Defizit <span className="mx-1.5 inline-block h-2 w-2 rounded-sm bg-[#F2D9A6]" />
            Gewinn
          </div>
          <div className="text-[11px] font-bold text-[#5B6472]">{phase.breakEvenLabel}</div>
        </div>
      )}

      {chartMode === "jaehrlich" && <BarChart calc={calc} kind="jaehrlich" />}
      {chartMode === "kumuliert" && <BarChart calc={calc} kind="kumuliert" />}
      {chartMode === "verlauf" && <LineChart calc={calc} />}
      {chartMode === "verteilung" && <DonutChart calc={calc} />}

      {showAxis && (
        <div className="flex gap-2">
          <div className="w-[52px] shrink-0" />
          <div className="flex flex-1 gap-[3px]">
            {chartYearLabels(r).map((y, i) => (
              <div key={i} className="mt-1 min-w-[6px] flex-1 text-center text-[9.5px] text-[#98A2B3]">
                {y.yearLabel}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mt-1.5 text-[11px] text-[#98A2B3]">{CAPTIONS[chartMode]}</div>
    </div>
  );
}

function BarChart({ calc, kind }: { calc: MieterstromCalculator; kind: "kumuliert" | "jaehrlich" }) {
  const { results: r } = calc;
  const { bars, gridLines } = kind === "kumuliert" ? chartBarsKumuliert(r) : chartBarsJaehrlich(r);
  const phase = chartPhase(r);
  const showPhaseBg = kind === "kumuliert";

  return (
    <div className="flex gap-2">
      <div className="relative h-[140px] w-[52px] shrink-0">
        {gridLines.map((gl, i) => (
          <div
            key={i}
            className="absolute right-0 left-0 -translate-y-1/2 text-right text-[9.5px] text-[#98A2B3]"
            style={{ top: gl.top }}
          >
            {gl.label}
          </div>
        ))}
      </div>
      <div className="relative h-[140px] flex-1">
        {showPhaseBg && (
          <>
            <div
              className="absolute top-0 bottom-0 left-0 bg-[rgba(58,168,220,0.06)]"
              style={{ width: `${phase.deficitWidthPct}%` }}
            />
            <div
              className="absolute top-0 right-0 bottom-0 bg-[rgba(242,217,166,0.18)]"
              style={{ width: `${phase.profitWidthPct}%` }}
            />
          </>
        )}
        {gridLines.map((gl, i) => (
          <div key={i} className="absolute right-0 left-0" style={{ top: gl.top, borderTop: gl.lineStyle }} />
        ))}
        <div className="absolute inset-0 flex items-stretch gap-[3px]">
          {bars.map((bar, i) => (
            <div key={i} className="relative flex min-w-[6px] flex-1 flex-col justify-end">
              <div title={bar.tooltip} style={{ height: bar.posHeight, background: bar.color }} className="rounded-t-sm" />
              <div className="flex h-[70px] items-start">
                <div
                  title={bar.tooltip}
                  style={{ height: bar.negHeight, background: bar.color }}
                  className="w-full rounded-b-sm"
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function LineChart({ calc }: { calc: MieterstromCalculator }) {
  const { results: r } = calc;
  const { gridLines } = chartBarsKumuliert(r);
  const { path, points } = chartLine(r);
  const phase = chartPhase(r);

  return (
    <div className="flex gap-2">
      <div className="relative h-[140px] w-[52px] shrink-0">
        {gridLines.map((gl, i) => (
          <div
            key={i}
            className="absolute right-0 left-0 -translate-y-1/2 text-right text-[9.5px] text-[#98A2B3]"
            style={{ top: gl.top }}
          >
            {gl.label}
          </div>
        ))}
      </div>
      <div className="relative h-[140px] flex-1">
        <div
          className="absolute top-0 bottom-0 left-0 bg-[rgba(58,168,220,0.06)]"
          style={{ width: `${phase.deficitWidthPct}%` }}
        />
        <div
          className="absolute top-0 right-0 bottom-0 bg-[rgba(242,217,166,0.18)]"
          style={{ width: `${phase.profitWidthPct}%` }}
        />
        {gridLines.map((gl, i) => (
          <div key={i} className="absolute right-0 left-0" style={{ top: gl.top, borderTop: gl.lineStyle }} />
        ))}
        <svg viewBox="0 0 300 140" preserveAspectRatio="none" className="absolute inset-0 h-full w-full overflow-visible">
          <path d={path} fill="none" stroke="#3AA8DC" strokeWidth={2} />
          {points.map((pt, i) => (
            <circle key={i} cx={pt.cx} cy={pt.cy} r={3} fill={pt.color}>
              <title>{pt.tooltip}</title>
            </circle>
          ))}
        </svg>
      </div>
    </div>
  );
}

function DonutChart({ calc }: { calc: MieterstromCalculator }) {
  const { results: r } = calc;
  const donut = chartDonut(r, fmt1);

  return (
    <div className="flex flex-wrap items-center gap-7 py-1.5 pb-2.5">
      <div
        className="relative h-[140px] w-[140px] shrink-0 rounded-full"
        style={{ background: donut.gradient }}
      >
        <div className="absolute inset-[26px] flex flex-col items-center justify-center rounded-full bg-white text-center">
          <div className="text-[9.5px] font-semibold text-[#98A2B3]">Einnahmen 20J.</div>
          <div className="text-sm font-extrabold text-[#1B2A3A]">{donut.totalVal} €</div>
        </div>
      </div>
      <div className="flex min-w-[220px] flex-col gap-2.5">
        <DonutLegendRow color="#3AA8DC" label="Investition" value={donut.investVal} pct={donut.investPct} />
        <DonutLegendRow color="#98A2B3" label="Betriebskosten (20J.)" value={donut.betriebVal} pct={donut.betriebPct} />
        <DonutLegendRow color="#F2D9A6" label="Nettogewinn" value={donut.gewinnVal} pct={donut.gewinnPct} />
      </div>
    </div>
  );
}

function DonutLegendRow({ color, label, value, pct }: { color: string; label: string; value: string; pct: string }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div className="flex items-center gap-2 text-[12.5px] font-semibold text-[#344054]">
        <span className="inline-block h-[9px] w-[9px] rounded-sm" style={{ background: color }} />
        {label}
      </div>
      <div className="text-[12.5px] font-bold text-[#1B2A3A]">
        {value} € <span className="font-semibold text-[#98A2B3]">({pct} %)</span>
      </div>
    </div>
  );
}
