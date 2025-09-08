import React, { useRef } from 'react';
import { useUploadXlsxMutation } from '../../../entities/upload/api/upload-api';
import './styles.css';

type UploadXlsxProps = { onDone?: () => void; className?: string };

export const UploadXlsx: React.FC<UploadXlsxProps> = ({ onDone, className }) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [upload, { isLoading }] = useUploadXlsxMutation();

  const openDialog = () => inputRef.current?.click();

  const onChange: React.ChangeEventHandler<HTMLInputElement> = async (e) => {
    const f = e.target.files?.[0];
    if (!f) return;

    try {
      if (!/\.xlsx$/i.test(f.name)) {
        alert('Выберите .xlsx файл');
        return;
      }
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
    <div className={`${className ?? ''} upload`}>
      <input
        className="visually-hidden"
        ref={inputRef}
        type="file"
        accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        onChange={onChange}
        disabled={isLoading}
        aria-hidden
        tabIndex={-1}
      />
      <button className="upload__button" type="button" onClick={openDialog} disabled={isLoading}>
        {isLoading ? 'Загрузка…' : 'ЗАГРУЗИТЬ ДАННЫЕ'}
      </button>
    </div>
  );
};
