// Calculation tests for lib/calculator.ts. Run with `npm test` (Node's built-in test runner,
// TypeScript via Node's type stripping, no extra dependencies).
//
// Expected values are worked out by hand from the agreed business rules (kWh per unit,
// Zähler prices, Abrechnung per Zählpunkt, ...), not by calling the code under test, so a
// changed constant or formula shows up here as a failure.
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { DEFAULTS, computeResults, num, niceCeil } from "../lib/calculator.ts";
import type { FormState } from "../lib/calculator.ts";

const form = (overrides: Partial<FormState> = {}): FormState => ({ ...DEFAULTS, ...overrides });

function close(actual: number, expected: number, tolerance = 0.01, label = "") {
  assert.ok(
    Math.abs(actual - expected) <= tolerance,
    `${label} expected ${expected}, got ${actual} (tolerance ${tolerance})`
  );
}

describe("Verbrauch je Einheit", () => {
  it("Wohnung 1.850 kWh, Gewerbe 3.500 kWh, Allgemeinstrom 100 kWh je Wohneinheit", () => {
    const r = computeResults(form({ wohneinheiten: 10, gewerbeeinheiten: 2 }));
    assert.equal(r.verbrauchWohnungen, 18500);
    assert.equal(r.verbrauchGewerbe, 7000);
    assert.equal(r.autoAllgemein, 1000);
    assert.equal(r.verbrauchMieterstrom, 18500 + 7000 + 1000);
  });

  it("kein Allgemeinstrom, wenn ausgeschaltet", () => {
    const r = computeResults(form({ wohneinheiten: 10, allgemeinstrom: false }));
    assert.equal(r.autoAllgemein, 0);
  });

  it("Wärmepumpe 1.250 kWh je Wohn- UND Gewerbeeinheit, nur mit eigenem Zähler", () => {
    const r = computeResults(form({ wohneinheiten: 4, gewerbeeinheiten: 1, waermepumpeModus: "eigener_zaehler" }));
    assert.equal(r.wpVerbrauch, 5 * 1250);
    assert.equal(r.verbrauchGesamt, r.verbrauchMieterstrom + 6250);

    const aus = computeResults(form({ wohneinheiten: 4, gewerbeeinheiten: 1, waermepumpeModus: "nein" }));
    assert.equal(aus.wpVerbrauch, 0);
    assert.equal(aus.verbrauchGesamt, aus.verbrauchMieterstrom);
  });

  it("Wärmepumpe: manueller Wert ersetzt den Automatikwert", () => {
    const r = computeResults(form({ wohneinheiten: 4, waermepumpeModus: "eigener_zaehler", verbrauchWaermepumpe: 9000 }));
    assert.equal(r.wpVerbrauch, 9000);
    assert.equal(r.waermepumpeIsManual, true);
  });

  it("Wallbox 2.250 kWh je Stück, bei beiden Ja-Varianten, nicht bei Nein", () => {
    for (const wallboxModus of ["hinter_zaehler", "eigener_zaehler"] as const) {
      const r = computeResults(form({ wohneinheiten: 4, wallboxModus, wallboxAnzahl: 3 }));
      assert.equal(r.verbrauchWallbox, 3 * 2250, wallboxModus);
    }
    const nein = computeResults(form({ wohneinheiten: 4, wallboxModus: "nein", wallboxAnzahl: 3, verbrauchWallboxManual: 5000 }));
    assert.equal(nein.verbrauchWallbox, 0);
  });

  it("Durchlauferhitzer 1.850 kWh je Stück, nur wenn vorhanden", () => {
    const r = computeResults(form({ wohneinheiten: 4, durchlauferhitzer: true, durchlauferhitzerAnzahl: 4 }));
    assert.equal(r.verbrauchDurchlauferhitzer, 4 * 1850);
    const aus = computeResults(form({ wohneinheiten: 4, durchlauferhitzer: false, durchlauferhitzerAnzahl: 4 }));
    assert.equal(aus.verbrauchDurchlauferhitzer, 0);
  });

  it("Wallbox und Durchlauferhitzer zählen zum Mieterstrom-Verbrauch", () => {
    const r = computeResults(
      form({ wohneinheiten: 4, wallboxModus: "hinter_zaehler", wallboxAnzahl: 2, durchlauferhitzer: true, durchlauferhitzerAnzahl: 1 })
    );
    assert.equal(r.verbrauchMieterstrom, 4 * 1850 + 4 * 100 + 2 * 2250 + 1850);
  });

  it("manuelle Verbrauchswerte ersetzen die Automatik, leeres Feld setzt zurück", () => {
    const r = computeResults(form({ wohneinheiten: 4, verbrauchWohnungenManual: 10000, verbrauchAllgemeinManual: 0 }));
    assert.equal(r.verbrauchWohnungen, 10000);
    assert.equal(r.autoAllgemein, 0);
    assert.equal(r.allgemeinIsManual, true);
    const reset = computeResults(form({ wohneinheiten: 4, verbrauchWohnungenManual: "" }));
    assert.equal(reset.verbrauchWohnungen, 4 * 1850);
  });
});

