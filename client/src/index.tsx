import React from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { store } from './app/store';
import { RowsPage } from './features/rowsTable/ui/RowsPage';

const el = document.getElementById('root');
if (el) {
  createRoot(el).render(
    <React.StrictMode>
      <Provider store={store}>
        <RowsPage />
      </Provider>
    </React.StrictMode>,
  );
}
