import React from "react";

const Stats: React.FC = () => {
  return (
    <section className="w-full py-12 lg:py-16 px-4 sm:px-10 lg:px-40 bg-slate-50 dark:bg-gray-900/50">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col md:flex-row items-start md:items-end justify-between mb-10 gap-6">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <span className="bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                Statistik Layanan
              </span>
              <span className="flex items-center gap-2 text-gray-500 text-xs font-medium dark:text-gray-400">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                </span>
                Monitoring Aktif
              </span>
            </div>
            <h2 className="text-3xl font-bold text-[#0d141b] dark:text-white">
              Jangkauan Operasional
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mt-2 max-w-2xl">
              BMKG Cilacap melayani informasi cuaca untuk keselamatan transportasi dan aktivitas masyarakat di Jawa Tengah bagian selatan.
            </p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Stat 1 */}
          <div className="group relative h-72 rounded-2xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm hover:shadow-lg transition-all duration-500 cursor-default">
            <div className="absolute -right-10 -top-10 size-40 bg-blue-100 dark:bg-blue-900/30 rounded-full blur-3xl opacity-50 group-hover:bg-blue-500 transition-colors duration-500"></div>
            <div className="absolute inset-0 flex flex-col items-center justify-center p-6 transition-all duration-500 group-hover:opacity-0 group-hover:scale-90">
              <div className="mb-6 p-4 bg-white dark:bg-gray-700 rounded-2xl shadow-sm text-blue-600 dark:text-blue-400 ring-1 ring-gray-100 dark:ring-gray-600">
                <span className="material-symbols-outlined text-4xl">
                  flight_takeoff
                </span>
              </div>
              <h3 className="text-6xl font-black text-[#0d141b] dark:text-white tracking-tighter mb-1">
                2
              </h3>
              <p className="text-lg font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">
                Bandara
              </p>
            </div>
            <div className="absolute inset-0 bg-blue-600 flex flex-col items-center justify-center p-8 text-center opacity-0 translate-y-8 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500">
              <span className="material-symbols-outlined text-white text-5xl mb-4">
                connecting_airports
              </span>
              <h4 className="text-white font-bold text-xl mb-4">
                Wilayah Bandara
              </h4>
              <ul className="text-blue-50 space-y-2 text-sm font-medium w-full">
                <li className="py-2 border-b border-blue-500/50 w-full">
                  Tunggul Wulung (Cilacap)
                </li>
                <li className="py-2 w-full">Nusawiru (Pangandaran)</li>
              </ul>
            </div>
          </div>
          {/* Stat 2 */}
          <div className="group relative h-72 rounded-2xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm hover:shadow-lg transition-all duration-500 cursor-default">
            <div className="absolute -right-10 -top-10 size-40 bg-teal-100 dark:bg-teal-900/30 rounded-full blur-3xl opacity-50 group-hover:bg-teal-500 transition-colors duration-500"></div>
            <div className="absolute inset-0 flex flex-col items-center justify-center p-6 transition-all duration-500 group-hover:opacity-0 group-hover:scale-90">
              <div className="mb-6 p-4 bg-white dark:bg-gray-700 rounded-2xl shadow-sm text-teal-600 dark:text-teal-400 ring-1 ring-gray-100 dark:ring-gray-600">
                <span className="material-symbols-outlined text-4xl">
                  anchor
                </span>
              </div>
              <h3 className="text-6xl font-black text-[#0d141b] dark:text-white tracking-tighter mb-1">
                4
              </h3>
              <p className="text-lg font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">
                Pelabuhan
              </p>
            </div>
            <div className="absolute inset-0 bg-teal-600 flex flex-col items-center justify-center p-8 text-center opacity-0 translate-y-8 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500">
              <span className="material-symbols-outlined text-white text-5xl mb-2">
                tsunami
              </span>
              <h4 className="text-white font-bold text-xl mb-4">
                Zona Maritim
              </h4>
              <div className="text-teal-50 text-sm font-medium w-full space-y-3">
                <p className="leading-snug">
                  Meliputi 4 Pelabuhan Utama
                  <br />
                  <span className="text-xs opacity-75">
                    (Termasuk Tj. Intan)
                  </span>
                </p>
                <div className="w-16 h-px bg-white/20 mx-auto"></div>
                <p className="leading-snug">
                  3 Wilayah Perairan
                  <br />
                  <span className="text-xs opacity-75">
                    (Cilacap, Kebumen, Purworejo)
                  </span>
                </p>
              </div>
            </div>
          </div>
          {/* Stat 3 */}
          <div className="group relative h-72 rounded-2xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm hover:shadow-lg transition-all duration-500 cursor-default">
            <div className="absolute -right-10 -top-10 size-40 bg-indigo-100 dark:bg-indigo-900/30 rounded-full blur-3xl opacity-50 group-hover:bg-indigo-500 transition-colors duration-500"></div>
            <div className="absolute inset-0 flex flex-col items-center justify-center p-6 transition-all duration-500 group-hover:opacity-0 group-hover:scale-90">
              <div className="mb-6 p-4 bg-white dark:bg-gray-700 rounded-2xl shadow-sm text-indigo-600 dark:text-indigo-400 ring-1 ring-gray-100 dark:ring-gray-600">
                <span className="material-symbols-outlined text-4xl">
                  share_location
                </span>
              </div>
              <h3 className="text-6xl font-black text-[#0d141b] dark:text-white tracking-tighter mb-1">
                5
              </h3>
              <p className="text-lg font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">
                Wilayah
              </p>
            </div>
            <div className="absolute inset-0 bg-indigo-600 flex flex-col items-center justify-center p-8 text-center opacity-0 translate-y-8 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500">
              <h4 className="text-white font-bold text-lg mb-4 uppercase tracking-wider border-b border-indigo-400 pb-2">
                Barlingmascakeb
              </h4>
              <div className="flex flex-wrap justify-center gap-2">
                {[
                  "Banjarnegara",
                  "Purbalingga",
                  "Banyumas",
                  "Cilacap",
                  "Kebumen",
                ].map((city) => (
                  <span
                    key={city}
                    className="px-2 py-1 bg-white/10 rounded text-xs text-white font-bold"
                  >
                    {city}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
        <div className="mt-10 flex flex-col md:flex-row justify-center items-center gap-6 md:gap-12 pt-8 border-t border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined">radar</span>
            <span className="text-sm font-semibold">1 Radar Cuaca</span>
          </div>
          <div className="hidden md:block size-1 bg-gray-300 rounded-full"></div>
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined">water_drop</span>
            <span className="text-sm font-semibold">8 Pos Hujan</span>
          </div>
          <div className="hidden md:block size-1 bg-gray-300 rounded-full"></div>
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined">dns</span>
            <span className="text-sm font-semibold">5 AWS Center</span>
          </div>
          <div className="hidden md:block size-1 bg-gray-300 rounded-full"></div>
          <div className="flex items-center gap-2 text-green-600 bg-green-50 dark:bg-green-900/30 px-3 py-1 rounded-full">
            <span className="material-symbols-outlined text-sm">
              check_circle
            </span>
            <span className="text-xs font-bold">Semua Sistem Online</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Stats;
