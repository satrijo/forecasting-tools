import { useQuery } from "@tanstack/react-query";

// Types matching the /public/location API response
interface LocationInfo {
  lon: number;
  lat: number;
  adm1: string;
  adm2: string;
  adm3: string;
  adm4: string;
  provinsi: string;
  kotkab: string;
  kecamatan: string;
  desa: string;
}

interface CurrentWeather {
  weather: number;
  weather_desc: string;
  weather_desc_en: string;
  image: string;
  datetime: string;
  local_datetime: string;
  t: number;
  tcc: number;
  wd_deg: number;
  wd: string;
  wd_to: string;
  ws: number;
  hu: number;
  vs: number;
  vs_text: string;
  source: string;
}

interface LocationWeatherAPIResponse {
  success: boolean;
  source: string;
  type: string;
  code: string;
  data: {
    status: number;
    data: {
      lokasi: LocationInfo;
      cuaca: CurrentWeather;
      prakiraan: CurrentWeather[];
    };
  };
}

// ADM4 code for Cilacap Tengah, Sidanegara
const ADM4_CILACAP_TENGAH = "33.01.22.1003";
const API_BASE_URL = "http://localhost:3000";

async function fetchLocationWeather(
  code: string,
): Promise<LocationWeatherAPIResponse> {
  const response = await fetch(`${API_BASE_URL}/public/location?code=${code}`);
  if (!response.ok) {
    throw new Error("Failed to fetch weather data");
  }
  return response.json();
}

// Map weather code to Material Symbols icon
function getWeatherIcon(code?: number): { icon: string; color: string } {
  if (code === undefined) return { icon: "cloud", color: "text-gray-500" };

  // Cerah / Clear
  if (code === 0 || code === 100)
    return { icon: "wb_sunny", color: "text-amber-500" };

  // Cerah Berawan / Partly Cloudy
  if (code === 1 || code === 2 || code === 101 || code === 102)
    return { icon: "partly_cloudy_day", color: "text-amber-400" };

  // Berawan / Mostly Cloudy
  if (code === 3 || code === 103)
    return { icon: "cloud", color: "text-gray-500" };

  // Berawan Tebal / Overcast
  if (code === 4 || code === 104)
    return { icon: "cloud", color: "text-gray-600" };

  // Udara Kabur / Haze
  if (code === 5) return { icon: "blur_on", color: "text-gray-400" };

  // Asap / Smoke
  if (code === 10) return { icon: "blur_on", color: "text-gray-500" };

  // Kabut / Fog
  if (code === 45) return { icon: "foggy", color: "text-gray-400" };

  // Hujan Ringan / Light Rain
  if (code === 60) return { icon: "rainy", color: "text-blue-400" };

  // Hujan Sedang / Rain
  if (code === 61) return { icon: "rainy", color: "text-blue-500" };

  // Hujan Lebat / Heavy Rain
  if (code === 63) return { icon: "rainy", color: "text-blue-600" };

  // Hujan Lokal / Isolated Shower
  if (code === 80) return { icon: "grain", color: "text-blue-400" };

  // Hujan Petir / Thunderstorm
  if (code === 95 || code === 97)
    return { icon: "thunderstorm", color: "text-purple-500" };

  return { icon: "cloud", color: "text-gray-500" };
}

