import './style.css';
import { renderHome } from './home';
import { renderBook } from './book';
import type { AppState } from './types';

const root = document.querySelector<HTMLDivElement>('#app');
if (!root) throw new Error('Root element #app not found');

const state: AppState = {
  view: 'home',
  date: new Date().toISOString().slice(0, 10),
  courtFilter: 'any',
  reserving: null,
  toast: null,
};

function render(): void {
  if (!root) return;
  if (state.view === 'home') {
    renderHome(root, () => {
      state.view = 'book';
      render();
    });
  } else {
    renderBook(
      root,
      state,
      () => {
        state.view = 'home';
        render();
      },
      (patch) => {
        Object.assign(state, patch);
        render();
      }
    );
  }
}

render();
