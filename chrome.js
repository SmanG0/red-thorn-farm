// chrome.js — shared nav + footer for Red Thorn pages
// Each page sets window.RTPAGE = { id: 'home'|'about'|'range'|'craft', heroOverlay: true|false }
// before this script runs.

(function(){
  const page = (window.RTPAGE || {});
  const ID   = page.id || 'home';
  const OVER = !!page.heroOverlay; // hero is full-bleed dark photo → light nav

  const links = [
    { id: 'home', href: 'index.html', label: 'Home' },
    { id: 'about', href: 'about.html', label: 'About Us' },
    { id: 'range', href: 'range.html', label: 'The Range' },
    { id: 'craft', href: 'craft.html', label: 'The Craft' },
    { id: 'order', href: 'order.html', label: 'Order' },
  ];

  // ───────── NAV ─────────
  const navHTML = `
    <header class="nav ${OVER ? 'nav--over' : 'nav--solid'}" id="rt-nav">
      <a href="index.html" class="nav-brand" aria-label="Red Thorn Farm — home">
        <img src="assets/thorn-branch.png" alt="" class="nav-thorn" />
        <span class="nav-wordmark">Red Thorn</span>
      </a>
      <nav class="nav-links" aria-label="Primary">
        ${links.map(l => `<a href="${l.href}" class="${ID === l.id ? 'is-current' : ''}">${l.label}</a>`).join('')}
      </nav>
      <a href="https://wa.me/254719222299" target="_blank" rel="noopener" class="nav-cta">Order &rarr;</a>
      <button class="nav-burger" id="rt-burger" aria-label="Menu" aria-expanded="false">
        <span></span><span></span>
      </button>
    </header>
  `;

  // ───────── FOOTER ─────────
  const footHTML = `
    <footer class="foot">
      <img src="assets/kedong-ridge.png" alt="" class="foot__ridge" />
      <div class="foot__top">
        <div class="foot__brand">
          <div class="foot__brand-line">
            <img src="assets/thorn-branch.png" alt="" class="foot__thorn" />
            <span class="foot__wordmark">Red Thorn</span>
          </div>
          <p class="foot__tag">Slow-smoked.<br/>Hand-tied.<br/>Made in Kenya.</p>
        </div>
        <div class="foot__col">
          <h5>Order</h5>
          <p>Orders open Sunday.<br/>Close Wednesday midnight.<br/>Delivered Friday, Nairobi-wide.</p>
          <a href="https://wa.me/254719222299" target="_blank" rel="noopener">WhatsApp to order</a>
        </div>
        <div class="foot__col">
          <h5>Talk</h5>
          <a href="https://wa.me/254719222299">+254 719 222 299</a>
          <a href="mailto:office@redthorn.co.ke">office@redthorn.co.ke</a>
        </div>
        <div class="foot__col">
          <h5>Follow</h5>
          <a href="https://www.instagram.com/redthornfarm/" target="_blank" rel="noopener" style="display:inline-flex;align-items:center;gap:7px;"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>Instagram</a>
          <a href="https://wa.me/254719222299" target="_blank" rel="noopener">WhatsApp list</a>
        </div>
      </div>
      <div class="foot__bot">
        <span>&copy; Red Thorn Farm &middot; 2026 &middot; Made in Kenya</span>
        <span>No phosphates &middot; No fillers &middot; No nonsense</span>
        <a href="admin.html?key=redthorn2026" style="font-size:10px;color:rgba(250,248,245,.2);text-decoration:none;letter-spacing:0.1em" onmouseover="this.style.color='rgba(250,248,245,.5)'" onmouseout="this.style.color='rgba(250,248,245,.2)'">Admin</a>
      </div>
    </footer>
  `;

  // ───────── MOUNT ─────────
  function mount() {
    const navMount = document.getElementById('nav-mount');
    const footMount = document.getElementById('foot-mount');
    if (navMount)  navMount.outerHTML = navHTML;
    if (footMount) footMount.outerHTML = footHTML;

    const nav = document.getElementById('rt-nav');
    if (!nav) return;

    // scroll behaviour — adds nav--scrolled past 8px
    const onScroll = () => {
      nav.classList.toggle('nav--scrolled', window.scrollY > 8);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    // burger
    const burger = document.getElementById('rt-burger');
    if (burger) {
      burger.addEventListener('click', () => {
        const open = nav.classList.toggle('nav--open');
        burger.setAttribute('aria-expanded', String(open));
      });
      nav.querySelectorAll('.nav-links a').forEach(a =>
        a.addEventListener('click', () => {
          nav.classList.remove('nav--open');
          burger.setAttribute('aria-expanded', 'false');
        })
      );
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', mount);
  } else {
    mount();
  }
})();
