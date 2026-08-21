import SiteLogo from "./site-logo.jsx";

const primaryNavigation = [
  {
    label: "Nightclubs",
    href: "https://lasvegasnightclubs.com/nightclubs/",
  },
  {
    label: "Pool Parties",
    href: "https://lasvegasnightclubs.com/pool-parties/",
  },
  {
    label: "Strip Clubs",
    href: "https://lasvegasnightclubs.com/strip-clubs/",
  },
  {
    label: "Guest List",
    href: "https://lasvegasnightclubs.com/las-vegas-guest-list/",
  },
  {
    label: "Bottle Service",
    href: "https://lasvegasnightclubs.com/las-vegas-nightclub-bottle-service/",
  },
  {
    label: "VIP Hosts",
    href: "https://lasvegasnightclubs.com/hosts/",
  },
  { label: "Calendar", href: "/", current: true },
  {
    label: "Guides",
    href: "https://lasvegasnightclubs.com/guides/",
  },
  {
    label: "Forums",
    href: "https://forums.lasvegasnightclubs.com/",
  },
  {
    label: "News",
    href: "https://lasvegasnightclubs.com/news/",
  },
];

export default function SiteHeader() {
  return (
    <header className="border-t-4 border-brand bg-black">
      <div className="mx-auto hidden h-[7.1875rem] max-w-[70rem] items-center px-3 min-[48.0625rem]:flex">
        <SiteLogo />
      </div>

      <div className="relative flex h-[4.25rem] items-center justify-center px-4 min-[48.0625rem]:hidden">
        <button
          type="button"
          className="absolute left-4 top-1/2 flex -translate-y-1/2 flex-col gap-1 rounded-sm p-2 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-brand-strong"
          aria-label="Open menu"
        >
          <span className="block h-1 w-7 bg-white" />
          <span className="block h-1 w-7 bg-white" />
          <span className="block h-1 w-7 bg-white" />
        </button>
        <div className="scale-[0.6]">
          <SiteLogo />
        </div>
      </div>

      <nav
        className="hidden border-t border-white/5 min-[48.0625rem]:block"
        aria-label="Primary navigation"
      >
        <div className="mx-auto max-w-[70rem] overflow-x-auto px-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <ul className="flex h-[4.25rem] w-max min-w-full items-center justify-start p-0 lg:pl-[2.1875rem]">
            {primaryNavigation.map((item) => (
              <li className="shrink-0" key={item.label}>
                <a
                  className={`flex h-[2.5625rem] items-center border-b-2 px-[0.65625rem] text-sm font-bold uppercase leading-[1.3125rem] text-white transition-colors hover:border-brand hover:text-white ${
                    item.current ? "border-brand" : "border-transparent"
                  }`}
                  href={item.href}
                  aria-current={item.current ? "page" : undefined}
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </nav>
    </header>
  );
}
