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
3. **Brand fidelity.** Colours, font and logo come from `brandTokens` in site-data.ts. Primary = navy `#27477D` / logo blue `#0A58A8`; accent = logo red `#E81C24` (large text, icons, highlights only; use `#C8151D` for small red text). Font = Montserrat only. No gradients beyond navy→logoBlue. No purple, teal or extra accents.
4. **Accessibility:** WCAG 2.1 AA. Body text `#1E2A3A`, muted `#5B6472` (never the old `#888C92`). Visible focus rings, 44px touch targets, `prefers-reduced-motion` respected.
5. **Performance budget:** Lighthouse ≥ 95 on all four categories, mobile. LCP < 2.0s. No client JS on a page unless it is interactive.
6. **Mobile-first.** Most patients arrive on phones from Google Maps or WhatsApp. Call / WhatsApp must be one tap from every screen.
7. Times and "open now" are computed in `Asia/Karachi`, never the user's browser timezone.

## Structure
- Routes (built and planned): /, /services, /services/[slug], /locations, /locations/[id], /reports, /about, /contact, /tests
- `src/data/site-data.ts` is the single source of truth (do not restructure without asking).
- `public/brand/` holds the logo and badges, downloaded from the live site before DNS cutover.

## Workflow
- Work one prompt/phase at a time. Use plan mode for anything touching more than 3 files.
- After each phase: `pnpm test && pnpm lint && pnpm typecheck && pnpm build` must pass, then commit with a conventional message.
- When unsure about a fact, add it to `openQuestions` in site-data.ts. Don't guess.
