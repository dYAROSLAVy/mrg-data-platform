import React from 'react';
import './styles.css';

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
    <div className="pagination">
      <span>
        {page} из {pages}
      </span>

      <div className="pagination__inner">
        <button className="pagination__button" onClick={() => go(1)} disabled={page <= 1}>
          <svg
            width="9"
            height="14"
            viewBox="0 0 9 14"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M8.89388 11.9514L3.75134 6.76492L8.89388 1.57848L7.32876 0L0.621094 6.76492L7.32876 13.5298L8.89388 11.9514Z"
              fill="#6B7280"
            />
          </svg>
          <svg
            width="9"
            height="14"
            viewBox="0 0 9 14"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M8.89388 11.9514L3.75134 6.76492L8.89388 1.57848L7.32876 0L0.621094 6.76492L7.32876 13.5298L8.89388 11.9514Z"
              fill="#6B7280"
            />
          </svg>
        </button>
        <button className="pagination__button" onClick={() => go(page - 1)} disabled={page <= 1}>
          <svg
            width="9"
            height="14"
            viewBox="0 0 9 14"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M8.89388 11.9514L3.75134 6.76492L8.89388 1.57848L7.32876 0L0.621094 6.76492L7.32876 13.5298L8.89388 11.9514Z"
              fill="#6B7280"
            />
          </svg>
        </button>

        <button
          className="pagination__button"
          onClick={() => go(page + 1)}
          disabled={page >= pages}
        >
          <svg
            width="9"
            height="14"
            viewBox="0 0 9 14"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M0.599609 12.1745L5.74215 7.10085L0.599609 1.91442L2.16473 0.335938L8.8724 7.10085L2.16473 13.8658L0.599609 12.1745Z"
              fill="#6B7280"
            />
          </svg>
        </button>
        <button className="pagination__button" onClick={() => go(pages)} disabled={page >= pages}>
          <svg
            width="9"
            height="14"
            viewBox="0 0 9 14"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M0.599609 12.1745L5.74215 7.10085L0.599609 1.91442L2.16473 0.335938L8.8724 7.10085L2.16473 13.8658L0.599609 12.1745Z"
              fill="#6B7280"
            />
          </svg>
          <svg
            width="9"
            height="14"
            viewBox="0 0 9 14"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M0.599609 12.1745L5.74215 7.10085L0.599609 1.91442L2.16473 0.335938L8.8724 7.10085L2.16473 13.8658L0.599609 12.1745Z"
              fill="#6B7280"
            />
          </svg>
        </button>
      </div>
    </div>
  );
};
