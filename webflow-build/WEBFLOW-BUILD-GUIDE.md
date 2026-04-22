# Team Homepage — Webflow Build Guide

**Date:** 2026-04-17
**Approach:** Webflow layout + custom JS/CSS bundle (same architecture as frontify.com)

---

## Architecture

```
Webflow (designer)          Custom Code (GitHub Pages)
├── Layout & structure      ├── team-home.css
├── Typography & colours    └── team-home.js
├── Responsive breakpoints
├── CMS (blog)              CDN Dependencies
├── Forms                   ├── GSAP + plugins
├── SEO fields              ├── Lenis
└── Images/assets           └── Swiper
```

**Webflow hosts the site.** Custom JS/CSS hosted on `siteamrollouts.github.io/team-homepage/`.

---

## Setup

### 1. Webflow Project Settings

- **Fonts:** Inter (Google Fonts — add via Webflow's font picker)
- **Custom Code → Head:** paste contents of `webflow-head-code.html`
- **Custom Code → Footer:** paste contents of `webflow-body-code.html`

### 2. CSS Variables (set on body or html)

```
--black: #111110
--accent: #F56002 (Team orange)
--text-secondary: #6b6b63
--grey: #cbcbc5
--bg: #e9e9e3
--ease: cubic-bezier(0.16, 1, 0.3, 1)
```

---

## Section-by-Section Build

### Nav

**Webflow class:** `.nav`
**ID:** `nav`

**Structure:**
```
nav.nav#nav (fixed, z-index 1000)
  ├── div.nav__pill.nav__pill--left
  │   ├── a.nav__logo (Team logo — light + dark variants)
  │   ├── div.nav__divider
  │   ├── div.nav__dropdown[data-dropdown] → "Product"
  │   │   ├── a.nav__link (trigger text + chevron SVG)
  │   │   └── div.nav__dropdown-panel (mega menu content)
  │   └── div.nav__dropdown[data-dropdown] → "Solutions"
  └── div.nav__pill.nav__pill--right
      ├── a.nav__link → "Pricing"
      ├── div.nav__divider
      ├── a.nav__login → "Login"
      └── a.nav__cta → "Book demo"
```

**Key attributes:**
- Each dropdown needs `data-dropdown` attribute
- Nav gets `.nav--hidden` (JS) and `.nav--solid` (JS) classes

**What Webflow handles:** All layout, pill styling, logo swap, link styles, responsive collapse
**What JS handles:** Hide/show on scroll, transparent→solid swap, dropdown hover

---

### Hero Section

**Webflow class:** `.hero-section`
**ID:** `heroSection`

**Structure:**
```
section.hero-section#heroSection (relative, min-height 100vh)
  ├── div.hero-img-w#heroImgW (absolute, inset 0)
  │   └── img.hero-img (src: hero image, loading: eager)
  ├── div.cover-w#coverW (absolute, flex center)
  │   └── div.cover__intro#coverIntro
  │       ├── h1.headline-xl → "The [TYPER] for your music releases"
  │       │   ├── span.typer#heroTyper → "Command Center"
  │       │   ├── span.typer__caret
  │       │   └── br + span.nyght → "for your music releases"
  │       ├── p → body copy
  │       └── div.cover__buttons
  │           ├── a.btn.btn--primary.btn--demo → "Book demo" (with calendar SVG icon)
  │           └── a.btn.btn--outline[data-video-trigger] → "See the platform"
  └── div.hero-excerpts#heroExcerpts (absolute, top 52%, centred)
      ├── div.hero-excerpt__flank#heroExcerptLeft (data-src for alt image)
      ├── div.hero-excerpt__flank#heroExcerptRight (data-src for alt image)
      ├── div.hero-excerpt#heroExcerpt
      │   └── div.hero-excerpt__img#heroExcerptImg
      ├── div.tile-label.tile-label--left#tileLabelLeft (SVG arrow + "Single")
      ├── div.tile-label.tile-label--center#tileLabelCenter (SVG arrow + "EP")
      └── div.tile-label.tile-label--right#tileLabelRight (SVG arrow + "Album")
```

**Key attributes:**
- `data-video-trigger` on the "See the platform" button
- Flank tiles can use `data-src="path/to/image"` for their BG images

**Background:** `#f5f5f0` on `.hero-section` (visible behind clip-path gap)

---

### Role Marquee

**Webflow class:** `.marquee-section`

Two rows of `.role-chip` elements. Each row is a `.marquee-list` with `data-direction="left"` or `"right"`. Duplicate the items so the list is 2x for seamless loop.

**Webflow native:** Use Webflow's Marquee component, or the CSS animation (in team-home.css).

---

### Upload Section ("One platform. One team.")

**Webflow class:** `.section`
**ID:** `uploadSection`

Standard section with headline, body, CTA button. Plus a spacer `div#tileLandingZone` (height: 18rem) for the tiles to land in.

**Fully Webflow native.**

---

### TeamMate Search Section

**Webflow class:** `.engine-section`
**ID:** `engineSection`

**Structure:**
```
section.engine-section#engineSection
  └── div.container.container--center
      ├── div.section-intro (headline + body copy)
      └── div.search-pin-wrap#searchPinWrap
          ├── div.search-bar#searchBar
          │   ├── input.search-input#searchInput (disabled, placeholder)
          │   └── button.search-submit#searchSubmit
          │       ├── span.search-submit__label → "Ask TeamMate"
          │       └── span.search-submit__spinner (SVG spinner)
          └── div.pondering#pondering (3 dots + text)
```

**What JS handles:** Pin, typewriter, button morph to circle/spinner, pondering dots, fade-out

---

### Dashboard Showcase (Guidelines Section)

**Webflow class:** `.guidelines-section`
**ID:** `guidelinesSection`

This is the mock app UI. Build the sidebar + content area as static layout in Webflow.

**Structure:**
```
section.guidelines-section#guidelinesSection
  └── div#assistantTrigger
      └── div.guidelines-w#guidelinesWrap
          ├── div.guidelines-nav (sidebar — static layout)
          │   ├── Logo, search, nav items
          │   ├── Your Releases (All/In Progress/Released)
          │   └── div#teammateChat (chat panel — hidden initially)
          └── div.guidelines-content (content area — relative, overflow hidden)
              ├── Header bar (Releases title + buttons)
              ├── Tabs (All Releases / In Progress / Released)
              ├── div#releasesGridWrap (release card grid — 9 tiles)
              ├── div#showcaseLoading (loading overlay — hidden)
              └── div#showcaseTimeline (timeline view — hidden)
```

**What Webflow handles:** All layout, card styles, sidebar navigation
**What JS handles:** Scroll-driven transition: grid → loading bar → timeline

---

### Features Section

**Webflow class:** `.features-section`
**ID:** `featuresSection`

**Structure:**
```
section.features-section#featuresSection
  ├── div.section-intro (headline + body)
  └── div.features-spotlight
      ├── div.features-list
      │   └── div.feature-card[data-feature="xxx"] × 6
      │       (each with .feature-card__marker, title, description)
      │       (mobile: includes .feature-card__preview-mobile)
      └── div.features-preview
          └── div.features-preview__panel[data-feature="xxx"].is-active × 6
              (timeline, ai, intel, rollout, budget, collab)
```

**Key:** Each card and panel shares a `data-feature` value. JS matches them.

**What Webflow handles:** Layout, card styles, preview panel content
**What JS handles:** Auto-advance, click/hover switching, per-panel entrance animations

---

### FAQ Section

**Webflow class:** `.faq-section`
**ID:** `faqSection`

Two-column layout: sticky left intro + right accordion.

**Structure:**
```
section.faq-section#faqSection
  └── div.faq-section__inner (grid: 1fr 1.4fr)
      ├── div.faq-section__intro (sticky top: 6rem)
      │   ├── h2 (headline)
      │   ├── p (sub-copy)
      │   └── a.faq-section__cta
      └── div.faq-list#faqList
          └── div.faq-item × 9
              ├── button.faq-item__trigger
              │   ├── span.faq-item__num (01-09)
              │   ├── span.faq-item__q (question text)
              │   └── span.faq-item__toggle (plus/minus SVG)
              └── div.faq-item__answer
                  └── div.faq-item__answer-inner
                      └── div.faq-item__answer-content (answer paragraphs)
```

**Mostly Webflow native.** The smooth height transition uses CSS `grid-template-rows` trick (in team-home.css). JS handles one-at-a-time toggling.

---

### Stories Carousel

**Webflow class:** `.stories-section`
**ID:** `storiesSection`

Uses Swiper (not Webflow Slider) for infinite loop + free-mode.

**Structure:**
```
section.stories-section#storiesSection
  ├── div.section-intro (headline + CTA)
  └── div.stories-carousel
      └── div.swiper#storiesSwiper
          └── div.swiper-wrapper
              └── div.swiper-slide × 10
                  └── div.story-card
                      ├── div.story-card__photo (img inside)
                      ├── div.story-card__tier (Enterprise/Team/Artist pill)
                      ├── div.story-card__quote (decorative)
                      └── div.story-card__meta (name, role, quote text)
```

**Build the cards in Webflow.** Swiper initialisation is in JS.

---

### CTA Section

Inside the stories section — headline, body, buttons, "no credit card" note.

**Fully Webflow native.**

---

### Footer

**Webflow class:** `.footer`

**Structure:**
```
footer.footer
  ├── div.footer__newsletter (newsletter signup row)
  │   ├── div.footer__newsletter-copy (h3 + p)
  │   └── form#newsletterForm
  │       ├── input#newsletterEmail
  │       ├── button#newsletterBtn → "Subscribe"
  │       └── p#newsletterMsg (success message — hidden)
  ├── div.footer__grid (5-column link grid)
  └── div.footer__bottom (copyright + social)
```

**Fully Webflow native.** Newsletter JS handles the "Sent!" confirmation.

---

### Side Nav

**Webflow class:** `.side-nav`
**ID:** `sideNav`

**Structure:**
```
nav.side-nav#sideNav (fixed, left, vertical, hidden by default)
  └── div.side-nav__dot × 6
      data-target="uploadSection|engineSection|guidelinesSection|featuresSection|faqSection|storiesSection"
      data-label="Overview|TeamMate|Dashboard|Features|FAQ|Get started"
```

**Hidden on mobile** via CSS.
**JS handles:** Show/hide after hero, scroll-tracked active state, click-to-scroll.

---

### Floating CTA

**IDs:** `floatingCta`, `floatingBar`

**Webflow native** for layout. JS shows/hides based on scroll position.

---

### Video Modal

**ID:** `videoModal`

**Structure:**
```
div.video-modal#videoModal (fixed, z-index 2000, hidden)
  ├── div.video-modal__bg[data-modal-close]
  ├── button.video-modal__close[data-modal-close]
  └── div.video-modal__content
      └── video#modalVideo (src: demo.mp4)
```

**Key:** Any element with `data-video-trigger` opens this modal.

---

## Asset Checklist

| Asset | Location | Notes |
|-------|----------|-------|
| Hero BG image | `assets/hero-bg-new.png` | Main hero background |
| Hero excerpt centre | Same as hero BG (JS captures it) | Auto-captured |
| Hero excerpt left | `assets/hero-bg-alt-1.jpeg` | Flanking tile |
| Hero excerpt right | `assets/hero-bg-alt-2.jpeg` | Flanking tile |
| Team logo (SVG) | `assets/logo-gradient.svg` | Used in sidebar |
| TeamMate avatar | `assets/teammate-avatar-round.png` | Chat panel |
| Demo video | `assets/demo.mp4` | Video modal |
| Customer photos | Unsplash URLs (replace with own) | Stories carousel |

---

## Deployment Steps

1. Build all layout in Webflow designer
2. Add IDs and `data-*` attributes as documented above
3. Upload assets to Webflow's asset manager
4. Paste head code (Project Settings → Custom Code → Head)
5. Paste body code (Project Settings → Custom Code → Footer)
6. Push `team-home.js` and `team-home.css` to `siteamrollouts/team-homepage` repo
7. Publish Webflow site
8. Test all scroll animations, interactions, responsive
9. Connect domain (teamrollouts.com)
