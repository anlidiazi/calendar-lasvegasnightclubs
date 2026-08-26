import {
  getEventDateValue,
  getEventTitle,
} from "./event-url.js";

const LAS_VEGAS_TIME_ZONE = "America/Los_Angeles";
const SCHEMA_ORG_URL = "https://schema.org";

function firstString(...values) {
  return values.find(
    (value) => typeof value === "string" && value.trim().length > 0,
  )?.trim();
}

function toAbsoluteUrl(value, baseUrl) {
  if (!value) return undefined;

  try {
    return new URL(value, baseUrl).href;
  } catch {
    return undefined;
  }
}

function parseClockTime(time = "") {
  const match = time.trim().match(
    /^(\d{1,2}):(\d{2})(?::(\d{2}))?\s*(AM|PM)?$/i,
  );
  if (!match) return undefined;

  const [, rawHour, rawMinute, rawSecond = "00", rawMeridiem] = match;
  let hour = Number(rawHour);
  const minute = Number(rawMinute);
  const second = Number(rawSecond);

  if (minute > 59 || second > 59) return undefined;

  if (rawMeridiem) {
    if (hour < 1 || hour > 12) return undefined;
    hour %= 12;
    if (rawMeridiem.toUpperCase() === "PM") hour += 12;
  } else if (hour > 23) {
    return undefined;
  }

  return `${String(hour).padStart(2, "0")}:${rawMinute}:${rawSecond}`;
}

function getLasVegasOffset(dateValue, timeValue) {
  const timeZoneName = new Intl.DateTimeFormat("en-US", {
    timeZone: LAS_VEGAS_TIME_ZONE,
    timeZoneName: "longOffset",
    hour: "2-digit",
  })
    .formatToParts(new Date(`${dateValue}T${timeValue}Z`))
    .find(({ type }) => type === "timeZoneName")?.value;
  const match = timeZoneName?.match(/^GMT([+-]\d{2}):?(\d{2})$/);

  return match ? `${match[1]}:${match[2]}` : "";
}

export function getEventSchemaDateTime(date, time) {
  if (/^\d{4}-\d{2}-\d{2}T/.test(date || "")) return date;

  const dateValue = getEventDateValue(date);
  if (!dateValue) return undefined;

  const timeValue = parseClockTime(time);
  if (!timeValue) return dateValue;

  return `${dateValue}T${timeValue}${getLasVegasOffset(dateValue, timeValue)}`;
}

function buildAddress(event) {
  return {
    "@type": "PostalAddress",
    ...(firstString(event.streetAddress, event.address) && {
      streetAddress: firstString(event.streetAddress, event.address),
    }),
    addressLocality: firstString(event.addressLocality, event.city) || "Las Vegas",
    addressRegion: firstString(event.addressRegion, event.state) || "NV",
    ...(firstString(event.postalCode, event.zip) && {
      postalCode: firstString(event.postalCode, event.zip),
    }),
    addressCountry: firstString(event.addressCountry, event.country) || "US",
  };
}

function buildOffers(event, canonicalUrl) {
  const offers = [];
  const guestListUrl = toAbsoluteUrl(
    firstString(event.guestListUrl, event.guest_list_url),
    canonicalUrl,
  );
  const ticketUrl = toAbsoluteUrl(
    firstString(event.ticketUrl, event.ticket_url),
    canonicalUrl,
  );

  if (event.guestList && guestListUrl) {
    offers.push({
      "@type": "Offer",
      name: "Free Guest List Available",
      price: "0",
      priceCurrency: "USD",
      url: guestListUrl,
      availability: `${SCHEMA_ORG_URL}/InStock`,
    });
  }

  if (ticketUrl) {
    offers.push({
      "@type": "Offer",
      name: "Official Tickets",
      ...(event.ticketPrice !== undefined && event.ticketPrice !== null && {
        price: String(event.ticketPrice),
        priceCurrency: firstString(event.priceCurrency) || "USD",
      }),
      url: ticketUrl,
      availability: firstString(event.ticketAvailability) ||
        `${SCHEMA_ORG_URL}/InStock`,
    });
  }

  if (offers.length === 0) return undefined;
  return offers.length === 1 ? offers[0] : offers;
}

function buildImages(event, canonicalUrl) {
  const candidates = [
    event.imageUrl,
    ...(Array.isArray(event.imageUrls) ? event.imageUrls : []),
    event.flyerUrl,
  ];
  const images = [
    ...new Set(
      candidates
        .map((image) => toAbsoluteUrl(image, canonicalUrl))
        .filter(Boolean),
    ),
  ];

  return images.length > 0 ? images : undefined;
}

export function buildEventJsonLd(event, canonicalUrl) {
  const title = getEventTitle(event);
  const venue = firstString(event.venue_name, event.venue);
  const performerName = firstString(event.performer, event.artist, event.dj);
  const organizerName = firstString(event.organizerName, event.organizer, venue);
  const organizerUrl = toAbsoluteUrl(
    firstString(event.organizerUrl, event.venueUrl),
    canonicalUrl,
  );
  const startDate = getEventSchemaDateTime(event.date, event.time);
  const endDate = event.endDate || event.endTime
    ? getEventSchemaDateTime(event.endDate || event.date, event.endTime)
    : undefined;
  const offers = buildOffers(event, canonicalUrl);
  const images = buildImages(event, canonicalUrl);
  const description = firstString(event.description);

  return {
    "@context": SCHEMA_ORG_URL,
    "@type": firstString(event.schemaType) || "Event",
    "@id": `${canonicalUrl}#event`,
    url: canonicalUrl,
    name: title,
    ...(startDate && { startDate }),
    ...(endDate && { endDate }),
    eventStatus: firstString(event.eventStatus) ||
      `${SCHEMA_ORG_URL}/EventScheduled`,
    eventAttendanceMode: firstString(event.eventAttendanceMode) ||
      `${SCHEMA_ORG_URL}/OfflineEventAttendanceMode`,
    ...(venue && {
      location: {
        "@type": "Place",
        name: venue,
        address: buildAddress(event),
      },
    }),
    ...(offers && { offers }),
    ...(images && { image: images }),
    ...(description && { description }),
    ...(performerName && {
      performer: {
        "@type": firstString(event.performerType) || "PerformingGroup",
        name: performerName,
      },
    }),
    ...(organizerName && {
      organizer: {
        "@type": "Organization",
        name: organizerName,
        ...(organizerUrl && { url: organizerUrl }),
      },
    }),
  };
}

export function serializeJsonLd(value) {
  return JSON.stringify(value)
    .replace(/</g, "\\u003c")
    .replace(/\u2028/g, "\\u2028")
    .replace(/\u2029/g, "\\u2029");
}
