"use client";

import { chartBarsKumuliert, chartPhase, chartYearLabels } from "@/lib/charts";
import type { MieterstromCalculator } from "@/hooks/useMieterstromCalculator";

const CAPTION = "Kumulierter Gewinn/Verlust nach Investition, unter Annahme von 3% Strompreissteigerung p.a.";

export function AmortisationChart({ calc }: { calc: MieterstromCalculator }) {
  const { results: r } = calc;
  const phase = chartPhase(r);

  return (
    <div className="mt-3.5 break-inside-avoid">
      <div className="mb-2.5 flex flex-wrap items-center justify-between gap-2">
        <div className="text-[11px] font-bold uppercase tracking-wide text-[#5B6472]">Amortisation über 20 Jahre</div>
      </div>

      <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
        <div className="text-[11px] text-[#98A2B3]">
          <span className="mr-1 inline-block h-2 w-2 rounded-sm bg-[#3AA8DC]" />
          Defizit <span className="mx-1.5 inline-block h-2 w-2 rounded-sm bg-[#F2D9A6]" />
          Gewinn
        </div>
        <div className="text-[11px] font-bold text-[#5B6472]">{phase.breakEvenLabel}</div>
      </div>

      <BarChart calc={calc} />

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

      <div className="mt-1.5 text-[11px] text-[#98A2B3]">{CAPTION}</div>
    </div>
  );
}

function BarChart({ calc }: { calc: MieterstromCalculator }) {
  const { results: r } = calc;
  const { bars, gridLines } = chartBarsKumuliert(r);
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