describe("Zähler und Angebot (Leistungsübersicht)", () => {
  it("ein Zähler je Wohn- und Gewerbeeinheit", () => {
    const r = computeResults(form({ wohneinheiten: 10, gewerbeeinheiten: 3 }));
    assert.equal(r.zaehlerWEAnzahl, 13);
  });

  it("Mieterstrom pSZ (MK D3): 1.299 € Projekt, 149 € je Zähler, Gateway 349 €, 1 Funkadapter", () => {
    // 10 WE: 10 WE-Zähler + 1 Allgemeinstrom + 1 PV = 12 Zähler, + Summenzähler = 13 Zählpunkte
    const r = computeResults(form({ wohneinheiten: 10, mieterstromModell: "physischer_sz_sw" }));
    assert.equal(r.projektNetto, 1299);
    assert.equal(r.zaehlerWENetto, 10 * 149);
    assert.equal(r.zaehlerASNetto, 149);
    assert.equal(r.zaehlerPVNetto, 149);
    assert.equal(r.gatewayNetto, 349);
    assert.equal(r.funkadapterNetto, 149);
    assert.equal(r.einmaligNetto, 1299 + 1490 + 149 + 149 + 349 + 149);
    close(r.einmaligBrutto, 3585 * 1.19);
    assert.equal(r.zaehlpunkte, 13);
    assert.equal(r.abrechnungNetto, 13 * 59);
    assert.equal(r.zaehlgebuehrNetto, 0, "pSZ: keine Zählergebühren");
    close(r.jaehrlichBrutto, 767 * 1.19);
  });

  it("Mieterstrom vSZ: 1.999 € Projekt, 25 € je Zähler und Gateway, Zählergebühr 71,37 € je Zählpunkt", () => {
    const r = computeResults(form({ wohneinheiten: 10, mieterstromModell: "virtueller_sz" }));
    assert.equal(r.einmaligNetto, 1999 + 10 * 25 + 25 + 25 + 25);
    assert.equal(r.funkadapterAnzahl, 0);
    close(r.zaehlgebuehrNetto, 13 * 71.37);
    close(r.jaehrlichNetto, 13 * 59 + 13 * 71.37);
  });

  it("GGV hat dieselben Angebotspreise wie vSZ", () => {
    const ggv = computeResults(form({ wohneinheiten: 10, mieterstromModell: "ggv" }));
    const vsz = computeResults(form({ wohneinheiten: 10, mieterstromModell: "virtueller_sz" }));
    assert.equal(ggv.einmaligNetto, vsz.einmaligNetto);
    assert.equal(ggv.jaehrlichNetto, vsz.jaehrlichNetto);
  });

  it("altes Modell physischer_sz rechnet wie MK D3", () => {
    const alt = computeResults(form({ wohneinheiten: 6, mieterstromModell: "physischer_sz" }));
    const neu = computeResults(form({ wohneinheiten: 6, mieterstromModell: "physischer_sz_sw" }));
    assert.equal(alt.einmaligNetto, neu.einmaligNetto);
    assert.equal(alt.jaehrlichNetto, neu.jaehrlichNetto);
  });

  it("eigener WP- und Wallbox-Zähler je ein zusätzlicher Zähler", () => {
    const r = computeResults(
      form({ wohneinheiten: 5, waermepumpeModus: "eigener_zaehler", wallboxModus: "eigener_zaehler", wallboxAnzahl: 4 })
    );
    assert.equal(r.pvWpWallboxAnzahl, 3);
    assert.equal(r.zaehlerPVNetto, 3 * 149);
    assert.equal(r.zaehlpunkte, 5 + 1 + 3 + 1);
  });

  it("Wallbox hinter Mieterzähler braucht keinen eigenen Zähler", () => {
    const r = computeResults(form({ wohneinheiten: 5, wallboxModus: "hinter_zaehler", wallboxAnzahl: 4 }));
    assert.equal(r.pvWpWallboxAnzahl, 1);
  });
});

