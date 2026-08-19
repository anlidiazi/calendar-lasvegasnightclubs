import { useLoaderData } from "react-router";

// Server-side loader fetching event data from microservice with fallback
export async function loader() {
  const baseUrl = process.env.VITE_MICROSERVICE_URL || "http://localhost:3000";
  
  try {
    const res = await fetch(`${baseUrl}/api/events`);
    if (res.ok) {
      const events = await res.json();
      return { events, isMock: false };
    }
  } catch (error) {
    // Microservice is offline or unreachable
    console.warn("Microservice unreachable. Loading fallback mock data.");
  }

  // Temporary mock data for UI testing
  return {
    events: [
      { id: "1", title: "Calvin Harris - Omnia Nightclub", date: "Tonight", venue: "Caesars Palace" },
      { id: "2", title: "The Chainsmokers - XS Nightclub", date: "Tomorrow", venue: "Wynn Las Vegas" },
    ],
    isMock: true,
  };
}

// UI component
export default function Home() {
  const { events, isMock } = useLoaderData();

  return (
    <main className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-2">Las Vegas Events Calendar</h1>
      
      {isMock && (
        <div className="mb-4 p-3 bg-amber-900/40 border border-amber-600/50 rounded-lg text-amber-300 text-sm">
          Notice: Microservice is offline. Displaying fallback mock data.
        </div>
      )}

      <div className="grid gap-4">
        {events && events.length > 0 ? (
          events.map((event) => (
            <article key={event.id} className="border border-slate-700 p-4 rounded-lg bg-slate-800 shadow-sm">
              <h2 className="text-xl font-semibold text-white">{event.title}</h2>
              <p className="text-slate-400">{event.date} - {event.venue}</p>
            </article>
          ))
        ) : (
          <p className="text-slate-400">No events available at the moment.</p>
        )}
      </div>
    </main>
  );
}