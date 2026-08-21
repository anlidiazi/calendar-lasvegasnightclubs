import { index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.jsx"),
  route("resources/events", "routes/events-resource.js"),
  route(":eventSlug", "routes/event-detail.jsx"),
];
