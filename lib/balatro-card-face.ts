/** Procedural Balatro-style joker card faces as SVG data URLs. */

const PALETTES = [
  { bg: "#1a0a0c", mid: "#3d1218", accent: "#DE443B", glow: "#ff6b5a", suit: "♥" },
  { bg: "#061018", mid: "#0a2840", accent: "#1a8fd4", glow: "#4db8ff", suit: "♠" },
  { bg: "#0c1208", mid: "#1a2e14", accent: "#3d9b4a", glow: "#6ddf7a", suit: "♣" },
  { bg: "#161008", mid: "#3d2a0a", accent: "#e8a020", glow: "#ffd060", suit: "♦" },
  { bg: "#120818", mid: "#2a1040", accent: "#a855f7", glow: "#d8b4fe", suit: "★" },
  { bg: "#081214", mid: "#0e3030", accent: "#14b8a6", glow: "#5eead4", suit: "✦" },
] as const;

export function balatroCardFace(
  seed: number,
  label: string,
  points: number
): string {
  const p = PALETTES[Math.abs(seed) % PALETTES.length];
  const safeLabel = label
    .slice(0, 18)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="600" height="750" viewBox="0 0 600 750">
  <defs>
    <linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${p.mid}"/>
      <stop offset="50%" stop-color="${p.bg}"/>
      <stop offset="100%" stop-color="${p.mid}"/>
    </linearGradient>
    <radialGradient id="r" cx="50%" cy="40%" r="60%">
      <stop offset="0%" stop-color="${p.accent}" stop-opacity="0.35"/>
      <stop offset="100%" stop-color="${p.bg}" stop-opacity="0"/>
    </radialGradient>
    <filter id="glow">
      <feGaussianBlur stdDeviation="8" result="b"/>
      <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
  </defs>

  <!-- Felt / card body -->
  <rect width="600" height="750" rx="36" fill="url(#g)"/>
  <rect width="600" height="750" rx="36" fill="url(#r)"/>

  <!-- Gold rim -->
  <rect x="14" y="14" width="572" height="722" rx="28" fill="none"
        stroke="#F5C542" stroke-width="6" opacity="0.9"/>
  <rect x="28" y="28" width="544" height="694" rx="22" fill="none"
        stroke="${p.accent}" stroke-width="2" opacity="0.55"/>

  <!-- Corner ranks -->
  <text x="52" y="90" font-family="Georgia, serif" font-size="54" font-weight="700"
        fill="${p.glow}">${p.suit}</text>
  <text x="52" y="140" font-family="system-ui,sans-serif" font-size="28" font-weight="800"
        fill="#F5E6C8">${points}</text>

  <g transform="translate(600,750) rotate(180)">
    <text x="52" y="90" font-family="Georgia, serif" font-size="54" font-weight="700"
          fill="${p.glow}">${p.suit}</text>
    <text x="52" y="140" font-family="system-ui,sans-serif" font-size="28" font-weight="800"
          fill="#F5E6C8">${points}</text>
  </g>

  <!-- Center seal -->
  <circle cx="300" cy="340" r="118" fill="none" stroke="${p.accent}" stroke-width="3" opacity="0.5"/>
  <circle cx="300" cy="340" r="96" fill="${p.bg}" stroke="#F5C542" stroke-width="3" opacity="0.85"/>
  <text x="300" y="375" text-anchor="middle" font-family="Georgia, serif" font-size="110"
        fill="${p.glow}" filter="url(#glow)" opacity="0.95">${p.suit}</text>

  <!-- Chip / points banner -->
  <rect x="160" y="500" width="280" height="52" rx="26" fill="${p.accent}" opacity="0.92"/>
  <text x="300" y="535" text-anchor="middle" font-family="system-ui,sans-serif"
        font-size="26" font-weight="800" fill="#0a0a0a" letter-spacing="2">${points} PTS</text>

  <!-- Title strip -->
  <text x="300" y="620" text-anchor="middle" font-family="system-ui,sans-serif"
        font-size="22" font-weight="700" fill="#F5E6C8" opacity="0.9">${safeLabel}</text>

  <!-- Decorative pips -->
  <text x="120" y="280" font-family="Georgia, serif" font-size="36" fill="${p.accent}" opacity="0.35">${p.suit}</text>
  <text x="460" y="280" font-family="Georgia, serif" font-size="36" fill="${p.accent}" opacity="0.35">${p.suit}</text>
  <text x="120" y="450" font-family="Georgia, serif" font-size="36" fill="${p.accent}" opacity="0.35">${p.suit}</text>
  <text x="460" y="450" font-family="Georgia, serif" font-size="36" fill="${p.accent}" opacity="0.35">${p.suit}</text>
</svg>`;

  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}
