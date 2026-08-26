const campaignUrl = "https://taogroup.com/events/?event_venue=1006&event_city=81";

export default function SiteTakeover() {
  return (
    <aside className="site-takeover" aria-label="Advertisement">
      <a
        className="site-takeover-link site-takeover-link-left"
        href={campaignUrl}
        target="_blank"
        rel="noopener noreferrer sponsored"
        aria-label="OMNIA Dayclub events (opens in a new tab)"
      />
      <a
        className="site-takeover-link site-takeover-link-right"
        href={campaignUrl}
        target="_blank"
        rel="noopener noreferrer sponsored"
        aria-label="OMNIA Dayclub events (opens in a new tab)"
        tabIndex={-1}
      />
    </aside>
  );
}
