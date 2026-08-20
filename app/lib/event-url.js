const shortMonthNames = {
  Jan: "january",
  Feb: "february",
  Mar: "march",
  Apr: "april",
  May: "may",
  Jun: "june",
  Jul: "july",
  Aug: "august",
  Sep: "september",
  Oct: "october",
  Nov: "november",
  Dec: "december",
};

function slugify(value = "") {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[’']/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function slugifyLegacyTitle(value = "") {
  return value
    .split(/\s+-\s+/)
    .map(slugify)
    .filter(Boolean)
    .join("---");
}

function getOrdinalSuffix(day) {
  const remainder = day % 100;

  if (remainder >= 11 && remainder <= 13) return "th";
  if (day % 10 === 1) return "st";
  if (day % 10 === 2) return "nd";
  if (day % 10 === 3) return "rd";
  return "th";
}

export function getEventDateParts(date = "") {
  const isoMatch = date.match(/^(\d{4})-(\d{2})-(\d{2})$/);

  if (isoMatch) {
    const [, rawYear, rawMonth, rawDay] = isoMatch;
    const year = Number(rawYear);
    const monthIndex = Number(rawMonth) - 1;
    const day = Number(rawDay);
    const parsedDate = new Date(Date.UTC(year, monthIndex, day));
    const month = Object.values(shortMonthNames)[monthIndex];

    if (
      !month ||
      parsedDate.getUTCFullYear() !== year ||
      parsedDate.getUTCMonth() !== monthIndex ||
      parsedDate.getUTCDate() !== day
    ) {
      return null;
    }

    return { month, day, year };
  }

  const match = date.match(
    /^(?:[A-Za-z]+,\s*)?([A-Za-z]{3,9})\s+(\d{1,2}),\s*(\d{4})$/,
  );

  if (!match) return null;

  const [, rawMonth, rawDay, year] = match;
  const shortMonth = rawMonth.slice(0, 3);
  const month = shortMonthNames[
    `${shortMonth[0]?.toUpperCase()}${shortMonth.slice(1).toLowerCase()}`
  ];

  if (!month) return null;

  return { month, day: Number(rawDay), year: Number(year) };
}

export function getEventDateValue(date = "") {
  const parts = getEventDateParts(date);
  if (!parts) return undefined;

  const shortMonth = Object.entries(shortMonthNames).find(
    ([, month]) => month === parts.month,
  )?.[0];
  const monthIndex = Object.keys(shortMonthNames).indexOf(shortMonth);
  if (monthIndex < 0) return undefined;

  return `${parts.year}-${String(monthIndex + 1).padStart(2, "0")}-${String(
    parts.day,
  ).padStart(2, "0")}`;
}

export function getEventTitle(event) {
  if (event.title) return event.title;

  if (event.artist && event.eventName) {
    const artistSlug = slugify(event.artist);
    const eventNameSlug = slugify(event.eventName);
    return eventNameSlug.startsWith(artistSlug)
      ? event.eventName
      : `${event.artist} - ${event.eventName}`;
  }

  return event.eventName || event.artist || "event";
}

export function buildEventSlug(event) {
  const title = getEventTitle(event);
  const venue = event.venue_name || event.venue || "las-vegas";
  const date = getEventDateParts(event.date);
  const dateSlug = date
    ? `${date.month}-${date.day}${getOrdinalSuffix(date.day)}-${date.year}`
    : "date-to-be-announced";

  return `${event.id}-${slugifyLegacyTitle(title)}-${slugify(venue)}-${dateSlug}`;
}

export function buildEventUrl(event, source = "all") {
  return `/${buildEventSlug(event)}?source=${encodeURIComponent(source)}`;
}
