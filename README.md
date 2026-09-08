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
