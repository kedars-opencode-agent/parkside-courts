export function renderHome(root: HTMLElement, onReserve: () => void): void {
  root.innerHTML = `
    <div class="page page--home">
      <header class="topbar">
        <div class="brand">
          <span class="brand__mark" aria-hidden="true"></span>
          <span class="brand__name">Parkside</span>
        </div>
        <nav class="topnav">
          <a href="#about">About</a>
          <a href="#calendar">Calendar</a>
          <a href="#contact">Contact</a>
        </nav>
      </header>

      <main class="hero">
        <p class="hero__eyebrow">Neighborhood Pickleball Club</p>
        <h1 class="hero__title">
          Parkside <span class="hero__title-accent">Pickleball</span> Club
        </h1>
        <p class="hero__meta">Saturday &middot; Open 6 AM – 10 PM</p>
        <button class="btn btn--primary btn--lg" id="cta-reserve">
          Reserve a Court
        </button>
        <p class="hero__hint">Members reserve evenings up to 7 days out.</p>
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

  const cta = root.querySelector<HTMLButtonElement>('#cta-reserve');
  cta?.addEventListener('click', onReserve);
}
