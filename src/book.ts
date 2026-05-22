import { SCHEDULE, COURTS } from './schedule';
import type { AppState, Slot } from './types';

/** Big celebratory confirmation modal — replaces the old corner toast.
 *  Reuses the same .modal-overlay / .modal frame the reservation form
 *  uses so the visual language is consistent. Auto-dismisses after a
 *  brief read (configured in the render's setTimeout) so the operator
 *  doesn't have to click anything to clear it. */
function confirmMarkup(message: string): string {
  return `
    <div class="modal-overlay" id="confirm-overlay">
      <div class="modal modal--confirm" role="dialog" aria-modal="true" aria-labelledby="confirm-title">
        <div class="confirm__check" aria-hidden="true">✓</div>
        <h2 class="confirm__title" id="confirm-title">Reserved!</h2>
        <p class="confirm__msg">${escapeHtml(message)}</p>
        <button type="button" class="btn btn--primary confirm__done" id="confirm-done">Done</button>
      </div>
    </div>
  `;
}

let escHandler: ((e: KeyboardEvent) => void) | null = null;
let toastTimer: ReturnType<typeof setTimeout> | null = null;
let activeToastFor: string | null = null;
let confirmEscHandler: ((e: KeyboardEvent) => void) | null = null;

function fmtTime(t: string): string {
  const [h, m] = t.split(':').map(Number);
  const period = h >= 12 ? 'PM' : 'AM';
  const hh = ((h + 11) % 12) + 1;
  return `${hh}:${m.toString().padStart(2, '0')} ${period}`;
}

function emptyTitleFor(iso: string): string {
  const label = fmtDate(iso);
  if (label === 'Today') return 'No available slots for today.';
  if (label === 'Tomorrow') return 'No available slots for tomorrow.';
  return `No available slots on ${escapeHtml(label)}.`;
}

