# Brand assets

Downloaded from the live WordPress site on 17 Nov 2026, before DNS cutover. The source URLs come from `brandTokens.logo` and the `registrations[].logo` comments in `src/data/site-data.ts`. Once DNS moves, these URLs stop working, so keep the files here.

| Local file | Source URL | Size |
| --- | --- | --- |
| `logo-emblem.png` | https://ayyublabs.com/wp-content/uploads/2021/09/logo-t.png | 66×63 |
| `logo-emblem-192.png` | https://ayyublabs.com/wp-content/uploads/2021/09/cropped-logo-t-192x192.png | 192×192 |
| `logo-wordmark.png` | https://ayyublabs.com/wp-content/uploads/2021/09/newww.png | 276×84 |
| `badges/phc.png` | https://ayyublabs.com/wp-content/uploads/2024/07/PHC.png | 200×200 |
| `badges/pnra.png` | https://ayyublabs.com/wp-content/uploads/2024/07/PNRA.png | 201×251 |

## Notes

- `logo-emblem.png` is too small for anything but a fallback. Use `logo-emblem-192.png`.
- `logo-wordmark.png` includes address text baked into the image.
- No vector logo exists yet (`brandTokens.logo.vectorAvailable` is `false`). Replace these PNGs when the client supplies an AI/SVG/PDF.
- The badge paths match `registrations[].logo` in `site-data.ts`. Show a badge only on the branches listed in that entry's `appliesTo`.
