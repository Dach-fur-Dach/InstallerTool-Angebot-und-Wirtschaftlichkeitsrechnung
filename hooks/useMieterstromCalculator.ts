"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { DEFAULTS, FormState, MieterstromModell, computeResults, num } from "@/lib/calculator";

const INSTALLER_LOGO_STORAGE_KEY = "d4d_installer_logo";

export type WirtschaftBenoetigt = "ja" | "nein" | null;

export interface BetriebOpenState {
  versicherung: boolean;
  abrechnung: boolean;
  netzstrom: boolean;
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
  flyer: boolean;
}

export type OutputKey = keyof OutputsState;

export const OUTPUT_LABELS: Record<OutputKey, string> = {
  angebot: "Angebot",
  wirtschaft: "Wirtschaftlichkeit",
  flyer: "Mieter-Flyer",
};

const DEFAULT_OUTPUT_ORDER: OutputKey[] = ["angebot", "wirtschaft", "flyer"];

// Central state/controller hook for the calculator page: owns the form state, derives
// results via computeResults(), and tracks all the UI state (which sections/boxes are
// expanded, which outputs are enabled and in what order, modal visibility, etc.) so
// page.tsx and its child components can stay presentational.
export function useMieterstromCalculator() {
  const [form, setForm] = useState<FormState>(DEFAULTS);
  const results = useMemo(() => computeResults(form), [form]);
  const loading = false;

  const [showRechnungsadresse, setShowRechnungsadresse] = useState(false);
  const [messkonzeptExpanded, setMesskonzeptExpanded] = useState(false);
  const [messtechnikExpanded, setMesstechnikExpanded] = useState(false);

  const [box1Open, setBox1Open] = useState(true);
  const [box2Open, setBox2Open] = useState(true);
  const [box3Open, setBox3Open] = useState(false);
  const [box4Open, setBox4Open] = useState(false);
  const [box5Open, setBox5Open] = useState(false);

  const [wirtschaftBenoetigt, setWirtschaftBenoetigtState] = useState<WirtschaftBenoetigt>(null);
  const [wirtschaftPanelOpen, setWirtschaftPanelOpen] = useState(false);

  const [outputs, setOutputs] = useState<OutputsState>({
    wirtschaft: true,
    angebot: true,
    flyer: false,
  });
  const [outputOrder, setOutputOrder] = useState<OutputKey[]>(DEFAULT_OUTPUT_ORDER);
  const [betriebOpen, setBetriebOpen] = useState<BetriebOpenState>({
    versicherung: false,
    abrechnung: false,
    netzstrom: false,
    zaehler: false,
  });
  const [pdfEmailModalOpen, setPdfEmailModalOpen] = useState(false);
  const [installerEmail, setInstallerEmail] = useState("");
  const [installerLogo, setInstallerLogoState] = useState<string | null>(null);

  // Installer logo is persisted client-side (localStorage) rather than in FormState,
  // since it should survive across different Angebote for the same installer/browser.
  useEffect(() => {
    const stored = window.localStorage.getItem(INSTALLER_LOGO_STORAGE_KEY);
    if (stored) setInstallerLogoState(stored);
  }, []);

  const setInstallerLogo = useCallback((dataUrl: string | null) => {
    setInstallerLogoState(dataUrl);
    if (dataUrl) window.localStorage.setItem(INSTALLER_LOGO_STORAGE_KEY, dataUrl);
    else window.localStorage.removeItem(INSTALLER_LOGO_STORAGE_KEY);
  }, []);
  const [sectionOpen, setSectionOpen] = useState<SectionOpenState>({
    immobilie: false,
    investition: false,
    betriebskosten: false,
    einnahmen: false,
  });
  const update = useCallback(<K extends keyof FormState>(field: K, value: FormState[K]) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  }, []);

  const onNum = useCallback(
    (field: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement>) => {
      const raw = e.target.value;
      // Incomplete numeric input while typing (e.g. "-", ".", "-.") is treated as unset rather
      // than stored as NaN, which would otherwise corrupt downstream calculations/display.
      if (raw === "" || raw === "-" || raw === "." || raw === "-.") {
        update(field, "" as FormState[typeof field]);
        return;
      }
      const parsed = parseFloat(raw);
      if (!isFinite(parsed)) return;
      update(field, parsed as FormState[typeof field]);
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

  // GGV has no metered Grundpreis on the operator side (it would inflate ROI unrealistically),
  // so switching to it resets Grundgebühr to 0; switching away restores the default.
  const setMieterstromModell = useCallback(
    (modell: MieterstromModell) => {
      setForm((prev) => ({
        ...prev,
        mieterstromModell: modell,
        grundgebuehr: modell === "ggv" ? 0 : prev.mieterstromModell === "ggv" ? DEFAULTS.grundgebuehr : prev.grundgebuehr,
      }));
    },
    []
  );

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

  // Drag-and-drop reorder: pulls draggedKey out of the list and reinserts it at
  // targetKey's current position, shifting everything between them.
  const reorderOutputs = useCallback((draggedKey: OutputKey, targetKey: OutputKey) => {
    if (draggedKey === targetKey) return;
    setOutputOrder((prev) => {
      const next = prev.filter((k) => k !== draggedKey);
      const targetIndex = next.indexOf(targetKey);
      next.splice(targetIndex, 0, draggedKey);
      return next;
    });
  }, []);

  // Keyboard/button-driven reorder alternative to reorderOutputs: swaps an output one
  // position up or down, a no-op at either end of the list.
  const moveOutput = useCallback((key: OutputKey, direction: -1 | 1) => {
    setOutputOrder((prev) => {
      const index = prev.indexOf(key);
      const swapWith = index + direction;
      if (swapWith < 0 || swapWith >= prev.length) return prev;
      const next = [...prev];
      [next[index], next[swapWith]] = [next[swapWith], next[index]];
      return next;
    });
  }, []);

  const resetAllgemeinManual = useCallback(() => update("verbrauchAllgemeinManual", ""), [update]);
  const resetErtragManual = useCallback(() => update("ertragProKwpManual", ""), [update]);
  const resetWohnungenManual = useCallback(() => update("verbrauchWohnungenManual", ""), [update]);
  const resetGewerbeManual = useCallback(() => update("verbrauchGewerbeManual", ""), [update]);
  const resetPvGroesseManual = useCallback(() => update("pvGroesseManual", ""), [update]);
  const resetSpeicherManual = useCallback(() => update("speicherManual", ""), [update]);
  const resetKostenPVManual = useCallback(() => update("kostenPVManual", ""), [update]);
  const resetKostenSpeicherManual = useCallback(() => update("kostenSpeicherManual", ""), [update]);
  const resetKostenZaehlerschrankManual = useCallback(() => update("kostenZaehlerschrankManual", ""), [update]);

  // Derived UI flags, recomputed each render from form/wirtschaftBenoetigt state.
  const wpDisabled = form.waermepumpeModus === "nein";
  // Physical Summenzähler models need Wandlermessung (current-transformer metering);
  // warn the installer if that box isn't checked.
  const wandlerWarning =
    (form.mieterstromModell === "physischer_sz" || form.mieterstromModell === "physischer_sz_sw") &&
    !form.wandlermessung;
  const angebotReady = num(form.wohneinheiten) > 0 || num(form.gewerbeeinheiten) > 0;
  // Dims the Wirtschaftlichkeit section visually (without hiding it) once the installer
  // has explicitly said it isn't needed for this offer.
  const tier2VisualOpacity = wirtschaftBenoetigt === "nein" ? 0.5 : 1;

  const activeOutputOrder = useMemo(() => outputOrder.filter((key) => outputs[key]), [outputOrder, outputs]);

  return {
    form,
    update,
    setMieterstromModell,
    onNum,
    onText,
    setBool,
    results,
    loading,

    showRechnungsadresse,
    setShowRechnungsadresse,
    messkonzeptExpanded,
    setMesskonzeptExpanded,
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
    outputOrder,
    activeOutputOrder,
    reorderOutputs,
    moveOutput,
    betriebOpen,
    toggleBetrieb,
    sectionOpen,
    toggleSection,

    resetAllgemeinManual,
    resetErtragManual,
    resetWohnungenManual,
    resetGewerbeManual,
    resetPvGroesseManual,
    resetSpeicherManual,
    resetKostenPVManual,
    resetKostenSpeicherManual,
    resetKostenZaehlerschrankManual,

    wpDisabled,
    wandlerWarning,
    angebotReady,
    tier2VisualOpacity,

    pdfEmailModalOpen,
    setPdfEmailModalOpen,
    installerEmail,
    setInstallerEmail,
    installerLogo,
    setInstallerLogo,
  };
}

export type MieterstromCalculator = ReturnType<typeof useMieterstromCalculator>;
