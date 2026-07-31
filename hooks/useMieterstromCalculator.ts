"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ComputedResults, DEFAULTS, FormState, computeResults } from "@/lib/calculator";

export type ChartMode = "kumuliert" | "jaehrlich" | "verlauf" | "verteilung";
export type WirtschaftBenoetigt = "ja" | "nein" | null;

export interface BetriebOpenState {
  versicherung: boolean;
  abrechnung: boolean;
  reststrom: boolean;
  zaehler: boolean;
}

export interface SectionOpenState {
  immobilie: boolean;
  investition: boolean;
  betriebskosten: boolean;
  einnahmen: boolean;
}

export interface OutputsState {
  wirtschaft: boolean;
  angebot: boolean;
}

const DEBOUNCE_MS = 500;
const DEFAULT_MESSKONZEPT_LABELS = ["SZ", "PV", "AS", "WP", "WE1"];

export function useMieterstromCalculator() {
  const [form, setForm] = useState<FormState>(DEFAULTS);
  const [results, setResults] = useState<ComputedResults>(() => computeResults(DEFAULTS));
  const [loading, setLoading] = useState(false);

  const [showRechnungsadresse, setShowRechnungsadresse] = useState(false);
  const [messkonzeptExpanded, setMesskonzeptExpanded] = useState(false);
  const [messkonzeptLabels, setMesskonzeptLabels] = useState<string[]>(DEFAULT_MESSKONZEPT_LABELS);
  const [messtechnikExpanded, setMesstechnikExpanded] = useState(false);

  const [box1Open, setBox1Open] = useState(true);
  const [box2Open, setBox2Open] = useState(true);
  const [box3Open, setBox3Open] = useState(false);
  const [box4Open, setBox4Open] = useState(false);
  const [box5Open, setBox5Open] = useState(false);

  const [wirtschaftBenoetigt, setWirtschaftBenoetigtState] = useState<WirtschaftBenoetigt>(null);
  const [wirtschaftPanelOpen, setWirtschaftPanelOpen] = useState(false);

  const [outputs, setOutputs] = useState<OutputsState>({ wirtschaft: true, angebot: true });
  const [betriebOpen, setBetriebOpen] = useState<BetriebOpenState>({
    versicherung: false,
    abrechnung: false,
    reststrom: false,
    zaehler: false,
  });
  const [sectionOpen, setSectionOpen] = useState<SectionOpenState>({
    immobilie: false,
    investition: false,
    betriebskosten: false,
    einnahmen: false,
  });
  const [chartMode, setChartMode] = useState<ChartMode>("kumuliert");

  const isFirstRender = useRef(true);
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    setLoading(true);
    const timer = setTimeout(() => {
      setResults(computeResults(form));
      setLoading(false);
    }, DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [form]);

  const update = useCallback(<K extends keyof FormState>(field: K, value: FormState[K]) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  }, []);

  const onNum = useCallback(
    (field: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement>) => {
      update(field, (e.target.value === "" ? "" : parseFloat(e.target.value)) as FormState[typeof field]);
    },
    [update]
  );

  const onText = useCallback(
    (field: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      update(field, e.target.value as FormState[typeof field]);
    },
    [update]
  );

  const setBool = useCallback(
    (field: keyof FormState, value: boolean) => {
      update(field, value as FormState[typeof field]);
    },
    [update]
  );

  const setMesskonzeptLabel = useCallback((i: number, value: string) => {
    setMesskonzeptLabels((prev) => {
      const next = [...prev];
      next[i] = value;
      return next;
    });
  }, []);

  const setWirtschaftBenoetigt = useCallback((val: "ja" | "nein") => {
    setWirtschaftBenoetigtState(val);
    setBox3Open(val === "ja");
    setBox4Open(val === "ja");
    setBox5Open(val === "ja");
    setWirtschaftPanelOpen(val === "ja");
  }, []);

  const toggleBetrieb = useCallback((key: keyof BetriebOpenState) => {
    setBetriebOpen((prev) => ({ ...prev, [key]: !prev[key] }));
  }, []);

  const toggleSection = useCallback((key: keyof SectionOpenState) => {
    setSectionOpen((prev) => ({ ...prev, [key]: !prev[key] }));
  }, []);

  const toggleOutput = useCallback((key: keyof OutputsState) => {
    setOutputs((prev) => ({ ...prev, [key]: !prev[key] }));
  }, []);

  const resetAllgemeinManual = useCallback(() => update("verbrauchAllgemeinManual", ""), [update]);
  const resetErtragManual = useCallback(() => update("ertragProKwpManual", ""), [update]);

  const wpDisabled = form.waermepumpeModus === "nein";
  const wandlerWarning = form.mieterstromModell === "physischer_sz" && !form.wandlermessung;
  const angebotReady = !!(form.objektStrasse && form.objektPlzStadt);
  const tier2VisualOpacity = wirtschaftBenoetigt === "nein" ? 0.5 : 1;

  const messkonzeptSlots = useMemo(
    () =>
      messkonzeptLabels.map((label, i) => ({
        label,
        hasArrow: i < messkonzeptLabels.length - 1,
      })),
    [messkonzeptLabels]
  );

  return {
    form,
    update,
    onNum,
    onText,
    setBool,
    results,
    loading,

    showRechnungsadresse,
    setShowRechnungsadresse,
    messkonzeptExpanded,
    setMesskonzeptExpanded,
    messkonzeptSlots,
    setMesskonzeptLabel,
    messtechnikExpanded,
    setMesstechnikExpanded,

    box1Open,
    setBox1Open,
    box2Open,
    setBox2Open,
    box3Open,
    setBox3Open,
    box4Open,
    setBox4Open,
    box5Open,
    setBox5Open,

    wirtschaftBenoetigt,
    setWirtschaftBenoetigt,
    wirtschaftPanelOpen,
    setWirtschaftPanelOpen,

    outputs,
    toggleOutput,
    betriebOpen,
    toggleBetrieb,
    sectionOpen,
    toggleSection,
    chartMode,
    setChartMode,

    resetAllgemeinManual,
    resetErtragManual,

    wpDisabled,
    wandlerWarning,
    angebotReady,
    tier2VisualOpacity,
  };
}

export type MieterstromCalculator = ReturnType<typeof useMieterstromCalculator>;
