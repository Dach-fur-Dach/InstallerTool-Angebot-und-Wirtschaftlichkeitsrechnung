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

export function NumberInput(props: InputHTMLAttributes<HTMLInputElement>) {
  const { className = "", ...rest } = props;
  return <input type="number" className={`${inputBase} disabled:border-[#E5EAF1] disabled:bg-[#F8FAFC] disabled:text-[#B0B8C4] ${className}`} {...rest} />;
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
