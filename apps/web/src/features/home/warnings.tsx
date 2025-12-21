import { useQuery } from "@tanstack/react-query";

interface AlertInfo {
  event: string;
  urgency: string;
  severity: string;
  headline: string;
  description: string;
  effective: string;
  expires: string;
  web: string;
  senderName: string;
  area: {
    areaDesc: string;
  };
}

interface AlertData {
  alert: {
    identifier: string;
    sender: string;
    sent: string;
    status: string;
    msgType: string;
    info: AlertInfo;
  };
}

interface NowcastingResponse {
  success: boolean;
  source: string;
  province: string;
  data: AlertData;
}

interface MaritimeWarning {
  sedang: string[];
  tinggi: string[];
  sangat_tinggi: string[];
  ekstrem: string[];
}

interface MaritimeData {
  region: string;
  synoptic: string;
  valid_from: string;
  valid_until: string;
  time_zone: string;
  warning: MaritimeWarning;
}

interface MaritimeRegion {
  data: MaritimeData;
  pdf: string;
}

type MaritimeResponse = Record<string, MaritimeRegion>;

const API_BASE_URL = "http://localhost:3000";

async function fetchExtremeWeather(): Promise<NowcastingResponse> {
  const response = await fetch(
    `${API_BASE_URL}/public/nowcasting?type=xml&province=jawa_tengah`,
  );
  if (!response.ok) {
    throw new Error("Failed to fetch extreme weather data");
  }
  return response.json();
}

const MARITIME_API_URL = "https://maritim.bmkg.go.id/marine-data/warning";
const MARITIME_REGION_KEY = "Jawa Tengah Bagian Selatan";

async function fetchMaritimeWarning(): Promise<MaritimeRegion | null> {
  const response = await fetch(`${MARITIME_API_URL}/warnings.json`);
  if (!response.ok) {
    throw new Error("Failed to fetch maritime warning data");
  }
  const data: MaritimeResponse = await response.json();
  return data[MARITIME_REGION_KEY] || null;
}

function formatAlertTime(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleString("id-ID", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    timeZoneName: "short",
  });
}

function getSeverityBadge(severity: string): {
  text: string;
  color: string;
  bgColor: string;
  borderColor: string;
} {
  switch (severity?.toLowerCase()) {
    case "extreme":
      return {
        text: "AWAS",
        color: "text-red-700 dark:text-red-300",
        bgColor: "bg-white/50 dark:bg-black/20",
        borderColor: "border-red-200 dark:border-red-800",
      };
    case "severe":
      return {
        text: "SIAGA",
        color: "text-red-700 dark:text-red-300",
        bgColor: "bg-white/50 dark:bg-black/20",
        borderColor: "border-red-200 dark:border-red-800",
      };
    case "moderate":
      return {
        text: "WASPADA",
        color: "text-orange-700 dark:text-orange-300",
        bgColor: "bg-white/50 dark:bg-black/20",
        borderColor: "border-orange-200 dark:border-orange-800",
      };
    default:
      return {
        text: "INFO",
        color: "text-blue-700 dark:text-blue-300",
        bgColor: "bg-white/50 dark:bg-black/20",
        borderColor: "border-blue-200 dark:border-blue-800",
      };
  }
}

