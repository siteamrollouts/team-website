# Team Homepage — Animation & Build Spec

**Status:** Planning
**Date:** 2026-04-15
**Approach:** Webflow (structure/layout/CMS) + Custom JS bundle (GSAP animations)
**Reference:** frontify.com homepage (Webflow + custom GSAP bundle, identical architecture)

---

## Architecture Overview

```
Webflow Project
├── Layout, typography, colours, responsive grid
├── CMS (Insights blog)
├── SEO fields (unique title/meta/OG per page)
├── Forms (demo booking, contact)
└── Custom code injection ──► team-home.js (our animation bundle)

team-home.js (hosted on GitHub Pages / Vercel)
├── GSAP Core + ScrollTrigger + Observer + Draggable
├── Lenis (smooth scroll)
├── Custom splitText() utility (free SplitText alternative)
├── Custom flip() utility (free Flip alternative)
└── Module system: data-module="xxx" per section
```

### CDN Dependencies (all free — confirmed post-Webflow acquisition)

**GSAP licensing update (April 2026):** Webflow acquired GreenSock in early 2025 and made ALL plugins free including SplitText, Flip, ScrollSmoother, MorphSVG, and DrawSVG. The license is GreenSock's proprietary "no charge" license (not MIT), but free for commercial use. See https://gsap.com/standard-license.

```html
<!-- Before </body> in Webflow custom code -->
<script src="https://cdn.jsdelivr.net/npm/gsap@3/dist/gsap.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/gsap@3/dist/ScrollTrigger.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/gsap@3/dist/Flip.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/gsap@3/dist/Observer.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/lenis@1/dist/lenis.min.js"></script>
<script src="https://your-host.com/team-home.js"></script>
```

**Note:** SplitText and Flip are now free. We use Flip in production. For text splitting, we use a lightweight custom utility (simpler than SplitText, no extra dependency) but could swap to official SplitText if needed.

### Module System (Frontify pattern)

Every animated section gets a `data-module` attribute in Webflow. The JS bundle auto-initialises each module on page load:

```javascript
const modules = {
  'hero': initHero,
  'marquee': initMarquee,
  'value-prop': initValueProp,
  'orchestration': initOrchestration,
  'intelligence': initIntelligence,
  'use-cases': initUseCases,
  'built-for-music': initBuiltForMusic,
  'final-cta': initFinalCta,
};

document.querySelectorAll('[data-module]').forEach(el => {
  const mod = modules[el.dataset.module];
  if (mod && !el._init) { mod(el); el._init = true; }
});
```

---

## Global Behaviours

### Smooth Scroll (Lenis)

```javascript
const lenis = new Lenis({ duration: 1.2, smoothWheel: true });
lenis.on('scroll', ScrollTrigger.update);
gsap.ticker.add(t => lenis.raf(t * 1000));
gsap.ticker.lagSmoothing(0);
```

- Provides the buttery-smooth scroll feel Frontify has
- Automatically syncs with GSAP ScrollTrigger
- Respects `prefers-reduced-motion` — disable smooth scroll if set

### Navigation

**Webflow:** Build nav as a fixed/sticky element with transparent background. Two logo variants (light for dark hero, dark for scrolled state). CTA button "Book a demo".

**Custom JS:** Hide-on-scroll-down, show-on-scroll-up (Frontify pattern):

```javascript
let lastScroll = 0;
const nav = document.querySelector('.nav-wrapper');

ScrollTrigger.create({
  onUpdate: (self) => {
    const scroll = self.scroll();
    if (scroll > lastScroll && scroll > 100) {
      // Scrolling down — hide nav
      gsap.to(nav, { y: '-100%', duration: 0.3, ease: 'power2.out' });
    } else {
      // Scrolling up — show nav
      gsap.to(nav, { y: '0%', duration: 0.3, ease: 'power2.out' });
    }
    lastScroll = scroll;
  }
});
```

**Theme swap:** When hero section exits viewport, toggle nav from transparent/light-text to solid-white/dark-text:

```javascript
ScrollTrigger.create({
  trigger: '.hero',
  start: 'bottom top',
  onEnter: () => nav.classList.add('nav--solid'),
  onLeaveBack: () => nav.classList.remove('nav--solid'),
});
```

**Nav content:**
```
Logo | Product ▾ | Solutions ▾ | Pricing | Insights | [Book a demo]
```

### Floating CTA

Same pattern as your landing pages — appears after scrolling past hero:

