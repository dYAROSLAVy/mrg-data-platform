export const formatKm = (v?: number | null) => {
  if (v === null || v === undefined) return '—';
  const n = Number(v);
  if (!Number.isFinite(n)) return '—';
  return new Intl.NumberFormat('ru-RU', {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  }).format(n);
};

const periodFormatter = new Intl.DateTimeFormat('ru-RU', {
  month: 'short',
  year: 'numeric',
});

export const formatPeriod = (v?: string | null): string => {
  if (!v) return '—';
  const m = /^(\d{4})-(\d{2})/.exec(v);
  if (!m) return '—';
  const date = new Date(Number(m[1]), Number(m[2]) - 1, 1);
  return periodFormatter.format(date).replaceAll('\u00A0', ' ').replace('.', '');
};

export const formatFixed2 = (v?: number | null): string => {
  if (v === null || v === undefined) return '—';
  const n = Number(v);
  if (!Number.isFinite(n)) return '—';
  return new Intl.NumberFormat('ru-RU', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(n);
};
