import React from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { store } from './app/store';

import './app/styles/index.css';
import RowsPage from './pages/rows-page/rows-page';

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
