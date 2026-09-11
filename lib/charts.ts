// Pure layout/formatting helpers for the amortisation chart: turns ComputedResults'
// 20-year cumulative profit series into pixel heights, gridlines, and labels for the
// (CSS-based, not canvas) bar chart markup.
import { ComputedResults, fmtInt, niceCeil } from "./calculator";

export interface GridLine {
  top: number;
  label: string;
  lineStyle: string;
}

// Fixed vertical positions (in the chart's coordinate space) for the five horizontal
// gridlines: +max, +max/2, zero, -max/2, -max.
const GRID_TOPS = [0, 35, 70, 105, 140];

// Rounded to avoid SSR/CSR floating-point drift (e.g. Math.pow) producing mismatched
// style strings between server and client render, which breaks React hydration.
function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

function buildGridLines(yMax: number): GridLine[] {
  return [
    { top: GRID_TOPS[0], label: `${fmtInt(yMax)} €`, lineStyle: "1px dashed #E5EAF1" },
    { top: GRID_TOPS[1], label: `${fmtInt(yMax / 2)} €`, lineStyle: "1px dashed #E5EAF1" },
    { top: GRID_TOPS[2], label: "0 €", lineStyle: "1.5px solid #98A2B3" },
    { top: GRID_TOPS[3], label: `${fmtInt(-yMax / 2)} €`, lineStyle: "1px dashed #E5EAF1" },
    { top: GRID_TOPS[4], label: `${fmtInt(-yMax)} €`, lineStyle: "1px dashed #E5EAF1" },
  ];
}

export interface Bar {
  posHeight: number;
  negHeight: number;
  color: string;
  tooltip: string;
}

// Builds one bar per year of r.series (cumulative profit), scaled against the series'
// own peak magnitude so the tallest bar (positive or negative) always fills the chart.
export function chartBarsKumuliert(r: ComputedResults): { bars: Bar[]; gridLines: GridLine[] } {
  const maxAbs = Math.max(...r.series.map((v) => Math.abs(v)), 1);
  const yMax = niceCeil(maxAbs);
  const bars = r.series.map((v, i) => ({
    posHeight: v > 0 ? round2((v / yMax) * 70) : 0,
    negHeight: v < 0 ? round2((Math.abs(v) / yMax) * 70) : 0,
    color: v >= 0 ? "#F2D9A6" : "#3AA8DC",
    tooltip: `Jahr ${i + 1}: ${fmtInt(v)} €`,
  }));
  return { bars, gridLines: buildGridLines(yMax) };
}

// Splits the chart timeline into a "deficit" phase (before break-even) and a "profit"
// phase (after), expressed as percentages of total chart width for a two-tone background.
export function chartPhase(r: ComputedResults) {
  const beY = r.breakEvenYear;
  const deficitWidthPct = beY ? ((beY - 1) / (r.series.length - 1)) * 100 : 100;
  return {
    deficitWidthPct,
    profitWidthPct: 100 - deficitWidthPct,
    breakEvenLabel: beY ? `Break-even: Jahr ${beY}` : "Kein Break-even in 20 Jahren",
  };
}

// Labels every 5th year (plus year 1) on the x-axis to avoid crowding 20 labels together.
export function chartYearLabels(r: ComputedResults) {
  return r.series.map((_v, i) => ({ yearLabel: i === 0 || (i + 1) % 5 === 0 ? String(i + 1) : "" }));
}

