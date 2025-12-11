export function Footer() {
  return (
    <footer className="bg-white dark:bg-background-dark border-t border-[#e7edf3] dark:border-gray-800 py-10 px-10 lg:px-40">
      <div className="mx-auto max-w-7xl flex flex-col md:flex-row justify-between gap-10">
        <div className="flex flex-col gap-4 max-w-sm">
          <div className="flex items-center gap-3 text-[#0d141b] dark:text-white">
            <div className="size-6 text-primary">
              <svg
                fill="none"
                viewBox="0 0 48 48"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M42.4379 44C42.4379 44 36.0744 33.9038 41.1692 24C46.8624 12.9336 42.2078 4 42.2078 4L7.01134 4C7.01134 4 11.6577 12.932 5.96912 23.9969C0.876273 33.9029 7.27094 44 7.27094 44L42.4379 44Z"
                  fill="currentColor"
                ></path>
              </svg>
            </div>
            <h3 className="text-lg font-bold">Stasiun Meteorologi Cilacap</h3>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
            Lembaga resmi penyedia layanan informasi cuaca, iklim, dan
            geofisika. Berkomitmen untuk memberikan data akurat demi keselamatan
            bangsa.
          </p>
          <div className="flex gap-4 mt-2">
            <a className="text-gray-400 hover:text-primary" href="#">
              <span className="material-symbols-outlined">
                social_leaderboard
              </span>
            </a>
            <a className="text-gray-400 hover:text-primary" href="#">
              <span className="material-symbols-outlined">alternate_email</span>
            </a>
            <a className="text-gray-400 hover:text-primary" href="#">
              <span className="material-symbols-outlined">play_circle</span>
            </a>
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-8">
          <div className="flex flex-col gap-3">
            <h4 className="text-[#0d141b] dark:text-white font-bold text-sm uppercase tracking-wide">
              Layanan
            </h4>
            <a className="text-gray-500 hover:text-primary text-sm" href="#">
              Cuaca Publik
            </a>
            <a className="text-gray-500 hover:text-primary text-sm" href="#">
              Maritim
            </a>
            <a className="text-gray-500 hover:text-primary text-sm" href="#">
              Penerbangan
            </a>
            <a className="text-gray-500 hover:text-primary text-sm" href="#">
              Kualitas Udara
            </a>
          </div>
          <div className="flex flex-col gap-3">
            <h4 className="text-[#0d141b] dark:text-white font-bold text-sm uppercase tracking-wide">
              Perusahaan
            </h4>
            <a className="text-gray-500 hover:text-primary text-sm" href="#">
              Tentang Kami
            </a>
            <a className="text-gray-500 hover:text-primary text-sm" href="#">
              Struktur Organisasi
            </a>
            <a className="text-gray-500 hover:text-primary text-sm" href="#">
              Karir
            </a>
            <a className="text-gray-500 hover:text-primary text-sm" href="#">
              Berita & Pers
            </a>
          </div>
          <div className="flex flex-col gap-3">
            <h4 className="text-[#0d141b] dark:text-white font-bold text-sm uppercase tracking-wide">
              Bantuan
            </h4>
            <a className="text-gray-500 hover:text-primary text-sm" href="#">
              Hubungi Kami
            </a>
            <a className="text-gray-500 hover:text-primary text-sm" href="#">
              FAQ
            </a>
            <a className="text-gray-500 hover:text-primary text-sm" href="#">
              Peta Situs
            </a>
            <a className="text-gray-500 hover:text-primary text-sm" href="#">
              Kebijakan Privasi
            </a>
          </div>
        </div>
      </div>
      <div className="mx-auto max-w-7xl mt-10 pt-6 border-t border-gray-100 dark:border-gray-800 flex flex-col sm:flex-row justify-between items-center text-xs text-gray-400">
        <p>© 2023 Stasiun Cuaca Pusat. Hak Cipta Dilindungi.</p>
        <div className="flex gap-4 mt-4 sm:mt-0">
          <span>ISO 9001:2015 Certified</span>
          <span>WMO Member</span>
        </div>
      </div>
    </footer>
  );
}
