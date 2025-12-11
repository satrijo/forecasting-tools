interface StatCardProps {
  title: string;
  value: string;
  icon: string;
}

export function StatCard({ title, value, icon }: StatCardProps) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6">
      <div className="flex items-center gap-4">
        <span className="text-3xl">{icon}</span>
        <div>
          <p className="text-sm text-gray-500">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
      </div>
    </div>
  );
}
