export const currency = (n) =>
  '$' + Number(n || 0).toLocaleString(undefined, { maximumFractionDigits: 0 });

export const number = (n, d = 0) =>
  Number(n || 0).toLocaleString(undefined, { maximumFractionDigits: d });

export const percent = (n, d = 1) => `${Number(n || 0).toFixed(d)}%`;

export const date = (d) => (d ? new Date(d).toLocaleDateString() : '—');

export const titleCase = (s) =>
  String(s || '')
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());

// sentence-case for status labels: "on_trip" -> "On trip"
export const label = (s) => {
  const t = String(s || '').replace(/_/g, ' ');
  return t.charAt(0).toUpperCase() + t.slice(1);
};
