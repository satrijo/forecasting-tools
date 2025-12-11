import { useQuery } from "@tanstack/react-query";
import { awsQueryOptions } from "./api/queries";
import { StationTable } from "./components/station-table";

export function AWSPage() {
  const { data, isLoading, error } = useQuery(awsQueryOptions());

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">AWS Stations</h1>
      <p className="mt-2 text-gray-600">
        Automatic Weather Station data from BMKG
      </p>

      <div className="mt-8">
        {isLoading && (
          <div className="rounded-lg border border-gray-200 p-12 text-center">
            <p className="text-gray-500">Loading stations...</p>
          </div>
        )}

        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4">
            <p className="text-red-700">Error: {error.message}</p>
          </div>
        )}

        {data && <StationTable stations={data.stations} />}
      </div>
    </div>
  );
}
