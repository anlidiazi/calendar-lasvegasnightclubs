export async function loader({ request }) {
  const { getEventPage } = await import("../lib/events.server.js");
  return getEventPage(request);
}
