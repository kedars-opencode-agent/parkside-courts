import { SCHEDULE, COURTS } from './schedule';
import type { AppState, Slot } from './types';

function fmtTime(t: string): string {
  const [h, m] = t.split(':').map(Number);
  const period = h >= 12 ? 'PM' : 'AM';
  const hh = ((h + 11) % 12) + 1;
  return `${hh}:${m.toString().padStart(2, '0')} ${period}`;
}

function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[c] as string));
}

function cardMarkup(s: Slot): string {
  return `
    <article class="court-card" data-slot="${escapeHtml(s.courtId)}-${escapeHtml(s.time)}">
      <div class="court-card__head">
        <h3 class="court-card__name">${escapeHtml(s.courtName)}</h3>
        <span class="court-card__badge">Open</span>
      </div>
      <p class="court-card__time">${escapeHtml(fmtTime(s.time))}</p>
      <p class="court-card__sub">30 min &middot; Outdoor</p>
      <button class="btn btn--primary court-card__btn" data-reserve="${escapeHtml(s.courtId)}|${escapeHtml(s.time)}">
        Reserve
      </button>
    </article>
  `;
}

export function renderBook(root: HTMLElement, state: AppState, onHome: () => void, onState: (patch: Partial<AppState>) => void): void {
  const slots = SCHEDULE.filter(s => s.isAvailable === true);

  const filtered = slots.filter(s =>
    s.date === state.date &&
    (state.courtFilter === 'any' || s.courtId === state.courtFilter)
  );

  const courtOptions = ['<option value="any">Any court</option>']
    .concat(COURTS.map(c => `<option value="${escapeHtml(c.id)}"${state.courtFilter === c.id ? ' selected' : ''}>${escapeHtml(c.name)}</option>`))
    .join('');

  const grid = filtered.length > 0
    ? `<section class="court-grid">${filtered.map(cardMarkup).join('')}</section>`
    : `
      <section class="empty">
        <h2 class="empty__title">No available slots for today.</h2>
        <p class="empty__sub">Try a different date or court.</p>
      </section>
    `;

  root.innerHTML = `
    <div class="page page--book">
      <header class="topbar">
        <div class="brand brand--clickable" id="back-home">
          <span class="brand__mark" aria-hidden="true"></span>
          <span class="brand__name">Parkside</span>
        </div>
        <nav class="topnav">
          <a href="#about">About</a>
          <a href="#calendar" id="nav-calendar">Calendar</a>
          <a href="#contact">Contact</a>
        </nav>
      </header>

      <main class="book">
        <div class="book__head">
          <h1 class="book__title">Book a court</h1>
          <p class="book__sub">Pick a date and court. Slots are 30 minutes.</p>
        </div>

        <div class="filters">
          <label class="filters__field">
            <span class="filters__label">Date</span>
            <input class="filters__input" type="date" id="filter-date" value="${escapeHtml(state.date)}" />
          </label>
          <label class="filters__field">
            <span class="filters__label">Court</span>
            <select class="filters__input" id="filter-court">${courtOptions}</select>
          </label>
        </div>

        ${grid}
      </main>

      <footer class="footer">
        <span>About</span>
        <span class="footer__dot">·</span>
        <span>Calendar</span>
        <span class="footer__dot">·</span>
        <span>Contact</span>
      </footer>
    </div>
  `;

  root.querySelector<HTMLElement>('#back-home')?.addEventListener('click', onHome);

  root.querySelector<HTMLAnchorElement>('#nav-calendar')?.addEventListener('click', (e) => {
    e.preventDefault();
  });

  root.querySelector<HTMLInputElement>('#filter-date')?.addEventListener('change', (e) => {
    onState({ date: (e.target as HTMLInputElement).value });
  });

  root.querySelector<HTMLSelectElement>('#filter-court')?.addEventListener('change', (e) => {
    onState({ courtFilter: (e.target as HTMLSelectElement).value });
  });

  root.querySelectorAll<HTMLButtonElement>('[data-reserve]').forEach(btn => {
    btn.addEventListener('click', () => {
      alert('Reserved!');
    });
  });
}
