interface SettingSectionProps {
  title: string;
  children: React.ReactNode;
}

function SettingSection({ title, children }: SettingSectionProps) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6">
      <h2 className="text-lg font-medium text-gray-900">{title}</h2>
      <div className="mt-4">{children}</div>
    </div>
  );
}

export function SettingsPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
      <p className="mt-2 text-gray-600">Configure your dashboard preferences</p>

      <div className="mt-8 max-w-2xl space-y-6">
        <SettingSection title="API Configuration">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                API Base URL
              </label>
              <input
                type="text"
                defaultValue="http://localhost:3000"
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>
        </SettingSection>

        <SettingSection title="Display">
          <div className="space-y-4">
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                className="h-4 w-4 rounded border-gray-300"
              />
              <span className="text-sm text-gray-700">
                Show station coordinates
              </span>
            </label>
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                defaultChecked
                className="h-4 w-4 rounded border-gray-300"
              />
              <span className="text-sm text-gray-700">
                Auto-refresh data every 10 minutes
              </span>
            </label>
          </div>
        </SettingSection>
      </div>
    </div>
  );
}