describe("Investition", () => {
  it("PV 3 kWp je Einheit à 1.300 €, Speicher 1,2 kWh je Einheit à 450 €, plus Mieterstrompaket", () => {
    const r = computeResults(form({ wohneinheiten: 10 }));
    assert.equal(r.pvGroesse, 30);
    close(r.speicher, 12);
    assert.equal(r.kostenPV, 39000);
    close(r.kostenSpeicher, 5400);
    assert.equal(r.kostenZaehlerschrank, 0);
    close(r.investition, 39000 + 5400 + 3585);
  });

  it("Wandlermessung: 5.000 € Zählerschrank-Pauschale", () => {
    const r = computeResults(form({ wohneinheiten: 10, wandlermessung: true }));
    assert.equal(r.kostenZaehlerschrank, 5000);
  });

  it("manuelle Kosten ersetzen die Automatik", () => {
    const r = computeResults(form({ wohneinheiten: 10, kostenPVManual: 30000, kostenSpeicherManual: 0, kostenZaehlerschrankManual: 1200 }));
    assert.equal(r.investition, 30000 + 0 + 1200 + r.einmaligNetto);
  });
});

describe("Energiebilanz", () => {
  // Referenzfall 10 WE, Standardwerte, gerechnet mit der Näherungsformel aus computeResults:
  // PV 30 kWp × 950 = 28.500 kWh, Verbrauch 19.500 kWh, Speicher 12 kWh
  // Basisquote 0,405 / √(28.500/19.500) = 0,33501, Speicherbonus 12.000/19.500 × 0,05 = 0,03077
  const r = computeResults(form({ wohneinheiten: 10 }));
  const quote = 0.405 / Math.sqrt(28500 / 19500) + (12000 / 19500) * 0.05;

  it("PV-Ertrag und Eigenverbrauch (Referenzfall)", () => {
    assert.equal(r.pvErtrag, 28500);
    close(r.eigenverbrauchGesamt, 28500 * quote, 0.5);
    close(r.eigenverbrauchsquote, quote * 100, 0.01);
  });

  it("Bilanz geht auf: Eigenverbrauch + Einspeisung = PV, Eigenverbrauch + Netzbezug = Verbrauch", () => {
    close(r.eigenverbrauchGesamt + r.ueberschusseinspeisung, r.pvErtrag);
    close(r.eigenverbrauchGesamt + r.restbezug, r.verbrauchGesamt);
    close(r.eigenverbrauchMieterstrom + r.eigenverbrauchWP, r.eigenverbrauchGesamt);
  });

  it("mehr Speicher → mehr Eigenverbrauch", () => {
    const klein = computeResults(form({ wohneinheiten: 10, speicherManual: 0 }));
    const gross = computeResults(form({ wohneinheiten: 10, speicherManual: 30 }));
    assert.ok(gross.eigenverbrauchGesamt > klein.eigenverbrauchGesamt);
  });

  it("PV-optimierte Wärmepumpe → mehr Eigenverbrauch als ungesteuert", () => {
    const base = { wohneinheiten: 10, waermepumpeModus: "eigener_zaehler" } as const;
    const opt = computeResults(form({ ...base, wpSzenario: "pv_optimiert" }));
    const unge = computeResults(form({ ...base, wpSzenario: "ungesteuert" }));
    assert.ok(opt.eigenverbrauchGesamt > unge.eigenverbrauchGesamt);
  });

  it("Flachdach Ost-West 850 kWh/kWp, Steildach Süd 950 kWh/kWp", () => {
    assert.equal(computeResults(form({ wohneinheiten: 2, pvSzenario: "flachdach" })).ertragProKwp, 850);
    assert.equal(computeResults(form({ wohneinheiten: 2, pvSzenario: "steildach" })).ertragProKwp, 950);
  });

  it("CO2-Ersparnis 0,366 kg je erzeugter kWh", () => {
    close(r.co2, (28500 * 0.366) / 1000);
  });
});

