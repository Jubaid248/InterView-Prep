"use client";

import React, { useMemo } from "react";

// Faceted (low-poly) rose-ringed parakeet, facing left, in flight.
// All parts are flat-shaded polygons lit from the top-left, so it reads as 3D
// while staying a tiny inline SVG that we can animate piece by piece.

type Pt = [number, number];
type Facet = { p: Pt[]; c: string };

const C = {
  g1: "#B4E585",
  g2: "#86CF5E",
  g3: "#5CB34C",
  g4: "#3E9443",
  g5: "#2A7236",
  g6: "#1B532A",
  nape: "#6CB7A3",
  t1: "#57C6B8",
  t2: "#2E9F9C",
  t3: "#1E7884",
  t4: "#145566",
  r1: "#F2683F",
  r2: "#D8432B",
  r3: "#A8301F",
  b1: "#FF7A57",
  b2: "#E2432B",
  b3: "#AE2A1A",
  jawLight: "#4E2419",
  jawDark: "#2A1510",
};

const toPoints = (p: Pt[]) => p.map(([x, y]) => `${x},${y}`).join(" ");

// A two-tone feather: lit upper vane and shaded lower vane, split along the shaft.
function feather(base: Pt, angleDeg: number, length: number, width: number, light: string, dark: string): Facet[] {
  const a = (angleDeg * Math.PI) / 180;
  const dx = Math.cos(a);
  const dy = Math.sin(a);
  const nx = -dy;
  const ny = dx;
  const tip: Pt = [base[0] + dx * length, base[1] + dy * length];
  const mid: Pt = [base[0] + dx * length * 0.62, base[1] + dy * length * 0.62];
  const up: Pt = [mid[0] - nx * width * 0.5, mid[1] - ny * width * 0.5];
  const down: Pt = [mid[0] + nx * width * 0.5, mid[1] + ny * width * 0.5];
  const b1: Pt = [base[0] - nx * width * 0.3, base[1] - ny * width * 0.3];
  const b2: Pt = [base[0] + nx * width * 0.3, base[1] + ny * width * 0.3];
  return [
    { p: [b1, up, tip, base], c: light },
    { p: [base, tip, down, b2], c: dark },
  ];
}

function lerp(a: Pt, b: Pt, t: number): Pt {
  return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
}

function buildWing(far: boolean): Facet[] {
  const o: Pt = far ? [10, -8] : [0, 0];
  const P = (x: number, y: number): Pt => [x + o[0], y + o[1]];
  const s = P(176, 132);
  const e = P(196, 104);
  const w = P(232, 78);
  const m1 = P(214, 112);
  const m2 = P(248, 98);
  const m3 = P(230, 124);
  const m4 = P(200, 140);

  const facets: Facet[] = [];

  // Secondaries hang back from the trailing edge of the coverts
  for (let i = 0; i < 5; i++) {
    const t = i / 4;
    const base = lerp(m4, m2, t);
    facets.push(...feather(base, 18 - t * 26, 64 - t * 6, 15, far ? C.t3 : C.t2, far ? C.t4 : C.t3));
  }

  // Primaries fan up and back from the wrist; drawn trailing-first so the leading one sits on top
  const primaries = [
    { a: -8, l: 92 },
    { a: -16, l: 104 },
    { a: -24, l: 112 },
    { a: -32, l: 114 },
    { a: -40, l: 108 },
  ];
  primaries.forEach(({ a, l }, i) => {
    const base = lerp(m2, w, i / (primaries.length - 1));
    const lead = i === primaries.length - 1;
    const light = far ? C.t3 : lead ? C.g3 : C.t1;
    const dark = far ? C.t4 : lead ? C.g5 : C.t3;
    facets.push(...feather(base, a, l, 13, light, dark));
  });

  // Coverts: green with a red shoulder band
  const covert: Facet[] = [
    { p: [s, e, m1], c: far ? C.g5 : C.g2 },
    { p: [e, w, m1], c: far ? C.g4 : C.g1 },
    { p: [w, m2, m1], c: far ? C.g5 : C.g3 },
    { p: [m1, m2, m3], c: far ? C.r3 : C.r1 },
    { p: [s, m1, m4], c: far ? C.g6 : C.g3 },
    { p: [m1, m3, m4], c: far ? C.r3 : C.r2 },
  ];
  facets.push(...covert);
  return facets;
}

