import { Hono } from "hono";
import {
  AWSDataFetcher,
  BMKGAuth,
  PublicWeather,
  publicToGeoJSON,
  filterPublicGeoJSON,
} from "weather-client";
import { awsToGeoJSON } from "weather-client";
import regionalCodes from "../regional-codes";

// Helper function with timeout
function withTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<never>((_, reject) =>
      setTimeout(
        () => reject(new Error(`Request timed out after ${timeoutMs}ms`)),
        timeoutMs,
      ),
    ),
  ]);
}

// Load credentials from environment variables
const username = process.env.BMKG_USERNAME;
const password = process.env.BMKG_PASSWORD;

// Validate credentials
if (!username || !password) {
  throw new Error(
    "BMKG_USERNAME and BMKG_PASSWORD must be set in environment variables",
  );
}

// Load regional codes data from generated file
const regionalCodesData = regionalCodes;

// Helper function to get parent names from ADM4 code
function getParentNames(adm4Code: string) {
  const parts = adm4Code.split(".");
  const provinceCode = parts[0];
  const regencyCode = parts.slice(0, 2).join(".");
  const districtCode = parts.slice(0, 3).join(".");

  const province = regionalCodesData.find(
    (code) => code.code === provinceCode && code.level === 1,
  );
  const regency = regionalCodesData.find(
    (code) => code.code === regencyCode && code.level === 2,
  );
  const district = regionalCodesData.find(
    (code) => code.code === districtCode && code.level === 3,
  );

  return {
    province_name: province?.name || "Unknown Province",
    regency_name: regency?.name || "Unknown Regency",
    district_name: district?.name || "Unknown District",
  };
}

const mcp = new Hono();

// Helper function to format weather results
function formatWeatherResult(data: any, format: string) {
  if (format === "geojson") {
    return awsToGeoJSON(data);
  }
  return data;
}

