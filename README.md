# Las Vegas Nightclubs Event Calendar

SEO-oriented event discovery application for Las Vegas nightlife, nightclub,
dayclub, and pool party events. The application uses server-side rendering for
the initial result set and progressively loads additional events in the browser.

## Main features

- Server-side rendered event listing and event detail routes.
- Server-rendered Schema.org `Event` data in JSON-LD on every event detail page.
- Fuzzy server-side search by DJ, artist, venue, hotel, category, and city.
- Date range filters using Las Vegas local time for the default start date.
- Optional Nightclubs/Pool parties category filter.
- Hybrid pagination with an SSR first page and accessible infinite scrolling.
- Legacy-compatible event URLs and canonical redirects.
- Responsive event cards for mobile, tablet, and desktop layouts.
- Local branded fallbacks for missing or unavailable event images.
- Reduced-motion support, semantic markup, and keyboard-accessible controls.

## Technology and versions

The versions below are the versions currently installed by
`package-lock.json`.

| Library or tool | Version | Purpose |
| --- | ---: | --- |
| React | 19.2.8 | UI rendering and hydration |
| React DOM | 19.2.8 | Browser and server DOM integration |
| React Router | 8.3.0 | Framework routing, loaders, SSR, and data fetching |
| @react-router/dev | 8.3.0 | React Router development and build tooling |
| @react-router/node | 8.3.0 | Node.js SSR runtime |
| Vite | 8.2.1 | Development server and production bundling |
| Tailwind CSS | 4.3.3 | Utility-first styling and design tokens |
| @tailwindcss/vite | 4.3.3 | Tailwind integration for Vite |
| Fuse.js | 7.5.0 | Server-side fuzzy event search |
| isbot | 5.2.1 | Bot detection used by the SSR runtime |
| Oxlint | 1.78.0 | JavaScript and React linting |
| @vitejs/plugin-react | 6.0.5 | React integration for Vite |

> React Router 8.3.0 requires Node.js 22.22.0 or newer.

## Getting started

Install the locked dependency versions:

```bash
npm ci
```

Start the development server:

```bash
npm run dev
```

The default local URL is `http://localhost:5173`.

## Available scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the React Router development server |
| `npm run build` | Create the client and server production bundles |
| `npm run start` | Serve the generated SSR production build |
| `npm run typecheck` | Generate and validate React Router route types |
| `npm run lint` | Run Oxlint against the application and Vite configuration |

Run a production build locally:

```bash
npm run build
npm run start
```

Run the standard project checks before committing:

```bash
npm run lint
npm run typecheck
npm run build
```

## Application routes

| Route | Rendering and purpose |
| --- | --- |
| `/` | SSR event listing, filters, and progressive pagination |
| `/resources/events` | Data resource consumed by `useFetcher` |
| `/:eventSlug` | SSR event detail page with legacy URL validation |

## Event data architecture

The current server data layer is simulated in
`app/lib/events.server.js` and reads `app/data/events.json`.

The simulated service:

- Adds a 300 ms delay to emulate network latency.
- Filters the complete data set before pagination.
- Uses Fuse.js with a `0.35` threshold.
- Returns a strict maximum of 25 events per request.
- Sorts results by date, start time, and numeric ID.
- Excludes daylife events unless `includeDaylife=true`.

The flat pagination contract is:

```js
{
  events,
  page,
  limit,
  totalEvents,
  hasMore,
  nextPage,
  nextCursor,
  filters,
  isMock
}
```

`nextPage` supports accessible links and progressive enhancement.
`nextCursor` preserves compatibility with a future cursor-based
microservice.

## Search parameters

| Parameter | Description |
| --- | --- |
| `q` | Fuzzy search across DJ, artist, title, venue, hotel, category, and city |
| `from` | Inclusive start date in `YYYY-MM-DD` format |
| `to` | Optional inclusive end date in `YYYY-MM-DD` format |
| `includeDaylife` | Restrict results to Nightclubs and Pool Parties when `true`; all categories are shown by default |
| `page` | Accessible page number used by SSR fallback links |
| `cursor` | Cursor-compatible pagination value |

Search text is submitted after a 300 ms debounce. Date and category changes are
submitted immediately without a full page reload.

