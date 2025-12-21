import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

const data = [
  { time: "00", temp: 26, color: "#dbeafe" }, // blue-100
  { time: "03", temp: 27, color: "#bfdbfe" }, // blue-200
  { time: "06", temp: 28, color: "#fef9c3" }, // yellow-100
  { time: "09", temp: 30, color: "#fef08a" }, // yellow-200
  { time: "12", temp: 33, color: "#fed7aa" }, // orange-200 (peak)
  { time: "15", temp: 32, color: "#ffedd5" }, // orange-100
  { time: "18", temp: 30, color: "#fef08a" },
  { time: "21", temp: 28, color: "#dbeafe" },
];

const Analysis: React.FC = () => {
  return (
    <section className="w-full py-12 lg:py-16 px-4 sm:px-10 lg:px-40 bg-slate-50 dark:bg-gray-900/50">
      <div className="mx-auto max-w-7xl">
        <div className="mb-10">
          <div className="flex items-center gap-2 mb-4">
            <span className="bg-violet-100 text-violet-600 dark:bg-violet-900/30 dark:text-violet-400 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
              Data Regional
            </span>
          </div>
          <h2 className="text-3xl font-bold text-[#0d141b] dark:text-white">
            Analisis Kondisi Regional
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-2 max-w-2xl">
            Pantau kondisi cuaca terkini di berbagai kota dan kabupaten wilayah Barlingmascakeb dan sekitarnya.
          </p>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Table */}
          <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden flex flex-col">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
              <h3 className="font-bold text-lg text-[#0d141b] dark:text-white">
                Kondisi Cuaca Kota/Kabupaten
              </h3>
              <a href="#" className="inline-flex items-center text-primary text-sm font-bold group/link">
                Lihat Semua Wilayah
                <span className="material-symbols-outlined text-base ml-1 group-hover/link:translate-x-1 transition-transform">
                  arrow_forward
                </span>
              </a>
            </div>
            <div className="px-6 py-4 bg-slate-50/50 dark:bg-gray-700/30 border-b border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400">
                  <span className="material-symbols-outlined text-[18px]">
                    search
                  </span>
                </div>
                <input
                  className="block w-full rounded-lg border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm pl-9 focus:border-primary focus:ring-primary py-2 shadow-sm placeholder:text-gray-400"
                  placeholder="Cari berdasarkan lokasi..."
                  type="text"
                />
              </div>
              <div className="flex gap-2">
                <select className="block w-full sm:w-auto rounded-lg border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm py-2 pl-3 pr-8 focus:border-primary focus:ring-primary shadow-sm text-gray-600 dark:text-gray-300 cursor-pointer font-medium">
                  <option value="">Semua Kondisi</option>
                  <option value="sunny">Cerah</option>
                  <option value="cloudy">Berawan</option>
                  <option value="rainy">Hujan</option>
                </select>
                <select className="block w-full sm:w-auto rounded-lg border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm py-2 pl-3 pr-8 focus:border-primary focus:ring-primary shadow-sm text-gray-600 dark:text-gray-300 cursor-pointer font-medium">
                  <option value="temp">Parameter: Suhu</option>
                  <option value="humid">Kelembapan</option>
                  <option value="wind">Angin</option>
                </select>
                <button className="flex items-center justify-center px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:text-primary hover:border-primary/30 transition-all shadow-sm">
                  <span className="material-symbols-outlined text-[20px]">
                    tune
                  </span>
                </button>
              </div>
            </div>
            <div className="overflow-x-auto flex-1">
              <table className="w-full text-left text-sm table-fixed">
                <thead className="bg-slate-50 dark:bg-gray-700/50 text-gray-500 dark:text-gray-400 font-medium">
                  <tr>
                    <th className="px-4 py-3 w-[20%]">Lokasi</th>
                    <th className="px-4 py-3 w-[25%]">Kondisi</th>
                    <th className="px-4 py-3 w-[15%] text-center">Suhu</th>
                    <th className="px-4 py-3 w-[20%] text-center">Kelembapan</th>
                    <th className="px-4 py-3 w-[20%] text-center">Angin</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                  <WeatherRow
                    loc="Cilacap"
                    cond="Cerah Berawan"
                    icon="wb_sunny"
                    iconColor="text-yellow-500"
                    temp="32°C"
                    hum="70%"
                    wind="10 km/h"
                  />
                  <WeatherRow
                    loc="Banyumas"
                    cond="Cerah"
                    icon="sunny"
                    iconColor="text-yellow-600"
                    temp="34°C"
                    hum="65%"
                    wind="15 km/h"
                  />
                  <WeatherRow
                    loc="Purbalingga"
                    cond="Hujan Ringan"
                    icon="rainy"
                    iconColor="text-blue-400"
                    temp="29°C"
                    hum="85%"
                    wind="8 km/h"
                  />
                  <WeatherRow
                    loc="Kebumen"
                    cond="Berawan"
                    icon="cloud"
                    iconColor="text-gray-400"
                    temp="30°C"
                    hum="75%"
                    wind="12 km/h"
                  />
                  <WeatherRow
                    loc="Banjarnegara"
                    cond="Cerah Berawan"
                    icon="partly_cloudy_day"
                    iconColor="text-yellow-500"
                    temp="31°C"
                    hum="72%"
                    wind="18 km/h"
                  />
                  <WeatherRow
                    loc="Banjar"
                    cond="Cerah"
                    icon="sunny"
                    iconColor="text-yellow-600"
                    temp="33°C"
                    hum="68%"
                    wind="14 km/h"
                  />
                  <WeatherRow
                    loc="Ciamis"
                    cond="Berawan Tebal"
                    icon="cloud"
                    iconColor="text-gray-500"
                    temp="28°C"
                    hum="80%"
                    wind="10 km/h"
                  />
                  <WeatherRow
                    loc="Pangandaran"
                    cond="Cerah Berawan"
                    icon="partly_cloudy_day"
                    iconColor="text-yellow-500"
                    temp="30°C"
                    hum="78%"
                    wind="20 km/h"
                  />
                </tbody>
              </table>
            </div>
          </div>
          {/* Right Column: Charts */}
          <div className="flex flex-col gap-6">
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm p-4 flex flex-col">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-bold text-[#0d141b] dark:text-white text-sm">
                  Tren Suhu (CLP)
                </h3>
                <span className="text-xs font-medium text-gray-400">
                  24 Jam Terakhir
                </span>
              </div>
              <div className="flex-1 w-full min-h-[180px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <XAxis
                      dataKey="time"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: "#9ca3af", fontSize: 10 }}
                    />
                    <Tooltip
                      cursor={{ fill: "transparent" }}
                      contentStyle={{
                        backgroundColor: "#1e293b",
                        color: "white",
                        border: "none",
                        borderRadius: "8px",
                        fontSize: "12px",
                      }}
                      itemStyle={{ color: "white" }}
                      formatter={(value: number) => [`${value}°C`]}
                    />
                    <Bar
                      dataKey="temp"
                      radius={[4, 4, 0, 0]}
                      animationDuration={1500}
                    >
                      {data.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
            {/* Wind Indicator using CSS/Tailwind as per design */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm p-6 flex flex-col items-center flex-1">
              <h3 className="font-bold text-[#0d141b] dark:text-white mb-4 self-start">
                Indikator Angin
              </h3>
              <div className="relative size-40 rounded-full border-4 border-slate-100 dark:border-gray-700 flex items-center justify-center">
                <span className="absolute top-2 text-xs font-bold text-gray-400">
                  U
                </span>
                <span className="absolute bottom-2 text-xs font-bold text-gray-400">
                  S
                </span>
                <span className="absolute left-2 text-xs font-bold text-gray-400">
                  B
                </span>
                <span className="absolute right-2 text-xs font-bold text-gray-400">
                  T
                </span>
                <div className="text-center z-10">
                  <span className="text-3xl font-black text-primary">15</span>
                  <span className="block text-xs text-gray-500 uppercase font-bold">
                    km/h
                  </span>
                </div>
                <div className="absolute inset-0 flex items-center justify-center rotate-45 transform origin-center">
                  <div className="h-full w-[2px] relative">
                    <div className="absolute top-4 left-1/2 -translate-x-1/2 text-primary">
                      <span className="material-symbols-outlined text-2xl">
                        arrow_upward
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              <p className="mt-4 text-sm text-gray-600 dark:text-gray-400 text-center">
                Arah angin dominan dari{" "}
                <span className="font-bold">Barat Daya</span> dengan hembusan
                stabil.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

const WeatherRow: React.FC<{
  loc: string;
  cond: string;
  icon: string;
  iconColor: string;
  temp: string;
  hum: string;
  wind: string;
}> = ({ loc, cond, icon, iconColor, temp, hum, wind }) => (
  <tr className="hover:bg-slate-50 dark:hover:bg-gray-700/30 transition-colors">
    <td className="px-4 py-3 font-bold text-[#0d141b] dark:text-white">
      {loc}
    </td>
    <td className="px-4 py-3">
      <div className="flex items-center gap-2">
        <span className={`material-symbols-outlined ${iconColor} text-lg`}>
          {icon}
        </span>
        <span className="text-gray-700 dark:text-gray-300 text-sm">{cond}</span>
      </div>
    </td>
    <td className="px-4 py-3 text-[#0d141b] dark:text-white text-center">{temp}</td>
    <td className="px-4 py-3 text-gray-600 dark:text-gray-400 text-center">{hum}</td>
    <td className="px-4 py-3 text-gray-600 dark:text-gray-400 text-center">{wind}</td>
  </tr>
);

export default Analysis;