const TAIL: Facet[] = [
  ...feather([236, 178], 26, 104, 16, C.t1, C.t2),
  ...feather([230, 186], 34, 150, 15, C.g4, C.g5),
  ...feather([244, 172], 30, 156, 16, C.t2, C.t3),
];

const H = {
  crown: [118, 64] as Pt,
  forehead: [98, 76] as Pt,
  beakTop: [90, 92] as Pt,
  beakBottom: [92, 112] as Pt,
  chin: [104, 124] as Pt,
  throat: [124, 134] as Pt,
  nape: [146, 74] as Pt,
  backHead: [156, 96] as Pt,
  neck: [158, 118] as Pt,
  cheek: [122, 104] as Pt,
  eye: [112, 90] as Pt,
};

const HEAD: Facet[] = [
  { p: [H.crown, H.forehead, H.eye], c: C.g1 },
  { p: [H.forehead, H.beakTop, H.eye], c: C.g2 },
  { p: [H.crown, H.eye, H.nape], c: C.g2 },
  { p: [H.nape, H.eye, H.cheek], c: C.g3 },
  { p: [H.nape, H.cheek, H.backHead], c: C.nape },
  { p: [H.eye, H.beakTop, H.cheek], c: C.g2 },
  { p: [H.beakTop, H.beakBottom, H.cheek], c: C.g3 },
  { p: [H.beakBottom, H.chin, H.cheek], c: C.g3 },
  { p: [H.chin, H.throat, H.cheek], c: C.g4 },
  { p: [H.cheek, H.throat, H.neck], c: C.g4 },
  { p: [H.cheek, H.backHead, H.neck], c: C.g5 },
];

const B = {
  mantle: [182, 100] as Pt,
  chest: [130, 166] as Pt,
  belly: [160, 194] as Pt,
  underBelly: [188, 206] as Pt,
  vent: [218, 198] as Pt,
  rump: [250, 168] as Pt,
  backLow: [226, 140] as Pt,
  back: [192, 120] as Pt,
  core: [180, 160] as Pt,
  chestCore: [150, 148] as Pt,
};

const BODY: Facet[] = [
  // Mantle bridges the back of the head into the shoulders so the head doesn't float
  { p: [H.nape, B.mantle, H.backHead], c: C.g3 },
  { p: [H.backHead, B.mantle, B.back], c: C.g4 },
  { p: [H.backHead, B.back, H.neck], c: C.g4 },
  { p: [H.neck, B.back, B.chestCore], c: C.g2 },
  { p: [B.back, B.backLow, B.core], c: C.g3 },
  { p: [B.back, B.core, B.chestCore], c: C.g3 },
  { p: [H.throat, H.neck, B.chestCore], c: C.g3 },
  { p: [H.throat, B.chestCore, B.chest], c: C.g2 },
  { p: [B.chest, B.chestCore, B.core], c: C.g3 },
  { p: [B.chest, B.core, B.belly], c: C.g4 },
  { p: [B.belly, B.core, B.underBelly], c: C.g5 },
  { p: [B.underBelly, B.core, B.vent], c: C.g6 },
  { p: [B.core, B.backLow, B.rump], c: C.g4 },
  { p: [B.core, B.rump, B.vent], c: C.g5 },
];

const UPPER_BEAK: Facet[] = [
  { p: [[90, 90], [76, 90], [64, 102]], c: C.b1 },
  { p: [[90, 90], [64, 102], [92, 112]], c: C.b2 },
  { p: [[64, 102], [62, 116], [76, 120]], c: C.b2 },
  { p: [[64, 102], [76, 120], [92, 112]], c: C.b3 },
  { p: [[62, 116], [68, 132], [76, 120]], c: C.b3 },
];

