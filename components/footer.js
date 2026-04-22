// Shared footer component for Team Rollouts website
// Usage: <div id="team-footer"></div>
// Then: <script src="components/footer.js"></script>
//
// STYLING: All footer CSS lives in components/footer.css — edit that file
// to change footer styling site-wide. This script auto-injects the stylesheet
// link so pages do not need to reference it manually.

(function() {
  // ─── AUTO-INJECT STYLESHEET (idempotent) ───
  if (!document.querySelector('link[data-team-footer-css]')) {
    // Resolve relative to this script's own src so nested pages (e.g. /insights/foo.html) work
    var thisScript = document.currentScript
      || Array.from(document.scripts).reverse().find(function(s){ return /components\/footer\.js/.test(s.src); });
    var href = 'components/footer.css';
    if (thisScript && thisScript.src) {
      try { href = new URL('footer.css', thisScript.src).href; } catch (e) {}
    }
    var link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = href;
    link.setAttribute('data-team-footer-css', '');
    document.head.appendChild(link);
  }

  // Uses nav links if available, otherwise defines its own
  const L = window.TEAM_LINKS || {
    home: 'homepage.html',
    orchestration: 'orchestration.html', intelligence: 'intelligence.html',
    integrations: 'integrations.html', security: 'security.html',
    enterprise: 'enterprise.html', pricing: 'pricing.html',
    artists: 'for-artists.html', managers: 'for-managers.html',
    labels: 'for-labels.html', partners: 'for-partners.html',
    about: 'about.html', insights: 'insights.html', changelog: 'changelog.html',
    contact: 'contact.html', demo: 'demo.html',
    privacy: 'privacy.html', terms: 'terms.html', smsTerms: 'sms-terms.html',
    cookiePolicy: 'cookie-policy.html',
  };

  const footerHTML = `
<footer class="footer">
  <div class="footer__newsletter">
    <div class="footer__newsletter-copy">
      <h3>Get release intel <span class="nyght">in your inbox</span></h3>
      <p>Monthly insights on rollout strategy, industry trends, and how the best teams ship releases. No spam.</p>
    </div>
    <div>
      <form class="footer__newsletter-form" id="newsletterForm">
        <input type="email" class="footer__newsletter-input" id="newsletterEmail" placeholder="you@yourlabel.com" required>
        <button type="submit" class="footer__newsletter-btn" id="newsletterBtn">Subscribe</button>
      </form>
      <p id="newsletterMsg" style="margin-top:0.75rem;font-size:0.8125rem;color:rgba(255,255,255,0.65);opacity:0;transition:opacity 0.3s">Thanks for joining us on this wild ride!</p>
    </div>
  </div>

  <div class="footer__grid">
    <div>
      <a href="${L.home || 'homepage.html'}" class="footer__logo" aria-label="Team — homepage"><svg viewBox="0 0 8334 2771"><path d="M1258.71,2769.17c-69.47,0-125.871-620.411-125.871-1384.58 0-764.172 56.401-1384.58 125.871-1384.58l251.743,0c69.47,0 125.871,620.411 125.871,1384.58 0,764.173-56.401,1384.58-125.871,1384.58l-251.743,0Zm-503.485,0c-69.47,0-125.871-620.411-125.871-1384.58 0-764.172 56.401-1384.58 125.871-1384.58l251.743,0l0,2769.17l-251.743,0Zm-377.613,0c-69.471,0-125.872-620.411-125.872-1384.58 0-764.172 56.401-1384.58 125.872-1384.58l125.871,0l0,2769.17l-125.871,0Zm-251.743,0c-69.47,0-125.871-620.411-125.871-1384.58 0-764.172 56.401-1384.58 125.871-1384.58l0,2769.17Zm1888.07,0l-251.742,0l0-2769.17l251.742,0c69.471,0 125.872,620.411 125.872,1384.58 0,764.173-56.401,1384.58-125.872,1384.58Zm377.614,0l-125.871,0l0-2769.17l125.871,0c69.47,0 125.871,620.411 125.871,1384.58 0,764.173-56.401,1384.58-125.871,1384.58Zm251.742,0l0-2769.17c69.471,0 125.872,620.411 125.872,1384.58 0,764.173-56.401,1384.58-125.872,1384.58Z" fill="#fff"/><path d="M3025.94,1146.71l0-164.311l194.88,0l0-212.076l179.596-124.188l0,336.264l261.752,0l0,164.311l-261.752,0l0,519.682c0,223.539 40.123,261.751 261.752,261.751l0,171.954l-26.749,0c-326.711,0-414.599-95.53-414.599-431.795l0-521.592l-194.88,0Zm1346.97,976.314c-357.281,0-590.373-248.377-590.373-575.089 0-332.443 248.377-588.463 580.82-588.463 326.712,0 573.179,231.182 573.179,567.447l0,76.423l-976.314,0c24.838,212.076 187.238,357.281 412.688,357.281 177.686,0 305.695-91.708 372.566-236.913l154.758,82.155c-101.261,198.702-269.393,317.159-527.324,317.159Zm-9.553-1001.15c-198.701,0-351.549,133.741-393.582,319.069l781.433,0c-32.48-198.702-171.953-319.069-387.851-319.069Zm1303.03,1001.15c-313.337,0-569.357-248.377-569.357-580.821 0-334.354 252.199-582.731 569.357-582.731 158.58,0 320.98,76.424 410.778,208.255l0-185.328l179.596,0l0,1117.7l-179.596,0l0-189.149c-43.944,66.871-105.083,120.367-181.506,156.669-74.514,36.301-150.937,55.407-229.272,55.407Zm17.196-168.132c229.271,0 406.956-183.417 406.956-414.599 0-229.272-177.685-414.599-406.956-414.599-223.54,0-403.136,185.327-403.136,414.599 0,231.182 179.596,414.599 403.136,414.599Zm829.197,145.205l0-1117.7l179.596,0l0,156.669c74.513-112.725 196.791-179.596 357.281-179.596 198.702,0 332.443,89.798 395.493,227.361 74.513-137.563 219.718-227.361 403.135-227.361 315.248,0 485.291,191.06 485.291,481.47l0,659.155l-183.417,0l0-661.066c0-189.149-118.457-319.069-317.158-319.069-179.596,0-320.98,124.189-320.98,336.265l0,643.87l-183.417,0l0-678.261c0-183.417-114.636-301.874-305.695-301.874-189.149,0-328.622,129.92-328.622,351.549l0,628.586l-181.507,0Z" fill="#fff"/></svg></a>
      <p class="footer__brand-desc">The operating system for music releases. Plan, coordinate, and execute your entire rollout from one platform.</p>
    </div>
    <div>
      <div class="footer__col-title">Product</div>
      <a href="${L.orchestration}" class="footer__link">Release Orchestration</a>
      <a href="${L.intelligence}" class="footer__link">Release Intelligence</a>
      <a href="${L.integrations}" class="footer__link">Integrations</a>
      <a href="${L.security}" class="footer__link">Security</a>
      <a href="${L.enterprise}" class="footer__link">Enterprise</a>
      <a href="${L.pricing}" class="footer__link">Pricing</a>
    </div>
    <div>
      <div class="footer__col-title">Solutions</div>
      <a href="${L.artists}" class="footer__link">For Artists</a>
      <a href="${L.managers}" class="footer__link">For Managers</a>
      <a href="${L.labels}" class="footer__link">For Labels</a>
      <a href="${L.partners}" class="footer__link">For Partners</a>
    </div>
    <div>
      <div class="footer__col-title">Company</div>
      <a href="${L.about || 'about.html'}" class="footer__link">About</a>
      <a href="${L.insights}" class="footer__link">Insights</a>
      <a href="${L.changelog}" class="footer__link">Changelog</a>
      <a href="${L.contact || 'contact.html'}" class="footer__link">Contact</a>
      <a href="${L.demo}" class="footer__link">Book a Demo</a>
    </div>
    <div>
      <div class="footer__col-title">Legal</div>
      <a href="${L.privacy || 'privacy.html'}" class="footer__link">Privacy Policy</a>
      <a href="${L.terms || 'terms.html'}" class="footer__link">Terms of Service</a>
      <a href="${L.smsTerms || 'sms-terms.html'}" class="footer__link">SMS Terms</a>
      <a href="${L.cookiePolicy || 'cookie-policy.html'}" class="footer__link">Cookie Policy</a>
      <a href="#" class="footer__link" data-cookie-preferences>Cookie Preferences</a>
    </div>
  </div>

  <div class="footer__bottom">
    <span>&copy; ${new Date().getFullYear()} Team Rollouts. All rights reserved.</span>
    <div class="footer__social">
      <a href="https://www.instagram.com/teamrollouts/" target="_blank" rel="noopener" aria-label="Instagram"><svg viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z"/></svg></a>
      <a href="https://x.com/Teamrollouts" target="_blank" rel="noopener" aria-label="X"><svg viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg></a>
      <a href="https://www.linkedin.com/company/teamrollouts" target="_blank" rel="noopener" aria-label="LinkedIn"><svg viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg></a>
      <a href="https://www.facebook.com/TeamRollouts/" target="_blank" rel="noopener" aria-label="Facebook"><svg viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg></a>
    </div>
  </div>

  <div class="footer__wordmark">team</div>
</footer>
`;

  const container = document.getElementById('team-footer');
  if (container) {
    container.innerHTML = footerHTML;
  } else {
    document.body.insertAdjacentHTML('beforeend', footerHTML);
  }

  // Newsletter form handler
  const form = document.getElementById('newsletterForm');
  if (form) {
    form.addEventListener('submit', function(e) {
      e.preventDefault();
      const msg = document.getElementById('newsletterMsg');
      const btn = document.getElementById('newsletterBtn');
      if (msg) msg.style.opacity = '1';
      if (btn) { btn.textContent = 'Subscribed!'; btn.disabled = true; }
    });
  }
})();
