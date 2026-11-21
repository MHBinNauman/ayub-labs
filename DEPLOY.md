# Deploying Ayyub Labs & Clinics to Vercel

This is the runbook for putting the site live on **ayyublabs.com**. Follow it in order. The domain cutover in step 4 is the only step that affects real visitors and email, so read section 5 (rollback) **before** you start it.

---

## 1. What gets deployed

`pnpm build` produces an almost entirely static site. Verified on the current build:

| Output | Rendering |
| --- | --- |
| `/`, `/services`, `/locations`, `/reports`, `/about`, `/contact`, `/styleguide`, 404 page | Static HTML (○) |
| All 11 `/services/<slug>` and both `/locations/<id>` pages | Static HTML, prerendered from site-data (○ / ●) |
| `/tests` | Static 404 while `features.testDirectory` is `false` |
| Open Graph images, icons, `manifest.webmanifest`, `sitemap.xml`, `robots.txt` | Generated once at build time (○ / ●) |

**What runs at request time:**

- **`/services/[slug]` and `/locations/[id]` (◐), for unknown slugs only.** Every real service and branch is prerendered. A mistyped URL such as `/services/xyz` is rendered on request, so that it returns a real **404** status instead of a "200 OK" error page. On Vercel this is a small function call that only happens for bad URLs.
- **Image optimisation** for the logo and registration badges (`next/image`). This is Vercel's built-in image service, not our code.
- **Redirects and security headers** come from `next.config.ts` and are applied by Vercel at the edge.

There is no middleware, there are no API routes, and there is no database.

### Why there is no `vercel.json`

Vercel detects Next.js automatically. The install command and pnpm version come from `package.json` (`packageManager`), and redirects and headers live in `next.config.ts`. A `vercel.json` would only duplicate that config and give it two sources of truth. Add one only if you later need a Vercel-only feature (crons, region pinning).

---

## 2. Vercel project (import)

> The project **already exists** and is connected to GitHub (`MHBinNauman/ayub-labs`): every push to `main` deploys to production at `https://ayub-labs.vercel.app`, and pull requests get preview URLs. Use the steps below only if you ever need to recreate it.

1. Vercel dashboard → **Add New… → Project** → import `MHBinNauman/ayub-labs`.
2. **Framework preset:** Next.js (auto-detected).
3. **Root directory:** `./`. Leave **Build**, **Install** and **Output** at their defaults; Vercel runs `pnpm install` and `pnpm build`.
4. **Settings → General → Node.js version:** 22.x (the version CI uses).
5. **Environment variables:** none are required (see section 3).
6. Deploy, then check the `*.vercel.app` URL.

### Before every production deploy

- [ ] The GitHub Actions **CI** run for the commit is green (lint, types, unit, build, e2e incl. axe, Lighthouse).
- [ ] The `features` flags in `src/data/site-data.ts` are what you intend to publish (e.g. `testDirectory`).
- [ ] The launch-blocking items in `openQuestions` (site-data.ts) are answered, or knowingly deferred. In particular: client approval of the draft copy, and the F-8 hours and registration.

---

## 3. Environment variables

| Name | Required | Default | Purpose |
| --- | --- | --- | --- |
| `NEXT_PUBLIC_SITE_URL` | No | `https://ayyublabs.com` (from `brand.domain`) | The public origin used in canonical URLs, Open Graph URLs, `sitemap.xml`, `robots.txt` and structured data. |

There are no secrets and no API keys.

**Recommendation: leave `NEXT_PUBLIC_SITE_URL` unset.** Then every canonical URL points at `https://ayyublabs.com` from day one, and the temporary `ayub-labs.vercel.app` URL never competes with the real domain in Google.

- **When to set it:** only if the site must permanently live on a different domain. Use the bare origin, e.g. `https://www.example.com`, with `https://` and no trailing path.
- **Values are checked:** a value that is not an absolute `https://` URL **fails the build** with a clear error, rather than shipping broken links.
- **Build-time only:** `NEXT_PUBLIC_*` values are baked in **at build time**. After changing it in Vercel, **redeploy** for it to take effect.
- **Do not set it to the `vercel.app` URL** for previews. Search engines would be told the preview is the real site.

For local overrides, copy `.env.example` to `.env.local`.

---

## 4. Domain cutover (ayyublabs.com → Vercel)

### 4.1 Before you start (at least 24 hours ahead)

1. **Find out who controls DNS** for `ayyublabs.com`. This is the registrar, or the current host's cPanel (see `openQuestions`). You need a login that can edit DNS records.
2. **Record the current DNS records.** Fill this in and keep it somewhere outside the website (e.g. a shared note). **Rollback depends on it.**

   | Record | Current value (write it down) | Current TTL |
   | --- | --- | --- |
   | `A` `@` (ayyublabs.com) | | |
   | `www` (CNAME or A) | | |
   | `AAAA` `@`, if any | | |

   Also take **a screenshot or export of the whole DNS zone**, including MX, TXT and every subdomain.
