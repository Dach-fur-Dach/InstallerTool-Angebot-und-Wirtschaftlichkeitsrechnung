export type MieterstromModell = "physischer_sz" | "ggv" | "virtueller_sz";
export type WaermepumpeModus = "nein" | "eigener_zaehler" | "allgemeinstrom";
export type WallboxModus = "nein" | "hinter_zaehler" | "eigener_zaehler";
export type PvSzenario = "steildach" | "flachdach";
export type WpSzenario = "ungesteuert" | "pv_optimiert";

export interface FormState {
  mieterstromModell: MieterstromModell;
  wohneinheiten: number | "";
  gewerbeeinheiten: number | "";
  allgemeinstrom: boolean;
  waermepumpeModus: WaermepumpeModus;
  wandlermessung: boolean;
  durchlauferhitzer: boolean;
  durchlauferhitzerAnzahl: number | "";
  wallboxModus: WallboxModus;
  wallboxAnzahl: number | "";

  kunde: string;
  installer: string;
  rechnungStrasse: string;
  rechnungPlzStadt: string;
  objektStrasse: string;
  objektPlzStadt: string;

  pvGroesse: number | "";
  speicher: number | "";
  pvSzenario: PvSzenario;
  wpSzenario: WpSzenario;
  ertragProKwpManual: number | "";
  verbrauchAllgemeinManual: number | "";

  verbrauchWohnungen: number | "";
  verbrauchGewerbe: number | "";
  verbrauchWaermepumpe: number | "";

  pvPreis: number | "";
  netzPreis: number | "";
  grundgebuehr: number | "";
  grundversorgerPreis: number | "";
  grundversorgerGrundgebuehr: number | "";
}

export const DEFAULTS: FormState = {
  mieterstromModell: "physischer_sz",
  wohneinheiten: 24,
  gewerbeeinheiten: 2,
  allgemeinstrom: true,
  waermepumpeModus: "eigener_zaehler",
  wandlermessung: true,
  durchlauferhitzer: false,
  durchlauferhitzerAnzahl: 0,
  wallboxModus: "nein",
  wallboxAnzahl: 0,

  kunde: "",
  installer: "",
  rechnungStrasse: "",
  rechnungPlzStadt: "",
  objektStrasse: "Musterstraße 12",
  objektPlzStadt: "10115 Berlin",

  pvGroesse: 75,
  speicher: 30,
  pvSzenario: "steildach",
  wpSzenario: "pv_optimiert",
  ertragProKwpManual: "",
  verbrauchAllgemeinManual: "",

  verbrauchWohnungen: 60000,
  verbrauchGewerbe: 15000,
  verbrauchWaermepumpe: 20000,

  pvPreis: 0.27,
  netzPreis: 0.3,
  grundgebuehr: 10.0,
  grundversorgerPreis: 0.35,
  grundversorgerGrundgebuehr: 15.0,
};

const YIELD: Record<PvSzenario, number> = { steildach: 950, flachdach: 850 };
const ALLGEMEIN_PRO_EINHEIT = 700;
const FEED_IN_TARIF = 0.08;
export const MODELL_LABEL: Record<MieterstromModell, string> = {
  ggv: "GGV",
  virtueller_sz: "Virtueller SZ",
  physischer_sz: "Physischer SZ",
};

interface ModellPricing {
  projektpauschale: number;
  preisProZaehler: number;
  gateway: number;
}

const MODELL_PRICING: Record<MieterstromModell, ModellPricing> = {
  physischer_sz: { projektpauschale: 1299, preisProZaehler: 149, gateway: 349 },
  virtueller_sz: { projektpauschale: 1999, preisProZaehler: 25, gateway: 25 },
  ggv: { projektpauschale: 1999, preisProZaehler: 25, gateway: 25 },
};

const WHOLESALE_RESTSTROM = 0.22;
const MIETERSTROMZUSCHLAG = 0.021;
export const UST = 0.19;

