"use client";

import { useEffect, useRef, useState } from "react";
import { FieldLabel, TextInput } from "@/components/ui/Field";

export interface AddressSuggestion {
  strasse: string;
  plzStadt: string;
}

interface PhotonFeature {
  properties: {
    type?: string;
    name?: string;
    street?: string;
    housenumber?: string;
    postcode?: string;
    city?: string;
    district?: string;
    countrycode?: string;
  };
}

// Photon (komoot) is an OSM geocoder built for search-as-you-type, needs no API key and
// allows CORS. Results are biased towards the centre of Germany and filtered to DACH.
const PHOTON_URL = "https://photon.komoot.io/api/";
const ALLOWED_COUNTRIES = new Set(["DE", "AT", "CH"]);
const MIN_QUERY_LENGTH = 3;
const DEBOUNCE_MS = 300;

function toSuggestion(f: PhotonFeature): AddressSuggestion | null {
  const p = f.properties;
  if (p.countrycode && !ALLOWED_COUNTRIES.has(p.countrycode)) return null;
  // House results carry the street in `street`; street results carry it in `name`.
  const street = p.type === "street" ? p.name : p.street;
  if (!street) return null;
  const strasse = p.housenumber ? `${street} ${p.housenumber}` : street;
  const plzStadt = [p.postcode, p.city ?? p.district].filter(Boolean).join(" ");
  return { strasse, plzStadt };
}

// Free-typed text (no suggestion picked) is split into street and "PLZ Stadt" at the
// postcode, e.g. "Hauptstr. 5, 12345 Berlin" or "Hauptstr. 5 12345 Berlin".
function parseAddress(text: string): AddressSuggestion {
  const m = text.match(/^(.*?)[,\s]+(\d{4,5}\b.*)$/);
  if (m) return { strasse: m[1].trim().replace(/,$/, ""), plzStadt: m[2].trim() };
  const [strasse, ...rest] = text.split(",");
  return { strasse: strasse.trim(), plzStadt: rest.join(",").trim() };
}

function formatAddress(strasse: string, plzStadt: string): string {
  return [strasse, plzStadt].filter(Boolean).join(", ");
}

// One address field for the Objekt: type freely or pick a suggestion; either way the
// result is stored as separate street and "PLZ Stadt" values (used by the map and PDF).
export function AddressSearch({
  strasse,
  plzStadt,
  onChange,
}: {
  strasse: string;
  plzStadt: string;
  onChange: (s: AddressSuggestion) => void;
}) {
  const [query, setQuery] = useState(() => formatAddress(strasse, plzStadt));
  const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([]);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const q = query.trim();
    if (q.length < MIN_QUERY_LENGTH) return;
    const controller = new AbortController();
    const t = setTimeout(async () => {
      try {
        const params = new URLSearchParams({ q, lang: "de", limit: "8", lat: "51.2", lon: "10.4" });
        const res = await fetch(`${PHOTON_URL}?${params}`, { signal: controller.signal });
        if (!res.ok) return;
        const data: { features: PhotonFeature[] } = await res.json();
        const seen = new Set<string>();
        const list = data.features
          .map(toSuggestion)
          .filter((s): s is AddressSuggestion => {
            if (!s) return false;
            const key = `${s.strasse}|${s.plzStadt}`;
            if (seen.has(key)) return false;
            seen.add(key);
            return true;
          })
          .slice(0, 6);
        setSuggestions(list);
        setActive(-1);
      } catch {
        // Aborted or offline: keep the manual address fields as the fallback.
      }
    }, DEBOUNCE_MS);
    return () => {
      clearTimeout(t);
      controller.abort();
    };
  }, [query]);

  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (!wrapperRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, []);

  const choose = (s: AddressSuggestion) => {
    onChange(s);
    setQuery(formatAddress(s.strasse, s.plzStadt));
    setSuggestions([]);
    setOpen(false);
  };

  const visible = open && query.trim().length >= MIN_QUERY_LENGTH && suggestions.length > 0;

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!visible) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((i) => (i + 1) % suggestions.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((i) => (i <= 0 ? suggestions.length - 1 : i - 1));
    } else if (e.key === "Enter" && active >= 0) {
      e.preventDefault();
      choose(suggestions[active]);
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  };

  return (
    <div ref={wrapperRef} className="relative">
      <FieldLabel
        label="Objektadresse"
        required
        info="Adresse eintippen und einen Vorschlag auswählen, oder vollständig eingeben (Straße Nr., PLZ Stadt)."
      />
      <TextInput
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
          onChange(parseAddress(e.target.value));
        }}
        onFocus={() => setOpen(true)}
        onKeyDown={onKeyDown}
        placeholder="z. B. Friedrichstraße 12, 10969 Berlin"
        autoComplete="off"
        role="combobox"
        aria-expanded={visible}
        aria-autocomplete="list"
      />
      {visible && (
        <ul
          role="listbox"
          className="absolute right-0 left-0 z-30 mt-1 overflow-hidden rounded-lg border border-[#E5EAF1] bg-white py-1 shadow-[0_4px_16px_rgba(16,24,40,0.12)]"
        >
          {suggestions.map((s, i) => (
            <li
              key={`${s.strasse}|${s.plzStadt}`}
              role="option"
              aria-selected={i === active}
              onMouseDown={(e) => {
                e.preventDefault();
                choose(s);
              }}
              onMouseEnter={() => setActive(i)}
              className={`cursor-pointer px-3 py-2 text-[13px] ${i === active ? "bg-[#EAF6FC]" : ""}`}
            >
              <span className="font-semibold text-[#1B2A3A]">{s.strasse}</span>
              <span className="text-[#667085]">{s.plzStadt ? `, ${s.plzStadt}` : ""}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
