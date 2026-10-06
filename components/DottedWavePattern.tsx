"use client";

import React from "react";

export default function DottedWavePattern() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden flex items-center justify-center -z-10 opacity-70">
      <svg
        viewBox="0 0 1200 500"
        className="w-full h-full max-w-6xl animate-dotted-wave"
        fill="none"
      >
        {/* Layered Arched Dotted Rings (Matching Image 2 BOON Arc Pattern) */}
        {[0, 1, 2, 3, 4, 5, 6, 7].map((ringIndex) => {
          const radiusY = 80 + ringIndex * 30;
          const radiusX = 180 + ringIndex * 60;
          const opacity = 0.9 - ringIndex * 0.1;

          return (
            <ellipse
              key={ringIndex}
              cx="600"
              cy="250"
              rx={radiusX}
              ry={radiusY}
              stroke="#f59e0b"
              strokeWidth="2.5"
              strokeDasharray="4 12"
              opacity={opacity}
            />
          );
        })}
      </svg>
    </div>
  );
}