const LOWER_BEAK: Facet[] = [
  { p: [[92, 111], [76, 119], [80, 130]], c: C.jawLight },
  { p: [[92, 111], [80, 130], [97, 124]], c: C.jawDark },
];

function Facets({ list }: { list: Facet[] }) {
  return (
    <>
      {list.map((f, i) => (
        <polygon key={i} points={toPoints(f.p)} fill={f.c} stroke={f.c} strokeWidth={0.6} strokeLinejoin="round" />
      ))}
    </>
  );
}

interface FlyingParrotProps {
  /** 0 = closed, 1 = fully open. Drive it from speech to make the parrot talk. */
  mouth?: number;
  /** Seconds per wingbeat. Smaller is faster. */
  flapSeconds?: number;
  /** Tilts the head slightly while speaking. */
  speaking?: boolean;
  className?: string;
}

export default function FlyingParrot({ mouth = 0, flapSeconds = 0.9, speaking = false, className }: FlyingParrotProps) {
  const nearWing = useMemo(() => buildWing(false), []);
  const farWing = useMemo(() => buildWing(true), []);
  const open = Math.max(0, Math.min(1, mouth));

  const flap = { animationDuration: `${flapSeconds}s` };

  return (
    <svg viewBox="40 -30 360 330" className={className} role="img" aria-label="Tota the parrot">
      <g className="parrot-bob" style={flap}>
        <g className="parrot-wing-far" style={flap}>
          <Facets list={farWing} />
        </g>

        <Facets list={TAIL} />
        <Facets list={BODY} />

        {/* Tucked feet */}
        <path d="M184 202 l-4 11 M192 204 l-1 12 M200 203 l3 10" stroke="#7D868C" strokeWidth={3} strokeLinecap="round" fill="none" />

        <g
          style={{
            transformBox: "view-box",
            transformOrigin: "150px 120px",
            transform: `rotate(${speaking ? -6 : 0}deg)`,
            transition: "transform 0.45s ease",
          }}
        >
          <Facets list={HEAD} />

          {/* Black chin stripe and black/pink collar */}
          <polygon points="92,112 104,124 126,136 124,140 102,128 90,115" fill="#141A14" />
          <polygon points="126,140 146,135 161,120 163,124 148,140 127,145" fill="#F193B2" />
          <polygon points="124,136 145,131 159,116 161,120 146,135 126,140" fill="#141A14" />

          <g
            style={{
              transformBox: "view-box",
              transformOrigin: "92px 112px",
              transform: `rotate(${open * 24}deg)`,
              transition: "transform 70ms linear",
            }}
          >
            <Facets list={LOWER_BEAK} />
          </g>
          <g
            style={{
              transformBox: "view-box",
              transformOrigin: "90px 96px",
              transform: `rotate(${-open * 4}deg)`,
              transition: "transform 70ms linear",
            }}
          >
            <Facets list={UPPER_BEAK} />
          </g>

          {/* Eye */}
          <circle cx={H.eye[0]} cy={H.eye[1]} r={6.6} fill="#F4A95C" />
          <circle cx={H.eye[0]} cy={H.eye[1]} r={4.6} fill="#FFF3C2" />
          <circle cx={H.eye[0] - 0.6} cy={H.eye[1]} r={2.5} fill="#0E120F" />
          <circle cx={H.eye[0] - 1.6} cy={H.eye[1] - 1.3} r={1.1} fill="#FFFFFF" />
          <ellipse className="parrot-blink" cx={H.eye[0]} cy={H.eye[1]} rx={7.4} ry={7.4} fill={C.g2} />
        </g>

        <g className="parrot-wing-near" style={flap}>
          <Facets list={nearWing} />
        </g>
      </g>
    </svg>
  );
}
