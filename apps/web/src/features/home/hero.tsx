import { useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";

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
  const prakiraan = data?.data?.data?.prakiraan;
  const timestamp = weather?.local_datetime;

  // Slide animation state
  const [showForecast, setShowForecast] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  // Partner logos animation state
  const [activeLogoIndex, setActiveLogoIndex] = useState(0);
  const totalLogos = 6;

  useEffect(() => {
    if (isHovered) return; // Don't auto-slide when hovered

    const interval = setInterval(() => {
      setShowForecast((prev) => !prev);
    }, 6000); // Slide every 6 seconds
    return () => clearInterval(interval);
  }, [isHovered]);

  useEffect(() => {
    const logoInterval = setInterval(() => {
      setActiveLogoIndex((prev) => (prev + 1) % totalLogos);
    }, 1500); // Change active logo every 1.5 seconds
    return () => clearInterval(logoInterval);
  }, []);

  return (
    <section className="w-full min-h-[86vh] flex flex-col justify-center items-center bg-linear-to-br from-blue-50 via-white to-sky-50 dark:from-gray-900 dark:via-background-dark dark:to-gray-900 py-20 lg:py-24 px-4 sm:px-10 lg:px-40">
      <div className="mx-auto max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="flex flex-col gap-6">
            <div className="flex items-center gap-2 mb-2">
              <span className="bg-blue-100 text-primary px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                </span>
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
              Informasi cuaca terkini dari BMKG Cilacap untuk mendukung
              aktivitas harian, perjalanan, dan kegiatan maritim Anda.
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
          </div>
          {/* Slide Card Container */}
          <div
            className="relative w-full min-h-[400px] overflow-hidden rounded-2xl shadow-xl"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            <div
              className="flex transition-transform duration-500 ease-in-out h-full"
              style={{
                width: "200%",
                transform: showForecast ? "translateX(-50%)" : "translateX(0)",
              }}
            >
              {/* Slide 1 - Photo */}
              <div className="relative w-1/2 min-h-[400px] group">
                <div className="absolute inset-0 bg-linear-to-t from-black/60 to-transparent z-10"></div>
                <div
                  className="absolute inset-0 bg-center bg-cover transition-transform duration-700 group-hover:scale-105"
                  style={{ backgroundImage: 'url("/pantai.webp")' }}
                ></div>
                <div className="absolute bottom-6 left-6 right-6 z-20">
                  <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-xl p-5 dark:bg-gray-900/95">
                    <div className="flex items-center justify-between">
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
                      <div className="h-12 w-px bg-gray-200 dark:bg-gray-700 hidden sm:block"></div>
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
                      <div className="h-12 w-px bg-gray-200 dark:bg-gray-700 hidden md:block"></div>
                      <div className="hidden md:flex items-center gap-3">
                        <span className="material-symbols-outlined text-3xl text-sky-500">
                          filter_drama
                        </span>
                        <div>
                          <p className="text-lg font-bold text-gray-900 dark:text-white">
                            {weather?.tcc !== undefined
                              ? `${weather.tcc}%`
                              : "-"}
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

              {/* Slide 2 - Forecast */}
              <div className="w-1/2 min-h-[400px] bg-linear-to-br from-sky-100 via-blue-50 to-indigo-100 dark:from-gray-800 dark:via-gray-900 dark:to-gray-800">
                <div className="p-6 h-full flex flex-col">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                      <span className="material-symbols-outlined text-primary">
                        schedule
                      </span>
                      Prakiraan Cuaca
                    </h3>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      Beberapa jam kedepan
                    </span>
                  </div>
                  <div className="flex-1 grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {prakiraan?.slice(0, 6).map((forecast, index) => {
                      const forecastTime = new Date(
                        forecast.local_datetime.replace(" ", "T"),
                      );
                      const hour = forecastTime
                        .getHours()
                        .toString()
                        .padStart(2, "0");
                      return (
                        <div
                          key={index}
                          className="p-4 rounded-xl bg-white/80 dark:bg-gray-800/80 border border-white dark:border-gray-700 text-center shadow-sm"
                        >
                          <p className="text-sm font-semibold text-gray-600 dark:text-gray-300">
                            {hour}:00
                          </p>
                          <span
                            className={`material-symbols-outlined text-4xl my-2 ${getWeatherIcon(forecast.weather).color}`}
                          >
                            {getWeatherIcon(forecast.weather).icon}
                          </span>
                          <p className="text-xl font-bold text-gray-900 dark:text-white">
                            {forecast.t}°C
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                            {forecast.weather_desc}
                          </p>
                        </div>
                      );
                    }) || (
                      <>
                        {[...Array(6)].map((_, i) => (
                          <div
                            key={i}
                            className="p-4 rounded-xl bg-white/80 dark:bg-gray-800/80 animate-pulse"
                          >
                            <div className="h-4 w-12 mx-auto bg-gray-200 dark:bg-gray-600 rounded mb-2"></div>
                            <div className="h-10 w-10 mx-auto bg-gray-200 dark:bg-gray-600 rounded-full my-2"></div>
                            <div className="h-6 w-14 mx-auto bg-gray-200 dark:bg-gray-600 rounded"></div>
                          </div>
                        ))}
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Navigation Arrows */}
            <button
              onClick={() => setShowForecast(false)}
              className={`absolute left-3 top-1/2 -translate-y-1/2 z-30 w-10 h-10 rounded-full bg-white/90 dark:bg-gray-800/90 shadow-lg flex items-center justify-center transition-opacity ${!showForecast ? "opacity-0 pointer-events-none" : "opacity-100"}`}
            >
              <span className="material-symbols-outlined text-gray-700 dark:text-gray-300">
                chevron_left
              </span>
            </button>
            <button
              onClick={() => setShowForecast(true)}
              className={`absolute right-3 top-1/2 -translate-y-1/2 z-30 w-10 h-10 rounded-full bg-white/90 dark:bg-gray-800/90 shadow-lg flex items-center justify-center transition-opacity ${showForecast ? "opacity-0 pointer-events-none" : "opacity-100"}`}
            >
              <span className="material-symbols-outlined text-gray-700 dark:text-gray-300">
                chevron_right
              </span>
            </button>

            {/* Indicator Dots */}
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2 z-30">
              <button
                onClick={() => setShowForecast(false)}
                className={`w-2 h-2 rounded-full transition-all ${!showForecast ? "bg-white w-6" : "bg-white/50"}`}
              />
              <button
                onClick={() => setShowForecast(true)}
                className={`w-2 h-2 rounded-full transition-all ${showForecast ? "bg-primary w-6" : "bg-gray-400/50"}`}
              />
            </div>
          </div>
        </div>

        {/* Partner Logos */}
        <div className="mt-20 pt-12 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-center gap-4 mb-8">
            <div className="h-px w-16 bg-gray-300 dark:bg-gray-600"></div>
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-widest">
              Kerjasama
            </h3>
            <div className="h-px w-16 bg-gray-300 dark:bg-gray-600"></div>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-10 md:gap-14">
            {[
              { href: "https://bmkg.go.id", src: "/logos/bmkg.png", alt: "BMKG" },
              { href: "https://bnpb.go.id", src: "/logos/bnpb.png", alt: "BNPB" },
              { href: "https://basarnas.go.id", src: "/logos/basarnas.png", alt: "Basarnas" },
              { href: "https://dephub.go.id", src: "/logos/kemenhub.png", alt: "Kemenhub" },
              { href: "https://airnavindonesia.co.id", src: "/logos/airnav.png", alt: "AirNav Indonesia" },
              { href: "https://cilacapkab.go.id", src: "/logos/cilacap.jpg", alt: "Pemkab Cilacap" },
            ].map((logo, index) => (
              <a
                key={logo.alt}
                href={logo.href}
                target="_blank"
                rel="noopener noreferrer"
                className={`transition-all duration-500 ${
                  activeLogoIndex === index
                    ? "grayscale-0 opacity-100 scale-110"
                    : "grayscale opacity-40 hover:grayscale-0 hover:opacity-100"
                }`}
              >
                <img
                  src={logo.src}
                  alt={logo.alt}
                  className="h-16 w-auto object-contain"
                />
              </a>
            ))}
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
