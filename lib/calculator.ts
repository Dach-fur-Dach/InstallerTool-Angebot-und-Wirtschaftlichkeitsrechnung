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

  pvGroesseManual: number | "";
  speicherManual: number | "";
  pvSzenario: PvSzenario;
  wpSzenario: WpSzenario;
  ertragProKwpManual: number | "";
  verbrauchAllgemeinManual: number | "";
  verbrauchWohnungenManual: number | "";
  verbrauchGewerbeManual: number | "";
  kostenPVManual: number | "";
  kostenSpeicherManual: number | "";
  kostenZaehlerschrankManual: number | "";

  verbrauchWaermepumpe: number | "";

  pvPreis: number | "";
  netzPreis: number | "";
  netzPreisEinkauf: number | "";
  grundgebuehr: number | "";
  grundversorgerPreis: number | "";
  grundversorgerGrundgebuehr: number | "";
  strompreisSteigerung: number | "";
}

export const DEFAULTS: FormState = {
  mieterstromModell: "physischer_sz",
  wohneinheiten: 0,
  gewerbeeinheiten: 0,
  allgemeinstrom: true,
  waermepumpeModus: "nein",
  wandlermessung: false,
  durchlauferhitzer: false,
  durchlauferhitzerAnzahl: 0,
  wallboxModus: "nein",
  wallboxAnzahl: 0,

  kunde: "",
  installer: "",
  rechnungStrasse: "",
  rechnungPlzStadt: "",
  objektStrasse: "",
  objektPlzStadt: "",

  pvGroesseManual: "",
  speicherManual: "",
  pvSzenario: "steildach",
  wpSzenario: "pv_optimiert",
  ertragProKwpManual: "",
  verbrauchAllgemeinManual: "",
  verbrauchWohnungenManual: "",
  verbrauchGewerbeManual: "",
  kostenPVManual: "",
  kostenSpeicherManual: "",
  kostenZaehlerschrankManual: "",

  verbrauchWaermepumpe: 0,

  pvPreis: 0.27,
  netzPreis: 0.3,
  netzPreisEinkauf: 0.3,
  grundgebuehr: 10.0,
  grundversorgerPreis: 0.35,
  grundversorgerGrundgebuehr: 15.0,
  strompreisSteigerung: 3,
};