function fmtDate(iso: string): string {
  const today = new Date().toISOString().slice(0, 10);
  if (iso === today) return 'Today';
  const [y, m, d] = iso.split('-').map(Number);
  const dt = new Date(y, m - 1, d);
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  if (iso === tomorrow.toISOString().slice(0, 10)) return 'Tomorrow';
  return dt.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
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

function modalMarkup(r: { courtId: string; courtName: string; time: string; date: string }): string {
  return `
    <div class="modal-overlay" id="modal-overlay">
      <div class="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title">
        <button class="modal__close" id="modal-close" type="button" aria-label="Close">&times;</button>
        <header class="modal__head">
          <p class="modal__eyebrow">Reservation</p>
          <h2 class="modal__title" id="modal-title">${escapeHtml(r.courtName)}</h2>
          <p class="modal__meta">${escapeHtml(fmtDate(r.date))} &middot; ${escapeHtml(fmtTime(r.time))} &middot; 30 min</p>
        </header>
        <form id="reserve-form" class="modal__form" novalidate>
          <label class="form-field">
            <span class="form-field__label">Full name</span>
            <input class="form-field__input" type="text" id="rf-name" required autocomplete="name" placeholder="Sam Carter" />
          </label>
          <label class="form-field">
            <span class="form-field__label">Email</span>
            <input class="form-field__input" type="email" id="rf-email" required autocomplete="email" placeholder="sam@example.com" />
          </label>
          <label class="form-field">
            <span class="form-field__label">Notes (optional)</span>
            <textarea class="form-field__input form-field__textarea" id="rf-notes" rows="2" placeholder="Doubles partner, gear, etc."></textarea>
          </label>
          <div class="modal__actions">
            <button type="button" class="btn btn--ghost" id="reserve-cancel">Cancel</button>
            <button type="submit" class="btn btn--primary">Confirm reservation</button>
          </div>
        </form>
      </div>
    </div>
  `;
}

export function renderBook(root: HTMLElement, state: AppState, onHome: () => void, onState: (patch: Partial<AppState>) => void): void {
  if (escHandler) {
    document.removeEventListener('keydown', escHandler);
    escHandler = null;
  }
  if (confirmEscHandler) {
    document.removeEventListener('keydown', confirmEscHandler);
    confirmEscHandler = null;
  }

  const slots = SCHEDULE.filter(s => s.isAvailable === true);

  const filtered = slots.filter(s =>
    s.date === state.date &&
    (state.courtFilter === 'any' || s.courtId === state.courtFilter)
  );

  const expectedCount = SCHEDULE.filter(s =>
    s.available &&
    s.date === state.date &&
    (state.courtFilter === 'any' || s.courtId === state.courtFilter)
  ).length;

  const courtOptions = ['<option value="any">Any court</option>']
    .concat(COURTS.map(c => `<option value="${escapeHtml(c.id)}"${state.courtFilter === c.id ? ' selected' : ''}>${escapeHtml(c.name)}</option>`))
    .join('');

  const grid = filtered.length > 0
    ? `<section class="court-grid">${filtered.map(cardMarkup).join('')}</section>`
    : `
      <section class="empty">
        <h2 class="empty__title">${emptyTitleFor(state.date)}</h2>
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

        <div class="book__stats">
          <span class="book__stats-dot" aria-hidden="true"></span>
          <strong>${expectedCount}</strong> slot${expectedCount === 1 ? '' : 's'} open ${state.courtFilter === 'any' ? 'across all courts' : 'on ' + escapeHtml(COURTS.find(c => c.id === state.courtFilter)?.name ?? '')} &middot; ${escapeHtml(fmtDate(state.date))}
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
    ${state.reserving ? modalMarkup(state.reserving) : ''}
    ${state.toast ? confirmMarkup(state.toast) : ''}
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
      const id = btn.dataset.reserve;
      if (!id) return;
      const [courtId, time] = id.split('|');
      const slot = SCHEDULE.find(s => s.courtId === courtId && s.time === time && s.date === state.date);
      if (!slot) return;
      onState({
        reserving: { courtId: slot.courtId, courtName: slot.courtName, time: slot.time, date: slot.date },
      });
    });
  });

  if (state.reserving) {
    const close = (): void => onState({ reserving: null });

    root.querySelector<HTMLElement>('#modal-overlay')?.addEventListener('click', (e) => {
      if (e.target === e.currentTarget) close();
    });
    root.querySelector<HTMLButtonElement>('#modal-close')?.addEventListener('click', close);
    root.querySelector<HTMLButtonElement>('#reserve-cancel')?.addEventListener('click', close);

    escHandler = (e: KeyboardEvent): void => {
      if (e.key === 'Escape') close();
    };
    document.addEventListener('keydown', escHandler);

    setTimeout(() => root.querySelector<HTMLInputElement>('#rf-name')?.focus(), 0);

    const form = root.querySelector<HTMLFormElement>('#reserve-form');
    form?.addEventListener('submit', (e) => {
      e.preventDefault();
      const nameInput = form.querySelector<HTMLInputElement>('#rf-name');
      const emailInput = form.querySelector<HTMLInputElement>('#rf-email');
      const name = nameInput?.value.trim() ?? '';
      const email = emailInput?.value.trim() ?? '';
      if (!name) { nameInput?.focus(); return; }
      if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { emailInput?.focus(); return; }
      const r = state.reserving!;
      const slot = SCHEDULE.find(s => s.courtId === r.courtId && s.time === r.time && s.date === r.date);
      if (slot) slot.available = false;
      const firstName = name.split(/\s+/)[0];
      onState({
        reserving: null,
        toast: `${firstName}, ${r.courtName} at ${fmtTime(r.time)} is locked in.`,
      });
    });
  }

  if (state.toast && state.toast !== activeToastFor) {
    if (toastTimer) clearTimeout(toastTimer);
    activeToastFor = state.toast;
    // 5s gives the audience time to read the big confirmation modal
    // before it fades. Operator / cu_agent doesn't need to click
    // anything — auto-dismisses cleanly.
    toastTimer = setTimeout(() => {
      activeToastFor = null;
      toastTimer = null;
      onState({ toast: null });
    }, 5000);
  }

  // Click-to-dismiss affordances. Wired on every render where the
  // confirmation is showing (not just the first), since renderBook
  // rebuilds innerHTML and wipes listeners. Mirrors how the form
  // modal handles re-attachment.
  if (state.toast) {
    const dismiss = (): void => {
      if (toastTimer) { clearTimeout(toastTimer); toastTimer = null; }
      activeToastFor = null;
      onState({ toast: null });
    };
    root.querySelector<HTMLElement>('#confirm-overlay')?.addEventListener('click', (e) => {
      if (e.target === e.currentTarget) dismiss();
    });
    root.querySelector<HTMLButtonElement>('#confirm-done')?.addEventListener('click', dismiss);
    confirmEscHandler = (e: KeyboardEvent): void => {
      if (e.key === 'Escape') dismiss();
    };
    document.addEventListener('keydown', confirmEscHandler);
  }
  if (!state.toast) activeToastFor = null;
}
