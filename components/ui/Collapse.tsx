"use client";

import { ReactNode } from "react";

export function Collapse({
  open,
  children,
  innerClassName = "",
  printMode = false,
}: {
  open: boolean;
  children: ReactNode;
  innerClassName?: string;
  printMode?: boolean;
}) {
  // Print mode skips the CSS grid animation wrapper entirely: Chrome does not
  // reliably fragment `display: grid` boxes across printed pages, which produces
  // a blank page followed by the content spilling into a fresh box on the next page.
  if (printMode) {
    return <div className={innerClassName}>{children}</div>;
  }

  return (
    <div
      className={`grid transition-[grid-template-rows] duration-300 ease-in-out ${open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}
    >
      <div
        className={`overflow-hidden transition-opacity duration-200 ${open ? "opacity-100 delay-100" : "opacity-0"} ${innerClassName}`}
      >
        {children}
      </div>
    </div>
  );
}
