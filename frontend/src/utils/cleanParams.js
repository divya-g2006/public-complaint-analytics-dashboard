export function cleanParams(obj) {
  const out = {};
  for (const [k, v] of Object.entries(obj || {})) {
    const value = String(v ?? "").trim();
    if (value) out[k] = value;
  }
  return out;
}

