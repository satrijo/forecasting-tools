import React from "react";

const MapSection: React.FC = () => {
  return (
    <section className="w-full py-12 lg:py-16 px-4 sm:px-10 lg:px-40 bg-white dark:bg-background-dark">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col md:flex-row items-start md:items-end justify-between mb-10 gap-6">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <span className="bg-teal-100 text-teal-600 dark:bg-teal-900/30 dark:text-teal-400 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                Peta Interaktif
              </span>
            </div>
            <h2 className="text-3xl font-bold text-[#0d141b] dark:text-white">
              Sistem Informasi Geospasial
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mt-2 max-w-2xl">
              Lihat kondisi cuaca secara visual melalui citra satelit, radar hujan, dan peta potensi bencana.
            </p>
          </div>
          <div className="flex gap-2 bg-slate-100 dark:bg-gray-800 p-1 rounded-lg">
            <button className="px-4 py-2 bg-white dark:bg-gray-700 shadow-sm rounded-md text-sm font-bold text-primary">
              Jawa Tengah
            </button>
            <button className="px-4 py-2 hover:bg-white dark:hover:bg-gray-700 rounded-md text-sm font-medium text-gray-600 dark:text-gray-300 transition-colors">
              Indonesia
            </button>
            <button className="px-4 py-2 hover:bg-white dark:hover:bg-gray-700 rounded-md text-sm font-medium text-gray-600 dark:text-gray-300 transition-colors">
              ASEAN
            </button>
          </div>
        </div>
        <div className="relative w-full h-[600px] rounded-2xl overflow-hidden shadow-xl border border-gray-200 dark:border-gray-700 bg-slate-900 group">
          <div
            className="absolute inset-0 bg-cover bg-center opacity-80"
            style={{
              backgroundImage:
                'url("https://lh3.googleusercontent.com/aida-public/AB6AXuBWLYSz-V--h7Z5jUgXwY055liwrkjzRVVUQbVQMR9RRjUSu7ho-jAG3LLzGjNOqWjwn3WXqXqsLBqePUnYdGPHH78O1YN28jNIGjH3xX-NwbXpdIIiIdb9uSghNbSowu0wz6y15kCTUAoJjNeUXemvyAeJvuV1pcUjkqyQ5SYqLju7yx-TfYdUTCew3tCwgdVk0EtwBYuVLjJmM5cSrYqP0jkLnM-aA4fSLo5bbxX5xGteUcE9eubSNDIyYtOHZ5WNRjefNhFqmV8")',
            }}
          ></div>
          <div className="absolute top-6 left-6 w-64 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm p-4 rounded-xl shadow-lg border border-white/20">
            <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">
                layers
              </span>{" "}
              Layer Data
            </h4>
            <div className="space-y-2">
              {[
                {
                  label: "Citra Satelit IR",
                  sub: "Awan & Suhu Puncak",
                  checked: true,
                },
                {
                  label: "Radar Hujan",
                  sub: "Intensitas Presipitasi",
                  checked: true,
                },
                {
                  label: "Vektor Angin",
                  sub: "Arah & Kecepatan",
                  checked: false,
                },
                {
                  label: "Isobar (Tekanan)",
                  sub: "Garis Tekanan Udara",
                  checked: false,
                },
              ].map((layer, idx) => (
                <label
                  key={idx}
                  className="flex items-center gap-3 p-2 hover:bg-slate-50 dark:hover:bg-gray-800 rounded-lg cursor-pointer"
                >
                  <input
                    defaultChecked={layer.checked}
                    className="form-checkbox text-primary rounded border-gray-300 focus:ring-primary h-4 w-4"
                    type="checkbox"
                  />
                  <div className="text-sm">
                    <p className="font-medium text-gray-800 dark:text-gray-200">
                      {layer.label}
                    </p>
                    <p className="text-xs text-gray-500">{layer.sub}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>
          <div className="absolute bottom-6 right-6 flex flex-col gap-2">
            <button className="bg-white dark:bg-gray-800 text-gray-700 dark:text-white p-2 rounded-lg shadow-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
              <span className="material-symbols-outlined">my_location</span>
            </button>
            <div className="flex flex-col bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
              <button className="p-2 hover:bg-gray-50 dark:hover:bg-gray-700 border-b border-gray-100 dark:border-gray-700 text-gray-700 dark:text-white">
                <span className="material-symbols-outlined">add</span>
              </button>
              <button className="p-2 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-white">
                <span className="material-symbols-outlined">remove</span>
              </button>
            </div>
          </div>
          <div className="absolute bottom-6 left-6 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm px-4 py-3 rounded-lg shadow-lg">
            <p className="text-xs font-bold text-gray-600 dark:text-gray-300 mb-2 uppercase">
              Intensitas Hujan (dBZ)
            </p>
            <div className="flex items-center gap-1">
              <span className="text-[10px] text-gray-500">Ringan</span>
              <div className="h-2 w-32 rounded-full bg-gradient-to-r from-green-300 via-yellow-400 to-red-600"></div>
              <span className="text-[10px] text-gray-500">Ekstrem</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default MapSection;
