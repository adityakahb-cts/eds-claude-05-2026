/**
 * Safely parses a JSON string as an array. Returns fallback on error or non-array.
 * @param {string} value JSON string to parse
 * @param {Array} [fallback=[]] Value to return on parse failure or non-array result
 * @returns {Array} Parsed array or fallback
 */
export function parseJSONArray(value, fallback = []) {
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : fallback;
  } catch {
    return fallback;
  }
}

/**
 * Safely parses a JSON string as an object. Returns fallback on error or non-object.
 * @param {string} value JSON string to parse
 * @param {object} [fallback={}] Value to return on parse failure or non-object result
 * @returns {object} Parsed object or fallback
 */
export function parseJSONObject(value, fallback = {}) {
  try {
    const parsed = JSON.parse(value);
    return parsed !== null && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : fallback;
  } catch {
    return fallback;
  }
}
