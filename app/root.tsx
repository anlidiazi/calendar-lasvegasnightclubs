import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "react-router";

// Import global styles
import "./index.css";

export function meta() {
  return [
    { title: "Las Vegas Nightclubs & Daily Events Calendar" },
    { name: "description", content: "Discover the best nightlife, pool parties, top DJs, and daily events in Las Vegas." },
    { name: "viewport", content: "width=device-width, initial-scale=1" },
  ];
}

export default function App() {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <link rel="icon" href="data:image/x-icon;base64,=" /> {/* Prevent favicon 404 */}
        <Meta />
        <Links />
      </head>
      <body className="bg-slate-900 text-white min-h-screen">
        <Outlet />
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}