function getMaritimeSeverity(warning: MaritimeWarning | undefined): {
  level: string;
  color: string;
  bgColor: string;
  borderColor: string;
  headerBg: string;
  headerBorder: string;
  iconColor: string;
} {
  if (warning?.ekstrem?.length) {
    return {
      level: "EKSTREM",
      color: "text-purple-700 dark:text-purple-300",
      bgColor: "bg-white/50 dark:bg-black/20",
      borderColor: "border-purple-200 dark:border-purple-800",
      headerBg: "bg-purple-50 dark:bg-purple-900/20",
      headerBorder: "border-purple-100 dark:border-purple-900/30",
      iconColor: "text-purple-600 dark:text-purple-400",
    };
  }
  if (warning?.sangat_tinggi?.length) {
    return {
      level: "SANGAT TINGGI",
      color: "text-red-700 dark:text-red-300",
      bgColor: "bg-white/50 dark:bg-black/20",
      borderColor: "border-red-200 dark:border-red-800",
      headerBg: "bg-red-50 dark:bg-red-900/20",
      headerBorder: "border-red-100 dark:border-red-900/30",
      iconColor: "text-red-600 dark:text-red-400",
    };
  }
  if (warning?.tinggi?.length) {
    return {
      level: "TINGGI",
      color: "text-orange-700 dark:text-orange-300",
      bgColor: "bg-white/50 dark:bg-black/20",
      borderColor: "border-orange-200 dark:border-orange-800",
      headerBg: "bg-orange-50 dark:bg-orange-900/20",
      headerBorder: "border-orange-100 dark:border-orange-900/30",
      iconColor: "text-orange-600 dark:text-orange-400",
    };
  }
  return {
    level: "SEDANG",
    color: "text-yellow-700 dark:text-yellow-300",
    bgColor: "bg-white/50 dark:bg-black/20",
    borderColor: "border-yellow-200 dark:border-yellow-800",
    headerBg: "bg-yellow-50 dark:bg-yellow-900/20",
    headerBorder: "border-yellow-100 dark:border-yellow-900/30",
    iconColor: "text-yellow-600 dark:text-yellow-400",
  };
}

