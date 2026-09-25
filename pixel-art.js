/* ============================================================
   Tiny pixel-art sprites, drawn as inline SVG from a 16x16 grid.
   '.' = transparent. Any other character is a palette key.
   ============================================================ */
const PIXEL_PALETTE = {
  B: "#ec4899", // body / pink
  b: "#db2777", // body shade
  W: "#bae6fd", // window
  D: "#1f2937", // dark / wheel
  Y: "#fbbf24", // headlight / highlight
  P: "#8b5cf6", // purple accent
  p: "#7c3aed",
  G: "#e5e7eb", // light grey
};

const TRUCK_GRID = [
  "................",
  "................",
  "..PPPPPPPP......",
  "..PWWWWWWP......",
  "..PWWWWWWP.BBBBB",
  "..PPPPPPPPbBBBBB",
  "..P......bWWWWBB",
  "..P......bWWWWBB",
  "..Pbbbbbbbbbbbbb",
  "..PbbbbbbbbbbbbB",
  "GGGGGGGGGGGGGGGG",
  ".DD..........DD.",
  "DDDD........DDDD",
  ".DD..........DD.",
  "................",
  "................",
];

const WAREHOUSE_GRID = [
  "................",
  "......PP........",
  ".....PppP.......",
  "....PpppPp......",
  "...PpppppPp.....",
  "..PBBBBBBBBPp...",
  "..BWWWWWWWWB....",
  "..BWWWWWWWWB....",
  "..BBBBBBBBBB....",
  "..BWWbbbbWWB....",
  "..BWWbYYbWWB....",
  "..BWWbbbbWWB....",
  "..BBBBBBBBBB....",
  "GGGGGGGGGGGGGG..",
  "................",
  "................",
];

function pixelSVG(grid, size = 12) {
  const w = grid[0].length, h = grid.length;
  let rects = "";
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const key = grid[y][x];
      if (key === ".") continue;
      const color = PIXEL_PALETTE[key] || "#000";
      rects += `<rect x="${x * size}" y="${y * size}" width="${size}" height="${size}" fill="${color}"/>`;
    }
  }
  return `<svg class="pixel-wrap" width="${w * size}" height="${h * size}" viewBox="0 0 ${w * size} ${h * size}" xmlns="http://www.w3.org/2000/svg">${rects}</svg>`;
}

/** Picks an icon based on destination name (Sorting Center -> warehouse, else truck). */
function pixelIconFor(destination, size = 12) {
  const d = (destination || "").toLowerCase();
  const grid = d.includes("sorting center") ? WAREHOUSE_GRID : TRUCK_GRID;
  return pixelSVG(grid, size);
}
