import React, { useRef } from 'react';
import { useUploadXlsxMutation } from '../../../entities/upload/api/upload-api';
import './styles.css';

type UploadXlsxProps = { onStart?: () => void; onDone?: () => void; className?: string };

export const UploadXlsx: React.FC<UploadXlsxProps> = ({ onStart, onDone, className }) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [upload, { isLoading }] = useUploadXlsxMutation();

  const MAX_SIZE_MB = 10;
  const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024;
  const ALLOWED_MIME = new Set([
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/zip',
  ]);

  const openDialog = () => inputRef.current?.click();

  const onChange: React.ChangeEventHandler<HTMLInputElement> = async (e) => {
    const f = e.target.files?.[0];
    if (!f) return;

    try {
      if (!/\.xlsx$/i.test(f.name)) {
        alert('Выберите файл с расширением .xlsx');
        return;
      }

      if (typeof f.size === 'number' && f.size > MAX_SIZE_BYTES) {
        alert(`Файл слишком большой. Максимум ${MAX_SIZE_MB} МБ.`);
        return;
      }

      if (f.type && !ALLOWED_MIME.has(f.type)) {
        const proceed = confirm('Файл имеет нетипичный тип. Всё равно загрузить?');
        if (!proceed) return;
      }

      onStart?.();

      const res = await upload(f).unwrap();
      alert(
        `Импорт завершён:\n+${res.inserted} добавлено\n~${res.updated} обновлено\n${res.skipped} пропущено`,
      );
      onDone?.();
    } catch (err: any) {
      const msg = err?.data?.message || err?.error || 'Ошибка загрузки';
      alert(msg);
    } finally {
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  return (
    <div className={className ? `${className} upload` : 'upload'} aria-busy={isLoading}>
      <input
        id="upload-xlsx"
        className="visually-hidden"
        ref={inputRef}
        type="file"
        accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        onChange={onChange}
        disabled={isLoading}
        aria-hidden
        tabIndex={-1}
      />
      <button
        className="upload__button"
        type="button"
        onClick={openDialog}
        disabled={isLoading}
        aria-disabled={isLoading}
      >
        {isLoading ? 'Загрузка…' : 'ЗАГРУЗИТЬ ДАННЫЕ'}
      </button>
    </div>
  );
};