## SSR and infinite scrolling

The home loader renders the initial batch on the server. After hydration,
`useFetcher` requests `/resources/events` and appends additional batches to
local state.

An `IntersectionObserver` watches a sentinel at the end of the grid. The
sentinel contains a real **Load more events** link, so pagination remains
available when JavaScript is disabled or hydration has not completed.

New event cards use a fade-and-slide reveal only when
`prefers-reduced-motion: no-preference`.

## Event URLs

Event links preserve the legacy URL format:

```text
/:id-:title-:venue-:month-:ordinal-day-:year?source=all
```

Title segments separated by ` - ` retain the legacy triple-hyphen format:

```text
/26447-dj-buza---the-wednesday-dip-liquid-pool-august-19th-2026?source=all
```

Event detail loaders validate the numeric ID and redirect non-canonical slugs.

## Event structured data

Every `/:eventSlug` page renders a server-side
`<script type="application/ld+json">` block that describes the current event
using the Schema.org `Event` vocabulary. The markup includes the canonical event
URL, name, start date, status, attendance mode, venue, available address fields,
images, performer, and organizer.

Event times are converted from the display value, such as `10:30 PM`, to an
ISO-8601 value. The UTC offset is calculated for `America/Los_Angeles`, so
daylight saving time is represented as `-07:00` and standard time as `-08:00`
when appropriate.

Optional values are emitted only when the event service provides them:

| Event field | JSON-LD usage |
| --- | --- |
| `address` or `streetAddress` | `location.address.streetAddress` |
| `city` or `addressLocality` | `location.address.addressLocality` |
| `state` or `addressRegion` | `location.address.addressRegion` |
| `zip` or `postalCode` | `location.address.postalCode` |
| `endDate` and/or `endTime` | `endDate` |
| `guestListUrl` | Free guest-list `Offer` |
| `ticketUrl` and `ticketPrice` | Official ticket `Offer` |
| `description` | Event description |
| `organizerUrl` or `venueUrl` | Organizer URL |
| `imageUrls` or `flyerUrl` | Additional event images |

An offer is not generated unless it has a real guest-list or ticket URL. This
prevents the structured data from advertising an action that is not available
on the site.

During development, start the site and inspect any event detail page:

```bash
npm run dev
```

For deployed pages, validate the result with the
[Google Rich Results Test](https://search.google.com/test/rich-results) and the
[Schema.org Markup Validator](https://validator.schema.org/). Structured data
must always match the information visible on the event page.

## Responsive layout

Tailwind breakpoints are aligned with the existing calendar layout:

| Breakpoint | Event grid |
| --- | --- |
| Below 576 px | Horizontal single-column cards |
| 576–767 px | Two compact columns |
| 768–991 px | Three vertical columns |
| 992 px and above | Five vertical columns |
| 1200 px and above | Expanded five-column spacing |

Event titles are not truncated. Card actions remain vertically aligned within
each row.

## Image handling

`EventImage` displays the official local brand fallback when an event image:

- Has no URL.
- Returns an error after hydration.
- Fails before React has completed hydration.

The fallback preserves the image dimensions, category badge, accessible image
description, and rounded layout without requiring an external network request.

## Backend integration

`vite.config.js` currently proxies `/api` requests to
`http://localhost:3000`. The simulated loader does not call that endpoint yet.

When the external microservice is connected, replace the internals of
`getEventPage` and `getEventById` while preserving the existing response
contract. This allows the UI, SSR loaders, pagination links, and `useFetcher`
flow to remain unchanged.

## Project structure

```text
app/
  components/          Shared header, logo, and event image components
  data/events.json     Simulated event data
  lib/                 Event service, JSON-LD builder, and URL utilities
  routes/              Home, resource, and event detail routes
  index.css            Tailwind theme and shared visual rules
  root.tsx             Global HTML shell and metadata
public/
  images/brand/        Local brand assets
```

## Git workflow

Use descriptive branch prefixes:

- `feat/` for new functionality.
- `fix/` for corrections.
- `docs/` for documentation-only work.
- `chore/` for maintenance and tooling.

Code, UI text, metadata, comments, and project documentation are maintained in
English.
