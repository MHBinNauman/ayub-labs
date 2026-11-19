import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

/** Shared look for input, select and textarea: 48px tall, visible focus ring. */
export function controlClass(invalid: boolean, className?: string): string {
  return cn(
    "min-h-12 w-full rounded-lg border bg-white px-3 text-base text-ink shadow-card placeholder:text-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-blue",
    invalid
      ? "border-brand-red-text focus-visible:border-brand-red-text"
      : "border-ink/20 focus-visible:border-brand-blue",
    className,
  );
}

/** Ids the control needs for its label and its error / hint text. */
export function fieldIds(id: string) {
  return { error: `${id}-error`, hint: `${id}-hint` };
}

/**
 * Label, control and error message for one form field. The control itself
 * is passed as children and must carry `id`, `aria-invalid` and
 * `aria-describedby` (see fieldIds) so screen readers announce the error.
 */
export function Field({
  id,
  label,
  hint,
  error,
  children,
  className,
}: {
  id: string;
  label: string;
  hint?: string;
  error?: string;
  children: ReactNode;
  className?: string;
}) {
  const ids = fieldIds(id);
  return (
    <div className={className}>
      <label
        htmlFor={id}
        className="mb-1.5 block text-sm font-semibold text-ink"
      >
        {label}
      </label>
      {children}
      {hint && !error && (
        <p id={ids.hint} className="mt-1.5 text-sm text-muted">
          {hint}
        </p>
      )}
      {error && (
        <p
          id={ids.error}
          className="mt-1.5 text-sm font-semibold text-brand-red-text"
        >
          {error}
        </p>
      )}
    </div>
  );
}

/** aria props for a control inside <Field>. */
export function controlAria(id: string, error?: string, hasHint = false) {
  const ids = fieldIds(id);
  return {
    "aria-invalid": error ? true : undefined,
    "aria-describedby": error ? ids.error : hasHint ? ids.hint : undefined,
  } as const;
}
