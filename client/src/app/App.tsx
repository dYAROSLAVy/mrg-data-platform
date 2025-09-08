import React, { useEffect, useState } from 'react';

export default function App() {
  const [status, setStatus] = useState<'idle' | 'ok' | 'fail'>('idle');

  useEffect(() => {
    fetch('/api/health')
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then(() => setStatus('ok'))
      .catch(() => setStatus('fail'));
  }, []);

  return (
    <div>
      <h1>MRG</h1>
      <p>Backend health: {status === 'idle' ? '...' : status.toUpperCase()}</p>
    </div>
  );
}