export function Warnings() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["extreme-weather", "jawa_tengah"],
    queryFn: fetchExtremeWeather,
    staleTime: 5 * 60 * 1000,
  });

  const {
    data: maritimeData,
    isLoading: maritimeLoading,
    error: maritimeError,
  } = useQuery({
    queryKey: ["maritime-warning", MARITIME_REGION_KEY],
    queryFn: fetchMaritimeWarning,
    staleTime: 5 * 60 * 1000,
  });

  const alert = data?.data?.alert;
  const info = alert?.info;
  const severity = getSeverityBadge(info?.severity || "");

  const maritimeInfo = maritimeData?.data;
  const maritimePdf = maritimeData?.pdf;
  const maritimeSeverity = getMaritimeSeverity(maritimeInfo?.warning);

  return (
    <section className="w-full px-4 sm:px-10 lg:px-40 py-12 lg:py-16 bg-slate-50 dark:bg-gray-900/50">
      <div className="mx-auto max-w-7xl">
        <div className="mb-10">
          <div className="flex items-center gap-2 mb-4">
            <span className="bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
              Peringatan Dini
            </span>
            <span className="flex items-center gap-2 text-gray-500 text-xs font-medium dark:text-gray-400">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
              </span>
              Update Real-time
            </span>
          </div>
          <h2 className="text-3xl font-bold text-[#0d141b] dark:text-white">
            Informasi Cuaca Ekstrem
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-2 max-w-2xl">
            Tetap waspada dengan info terbaru potensi cuaca ekstrem dan gelombang tinggi di Jawa Tengah.
          </p>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Card 1: Cuaca Ekstrem */}
          <div className="flex flex-col bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 group">
            <div className="bg-red-50 dark:bg-red-900/20 px-6 py-4 border-b border-red-100 dark:border-red-900/30 flex items-center justify-between gap-3 relative z-10">
              <div className="flex items-center gap-3 min-w-0">
                <span className="material-symbols-outlined text-red-600 dark:text-red-400 text-3xl shrink-0">
                  thunderstorm
                </span>
                <div className="min-w-0">
                  <h3 className="font-bold text-red-700 dark:text-red-300 text-lg leading-none truncate">
                    {info?.event || "Cuaca Ekstrem"}
                  </h3>
                  <p className="text-red-600/80 dark:text-red-400/80 text-xs mt-1 font-medium">
                    Hidrometeorologi
                  </p>
                </div>
              </div>
              <span
                className={`${severity.bgColor} ${severity.color} text-xs font-black px-3 py-1.5 rounded-md border ${severity.borderColor} tracking-wider shadow-sm uppercase shrink-0`}
              >
                {severity.text}
              </span>
            </div>
            <div className="p-6 flex flex-col flex-1 relative">
              <div className="absolute right-0 top-0 w-32 h-32 bg-linear-to-br from-red-50 to-transparent dark:from-red-900/10 rounded-bl-full -mr-8 -mt-8 pointer-events-none z-0"></div>
              <div className="relative z-10 flex flex-col flex-1">
                <div className="flex-1">
                  {isLoading ? (
                    <div className="animate-pulse">
                      <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full mb-2"></div>
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6 mb-6"></div>
                    </div>
                  ) : error ? (
                    <div className="text-gray-500 dark:text-gray-400">
                      <p className="text-sm">Tidak ada peringatan aktif saat ini.</p>
                    </div>
                  ) : (
                    <>
                      <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                        {info?.headline || "Jawa Tengah"}
                      </h4>
                      <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed mb-4 line-clamp-3">
                        {info?.description?.split(".")[0] || "Tidak ada deskripsi"}.
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
                        Berlaku: {info?.effective ? formatAlertTime(info.effective) : "-"} s/d{" "}
                        {info?.expires ? formatAlertTime(info.expires) : "-"}
                      </p>
                    </>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-3 mt-auto pt-2">
                  {info?.web ? (
                    <a
                      href={info.web}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center h-9 px-3 rounded-lg bg-red-600 hover:bg-red-700 text-white font-semibold text-sm transition-all"
                    >
                      Lihat Infografis
                      <span className="material-symbols-outlined text-base ml-1.5">
                        open_in_new
                      </span>
                    </a>
                  ) : (
                    <button className="flex items-center justify-center h-9 px-3 rounded-lg bg-red-600 hover:bg-red-700 text-white font-semibold text-sm transition-all">
                      Pantau Radar
                      <span className="material-symbols-outlined text-base ml-1.5">
                        radar
                      </span>
                    </button>
                  )}
                  {info?.web ? (
                    <a
                      href={info.web.replace("infografis.jpg", "infografis_text.jpg")}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center h-9 px-3 rounded-lg bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 font-semibold text-sm transition-all dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-600"
                    >
                      <span className="material-symbols-outlined text-base mr-1.5">
                        location_on
                      </span>
                      Detail Wilayah
                    </a>
                  ) : (
                    <button className="flex items-center justify-center h-9 px-3 rounded-lg bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 font-semibold text-sm transition-all dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-600">
                      <span className="material-symbols-outlined text-base mr-1.5">
                        location_on
                      </span>
                      Detail Wilayah
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
          {/* Card 2: Cuaca Maritim */}
          <div className="flex flex-col bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 group">
            <div className={`${maritimeSeverity.headerBg} px-6 py-4 border-b ${maritimeSeverity.headerBorder} flex items-center justify-between gap-3 relative z-10`}>
              <div className="flex items-center gap-3 min-w-0">
                <span className={`material-symbols-outlined ${maritimeSeverity.iconColor} text-3xl shrink-0`}>
                  sailing
                </span>
                <div className="min-w-0">
                  <h3 className={`font-bold ${maritimeSeverity.color} text-lg leading-none truncate`}>
                    Cuaca Maritim
                  </h3>
                  <p className={`${maritimeSeverity.iconColor} opacity-80 text-xs mt-1 font-medium`}>
                    {MARITIME_REGION_KEY}
                  </p>
                </div>
              </div>
              <span
                className={`${maritimeSeverity.bgColor} ${maritimeSeverity.color} text-xs font-black px-3 py-1.5 rounded-md border ${maritimeSeverity.borderColor} tracking-wider shadow-sm uppercase shrink-0`}
              >
                {maritimeSeverity.level}
              </span>
            </div>
            <div className="p-6 flex flex-col flex-1 relative">
              <div className={`absolute right-0 top-0 w-32 h-32 bg-linear-to-br ${maritimeSeverity.headerBg} to-transparent rounded-bl-full -mr-8 -mt-8 pointer-events-none z-0`}></div>
              <div className="relative z-10 flex flex-col flex-1">
                <div className="flex-1">
                  {maritimeLoading ? (
                    <div className="animate-pulse">
                      <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full mb-2"></div>
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6 mb-6"></div>
                    </div>
                  ) : maritimeError ? (
                    <div className="text-gray-500 dark:text-gray-400">
                      <p className="text-sm">Gagal memuat data maritim.</p>
                    </div>
                  ) : (
                    <>
                      <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                        Perairan {maritimeInfo?.region || "Jawa Tengah"}
                      </h4>
                      <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed mb-3 line-clamp-3">
                        {maritimeInfo?.synoptic || "Tidak ada deskripsi"}
                      </p>
                      {maritimeInfo?.warning && (
                        <div className="flex flex-wrap gap-1.5 mb-3">
                          {[
                            ...maritimeInfo.warning.sedang,
                            ...maritimeInfo.warning.tinggi,
                            ...maritimeInfo.warning.sangat_tinggi,
                            ...maritimeInfo.warning.ekstrem,
                          ].slice(0, 3).map((area, idx) => (
                            <span
                              key={idx}
                              className={`text-xs px-2 py-0.5 rounded-full ${maritimeSeverity.bgColor} ${maritimeSeverity.color} border ${maritimeSeverity.borderColor}`}
                            >
                              {area}
                            </span>
                          ))}
                          {[
                            ...maritimeInfo.warning.sedang,
                            ...maritimeInfo.warning.tinggi,
                            ...maritimeInfo.warning.sangat_tinggi,
                            ...maritimeInfo.warning.ekstrem,
                          ].length > 3 && (
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              +{[
                                ...maritimeInfo.warning.sedang,
                                ...maritimeInfo.warning.tinggi,
                                ...maritimeInfo.warning.sangat_tinggi,
                                ...maritimeInfo.warning.ekstrem,
                              ].length - 3} lainnya
                            </span>
                          )}
                        </div>
                      )}
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
                        Berlaku: {maritimeInfo?.valid_from ? formatAlertTime(maritimeInfo.valid_from) : "-"} s/d{" "}
                        {maritimeInfo?.valid_until ? formatAlertTime(maritimeInfo.valid_until) : "-"} {maritimeInfo?.time_zone}
                      </p>
                    </>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-3 mt-auto pt-2">
                  <a
                    href={`${MARITIME_API_URL}/pdf/${maritimePdf || "jawa-tengah-bagian-selatan.pdf"}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center h-9 px-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm transition-all"
                  >
                    <span className="material-symbols-outlined text-base mr-1.5">
                      picture_as_pdf
                    </span>
                    Lihat PDF
                  </a>
                  <a
                    href="https://maritim.bmkg.go.id"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center h-9 px-3 rounded-lg bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 font-semibold text-sm transition-all dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-600"
                  >
                    <span className="material-symbols-outlined text-base mr-1.5">
                      open_in_new
                    </span>
                    Portal Maritim
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="relative overflow-hidden rounded-2xl bg-[#eff6ff] border border-blue-100 dark:bg-[#1e293b] dark:border-blue-900/50 p-8 shadow-sm">
          <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-blue-100 dark:bg-blue-900/20 rounded-full blur-3xl opacity-50 pointer-events-none"></div>
          <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-8">
            <div className="flex items-start gap-5 max-w-2xl">
              <div className="hidden sm:flex items-center justify-center size-14 rounded-full bg-white text-primary shadow-sm border border-blue-100 dark:bg-gray-800 dark:border-gray-700 dark:text-blue-400 shrink-0">
                <span className="material-symbols-outlined text-3xl">
                  mark_email_unread
                </span>
              </div>
              <div>
                <h3 className="text-xl font-bold text-[#0d141b] dark:text-white mb-2">
                  Berlangganan Notifikasi Peringatan Dini
                </h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
                  Jangan sampai ketinggalan! Dapatkan notifikasi peringatan cuaca
                  ekstrem dan gelombang tinggi langsung ke email Anda.
                </p>
              </div>
            </div>
            <div className="w-full lg:w-auto shrink-0">
              <form
                className="flex flex-col sm:flex-row gap-3 w-full"
                onSubmit={(e) => e.preventDefault()}
              >
                <input
                  className="w-full sm:w-72 rounded-xl border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-sm px-4 py-3 focus:border-primary focus:ring-primary shadow-sm placeholder:text-gray-400"
                  placeholder="Masukkan alamat email Anda"
                  required
                  type="email"
                />
                <button
                  className="flex items-center justify-center whitespace-nowrap rounded-xl bg-primary hover:bg-blue-600 text-white font-bold text-sm px-6 py-3 transition-all shadow-md hover:shadow-lg active:scale-95"
                  type="submit"
                >
                  Langganan Sekarang
                </button>
              </form>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-3 text-center sm:text-left">
                Gratis & dapat berhenti berlangganan kapan saja.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
