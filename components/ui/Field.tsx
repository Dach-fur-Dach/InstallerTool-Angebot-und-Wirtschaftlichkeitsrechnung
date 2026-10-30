"use client";

import { ReactNode, SelectHTMLAttributes, InputHTMLAttributes, useRef, useState } from "react";
import { InfoIcon } from "@/components/ui/Icons";

interface FieldLabelProps {
  label: string;
  required?: boolean;
  className?: string;
  children?: ReactNode;
  info?: string;
}

export function FieldLabel({ label, required, className = "", children, info }: FieldLabelProps) {
  return (
    <label className={`mb-1.5 flex items-center gap-1 text-[12.5px] font-semibold text-[#344054] ${className}`}>
      <span>
        {label} {required && <span className="text-[#3AA8DC]">*</span>}
      </span>
      {info && <InfoTooltip text={info} />}
      {children}
    </label>
  );
}

// Positioned with a JS-measured `fixed` coordinate (not CSS absolute + group-hover) for two
// reasons: it shows instantly on mouseenter with no transition/OS-tooltip delay, and `fixed`
// escapes the `overflow-hidden` collapse-animation wrapper that clipped an absolutely
// positioned tooltip near the top of a CollapsibleBox.
export function InfoTooltip({ text }: { text: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null);

  const show = () => {
    const rect = ref.current?.getBoundingClientRect();
    if (rect) setPos({ top: rect.bottom + 6, left: rect.left + rect.width / 2 });
  };

  return (
    <span
      ref={ref}
      onMouseEnter={show}
      onMouseLeave={() => setPos(null)}
      className="inline-flex shrink-0 cursor-help items-center font-normal text-[#98A2B3] hover:text-[#3AA8DC]"
    >
      <InfoIcon className="h-3 w-3" />
      {pos && (
        <span
          style={{ top: pos.top, left: pos.left }}
          className="pointer-events-none fixed z-50 w-56 -translate-x-1/2 rounded-lg bg-[#3AA8DC] px-2.5 py-1.5 text-[11px] font-normal normal-case leading-snug text-white shadow-lg"
        >
          {text}
        </span>
      )}
    </span>
  );
}

const inputBase =
  "w-full box-border rounded-lg border border-[#D0D5DD] bg-white px-[11px] py-[9px] text-[13.5px] text-[#0A1628]";

export function TextInput(props: InputHTMLAttributes<HTMLInputElement>) {
  const { className = "", ...rest } = props;
  return <input type="text" className={`${inputBase} ${className}`} {...rest} />;
}

