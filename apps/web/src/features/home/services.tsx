import React from "react";

const Services: React.FC = () => {
  const services = [
    {
      title: "Cuaca Publik",
      desc: "Prakiraan cuaca harian dan info kualitas udara untuk merencanakan aktivitas Anda dengan lebih baik.",
      icon: "sunny",
      image:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuDH71wIxEJefomWvADhMnBbG2du2HiGy6barBDB9zSGAJH0l67KzZxHNK6IKz8LBXrs02wW4wvwharcl-BDlxPAId9NpAmOOiPDm1g9e2TmZCYy5otf4PKeMn9hH1E8l4pMD2wFHrGn6VN_P0XJVUWGqleZt-sGz7VXXfSq0Yw41RncZ1knoke1F818swNOPr1-k6pcFzCYeqDXINj-b-kq24J5CnsOMy9pm5UtMz0aDB_Hslf0QdLOxp1sl77z69WH7EF__bQqx0I",
      linkText: "Akses Portal Publik",
    },
    {
      title: "Cuaca Maritim",
      desc: "Info gelombang, arus laut, dan angin untuk nelayan dan pelaut agar tetap aman di laut.",
      icon: "sailing",
      image:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuDvliNCx7pTGRyiFIkvD566jUZkrwZhJL7iljcu4GOS-zh_A457Do5TizuhrM8oEBDWLA3XjgMFjUhxXQozY7D1-nbjMHHBvgVIW6wk9ALJ7vMvUeHYZizSA2yH7ZXJSPiPAM0JukSiy011pf2GaW1ZkwGgVOqiyZAspA1BRFdktyhYRbAuMEHlmg3f3SKz7RycTj191UW40GGFiNNn9xuWk2W1ZWxDnQYgrjObeNStNKthpZoHEewnPtJG2Mphecs_YWsamF8WxJs",
      linkText: "Akses Portal Maritim",
    },
    {
      title: "Penerbangan",
      desc: "Data cuaca bandara termasuk METAR, TAF, dan kondisi penerbangan untuk operasional aviasi.",
      icon: "flight_takeoff",
      image:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuBONoN0dHl3TMLL-c3kR9JKnpQCnMYEHKe3mI0Nm7jBZZkbYuXPsgkfgE3pEB1Lw41-WBBuHs-cMmPWZtI0RXxGOUNTKKm_YnXQeEnbtTsancs35946YzB30FgWhodE6ABx77f29VTIP1NByMtlFRUNXItqAeQpnAsseGGwkfshuLVvTxywJCmESU4WsTYrh7SXofe8bLsof7emBkg3VruE1swzaTlEG3rmoIP3tEq6jjdmK5I_2CmIOKBdeB40BlHqaPu-RWkgpn4",
      linkText: "Akses Portal Bandara",
    },
  ];

  return (
    <section className="w-full py-12 lg:py-16 px-4 sm:px-10 lg:px-40 bg-slate-50 dark:bg-gray-900/50">
      <div className="mx-auto max-w-7xl">
        <div className="mb-10">
          <div className="flex items-center gap-2 mb-4">
            <span className="bg-sky-100 text-sky-600 dark:bg-sky-900/30 dark:text-sky-400 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
              Layanan Kami
            </span>
          </div>
          <h2 className="text-3xl font-bold text-[#0d141b] dark:text-white">
            Layanan Informasi Terintegrasi
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-2 max-w-2xl">
            Akses informasi cuaca lengkap untuk berbagai kebutuhan, dari aktivitas sehari-hari hingga operasional khusus.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {services.map((service, index) => (
            <div
              key={index}
              className="group bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all duration-300 flex flex-col overflow-hidden shadow-sm"
            >
              <div className="h-48 w-full bg-slate-100 relative overflow-hidden">
                <div
                  className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
                  style={{ backgroundImage: `url("${service.image}")` }}
                ></div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                <div className="absolute bottom-4 left-4 text-white">
                  <span className="material-symbols-outlined text-4xl">
                    {service.icon}
                  </span>
                </div>
              </div>
              <div className="p-6 flex flex-col flex-1">
                <h3 className="text-xl font-bold text-[#0d141b] dark:text-white mb-2">
                  {service.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-6 flex-1 leading-relaxed">
                  {service.desc}
                </p>
                <a
                  className="inline-flex items-center text-primary font-bold text-sm transition-all group/link"
                  href="#"
                >
                  {service.linkText}
                  <span className="material-symbols-outlined text-lg ml-1 group-hover/link:translate-x-1 transition-transform">
                    arrow_forward
                  </span>
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Services;