describe("Betriebskosten und Einnahmen (Jahr 1)", () => {
  const r = computeResults(form({ wohneinheiten: 10 }));

  it("Betriebskosten: Versicherung 0,5 % + Abrechnung + Netzstrom-Einkauf + 120 € Grundgebühr + Zählergebühr", () => {
    close(r.betriebVersicherung, r.investition * 0.005);
    assert.equal(r.betriebAbrechnung, 13 * 59);
    close(r.betriebNetzstrom, r.restbezug * 0.3);
    assert.equal(r.betriebNetzstromGrundgebuehr, 120);
    assert.equal(r.betriebZaehler, 0);
    close(r.betrieb, r.betriebVersicherung + 767 + r.restbezug * 0.3 + 120);
  });

  it("Einnahmen: Grundgebühr, Solarstrom, Netzstrom, Einspeisung 0,08 €, Mieterstromzuschlag 0,021 €", () => {
    assert.equal(r.einnahmenGrundgebuehr, 10 * 10 * 12);
    close(r.einnahmenSolarstrom, r.eigenverbrauchGesamt * 0.27);
    close(r.einnahmenNetzstrom, r.restbezug * 0.3);
    close(r.einnahmenEinspeisung, r.ueberschusseinspeisung * 0.08);
    close(r.einnahmenZuschlag, r.eigenverbrauchGesamt * 0.021);
    close(
      r.einnahmen,
      r.einnahmenGrundgebuehr + r.einnahmenSolarstrom + r.einnahmenNetzstrom + r.einnahmenEinspeisung + r.einnahmenZuschlag
    );
  });

  it("Gewinn im 1. Jahr = Einnahmen − Betriebskosten, Rendite = Gewinn / Investition", () => {
    close(r.gewinnJahr1, r.einnahmen - r.betrieb);
    close(r.rendite, (r.gewinnJahr1 / r.investition) * 100);
  });

  it("GGV: kein Netzstrom-Einkauf/-Verkauf und keine Netz-Grundgebühr beim Betreiber", () => {
    const g = computeResults(form({ wohneinheiten: 10, mieterstromModell: "ggv" }));
    assert.equal(g.einnahmenNetzstrom, 0);
    assert.equal(g.betriebNetzstrom, 0);
    assert.equal(g.betriebNetzstromGrundgebuehr, 0);
  });
});

describe("20-Jahres-Verlauf, Amortisation, Break-even", () => {
  it("ohne Strompreissteigerung: jedes Jahr gleicher Gewinn, Amortisation = Investition / Gewinn", () => {
    const r = computeResults(form({ wohneinheiten: 10, strompreisSteigerung: 0 }));
    assert.equal(r.series.length, 20);
    for (let t = 0; t < 20; t++) close(r.series[t], -r.investition + (t + 1) * r.gewinnJahr1, 0.01, `Jahr ${t + 1}`);
    close(r.amortisation, r.investition / r.gewinnJahr1);
    close(r.gewinn20, 20 * r.gewinnJahr1 - r.investition);
  });

  it("mit 3 % Steigerung wachsen nur Arbeitspreis-Positionen, Fixposten bleiben gleich", () => {
    const r = computeResults(form({ wohneinheiten: 10, strompreisSteigerung: 3 }));
    const variabel = r.einnahmenSolarstrom + r.einnahmenNetzstrom + r.einnahmenEinspeisung;
    const fix = r.einnahmenGrundgebuehr + r.einnahmenZuschlag;
    close(r.seriesYearly[0].jahresEinnahmen, variabel + fix);
    close(r.seriesYearly[5].jahresEinnahmen, variabel * 1.03 ** 5 + fix);
    const betriebFix = r.betrieb - r.betriebNetzstrom;
    close(r.seriesYearly[5].betrieb, r.betriebNetzstrom * 1.03 ** 5 + betriebFix);
  });

  it("Jahr 1 im Verlauf = Gewinn im 1. Jahr, Summe der Jahre = Gewinn nach 20 Jahren", () => {
    const r = computeResults(form({ wohneinheiten: 8 }));
    close(r.seriesYearly[0].jahresGewinn, r.gewinnJahr1);
    const summe = r.seriesYearly.reduce((s, y) => s + y.jahresGewinn, 0);
    close(r.gewinn20, summe - r.investition);
    close(r.gewinn20, r.series[19]);
  });

  it("Break-even-Jahr ist das erste Jahr mit kumuliert ≥ 0, Amortisation liegt in diesem Jahr", () => {
    const r = computeResults(form({ wohneinheiten: 8 }));
    assert.ok(r.breakEvenYear !== null);
    const be = r.breakEvenYear!;
    assert.ok(r.series[be - 1] >= 0);
    if (be > 1) assert.ok(r.series[be - 2] < 0);
    assert.ok(r.amortisation > be - 1 && r.amortisation <= be, `Amortisation ${r.amortisation} nicht in Jahr ${be}`);
  });

  it("kein Break-even → Amortisation unendlich", () => {
    const r = computeResults(form({ wohneinheiten: 2, kostenPVManual: 1_000_000 }));
    assert.equal(r.breakEvenYear, null);
    assert.equal(r.amortisation, Infinity);
  });
});

