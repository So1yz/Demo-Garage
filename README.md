# Autora Automotive — Premium Garage Website Demo

A production-quality, frontend-only static website demo designed as a sales portfolio presentation for independent automotive garages in Rotterdam and the Greater Rijnmond region.

---

## 1. Project Overview

* **Brand:** Autora Automotive (Fictional independent garage in Rotterdam)
* **Architecture:** Multi-Page Static Website (MPA)
* **Tech Stack:** Semantic HTML5, Modular CSS (Design Tokens), Vanilla TypeScript, Vite 6
* **Runtime Dependencies:** 0 KB (Zero third-party runtime frameworks or trackers)
* **Backend:** Strictly frontend-only (no application server, database, or customer accounts)

---

## 2. Prerequisites

* **Node.js:** `v20.x` or later (tested on `v24.21.0`)
* **npm:** `v10.x` or later (tested on `11.19.0`)
* **Git:** `v2.x` (tested on `2.56.0`)

---

## 3. Getting Started & Commands

```bash
# 1. Install development dependencies
npm install

# 2. Start local development server with Hot Module Replacement (HMR)
npm run dev

# 3. Type-check with TypeScript and build static distribution
npm run build

# 4. Preview the production build locally
npm run preview
```

---

## 4. Project Structure

```
demo_garagewebsite/
├── .github/                      # CI/CD deployment workflows (future phase)
├── public/                       # Static public assets served at root
│   ├── favicon.svg               # SVG brand favicon
│   └── robots.txt                # Search engine directives
├── src/
│   ├── assets/
│   │   ├── images/               # High-resolution automotive imagery (WebP)
│   │   └── icons/                # Inline and SVG interface icons
│   ├── components/               # Reusable HTML partials / layout templates
│   ├── pages/                    # Multi-page HTML entry points
│   │   ├── diensten.html         # Service catalog (APK, Onderhoud, Diagnose)
│   │   ├── over-ons.html         # Workshop story & philosophy
│   │   ├── reviews.html          # Google review hub & showcase
│   │   ├── contact.html          # Contact details, route & quote request form
│   │   ├── privacy.html          # Privacy statement (AVG / GDPR compliant)
│   │   └── algemene-voorwaarden.html # General terms
│   ├── scripts/
│   │   └── main.ts               # Strict TypeScript entry point
│   └── styles/
│       ├── tokens.css            # Design tokens (colors, type scale, spacing)
│       ├── reset.css             # Modern CSS reset with reduced-motion support
│       ├── typography.css        # Typography hierarchy & accessible focus rings
│       ├── components.css        # Header, buttons, cards, badges, footer
│       ├── utilities.css         # Grid, flex, container & screen-reader utilities
│       └── main.css              # Main CSS bundle importing all modules
├── index.html                    # Homepage entry point
├── package.json                  # Scripts & development dependencies
├── tsconfig.json                 # Strict TypeScript configuration
├── vite.config.ts                # Vite 6 multi-page Rollup build configuration
└── .gitignore                    # Excludes node_modules, dist, and local caches
```

---

## 5. Deployment Assumptions

* **Target Host:** Any static hosting provider (Cloudflare Pages, Netlify, GitHub Pages, Vercel).
* **Build Command:** `npm run build`
* **Output Directory:** `dist`
* **Node Version on Build Server:** `>= 20.0.0`
* **Privacy & Cookies:** The website sets **zero cookies** and employs no tracking scripts, requiring no GDPR cookie consent banner.

---

## 6. Project Status

* **Phase 0:** Architecture, Discovery & Planning — **Completed**
* **Phase 1:** Project Scaffolding & Build Configuration — **Completed**
* **Phase 2:** Design Tokens & Layout Shells — **Pending Explicit User Approval**

