"use client";

import { useEffect, useState } from "react";

const VISIBLE_MS = 2300;

export function LoadingScreen() {
  const [visible, setVisible] = useState(true);
  const [fading, setFading] = useState(false);

  useEffect(() => {
    const fadeTimer = setTimeout(() => setFading(true), VISIBLE_MS);
    const removeTimer = setTimeout(() => setVisible(false), VISIBLE_MS + 500);
    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(removeTimer);
    };
  }, []);

  if (!visible) return null;

  return (
    <div
      className={`dfd-wave-bg fixed inset-0 z-[9999] flex items-center justify-center transition-opacity duration-500 ease-in-out ${
        fading ? "opacity-0" : "opacity-100"
      }`}
      style={{ pointerEvents: fading ? "none" : "auto" }}
      aria-hidden="true"
    >
      <svg
        width="260"
        height="139"
        viewBox="0 0 239 128"
        className="dfd-loading-svg"
      >
        <circle
          cx="179.207"
          cy="54.04"
          r="54.04"
          fill="#FCD78B"
          className="dfd-sun"
        />

        <path
          d="M145.298 63.6898L122.655 37.0216L85.7526 30.9872L0 127.197H14.3083L92.2741 39.1507L109.697 60.9524L145.298 63.6898Z"
          fill="#3CB7EB"
          className="dfd-left-band"
        />

        <path
          d="M149.885 64.0425L181.786 66.4879L160.044 43.1411L127.644 37.8367L149.885 64.0425Z"
          fill="#3CB7EB"
          className="dfd-tile-b"
        />
        <path
          d="M148.266 67.1936L112.483 64.4441L137.45 95.6989L173.33 96.7087L148.266 67.1936Z"
          fill="#3CB7EB"
          className="dfd-tile-d"
        />
        <path
          d="M185.072 70.0161L152.854 67.5464L177.723 96.8303L210.914 97.7671L185.072 70.0161Z"
          fill="#3CB7EB"
          className="dfd-tile-c"
        />
        <path
          d="M176.177 100.054L140.126 99.0447L162.623 127.197H199.209L176.177 100.054Z"
          fill="#3CB7EB"
          className="dfd-tile-e"
        />
        <path
          d="M180.57 100.176L203.504 127.197H238.314L214.041 101.125L180.57 100.176Z"
          fill="#3CB7EB"
          className="dfd-tile-g"
        />

        <path
          d="M90.6925 106.332C97.6272 106.332 103.249 100.711 103.249 93.7767C103.249 86.8425 97.6272 81.2212 90.6925 81.2212C83.7579 81.2212 78.1362 86.8425 78.1362 93.7767C78.1362 100.711 83.7579 106.332 90.6925 106.332Z"
          fill="#3CB7EB"
          className="dfd-dot"
        />
      </svg>
    </div>
  );
}
