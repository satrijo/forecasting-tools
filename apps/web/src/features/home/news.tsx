import React from "react";

const News: React.FC = () => {
  return (
    <section className="w-full py-12 lg:py-16 px-4 sm:px-10 lg:px-40 bg-white dark:bg-background-dark">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col md:flex-row items-start md:items-end justify-between mb-10 gap-6">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <span className="bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                Berita & Publikasi
              </span>
            </div>
            <h2 className="text-3xl font-bold text-[#0d141b] dark:text-white">
              Publikasi & Pengumuman
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mt-2 max-w-2xl">
              Berita cuaca terbaru, artikel edukasi, dan pengumuman resmi dari BMKG Cilacap.
            </p>
          </div>
          <div className="flex gap-3">
            <a
              className="flex items-center justify-center h-12 px-6 rounded-xl bg-white border border-gray-200 hover:bg-gray-50 hover:border-gray-300 text-gray-700 font-bold text-sm transition-all dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-700"
              href="#"
            >
              Lihat Semua Artikel
              <span className="material-symbols-outlined text-lg ml-2">arrow_forward</span>
            </a>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Article 1 */}
          <article className="flex flex-col h-full bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 group">
            <div className="h-56 w-full relative overflow-hidden bg-gray-100">
              <img
                alt="Storm clouds"
                className="object-cover w-full h-full transition-transform duration-700 group-hover:scale-110"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuDymN5lPqVASPV69pD8qXMZ95M7HwSIT0qE2Fk4Ge96eN3Hf4JEGSv6lYakl2EKZR2prdPLUUrIyun2xDHQN9RGf90ex2_ApJziEwRoRFM3H-zLxdVVLNn6KO9FLP7zVdnu2u0IdBv5U2bAYh6bxIVeU5sNCHpSrfEowntLabpUNgBdCLJVl5wirbtPquXwm8OVFRwvr0WmeN1djl2fdOxqggO9WVHpw6nT2MK4kjWPPRhAr2_9LQbn8vq1OfVKy9DqGWLlk5-1Kh8"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
              <div className="absolute top-4 left-4">
                <span className="px-3 py-1 bg-primary/90 backdrop-blur text-white text-xs font-bold rounded-full uppercase tracking-wide shadow-sm">
                  Artikel Utama
                </span>
              </div>
            </div>
            <div className="p-6 flex flex-col flex-1">
              <div className="flex items-center gap-2 mb-3">
                <span className="material-symbols-outlined text-sm text-gray-400">
                  schedule
                </span>
                <span className="text-gray-500 dark:text-gray-400 text-xs font-medium">
                  12 Oktober 2023
                </span>
              </div>
              <h3 className="text-xl font-bold text-[#0d141b] dark:text-white mb-3 group-hover:text-primary transition-colors line-clamp-2">
                Analisis Musim Hujan 2024: Puncak Diprediksi Januari
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed mb-6 flex-1 line-clamp-3">
                Fenomena Monsun Asia menguat secara signifikan, meningkatkan
                curah hujan di wilayah Indonesia bagian barat dan berpotensi
                memicu hidrometeorologi basah.
              </p>
              <a
                className="inline-flex items-center text-primary font-bold text-sm hover:gap-2 transition-all mt-auto group/link"
                href="#"
              >
                Baca Selengkapnya
                <span className="material-symbols-outlined text-lg ml-1 group-hover/link:translate-x-1 transition-transform">
                  arrow_forward
                </span>
              </a>
            </div>
          </article>
          {/* Article 2 */}
          <article className="flex flex-col h-full bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 group">
            <div className="h-56 w-full relative overflow-hidden bg-gray-100">
              <img
                alt="Airplane in clouds"
                className="object-cover w-full h-full transition-transform duration-700 group-hover:scale-110"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuCe8pmR0ffX1X1nlLqda7YKZb-lb3OVZBJWvm5Jg5jEeF2DAmBNzxOZkUQtMMaKEEZtT3X2CC8-vn3ZRwO1MCwQc6UtxqQ119m-2Ie6gTHSWVn56n08oXipJjby0A_6vOZkYjtMRrLDpGXx4Mg1v6_bEg-adnCIDhg90jggdwn9jUxuXQRYMhh38ez1CZ7JLMUfIZEiFF6imd4b-C03tLHWsbOidYgBMSMQU8Y5zTIpU3XMB6rfek04RMz_AhGY3hNVmf4ipd_vUbo"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
              <div className="absolute top-4 left-4">
                <span className="px-3 py-1 bg-orange-500/90 backdrop-blur text-white text-xs font-bold rounded-full uppercase tracking-wide shadow-sm">
                  Edukasi
                </span>
              </div>
            </div>
            <div className="p-6 flex flex-col flex-1">
              <div className="flex items-center gap-2 mb-3">
                <span className="material-symbols-outlined text-sm text-gray-400">
                  schedule
                </span>
                <span className="text-gray-500 dark:text-gray-400 text-xs font-medium">
                  08 Oktober 2023
                </span>
              </div>
              <h3 className="text-xl font-bold text-[#0d141b] dark:text-white mb-3 group-hover:text-primary transition-colors line-clamp-2">
                Mengenal Awan Cumulonimbus (Cb) dan Bahayanya
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed mb-6 flex-1 line-clamp-3">
                Awan vertikal menjulang yang sering dikaitkan dengan cuaca
                ekstrem, turbulensi hebat, dan badai petir yang membahayakan
                penerbangan.
              </p>
              <a
                className="inline-flex items-center text-primary font-bold text-sm hover:gap-2 transition-all mt-auto group/link"
                href="#"
              >
                Baca Selengkapnya
                <span className="material-symbols-outlined text-lg ml-1 group-hover/link:translate-x-1 transition-transform">
                  arrow_forward
                </span>
              </a>
            </div>
          </article>
          {/* Press Release List */}
          <div className="flex flex-col h-full bg-slate-50 dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm">
            <div className="bg-gray-100 dark:bg-gray-700 px-6 py-4 border-b border-gray-200 dark:border-gray-600 flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-700 dark:text-gray-200 flex items-center gap-2">
                <span className="material-symbols-outlined text-2xl text-primary">
                  campaign
                </span>
                Press Release
              </h3>
              <a
                className="text-xs font-bold text-primary hover:underline flex items-center gap-1"
                href="#"
              >
                Arsip
                <span className="material-symbols-outlined text-sm">folder_open</span>
              </a>
            </div>
            <div className="p-6 space-y-4 flex-1">
              <a
                className="group block bg-white dark:bg-gray-700 p-4 rounded-xl border border-gray-200 dark:border-gray-600 hover:border-primary/50 hover:shadow-md transition-all cursor-pointer"
                href="#"
              >
                <div className="flex justify-between items-start mb-2">
                  <span className="text-[10px] font-bold text-blue-600 bg-blue-100 dark:bg-blue-900/30 dark:text-blue-300 px-2 py-0.5 rounded">
                    Siaran Pers
                  </span>
                  <span className="text-[10px] text-gray-500 dark:text-gray-400">1 Hari lalu</span>
                </div>
                <h4 className="font-bold text-sm text-[#0d141b] dark:text-white leading-snug group-hover:text-primary transition-colors">
                  Kesiapsiagaan Menghadapi Potensi Cuaca Ekstrem Akhir Tahun
                </h4>
                <div className="flex items-center gap-1 mt-3 text-xs font-bold text-gray-500 dark:text-gray-400 group-hover:text-primary transition-colors">
                  <span className="material-symbols-outlined text-sm">
                    download
                  </span>
                  Unduh PDF
                </div>
              </a>
              <a
                className="group block bg-white dark:bg-gray-700 p-4 rounded-xl border border-gray-200 dark:border-gray-600 hover:border-primary/50 hover:shadow-md transition-all cursor-pointer"
                href="#"
              >
                <div className="flex justify-between items-start mb-2">
                  <span className="text-[10px] font-bold text-purple-600 bg-purple-100 dark:bg-purple-900/30 dark:text-purple-300 px-2 py-0.5 rounded">
                    Konferensi
                  </span>
                  <span className="text-[10px] text-gray-500 dark:text-gray-400">3 Hari lalu</span>
                </div>
                <h4 className="font-bold text-sm text-[#0d141b] dark:text-white leading-snug group-hover:text-primary transition-colors">
                  Peluncuran Sistem Peringatan Dini Gempa Bumi Generasi Terbaru
                </h4>
                <div className="flex items-center gap-1 mt-3 text-xs font-bold text-gray-500 dark:text-gray-400 group-hover:text-primary transition-colors">
                  <span className="material-symbols-outlined text-sm">
                    play_circle
                  </span>
                  Lihat Rekaman
                </div>
              </a>
            </div>
            <div className="px-6 pb-6">
              <button className="w-full h-12 rounded-xl bg-white border border-gray-200 hover:bg-gray-50 hover:border-gray-300 text-gray-700 font-bold text-sm transition-all dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-600 flex items-center justify-center gap-2">
                Lihat Semua Rilis
                <span className="material-symbols-outlined text-lg">
                  chevron_right
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default News;
