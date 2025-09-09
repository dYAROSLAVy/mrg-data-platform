import * as React from 'react';
import './styles.css';

type Props = {
  offset?: number;
  bottom?: number;
  right?: number;
  hide?: boolean;
};

export const ScrollToTop: React.FC<Props> = ({
  offset = 400,
  bottom = 24,
  right = 24,
  hide = false,
}) => {
  const [visible, setVisible] = React.useState(false);

  React.useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > offset);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [offset]);

  const onClick = () => {
    const prefersNoMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    window.scrollTo({
      top: 0,
      behavior: prefersNoMotion ? 'auto' : 'smooth',
    });
  };

  if (hide) return null;

  return (
    <button
      type="button"
      className={`scroll-top ${visible ? 'scroll-top--visible' : ''}`}
      style={{ bottom, right }}
      onClick={onClick}
      aria-label="Наверх"
      title="Наверх"
    >
      <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden>
        <path d="M8 3l5 5-1.4 1.4L8 5.8 4.4 9.4 3 8z" fill="currentColor" />
      </svg>
    </button>
  );
};