const YIELD: Record<PvSzenario, number> = { steildach: 950, flachdach: 850 };
const ALLGEMEIN_PRO_EINHEIT = 100;
// Referenzwerte laut Engineering-Kalkulator (Google Sheet) / Team-Abstimmung 2026-08:
// Wohnung 2.100 kWh/Jahr, Gewerbe 6.000 kWh/Jahr.
const WOHNUNG_PRO_EINHEIT = 2100;
const GEWERBE_PRO_EINHEIT = 6000;
const PV_KWP_PRO_EINHEIT = 3;
const SPEICHER_KWH_PRO_EINHEIT = 1.2;
const FEED_IN_TARIF = 0.08;
const PV_KOSTEN_PRO_KWP = 1300;
const SPEICHER_KOSTEN_PRO_KWH = 450;
// Zählerschrank/Wandlermessung wird im Referenz-Kalkulator als einfacher Pauschalwert
// geführt (kein Zählpunkt-Faktor): 0 € ohne Wandlermessung, 5.000 € mit.
const ZAEHLERSCHRANK_WANDLER_PAUSCHALE = 5000;
// Abrechnung wird pro abgerechnetem Zählpunkt berechnet (59 € je Zähler),
// nicht mehr als fixer Wert unabhängig von der Anzahl Zählpunkte.
const ABRECHNUNG_PRO_ZAEHLPUNKT = 59;
// Jährliche MSB-Zählergebühr pro abgerechnetem Zählpunkt (71,37 € je Zähler),
// kalibriert auf das Referenzbeispiel im Engineering-Kalkulator (785,06 € bei 11 Zählpunkten).
const ZAEHLGEBUEHR_PRO_ZAEHLPUNKT = 71.37;
// Netzstrom-Grundgebühr, die der Betreiber unabhängig vom Verbrauch an den Netzbetreiber
// zahlt (laut Engineering-Kalkulator: "Reststrom Grundgebühr", pauschal 120 €/Jahr).
const NETZSTROM_GRUNDGEBUEHR_JAHR = 120;
const VERSICHERUNG_QUOTE = 0.005;
export const MODELL_LABEL: Record<MieterstromModell, string> = {
  ggv: "Gemeinschaftliche Gebäudeversorgung (GGV)",
  virtueller_sz: "Virtueller Summenzähler",
  physischer_sz: "Physischer Summenzähler",
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
  pvGroesse: number;
  autoPvGroesse: number;
  pvGroesseIsManual: boolean;
  speicher: number;
  autoSpeicher: number;
  speicherIsManual: boolean;
  autoWohnungen: number;
  wohnungenIsManual: boolean;
  verbrauchWohnungen: number;
  autoGewerbe: number;
  gewerbeIsManual: boolean;
  verbrauchGewerbe: number;
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
  kostenPVAuto: number;
  kostenPVIsManual: boolean;
  kostenSpeicher: number;
  kostenSpeicherAuto: number;
  kostenSpeicherIsManual: boolean;
  kostenZaehlerschrank: number;
  kostenZaehlerschrankAuto: number;
  kostenZaehlerschrankIsManual: boolean;
  kostenMieterstrompaket: number;
  betriebVersicherung: number;
  betriebAbrechnung: number;
  betriebNetzstrom: number;
  betriebNetzstromGrundgebuehr: number;
  betriebZaehler: number;
  einnahmenGrundgebuehr: number;
  einnahmenSolarstrom: number;
  einnahmenNetzstrom: number;
  einnahmenEinspeisung: number;
  einnahmenZuschlag: number;
  gewinn20: number;
  steigerungProzent: number;
  series: number[];
  seriesYearly: YearlySeriesEntry[];
  breakEvenYear: number | null;
  zaehlerWEAnzahl: number;
  zaehlerASAnzahl: number;
  funkadapterAnzahl: number;
  funkadapterNetto: number;
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
  flyerVerbrauchProWohnung: number;
  flyerSolarAnteil: number;
  flyerSolarKwh: number;
  flyerNetzKwh: number;
  flyerMieterstromJahr: number;
  flyerGrundversorgerJahr: number;
  flyerErsparnisJahr: number;
}

function isManualOverride(v: number | ""): boolean {
  return v !== "" && v != null && isFinite(parseFloat(String(v)));
}

