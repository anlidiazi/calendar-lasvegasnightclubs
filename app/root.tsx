/* oxlint-disable react/only-export-components -- React Router root modules export route metadata with the component. */
import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "react-router";

import "font-awesome/css/font-awesome.min.css";
import "./index.css";

export const links = () => [
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  {
    rel: "preconnect",
    href: "https://fonts.gstatic.com",
    crossOrigin: "anonymous",
  },
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap",
  },
];

export function meta() {
  return [
    { title: "Las Vegas Nightclubs & Daily Events Calendar" },
    {
      name: "description",
      content:
        "Discover the best nightlife, pool parties, top DJs, and daily events in Las Vegas.",
    },
    { name: "viewport", content: "width=device-width, initial-scale=1" },
  ];
}

export default function App() {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <link rel="icon" href="data:image/x-icon;base64,=" />
        <Meta />
        <Links />
      </head>
      <body>
        <Outlet />
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}
