import { CSSProperties } from "react";

interface IconProps {
  className?: string;
  style?: CSSProperties;
}

export function ChevronIcon({ className = "", style }: IconProps) {
  return (
    <svg width="10" height="6" viewBox="0 0 10 6" fill="none" className={className} style={style}>
      <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function CheckIcon({ className = "", style }: IconProps) {
  return (
    <svg width="11" height="9" viewBox="0 0 11 9" fill="none" className={className} style={style}>
      <path d="M1 4.6L4 7.5L10 1" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function WarningIcon({ className = "", style }: IconProps) {
  return (
    <svg width="15" height="14" viewBox="0 0 24 22" fill="none" className={className} style={style}>
      <path
        d="M12 2.5L23 20.5H1L12 2.5Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      <path d="M12 9V13.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <circle cx="12" cy="16.8" r="0.9" fill="currentColor" />
    </svg>
  );
}

export function DragHandleIcon({ className = "", style }: IconProps) {
  return (
    <svg width="8" height="14" viewBox="0 0 8 14" fill="none" className={className} style={style}>
      <circle cx="1.5" cy="1.5" r="1.3" fill="currentColor" />
      <circle cx="6.5" cy="1.5" r="1.3" fill="currentColor" />
      <circle cx="1.5" cy="7" r="1.3" fill="currentColor" />
      <circle cx="6.5" cy="7" r="1.3" fill="currentColor" />
      <circle cx="1.5" cy="12.5" r="1.3" fill="currentColor" />
      <circle cx="6.5" cy="12.5" r="1.3" fill="currentColor" />
    </svg>
  );
}

export function ArrowRightIcon({ className = "", style }: IconProps) {
  return (
    <svg width="12" height="9" viewBox="0 0 12 9" fill="none" className={className} style={style}>
      <path
        d="M0.5 4.5H10.5M10.5 4.5L7 1M10.5 4.5L7 8"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
