# CLAUDE.md — Ayyub Labs & Clinics website

Claude Code reads this file automatically at the start of every session. Keep it short and current.

## What this is
Marketing and patient-access website for **Ayyub Labs & Clinics** (diagnostic lab and clinics, Saddar Rawalpindi + F-8 Islamabad, since 2016). It replaces a broken WordPress site at ayyublabs.com. Design is modelled on the information architecture of IDC (idc.net.pk/locations/rawalpindi), **not** its visual identity: we use Ayyub's own brand.

## Stack
- React Server Components by default.
- Hosting: Vercel. Static generation everywhere; no database.

## Non-negotiable rules
1. **All facts come from `src/data/site-data.ts`.** Never hard-code a phone number, address, hour, price, name or claim in a component. If data is missing, hide the UI element. Never render "TODO", "Lorem", "0K" or placeholder text.
2. **No invented medical claims.** Don't write "accredited", "ISO certified", "100% accurate", "#1 lab", fake stats, fake reviews or fake doctors. The client is *registered* with PHC and PNRA; that is the only trust claim allowed.
3. **Brand fidelity.** Colours, font and logo come from `brandTokens` in site-data.ts. Primary = navy `#27477D` / logo blue `#0A58A8`; accent = logo red `#E81C24` (large text, icons, highlights only; use `#C8151D` for small red text). Font = Montserrat only. Allowed gradients only: navy→logoBlue (dark sections), tint→white (light sections), and navy-alpha overlays on photos. No teal, no green except WhatsApp #25D366 on WhatsApp buttons, no purple. The Dr. Adil template is a LAYOUT reference only; never copy its colours or images. No other accents.
4. **Accessibility:** WCAG 2.1 AA. Body text `#1E2A3A`, muted `#5B6472` (never the old `#888C92`). Visible focus rings, 44px touch targets, `prefers-reduced-motion` respected.
5. **Performance budget:** Lighthouse ≥ 95 on all four categories, mobile. LCP < 2.0s. No client JS on a page unless it is interactive.
6. **Mobile-first.** Most patients arrive on phones from Google Maps or WhatsApp. Call / WhatsApp must be one tap from every screen.
7. Times and "open now" are computed in `Asia/Karachi`, never the user's browser timezone.

## Motion rules
- Library: motion (already installed). Durations 200–600ms; easing [0.22, 1, 0.36, 1].
- Animate only transform and opacity (no animating height/width/top/left, no layout thrash).
- Every animation is disabled or reduced under prefers-reduced-motion.
- Reveal-on-scroll runs once; no looping animations except the hero slider and the loader.
- No animation may delay the LCP element or hide it with opacity:0 on first paint.

## Images
- All photos go through next/image with explicit sizes.
- Stock lives in public/images/stock; real photos later in public/images/real.
- Every image is referenced from a `media` object in site-data.ts (never a hard-coded path in a component), with alt text written for a patient (what's in the picture, not "image of").

## Structure
- Routes (built and planned): /, /services, /services/[slug], /locations, /locations/[id], /reports, /about, /contact, /tests
- Nav order is fixed: Home, About, Services, Reports, Locations, Contact (`navigation.navItems` in site-data.ts). When `features.testDirectory` is on, "Tests & prices" goes directly before Reports.
- `src/data/site-data.ts` is the single source of truth (do not restructure without asking).
- `public/brand/` holds the logo and badges, downloaded from the live site before DNS cutover.

## Workflow
- Work one prompt/phase at a time. Use plan mode for anything touching more than 3 files.
- After each phase: `pnpm test && pnpm lint && pnpm typecheck && pnpm build` must pass, then commit with a conventional message.
- When unsure about a fact, add it to `openQuestions` in site-data.ts. Don't guess.
