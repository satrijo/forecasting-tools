import { Link } from "@tanstack/react-router";

export function HomePage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
          BMKG Weather Tools
        </h1>
        <p className="mt-4 text-lg text-gray-600">
          Real-time weather data from Indonesian meteorological stations
        </p>
        <div className="mt-8 flex justify-center gap-4">
          <Link
            to="/dashboard"
            className="rounded-lg bg-blue-600 px-6 py-3 text-white hover:bg-blue-700"
          >
            Open Dashboard
          </Link>
          <Link
            to="/about"
            className="rounded-lg border border-gray-300 px-6 py-3 text-gray-700 hover:bg-gray-50"
          >
            Learn More
          </Link>
        </div>
      </div>
    </div>
  );
}