3. **Lower the TTL** on the `@` and `www` records to **300 seconds** (5 minutes). Wait at least as long as the *old* TTL (often 4–24 h), so that both the cutover and any rollback take effect within minutes.
4. **Keep the old host running.** Do not cancel or change the current WordPress hosting until the new site has run cleanly for an agreed period (e.g. 30 days). It is the rollback target, and it may host the email.

### 4.2 Add the domain in Vercel

1. Vercel → project **ayub-labs** → **Settings → Domains**.
2. Add `ayyublabs.com` and `www.ayyublabs.com`.
3. Make **`ayyublabs.com` the primary domain**, and set `www.ayyublabs.com` to **redirect** to it. This matches `brand.domain` and the canonical URLs.
4. Vercel now shows the DNS records it expects. **Use the values Vercel shows.**

### 4.3 DNS records to add or change

At the DNS provider, change **only** these two records:

| Type | Name / Host | Value | TTL |
| --- | --- | --- | --- |
| `A` | `@` | `76.76.21.21` | 300 |
| `CNAME` | `www` | `cname.vercel-dns.com` | 300 |

> ⚠️ **Verify the current values in the Vercel dashboard at deploy time.** The values above are Vercel's long-standing defaults. Vercel may show different, project-specific values (for example a different A-record IP, or a CNAME like `xxxx.vercel-dns-0xx.com`). If the dashboard differs, **the dashboard wins**.

- **Replace, don't duplicate.** Replace the existing `A @` value; don't add a second `A @` record. If `www` is currently an `A` record, delete it and add the CNAME.
- **AAAA records:** if there is an `AAAA @` (IPv6) record pointing at the old host, remove it. Otherwise some visitors would still reach the old site. Record its value first (4.1).

### 4.4 Do NOT change

- ❌ **Nameservers.** Leave them exactly as they are. Do not move DNS to Vercel.
- ❌ **MX records.** Email (`info@ayyublabs.com`) must keep going to its current provider.
- ❌ **Mail-related TXT records:** SPF (`v=spf1 …`), DKIM, DMARC, and any domain-verification TXT records.
- ❌ **Mail and host subdomains**, such as `mail.`, `webmail.`, `cpanel.`, `autodiscover.`, `ftp.`, or anything else not listed in 4.3.

If a **CAA** record exists, it must allow Vercel's certificate authority (add `0 issue "letsencrypt.org"` if it isn't there), or HTTPS will not be issued.

### 4.5 After the change

1. In Vercel → Domains, wait until both domains show **Valid Configuration** and the SSL certificate is issued. This usually takes minutes; it can take a few hours.
2. Check from a terminal (or a site like [dnschecker.org](https://dnschecker.org)):
   ```sh
   curl -sI https://ayyublabs.com            # 200, served by Vercel ("server: Vercel")
   curl -sI https://www.ayyublabs.com        # 308 (or the code chosen in 4.2) → https://ayyublabs.com/
   curl -sI https://ayyublabs.com/about-us   # 301 → /about
   curl -sI https://ayyublabs.com/online-report  # 301 → /reports
   ```
   The responses should include the `Content-Security-Policy`, `X-Content-Type-Options` and `Referrer-Policy` headers.
3. Open `https://ayyublabs.com/sitemap.xml` and `https://ayyublabs.com/robots.txt`.
4. **Email check:** send an email to `info@ayyublabs.com` from an outside account and reply from it. Both directions must work.
5. On a phone (mobile data, not Wi-Fi), open the site, tap **Call** and **WhatsApp**, and check a branch page's map and directions.
6. **Google Search Console:** add or verify the `ayyublabs.com` property and submit `https://ayyublabs.com/sitemap.xml`.
7. Once everything has been stable for a few days, you can raise the TTLs back to their usual value (e.g. 3600).

---

## 5. Rollback

Pick the rollback that matches the problem:

| Symptom | Rollback |
| --- | --- |
| The site is down, or shows SSL errors on `ayyublabs.com`, after the DNS change | **DNS rollback** (5.1) |
| Email stops working after the DNS change | Undo whatever mail-related record was changed (restore it from the zone screenshot). Then do a **DNS rollback** if needed. |
| The site is up but a new deploy broke something | **Code rollback** (5.2). No DNS change needed. |

### 5.1 DNS rollback (back to the old host)

1. At the DNS provider, set `A @` back to **the old IP recorded in 4.1**.
2. Restore `www` to its **recorded old value** (and any `AAAA @` you removed).
3. Keep the TTL at 300 so the change spreads within minutes.
4. Confirm with `curl -sI https://ayyublabs.com` that the old site answers.
5. Only then (optionally) remove the domains from Vercel → Settings → Domains.

> Without the old IP recorded **before** the cutover, this rollback is not possible. Do not skip step 4.1.

### 5.2 Code rollback (stay on Vercel)

- Vercel → **Deployments** → choose the last good deployment → **⋯ → Instant Rollback**. This takes effect in seconds.
- Or revert the bad commit on `main` and push. CI runs, and Vercel deploys the revert.
