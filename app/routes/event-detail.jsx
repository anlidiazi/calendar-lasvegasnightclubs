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
import SiteFooter from "../components/site-footer.jsx";
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

export function meta({ loaderData }) {
  if (!loaderData?.event) {
    return [{ title: "Event not found | Las Vegas Nightclubs" }];
  }

  const title = getEventTitle(loaderData.event);
  const venue = loaderData.event.venue_name || loaderData.event.venue;
  const eventDate = formatEventDate(loaderData.event.date).replace(/,/g, "");

  return [
    { title: `${title} at ${venue} on ${eventDate}` },
    {
      name: "description",
      content: `View event details for ${title} at ${venue} on ${loaderData.event.date}.`,
    },
    { property: "og:title", content: `${title} at ${venue}` },
    { property: "og:url", content: loaderData.canonicalUrl },
  ];
}

function formatEventDate(date) {
  const dateValue = getEventDateValue(date);
  if (!dateValue) return date || "";

  return new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${dateValue}T00:00:00Z`));
}

function EventInfo({ event, title }) {
  const location = event.location || event.hotel || "";
  const address = event.address || "";
  const age = event.age || "";

  return (
    <section className="border border-white/10 bg-[#303030] p-4 sm:p-5" aria-labelledby="event-info-title">
      <h2 id="event-info-title" className="mb-2 text-2xl font-normal uppercase leading-tight text-white">
        {title}
      </h2>
      {event.guestList && (
        <p className="mb-2 inline-flex rounded-full bg-zinc-500 px-3 py-1 text-xs font-bold uppercase text-white">
          <span aria-hidden="true">🔥</span>&nbsp; Free on guest list
        </p>
      )}
      <dl className="space-y-0.5 text-[0.9375rem] leading-[1.45] text-white">
        <div><dt className="inline font-bold">Date: </dt><dd className="inline">{formatEventDate(event.date)}</dd></div>
        <div><dt className="inline font-bold">Location: </dt><dd className="inline">{location}</dd></div>
        <div><dt className="inline font-bold">Address: </dt><dd className="inline">{address}</dd></div>
        <div><dt className="inline font-bold">Start time: </dt><dd className="inline">{event.time || ""}</dd></div>
        <div><dt className="inline font-bold">Age: </dt><dd className="inline">{age}</dd></div>
      </dl>
    </section>
  );
}

function ActionPanel({
  title,
  children,
  buttonLabel,
  secondary = false,
  hoverTextOnly = false,
  buttonType = "button",
  buttonForm,
}) {
  return (
    <section className="border border-white/10 bg-black/40">
      {title && (
        <h2 className="bg-[#303030] px-5 py-3 text-[1.5rem] font-bold text-white">
          {title}
        </h2>
      )}
      <div className="px-5 py-5 text-center text-[0.9375rem] leading-[1.4] text-white sm:px-10">
        {children}
        <button
          type={buttonType}
          form={buttonForm}
          className={`mx-auto mt-4 block min-h-12 w-full rounded-[10px] px-5 py-3 text-[1.0625rem] font-bold uppercase transition-colors focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-brand-strong sm:max-w-[22rem] ${
            secondary
              ? "border-2 border-brand bg-transparent text-white hover:bg-brand hover:text-black"
              : `bg-brand text-black ${hoverTextOnly ? "hover:text-white" : "hover:bg-brand-strong"}`
          }`}
        >
          {buttonLabel}
        </button>
      </div>
    </section>
  );
}

function TableLocationsPanel() {
  return (
    <section className="border border-white/10 bg-black/40 p-4 sm:flex sm:items-center sm:gap-5 sm:px-5 sm:py-3">
      <p className="mb-0 min-w-0 flex-1 text-center text-xs leading-[1.4] text-white">
        Explore our interactive table options to compare locations, group sizes and starting minimums.
      </p>
      <button
        type="button"
        className="mt-4 min-h-9 w-full shrink-0 whitespace-nowrap rounded-[5px] border-2 border-brand bg-transparent px-3 py-2 text-xs font-bold uppercase text-white transition-colors hover:bg-brand hover:text-black focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-brand-strong sm:mt-0 sm:w-[15rem]"
      >
        View Table Locations &amp; Pricing
      </button>
    </section>
  );
}

function VipPanel({ event, venue }) {
  const formId = `vip-inquiry-${event.id}`;
  const fieldClassName =
    "block h-10 w-full rounded bg-[#303030] px-4 text-left text-[0.9375rem] text-[#dcdcdc] outline-none transition-[border-color,box-shadow] duration-150 ease-in-out placeholder:text-center placeholder:text-[#dcdcdc] focus:border-[#b6b6b6] focus:shadow-[0_0_0_0.25rem_#e7e7e7]";

  const fields = [
    {
      label: "Full Name",
      name: "fullName",
      type: "text",
      placeholder: "Full Name*",
      autoComplete: "name",
      required: true,
    },
    {
      label: "Cell Number",
      name: "phone",
      type: "tel",
      placeholder: "Cell Number*",
      autoComplete: "tel",
      pattern: "[0-9+()\\-\\s]{7,20}",
      title: "Enter a valid phone number",
      required: true,
    },
    {
      label: "Your Email",
      name: "email",
      type: "email",
      placeholder: "Your Email*",
      autoComplete: "email",
      required: true,
    },
    {
      label: "Choose Date",
      name: "date",
      type: "date",
      placeholder: "Choose Date*",
      min: getEventDateValue(event.date),
      required: true,
    },
    {
      label: "Your questions or details",
      name: "details",
      type: "text",
      placeholder: "Your questions or details",
    },
  ];

  return (
    <ActionPanel
      title="VIP Tables & Bottle Service"
      buttonLabel="Get Pricing & Availability"
      hoverTextOnly
      buttonType="submit"
      buttonForm={formId}
    >
      <p className="mb-5">
        Get official pricing, availability &amp; exclusive offers directly from {event.host || "an official VIP Host"} at {venue}.
      </p>
      <form
        id={formId}
        className="space-y-3 text-left sm:mx-auto sm:max-w-[31.5rem]"
        onSubmit={(submitEvent) => submitEvent.preventDefault()}
      >
        {fields.map(({ label, ...field }) => {
          const isDate = field.type === "date";

          return (
            <label className="relative block" key={field.name}>
              <span className="sr-only">{label}</span>
              <input
                className={`${fieldClassName} ${isDate ? "event-date-input peer invalid:text-transparent valid:text-left" : ""}`}
                aria-label={label}
                onFocus={
                  isDate
                    ? (focusEvent) => focusEvent.currentTarget.showPicker?.()
                    : undefined
                }
                {...field}
              />
              {isDate && (
                <span
                  className="pointer-events-none absolute inset-0 flex items-center justify-center text-[0.9375rem] text-[#dcdcdc] peer-valid:hidden"
                  aria-hidden="true"
                >
                  Choose Date*
                </span>
              )}
            </label>
          );
        })}
      </form>
      <p className="mt-5 mb-0 text-sm text-white">
        <span aria-hidden="true">✅</span> Verified &amp; employed by {event.hotel || venue}.
      </p>
    </ActionPanel>
  );
}

function TicketsPanel({ event }) {
  return (
    <ActionPanel
      title="Tickets"
      buttonLabel="Get Official Tickets"
      hoverTextOnly
    >
      <p className="mb-0 font-bold">
        {event.ticketPrice ? `Tickets from $${event.ticketPrice}.` : "Official event tickets and availability."}
      </p>
    </ActionPanel>
  );
}

function DescriptionPanel({ event, venue }) {
  const description = event.description || "";

  return (
    <section className="border border-white/10 bg-black/40">
      <h2 className="bg-[#303030] px-5 py-3 text-[1.5rem] font-bold text-white">Event Description</h2>
      <div className="space-y-5 px-5 py-6 text-[0.9375rem] leading-[1.45] text-[#dcdcdc]">
        {description ? <p className="m-0">{description}</p> : <p className="m-0"> </p>}
        <div>
          <h3 className="mb-1 text-[1.125rem] uppercase text-white">Dress Code</h3>
          <p className="m-0">{event.dressCode || ""}</p>
        </div>
        <div>
          <h3 className="mb-1 text-[1.125rem] uppercase text-white">Guest List</h3>
          <p className="m-0">{event.guestList ? `Guests can sign up for the ${venue} guest list.` : ""}</p>
        </div>
        <div>
          <h3 className="mb-1 text-[1.125rem] uppercase text-white">Bottle Service</h3>
          <p className="m-0">{event.bottleService || ""}</p>
        </div>
        <div>
          <h3 className="mb-1 text-[1.125rem] uppercase text-white">Tickets</h3>
          <p className="m-0">{event.ticketInfo || ""}</p>
        </div>
      </div>
    </section>
  );
}

export default function EventDetail() {
  const { event } = useLoaderData();
  const title = getEventTitle(event);
  const venue = event.venue_name || event.venue;

  return (
    <div className="min-h-screen bg-night text-white">
      <SiteHeader />

      <main className="mx-auto max-w-[64.625rem] px-6 py-6">
        <Link
          className="mb-7 inline-flex text-[1.125rem] font-bold uppercase leading-[1.2] text-white transition-colors hover:text-brand"
          to="/"
        >
          ◀ Return to all events.
        </Link>

        <h1 className="mb-1 text-[1.75rem] font-normal uppercase leading-tight text-white">
          {venue}
        </h1>

        <article className="grid gap-5 min-[48.0625rem]:grid-cols-[19.6875rem_minmax(0,1fr)] min-[48.0625rem]:items-start">
          <div className="order-2 flex flex-col gap-5 min-[48.0625rem]:order-1">
            <div className="order-1 min-[48.0625rem]:order-2">
              <EventInfo event={event} title={title} />
            </div>
            <div className="order-2 min-[48.0625rem]:order-1">
              <EventImage
                className="aspect-[4/5] rounded-xl border border-white/10"
                imageClassName="block size-full rounded-xl object-cover"
                src={event.imageUrl}
                alt={`${title} at ${venue}`}
                width="720"
                height="900"
                fetchPriority="high"
              />
            </div>
          </div>

          <div className="order-3 space-y-5 min-[48.0625rem]:order-2">
            {event.guestList && (
              <ActionPanel
                title="Join The Guest List"
                buttonLabel="Go To Guest List Sign Up"
                hoverTextOnly
              >
                Click the button below to join our FREE guest list at {venue}.
              </ActionPanel>
            )}
            <TableLocationsPanel />
            <VipPanel event={event} venue={venue} />
            <TicketsPanel event={event} />
            <DescriptionPanel event={event} venue={venue} />
          </div>
        </article>
      </main>
      <SiteFooter />
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
