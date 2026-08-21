const testimonials = [
  {
    quote:
      '"We spoke to Las Vegas nightlife expert, and creator of the popular nightlife website LasVegasNightclubs.com, Jack Colton."',
    author: "- Today Show",
  },
  {
    quote:
      "Just ask Jack Colton, a local Vegas hero who reveals the secrets of Sin City nightlife on his Web site to everyday players who aspire to VIP-table status.",
    author: "- Forbes Magazine",
  },
  {
    quote:
      '"A salute to Jack Colton: He\'s my favorite nightlife czar who knows everything!"',
    author: "- Robin Leach",
  },
];

const legalCopy =
  "LasVegasNightclubs.com has become a popularly referenced independent resource for information on Las Vegas nightlife. Our site caters directly to those who are looking to plan their Las Vegas nightlife experience by providing honest and independent reviews of the nightlife establishments on or around the Las Vegas Strip. Additionally, readers are able to educate themselves in advance on everything from drink prices to dress codes, and can even find free contact information to book table service themselves directly from someone who actually works for the club. In order to protect the integrity of our content, LasVegasNightclubs.com has a strict policy against allowing editorial favor to be purchased. Taking it one step further, our banner space and advertising programs are based solely on an invitation-only stance that requires the vendor or nightclub to already be popular amongst our visitors as to not provide our audience promotional material to an entertainment product that won't appeal to them. While unorthodox for most websites, especially travel, this method has proven to be a win - win situation both for site visitors and advertisers alike. In addition to online content, LasVegasNightclubs.com locally hosts approximately 30 annual events that often celebrate those within the Las Vegas nightlife industry who help make the entertainment experience the best that it can be. Another popular aspect of lasvegasnightclubs.com is the forums, which are home to a number of enthusiastically passionate Las Vegas entertainment experts which will openly and honestly answer questions from new members looking to maximize their Las Vegas experience.";

export default function SiteFooter({ showEventHelp = false }) {
  return (
    <>
      {showEventHelp && (
        <aside className="mx-auto max-w-[64rem] bg-black px-4 py-2 text-center text-lg font-medium text-white">
          Can&apos;t find the event you&apos;re looking for? Use our{" "}
          <a
            className="text-brand transition-colors hover:text-brand-strong hover:underline"
            href="https://lasvegasnightclubs.com/hosts/"
          >
            VIP host directory to contact the clubs directly.
          </a>
        </aside>
      )}

      <section className="border-t-4 border-brand bg-black px-5 pb-7 pt-12 text-[#eaeaea]">
        <div className="mx-auto grid max-w-[63.25rem] gap-10 md:grid-cols-3 md:gap-12">
          {testimonials.map(({ quote, author }) => (
            <blockquote key={author} className="m-0 text-[1.0625rem] leading-[1.35]">
              <span className="mb-1 block h-4 leading-none" aria-hidden="true">
                <i
                  className="fa fa-quote-left text-brand"
                  style={{ font: "normal normal normal 14px/1 FontAwesome" }}
                />
              </span>
              <span>{quote}</span>
              <cite className="mt-4 block not-italic text-[0.9375rem] text-brand">
                {author}
              </cite>
            </blockquote>
          ))}
        </div>

        <p className="mx-auto mb-0 mt-10 max-w-[63.25rem] border-t border-white/10 pt-8 text-justify text-xs leading-[1.5] text-muted">
          {legalCopy}
        </p>
      </section>

      <footer className="bg-brand px-5 py-5 text-[0.8125rem] font-semibold text-black">
        <p className="mx-auto mb-0 max-w-[63.25rem] text-center sm:text-left">
          ©All rights reserved. © 2026 Las Vegas Nightclubs, Inc.
        </p>
      </footer>
    </>
  );
}
