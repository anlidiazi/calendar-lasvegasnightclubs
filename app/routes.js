import { index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.jsx"), // main route (/)
  route("events/:id", "routes/event-detail.jsx"), // Example of a dynamic route for events
];