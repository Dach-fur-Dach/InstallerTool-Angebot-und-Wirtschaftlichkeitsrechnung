# Calculation engine (`lib/calculator.ts`)

This document explains how `computeResults()` turns the installer's form inputs into
the numbers shown across the Angebot, Wirtschaftlichkeit, and Mieter-Flyer outputs.
It's meant as a companion to the inline comments in the source — the source explains
*why* a specific line does what it does; this doc explains how the pieces fit together
and where the reference numbers came from.

## Inputs and outputs

- **Input**: `FormState` — the raw form fields (units in the building, Mieterstrom
  model, PV/storage sizing, prices, manual overrides, etc). See `FormState` in
  `lib/calculator.ts` for the full field list.
- **Output**: `ComputedResults` — a flat object with every derived number the UI needs
  (investment, revenue, operating cost, 20-year cash flow series, Angebot line items,
  flyer figures). Nothing in the UI recomputes these values itself; they're all read
  straight off this object.

`computeResults()` is a pure function — same `FormState` in, same `ComputedResults`
out, no side effects. It's called from `useMieterstromCalculator()` inside a
`useMemo`, so it only re-runs when `form` actually changes.

## Pipeline overview

The function runs through the following stages in order, each building on the last:

1. **Consumption (`verbrauch*`)** — derives yearly kWh consumption for Wohnungen,
   Gewerbe, Allgemeinstrom, and (if applicable) an on-its-own-meter Wärmepumpe, from
   unit counts. Every one of these has a manual-override field
   (`verbrauchWohnungenManual`, etc.) that takes precedence when set — see
   `isManualOverride()`.
2. **PV sizing & yield** — PV size (kWp) and battery size (kWh) are estimated from
   the number of units (`PV_KWP_PRO_EINHEIT`, `SPEICHER_KWH_PRO_EINHEIT`), again
   overridable manually. Yield per kWp comes from `YIELD[pvSzenario]`
   (Steildach vs. Flachdach), producing `pvErtrag` (kWh/year).
3. **Self-consumption / autarky model** — the biggest approximation in this file.
   See "Self-consumption model" below.
4. **Metering (Messkonzept) & Angebot pricing** — counts Zählpunkte (metering
   points) and prices them per the selected `MieterstromModell` (see "Pricing
   models" below), producing the one-time Angebot totals (`einmaligNetto/Ust/Brutto`)
   and annual metering/billing fees (`jaehrlichNetto/Ust/Brutto`).
5. **Investment & operating cost** — combines PV, storage, Zählerschrank
   (switchboard/current-transformer) cost, and the Mieterstrompaket (= the Angebot's
   one-time net total) into `investition`; combines insurance, billing, grid
   electricity purchase, grid base fee, and metering fees into `betrieb`.
6. **Revenue** — grid base fee income, self-consumed solar sold to tenants, grid
   electricity resold to tenants, feed-in tariff for surplus, and the legal
   Mieterstromzuschlag, summed into `einnahmen`.
7. **20-year projection** — walks 20 years applying `strompreisSteigerung` (annual
   % escalation) to price-coupled income/cost lines only (not flat fees), tracking
   cumulative profit per year and the break-even year.
8. **Flyer figures** — a per-average-Wohnung example calculation, comparing a
   Mieterstrom bill against a Grundversorger (default utility) bill.

## Self-consumption model

The reference tool this app was built to match (an internal Google Sheet /
"Engineering-Kalkulator") computes self-consumption and autarky via an hourly
8,760-hour-per-year simulation: BDEW standard load profiles (H25 households, G25
commercial), 16 location-specific PVGIS yield curves, and a battery state-of-charge
simulation with efficiency/standby losses.

Reproducing that here isn't practical — it would need large load-profile and
yield-curve datasets, plus a per-input simulation run. Instead, `computeResults()`
uses a **calibrated closed-form approximation**:

- **Base self-consumption quote** (before storage) decreases as the PV-yield/consumption
  ratio increases — more generously sized systems produce more surplus.
  `BASISQUOTE_FAKTOR` (0.405) was tuned against a reference case: 7 Wohneinheiten,
  31 kWp PV, 5 kWh storage, Wärmepumpe "ungesteuert" → target self-consumption quote
  46.71%, total autarky 36.17%, tenant autarky 48.30%, WP autarky 25.55%.
- **Storage bonus** adds to that quote based on kWh of storage per MWh of yearly
  consumption.
- **PV-optimized Wärmepumpe** (`wpSzenario: "pv_optimiert"`) gets a flat +4 percentage
  points, since shifting heat-pump load into sunny hours increases self-consumption.
- The result is clamped to a max of 85%.
- **Splitting self-consumption between tenants and the Wärmepumpe** uses a
  correlation factor (`WP_KORRELATION_UNGESTEUERT` / `WP_KORRELATION_PV_OPTIMIERT`)
  rather than a simple pro-rata split, because heat-pump load correlates worse with
  PV generation (heating demand skews toward night/winter) than tenant baseload does.

If the reference calculator's methodology or reference numbers change, these
constants are the ones to re-tune — search for `BASISQUOTE_FAKTOR`,
`speicherBonus`, and `WP_KORRELATION_*` in `lib/calculator.ts`.

## Pricing models (`MODELL_PRICING`)

Four `MieterstromModell` values, each with a `projektpauschale` (flat project fee),
`preisProZaehler` (per metered point), and `gateway` fee:

| Model | Label | Notes |
|---|---|---|
| `physischer_sz` | Physischer Summenzähler | Requires a physical summing meter; higher per-Zähler and gateway cost. |
| `virtueller_sz` | Virtueller Summenzähler | Summing done in software by the Messstellenbetreiber. |
| `ggv` | Gemeinschaftliche Gebäudeversorgung | Distribution by formula, no summing meter. |
| `physischer_sz_sw` | Softwarelösung für Netzbezug (MK D3) | A physical summing meter *may* be needed depending on the Netzbetreiber, but pricing follows the software-based models since assignment of Bezug/Lieferung is done in software. |

`projektpauschale` is currently 1999 € across all four models (kept as separate
entries, not a shared constant, so they can diverge again if pricing changes
per-model). Only `physischer_sz` differs on `preisProZaehler` (149 € vs. 25 €) and
`gateway` (349 € vs. 25 €), reflecting the added hardware cost of a physical meter.

**Zählpunkte counting**: the number of billed metering points is one more than the
number of physical metering *positions* — the summing meter (Summenzähler) itself is
also billed. A physical Summenzähler also skips the separate annual Zählergebühr
(`zaehlgebuehrNetto = 0` when `istPhysischerSZ`), since that cost is folded into its
higher per-Zähler and Funkadapter pricing instead.

## Where to look for the current live prices

`MODELL_PRICING`, `PV_KOSTEN_PRO_KWP`, `SPEICHER_KOSTEN_PRO_KWH`,
`ZAEHLERSCHRANK_WANDLER_PAUSCHALE`, `ABRECHNUNG_PRO_ZAEHLPUNKT`, and
`ZAEHLGEBUEHR_PRO_ZAEHLPUNKT` are the constants that encode current pricing. When
Sales reports a pricing discrepancy (e.g. a stale `projektpauschale`), these are the
values to check against the current price list first.
