import React from 'react';

type PaginationProps = {
  total: number;
  limit: number;
  offset: number;
  onChange: (nextOffset: number) => void;
};

export const Pagination: React.FC<PaginationProps> = ({ total, limit, offset, onChange }) => {
  const page = Math.floor(offset / limit) + 1;
  const pages = Math.max(1, Math.ceil(total / limit));

  const go = (p: number) => onChange(Math.max(0, Math.min(pages - 1, p - 1)) * limit);

  return (
    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
      <button onClick={() => go(1)} disabled={page <= 1}>
        {'<<'}
      </button>
      <button onClick={() => go(page - 1)} disabled={page <= 1}>
        {'<'}
      </button>
      <span>
        стр. {page} / {pages}
      </span>
      <button onClick={() => go(page + 1)} disabled={page >= pages}>
        {'>'}
      </button>
      <button onClick={() => go(pages)} disabled={page >= pages}>
        {'>>'}
      </button>
    </div>
  );
};