// Manual MCP server implementation for serverless environment
mcp.post("/", async (c) => {
  const startTime = Date.now();
  const clientIP =
    c.req.header("CF-Connecting-IP") ||
    c.req.header("X-Forwarded-For") ||
    "unknown";

  console.log(
    `[MCP] Request from ${clientIP} - Method: ${JSON.stringify(await c.req.json().catch(() => ({ method: "invalid" })))}`,
  );

  try {
    const request = await c.req.json();
    const { jsonrpc, method, params, id } = request;

    console.log(`[MCP] Processing ${method} request (ID: ${id})`);

    // Validate JSON-RPC format
    if (jsonrpc !== "2.0" || !method) {
      console.warn(`[MCP] Invalid JSON-RPC request format`);
      return c.json({
        jsonrpc: "2.0",
        error: { code: -32600, message: "Invalid Request" },
        id,
      });
    }

    const auth = new BMKGAuth(username, password);
    const fetcher = new AWSDataFetcher(auth);

    switch (method) {
      case "initialize":
        return c.json({
          jsonrpc: "2.0",
          result: {
            protocolVersion: "2024-11-05",
            capabilities: {
              tools: {},
            },
            serverInfo: {
              name: "bmkg-weather-mcp",
              version: "1.0.0",
            },
          },
          id,
        });

      case "tools/list":
        return c.json({
          jsonrpc: "2.0",
          result: {
            tools: [
              {
                name: "get_weather_by_province",
                description:
                  "Mendapatkan data stasiun cuaca terkini untuk semua stasiun otomatis/alat ukur cuaca dalam satu provinsi Indonesia. Mengembalikan observasi cuaca real-time termasuk suhu, kelembaban, kecepatan/arah angin, curah hujan, dan tekanan atmosfer dari berbagai jenis stasiun otomatis BMKG (AWS, ARG, ASRS, soil moisture, climatological micro, dll.). Gunakan kode provinsi seperti PR013 untuk Jawa Tengah. Set type ke null untuk mendapatkan semua jenis stasiun, atau filter berdasarkan jenis tertentu (aws, arg, soil, dll.).",
                inputSchema: {
                  type: "object",
                  properties: {
                    province: {
                      type: "string",
                      description:
                        "Kode provinsi: PR001=Nanggroe Aceh Darusalam, PR002=Sumatera Utara, PR003=Sumatera Barat, PR004=Sumatera Selatan, PR005=Riau, PR006=Jambi, PR007=Bengkulu, PR008=Lampung, PR009=Kepulauan Bangka Belitung, PR010=Kepulauan Riau, PR011=DKI Jakarta, PR012=Jawa Barat, PR013=Jawa Tengah, PR014=Banten, PR015=Jawa Timur, PR016=DI Yogyakarta, PR017=Bali, PR018=Nusa Tenggara Barat, PR019=Nusa Tenggara Timur, PR020=Kalimantan Barat, PR021=Kalimantan Tengah, PR022=Kalimantan Selatan, PR023=Kalimantan Timur, PR024=Kalimantan Utara, PR025=Sulawesi Utara, PR026=Sulawesi Tengah, PR027=Sulawesi Selatan, PR028=Sulawesi Tenggara, PR029=Gorontalo, PR030=Sulawesi Barat, PR031=Maluku, PR032=Maluku Utara, PR033=Papua, PR034=Papua Barat",
                    },
                    type: {
                      type: "string",
                      enum: [
                        "aws",
                        "aaws",
                        "arg",
                        "asrs",
                        "soil",
                        "iklimmikro",
                      ],
                      description: "Filter jenis stasiun",
                    },
                    format: {
                      type: "string",
                      enum: ["json", "geojson"],
                      description: "Format output",
                      default: "json",
                    },
                  },
                  required: ["province"],
                },
              },
              {
                name: "get_weather_by_city",
                description:
                  "Mendapatkan data stasiun cuaca terkini untuk semua stasiun otomatis/alat ukur cuaca dalam satu kota Indonesia. Mengembalikan observasi cuaca real-time termasuk suhu, kelembaban, kecepatan/arah angin, curah hujan, dan tekanan atmosfer dari berbagai jenis stasiun otomatis BMKG (AWS, ARG, ASRS, soil moisture, climatological micro, dll.). Gunakan nama kota seperti cilacap, semarang, dll. Set type ke null untuk mendapatkan semua jenis stasiun, atau filter berdasarkan jenis tertentu (aws, arg, soil, dll.).",
                inputSchema: {
                  type: "object",
                  properties: {
                    city: {
                      type: "string",
                      description: "Nama kota (contoh: cilacap, semarang)",
                    },
                    type: {
                      type: "string",
                      enum: [
                        "aws",
                        "aaws",
                        "arg",
                        "asrs",
                        "soil",
                        "iklimmikro",
                      ],
                      description: "Filter jenis stasiun",
                    },
                    format: {
                      type: "string",
                      enum: ["json", "geojson"],
                      description: "Format output",
                      default: "json",
                    },
                  },
                  required: ["city"],
                },
              },
              {
                name: "get_weather_by_stations",
                description:
                  "Mendapatkan data stasiun cuaca terkini untuk ID stasiun otomatis tertentu, bisa multiple stasiun dengan berbagai jenis. Mengembalikan observasi cuaca real-time termasuk suhu, kelembaban, kecepatan/arah angin, curah hujan, dan tekanan atmosfer dari berbagai jenis stasiun otomatis BMKG (AWS, ARG, ASRS, soil moisture, climatological micro, dll.). Gunakan ID stasiun seperti STA3024, STA2201, STM1002, STW1058, STA3022, STA2033, 150077, STG1042, AAWS0357, STA3020, STA0052, STA5092, STA0047, STA0056, STG1035, STA2173, 150302, STG1043, STA0049, STA0044, dll. Set type ke null untuk mendapatkan semua jenis stasiun, atau filter berdasarkan jenis tertentu (aws, arg, soil, dll.).",
                inputSchema: {
                  type: "object",
                  properties: {
                    stations: {
                      type: "array",
                      items: { type: "string" },
                      description:
                        "Array ID stasiun (contoh: ['STA1101', 'STA1102'])",
                    },
                    type: {
                      type: "string",
                      enum: [
                        "aws",
                        "aaws",
                        "arg",
                        "asrs",
                        "soil",
                        "iklimmikro",
                      ],
                      description: "Filter jenis stasiun",
                      default: "aws",
                    },
                    format: {
                      type: "string",
                      enum: ["json", "geojson"],
                      description: "Format output",
                      default: "json",
                    },
                  },
                  required: ["stations"],
                },
              },
              {
                name: "get_weather_by_radius",
                description:
                  "Mendapatkan data stasiun cuaca terkini dalam radius tertentu dari koordinat geografis. Mengembalikan observasi cuaca real-time termasuk suhu, kelembaban, kecepatan/arah angin, curah hujan, dan tekanan atmosfer dari berbagai jenis stasiun otomatis BMKG (AWS, ARG, ASRS, soil moisture, climatological micro, dll.) yang berada dalam radius yang ditentukan. Gunakan koordinat latitude dan longitude sebagai pusat pencarian, dengan radius dalam kilometer (default 50km). Set type ke null untuk mendapatkan semua jenis stasiun, atau filter berdasarkan jenis tertentu (aws, arg, soil, dll.).",
                inputSchema: {
                  type: "object",
                  properties: {
                    lat: {
                      type: "number",
                      description: "Latitude",
                    },
                    lon: {
                      type: "number",
                      description: "Longitude",
                    },
                    radius: {
                      type: "number",
                      description: "Radius dalam kilometer",
                      default: 50,
                    },
                    type: {
                      type: "string",
                      enum: [
                        "aws",
                        "aaws",
                        "arg",
                        "asrs",
                        "soil",
                        "iklimmikro",
                      ],
                      description: "Filter jenis stasiun",
                    },
                    format: {
                      type: "string",
                      enum: ["json", "geojson"],
                      description: "Format output",
                      default: "json",
                    },
                  },
                  required: ["lat", "lon"],
                },
              },
              {
                name: "get_public_weather_warnings",
                description:
                  "Mendapatkan data peringatan dini cuaca ekstrem (nowcasting) dari seluruh Indonesia melalui API publik BMKG. Tool ini menyediakan informasi peringatan dini untuk kondisi cuaca ekstrem khususnya hujan ekstrem di wilayah daratan seperti hujan lebat, hujan sangat lebat yang dapat menyebabkan banjir, tanah longsor, dan dampak hidrometeorologi lainnya. Jika parameter 'province' tidak diberikan, tool akan mengembalikan daftar semua provinsi yang sedang memiliki data peringatan dini cuaca aktif. Gunakan type 'databmkg' untuk mendapatkan data peringatan dini berdasarkan provinsi, dengan nama provinsi menggunakan underscore (_) sebagai pengganti spasi (contoh: 'jawa_tengah', 'sumatera_barat'). Data ini sangat penting untuk kesiapsiagaan menghadapi bencana hidrometeorologi di wilayah daratan.",
                inputSchema: {
                  type: "object",
                  properties: {
                    type: {
                      type: "string",
                      enum: ["databmkg", "xml", "signature"],
                      description:
                        "Tipe sumber data - gunakan 'databmkg' untuk data peringatan dini cuaca ekstrem",
                      default: "databmkg",
                    },
                    code: {
                      type: "string",
                      description:
                        "Kode provinsi untuk API signature (contoh: CJH, CJT)",
                    },
                    province: {
                      type: "string",
                      description:
                        "Nama provinsi untuk API XML/databmkg dengan underscore (_) sebagai pengganti spasi (contoh: jawa_tengah, sumatera_barat, dki_jakarta). Jika tidak diberikan, akan mengembalikan daftar provinsi yang aktif memiliki data peringatan dini.",
                    },
                  },
                },
              },
              {
                name: "get_weather_by_location",
                description:
                  "Mendapatkan data informasi cuaca saat ini DAN prakiraan cuaca ke depan dalam satu permintaan berdasarkan kode lokasi ADM4 atau koordinat geografis. Tool ini memberikan data cuaca model untuk kondisi saat ini (bukan observasi real-time) serta prakiraan cuaca untuk beberapa hari ke depan. Perbedaannya dengan tool get_forecast_* adalah tool ini mencakup informasi cuaca 'saat ini' dari model cuaca, sedangkan get_forecast_* hanya memberikan prakiraan murni ke depan tanpa data saat ini.",
                inputSchema: {
                  type: "object",
                  properties: {
                    code: {
                      type: "string",
                      description: "Kode lokasi ADM4 (contoh: 33.01.22.1003)",
                    },
                    lat: {
                      type: "number",
                      description: "Koordinat latitude",
                    },
                    lon: {
                      type: "number",
                      description: "Koordinat longitude",
                    },
                  },
                  oneOf: [{ required: ["code"] }, { required: ["lat", "lon"] }],
                },
              },
              {
                name: "get_regional_codes",
                description:
                  "Mencari dan mendapatkan kode wilayah administrasi Indonesia (ADM1-4) yang digunakan untuk prakiraan cuaca BMKG. Tool ini menyediakan database lengkap kode wilayah dari tingkat provinsi (ADM1) hingga desa/kelurahan (ADM4) dengan format kode seperti '33.01.22.1003'. Kode-kode ini diperlukan sebagai parameter input untuk tools prakiraan cuaca seperti get_forecast_by_adm1, get_forecast_by_adm2, get_forecast_by_adm3, dan get_forecast_by_adm4. Gunakan parameter query untuk pencarian berdasarkan nama wilayah, level untuk filter tingkat administrasi, dan parent_code untuk mencari sub-wilayah dari kode induk tertentu.",
                inputSchema: {
                  type: "object",
                  properties: {
                    query: {
                      type: "string",
                      description: "Query pencarian nama wilayah (opsional)",
                    },
                    level: {
                      type: "number",
                      enum: [1, 2, 3, 4],
                      description:
                        "Tingkat administrasi: 1=Provinsi, 2=Kabupaten/Kota, 3=Kecamatan, 4=Desa",
                    },
                    parent_code: {
                      type: "string",
                      description:
                        "Kode wilayah induk untuk memfilter anak (contoh: '11' untuk semua wilayah Aceh)",
                    },
                    limit: {
                      type: "number",
                      description: "Maksimum jumlah hasil yang dikembalikan",
                      default: 100,
                    },
                  },
                },
              },
              {
                name: "get_forecast_by_location",
                description:
                  "TOOL UTAMA untuk query prakiraan cuaca. Secara otomatis mendeteksi tingkat administrasi (provinsi, kabupaten/regency, kota/city, kecamatan/district, desa/village) " +
                  "dengan memeriksa kode wilayah dan memilih data prakiraan yang paling sesuai. " +
                  "Gunakan tool ini untuk SEMUA query cuaca umum seperti 'cuaca di Jakarta', 'weather in Banyumas', 'forecast for Purwokerto', 'cuaca kota Semarang', dll. " +
                  "Mendukung semua tingkat administrasi dan secara otomatis memprioritaskan lokasi yang paling spesifik. " +
                  "Untuk nama yang ambigu (contoh: 'kota' bisa berarti ADM2 atau ADM3), secara cerdas memilih berdasarkan data kode wilayah. " +
                  "Saat menjelaskan kondisi cuaca, gunakan kode cuaca BMKG standar: " +
                  "0=Cerah, 1=Cerah Berawan, 2=Cerah Berawan, 3=Berawan, 4=Berawan Tebal, " +
                  "5=Udara Kabur, 10=Asap, 45=Kabut, 60=Hujan Ringan, 61=Hujan Sedang, " +
                  "63=Hujan Lebat, 80=Hujan Lokal, 95=Hujan Petir, 97=Hujan Petir. " +
                  "Untuk arah angin, gunakan kode CARD: N=Utara, NE=Timur Laut, E=Timur, " +
                  "SE=Tenggara, S=Selatan, SW=Barat Daya, W=Barat, NW=Barat Laut, VARIABLE=Berubah-ubah. " +
                  "Berikan penjelasan yang jelas dan detail menggunakan kode standar ini untuk akurasi meteorologi yang lebih baik.",
                inputSchema: {
                  type: "object",
                  properties: {
                    location: {
                      type: "string",
                      description:
                        "Nama lokasi (tingkat administrasi apa saja: provinsi, kabupaten/kota, kecamatan, desa/kelurahan)",
                    },
                  },
                  required: ["location"],
                },
              },
              {
                name: "get_forecast_by_adm4",
                description:
                  "Mendapatkan prakiraan cuaca untuk desa/kelurahan tertentu berdasarkan kode ADM4 atau nama desa. " +
                  "Gunakan tool ini ketika pengguna bertanya cuaca di desa tertentu, kelurahan, atau memberikan kode ADM4 13 digit. " +
                  "Contoh: 'cuaca di desa bancarkembar', 'weather in kelurahan sudirman', atau kode ADM4 '33.02.27.1002'. " +
                  "Saat menjelaskan kondisi cuaca, gunakan kode cuaca BMKG standar: " +
                  "0=Cerah, 1=Cerah Berawan, 2=Cerah Berawan, 3=Berawan, 4=Berawan Tebal, " +
                  "5=Udara Kabur, 10=Asap, 45=Kabut, 60=Hujan Ringan, 61=Hujan Sedang, " +
                  "63=Hujan Lebat, 80=Hujan Lokal, 95=Hujan Petir, 97=Hujan Petir. " +
                  "Untuk arah angin, gunakan kode CARD: N=Utara, NE=Timur Laut, E=Timur, " +
                  "SE=Tenggara, S=Selatan, SW=Barat Daya, W=Barat, NW=Barat Laut, VARIABLE=Berubah-ubah. " +
                  "Berikan penjelasan yang jelas dan detail menggunakan kode standar ini untuk akurasi meteorologi yang lebih baik.",
                inputSchema: {
                  type: "object",
                  properties: {
                    adm4: {
                      type: "string",
                      description:
                        "Kode ADM4 atau nama desa (desa/kelurahan, contoh: '33.02.27.1002' atau 'bancarkembar')",
                    },
                  },
                  required: ["adm4"],
                },
              },
              {
                name: "get_forecast_by_adm3",
                description:
                  "Mendapatkan prakiraan cuaca untuk kecamatan berdasarkan kode ADM3 atau nama kecamatan. " +
                  "Gunakan tool ini ketika pengguna bertanya cuaca di kecamatan atau memberikan kode ADM3 8 digit. " +
                  "Contoh: 'cuaca di kecamatan purwokerto utara', 'weather in district banjarsari', atau kode ADM3 '33.02.27'. " +
                  "Tool ini mencari kode ADM4 dalam kecamatan yang ditentukan dan mengembalikan data prakiraan representatif. " +
                  "Saat menjelaskan kondisi cuaca, gunakan kode cuaca BMKG standar: " +
                  "0=Cerah, 1=Cerah Berawan, 2=Cerah Berawan, 3=Berawan, 4=Berawan Tebal, " +
                  "5=Udara Kabur, 10=Asap, 45=Kabut, 60=Hujan Ringan, 61=Hujan Sedang, " +
                  "63=Hujan Lebat, 80=Hujan Lokal, 95=Hujan Petir, 97=Hujan Petir. " +
                  "Untuk arah angin, gunakan kode CARD: N=Utara, NE=Timur Laut, E=Timur, " +
                  "SE=Tenggara, S=Selatan, SW=Barat Daya, W=Barat, NW=Barat Laut, VARIABLE=Berubah-ubah. " +
                  "Berikan penjelasan yang jelas dan detail menggunakan kode standar ini untuk akurasi meteorologi yang lebih baik.",
                inputSchema: {
                  type: "object",
                  properties: {
                    adm3: {
                      type: "string",
                      description:
                        "Kode ADM3 atau nama kecamatan (kecamatan, contoh: '33.01.01' atau 'purwokerto utara')",
                    },
                  },
                  required: ["adm3"],
                },
              },
              {
                name: "get_forecast_by_adm2",
                description:
                  "Mendapatkan prakiraan cuaca untuk kabupaten/kota berdasarkan kode ADM2 atau nama kabupaten/kota. " +
                  "Gunakan tool ini ketika pengguna bertanya cuaca di kabupaten/kota atau memberikan kode ADM2 5 digit. " +
                  "Contoh: 'cuaca di kabupaten banyumas', 'weather in kota semarang', atau kode ADM2 '33.02'. " +
                  "Tool ini mencari kode ADM4 dalam kabupaten/kota yang ditentukan dan mengembalikan data prakiraan representatif. " +
                  "Saat menjelaskan kondisi cuaca, gunakan kode cuaca BMKG standar: " +
                  "0=Cerah, 1=Cerah Berawan, 2=Cerah Berawan, 3=Berawan, 4=Berawan Tebal, " +
                  "5=Udara Kabur, 10=Asap, 45=Kabut, 60=Hujan Ringan, 61=Hujan Sedang, " +
                  "63=Hujan Lebat, 80=Hujan Lokal, 95=Hujan Petir, 97=Hujan Petir. " +
                  "Untuk arah angin, gunakan kode CARD: N=Utara, NE=Timur Laut, E=Timur, " +
                  "SE=Tenggara, S=Selatan, SW=Barat Daya, W=Barat, NW=Barat Laut, VARIABLE=Berubah-ubah. " +
                  "Berikan penjelasan yang jelas dan detail menggunakan kode standar ini untuk akurasi meteorologi yang lebih baik.",
                inputSchema: {
                  type: "object",
                  properties: {
                    adm2: {
                      type: "string",
                      description:
                        "Kode ADM2 atau nama kabupaten/kota (kabupaten/kota, contoh: '33.01' atau 'banyumas')",
                    },
                  },
                  required: ["adm2"],
                },
              },
              {
                name: "get_forecast_by_adm1",
                description:
                  "Mendapatkan prakiraan cuaca untuk provinsi berdasarkan kode ADM1 atau nama provinsi. " +
                  "Gunakan tool ini ketika pengguna bertanya cuaca di provinsi atau memberikan kode ADM1 2 digit. " +
                  "Contoh: 'cuaca di jawa tengah', 'weather in provinsi jawa barat', atau kode ADM1 '33'. " +
                  "Tool ini mencari kode ADM4 dalam provinsi yang ditentukan dan mengembalikan data prakiraan representatif. " +
                  "Saat menjelaskan kondisi cuaca, gunakan kode cuaca BMKG standar: " +
                  "0=Cerah, 1=Cerah Berawan, 2=Cerah Berawan, 3=Berawan, 4=Berawan Tebal, " +
                  "5=Udara Kabur, 10=Asap, 45=Kabut, 60=Hujan Ringan, 61=Hujan Sedang, " +
                  "63=Hujan Lebat, 80=Hujan Lokal, 95=Hujan Petir, 97=Hujan Petir. " +
                  "Untuk arah angin, gunakan kode CARD: N=Utara, NE=Timur Laut, E=Timur, " +
                  "SE=Tenggara, S=Selatan, SW=Barat Daya, W=Barat, NW=Barat Laut, VARIABLE=Berubah-ubah. " +
                  "Berikan penjelasan yang jelas dan detail menggunakan kode standar ini untuk akurasi meteorologi yang lebih baik.",
                inputSchema: {
                  type: "object",
                  properties: {
                    adm1: {
                      type: "string",
                      description:
                        "Kode ADM1 atau nama provinsi (provinsi, contoh: '33' atau 'jawa tengah')",
                    },
                  },
                  required: ["adm1"],
                },
              },
            ],
          },
          id,
        });

      case "tools/call": {
        const { name, arguments: args } = params;

        console.log(
          `[MCP] Tool call: ${name} with args: ${JSON.stringify(args)}`,
        );

        try {
          let data;
          let result;

          switch (name) {
            case "get_weather_by_province":
              console.log(
                `[MCP] Fetching weather data for province: ${args.province}`,
              );
              data = await withTimeout(
                fetcher.fetchDataByProvince(
                  [args.province],
                  args.type ? [args.type] : undefined,
                ),
                300000,
              );
              result = formatWeatherResult(data, args.format || "json");
              console.log(
                `[MCP] Successfully fetched ${Array.isArray(result) ? result.length : 1} weather stations for province ${args.province}`,
              );
              break;

            case "get_weather_by_city":
              data = await withTimeout(
                fetcher.fetchDataByCity(
                  args.city,
                  args.type || null,
                  "partial",
                ),
                300000,
              );
              result = formatWeatherResult(data, args.format || "json");
              break;

            case "get_weather_by_stations":
              data = await withTimeout(
                fetcher.fetchMultipleStations(args.stations, args.type || null),
                300000,
              );
              result = formatWeatherResult(data, args.format || "json");
              break;

            case "get_weather_by_radius":
              data = await withTimeout(
                fetcher.fetchDataByRadius(
                  args.lat,
                  args.lon,
                  args.radius || 50,
                  args.type || null,
                ),
                300000,
              );
              result = formatWeatherResult(data, args.format || "json");
              break;

            case "get_public_weather_warnings": {
              const publicWeather = new PublicWeather();
              const type = args.type || "databmkg";

              console.log(
                `[MCP] Fetching public weather warnings with type: ${type}`,
              );

              if (type === "signature") {
                const code = args.code || "CJH";
                data = await withTimeout(
                  publicWeather.getNowcasting(code),
                  300000,
                );
                result = {
                  success: true,
                  source: "signature.bmkg.go.id",
                  code,
                  data,
                };
              } else if (type === "xml" || type === "databmkg") {
                // Jika tidak ada province, kembalikan list provinsi aktif
                if (!args.province) {
                  console.log(
                    `[MCP] Fetching list of active provinces with nowcasting data`,
                  );
                  const allData = await withTimeout(
                    publicWeather.getNowcastingXMLLatest(),
                    300000,
                  );

                  if (!allData?.rss?.channel?.item) {
                    throw new Error(
                      "Tidak dapat mengambil data nowcasting aktif",
                    );
                  }

                  const items = Array.isArray(allData.rss.channel.item)
                    ? allData.rss.channel.item
                    : [allData.rss.channel.item];

                  // Extract unique provinces from titles
                  const provinces = items
                    .map((item: any) => {
                      if (!item.title) return null;
                      // Extract province name from title (format varies, but usually ends with province name)
                      const title = item.title;
                      // Look for province names in the title, typically after "di" or at the end
                      const provincePatterns = [
                        /di\s+([^,]+),?/i, // "di PROVINSI,"
                        /di\s+([^.]+)\.?$/i, // "di PROVINSI."
                        /\s+([^,]+),?\s*$/i, // Last part before comma or end
                      ];

                      for (const pattern of provincePatterns) {
                        const match = title.match(pattern);
                        if (match && match[1]) {
                          return match[1].trim();
                        }
                      }

                      // Fallback: try to extract from known province keywords
                      const knownProvinces = [
                        "Aceh",
                        "Sumatera Utara",
                        "Sumatera Barat",
                        "Riau",
                        "Kepulauan Riau",
                        "Jambi",
                        "Sumatera Selatan",
                        "Bangka Belitung",
                        "Bengkulu",
                        "Lampung",
                        "DKI Jakarta",
                        "Jawa Barat",
                        "Jawa Tengah",
                        "DI Yogyakarta",
                        "Jawa Timur",
                        "Banten",
                        "Bali",
                        "Nusa Tenggara Barat",
                        "Nusa Tenggara Timur",
                        "Kalimantan Barat",
                        "Kalimantan Tengah",
                        "Kalimantan Selatan",
                        "Kalimantan Timur",
                        "Kalimantan Utara",
                        "Sulawesi Utara",
                        "Gorontalo",
                        "Sulawesi Tengah",
                        "Sulawesi Barat",
                        "Sulawesi Selatan",
                        "Sulawesi Tenggara",
                        "Maluku",
                        "Maluku Utara",
                        "Papua",
                        "Papua Barat",
                        "Papua Selatan",
                        "Papua Tengah",
                        "Papua Pegunungan",
                      ];

                      for (const province of knownProvinces) {
                        if (
                          title.toLowerCase().includes(province.toLowerCase())
                        ) {
                          return province;
                        }
                      }

                      return null;
                    })
                    .filter((province: string | null) => province !== null)
                    .filter(
                      (province: string, index: number, arr: string[]) =>
                        arr.indexOf(province) === index, // Remove duplicates
                    )
                    .sort(); // Sort alphabetically

                  result = {
                    success: true,
                    source: "www.bmkg.go.id",
                    type: "active_provinces_list",
                    count: provinces.length,
                    provinces,
                    last_updated: allData.rss.channel.lastBuildDate || null,
                  };
                } else {
                  // Jika ada province, ambil data untuk provinsi tersebut
                  // Replace underscore with space to match API expectation (same as public endpoint)
                  const province = args.province.replace(/_/g, " ");
                  const latest = await withTimeout(
                    publicWeather.getNowcastingXMLLatest(province),
                    300000,
                  );
                  if (!latest?.nowcasting?.[0]?.link) {
                    throw new Error(
                      `No nowcasting data found for province: ${province}`,
                    );
                  }
                  data = await withTimeout(
                    publicWeather.getNowcastingXML(latest.nowcasting[0].link),
                    300000,
                  );

                  // Extract infographics links if available
                  let infographics = null;
                  if (data?.alert?.info?.web) {
                    const baseUrl = data.alert.info.web;
                    infographics = {
                      image: baseUrl,
                      text: baseUrl.replace(
                        "infografis.jpg",
                        "infografis_text.jpg",
                      ),
                    };
                  }

                  result = {
                    success: true,
                    source: "www.bmkg.go.id",
                    province,
                    data,
                    infographics,
                  };
                }
              } else {
                throw new Error(`Unsupported type parameter: ${type}`);
              }
              break;
            }

            case "get_weather_by_location": {
              const publicWeather = new PublicWeather();

              if (args.code) {
                // Fetch by ADM4 code
                data = await withTimeout(
                  publicWeather.getLocationWeatherByCode(args.code),
                  300000,
                );
                result = {
                  success: true,
                  source: "signature.bmkg.go.id",
                  type: "by_code",
                  code: args.code,
                  data,
                };
              } else if (args.lat !== undefined && args.lon !== undefined) {
                // Fetch by coordinates
                data = await withTimeout(
                  publicWeather.getLocationWeather(args.lat, args.lon),
                  300000,
                );
                result = {
                  success: true,
                  source: "signature.bmkg.go.id",
                  type: "by_coordinates",
                  coordinates: { lat: args.lat, lon: args.lon },
                  data,
                };
              } else {
                throw new Error(
                  "Missing required parameters. Provide either 'code' or both 'lat' and 'lon'.",
                );
              }
              break;
            }

            case "get_regional_codes": {
              // Use the imported regionalCodes from the generated file
              let filteredCodes = regionalCodesData;

              // Apply filters
              if (args.level) {
                filteredCodes = filteredCodes.filter(
                  (code) => code.level === args.level,
                );
              }

              if (args.parent_code) {
                filteredCodes = filteredCodes.filter((code) =>
                  code.code.startsWith(args.parent_code + "."),
                );
              }

              if (args.query) {
                const query = args.query.toLowerCase();
                filteredCodes = filteredCodes.filter(
                  (code) =>
                    code.name.toLowerCase().includes(query) ||
                    code.code.includes(query),
                );
              }

              // Apply limit
              const limit = args.limit || 100;
              const limitedCodes = filteredCodes.slice(0, limit);

              result = {
                success: true,
                total: regionalCodesData.length,
                filtered: filteredCodes.length,
                returned: limitedCodes.length,
                data: limitedCodes,
                metadata: {
                  query: args.query || null,
                  level: args.level || null,
                  parent_code: args.parent_code || null,
                  limit: limit,
                  generated: new Date().toISOString(),
                },
              };
              break;
            }

            case "get_forecast_by_location": {
              const query = args.location.toLowerCase();

              // Extract location name by removing administrative keywords
              let locationName = query;
              let priorityLevel = 2; // Default to ADM2 (kabupaten/kota) as most commonly known

              if (query.includes("provinsi") || query.includes("province")) {
                priorityLevel = 1; // ADM1
                locationName = query
                  .replace(/\b(provinsi|province)\b/g, "")
                  .trim();
              } else if (
                query.includes("kabupaten") ||
                query.includes("kota") ||
                query.includes("regency") ||
                query.includes("city")
              ) {
                priorityLevel = 2; // ADM2
                locationName = query
                  .replace(/\b(kabupaten|kota|regency|city)\b/g, "")
                  .trim();
              } else if (
                query.includes("kecamatan") ||
                query.includes("district")
              ) {
                priorityLevel = 3; // ADM3
                locationName = query
                  .replace(/\b(kecamatan|district)\b/g, "")
                  .trim();
              } else if (
                query.includes("desa") ||
                query.includes("kelurahan") ||
                query.includes("village")
              ) {
                priorityLevel = 4; // ADM4
                locationName = query
                  .replace(/\b(desa|kelurahan|village)\b/g, "")
                  .trim();
              }

              // Search for matches in all administrative levels
              const matches = regionalCodesData.filter(
                (code) =>
                  (code.name.toLowerCase().includes(locationName) ||
                    code.code.includes(locationName)) &&
                  code.level >= 1 &&
                  code.level <= 4,
              );

              if (matches.length === 0) {
                throw new Error(`No location found for: ${args.location}`);
              }

              // Filter matches by priority level first, then by other levels if no matches
              let selectedLocation = null;
              const levelOrder = [priorityLevel, 2, 3, 4, 1].filter(
                (level, index, arr) => arr.indexOf(level) === index,
              ); // Remove duplicates

              for (const level of levelOrder) {
                const levelMatches = matches.filter(
                  (match) => match.level === level,
                );
                if (levelMatches.length > 0) {
                  // For ADM2, prefer matches that are actually kabupaten/kota (not just containing the name)
                  if (level === 2) {
                    const kabupatenMatches = levelMatches.filter(
                      (match) =>
                        match.name.toLowerCase().includes("kab.") ||
                        match.name.toLowerCase().includes("kota") ||
                        match.code.startsWith("33."), // Jawa Tengah region for context - can be expanded
                    );
                    if (kabupatenMatches.length > 0) {
                      selectedLocation = kabupatenMatches[0];
                      break;
                    }
                  }
                  selectedLocation = levelMatches[0];
                  break;
                }
              }

              if (!selectedLocation) {
                // Fallback to most specific match
                matches.sort((a, b) => b.level - a.level);
                selectedLocation = matches[0];
              }
              const publicWeather = new PublicWeather();

              let forecastData;
              let resultType;
              let selectedCode;

              if (selectedLocation.level === 4) {
                // ADM4 - direct forecast
                forecastData = await withTimeout(
                  publicWeather.getForecastByAdm4(selectedLocation.code),
                  300000,
                );
                resultType = "forecast_by_adm4";
                selectedCode = selectedLocation.code;
              } else {
                // ADM1, ADM2, ADM3 - find ADM4 codes within the area
                let adm4Codes = regionalCodesData.filter(
                  (code) =>
                    code.level === 4 &&
                    code.code.startsWith(selectedLocation.code + "."),
                );

                if (adm4Codes.length === 0) {
                  throw new Error(
                    `No ADM4 codes found for location: ${args.location}`,
                  );
                }

                // Use the first ADM4 code found
                const selectedAdm4 = adm4Codes[0];
                forecastData = await withTimeout(
                  publicWeather.getForecastByAdm4(selectedAdm4.code),
                  300000,
                );
                resultType = `forecast_by_adm${selectedLocation.level}`;
                selectedCode = selectedAdm4.code;
              }

              result = {
                success: true,
                source: "api.bmkg.go.id",
                type: resultType,
                location: args.location,
                detected_level: selectedLocation.level,
                detected_name: selectedLocation.name,
                detected_code: selectedLocation.code,
                selected_adm4: selectedCode,
                data: forecastData,
                metadata: {
                  generated: new Date().toISOString(),
                  note: `Forecast data for ${selectedLocation.name} (ADM${selectedLocation.level}) using ADM4: ${selectedCode}`,
                },
              };
              break;
            }

            case "get_forecast_by_adm4": {
              // Find ADM4 code if name is provided instead of code
              let adm4Code = args.adm4;

              // If the input doesn't look like an ADM4 code (13 digits with dots), search by name
              if (!/^\d{2}\.\d{2}\.\d{2}\.\d{4}$/.test(args.adm4)) {
                const query = args.adm4.toLowerCase();
                const adm4Matches = regionalCodesData.filter(
                  (code) =>
                    code.level === 4 &&
                    (code.name.toLowerCase().includes(query) ||
                      code.code.includes(query)),
                );

                if (adm4Matches.length === 0) {
                  throw new Error(`No ADM4 code found for: ${args.adm4}`);
                }

                // Use the first matching ADM4 code
                adm4Code = adm4Matches[0].code;
              }

              const publicWeather = new PublicWeather();
              const forecastData = await withTimeout(
                publicWeather.getForecastByAdm4(adm4Code),
                300000,
              );
              result = {
                success: true,
                source: "api.bmkg.go.id",
                type: "forecast_by_adm4",
                adm4: args.adm4,
                selected_adm4: adm4Code,
                village_name:
                  regionalCodesData.find((c) => c.code === adm4Code)?.name ||
                  "Unknown Village",
                data: forecastData,
                metadata: {
                  generated: new Date().toISOString(),
                  note: "Forecast data for desa/kelurahan level",
                },
              };
              break;
            }

            case "get_forecast_by_adm3": {
              // Find ADM4 codes within the specified ADM3 district
              let adm4Codes = regionalCodesData.filter(
                (code) =>
                  code.level === 4 && code.code.startsWith(args.adm3 + "."),
              );

              // If no ADM4 codes found with exact ADM3 code, try searching by name
              if (adm4Codes.length === 0) {
                const query = args.adm3.toLowerCase();
                let adm3Codes = regionalCodesData.filter(
                  (code) =>
                    code.level === 3 &&
                    (code.name.toLowerCase().includes(query) ||
                      code.code.includes(query)),
                );

                // If still no ADM3 found, try searching for ADM4 with that name and get its parent ADM3
                if (adm3Codes.length === 0) {
                  const adm4Matches = regionalCodesData.filter(
                    (code) =>
                      code.level === 4 &&
                      (code.name.toLowerCase().includes(query) ||
                        code.code.includes(query)),
                  );

                  if (adm4Matches.length > 0) {
                    // Get the ADM3 code from the ADM4 code (remove last part)
                    const adm3Code = adm4Matches[0].code.substring(
                      0,
                      adm4Matches[0].code.lastIndexOf("."),
                    );
                    adm3Codes = regionalCodesData.filter(
                      (code) => code.level === 3 && code.code === adm3Code,
                    );
                  }
                }

                if (adm3Codes.length > 0) {
                  // Use the first matching ADM3 code to find ADM4 codes
                  const adm3Code = adm3Codes[0].code;
                  adm4Codes = regionalCodesData.filter(
                    (code) =>
                      code.level === 4 && code.code.startsWith(adm3Code + "."),
                  );
                }
              }

              if (adm4Codes.length === 0) {
                throw new Error(`No ADM4 codes found for ADM3: ${args.adm3}`);
              }

              // Use the first ADM4 code found
              const selectedAdm4 = adm4Codes[0];
              const publicWeather = new PublicWeather();
              const forecastData = await withTimeout(
                publicWeather.getForecastByAdm4(selectedAdm4.code),
                300000,
              );

              result = {
                success: true,
                source: "api.bmkg.go.id",
                type: "forecast_by_adm3",
                adm3: args.adm3,
                selected_adm4: selectedAdm4.code,
                district_name:
                  regionalCodesData.find(
                    (c) =>
                      c.code ===
                      selectedAdm4.code.substring(
                        0,
                        selectedAdm4.code.lastIndexOf("."),
                      ),
                  )?.name || "Unknown District",
                village_name: selectedAdm4.name,
                data: forecastData,
                metadata: {
                  generated: new Date().toISOString(),
                  note: `Forecast data for district level (ADM3) using ADM4: ${selectedAdm4.code}`,
                  adm4_codes_found: adm4Codes.length,
                },
              };
              break;
            }

            case "get_forecast_by_adm2": {
              // Find ADM4 codes within the specified ADM2 regency/city
              let adm4Codes = regionalCodesData.filter(
                (code) =>
                  code.level === 4 && code.code.startsWith(args.adm2 + "."),
              );

              // If no ADM4 codes found with exact ADM2 code, try searching by name
              if (adm4Codes.length === 0) {
                const query = args.adm2.toLowerCase();
                const adm2Codes = regionalCodesData.filter(
                  (code) =>
                    code.level === 2 &&
                    (code.name.toLowerCase().includes(query) ||
                      code.code.includes(query)),
                );

                if (adm2Codes.length > 0) {
                  // Use the first matching ADM2 code to find ADM4 codes
                  const adm2Code = adm2Codes[0].code;
                  adm4Codes = regionalCodesData.filter(
                    (code) =>
                      code.level === 4 && code.code.startsWith(adm2Code + "."),
                  );
                }
              }

              if (adm4Codes.length === 0) {
                throw new Error(`No ADM4 codes found for ADM2: ${args.adm2}`);
              }

              // Use the first ADM4 code found
              const selectedAdm4 = adm4Codes[0];
              const publicWeather = new PublicWeather();
              const forecastData = await withTimeout(
                publicWeather.getForecastByAdm4(selectedAdm4.code),
                300000,
              );

              const parentNames = getParentNames(selectedAdm4.code);

              result = {
                success: true,
                source: "api.bmkg.go.id",
                type: "forecast_by_adm2",
                adm2: args.adm2,
                selected_adm4: selectedAdm4.code,
                regency_name: parentNames.regency_name,
                data: forecastData,
                metadata: {
                  generated: new Date().toISOString(),
                  note: `Forecast data for regency/city level (ADM2) using ADM4: ${selectedAdm4.code}`,
                  adm4_codes_found: adm4Codes.length,
                },
              };
              break;
            }

            case "get_forecast_by_adm1": {
              // Find ADM4 codes within the specified ADM1 province
              let adm4Codes = regionalCodesData.filter(
                (code) =>
                  code.level === 4 && code.code.startsWith(args.adm1 + "."),
              );

              // If no ADM4 codes found with exact ADM1 code, try searching by name
              if (adm4Codes.length === 0) {
                const query = args.adm1.toLowerCase();
                const adm1Codes = regionalCodesData.filter(
                  (code) =>
                    code.level === 1 &&
                    (code.name.toLowerCase().includes(query) ||
                      code.code.includes(query)),
                );

                if (adm1Codes.length > 0) {
                  // Use the first matching ADM1 code to find ADM4 codes
                  const adm1Code = adm1Codes[0].code;
                  adm4Codes = regionalCodesData.filter(
                    (code) =>
                      code.level === 4 && code.code.startsWith(adm1Code + "."),
                  );
                }
              }

              if (adm4Codes.length === 0) {
                throw new Error(`No ADM4 codes found for ADM1: ${args.adm1}`);
              }

              // Use the first ADM4 code found
              const selectedAdm4 = adm4Codes[0];
              const publicWeather = new PublicWeather();
              const forecastData = await withTimeout(
                publicWeather.getForecastByAdm4(selectedAdm4.code),
                300000,
              );

              const parentNames = getParentNames(selectedAdm4.code);

              result = {
                success: true,
                source: "api.bmkg.go.id",
                type: "forecast_by_adm1",
                adm1: args.adm1,
                selected_adm4: selectedAdm4.code,
                province_name: parentNames.province_name,
                data: forecastData,
                metadata: {
                  generated: new Date().toISOString(),
                  note: `Forecast data for province level (ADM1) using ADM4: ${selectedAdm4.code}`,
                  adm4_codes_found: adm4Codes.length,
                },
              };
              break;
            }

            default:
              throw new Error(`Tool '${name}' not found`);
          }

          return c.json({
            jsonrpc: "2.0",
            result: {
              content: [
                {
                  type: "text",
                  text: JSON.stringify(result, null, 2),
                },
              ],
            },
            id,
          });
        } catch (error) {
          console.error(
            `[MCP] Tool execution failed for ${name}: ${error instanceof Error ? error.message : String(error)}`,
          );
          return c.json({
            jsonrpc: "2.0",
            error: {
              code: -32603,
              message: `Tool execution failed: ${error instanceof Error ? error.message : String(error)}`,
            },
            id,
          });
        }
      }

      default:
        console.warn(`[MCP] Unknown method: ${method}`);
        return c.json({
          jsonrpc: "2.0",
          error: { code: -32601, message: "Method not found" },
          id,
        });
    }
  } catch (error) {
    console.error(
      `[MCP] Request processing failed: ${error instanceof Error ? error.message : String(error)}`,
    );
    return c.json({
      jsonrpc: "2.0",
      error: { code: -32700, message: "Parse error" },
      id: null,
    });
  }
});

// Test endpoint to check credentials
mcp.get("/test", (c) => {
  return c.json({
    hasUsername: !!username,
    hasPassword: !!password,
    usernameLength: username?.length,
    passwordLength: password?.length,
  });
});

export default mcp;