export function num(v: unknown, fallback = 0): number {
  const n = parseFloat(String(v));
  return isFinite(n) ? n : fallback;
}

export function waermepumpeAktiv(f: FormState): boolean {
  return f.waermepumpeModus !== "nein";
}

export function niceCeil(n: number): number {
  if (n <= 0) return 1;
  const exp = Math.floor(Math.log10(n));
  const base = Math.pow(10, exp);
  const f = n / base;
  const nf = f <= 1 ? 1 : f <= 2 ? 2 : f <= 5 ? 5 : 10;
  return nf * base;
}

export interface YearlySeriesEntry {
  jahresEinnahmen: number;
  betrieb: number;
  jahresGewinn: number;
}

export interface ComputedResults {
  investition: number;
  betrieb: number;
  einnahmen: number;
  gewinnJahr1: number;
  rendite: number;
  amortisation: number;
  co2: number;
  autoAllgemein: number;
  ertragProKwp: number;
  allgemeinIsManual: boolean;
  ertragIsManual: boolean;
  verbrauchMieterstrom: number;
  verbrauchGesamt: number;
  wpVerbrauch: number;
  pvErtrag: number;
  eigenverbrauchGesamt: number;
  eigenverbrauchMieterstrom: number;
  eigenverbrauchWP: number;
  netzMieterstrom: number;
  netzWP: number;
  restbezug: number;
  ueberschusseinspeisung: number;
  eigenverbrauchsquote: number;
  autarkiegrad: number;
  einheiten: number;
  wpAktiv: boolean;
  wpOwnMeter: boolean;
  wallboxOwnMeter: boolean;
  pvWpWallboxAnzahl: number;
  kostenPV: number;
  kostenSpeicher: number;
  kostenMieterstrompaket: number;
  betriebVersicherung: number;
  betriebAbrechnung: number;
  betriebReststrom: number;
  betriebZaehler: number;
  einnahmenGrundgebuehr: number;
  einnahmenSolarstrom: number;
  einnahmenNetzstrom: number;
  einnahmenEinspeisung: number;
  einnahmenZuschlag: number;
  gewinn20: number;
  series: number[];
  seriesYearly: YearlySeriesEntry[];
  breakEvenYear: number | null;
  zaehlerWEAnzahl: number;
  projektNetto: number;
  zaehlerWENetto: number;
  zaehlerASNetto: number;
  zaehlerPVNetto: number;
  zaehlerStueckpreis: number;
  gatewayNetto: number;
  einmaligNetto: number;
  einmaligUst: number;
  einmaligBrutto: number;
  zaehlpunkte: number;
  abrechnungNetto: number;
  zaehlgebuehrNetto: number;
  jaehrlichNetto: number;
  jaehrlichUst: number;
  jaehrlichBrutto: number;
}

