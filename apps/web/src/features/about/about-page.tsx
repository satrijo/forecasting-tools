export function AboutPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold text-gray-900">About</h1>
      <p className="mt-4 text-gray-600">
        BMKG Weather Tools is a collection of utilities for fetching and
        visualizing weather data from BMKG (Indonesian Meteorology Agency).
      </p>
      <div className="mt-8">
        <h2 className="text-xl font-semibold text-gray-900">Features</h2>
        <ul className="mt-4 list-inside list-disc space-y-2 text-gray-600">
          <li>Real-time weather data from 2000+ stations</li>
          <li>Support for AWS, ARG, AAWS, ASRS, Soil, and Iklimmikro stations</li>
          <li>GeoJSON export for mapping applications</li>
          <li>Filter by province, city, or radius</li>
        </ul>
      </div>
    </div>
  );
}
