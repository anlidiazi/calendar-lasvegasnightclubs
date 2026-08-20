export default function SiteLogo() {
  return (
    <a
      className="inline-flex shrink-0 translate-y-2 rounded-sm transition-opacity hover:opacity-90 focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-brand-strong"
      href="https://lasvegasnightclubs.com/"
      aria-label="Las Vegas Nightclubs home"
    >
      <img
        className="h-auto w-64 max-w-full"
        src="/images/brand/las-vegas-nightclubs-logo.webp"
        width="272"
        height="90"
        alt="Las Vegas Nightclubs"
        title="Las Vegas Nightclubs"
        decoding="async"
        fetchPriority="high"
      />
    </a>
  );
}
