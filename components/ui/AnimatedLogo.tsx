"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

const COLLAPSE_DELAY_MS = 20000;
const LOGO_HEIGHT = 76;
const LOGO_WIDTH = 314;
const ICON_ONLY_WIDTH = 95;

export function AnimatedLogo() {
  const [collapsed, setCollapsed] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [pinned, setPinned] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setCollapsed(true), COLLAPSE_DELAY_MS);
    return () => clearTimeout(timer);
  }, []);

  const expanded = !collapsed || hovered || pinned;

  return (
    <a
      href="https://dachfuerdach.de"
      target="_blank"
      rel="noopener noreferrer"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => setPinned(true)}
      className="block shrink-0 overflow-hidden"
      style={{
        height: LOGO_HEIGHT,
        width: expanded ? LOGO_WIDTH : ICON_ONLY_WIDTH,
        transition: "width 450ms cubic-bezier(0.4, 0, 0.2, 1)",
      }}
    >
      <Image
        src="/logo-pub.png"
        alt="Dach für Dach"
        height={LOGO_HEIGHT}
        width={LOGO_WIDTH}
        className="h-[76px] w-auto max-w-none"
        priority
      />
    </a>
  );
}
