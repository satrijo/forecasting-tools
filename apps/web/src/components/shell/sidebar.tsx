import { Link } from "@tanstack/react-router";

const navItems = [
  { to: "/dashboard" as const, label: "Overview", icon: "📊" },
  { to: "/dashboard/aws" as const, label: "AWS Stations", icon: "🌤️" },
  { to: "/dashboard/public" as const, label: "Public Weather", icon: "☁️" },
  { to: "/dashboard/settings" as const, label: "Settings", icon: "⚙️" },
];

export function Sidebar() {
  return (
    <aside className="flex w-64 flex-col border-r border-gray-200 bg-white">
      {/* Logo */}
      <div className="flex h-16 items-center border-b border-gray-200 px-6">
        <Link to="/" className="text-xl font-bold text-gray-900">
          BMKG Dashboard
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-3 py-4">
        {navItems.map((item) => (
          <Link
            key={item.to}
            to={item.to}
            className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 [&.active]:bg-blue-50 [&.active]:text-blue-700"
          >
            <span>{item.icon}</span>
            {item.label}
          </Link>
        ))}
      </nav>

      {/* Back to home */}
      <div className="border-t border-gray-200 p-4">
        <Link
          to="/"
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700"
        >
          ← Back to Home
        </Link>
      </div>
    </aside>
  );
}
