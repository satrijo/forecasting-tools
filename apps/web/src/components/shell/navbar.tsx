import { Link } from "@tanstack/react-router";

export function Navbar() {
  return (
    <nav className="border-b border-gray-200 bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 justify-between">
          <div className="flex">
            {/* Logo */}
            <Link to="/" className="flex items-center">
              <span className="text-xl font-bold text-gray-900">
                BMKG Weather
              </span>
            </Link>

            {/* Navigation Links */}
            <div className="ml-10 flex items-center space-x-4">
              <Link
                to="/"
                className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 [&.active]:text-blue-600"
              >
                Home
              </Link>
              <Link
                to="/about"
                className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 [&.active]:text-blue-600"
              >
                About
              </Link>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