function formatLastUpdate(localDatetime: string): string {
  const date = new Date(localDatetime.replace(" ", "T"));
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);

  if (diffMins < 1) return "Baru saja";
  if (diffMins < 60) return `${diffMins} menit yang lalu`;

  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours} jam yang lalu`;

  return `${Math.floor(diffHours / 24)} hari yang lalu`;
}

export function Hero() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["weather", "location", ADM4_CILACAP_TENGAH],
    queryFn: () => fetchLocationWeather(ADM4_CILACAP_TENGAH),
    staleTime: 5 * 60 * 1000,
  });

  const lokasi = data?.data?.data?.lokasi;
  const weather = data?.data?.data?.cuaca;
  const timestamp = weather?.local_datetime;

  return (
    <section className="w-full bg-white dark:bg-background-dark py-12 lg:py-16 px-4 sm:px-10 lg:px-40">
      <div className="mx-auto max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="flex flex-col gap-6">
            <div className="flex items-center gap-2 mb-2">
              <span className="bg-blue-100 text-primary px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                Update Terkini
              </span>
              <span className="text-gray-500 text-xs font-medium dark:text-gray-400">
                {isLoading
                  ? "Memuat..."
                  : timestamp
                    ? formatLastUpdate(timestamp)
                    : "-"}
              </span>
            </div>
            <h1 className="text-[#0d141b] dark:text-white text-4xl sm:text-5xl font-black leading-[1.1] tracking-[-0.033em]">
              Pantauan Cuaca Terkini{" "}
              <span className="text-primary block sm:inline">
                {lokasi ? `${lokasi.kecamatan}, ${lokasi.kotkab}` : "Cilacap"}
              </span>
            </h1>
            <p className="text-gray-600 dark:text-gray-300 text-lg leading-relaxed max-w-lg">
              Stasiun Meteorologi Kelas III Tunggul Wulung Cilacap memberikan
              data akurat untuk mendukung keselamatan publik, kelancaran
              transportasi, dan aktivitas maritim.
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4">
              {isLoading ? (
                <>
                  <WeatherMetricSkeleton />
                  <WeatherMetricSkeleton />
                  <WeatherMetricSkeleton />
                  <WeatherMetricSkeleton />
                </>
              ) : error ? (
                <div className="col-span-4 text-center text-red-500">
                  Gagal memuat data cuaca
                </div>
              ) : (
                <>
                  <WeatherMetric
                    icon="thermostat"
                    value={weather?.t !== undefined ? `${weather.t}°C` : "-"}
                    label="Suhu Udara"
                  />
                  <WeatherMetric
                    icon="water_drop"
                    value={weather?.hu !== undefined ? `${weather.hu}%` : "-"}
                    label="Kelembapan"
                  />
                  <WeatherMetric
                    icon="air"
                    value={weather?.ws !== undefined ? String(weather.ws) : "-"}
                    unit={weather?.ws !== undefined ? "km/h" : undefined}
                    label="Kecepatan Angin"
                  />
                  <WeatherMetric
                    icon="visibility"
                    value={weather?.vs_text || "-"}
                    label="Jarak Pandang"
                  />
                </>
              )}
            </div>
            <div className="flex gap-4 mt-4">
              <button className="flex items-center justify-center rounded-lg h-12 px-6 bg-primary hover:bg-blue-600 text-white text-base font-bold transition-all shadow-sm hover:shadow-md">
                Lihat Detail Lengkap
              </button>
              <button className="flex items-center justify-center rounded-lg h-12 px-6 bg-white border border-[#cfdbe7] text-[#0d141b] hover:bg-slate-50 text-base font-bold transition-all dark:bg-transparent dark:text-white dark:border-gray-600 dark:hover:bg-gray-800">
                Ganti Lokasi
              </button>
            </div>
          </div>
          <div className="relative w-full h-full min-h-[400px] rounded-2xl overflow-hidden shadow-xl group">
            <div className="absolute inset-0 bg-linear-to-t from-black/60 to-transparent z-10"></div>
            <div
              className="absolute inset-0 bg-center bg-cover transition-transform duration-700 group-hover:scale-105"
              style={{
                backgroundImage:
                  'url("https://lh3.googleusercontent.com/aida-public/AB6AXuDhxKpFVl7Tp4DW19JJBN9MBKZkVAvwezft5vuOCo3AV2OvglEyDH0kkv6La-RV0KaZ6nEIzoyklmu5jodV-DrLtcjOoa_dwNCM8P9uFI2CjfXQYrbPGzWDsqU7QoQ86iL6dqFFZC6niDHQcBp5Dj7hKWTcQYHgciV5swqLK2f3ZoPNWloDKmBKmCXHClBRLSu7dv1NVac4WD4apc8Ex92t_Y3EKTwe2Dk8cgCoOicsRu2zjANL58sX26USBIsJmI08GxWgxX7IBp8")',
              }}
            ></div>
            <div className="absolute bottom-6 left-6 right-6 z-20">
              <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-xl p-5 dark:bg-gray-900/95">
                <div className="flex items-center justify-between">
                  {/* Weather Condition */}
                  <div className="flex items-center gap-4">
                    <span
                      className={`material-symbols-outlined text-5xl ${getWeatherIcon(weather?.weather).color}`}
                    >
                      {getWeatherIcon(weather?.weather).icon}
                    </span>
                    <div>
                      <p className="text-lg font-bold text-gray-900 dark:text-white">
                        {weather?.weather_desc || "-"}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Kondisi saat ini
                      </p>
                    </div>
                  </div>

                  {/* Divider */}
                  <div className="h-12 w-px bg-gray-200 dark:bg-gray-700 hidden sm:block"></div>

                  {/* Wind Info */}
                  <div className="hidden sm:flex items-center gap-3">
                    <span
                      className="material-symbols-outlined text-3xl text-teal-500"
                      style={{
                        transform: `rotate(${(weather?.wd_deg || 0) + 180}deg)`,
                      }}
                    >
                      navigation
                    </span>
                    <div>
                      <p className="text-lg font-bold text-gray-900 dark:text-white">
                        {weather?.wd || "-"}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Arah angin
                      </p>
                    </div>
                  </div>

                  {/* Divider */}
                  <div className="h-12 w-px bg-gray-200 dark:bg-gray-700 hidden md:block"></div>

                  {/* Cloud Cover */}
                  <div className="hidden md:flex items-center gap-3">
                    <span className="material-symbols-outlined text-3xl text-sky-500">
                      filter_drama
                    </span>
                    <div>
                      <p className="text-lg font-bold text-gray-900 dark:text-white">
                        {weather?.tcc !== undefined ? `${weather.tcc}%` : "-"}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Tutupan awan
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

const WeatherMetric: React.FC<{
  icon: string;
  value: string;
  unit?: string;
  label: string;
}> = ({ icon, value, unit, label }) => (
  <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 dark:bg-gray-800 dark:border-gray-700">
    <div className="text-primary mb-2">
      <span className="material-symbols-outlined">{icon}</span>
    </div>
    <p className="text-2xl font-bold text-[#0d141b] dark:text-white">
      {value}
      {unit && (
        <span className="text-sm font-normal text-gray-500 ml-1">{unit}</span>
      )}
    </p>
    <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
  </div>
);

const WeatherMetricSkeleton = () => (
  <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 dark:bg-gray-800 dark:border-gray-700 animate-pulse">
    <div className="w-6 h-6 bg-slate-200 dark:bg-gray-600 rounded mb-2"></div>
    <div className="w-16 h-8 bg-slate-200 dark:bg-gray-600 rounded mb-1"></div>
    <div className="w-20 h-3 bg-slate-200 dark:bg-gray-600 rounded"></div>
  </div>
);