export function computeResults(f: FormState): ComputedResults {
  const einheiten = num(f.wohneinheiten) + num(f.gewerbeeinheiten);
  const autoAllgemeinCalc = f.allgemeinstrom ? num(f.wohneinheiten) * ALLGEMEIN_PRO_EINHEIT : 0;
  const allgemeinIsManual = isManualOverride(f.verbrauchAllgemeinManual);
  const autoAllgemein = allgemeinIsManual ? num(f.verbrauchAllgemeinManual) : autoAllgemeinCalc;
  const wpAktiv = waermepumpeAktiv(f);
  // Nur bei eigenem Zähler wird der WP-Verbrauch separat gezählt. Läuft die Wärmepumpe über den
  // Allgemeinstromzähler, ist ihr Verbrauch bereits in der Allgemeinstrom-Zahl enthalten (gleicher
  // Zähler) - eine zusätzliche Addition hier würde ihn doppelt zählen.
  const wpOwnMeter = f.waermepumpeModus === "eigener_zaehler";
  const wpVerbrauch = wpOwnMeter ? num(f.verbrauchWaermepumpe) : 0;
  const autoWohnungen = num(f.wohneinheiten) * WOHNUNG_PRO_EINHEIT;
  const wohnungenIsManual = isManualOverride(f.verbrauchWohnungenManual);
  const verbrauchWohnungen = wohnungenIsManual ? num(f.verbrauchWohnungenManual) : autoWohnungen;
  const autoGewerbe = num(f.gewerbeeinheiten) * GEWERBE_PRO_EINHEIT;
  const gewerbeIsManual = isManualOverride(f.verbrauchGewerbeManual);
  const verbrauchGewerbe = gewerbeIsManual ? num(f.verbrauchGewerbeManual) : autoGewerbe;
  const verbrauchMieterstrom = verbrauchWohnungen + autoAllgemein + verbrauchGewerbe;
  const verbrauchGesamt = verbrauchMieterstrom + wpVerbrauch;

  const ertragProKwpAuto = YIELD[f.pvSzenario] || YIELD.steildach;
  const ertragIsManual = isManualOverride(f.ertragProKwpManual);
  const ertragProKwp = ertragIsManual ? num(f.ertragProKwpManual) : ertragProKwpAuto;

  // PV-Anlage und Speicher werden anhand der Anzahl Wohn-/Gewerbeeinheiten überschlägig dimensioniert,
  // solange kein manueller Wert eingegeben wurde.
  const autoPvGroesse = einheiten * PV_KWP_PRO_EINHEIT;
  const pvGroesseIsManual = isManualOverride(f.pvGroesseManual);
  const pvGroesse = pvGroesseIsManual ? num(f.pvGroesseManual) : autoPvGroesse;

  const autoSpeicher = einheiten * SPEICHER_KWH_PRO_EINHEIT;
  const speicherIsManual = isManualOverride(f.speicherManual);
  const speicher = speicherIsManual ? num(f.speicherManual) : autoSpeicher;

  const pvErtrag = pvGroesse * ertragProKwp;

  // Vereinfachtes Eigenverbrauchs-/Autarkiemodell (kalibrierte Näherung).
  // Der Referenz-Engineering-Kalkulator ermittelt Eigenverbrauch/Autarkie über eine stündliche
  // 8.760h-Simulation (BDEW-Lastprofile H25/G25 je Stunde, 16 standortspezifische PVGIS-Ertragskurven,
  // Speicher-Ladezustandssimulation mit Wirkungsgrad/Standby-Verlusten). Das ist hier bewusst NICHT
  // 1:1 nachgebaut (würde große Lastprofil-/Ertragskurven-Datensätze + eine Simulation pro Eingabe
  // erfordern), sondern als deutlich besser kalibrierte Formel angenähert, die auf dem Referenzbeispiel
  // des Kalkulators (7 WE, 31 kWp, 5 kWh Speicher, WP ungesteuert → Eigenverbrauchsquote 46,71%,
  // Autarkiegrad Gesamt 36,17%, Mieter 48,30%, WP 25,55%) kalibriert wurde.

  // Basis-Eigenverbrauchsquote (ohne Speicher) sinkt mit steigendem Verhältnis PV-Ertrag/Verbrauch:
  // großzügiger dimensionierte Anlagen erzeugen mehr Überschuss. MFH mit vielen, zeitlich diversen
  // Verbrauchsprofilen erreichen dabei eine höhere Grundquote als Einfamilienhäuser.
  const pvLoadRatio = verbrauchGesamt > 0 ? pvErtrag / verbrauchGesamt : 0;
  const BASISQUOTE_FAKTOR = 0.405;
  const baseQuote = pvLoadRatio > 0 ? Math.min(0.65, Math.max(0.25, BASISQUOTE_FAKTOR / Math.sqrt(pvLoadRatio))) : 0.65;

  // Speicher erhöht die Eigenverbrauchsquote spürbar, skaliert mit kWh Speicher je MWh
  // Jahresverbrauch (zuvor hatte der Speicher praktisch keinen sichtbaren Effekt).
  const speicherProMwh = verbrauchGesamt > 0 ? (speicher * 1000) / verbrauchGesamt : 0;
  const speicherBonus = Math.min(0.25, speicherProMwh * 0.05);

  let quote = baseQuote + speicherBonus;
  // PV-optimierte Wärmepumpensteuerung verschiebt Verbrauch in sonnenreiche Stunden und erhöht
  // dadurch die Gesamt-Eigenverbrauchsquote zusätzlich.
  if (wpAktiv && f.wpSzenario === "pv_optimiert") quote += 0.04;
  quote = Math.min(0.85, quote);

  // eigenverbrauchGesamt muss immer aus pvErtrag * quote berechnet werden (quote ist als
  // Eigenverbrauchsquote kalibriert, also Anteil der PV-Erzeugung). verbrauchGesamt/pvErtrag
  // dienen hier nur als physikalische Obergrenzen (mehr Eigenverbrauch als erzeugt oder
  // verbraucht ist unmöglich) und dürfen NICHT anstelle von pvErtrag mit quote multipliziert
  // werden - das würde quote bei großzügig dimensionierten Anlagen (pvErtrag > verbrauchGesamt,
  // der Normalfall ohne Wärmepumpe) faktisch zum Autarkiegrad statt zur Eigenverbrauchsquote
  // machen und beide Kennzahlen inkonsistent zueinander werden lassen.
  const eigenverbrauchGesamt = Math.min(pvErtrag * quote, verbrauchGesamt, pvErtrag);

  // Die Eigenverbrauchsmenge wird nicht linear proportional zum Verbrauch auf Mieterstrom und
  // Wärmepumpe verteilt: Wärmepumpen-Lasten korrelieren zeitlich schlechter mit der PV-Erzeugung
  // (Heizbedarf v.a. nachts/im Winter) als die Mieterstrom-Grundlast. Der Referenz-Kalkulator bildet
  // das über eine stundenweise pro-rata-Zuteilung ab; hier wird das mit einem Korrelationsfaktor
  // angenähert (kalibriert auf Autarkiegrad Mieter 48,3% vs. WP 25,55% im Referenzbeispiel).
  const WP_KORRELATION_UNGESTEUERT = 0.55;
  const WP_KORRELATION_PV_OPTIMIERT = 0.72;
  const wpKorrelation = f.wpSzenario === "pv_optimiert" ? WP_KORRELATION_PV_OPTIMIERT : WP_KORRELATION_UNGESTEUERT;
  const gewichtMieterstrom = verbrauchMieterstrom;
  const gewichtWP = wpVerbrauch * wpKorrelation;
  const gewichtGesamt = gewichtMieterstrom + gewichtWP;
  const eigenverbrauchMieterstrom =
    gewichtGesamt > 0
      ? Math.min(verbrauchMieterstrom, eigenverbrauchGesamt * (gewichtMieterstrom / gewichtGesamt))
      : 0;
  const eigenverbrauchWP = Math.max(0, eigenverbrauchGesamt - eigenverbrauchMieterstrom);
  const netzMieterstrom = Math.max(0, verbrauchMieterstrom - eigenverbrauchMieterstrom);
  const netzWP = Math.max(0, wpVerbrauch - eigenverbrauchWP);
  const restbezug = netzMieterstrom + netzWP;
  const ueberschusseinspeisung = Math.max(0, pvErtrag - eigenverbrauchGesamt);
  const eigenverbrauchsquote = pvErtrag > 0 ? (eigenverbrauchGesamt / pvErtrag) * 100 : 0;
  const autarkiegrad = verbrauchGesamt > 0 ? (eigenverbrauchGesamt / verbrauchGesamt) * 100 : 0;

  const wallboxOwnMeter = f.wallboxModus === "eigener_zaehler";
  const pvWpWallboxAnzahl = 1 + (wpOwnMeter ? 1 : 0) + (wallboxOwnMeter ? 1 : 0);

  const zaehlerWEAnzahl = Math.max(1, einheiten);
  const zaehlpunkte0 = zaehlerWEAnzahl + (f.allgemeinstrom ? 1 : 0) + pvWpWallboxAnzahl;
  const istPhysischerSZ = f.mieterstromModell === "physischer_sz";

  // Angebot pricing (moved up so Wirtschaftlichkeit can reuse the same numbers)
  const pricing = MODELL_PRICING[f.mieterstromModell] ?? MODELL_PRICING.ggv;
  const zaehlerStueckpreis = pricing.preisProZaehler;
  const projektNetto = pricing.projektpauschale;
  const zaehlerWENetto = zaehlerWEAnzahl * zaehlerStueckpreis;
  const zaehlerASAnzahl = f.allgemeinstrom ? 1 : 0;
  const zaehlerASNetto = zaehlerASAnzahl * zaehlerStueckpreis;
  const zaehlerPVNetto = pvWpWallboxAnzahl * zaehlerStueckpreis;
  const gatewayNetto = pricing.gateway;
  // Physischer Summenzähler benötigt keinen Mieterstromzuschlag-Zähler, dafür standardmäßig 1x Funkadapter.
  const funkadapterAnzahl = istPhysischerSZ ? 1 : 0;
  const funkadapterNetto = funkadapterAnzahl * zaehlerStueckpreis;
  const einmaligNetto =
    projektNetto + zaehlerWENetto + zaehlerASNetto + zaehlerPVNetto + gatewayNetto + funkadapterNetto;
  const einmaligUst = einmaligNetto * UST;
  const einmaligBrutto = einmaligNetto + einmaligUst;

  // Abrechnung und Zählergebühren werden für einen Zählpunkt mehr berechnet als die reine
  // Messtechnik: der Summenzähler (SZ) selbst wird ebenfalls abgerechnet (bei pSZ und vSZ/GGV
  // gleichermaßen). Referenz: Engineering-Kalkulator zeigt "Nötige Zählerplätze" = 10 aber
  // "Abzurechnende Zähler" = 11 für dasselbe Beispiel (59 €×11 = 649 €, 71,37 €×11 = 785,06 €).
  const zaehlpunkte = zaehlpunkte0 + 1;
  const abrechnungNetto = zaehlpunkte * ABRECHNUNG_PRO_ZAEHLPUNKT;
  // Bei physischem Summenzähler entfallen die separaten Zählergebühren.
  const zaehlgebuehrNetto = istPhysischerSZ ? 0 : zaehlpunkte * ZAEHLGEBUEHR_PRO_ZAEHLPUNKT;
  const jaehrlichNetto = abrechnungNetto + zaehlgebuehrNetto;
  const jaehrlichUst = jaehrlichNetto * UST;
  const jaehrlichBrutto = jaehrlichNetto + jaehrlichUst;

  const kostenPVAuto = pvGroesse * PV_KOSTEN_PRO_KWP;
  const kostenPVIsManual = isManualOverride(f.kostenPVManual);
  const kostenPV = kostenPVIsManual ? num(f.kostenPVManual) : kostenPVAuto;

  const kostenSpeicherAuto = speicher * SPEICHER_KOSTEN_PRO_KWH;
  const kostenSpeicherIsManual = isManualOverride(f.kostenSpeicherManual);
  const kostenSpeicher = kostenSpeicherIsManual ? num(f.kostenSpeicherManual) : kostenSpeicherAuto;

  const kostenZaehlerschrankAuto = f.wandlermessung ? ZAEHLERSCHRANK_WANDLER_PAUSCHALE : 0;
  const kostenZaehlerschrankIsManual = isManualOverride(f.kostenZaehlerschrankManual);
  const kostenZaehlerschrank = kostenZaehlerschrankIsManual
    ? num(f.kostenZaehlerschrankManual)
    : kostenZaehlerschrankAuto;

  // Mieterstrompaket entspricht den tatsächlichen einmaligen Kosten aus dem Angebot (Jahr 1).
  const kostenMieterstrompaket = einmaligNetto;
  const investition = kostenPV + kostenSpeicher + kostenZaehlerschrank + kostenMieterstrompaket;

  const betriebVersicherung = investition * VERSICHERUNG_QUOTE;
  // Abrechnung & Zähler-Jahresgebühr entsprechen den Werten aus dem Angebot.
  const betriebAbrechnung = abrechnungNetto;
  const betriebNetzstrom = restbezug * num(f.netzPreisEinkauf);
  // Pauschale Grundgebühr des Netzbetreibers für den Reststrombezug (unabhängig vom Verbrauch).
  const betriebNetzstromGrundgebuehr = NETZSTROM_GRUNDGEBUEHR_JAHR;
  const betriebZaehler = zaehlgebuehrNetto;
  const betrieb =
    betriebVersicherung + betriebAbrechnung + betriebNetzstrom + betriebNetzstromGrundgebuehr + betriebZaehler;

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

  // Beispielrechnung für eine durchschnittliche Wohnung (für den Mieter-Ersparnis-Flyer).
  const flyerVerbrauchProWohnung = verbrauchWohnungen / Math.max(1, num(f.wohneinheiten));
  const flyerSolarAnteil = verbrauchMieterstrom > 0 ? eigenverbrauchMieterstrom / verbrauchMieterstrom : 0;
  const flyerSolarKwh = flyerVerbrauchProWohnung * flyerSolarAnteil;
  const flyerNetzKwh = flyerVerbrauchProWohnung - flyerSolarKwh;
  const flyerMieterstromJahr = flyerSolarKwh * num(f.pvPreis) + flyerNetzKwh * num(f.netzPreis) + num(f.grundgebuehr) * 12;
  const flyerGrundversorgerJahr = flyerVerbrauchProWohnung * num(f.grundversorgerPreis) + num(f.grundversorgerGrundgebuehr) * 12;
  const flyerErsparnisJahr = flyerGrundversorgerJahr - flyerMieterstromJahr;

  // Die Strompreissteigerung p.a. (editierbar über f.strompreisSteigerung, Standard 3%) betrifft
  // nur die strompreisgekoppelten Positionen (Arbeitspreise für Solar-/Netzstrom-Einnahmen und
  // den Reststrom-Einkauf). Pauschale Jahresgebühren (Grundgebühr, Versicherung, Abrechnung,
  // Zählergebühr, Netz-Grundgebühr) sowie der gesetzlich fixierte Mieterstromzuschlag bleiben
  // nominal konstant. Zuvor wurden hier sämtliche Einnahmen eskaliert, während die
  // Betriebskosten komplett konstant blieben – das hat den kumulierten Gewinn nach 20 Jahren
  // gegenüber dem Referenz-Kalkulator (Google Sheet) fast verdoppelt.
  const steigerungProzent = num(f.strompreisSteigerung, 3);
  const einnahmenVariabel = einnahmenSolarstrom + einnahmenNetzstrom + einnahmenEinspeisung;
  const einnahmenFix = einnahmenGrundgebuehr + einnahmenZuschlag;
  const betriebVariabel = betriebNetzstrom;
  const betriebFix = betriebVersicherung + betriebAbrechnung + betriebNetzstromGrundgebuehr + betriebZaehler;

  const series: number[] = [];
  const seriesYearly: YearlySeriesEntry[] = [];
  let cum = -investition;
  let breakEvenYear: number | null = null;
  for (let t = 0; t < 20; t++) {
    const eskalation = Math.pow(1 + steigerungProzent / 100, t);
    const jahresEinnahmen = einnahmenVariabel * eskalation + einnahmenFix;
    const jahresBetrieb = betriebVariabel * eskalation + betriebFix;
    const jahresGewinn = jahresEinnahmen - jahresBetrieb;
    cum += jahresGewinn;
    series.push(cum);
    seriesYearly.push({ jahresEinnahmen, betrieb: jahresBetrieb, jahresGewinn });
    if (breakEvenYear === null && cum >= 0) breakEvenYear = t + 1;
  }
  const gewinn20 = cum;

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
    pvGroesse,
    autoPvGroesse,
    pvGroesseIsManual,
    speicher,
    autoSpeicher,
    speicherIsManual,
    autoWohnungen,
    wohnungenIsManual,
    verbrauchWohnungen,
    autoGewerbe,
    gewerbeIsManual,
    verbrauchGewerbe,
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
    kostenPVAuto,
    kostenPVIsManual,
    kostenSpeicher,
    kostenSpeicherAuto,
    kostenSpeicherIsManual,
    kostenZaehlerschrank,
    kostenZaehlerschrankAuto,
    kostenZaehlerschrankIsManual,
    kostenMieterstrompaket,
    betriebVersicherung,
    betriebAbrechnung,
    betriebNetzstrom,
    betriebNetzstromGrundgebuehr,
    betriebZaehler,
    einnahmenGrundgebuehr,
    einnahmenSolarstrom,
    einnahmenNetzstrom,
    einnahmenEinspeisung,
    einnahmenZuschlag,
    gewinn20,
    steigerungProzent,
    series,
    seriesYearly,
    breakEvenYear,
    zaehlerWEAnzahl,
    zaehlerASAnzahl,
    funkadapterAnzahl,
    funkadapterNetto,
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
    flyerVerbrauchProWohnung,
    flyerSolarAnteil,
    flyerSolarKwh,
    flyerNetzKwh,
    flyerMieterstromJahr,
    flyerGrundversorgerJahr,
    flyerErsparnisJahr,
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
