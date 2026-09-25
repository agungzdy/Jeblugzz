/* ============================================================
   Dunex Monitoring – shared config & helpers
   Edit CONFIG below to point at your own sheet / timings.
   ============================================================ */
const CONFIG = {
  // Google Sheet that holds the "Summary Outbound" live monitoring tab.
  // Taken from: https://docs.google.com/spreadsheets/d/1OFVFHKdQNJXU9NxMwYgTQoFBB9yJcP_8QJekWKAFL0w/edit?gid=830486441
  SHEET_ID: "1OFVFHKdQNJXU9NxMwYgTQoFBB9yJcP_8QJekWKAFL0w",
  SHEET_GID: "830486441",
  REFRESH_SECONDS: 20,        // how often Live Monitoring re-fetches the sheet
  ETD_ALERT_MINUTES: 10,      // trigger the big popup when ETD is this close
  ALERT_DURATION_MS: 5000,    // popup stays on screen 5s
  ALERT_COOLDOWN_MIN: 5,      // don't re-popup the same trip more than once per 5 min
};

function csvUrl(sheetId, gid) {
  return `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:csv&gid=${gid}`;
}

/** Minimal RFC4180 CSV parser (handles quoted fields with commas/newlines). */
function parseCSV(text) {
  const rows = [];
  let row = [], field = "", inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i], n = text[i + 1];
    if (inQuotes) {
      if (c === '"' && n === '"') { field += '"'; i++; }
      else if (c === '"') { inQuotes = false; }
      else { field += c; }
    } else {
      if (c === '"') inQuotes = true;
      else if (c === ',') { row.push(field); field = ""; }
      else if (c === '\r') { /* skip */ }
      else if (c === '\n') { row.push(field); rows.push(row); row = []; field = ""; }
      else field += c;
    }
  }
  if (field.length || row.length) { row.push(field); rows.push(row); }
  return rows.filter(r => r.some(c => c && c.trim() !== ""));
}

/** Turns parsed CSV rows (with a header row) into an array of objects keyed by header name. */
function csvToObjects(rows) {
  if (!rows.length) return [];
  const headers = rows[0].map(h => h.trim());
  return rows.slice(1).map(r => {
    const o = {};
    headers.forEach((h, i) => (o[h] = (r[i] || "").trim()));
    return o;
  });
}

/** Parses "DD/MM/YYYY HH:mm" (the format used in the sheet) into a Date, or null for "-"/empty. */
function parseIDDateTime(str) {
  if (!str || str.trim() === "" || str.trim() === "-") return null;
  const m = str.trim().match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})\s+(\d{1,2}):(\d{2})/);
  if (!m) return null;
  const [, dd, mm, yyyy, hh, min] = m;
  return new Date(+yyyy, +mm - 1, +dd, +hh, +min);
}

function fmtTime(d) {
  if (!d) return "-";
  return d.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
}
function fmtDate(d) {
  if (!d) return "-";
  return d.toLocaleDateString("id-ID", { day: "2-digit", month: "2-digit", year: "numeric" });
}
function isoDate(d) {
  if (!d) return "";
  const p = n => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

/** Fetch a public Google-Sheets CSV export. Throws on failure so callers can show a friendly error. */
async function fetchSheetCSV(sheetId, gid) {
  const res = await fetch(csvUrl(sheetId, gid), { cache: "no-store" });
  if (!res.ok) throw new Error("HTTP " + res.status);
  const text = await res.text();
  return csvToObjects(parseCSV(text));
}

/** Maps the sheet's "Delay Status" text to a badge class + short label. */
function statusBadge(delayStatus, hasDeparted) {
  const s = (delayStatus || "").toUpperCase();
  if (hasDeparted) return { cls: "badge-green", label: "Sudah Berangkat" };
  if (s.includes("DELAY")) return { cls: "badge-red", label: "Delay" };
  if (s.includes("ON TIME")) return { cls: "badge-green", label: "On Time" };
  if (s.includes("WAITING")) return { cls: "badge-orange", label: "Waiting" };
  return { cls: "badge-gray", label: delayStatus || "-" };
}
