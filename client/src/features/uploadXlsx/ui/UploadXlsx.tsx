import React from 'react';
import { useUploadXlsxMutation } from '../../../entities/upload/api/uploadApi';

export const UploadXlsx: React.FC<{ onDone?: () => void }> = ({ onDone }) => {
  const [upload, { isLoading }] = useUploadXlsxMutation();

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
      e.target.value = '';
    }
  };

  return (
    <label style={{ display: 'inline-flex', gap: 8, alignItems: 'center' }}>
      <input
        type="file"
        accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        onChange={onChange}
        disabled={isLoading}
        style={{ display: 'none' }}
      />
      <button
        type="button"
        onClick={(ev) => (ev.currentTarget.previousElementSibling as HTMLInputElement)?.click()}
        disabled={isLoading}
      >
        {isLoading ? 'Загрузка…' : 'Загрузить XLSX'}
      </button>
    </label>
  );
};
