"use client";

import { Check, Copy } from "lucide-react";
import { useEffect, useState, useSyncExternalStore } from "react";

const noSubscription = () => () => {};
const canCopy = () => typeof navigator.clipboard?.writeText === "function";
const canCopyOnServer = () => false;

type Status = "idle" | "copied" | "failed";

/**
 * Copies the branch address. Rendered only where the Clipboard API exists
 * (it needs a secure context), so there is never a button that does
 * nothing. The result is announced to screen readers.
 */
export function CopyAddressButton({ text }: { text: string }) {
  const supported = useSyncExternalStore(
    noSubscription,
    canCopy,
    canCopyOnServer,
  );
  const [status, setStatus] = useState<Status>("idle");

  useEffect(() => {
    if (status === "idle") return;
    const timer = setTimeout(() => setStatus("idle"), 2000);
    return () => clearTimeout(timer);
  }, [status]);

  if (!supported) return null;

  return (
    <>
      <button
        type="button"
        onClick={() => {
          navigator.clipboard.writeText(text).then(
            () => setStatus("copied"),
            () => setStatus("failed"),
          );
        }}
        className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-ink/15 bg-white px-4 text-sm font-semibold text-navy transition-colors hover:border-navy focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-blue"
      >
        {status === "copied" ? (
          <Check aria-hidden="true" className="size-4 text-brand-blue" />
        ) : (
          <Copy aria-hidden="true" className="size-4" />
        )}
        {status === "copied" ? "Copied" : "Copy address"}
      </button>
      <span role="status" className="sr-only">
        {status === "copied"
          ? "Address copied"
          : status === "failed"
            ? "Could not copy the address"
            : ""}
      </span>
    </>
  );
}
