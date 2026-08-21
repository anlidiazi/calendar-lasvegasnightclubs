/* oxlint-disable react/only-export-components -- React Router route modules export loaders and metadata with the component. */
import {
  Link,
  isRouteErrorResponse,
  redirect,
  useLoaderData,
  useRouteError,
} from "react-router";
import {
  buildEventSlug,
  buildEventUrl,
  getEventDateValue,
  getEventTitle,
} from "../lib/event-url.js";
import EventImage from "../components/event-image.jsx";
import SiteHeader from "../components/site-header.jsx";

export async function loader({ params, request }) {
  const id = params.eventSlug?.match(/^(\d+)-/)?.[1];
  if (!id) throw new Response("Event not found", { status: 404 });

  const { getEventById } = await import("../lib/events.server.js");
  const event = await getEventById(id);
  if (!event) throw new Response("Event not found", { status: 404 });

  const canonicalSlug = buildEventSlug(event);
  const url = new URL(request.url);
  const source = url.searchParams.get("source") || "all";

  if (params.eventSlug !== canonicalSlug || !url.searchParams.has("source")) {
    return redirect(buildEventUrl(event, source), 301);
  }

  return {
    event,
    canonicalUrl: `${url.origin}/${canonicalSlug}`,
    source,
  };
}

export function meta({ data }) {
  if (!data?.event) {
    return [{ title: "Event not found | Las Vegas Nightclubs" }];
  }

  const title = getEventTitle(data.event);
  const venue = data.event.venue_name || data.event.venue;

  return [
    { title: `${title} at ${venue} | Las Vegas Nightclubs` },
    {
      name: "description",
      content: `View event details for ${title} at ${venue} on ${data.event.date}.`,
    },
    { property: "og:title", content: `${title} at ${venue}` },
    { property: "og:url", content: data.canonicalUrl },
  ];
}

export default function EventDetail() {
  const { event } = useLoaderData();
  const title = getEventTitle(event);
  const venue = event.venue_name || event.venue;
  const category = event.category || event.type;

  return (
    <div className="min-h-screen bg-night text-white">
      <SiteHeader />

      <main className="mx-auto max-w-5xl px-4 py-10 sm:py-16">
        <Link
          className="mb-6 inline-flex text-sm font-bold uppercase text-brand transition-colors hover:text-brand-strong"
          to="/"
        >
          ← Back to all events
        </Link>

        <article className="grid overflow-hidden rounded-2xl border border-white/10 bg-black shadow-event md:grid-cols-[minmax(18rem,0.85fr)_minmax(0,1.15fr)]">
          <EventImage
            className="min-h-96"
            imageClassName="size-full object-cover"
            src={event.imageUrl}
            alt={`${title} at ${venue}`}
            width="720"
            height="900"
            fetchPriority="high"
          />

          <div className="flex flex-col justify-center p-6 sm:p-10">
            {category && (
              <p className="mb-3 text-xs font-bold uppercase tracking-[0.16em] text-brand">
                {category}
              </p>
            )}
            <h1 className="mb-5 text-3xl font-bold uppercase leading-tight tracking-[-0.03em] text-white sm:text-5xl">
              {title}
            </h1>

            <dl className="grid gap-5 border-y border-white/10 py-6 text-sm sm:grid-cols-2">
              <div>
                <dt className="mb-1 text-xs font-bold uppercase tracking-wider text-muted">
                  Venue
                </dt>
                <dd className="m-0 font-bold text-white">{venue}</dd>
              </div>
              {event.hotel && (
                <div>
                  <dt className="mb-1 text-xs font-bold uppercase tracking-wider text-muted">
                    Hotel
                  </dt>
                  <dd className="m-0 font-bold text-white">{event.hotel}</dd>
                </div>
              )}
              <div>
                <dt className="mb-1 text-xs font-bold uppercase tracking-wider text-muted">
                  Date
                </dt>
                <dd className="m-0 font-bold text-white">
                  <time dateTime={getEventDateValue(event.date)}>{event.date}</time>
                </dd>
              </div>
              {event.time && (
                <div>
                  <dt className="mb-1 text-xs font-bold uppercase tracking-wider text-muted">
                    Start time
                  </dt>
                  <dd className="m-0 font-bold text-white">{event.time}</dd>
                </div>
              )}
            </dl>

            {event.guestList && (
              <p className="mb-0 mt-3 text-sm font-bold uppercase text-white">
                <span aria-hidden="true">🔥</span> Free on guest list
              </p>
            )}
          </div>
        </article>
      </main>
    </div>
  );
}

export function ErrorBoundary() {
  const error = useRouteError();
  const notFound = isRouteErrorResponse(error) && error.status === 404;

  return (
    <main className="grid min-h-screen place-items-center bg-night px-4 text-center text-white">
      <div>
        <p className="mb-3 text-sm font-bold uppercase tracking-wider text-brand">
          {notFound ? "404" : "Error"}
        </p>
        <h1 className="mb-4 text-4xl font-bold uppercase">
          {notFound ? "Event not found" : "Unable to load this event"}
        </h1>
        <Link className="font-bold uppercase text-brand hover:text-brand-strong" to="/">
          Return to the event calendar
        </Link>
      </div>
    </main>
  );
}
