"use client";

import { ReactNode, SelectHTMLAttributes, InputHTMLAttributes } from "react";

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
  "w-full box-border rounded-lg border border-[#D0D5DD] px-[11px] py-[9px] text-[13.5px] text-[#0A1628]";

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
  "w-full box-border rounded-lg border border-[#D0D5DD] py-[9px] pl-[11px] pr-7 text-[13.5px] text-[#0A1628] [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none";

export function NumberInput(props: InputHTMLAttributes<HTMLInputElement>) {
  const { className = "", value, onChange, min, max, step, disabled, ...rest } = props;
  const stepNum = step ? parseFloat(String(step)) || 1 : 1;

  const adjust = (delta: number) => {
    if (disabled || !onChange) return;
    const current = parseFloat(String(value ?? "")) || 0;
    let next = current + delta;
    if (min !== undefined && min !== "") next = Math.max(next, parseFloat(String(min)));
    if (max !== undefined && max !== "") next = Math.min(next, parseFloat(String(max)));
    onChange({ target: { value: String(next) } } as React.ChangeEvent<HTMLInputElement>);
  };

  return (
    <div className="relative">
      <input
        type="number"
        value={value}
        onChange={onChange}
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
