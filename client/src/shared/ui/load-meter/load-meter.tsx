import * as React from 'react';
import './load-meter.css';

type LoadMeterProps = {
  value: number | null | undefined;
  title?: string;
  height?: number;
  warn?: number;
  critical?: number;
  compact?: boolean;
  className?: string;
};

export const LoadMeter: React.FC<LoadMeterProps> = ({
  value,
  title,
  height,
  warn = 40,
  critical = 80,
  compact = false,
  className = '',
}) => {
  const num = Number.isFinite(Number(value)) ? Math.max(0, Math.min(100, Number(value))) : null;

  let zone: 'ok' | 'warn' | 'critical' = 'ok';
  if (num !== null) {
    if (num >= critical) zone = 'critical';
    else if (num >= warn) zone = 'warn';
  }

  const label = num === null ? '—' : `${num.toFixed(2)}%`;

  return (
    <div
      className={`load-meter ${compact ? 'load-meter--compact' : ''} ${className}`}
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={num ?? undefined}
      aria-valuetext={label}
      aria-label="Уровень загрузки"
      title={title ?? label}
      style={height ? { ['--lm-h' as any]: `${height}px` } : undefined}
    >
      <div className="load-meter__track">
        <div
          className={`load-meter__bar load-meter__bar--${zone}`}
          style={{ inlineSize: `${num ?? 0}%` }}
        />
        <span className="load-meter__label" aria-hidden="true">
          {label}
        </span>
      </div>
    </div>
  );
};