```javascript
ScrollTrigger.create({
  trigger: '.hero',
  start: 'bottom top',
  onEnter: () => gsap.to('.floating-cta', { autoAlpha: 1, duration: 0.3 }),
  onLeaveBack: () => gsap.to('.floating-cta', { autoAlpha: 0, duration: 0.3 }),
});
```

Desktop: bottom-right pill. Mobile: full-width bottom bar.

---

## Section-by-Section Spec

---

### Section 1 — Hero (Pinned Chaos Notification Scatter)

**Duration on screen:** ~3 viewport heights of scroll (pinned)
**Theme:** Dark background (#111) — full viewport

**Content:**
- Eyebrow: "The operating system for music releases"
- Headline: "Release chaos ends here."
- Body: "Stop juggling spreadsheets, Slack threads, and email chains. One platform for your entire rollout."
- Primary CTA: "Book a demo"
- Secondary CTA: "See how it works" (plays video modal)
- 5-6 floating notification cards (Slack, Excel, WhatsApp, Gmail, Calendar, etc.) — reuse the chaos notification concept from nomorechaos-v5

**Animation sequence (scroll-scrubbed):**

| Scroll Progress | What Happens |
|----------------|--------------|
| 0% (page load) | Notification cards float in from edges with staggered delay. Subtle idle float animation (CSS `@keyframes` — slow Y oscillation, ~3s loop). Headline is visible. | 
| 0-15% | Cards begin drifting outward slightly — parallax at different speeds (each card has `data-speed`). Background starts subtle darkening. |
| 15-40% | **Cards scatter.** Each card animates to a random off-screen position with rotation. Uses `gsap.to` with individual targets: `x: random(-600,600)`, `y: random(-400, -800)`, `rotation: random(-30,30)`, `opacity: 0`, `scale: 0.6`. Staggered by 0.05s. |
| 40-50% | Headline morphs — "Release chaos ends here." fades out (blur + y-shift), replaced by "One platform. Total clarity." fading in. Transition text moment. |
| 50-70% | **Product video/screenshot scales up** from centre. Starts at `scale: 0.8, borderRadius: '24px', opacity: 0` → animates to `scale: 1, borderRadius: '8px', opacity: 1`. Background transitions from #111 to #f5f5f7 (light). |
| 70-100% | Video/screenshot is now full-width in the viewport. The section unpins and natural scroll resumes. |

**Technical approach:**

```javascript
function initHero(section) {
  const cards = section.querySelectorAll('.chaos-card');
  const headline1 = section.querySelector('.hero-h1-initial');
  const headline2 = section.querySelector('.hero-h1-transition');
  const productFrame = section.querySelector('.product-frame');

  // Idle float on cards (CSS-driven, not GSAP — performance)
  // Each card has: animation: float 3s ease-in-out infinite alternate;
  // with animation-delay: calc(var(--i) * 0.5s);

  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: section,
      start: 'top top',
      end: '+=300%',    // 3x viewport height of scroll
      pin: true,
      scrub: 1.5,       // smooth scrub with 1.5s lag
      anticipatePin: 1,
    }
  });

  // Phase 1: Cards scatter (0-40% of timeline)
  cards.forEach((card, i) => {
    tl.to(card, {
      x: gsap.utils.random(-500, 500),
      y: gsap.utils.random(-600, -200),
      rotation: gsap.utils.random(-25, 25),
      scale: 0.5,
      opacity: 0,
      duration: 4,
      ease: 'power2.in',
    }, i * 0.3);  // staggered start
  });

  // Phase 2: Headline swap (at 40%)
  tl.to(headline1, {
    opacity: 0, y: -30, filter: 'blur(8px)', duration: 1.5
  }, 3);
  tl.from(headline2, {
    opacity: 0, y: 30, filter: 'blur(8px)', duration: 1.5
  }, 4);

  // Phase 3: Product frame scales up (50-70%)
  tl.fromTo(productFrame, {
    scale: 0.8, opacity: 0, borderRadius: '24px',
  }, {
    scale: 1, opacity: 1, borderRadius: '8px', duration: 4,
    ease: 'power2.out',
  }, 5);

  // Phase 4: Background colour shift
  tl.to(section, {
    backgroundColor: '#f5f5f7',
    duration: 3,
  }, 5);
}
```

**Webflow build notes:**
- Section: 100vh, overflow hidden, position relative, bg #111
- Notification cards: absolute positioned, each with `data-speed` attribute
- Two headline elements (initial + transition) stacked, transition one starts `opacity: 0`
- Product frame: absolute positioned, centred, starts scaled down
- All positioning done in Webflow; JS handles only the animation

---

### Section 2 — Product Video / Screenshot

**Content:** Full-width product screenshot/video that was revealed by the hero scatter animation. This is the landing point when the hero unpins.

**Video modal:** "See how it works" CTA (and play button overlay on video) triggers a fullscreen video modal:

```javascript
function initVideoModal() {
  const modal = document.querySelector('.video-modal');
  const video = modal.querySelector('video');
  const triggers = document.querySelectorAll('[data-video-trigger]');

  triggers.forEach(btn => {
    btn.addEventListener('click', () => {
      modal.classList.add('is-active');
      document.body.style.overflow = 'hidden';
      gsap.fromTo(modal, { opacity: 0 }, { opacity: 1, duration: 0.3 });
      video.play();
    });
  });

  modal.querySelector('.video-modal__close').addEventListener('click', () => {
    gsap.to(modal, {
      opacity: 0, duration: 0.3,
      onComplete: () => {
        modal.classList.remove('is-active');
        document.body.style.overflow = '';
        video.pause();
        video.currentTime = 0;
      }
    });
  });
}
```

**Video hosting:** Self-hosted MP4 on GitHub repo or Cloudflare R2 (free tier: 10GB storage, 0 egress fees). Two versions:
- `team-walkthrough-720p.mp4` (~15-30MB) for the modal
- `team-ui-loop.mp4` (existing compressed loop) for inline background

**Webflow build notes:**
- Inline video uses `autoplay loop muted playsinline` (silent background loop)
- Modal video has controls, sound, full playback
- Play button overlay on the inline video frame

---

### Section 3 — Social Proof Marquee

**Content:** Logo strip — "Trusted by independent labels, managers, and release teams"

**Animation:** Pure CSS marquee (no GSAP needed):

```css
.marquee-track {
  display: flex;
  animation: marquee 30s linear infinite;
  width: max-content;
}
.marquee-track:hover { animation-play-state: paused; }

@keyframes marquee {
  to { transform: translateX(-50%); }
}
```

**Webflow build notes:**
- Duplicate the logo list in Webflow so it wraps seamlessly
- Webflow now has a native Marquee component — use it if available, otherwise build with a flex container + overflow hidden wrapper
- Logos should be SVG (crisp at any size), greyscale by default, optional colour on hover

**Content note:** If we don't have client logos yet, use the placeholder text strip with the tagline. Replace with logos as they become available.

---

### Section 4 — Value Proposition Statement

**Content:** "From first single to full album campaign — Team makes your entire rollout structured, visible, and impossible to drop."

**Animation:** Word-by-word reveal on scroll (free SplitText alternative):

```javascript
function initValueProp(section) {
  const text = section.querySelector('.vp-text');
  const words = splitText(text, { type: 'words' }); // custom utility

  // Each word starts invisible, reveals as you scroll through
  gsap.from(words.words, {
    opacity: 0.15,    // dim, not invisible — text is readable but muted
    stagger: 0.05,
    scrollTrigger: {
      trigger: section,
      start: 'top 70%',
      end: 'bottom 40%',
      scrub: 1,
    }
  });
}
```

**Effect:** As you scroll, each word "lights up" from dim grey to full black, left to right. Feels like the page is narrating itself. Frontify uses this exact pattern.

**Webflow build notes:**
- Section with generous vertical padding (120px+)
- Single `<p>` or `<h2>` element, large editorial type (clamp(28px, 4vw, 48px))
- Centred, max-width ~800px
- The JS splits the text into `<span>` elements at runtime — Webflow just has the raw text

---

### Section 5 — Bridge Statement

**Content:** "As release teams scale across more artists, more platforms, and more people — every deadline, every asset, and every conversation needs a single home. Release Orchestration is the foundation. Release Intelligence turns that foundation into smarter decisions."

**Animation:** Simple fade + slight upward shift on viewport entry:

```javascript
function initBridge(section) {
  gsap.from(section.querySelector('.bridge-text'), {
    y: 40,
    opacity: 0,
    filter: 'blur(4px)',
    duration: 1,
    ease: 'power3.out',
    scrollTrigger: {
      trigger: section,
      start: 'top 75%',
    }
  });
}
```

**Webflow build notes:**
- Can use Webflow's native "While scrolling into view" interaction for this — no custom JS needed
- Smaller type than the value prop, max-width ~680px, centred
- Subtle section — acts as a narrative bridge, not a visual showpiece

---

### Section 6 — Release Orchestration

**Content:**
- Section label: "Release Orchestration"
- Headline: "Plan, coordinate, and execute from one system"
- 5 feature cards in a grid (2x2 + 1, or 3+2):
  1. Rollout Timeline
  2. Team Collaboration
  3. Budget Tracking
  4. Rollout Plans
  5. Connected Tools
- Section CTA: "Learn more →" (links to /product/orchestration)

**Animation:** Staggered card entrance with scale + blur:

```javascript
function initOrchestration(section) {
  const cards = section.querySelectorAll('.feature-card');
  const headline = section.querySelector('.section-headline');

  // Headline: word reveal (same pattern as value prop but faster)
  const words = splitText(headline, { type: 'words' });
  gsap.from(words.words, {
    y: 20, opacity: 0, stagger: 0.03, duration: 0.6,
    ease: 'power3.out',
    scrollTrigger: { trigger: headline, start: 'top 80%' }
  });

  // Cards: staggered entrance
  gsap.from(cards, {
    y: 60,
    opacity: 0,
    scale: 0.95,
    filter: 'blur(4px)',
    duration: 0.8,
    stagger: 0.1,
    ease: 'power3.out',
    scrollTrigger: {
      trigger: section.querySelector('.feature-grid'),
      start: 'top 80%',
    }
  });
}
```

**Card hover (CSS — no JS needed):**
```css
.feature-card {
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}
.feature-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 40px rgba(0,0,0,0.08);
}
```

**Webflow build notes:**
- Light background section (#fff or #f5f5f7)
- Cards: white bg, subtle border (1px solid #e0e0e0), border-radius 16px, padding 32px
- Each card has an icon/illustration area, title, and description
- Grid: Webflow's native CSS Grid component
- Card hover can be Webflow Interaction OR pure CSS (CSS is simpler and more performant)

---

### Section 7 — Release Intelligence

**Content:**
- Section label: "Release Intelligence"
- Headline: "Context and AI that make every release smarter"
- 4 feature cards:
  1. Artist Intelligence
  2. AI Teammate
  3. Release Review
  4. Search
- Section CTA: "Learn more →" (links to /product/intelligence)

**Animation:** Same staggered card entrance as Orchestration, BUT with a **dark section background** (#111 or #1d1d1f). This creates a visual break that signals "new product pillar."

**Section transition (the colour shift):**

```javascript
// Background colour transitions as this section scrolls into view
ScrollTrigger.create({
  trigger: '.intelligence-section',
  start: 'top 60%',
  end: 'top 20%',
  scrub: true,
  onUpdate: (self) => {
    // Smoothly interpolate background
    const progress = self.progress;
    // Applied via CSS custom property
    document.documentElement.style.setProperty('--section-bg-progress', progress);
  }
});
```

Or simpler — just use a dark background on the section and let natural scroll handle the contrast change. The cards would be dark-themed (dark card bg, light text, subtle light borders).

**Webflow build notes:**
- Section bg: #111, text: white
- Cards: bg #1a1a1a or #222, border 1px solid rgba(255,255,255,0.1)
- Same grid layout as Orchestration
- Card hover: subtle glow or border-color lighten

---

### Section 8 — Use Cases by Role (Tabbed)

**Content:**
- Headline: "One platform. One team."
- Subtitle: "Whether you manage one artist or fifty, Team adapts to how you work."
- Tabs: Label Managers | Artist Managers | Marketing | A&R | Operations | Distributors
- Each tab: 4 use-case cards (spotlight layout — 1 featured + 3 stacked, as in your use-cases-options.html)

**Animation:**

```javascript
function initUseCases(section) {
  const tabs = section.querySelectorAll('.tab-btn');
  const panels = section.querySelectorAll('.tab-panel');

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const target = tab.dataset.tab;
      const activePanel = section.querySelector('.tab-panel.active');
      const newPanel = section.querySelector(`#tab-${target}`);

      if (activePanel === newPanel) return;

      // Deactivate current tab
      section.querySelector('.tab-btn.active').classList.remove('active');
      tab.classList.add('active');

      // Animate out current panel
      gsap.to(activePanel, {
        opacity: 0,
        x: -30,
        filter: 'blur(4px)',
        duration: 0.25,
        ease: 'power2.in',
        onComplete: () => {
          activePanel.classList.remove('active');
          newPanel.classList.add('active');

          // Animate in new panel
          gsap.fromTo(newPanel, {
            opacity: 0, x: 30, filter: 'blur(4px)',
          }, {
            opacity: 1, x: 0, filter: 'blur(0px)',
            duration: 0.35, ease: 'power2.out',
          });

          // Stagger the cards within
          gsap.from(newPanel.querySelectorAll('.uc-card'), {
            y: 20, opacity: 0, stagger: 0.06, duration: 0.4,
            ease: 'power3.out', delay: 0.1,
          });
        }
      });
    });
  });

  // Entrance animation for the whole section
  gsap.from(section.querySelector('.tab-bar'), {
    y: 30, opacity: 0, duration: 0.6,
    scrollTrigger: { trigger: section, start: 'top 75%' }
  });
}
```

**Webflow build notes:**
- Tab pills: Webflow Tabs component, or custom with visibility toggling
- If using Webflow Tabs, the JS overrides the default show/hide with our animated version
- Spotlight layout: CSS Grid — `grid-template-columns: 1fr 1fr` with featured card spanning left column, 3 stacked rows on right
- Mobile: single column, featured card on top

---

### Section 9 — "Built exclusively for music"

**Content:**
- Headline: "Built exclusively for music"
- Body: "Team isn't a project management tool with a music skin. Every feature, every workflow, every AI model is built for how releases actually work."

**Animation:** Scale-up reveal inspired by Frontify's design section:

```javascript
function initBuiltForMusic(section) {
  const inner = section.querySelector('.built-inner');

  gsap.fromTo(inner, {
    scale: 0.85,
    opacity: 0,
    clipPath: 'inset(8% round 1.5rem)',
  }, {
    scale: 1,
    opacity: 1,
    clipPath: 'inset(0% round 0rem)',
    duration: 1,
    ease: 'power3.out',
    scrollTrigger: {
      trigger: section,
      start: 'top 70%',
      end: 'top 20%',
      scrub: 1,
    }
  });
}
```

**Effect:** The section content appears to "zoom into frame" as you scroll — starts slightly scaled down with rounded inset clip-path, expands to fill. Subtle but premium.

**Webflow build notes:**
- Full-width section, could be dark bg or accent colour
- Large headline, centred
- Optional: background visual (abstract waveform, vinyl texture, or subtle pattern — music-coded)
- `will-change: transform, clip-path` on the inner container for GPU compositing

---

### Section 10 — Final CTA

**Content:**
- Headline: "Get a personalised demo for your team"
- Body: "See exactly how Team runs your next release. 60 days free, no credit card required."
- Primary CTA: "Book a demo" → /demo
- Secondary CTA: "See pricing" → /pricing
- Sub-note: "20-minute walkthrough. No commitment."

**Animation:** Reuse the chaos notification parallax from nomorechaos-v5 as background texture behind the form card. Notifications drift slowly with mouse parallax (CSS-only or lightweight JS).

```javascript
function initFinalCta(section) {
  const cards = section.querySelectorAll('.cta-notif');
  const formCard = section.querySelector('.cta-form-card');

  // Mouse parallax on notification cards (desktop only)
  if (window.innerWidth > 768) {
    section.addEventListener('mousemove', (e) => {
      const rect = section.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;

      cards.forEach(card => {
        const depth = parseFloat(card.dataset.depth || 0.03);
        gsap.to(card, {
          x: x * depth * 800,
          y: y * depth * 800,
          duration: 1,
          ease: 'power2.out',
        });
      });
    });
  }

  // Form card entrance
  gsap.from(formCard, {
    y: 60, opacity: 0, scale: 0.95,
    duration: 0.8, ease: 'power3.out',
    scrollTrigger: { trigger: section, start: 'top 60%' }
  });
}
```

**Webflow build notes:**
- Dark background section
- Notification cards: absolute positioned, semi-transparent, blurred edges
- Form card: white bg, centred, elevated with shadow
- Form fields: First name, Email, "Book my demo" button
- Below form: "Sign up today for a 60-day free trial →" link to /pricing

---

### Section 11 — Footer

**Content:**
- Multi-column: Product | Solutions | Company | Resources | Legal
- Social links: Instagram, LinkedIn, X
- Newsletter signup (optional)
- Copyright

**Animation:** None needed — static. Clean cut to dark background.

**Webflow build notes:**
- Standard Webflow footer component
- Dark bg (#111), light text
- Link hover: opacity transition or underline slide

---

## Performance Checklist

| Item | Approach |
|------|----------|
| **JS bundle size** | ~80KB gzipped target (GSAP core ~25KB + ScrollTrigger ~12KB + our code ~15KB + Lenis ~8KB) |
| **Images** | WebP/AVIF via Webflow's automatic optimisation. Lazy load below-fold images |
| **Video** | Inline loop: compressed MP4 (<5MB), `preload="metadata"`. Modal video: lazy-loaded on click |
| **Fonts** | Inter via Google Fonts with `display=swap`. Preload woff2 for critical weight (400, 600, 700) |
| **`will-change`** | Applied to pinned hero, notification cards, product frame |
| **`prefers-reduced-motion`** | Disable: smooth scroll, parallax, card scatter. Keep: fades, opacity transitions |
| **Layout shift** | Reserve space for video/images with aspect-ratio. `scrollbar-gutter: stable` |
| **Critical path** | Inline critical CSS for above-fold (Webflow handles this). Defer JS bundle |

---

## Responsive Breakpoints

| Breakpoint | Adjustments |
|-----------|-------------|
| **Desktop** (992px+) | Full animations, 6 notification cards, pinned hero with scatter |
| **Tablet** (768-991px) | Reduce to 4 notification cards, shorter pin duration (200% instead of 300%), scrub: 1 (faster) |
| **Mobile** (< 768px) | No pin on hero (too janky on mobile Safari). Cards fade out as a group instead of scattering individually. Use cases: stack tabs vertically or horizontal scroll. Reduce all stagger values by 50%. No mouse parallax. |

---

## Webflow Build Order

1. **Global styles** — colours, typography scale, spacing system, button styles
2. **Nav + footer** — reusable across all pages
3. **Hero section** — layout only (notification card positions, headline, CTAs)
4. **Social proof marquee** — logo strip
5. **Content sections** — value prop, bridge, orchestration, intelligence, use cases, built-for-music, final CTA
6. **Forms** — demo booking form in final CTA + popup
7. **Video modal** — overlay component
8. **Responsive** — tablet + mobile adjustments
9. **SEO** — unique titles, meta descriptions, OG images per page
10. **Custom code injection** — add GSAP CDN links + team-home.js

---

## JS Bundle Development

We'll develop `team-home.js` as a standalone file:

```
team-homepage-js/
├── src/
│   ├── index.js          # Entry point — registers modules, inits Lenis
│   ├── utils/
│   │   ├── splitText.js  # Free SplitText alternative
│   │   ├── flip.js       # Free Flip alternative (if needed)
│   │   └── prefersReducedMotion.js
│   ├── modules/
│   │   ├── hero.js
│   │   ├── marquee.js
│   │   ├── valueProp.js
│   │   ├── orchestration.js
│   │   ├── intelligence.js
│   │   ├── useCases.js
│   │   ├── builtForMusic.js
│   │   ├── finalCta.js
│   │   ├── videoModal.js
│   │   └── nav.js
│   └── global/
│       ├── smoothScroll.js
│       └── floatingCta.js
├── dist/
│   └── team-home.js      # Bundled + minified output
├── package.json
└── rollup.config.js      # or esbuild
```

Build: `esbuild src/index.js --bundle --minify --outfile=dist/team-home.js`

Host the `dist/team-home.js` on GitHub Pages (free) via a public repo. Webflow references it via `<script src="https://your-org.github.io/team-homepage-js/team-home.js">`.

---

## Open Questions

1. **Product video** — Do we have a walkthrough video ready, or does one need to be produced? The existing `team-ui-compressed.mp4` loop works for inline background but we need a narrated/annotated walkthrough for the modal.
2. **Social proof** — Logo permissions from any current users/partners? Or go with stat-based proof points for now?
3. **Illustrations/icons** — Each feature card needs a visual. Product screenshots? Custom icons? Abstract illustrations?
4. **Notification card content** — The chaos notification cards need specific, realistic messages. Reuse from nomorechaos-v5 or write new ones for the homepage context?
5. **GSAP license check** — Verify at gsap.com whether Flip and SplitText are now free post-Webflow acquisition. If so, we can drop the custom utilities and use the official plugins.

---

## Next Steps

1. **Simon to review and approve** this spec
2. **Decide on open questions** above
3. **Set up Webflow project** — create project, apply global styles
4. **Build layout section by section** — no animations, just structure
5. **Develop team-home.js** — build and test animation bundle locally
6. **Integrate** — inject JS into Webflow, test, iterate
7. **QA** — responsive testing, performance audit, accessibility check
