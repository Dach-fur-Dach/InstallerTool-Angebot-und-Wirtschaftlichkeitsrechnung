"use client";

import { ReactNode } from "react";

export function Collapse({
  open,
  children,
  innerClassName = "",
}: {
  open: boolean;
  children: ReactNode;
  innerClassName?: string;
}) {
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