function ChevronIcon({ direction }: { direction: "up" | "down" }) {
  return (
    <svg
      width="12"
      height="7"
      viewBox="0 0 9 5"
      fill="none"
      className={direction === "up" ? "" : "rotate-180"}
    >
      <path d="M1 4L4.5 1L8 4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

const numberInputBase =
  "w-full box-border rounded-lg border border-[#D0D5DD] bg-white py-[9px] pl-[11px] pr-7 text-[13.5px] text-[#0A1628] [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none";

// Displays numbers with a comma decimal separator (German convention), matching what
// NumberInput now accepts as typed input.
const toText = (v: unknown) =>
  v === "" || v === undefined || v === null ? "" : String(v).replace(".", ",");

const decimalPlaces = (n: number) => {
  const s = String(n);
  const i = s.indexOf(".");
  return i === -1 ? 0 : s.length - i - 1;
};

// Renders as a text input (with a numeric mobile keypad via inputMode) instead of
// type="number": native number inputs silently discard invalid keystrokes/pastes without
// updating the DOM value, which left stray characters visible while the controlled value
// prop couldn't overwrite them. Sanitizing via regex here keeps garbage input out of state
// and out of the field, and a real "0" is always shown (no more hiding zero as a placeholder,
// which made it impossible to type a leading 0 for decimals like 0,27).
export function NumberInput(props: InputHTMLAttributes<HTMLInputElement> & { integer?: boolean }) {
  const { className = "", value, onChange, min, max, step, disabled, placeholder, integer = false, ...rest } = props;
  const stepNum = step ? parseFloat(String(step)) || 1 : 1;
  const allowNegative = min !== undefined && min !== "" && parseFloat(String(min)) < 0;
  // Accept "," as a decimal separator alongside "." so German-formatted input (e.g. "0,27") is
  // not silently rejected keystroke-by-keystroke. `integer` fields (unit/meter counts — you
  // can't install half a Zähler) reject the separator outright instead.
  const pattern = integer
    ? allowNegative
      ? /^-?\d*$/
      : /^\d*$/
    : allowNegative
      ? /^-?\d*[.,]?\d*$/
      : /^\d*[.,]?\d*$/;

  const [text, setText] = useState(() => toText(value));
  const [focused, setFocused] = useState(false);
  // Track the prop value we last synced from, so an external change (e.g. an auto-computed
  // result, or a reset) can update the displayed text — but never while the user is typing.
  const [syncedValue, setSyncedValue] = useState(value);
  if (!focused && value !== syncedValue) {
    setSyncedValue(value);
    setText(toText(value));
  }

  const emit = (raw: string) => {
    onChange?.({ target: { value: raw } } as React.ChangeEvent<HTMLInputElement>);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    if (raw !== "" && !pattern.test(raw)) return; // reject invalid characters (typed or pasted)
    setText(raw);
    // Keep the comma on screen (matches what the user typed) but emit with a dot so
    // downstream parseFloat() handles German-formatted decimals correctly.
    emit(raw.replace(",", "."));
  };

  const adjust = (delta: number) => {
    if (disabled || !onChange) return;
    const current = parseFloat(text.replace(",", ".")) || 0;
    // Plain float addition (e.g. 0.1 + 0.2) accumulates binary rounding error
    // (0.30000000000000004); round to the step's own decimal precision to clean it up.
    const decimals = integer ? 0 : Math.max(decimalPlaces(stepNum), decimalPlaces(current));
    let next = parseFloat((current + delta).toFixed(decimals));
    if (integer) next = Math.round(next);
    if (min !== undefined && min !== "") next = Math.max(next, parseFloat(String(min)));
    if (max !== undefined && max !== "") next = Math.min(next, parseFloat(String(max)));
    setText(String(next).replace(".", ","));
    emit(String(next));
  };

  return (
    <div className="relative">
      <input
        type="text"
        inputMode="decimal"
        value={text}
        placeholder={placeholder ?? "0"}
        onChange={handleChange}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        min={min}
        max={max}
        step={step}
        disabled={disabled}
        className={`${numberInputBase} disabled:border-[#E5EAF1] disabled:bg-[#F8FAFC] disabled:text-[#B0B8C4] ${className}`}
        {...rest}
      />
      {!disabled && (
        <div className="absolute inset-y-0 right-1.5 flex flex-col items-center justify-center gap-[3px]">
          <button
            type="button"
            tabIndex={-1}
            onClick={() => adjust(stepNum)}
            className="flex cursor-pointer items-center justify-center text-[#98A2B3] hover:text-[#3AA8DC]"
          >
            <ChevronIcon direction="up" />
          </button>
          <button
            type="button"
            tabIndex={-1}
            onClick={() => adjust(-stepNum)}
            className="flex cursor-pointer items-center justify-center text-[#98A2B3] hover:text-[#3AA8DC]"
          >
            <ChevronIcon direction="down" />
          </button>
        </div>
      )}
    </div>
  );
}

export function SelectInput(props: SelectHTMLAttributes<HTMLSelectElement>) {
  const { className = "", children, ...rest } = props;
  return (
    <select
      className={`${inputBase} bg-white disabled:border-[#E5EAF1] disabled:bg-[#F8FAFC] disabled:text-[#B0B8C4] ${className}`}
      {...rest}
    >
      {children}
    </select>
  );
}

interface ToggleSwitchProps {
  label: string;
  checked: boolean;
  onChange: () => void;
}

export function ToggleSwitch({ label, checked, onChange }: ToggleSwitchProps) {
  return (
    <label className="flex cursor-pointer items-center justify-between gap-2.5 rounded-lg border border-[#E5EAF1] bg-[#FCFBF9] px-3 py-2.5">
      <span className="text-[13px] font-medium text-[#1B2A3A]">{label}</span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={onChange}
        className={`relative h-5 w-9 shrink-0 cursor-pointer rounded-full border-0 p-0 transition-colors ${
          checked ? "bg-[#3AA8DC]" : "bg-[#D0D5DD]"
        }`}
      >
        <span
          className={`absolute top-0.5 left-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform ${
            checked ? "translate-x-[16px]" : "translate-x-0"
          }`}
        />
      </button>
    </label>
  );
}

interface YesNoToggleProps {
  label: string;
  value: boolean;
  onChange: (value: boolean) => void;
}

export function YesNoToggle({ label, value, onChange }: YesNoToggleProps) {
  const base = "cursor-pointer rounded-[7px] px-3.5 py-1.5 text-[12.5px] font-semibold";
  const active = "border border-[#3AA8DC] bg-[#3AA8DC] text-white font-bold";
  const inactive = "border border-[#D0D5DD] bg-white text-[#667085]";
  return (
    <div className="flex items-center justify-between gap-2.5">
      <span className="text-[13px] font-semibold text-[#344054]">{label}</span>
      <div className="flex gap-1.5">
        <button type="button" onClick={() => onChange(false)} className={`${base} ${!value ? active : inactive}`}>
          Nein
        </button>
        <button type="button" onClick={() => onChange(true)} className={`${base} ${value ? active : inactive}`}>
          Ja
        </button>
      </div>
    </div>
  );
}

interface SwitchRowProps {
  label: string;
  value: boolean;
  onChange: (value: boolean) => void;
}

// One-tap on/off switch for yes/no fields; the whole row is the tap target (iPad-friendly).
export function SwitchRow({ label, value, onChange }: SwitchRowProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={value}
      onClick={() => onChange(!value)}
      className="flex w-full cursor-pointer items-center justify-between gap-3 rounded-lg border-0 bg-transparent p-0 py-1.5 text-left"
    >
      <span className="text-[13px] font-semibold text-[#344054]">{label}</span>
      <span
        className={`relative h-7 w-12 shrink-0 rounded-full transition-colors ${value ? "bg-[#3AA8DC]" : "bg-[#D0D5DD]"}`}
      >
        <span
          className={`absolute top-0.5 left-0.5 h-6 w-6 rounded-full bg-white shadow transition-transform ${
            value ? "translate-x-5" : "translate-x-0"
          }`}
        />
      </span>
    </button>
  );
}

interface SliderFieldProps {
  label: string;
  value: number | "";
  min: number;
  max: number;
  onChange: (value: number) => void;
}

// Slider with the current value shown (and −/+ buttons for precise taps). Values above `max`
// are kept and displayed; the thumb just pins at the end.
export function SliderField({ label, value, min, max, onChange }: SliderFieldProps) {
  const n = typeof value === "number" && isFinite(value) ? value : 0;
  const clamp = (v: number) => Math.max(min, Math.min(max, v));
  const step = (d: number) => onChange(clamp(n + d));
  const btn =
    "flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-lg border border-[#D0D5DD] bg-white text-lg font-semibold text-[#667085] select-none active:bg-[#EAF6FC]";
  return (
    <div>
      <FieldLabel label={label} />
      <div className="flex items-center gap-2.5">
        <button type="button" aria-label={`${label} verringern`} onClick={() => step(-1)} className={btn}>
          −
        </button>
        <input
          type="range"
          min={min}
          max={max}
          step={1}
          value={Math.min(n, max)}
          onChange={(e) => onChange(parseInt(e.target.value, 10))}
          aria-label={label}
          className="h-9 min-w-0 flex-1 cursor-pointer touch-pan-y accent-[#3AA8DC]"
        />
        <button type="button" aria-label={`${label} erhöhen`} onClick={() => step(1)} className={btn}>
          +
        </button>
        <span className="w-8 shrink-0 text-right text-[15px] font-bold text-[#0A1628] tabular-nums">{n}</span>
      </div>
    </div>
  );
}

interface ButtonGroupProps<T extends string> {
  value: T;
  options: { value: T; label: string }[];
  onChange: (value: T) => void;
}

export function ButtonGroup<T extends string>({ value, options, onChange }: ButtonGroupProps<T>) {
  return (
    <div role="radiogroup" className="grid grid-cols-3 gap-2">
      {options.map((o) => {
        const active = o.value === value;
        return (
          <button
            key={o.value}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(o.value)}
            className={`min-h-12 cursor-pointer rounded-lg border px-2 py-2 text-[12.5px] leading-tight font-semibold ${
              active
                ? "border-[#3AA8DC] bg-[#3AA8DC] font-bold text-white"
                : "border-[#D0D5DD] bg-white text-[#344054]"
            }`}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}
