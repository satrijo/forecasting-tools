import { StatCard } from "./components/stat-card";

export function OverviewPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">Overview</h1>
      <p className="mt-2 text-gray-600">
        Welcome to the BMKG Weather Dashboard
      </p>

      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total Stations" value="2,000+" icon="📡" />
        <StatCard title="AWS Stations" value="418" icon="🌤️" />
        <StatCard title="ARG Stations" value="754" icon="🌧️" />
        <StatCard title="Provinces" value="34" icon="🗺️" />
      </div>
    </div>
  );
}
