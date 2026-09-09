function parseQty(raw: string): number | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;
  if (/^\d+\/\d+$/.test(trimmed)) {
    const [num, den] = trimmed.split('/').map(Number);
    return den === 0 ? null : num / den;
  }
  const n = Number(trimmed);
  return Number.isFinite(n) ? n : null;
}

function formatQty(value: number): string {
  const rounded = Math.round(value * 100) / 100;
  return String(rounded);
}

export function scaleQty(raw: string, factor: number): string {
  const value = parseQty(raw);
  if (value === null) return raw;
  return formatQty(value * factor);
}
