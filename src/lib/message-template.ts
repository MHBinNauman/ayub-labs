/**
 * Message templates built on the server (where site data lives) and filled
 * in on the client. No imports, so client components can use it freely.
 *
 * Keep shared constants here, not in a "use client" file: a server component
 * importing a non-component export from a client module receives a client
 * reference, not the value.
 */

/** Placeholder replaced by the visitor's own text. */
export const QUERY_TOKEN = "{query}";

/** Replaces QUERY_TOKEN in `template` with `value` (trimmed). */
export function fillTemplate(template: string, value: string): string {
  return template.replace(QUERY_TOKEN, value.trim());
}
