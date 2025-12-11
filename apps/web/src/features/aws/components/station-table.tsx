import type { AWSStation } from "../types";

interface StationTableProps {
  stations: AWSStation[];
}

export function StationTable({ stations }: StationTableProps) {
  if (stations.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-gray-300 p-12 text-center">
        <p className="text-gray-500">No stations found</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border border-gray-200">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
              Station
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
              City
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
              Province
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
              Type
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 bg-white">
          {stations.map((station) => (
            <tr key={station.stationId} className="hover:bg-gray-50">
              <td className="whitespace-nowrap px-4 py-3">
                <div>
                  <p className="font-medium text-gray-900">
                    {station.stationName}
                  </p>
                  <p className="text-sm text-gray-500">{station.stationId}</p>
                </div>
              </td>
              <td className="whitespace-nowrap px-4 py-3 text-gray-600">
                {station.city}
              </td>
              <td className="whitespace-nowrap px-4 py-3 text-gray-600">
                {station.province}
              </td>
              <td className="whitespace-nowrap px-4 py-3">
                <span className="inline-flex rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-800">
                  {station.type.toUpperCase()}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
