/* ------------------ Data Parsers ------------------ */

function safeParse(value) {
  try {
    return JSON.parse(value);
  } catch {
    return undefined;
  }
}

export function parseJSONArray(value, fallback = []) {
  const parsed = safeParse(value);
  return Array.isArray(parsed) ? parsed : fallback;
}

export function parseJSONObject(value, fallback = {}) {
  const parsed = safeParse(value);
  return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : fallback;
}
