import Fuse from "fuse.js";
import events from "../data/events.json";
import { getEventDateValue } from "./event-url.js";

export const EVENTS_PAGE_LIMIT = 25;
export const MOCK_NETWORK_DELAY = 300;

const searchKeys = [
  "artist",
  "dj",
  "eventName",
  "title",
  "venue",
  "venue_name",
  "hotel",
  "category",
  "type",
  "city",
];

const searchableEvents = events.map((event) =>
  Object.fromEntries(
    Object.entries(event).map(([key, value]) => [
      key,
      typeof value === "string" ? normalizeSearchValue(value) : value,
    ]),
  ),
);

const eventSearch = new Fuse(searchableEvents, {
  keys: searchKeys,
  threshold: 0.35,
  distance: 100,
  ignoreLocation: true,
  minMatchCharLength: 2,
});

function normalizeSearchValue(value = "") {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function delay(duration) {
  return new Promise((resolve) => setTimeout(resolve, duration));
}

function getLasVegasToday() {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Los_Angeles",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());
  const values = Object.fromEntries(parts.map(({ type, value }) => [type, value]));

  return `${values.year}-${values.month}-${values.day}`;
}

function getEventTimeValue(time = "") {
  const match = time.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (!match) return 0;

  const [, rawHour, rawMinute, meridiem] = match;
  let hour = Number(rawHour) % 12;
  if (meridiem.toUpperCase() === "PM") hour += 12;

  return hour * 60 + Number(rawMinute);
}

function compareEvents(left, right) {
  const dateComparison = (getEventDateValue(left.date) || "").localeCompare(
    getEventDateValue(right.date) || "",
  );
  if (dateComparison !== 0) return dateComparison;

  const timeComparison = getEventTimeValue(left.time) - getEventTimeValue(right.time);
  if (timeComparison !== 0) return timeComparison;

  return Number(left.id) - Number(right.id);
}

function isNightclubOrPoolPartyEvent(event) {
  const category = `${event.category || event.type || ""}`.toLowerCase();
  return category === "nightclub" || category === "nightclubs" ||
    category === "pool party" || category === "pool parties";
}

function getFuzzyEventIds(query) {
  const terms = (normalizeSearchValue(query).match(/[a-z0-9]+/g) || []).filter(
    (term) => term.length >= 2,
  );
  if (terms.length === 0) return null;

  return terms.reduce((matchingIds, term) => {
    const termIds = new Set(eventSearch.search(term).map(({ item }) => item.id));

    if (matchingIds === null) return termIds;
    return new Set([...matchingIds].filter((id) => termIds.has(id)));
  }, null);
}

export function getEventFilters(searchParams) {
  return {
    query: searchParams.get("q")?.trim() || "",
    from: searchParams.get("from") || getLasVegasToday(),
    to: searchParams.get("to") || "",
    includeDaylife: searchParams.get("includeDaylife") === "true",
  };
}

export function getFilteredEvents(filters) {
  const fuzzyEventIds = getFuzzyEventIds(filters.query);

  return events
    .filter(
      (event) =>
        !filters.includeDaylife || isNightclubOrPoolPartyEvent(event),
    )
    .filter((event) => !fuzzyEventIds || fuzzyEventIds.has(event.id))
    .filter((event) => {
      const date = getEventDateValue(event.date);
      if (!date) return false;
      if (filters.from && date < filters.from) return false;
      if (filters.to && date > filters.to) return false;
      return true;
    })
    .toSorted(compareEvents);
}

export async function getEventPage(request) {
  const url = new URL(request.url);
  const rawPage = Number.parseInt(url.searchParams.get("page") || "1", 10);
  const page = Number.isFinite(rawPage) && rawPage > 0 ? rawPage : 1;
  const filters = getEventFilters(url.searchParams);

  await delay(MOCK_NETWORK_DELAY);

  const filteredEvents = getFilteredEvents(filters);
  const startIndex = (page - 1) * EVENTS_PAGE_LIMIT;
  const pageEvents = filteredEvents.slice(startIndex, startIndex + EVENTS_PAGE_LIMIT);
  const hasMore = startIndex + EVENTS_PAGE_LIMIT < filteredEvents.length;
  const nextPage = hasMore ? page + 1 : null;

  return {
    events: pageEvents,
    page,
    limit: EVENTS_PAGE_LIMIT,
    totalEvents: filteredEvents.length,
    hasMore,
    nextPage,
    nextCursor: nextPage ? String(nextPage) : null,
    filters,
    isMock: true,
  };
}

export async function getEventById(id) {
  await delay(MOCK_NETWORK_DELAY);
  return events.find((event) => event.id === Number(id)) || null;
}
