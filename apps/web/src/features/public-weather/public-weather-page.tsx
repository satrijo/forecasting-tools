export function PublicWeatherPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">Public Weather</h1>
      <p className="mt-2 text-gray-600">
        Public weather forecast data from BMKG
      </p>

      <div className="mt-8 rounded-lg border border-dashed border-gray-300 p-12 text-center">
        <p className="text-gray-500">
          Public weather data will be displayed here
        </p>
        <p className="mt-2 text-sm text-gray-400">
          Use TanStack Query to fetch from /api/public/weather
        </p>
      </div>
    </div>
  );
}
