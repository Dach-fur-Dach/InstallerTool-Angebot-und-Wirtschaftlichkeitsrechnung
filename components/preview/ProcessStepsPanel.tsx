"use client";

import Image from "next/image";

const STEPS = [
  {
    title: "Beauftragung",
    description: "Sie beauftragen uns – ab hier übernehmen wir die komplette Projektumsetzung für Ihr Mieterstrom-Projekt.",
  },
  {
    title: "Kickoff Call & Festlegung der Konditionen",
    description:
      "Im persönlichen Gespräch legen wir gemeinsam Messkonzept, Zeitplan und die Stromkonditionen für Ihre Mietparteien fest.",
  },
  {
    title: "Abschluss der Mieterstromverträge",
    description:
      "Sie schließen die Mieterstromverträge mit Ihren Mietparteien ab – wir liefern die passenden Vertragsvorlagen und alle nötigen Unterlagen.",
  },
  {
    title: "Installation von Messtechnik & Solaranlage",
    description: "Ein Fachbetrieb installiert Solaranlage und Messtechnik vor Ort und nimmt die Anlage fachgerecht in Betrieb.",
  },
  {
    title: "Zugang zum Kundenportal",
    description:
      "Sie und Ihre Mieter erhalten Zugriff auf unser Kundenportal – mit Live-Verbräuchen, Kosten und monatlichen Reportings.",
  },
  {
    title: "Jahresabrechnung",
    description: "Wir erstellen automatisiert die rechtssichere Jahresabrechnung nach § 40 EnWG für alle Wohneinheiten.",
  },
];

const FOOTER_COLUMNS = [
  ["Dach für Dach GmbH", "Lohmühlenstraße 65", "12435 Berlin", "info@dachfuerdach.de"],
  ["Geschäftsführer", "Leonard John, Jasper Klimas", "Registergericht: Berlin", "HRB 270746 B"],
  ["Bankverbindung", "IBAN: DE58 1001 0123 7656 9865 67", "BIC: QNTODEB2XXX"],
];

export function ProcessStepsPanel() {
  return (
    <div className="rounded-2xl border border-[#E5EAF1] bg-white px-7 py-[26px] shadow-[0_1px_3px_rgba(16,24,40,0.06)]">
      <div className="mb-5 flex items-start justify-between">
        <div>
          <h2 className="m-0 mb-1.5 text-[22px] leading-[1.25] font-extrabold text-[#0A1628]">So arbeiten wir zusammen</h2>
          <p className="m-0 text-[13px] leading-relaxed text-[#5B6472]">
            Von der Beauftragung bis zur Jahresabrechnung – Ihr Weg mit Dach für Dach in sechs Schritten.
          </p>
        </div>
        <Image src="/logo.png" alt="Dach für Dach" height={22} width={92} className="h-[22px] w-auto shrink-0" />
      </div>

      <div className="relative mt-7 mb-2">
        <div className="absolute top-5 bottom-5 left-5 w-px bg-[#CFE3F0]" />
        <div className="flex flex-col gap-7">
          {STEPS.map((step, i) => {
            const isLast = i === STEPS.length - 1;
            return (
              <div key={step.title} className="relative flex items-start gap-4 break-inside-avoid">
                <div
                  className="relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-[15px] font-extrabold text-white"
                  style={{ background: isLast ? "#D9A441" : "#3AA8DC" }}
                >
                  {i + 1}
                </div>
                <div className="pt-1.5">
                  <h3 className="m-0 mb-1 text-[14.5px] font-extrabold text-[#0A1628]">{step.title}</h3>
                  <p className="m-0 text-[13px] leading-relaxed text-[#5B6472]">{step.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-8 grid grid-cols-3 gap-4 border-t border-[#EDF1F6] pt-5 text-[10.5px] leading-relaxed text-[#98A2B3]">
        {FOOTER_COLUMNS.map((col, i) => (
          <div key={i}>
            {col.map((line, j) => (
              <div key={j} className={j === 0 ? "font-semibold text-[#5B6472]" : ""}>
                {line}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
