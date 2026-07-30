import { ComputedResults, fmtInt, niceCeil } from "./calculator";

export interface GridLine {
  top: number;
  label: string;
  lineStyle: string;
}

const GRID_TOPS = [0, 35, 70, 105, 140];

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

export function chartBarsKumuliert(r: ComputedResults): { bars: Bar[]; gridLines: GridLine[] } {
  const maxAbs = Math.max(...r.series.map((v) => Math.abs(v)), 1);
  const yMax = niceCeil(maxAbs);
  const bars = r.series.map((v, i) => ({
    posHeight: v > 0 ? (v / yMax) * 70 : 0,
    negHeight: v < 0 ? (Math.abs(v) / yMax) * 70 : 0,
    color: v >= 0 ? "#F2D9A6" : "#3AA8DC",
    tooltip: `Jahr ${i + 1}: ${fmtInt(v)} €`,
  }));
  return { bars, gridLines: buildGridLines(yMax) };
}

export function chartBarsJaehrlich(r: ComputedResults): { bars: Bar[]; gridLines: GridLine[] } {
  const vals = r.seriesYearly.map((y) => y.jahresGewinn);
  const maxAbs = Math.max(...vals.map((v) => Math.abs(v)), 1);
  const yMax = niceCeil(maxAbs);
  const bars = r.seriesYearly.map((y, i) => ({
    posHeight: y.jahresGewinn > 0 ? (y.jahresGewinn / yMax) * 70 : 0,
    negHeight: y.jahresGewinn < 0 ? (Math.abs(y.jahresGewinn) / yMax) * 70 : 0,
    color: y.jahresGewinn >= 0 ? "#F2D9A6" : "#3AA8DC",
    tooltip: `Jahr ${i + 1}: Einnahmen ${fmtInt(y.jahresEinnahmen)} € − Betriebskosten ${fmtInt(y.betrieb)} € = Gewinn ${fmtInt(y.jahresGewinn)} €`,
  }));
  return { bars, gridLines: buildGridLines(yMax) };
}

export interface LinePoint {
  cx: number;
  cy: number;
  color: string;
  tooltip: string;
}

export function chartLine(r: ComputedResults): { path: string; points: LinePoint[] } {
  const maxAbs = Math.max(...r.series.map((v) => Math.abs(v)), 1);
  const yMax = niceCeil(maxAbs);
  const n = r.series.length;
  const pts = r.series.map((v, i) => ({
    x: n > 1 ? (i / (n - 1)) * 300 : 0,
    y: 70 - (v / yMax) * 70,
    v,
    i,
  }));
  const path = pts.map((p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ");
  return {
    path,
    points: pts.map((p) => ({
      cx: p.x,
      cy: p.y,
      color: p.v >= 0 ? "#C9971F" : "#3AA8DC",
      tooltip: `Jahr ${p.i + 1}: ${fmtInt(p.v)} €`,
    })),
  };
}

export interface ChartDonut {
  gradient: string;
  investPct: string;
  betriebPct: string;
  gewinnPct: string;
  investVal: string;
  betriebVal: string;
  gewinnVal: string;
  totalVal: string;
}

export function chartDonut(r: ComputedResults, fmt1: (n: number) => string): ChartDonut {
  const totalEinnahmen20 = r.seriesYearly.reduce((s, y) => s + y.jahresEinnahmen, 0);
  const totalBetrieb20 = r.betrieb * 20;
  const gewinn20safe = Math.max(0, r.gewinn20);
  const total = r.investition + totalBetrieb20 + gewinn20safe;
  const investPct = total > 0 ? (r.investition / total) * 100 : 0;
  const betriebPct = total > 0 ? (totalBetrieb20 / total) * 100 : 0;
  const gewinnPct = total > 0 ? (gewinn20safe / total) * 100 : 0;
  const b1 = investPct;
  const b2 = investPct + betriebPct;
  return {
    gradient: `conic-gradient(#3AA8DC 0% ${b1.toFixed(1)}%, #98A2B3 ${b1.toFixed(1)}% ${b2.toFixed(1)}%, #F2D9A6 ${b2.toFixed(1)}% 100%)`,
    investPct: fmt1(investPct),
    betriebPct: fmt1(betriebPct),
    gewinnPct: fmt1(gewinnPct),
    investVal: fmtInt(r.investition),
    betriebVal: fmtInt(totalBetrieb20),
    gewinnVal: fmtInt(gewinn20safe),
    totalVal: fmtInt(totalEinnahmen20),
  };
}

export function chartPhase(r: ComputedResults) {
  const beY = r.breakEvenYear;
  const deficitWidthPct = beY ? ((beY - 1) / (r.series.length - 1)) * 100 : 100;
  return {
    deficitWidthPct,
    profitWidthPct: 100 - deficitWidthPct,
    breakEvenLabel: beY ? `Break-even: Jahr ${beY}` : "Kein Break-even in 20 Jahren",
  };
}

export function chartYearLabels(r: ComputedResults) {
  return r.series.map((_v, i) => ({ yearLabel: i === 0 || (i + 1) % 5 === 0 ? String(i + 1) : "" }));
}