describe("Mieter-Flyer", () => {
  it("Ersparnis = Grundversorger − Mieterstrom für eine Durchschnittswohnung", () => {
    const r = computeResults(form({ wohneinheiten: 10 }));
    assert.equal(r.flyerVerbrauchProWohnung, 1850);
    close(r.flyerSolarKwh + r.flyerNetzKwh, 1850);
    close(r.flyerGrundversorgerJahr, 1850 * 0.35 + 15 * 12);
    close(r.flyerMieterstromJahr, r.flyerSolarKwh * 0.27 + r.flyerNetzKwh * 0.3 + 10 * 12);
    close(r.flyerErsparnisJahr, r.flyerGrundversorgerJahr - r.flyerMieterstromJahr);
  });
});

describe("Robustheit", () => {
  it("num() wandelt Eingaben sicher um", () => {
    assert.equal(num(""), 0);
    assert.equal(num("abc", 5), 5);
    assert.equal(num("0.27"), 0.27);
    assert.equal(num(12), 12);
  });

  it("keine NaN-Werte bei leeren Feldern und vielen Kombinationen", () => {
    const modelle = ["physischer_sz_sw", "virtueller_sz", "ggv"] as const;
    const wp = ["nein", "eigener_zaehler", "allgemeinstrom"] as const;
    const wb = ["nein", "hinter_zaehler", "eigener_zaehler"] as const;
    for (const mieterstromModell of modelle)
      for (const waermepumpeModus of wp)
        for (const wallboxModus of wb)
          for (const [we, ge] of [[0, 0], [0, 3], [1, 0], [12, 2], [40, 20], ["", ""]] as const) {
            const r = computeResults(
              form({ mieterstromModell, waermepumpeModus, wallboxModus, wohneinheiten: we, gewerbeeinheiten: ge, wallboxAnzahl: 2, durchlauferhitzer: true, durchlauferhitzerAnzahl: "" })
            );
            for (const [key, value] of Object.entries(r)) {
              if (typeof value === "number") assert.ok(!Number.isNaN(value), `${key} ist NaN (${mieterstromModell}/${waermepumpeModus}/${wallboxModus}/${we}/${ge})`);
            }
            assert.ok(r.eigenverbrauchGesamt <= r.pvErtrag + 1e-9 && r.eigenverbrauchGesamt <= r.verbrauchGesamt + 1e-9);
            assert.ok(r.autarkiegrad >= 0 && r.autarkiegrad <= 100);
            assert.ok(r.eigenverbrauchsquote >= 0 && r.eigenverbrauchsquote <= 100);
          }
  });
});

describe("Diagramm-Achse", () => {
  it("niceCeil rundet auf 1/2/5/10 × Zehnerpotenz", () => {
    assert.equal(niceCeil(37000), 50000);
    assert.equal(niceCeil(120), 200);
    assert.equal(niceCeil(1000), 1000);
    assert.equal(niceCeil(0), 1);
  });
});
