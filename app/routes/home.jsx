/* oxlint-disable react/only-export-components -- React Router route modules export loaders with the component. */
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  Form,
  Link,
  useFetcher,
  useLoaderData,
  useNavigation,
  useSearchParams,
  useSubmit,
} from "react-router";
import {
  buildEventUrl,
  getEventDateValue,
  getEventTitle,
} from "../lib/event-url.js";
import EventImage from "../components/event-image.jsx";
import SiteFooter from "../components/site-footer.jsx";
import SiteHeader from "../components/site-header.jsx";

function EventCard({ event, eventPath, index, isNew }) {
  const eventTitle = getEventTitle(event);
  const venue = event.venue_name || event.venue;
  const category = event.category || event.type;

  return (
    <article
      className={`group grid h-full min-w-0 grid-cols-[5.5rem_minmax(0,1fr)] gap-x-3 gap-y-3 rounded-2xl border border-white/10 bg-black p-2.5 shadow-event transition duration-300 hover:-translate-y-1 hover:border-brand/40 hover:shadow-event-hover min-[30rem]:grid-cols-[5.75rem_minmax(0,1fr)_minmax(8.5rem,0.9fr)] sm:grid-cols-[5.25rem_minmax(0,1fr)] md:flex md:flex-col md:gap-0 ${isNew ? "event-reveal" : ""}`}
    >
      <Link
        className="relative col-start-1 row-start-1 block aspect-[4/5] w-full overflow-hidden rounded-xl bg-zinc-900 focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-brand-strong"
        to={eventPath}
        aria-label={`View details for ${eventTitle}`}
      >
        <EventImage
          className="size-full"
          imageClassName="size-full object-cover transition-transform duration-500 group-hover:scale-[1.025]"
          src={event.imageUrl}
          alt={`${eventTitle} at ${venue}`}
          category={category}
          width="600"
          height="750"
          loading={index === 0 ? "eager" : "lazy"}
          fetchPriority={index === 0 ? "high" : "auto"}
        />
      </Link>

      <div className="contents md:flex md:flex-1 md:flex-col md:rounded-xl md:px-1.5 md:pb-1">
        <div className="col-start-2 row-start-1 min-w-0 self-center py-1 md:block md:self-auto md:py-0 md:pt-3">
          <h3 className="mb-1 text-[0.7rem] font-bold uppercase leading-tight text-white xl:text-sm">
            <Link className="transition-colors hover:text-brand" to={eventPath}>
              {eventTitle}
            </Link>
          </h3>

          <p className="mb-0 text-[0.625rem] font-bold uppercase leading-snug text-white xl:text-[0.7rem]">
            {venue}
          </p>
          {event.hotel && (
            <p className="mb-0 text-[0.625rem] leading-snug text-muted xl:text-[0.7rem]">
              {event.hotel}
            </p>
          )}

          <p className="mb-0 mt-2 text-[0.625rem] leading-snug text-muted xl:text-[0.7rem]">
            <time dateTime={getEventDateValue(event.date)}>{event.date}</time>
            {event.time && <span> · {event.time}</span>}
          </p>

        </div>

        <div className="col-span-2 col-start-1 row-start-2 mt-auto min-[30rem]:col-span-1 min-[30rem]:col-start-3 min-[30rem]:row-start-1 min-[30rem]:self-center sm:col-span-2 sm:col-start-1 sm:row-start-2 sm:self-auto md:block md:w-full md:pt-3">
          <Link
            className="inline-flex min-h-9 w-full items-center justify-center rounded-lg bg-brand px-2 py-2 text-center text-[0.625rem] font-bold uppercase leading-none text-black transition-colors hover:bg-brand-strong hover:text-black focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-brand-strong xl:px-3 xl:text-[0.7rem]"
            to={eventPath}
          >
            View event details
          </Link>

          <div className="min-h-6 pt-2 text-center">
            {event.guestList && (
              <p className="mb-0 text-[0.6rem] font-bold uppercase text-white xl:text-[0.65rem]">
                <span aria-hidden="true">🔥</span> Free on guest list
              </p>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}

export async function loader({ request }) {
  const { getEventPage } = await import("../lib/events.server.js");
  return getEventPage(request);
}

export default function Home() {
  const loaderData = useLoaderData();
  const fetcher = useFetcher();
  const navigation = useNavigation();
  const submit = useSubmit();
  const [searchParams] = useSearchParams();
  const sentinelRef = useRef(null);
  const filterTimerRef = useRef(null);
  const loadedPageRef = useRef(loaderData.page);
  const [events, setEvents] = useState(loaderData.events);
  const [newEventIds, setNewEventIds] = useState(() => new Set());
  const [pagination, setPagination] = useState({
    hasMore: loaderData.hasMore,
    nextPage: loaderData.nextPage,
    nextCursor: loaderData.nextCursor,
  });

  useEffect(() => {
    setEvents(loaderData.events);
    setNewEventIds(new Set());
    setPagination({
      hasMore: loaderData.hasMore,
      nextPage: loaderData.nextPage,
      nextCursor: loaderData.nextCursor,
    });
    loadedPageRef.current = loaderData.page;
  }, [loaderData]);

  useEffect(() => {
    const nextBatch = fetcher.data;
    if (!nextBatch?.events || nextBatch.page <= loadedPageRef.current) return;

    const incomingIds = new Set(nextBatch.events.map(({ id }) => id));
    setEvents((currentEvents) => {
      const knownIds = new Set(currentEvents.map(({ id }) => id));
      return [
        ...currentEvents,
        ...nextBatch.events.filter(({ id }) => !knownIds.has(id)),
      ];
    });
    setNewEventIds(incomingIds);
    setPagination({
      hasMore: nextBatch.hasMore,
      nextPage: nextBatch.nextPage,
      nextCursor: nextBatch.nextCursor,
    });
    loadedPageRef.current = nextBatch.page;
  }, [fetcher.data]);

  useEffect(
    () => () => {
      if (filterTimerRef.current) clearTimeout(filterTimerRef.current);
    },
    [],
  );

  const submitFilters = useCallback(
    (event) => {
      const form = event.currentTarget;
      const delay = event.target.name === "q" ? 300 : 0;

      if (filterTimerRef.current) clearTimeout(filterTimerRef.current);
      filterTimerRef.current = setTimeout(() => {
        submit(form, { method: "get", replace: true, preventScrollReset: true });
      }, delay);
    },
    [submit],
  );

  const eventViewModels = useMemo(
    () =>
      events.map((event, index) => ({
        event,
        index,
        eventPath: buildEventUrl(event),
        isNew: newEventIds.has(event.id),
      })),
    [events, newEventIds],
  );

  const nextPageRequest = useMemo(() => {
    if (!pagination.hasMore || !pagination.nextPage) return null;

    const nextSearchParams = new URLSearchParams(searchParams);
    nextSearchParams.set("page", String(pagination.nextPage));
    if (pagination.nextCursor) {
      nextSearchParams.set("cursor", pagination.nextCursor);
    }

    const queryString = nextSearchParams.toString();
    return {
      pageHref: `/?${queryString}`,
      dataHref: `/resources/events?${queryString}`,
    };
  }, [pagination, searchParams]);

  const loadMoreEvents = useCallback(
    (event) => {
      event?.preventDefault();
      if (!nextPageRequest || fetcher.state !== "idle") return;
      fetcher.load(nextPageRequest.dataHref);
    },
    [fetcher, nextPageRequest],
  );

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel || !nextPageRequest) return undefined;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) loadMoreEvents();
      },
      { rootMargin: "400px 0px" },
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [loadMoreEvents, nextPageRequest]);

  const isLoadingMore = fetcher.state !== "idle";
  const isUpdatingFilters = navigation.state !== "idle";
  const eventCount = events.length;

  return (
    <div className="min-h-screen bg-night text-white">
      <a
        className="fixed left-3 top-3 z-50 -translate-y-40 rounded-lg bg-brand px-4 py-3 font-bold text-black transition-transform focus:translate-y-0"
        href="#main-content"
      >
        Skip to events
      </a>

      <SiteHeader />

      <main id="main-content" className="mx-auto max-w-6xl px-4 pb-16 pt-9">
        <section className="mb-8 text-center" aria-labelledby="page-title">
          <h1
            id="page-title"
            className="mb-0 text-2xl font-bold uppercase leading-[1.2] tracking-[-0.035em] text-white sm:text-[1.75rem]"
          >
            Las Vegas nightclub event calendar &amp; DJ schedule
          </h1>
        </section>

        <Form
          method="get"
          action="/"
          className="mb-8 rounded-2xl border border-white/10 bg-black/65 p-3 shadow-event sm:p-4"
          aria-label="Filter events"
          aria-busy={isUpdatingFilters}
          onChange={submitFilters}
          onSubmit={() => {
            if (filterTimerRef.current) clearTimeout(filterTimerRef.current);
          }}
        >
          <label className="mb-3 block">
            <span className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-soft">
              Search events
            </span>
            <input
              className="min-h-11 w-full rounded-xl border border-white/15 bg-night px-4 text-base text-white outline-none transition placeholder:text-muted/75 focus:border-brand focus:ring-2 focus:ring-brand/25"
              type="search"
              name="q"
              defaultValue={loaderData.filters.query}
              placeholder="Search by DJ, artist, venue, hotel, or category"
              autoComplete="off"
            />
          </label>

          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block">
              <span className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-soft">
                From date
              </span>
              <input
                className="min-h-11 w-full rounded-xl border border-white/15 bg-night px-4 text-base text-white outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/25"
                type="date"
                name="from"
                defaultValue={loaderData.filters.from}
              />
            </label>

            <label className="block">
              <span className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-soft">
                To date
              </span>
              <input
                className="min-h-11 w-full rounded-xl border border-white/15 bg-night px-4 text-base text-white outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/25"
                type="date"
                name="to"
                min={loaderData.filters.from}
                defaultValue={loaderData.filters.to}
              />
            </label>
          </div>

          <div className="mt-4 flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
            <fieldset
              className="w-full sm:w-auto"
              aria-label="Event type"
            >
              <legend className="sr-only">Event type</legend>
              <div className="grid w-full grid-cols-3 overflow-hidden rounded-lg border border-white/15 bg-night sm:w-[23rem]">
                {[
                  ["all", "All"],
                  ["nightclubs", "Nightclubs"],
                  ["dayclubs", "Dayclubs"],
                ].map(([value, label]) => (
                  <label
                    className="cursor-pointer border-r border-white/15 last:border-r-0"
                    key={value}
                  >
                    <input
                      className="peer sr-only"
                      type="radio"
                      name="clubType"
                      value={value}
                      defaultChecked={loaderData.filters.clubType === value}
                    />
                <span className="flex min-h-10 items-center justify-center px-3 text-center text-xs font-bold uppercase text-soft transition-colors hover:bg-white/5 peer-checked:bg-brand peer-checked:text-black peer-focus-visible:outline-2 peer-focus-visible:outline-offset-[-2px] peer-focus-visible:outline-brand">
                      {label}
                    </span>
                  </label>
                ))}
              </div>
            </fieldset>

            <div className="flex items-center gap-3">
              <span
                className="text-xs font-medium text-muted"
                role="status"
                aria-live="polite"
              >
                {isUpdatingFilters
                  ? "Updating events…"
                  : "Results update automatically"}
              </span>
              <Link
                className="text-sm font-bold uppercase text-muted transition-colors hover:text-white"
                to="/"
                reloadDocument
                onClick={() => {
                  if (filterTimerRef.current) clearTimeout(filterTimerRef.current);
                }}
              >
                Clear
              </Link>
              <button
                className="sr-only"
                type="submit"
              >
                Apply event filters
              </button>
            </div>
          </div>
        </Form>

        {loaderData.isMock && (
          <div
            className="mb-8 rounded-xl border border-brand/45 bg-brand/10 px-4 py-3 text-sm text-soft"
            role="status"
          >
            Notice: Displaying sample events from the simulated event service.
          </div>
        )}

        <section aria-labelledby="events-title">
          <div className="mb-6 flex items-end justify-between gap-4 border-b border-white/10 pb-4">
            <h2
              id="events-title"
              className="mb-0 text-2xl font-bold uppercase leading-tight text-white"
            >
              Upcoming events
            </h2>
            <p className="mb-0 shrink-0 text-xs font-bold uppercase text-muted">
              {loaderData.totalEvents}{" "}
              {loaderData.totalEvents === 1 ? "event" : "events"}
            </p>
          </div>

          {eventCount > 0 ? (
            <>
              <div className="grid grid-cols-1 gap-4 sm:mx-auto sm:max-w-[27rem] sm:grid-cols-2 md:max-w-[34rem] md:grid-cols-3 md:gap-8 lg:max-w-[54rem] lg:grid-cols-5 lg:gap-5 xl:max-w-none xl:gap-6">
                {eventViewModels.map(
                  ({ event, eventPath, index, isNew }) => (
                    <EventCard
                      key={event.id}
                      event={event}
                      eventPath={eventPath}
                      index={index}
                      isNew={isNew}
                    />
                  ),
                )}
              </div>

              <p className="sr-only" aria-live="polite">
                {isLoadingMore
                  ? "Loading more events"
                  : `Showing ${eventCount} of ${loaderData.totalEvents} events`}
              </p>
              {nextPageRequest && (
                <div ref={sentinelRef} className="flex justify-center py-10">
                  <Link
                    className="inline-flex min-h-11 items-center justify-center rounded-lg border border-brand px-6 py-2 text-sm font-bold uppercase text-brand transition-colors hover:bg-brand hover:text-black focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-brand-strong"
                    to={nextPageRequest.pageHref}
                    onClick={loadMoreEvents}
                    aria-disabled={isLoadingMore}
                  >
                    {isLoadingMore ? "Loading events…" : "Load more events"}
                  </Link>
                </div>
              )}
            </>
          ) : (
            <p className="rounded-xl border border-dashed border-white/10 p-8 text-center text-muted">
              No events match the selected filters.
            </p>
          )}
        </section>
      </main>

      <SiteFooter showEventHelp />
    </div>
  );
}
