"use client";

import { ReactNode, SelectHTMLAttributes, InputHTMLAttributes, useState } from "react";

interface FieldLabelProps {
  label: string;
  required?: boolean;
  className?: string;
  children?: ReactNode;
}

export function FieldLabel({ label, required, className = "", children }: FieldLabelProps) {
  return (
    <label className={`mb-1.5 block text-[12.5px] font-semibold text-[#344054] ${className}`}>
      {label} {required && <span className="text-[#3AA8DC]">*</span>}
      {children}
    </label>
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

// Renders as a text input (with a numeric mobile keypad via inputMode) instead of
// type="number": native number inputs silently discard invalid keystrokes/pastes without
// updating the DOM value, which left stray characters visible while the controlled value
// prop couldn't overwrite them. Sanitizing via regex here keeps garbage input out of state
// and out of the field, and a real "0" is always shown (no more hiding zero as a placeholder,
// which made it impossible to type a leading 0 for decimals like 0,27).
export function NumberInput(props: InputHTMLAttributes<HTMLInputElement>) {
  const { className = "", value, onChange, min, max, step, disabled, placeholder, ...rest } = props;
  const stepNum = step ? parseFloat(String(step)) || 1 : 1;
  const allowNegative = min !== undefined && min !== "" && parseFloat(String(min)) < 0;
  // Accept "," as a decimal separator alongside "." so German-formatted input (e.g. "0,27") is
  // not silently rejected keystroke-by-keystroke.
  const pattern = allowNegative ? /^-?\d*[.,]?\d*$/ : /^\d*[.,]?\d*$/;

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
    let next = current + delta;
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
