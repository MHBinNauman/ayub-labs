/** First focusable element on every page; jumps past the header to <main>. */
export function SkipLink({ targetId }: { targetId: string }) {
  return (
    <a
      href={`#${targetId}`}
      className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:rounded-lg focus:bg-white focus:px-4 focus:py-3 focus:font-semibold focus:text-navy focus:shadow-card-hover focus:outline-2 focus:outline-offset-2 focus:outline-brand-blue"
    >
      Skip to content
    </a>
  );
}
