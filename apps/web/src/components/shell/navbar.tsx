// import { Link } from "@tanstack/react-router";

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-solid border-b-[#e7edf3] bg-white/95 backdrop-blur-md px-4 sm:px-10 lg:px-40 py-4">
      <div className="mx-auto max-w-7xl flex items-center justify-between whitespace-nowrap">
        <div className="flex items-center gap-10">
          <div className="flex items-center gap-1 text-[#0d141b]">
            <div className="size-9 text-primary flex items-center justify-center">
              <span className="material-symbols-outlined text-3xl">storm</span>
            </div>
            <h2 className="text-[#0d141b] text-xl font-bold leading-tight tracking-[-0.015em]">
              BMKG Cilacap
            </h2>
          </div>
          <div className="hidden lg:flex items-center gap-6">
            {[
              "Beranda",
              "Cuaca Publik",
              "Maritim",
              "Penerbangan",
              "Artikel",
              "Press Release",
            ].map((item) => (
              <a
                key={item}
                className="text-[#0d141b] text-sm font-medium hover:text-primary transition-colors leading-normal"
                href="#"
              >
                {item}
              </a>
            ))}
          </div>
        </div>
        <div className="flex flex-1 justify-end gap-4 sm:gap-8">
          <label className="hidden sm:flex flex-col min-w-40 h-10! max-w-64">
            <div className="flex w-full flex-1 items-stretch rounded-lg h-full border border-[#cfdbe7] bg-[#f8fafc]">
              <div className="text-[#4c739a] flex border-none bg-transparent items-center justify-center pl-4 rounded-l-lg border-r-0">
                <span className="material-symbols-outlined text-[20px]">
                  search
                </span>
              </div>
              <input
                className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-[#0d141b] focus:outline-0 focus:ring-0 border-none bg-transparent focus:border-none h-full placeholder:text-[#4c739a] px-4 rounded-l-none border-l-0 pl-2 text-sm font-normal leading-normal"
                placeholder="Cari kota atau wilayah..."
              />
            </div>
          </label>
          <button className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 bg-primary hover:bg-primary-dark transition-colors text-white text-sm font-bold leading-normal tracking-[0.015em]">
            <span className="truncate">Lapor Cuaca</span>
          </button>
        </div>
      </div>
    </header>
  );
}
