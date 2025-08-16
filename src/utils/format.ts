export const shortAddress = (addr: string, left = 6, right = 4) =>
  addr.length > left + right ? `${addr.slice(0, left)}…${addr.slice(-right)}` : addr;

export const formatNumber = (n: number) =>
  Intl.NumberFormat(undefined, { maximumFractionDigits: 2 }).format(n);

export const formatCurrency = (n: number, currency: string = "USD") =>
  Intl.NumberFormat(undefined, { style: "currency", currency, maximumFractionDigits: 0 }).format(n);

export const timeAgo = (ts: number) => {
  const s = Math.floor((Date.now() - ts) / 1000);
  if (s < 60) return `${s}s ago`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 30) return `${d}d ago`;
  const mo = Math.floor(d / 30);
  if (mo < 12) return `${mo}mo ago`;
  const y = Math.floor(mo / 12);
  return `${y}y ago`;
};

export const percentBarClass = (pct: number) => {
  if (pct >= 67) return "bg-green-600";
  if (pct >= 34) return "bg-yellow-500";
  return "bg-red-500";
};
