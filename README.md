# Mieterstrom-Rechner

A tool for solar installers to configure a "Mieterstrom" (tenant electricity) offer for a building, calculate its economics, and generate customer-facing PDF documents (offer, cost/benefit analysis, flyer).

Built with [Next.js](https://nextjs.org) 16 (App Router), React 19, and Tailwind CSS.

## Features

- **Building & customer input** — capture the customer, building address, and energy system details (PV size, storage, Messkonzept/metering concept).
- **Consumption & pricing** — model tenant consumption and set up the Mieterstrom pricing.
- **Live economics ("Wirtschaftlichkeit")** — investment, revenue, operating cost, and amortization calculated as inputs change.
- **Address map preview** — shows the building location on a map alongside the form.
- **PDF export** — generates an offer ("Angebot"), a cost/benefit analysis, and/or a flyer as a print-ready PDF, with an optional email step.
- **Embeddable** — supports an `?embed=1` mode for embedding the tool in another page (e.g. an iframe).

## Getting Started

Install dependencies and run the development server:

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser. The app auto-reloads as you edit files under `app/`.

Other scripts:

```bash
npm run build   # production build
npm run start   # run a production build
npm run lint    # eslint
```

## Project structure

- `app/` — Next.js App Router entry point (`page.tsx`, `layout.tsx`).
- `components/form/` — input boxes for the building, energy system, consumption, and pricing.
- `components/preview/` — the offer, cost/benefit, and flyer panels, plus the print/PDF layout.
- `components/ui/` — shared UI pieces (logo upload, collapsible sections, icons, loading screen).
- `hooks/useMieterstromCalculator.ts` — central state and calculation hook driving the whole form/preview flow.
- `lib/calculator.ts` — the Mieterstrom economics calculations.
- `lib/generatePdf.ts` — renders the preview to a PDF and names the output file.
- `lib/charts.ts` / `lib/umami.ts` — chart helpers and analytics event tracking.
