"use client";

import Image from "next/image";

const FOOTER_COLUMNS = [
  ["Dach für Dach GmbH", "Lohmühlenstraße 65", "12435 Berlin", "info@dachfuerdach.de"],
  ["Geschäftsführer", "Leonard John, Jasper Klimas", "Registergericht: Berlin", "HRB 270746 B"],
  ["Bankverbindung", "IBAN: DE58 1001 0123 7656 9865 67", "BIC: QNTODEB2XXX"],
];

export function PrintPageHeader() {
  return (
    <div className="mb-4 flex justify-end">
      <Image src="/logo.png" alt="Dach für Dach" height={44} width={184} className="h-11 w-auto" />
    </div>
  );
}

export function PrintPageFooter() {
  return (
    <div className="mt-8 grid grid-cols-3 gap-4 border-t border-[#EDF1F6] pt-4 text-[10.5px] leading-relaxed text-[#98A2B3]">
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
  );
}