export function computeResults(f: FormState): ComputedResults {
  const einheiten = num(f.wohneinheiten) + num(f.gewerbeeinheiten);
  const autoAllgemeinCalc = f.allgemeinstrom ? einheiten * ALLGEMEIN_PRO_EINHEIT : 0;
  const allgemeinIsManual =
    f.verbrauchAllgemeinManual !== "" &&
    f.verbrauchAllgemeinManual != null &&
    isFinite(parseFloat(String(f.verbrauchAllgemeinManual)));
  const autoAllgemein = allgemeinIsManual ? num(f.verbrauchAllgemeinManual) : autoAllgemeinCalc;
  const wpAktiv = waermepumpeAktiv(f);
  const wpVerbrauch = wpAktiv ? num(f.verbrauchWaermepumpe) : 0;
  const verbrauchMieterstrom = num(f.verbrauchWohnungen) + autoAllgemein + num(f.verbrauchGewerbe);
  const verbrauchGesamt = verbrauchMieterstrom + wpVerbrauch;

  const ertragProKwpAuto = YIELD[f.pvSzenario] || YIELD.steildach;
  const ertragIsManual =
    f.ertragProKwpManual !== "" &&
    f.ertragProKwpManual != null &&
    isFinite(parseFloat(String(f.ertragProKwpManual)));
  const ertragProKwp = ertragIsManual ? num(f.ertragProKwpManual) : ertragProKwpAuto;
  const pvErtrag = num(f.pvGroesse) * ertragProKwp;

  let quote = 0.3;
  if (verbrauchGesamt > 0) quote += Math.min(0.3, (num(f.speicher) * 1.6) / verbrauchGesamt);
  if (wpAktiv && f.wpSzenario === "pv_optimiert") quote += 0.06;
  quote = Math.min(0.85, quote);

  const eigenverbrauchGesamt = Math.min(pvErtrag, verbrauchGesamt) * quote;
  const eigenverbrauchMieterstrom =
    verbrauchGesamt > 0 ? eigenverbrauchGesamt * (verbrauchMieterstrom / verbrauchGesamt) : 0;
  const eigenverbrauchWP = eigenverbrauchGesamt - eigenverbrauchMieterstrom;
  const netzMieterstrom = Math.max(0, verbrauchMieterstrom - eigenverbrauchMieterstrom);
  const netzWP = Math.max(0, wpVerbrauch - eigenverbrauchWP);
  const restbezug = netzMieterstrom + netzWP;
  const ueberschusseinspeisung = Math.max(0, pvErtrag - eigenverbrauchGesamt);
  const eigenverbrauchsquote = pvErtrag > 0 ? (eigenverbrauchGesamt / pvErtrag) * 100 : 0;
  const autarkiegrad = verbrauchGesamt > 0 ? (eigenverbrauchGesamt / verbrauchGesamt) * 100 : 0;

  const wpOwnMeter = f.waermepumpeModus === "eigener_zaehler";
  const wallboxOwnMeter = f.wallboxModus === "eigener_zaehler";
  const pvWpWallboxAnzahl = 1 + (wpOwnMeter ? 1 : 0) + (wallboxOwnMeter ? 1 : 0);

  const zaehlerWEAnzahl = Math.max(1, einheiten);
  const zaehlpunkte0 = zaehlerWEAnzahl + (f.allgemeinstrom ? 1 : 0) + pvWpWallboxAnzahl;

  const kostenPV = num(f.pvGroesse) * 1400;
  const kostenSpeicher = num(f.speicher) * 700;
  const kostenMieterstrompaket =
    3500 + (f.wandlermessung ? 1500 : 0) + num(f.durchlauferhitzerAnzahl) * 150;
  const investition = kostenPV + kostenSpeicher + kostenMieterstrompaket;

  const betriebVersicherung = investition * 0.012;
  const betriebAbrechnung = einheiten * 60;
  const betriebReststrom = restbezug * WHOLESALE_RESTSTROM;
  const betriebZaehler = zaehlpunkte0 * 120;
  const betrieb = betriebVersicherung + betriebAbrechnung + betriebReststrom + betriebZaehler;

  const einnahmenGrundgebuehr = einheiten * num(f.grundgebuehr) * 12;
  const einnahmenSolarstrom = eigenverbrauchGesamt * num(f.pvPreis);
  const einnahmenNetzstrom = restbezug * num(f.netzPreis);
  const einnahmenEinspeisung = ueberschusseinspeisung * FEED_IN_TARIF;
  const einnahmenZuschlag = eigenverbrauchGesamt * MIETERSTROMZUSCHLAG;
  const einnahmen =
    einnahmenGrundgebuehr + einnahmenSolarstrom + einnahmenNetzstrom + einnahmenEinspeisung + einnahmenZuschlag;

  const gewinnJahr1 = einnahmen - betrieb;
  const rendite = investition > 0 ? (gewinnJahr1 / investition) * 100 : 0;
  const amortisation = gewinnJahr1 > 0 ? investition / gewinnJahr1 : Infinity;
  const co2 = (pvErtrag * 0.366) / 1000;

  const series: number[] = [];
  const seriesYearly: YearlySeriesEntry[] = [];
  let cum = -investition;
  let breakEvenYear: number | null = null;
  for (let t = 0; t < 20; t++) {
    const jahresEinnahmen = einnahmen * Math.pow(1.03, t);
    const jahresGewinn = jahresEinnahmen - betrieb;
    cum += jahresGewinn;
    series.push(cum);
    seriesYearly.push({ jahresEinnahmen, betrieb, jahresGewinn });
    if (breakEvenYear === null && cum >= 0) breakEvenYear = t + 1;
  }
  const gewinn20 = cum;

  const pricing = MODELL_PRICING[f.mieterstromModell] ?? MODELL_PRICING.ggv;
  const zaehlerStueckpreis = pricing.preisProZaehler;
  const projektNetto = pricing.projektpauschale;
  const zaehlerWENetto = zaehlerWEAnzahl * zaehlerStueckpreis;
  const zaehlerASNetto = (f.allgemeinstrom ? 1 : 0) * zaehlerStueckpreis;
  const zaehlerPVNetto = pvWpWallboxAnzahl * zaehlerStueckpreis;
  const gatewayNetto = pricing.gateway;
  const einmaligNetto = projektNetto + zaehlerWENetto + zaehlerASNetto + zaehlerPVNetto + gatewayNetto;
  const einmaligUst = einmaligNetto * UST;
  const einmaligBrutto = einmaligNetto + einmaligUst;

  const zaehlpunkte = zaehlpunkte0;
  const abrechnungNetto = 649;
  const zaehlgebuehrNetto = zaehlpunkte * 71.37;
  const jaehrlichNetto = abrechnungNetto + zaehlgebuehrNetto;
  const jaehrlichUst = jaehrlichNetto * UST;
  const jaehrlichBrutto = jaehrlichNetto + jaehrlichUst;

  return {
    investition,
    betrieb,
    einnahmen,
    gewinnJahr1,
    rendite,
    amortisation,
    co2,
    autoAllgemein,
    ertragProKwp,
    allgemeinIsManual,
    ertragIsManual,
    verbrauchMieterstrom,
    verbrauchGesamt,
    wpVerbrauch,
    pvErtrag,
    eigenverbrauchGesamt,
    eigenverbrauchMieterstrom,
    eigenverbrauchWP,
    netzMieterstrom,
    netzWP,
    restbezug,
    ueberschusseinspeisung,
    eigenverbrauchsquote,
    autarkiegrad,
    einheiten,
    wpAktiv,
    wpOwnMeter,
    wallboxOwnMeter,
    pvWpWallboxAnzahl,
    kostenPV,
    kostenSpeicher,
    kostenMieterstrompaket,
    betriebVersicherung,
    betriebAbrechnung,
    betriebReststrom,
    betriebZaehler,
    einnahmenGrundgebuehr,
    einnahmenSolarstrom,
    einnahmenNetzstrom,
    einnahmenEinspeisung,
    einnahmenZuschlag,
    gewinn20,
    series,
    seriesYearly,
    breakEvenYear,
    zaehlerWEAnzahl,
    projektNetto,
    zaehlerWENetto,
    zaehlerASNetto,
    zaehlerPVNetto,
    zaehlerStueckpreis,
    gatewayNetto,
    einmaligNetto,
    einmaligUst,
    einmaligBrutto,
    zaehlpunkte,
    abrechnungNetto,
    zaehlgebuehrNetto,
    jaehrlichNetto,
    jaehrlichUst,
    jaehrlichBrutto,
  };
}

export function fmtInt(n: number): string {
  return isFinite(n) ? Math.round(n).toLocaleString("de-DE") : "—";
}
export function fmt1(n: number): string {
  return isFinite(n)
    ? n.toLocaleString("de-DE", { minimumFractionDigits: 1, maximumFractionDigits: 1 })
    : "—";
}
export function fmt2(n: number): string {
  return isFinite(n)
    ? n.toLocaleString("de-DE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    : "—";
}
