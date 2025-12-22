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
  try {
    const request = await c.req.json();
    const { jsonrpc, method, params, id } = request;

    // Validate JSON-RPC format
    if (jsonrpc !== "2.0" || !method) {
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
                  "Get weather station data for a specific province. Please default type to null for all types",
                inputSchema: {
                  type: "object",
                  properties: {
                    province: {
                      type: "string",
                      description:
                        "Province code (e.g., PR013 for Jawa Tengah)",
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
                      description: "Station type filter",
                    },
                    format: {
                      type: "string",
                      enum: ["json", "geojson"],
                      description: "Output format",
                      default: "json",
                    },
                  },
                  required: ["province"],
                },
              },
              {
                name: "get_weather_by_city",
                description:
                  "Get weather automatic station data for a specific city. Please default type to null for all types",
                inputSchema: {
                  type: "object",
                  properties: {
                    city: {
                      type: "string",
                      description: "City name (e.g., cilacap, semarang)",
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
                      description: "Station type filter",
                    },
                    format: {
                      type: "string",
                      enum: ["json", "geojson"],
                      description: "Output format",
                      default: "json",
                    },
                  },
                  required: ["city"],
                },
              },
              {
                name: "get_weather_by_stations",
                description:
                  "Get weather data for specific automatic station IDs it can be multiple stations types please default to null for all types",
                inputSchema: {
                  type: "object",
                  properties: {
                    stations: {
                      type: "array",
                      items: { type: "string" },
                      description:
                        "Array of station IDs (e.g., ['STA1101', 'STA1102'])",
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
                      description: "Station type filter",
                      default: "aws",
                    },
                    format: {
                      type: "string",
                      enum: ["json", "geojson"],
                      description: "Output format",
                      default: "json",
                    },
                  },
                  required: ["stations"],
                },
              },
              {
                name: "get_weather_by_radius",
                description:
                  "Get weather station data within a radius from coordinates. Please default type to null for all types",
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
                      description: "Radius in kilometers",
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
                      description: "Station type filter",
                    },
                    format: {
                      type: "string",
                      enum: ["json", "geojson"],
                      description: "Output format",
                      default: "json",
                    },
                  },
                  required: ["lat", "lon"],
                },
              },
              {
                name: "get_nowcasting",
                description: "Get nowcasting weather data",
                inputSchema: {
                  type: "object",
                  properties: {
                    code: {
                      type: "string",
                      description: "Station code (e.g., CJH)",
                    },
                    province: {
                      type: "string",
                      description: "Province name (e.g., jawa_tengah)",
                    },
                    format: {
                      type: "string",
                      enum: ["json", "xml"],
                      description: "Output format",
                      default: "json",
                    },
                  },
                },
              },
              {
                name: "get_public_nowcasting",
                description:
                  "Get public nowcasting weather data from BMKG public APIs",
                inputSchema: {
                  type: "object",
                  properties: {
                    type: {
                      type: "string",
                      enum: ["signature", "xml", "databmkg"],
                      description: "Data source type",
                      default: "signature",
                    },
                    code: {
                      type: "string",
                      description: "Station code for signature API (e.g., CJH)",
                    },
                    province: {
                      type: "string",
                      description:
                        "Province name for XML API (e.g., jawa_tengah)",
                    },
                  },
                },
              },
              {
                name: "get_public_weather_forecast",
                description:
                  "Get public weather forecast data in GeoJSON format",
                inputSchema: {
                  type: "object",
                  properties: {
                    province: {
                      type: "string",
                      description:
                        "Filter by province name (e.g., jawa_tengah)",
                    },
                    kabupaten: {
                      type: "string",
                      description:
                        "Filter by kabupaten/regency name (e.g., banyumas)",
                    },
                    kecamatan: {
                      type: "string",
                      description: "Filter by kecamatan/district name",
                    },
                    format: {
                      type: "string",
                      enum: ["geojson", "json"],
                      description: "Output format",
                      default: "geojson",
                    },
                  },
                },
              },
              {
                name: "get_weather_by_location",
                description: "Get weather data by location code or coordinates",
                inputSchema: {
                  type: "object",
                  properties: {
                    code: {
                      type: "string",
                      description: "ADM4 location code (e.g., 33.01.22.1003)",
                    },
                    lat: {
                      type: "number",
                      description: "Latitude coordinate",
                    },
                    lon: {
                      type: "number",
                      description: "Longitude coordinate",
                    },
                  },
                  oneOf: [{ required: ["code"] }, { required: ["lat", "lon"] }],
                },
              },
              {
                name: "get_regional_codes",
                description:
                  "Get Indonesian regional codes (Kode Wilayah) for weather forecasting",
                inputSchema: {
                  type: "object",
                  properties: {
                    query: {
                      type: "string",
                      description: "Search query for region name (optional)",
                    },
                    level: {
                      type: "number",
                      enum: [1, 2, 3, 4],
                      description:
                        "Administrative level: 1=Province, 2=Regency/City, 3=District, 4=Village",
                    },
                    parent_code: {
                      type: "string",
                      description:
                        "Parent region code to filter children (e.g., '11' for all Aceh regions)",
                    },
                    limit: {
                      type: "number",
                      description: "Maximum number of results to return",
                      default: 100,
                    },
                  },
                },
              },
              {
                name: "get_forecast_by_location",
                description:
                  "PRIMARY TOOL for weather forecast queries. Automatically detects administrative level (provinsi/province, kabupaten/regency, kota/city, kecamatan/district, desa/village) " +
                  "by checking regional codes and selects the most appropriate forecast data. " +
                  "Use this tool for ALL general weather queries like 'cuaca di Jakarta', 'weather in Banyumas', 'forecast for Purwokerto', 'cuaca kota Semarang', etc. " +
                  "Supports all administrative levels and automatically prioritizes the most specific location found. " +
                  "For ambiguous names (e.g., 'kota' could mean ADM2 or ADM3), it intelligently selects based on regional code data. " +
                  "When explaining weather conditions, use the standard BMKG weather codes: " +
                  "0=Cerah, 1=Cerah Berawan, 2=Cerah Berawan, 3=Berawan, 4=Berawan Tebal, " +
                  "5=Udara Kabur, 10=Asap, 45=Kabut, 60=Hujan Ringan, 61=Hujan Sedang, " +
                  "63=Hujan Lebat, 80=Hujan Lokal, 95=Hujan Petir, 97=Hujan Petir. " +
                  "For wind directions, use CARD codes: N=Utara, NE=Timur Laut, E=Timur, " +
                  "SE=Tenggara, S=Selatan, SW=Barat Daya, W=Barat, NW=Barat Laut, VARIABLE=Berubah-ubah. " +
                  "Provide clear, detailed explanations using these standard codes for better meteorological accuracy.",
                inputSchema: {
                  type: "object",
                  properties: {
                    location: {
                      type: "string",
                      description:
                        "Location name (any administrative level: provinsi, kabupaten/kota, kecamatan, desa/kelurahan)",
                    },
                  },
                  required: ["location"],
                },
              },
              {
                name: "get_forecast_by_adm4",
                description:
                  "Get weather forecast for a specific village/sub-district (desa/kelurahan) by ADM4 code or village name. " +
                  "Use this tool when user asks for weather in a specific village, sub-district, or provides a 13-digit ADM4 code. " +
                  "Examples: 'cuaca di desa bancarkembar', 'weather in kelurahan sudirman', or ADM4 code '33.02.27.1002'. " +
                  "When explaining weather conditions, use the standard BMKG weather codes: " +
                  "0=Cerah, 1=Cerah Berawan, 2=Cerah Berawan, 3=Berawan, 4=Berawan Tebal, " +
                  "5=Udara Kabur, 10=Asap, 45=Kabut, 60=Hujan Ringan, 61=Hujan Sedang, " +
                  "63=Hujan Lebat, 80=Hujan Lokal, 95=Hujan Petir, 97=Hujan Petir. " +
                  "For wind directions, use CARD codes: N=Utara, NE=Timur Laut, E=Timur, " +
                  "SE=Tenggara, S=Selatan, SW=Barat Daya, W=Barat, NW=Barat Laut, VARIABLE=Berubah-ubah. " +
                  "Provide clear, detailed explanations using these standard codes for better meteorological accuracy.",
                inputSchema: {
                  type: "object",
                  properties: {
                    adm4: {
                      type: "string",
                      description:
                        "ADM4 code or village name (desa/kelurahan, e.g., '33.02.27.1002' or 'bancarkembar')",
                    },
                  },
                  required: ["adm4"],
                },
              },
              {
                name: "get_forecast_by_adm3",
                description:
                  "Get weather forecast for a district (kecamatan) by ADM3 code or district name. " +
                  "Use this tool when user asks for weather in a district/kecamatan or provides an 8-digit ADM3 code. " +
                  "Examples: 'cuaca di kecamatan purwokerto utara', 'weather in district banjarsari', or ADM3 code '33.02.27'. " +
                  "This tool finds ADM4 codes within the specified district and returns representative forecast data. " +
                  "When explaining weather conditions, use the standard BMKG weather codes: " +
                  "0=Cerah, 1=Cerah Berawan, 2=Cerah Berawan, 3=Berawan, 4=Berawan Tebal, " +
                  "5=Udara Kabur, 10=Asap, 45=Kabut, 60=Hujan Ringan, 61=Hujan Sedang, " +
                  "63=Hujan Lebat, 80=Hujan Lokal, 95=Hujan Petir, 97=Hujan Petir. " +
                  "For wind directions, use CARD codes: N=Utara, NE=Timur Laut, E=Timur, " +
                  "SE=Tenggara, S=Selatan, SW=Barat Daya, W=Barat, NW=Barat Laut, VARIABLE=Berubah-ubah. " +
                  "Provide clear, detailed explanations using these standard codes for better meteorological accuracy.",
                inputSchema: {
                  type: "object",
                  properties: {
                    adm3: {
                      type: "string",
                      description:
                        "ADM3 code or district name (kecamatan, e.g., '33.01.01' or 'purwokerto utara')",
                    },
                  },
                  required: ["adm3"],
                },
              },
              {
                name: "get_forecast_by_adm2",
                description:
                  "Get weather forecast for a regency/city (kabupaten/kota) by ADM2 code or regency/city name. " +
                  "Use this tool when user asks for weather in a regency/kabupaten or city/kota, or provides a 5-digit ADM2 code. " +
                  "Examples: 'cuaca di kabupaten banyumas', 'weather in kota semarang', or ADM2 code '33.02'. " +
                  "This tool finds ADM4 codes within the specified regency/city and returns representative forecast data. " +
                  "When explaining weather conditions, use the standard BMKG weather codes: " +
                  "0=Cerah, 1=Cerah Berawan, 2=Cerah Berawan, 3=Berawan, 4=Berawan Tebal, " +
                  "5=Udara Kabur, 10=Asap, 45=Kabut, 60=Hujan Ringan, 61=Hujan Sedang, " +
                  "63=Hujan Lebat, 80=Hujan Lokal, 95=Hujan Petir, 97=Hujan Petir. " +
                  "For wind directions, use CARD codes: N=Utara, NE=Timur Laut, E=Timur, " +
                  "SE=Tenggara, S=Selatan, SW=Barat Daya, W=Barat, NW=Barat Laut, VARIABLE=Berubah-ubah. " +
                  "Provide clear, detailed explanations using these standard codes for better meteorological accuracy.",
                inputSchema: {
                  type: "object",
                  properties: {
                    adm2: {
                      type: "string",
                      description:
                        "ADM2 code or regency/city name (kabupaten/kota, e.g., '33.01' or 'banyumas')",
                    },
                  },
                  required: ["adm2"],
                },
              },
              {
                name: "get_forecast_by_adm1",
                description:
                  "Get weather forecast for a province (provinsi) by ADM1 code or province name. " +
                  "Use this tool when user asks for weather in a province/provinsi or provides a 2-digit ADM1 code. " +
                  "Examples: 'cuaca di jawa tengah', 'weather in provinsi jawa barat', or ADM1 code '33'. " +
                  "This tool finds ADM4 codes within the specified province and returns representative forecast data. " +
                  "When explaining weather conditions, use the standard BMKG weather codes: " +
                  "0=Cerah, 1=Cerah Berawan, 2=Cerah Berawan, 3=Berawan, 4=Berawan Tebal, " +
                  "5=Udara Kabur, 10=Asap, 45=Kabut, 60=Hujan Ringan, 61=Hujan Sedang, " +
                  "63=Hujan Lebat, 80=Hujan Lokal, 95=Hujan Petir, 97=Hujan Petir. " +
                  "For wind directions, use CARD codes: N=Utara, NE=Timur Laut, E=Timur, " +
                  "SE=Tenggara, S=Selatan, SW=Barat Daya, W=Barat, NW=Barat Laut, VARIABLE=Berubah-ubah. " +
                  "Provide clear, detailed explanations using these standard codes for better meteorological accuracy.",
                inputSchema: {
                  type: "object",
                  properties: {
                    adm1: {
                      type: "string",
                      description:
                        "ADM1 code or province name (provinsi, e.g., '33' or 'jawa tengah')",
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

        try {
          let data;
          let result;

          switch (name) {
            case "get_weather_by_province":
              data = await fetcher.fetchDataByProvince(
                [args.province],
                args.type ? [args.type] : undefined,
              );
              result = formatWeatherResult(data, args.format || "json");
              break;

            case "get_weather_by_city":
              data = await fetcher.fetchDataByCity(
                args.city,
                args.type || null,
                "partial",
              );
              result = formatWeatherResult(data, args.format || "json");
              break;

            case "get_weather_by_stations":
              data = await fetcher.fetchMultipleStations(
                args.stations,
                args.type || null,
              );
              result = formatWeatherResult(data, args.format || "json");
              break;

            case "get_weather_by_radius":
              data = await fetcher.fetchDataByRadius(
                args.lat,
                args.lon,
                args.radius || 50,
                args.type || null,
              );
              result = formatWeatherResult(data, args.format || "json");
              break;

            case "get_nowcasting":
              if (args.code) {
                data = await fetcher.fetchStationData(args.code);
              } else if (args.province) {
                data = await fetcher.fetchDataByProvince([args.province]);
              } else {
                throw new Error(
                  "Either 'code' or 'province' parameter is required",
                );
              }
              result = formatWeatherResult(data, args.format || "json");
              break;

            case "get_public_nowcasting": {
              const publicWeather = new PublicWeather();
              const type = args.type || "signature";

              if (type === "signature") {
                const code = args.code || "CJH";
                data = await publicWeather.getNowcasting(code);
                result = {
                  success: true,
                  source: "signature.bmkg.go.id",
                  code,
                  data,
                };
              } else if (type === "xml" || type === "databmkg") {
                if (!args.province) {
                  throw new Error(
                    "Province parameter is required for XML/databmkg type",
                  );
                }
                const latest = await publicWeather.getNowcastingXMLLatest(
                  args.province,
                );
                if (!latest?.nowcasting?.[0]?.link) {
                  throw new Error(
                    `No nowcasting data found for province: ${args.province}`,
                  );
                }
                data = await publicWeather.getNowcastingXML(
                  latest.nowcasting[0].link,
                );
                result = {
                  success: true,
                  source: "www.bmkg.go.id",
                  province: args.province,
                  data,
                };
              } else {
                throw new Error(`Unsupported type parameter: ${type}`);
              }
              break;
            }

            case "get_public_weather_forecast": {
              const publicWeather = new PublicWeather();
              const rawData = (await publicWeather.getPwxDarat()) as any[];

              // Always convert to GeoJSON first for filtering
              const geojson = publicToGeoJSON(rawData);

              // Apply filters
              const filteredGeoJSON = filterPublicGeoJSON(geojson, {
                province: args.province
                  ? args.province.replace(/_/g, " ")
                  : undefined,
                kabupaten: args.kabupaten
                  ? args.kabupaten.replace(/_/g, " ")
                  : undefined,
                kecamatan: args.kecamatan
                  ? args.kecamatan.replace(/_/g, " ")
                  : undefined,
              });

              if (args.format === "geojson") {
                result = {
                  ...filteredGeoJSON,
                  metadata: {
                    success: true,
                    count: filteredGeoJSON.features.length,
                    filters: {
                      province: args.province || null,
                      kabupaten: args.kabupaten || null,
                      kecamatan: args.kecamatan || null,
                    },
                    generated: new Date().toISOString(),
                  },
                };
              } else {
                result = {
                  success: true,
                  count: filteredGeoJSON.features.length,
                  filters: {
                    province: args.province || null,
                    kabupaten: args.kabupaten || null,
                    kecamatan: args.kecamatan || null,
                  },
                  data: filteredGeoJSON.features,
                };
              }
              break;
            }

            case "get_weather_by_location": {
              const publicWeather = new PublicWeather();

              if (args.code) {
                // Fetch by ADM4 code
                data = await publicWeather.getLocationWeatherByCode(args.code);
                result = {
                  success: true,
                  source: "signature.bmkg.go.id",
                  type: "by_code",
                  code: args.code,
                  data,
                };
              } else if (args.lat !== undefined && args.lon !== undefined) {
                // Fetch by coordinates
                data = await publicWeather.getLocationWeather(
                  args.lat,
                  args.lon,
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
                forecastData = await publicWeather.getForecastByAdm4(
                  selectedLocation.code,
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
                forecastData = await publicWeather.getForecastByAdm4(
                  selectedAdm4.code,
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
              const forecastData =
                await publicWeather.getForecastByAdm4(adm4Code);
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
              const forecastData = await publicWeather.getForecastByAdm4(
                selectedAdm4.code,
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
              const forecastData = await publicWeather.getForecastByAdm4(
                selectedAdm4.code,
              );

              result = {
                success: true,
                source: "api.bmkg.go.id",
                type: "forecast_by_adm2",
                adm2: args.adm2,
                selected_adm4: selectedAdm4.code,
                regency_name: selectedAdm4.parent_name || "Unknown Regency",
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
              const forecastData = await publicWeather.getForecastByAdm4(
                selectedAdm4.code,
              );

              result = {
                success: true,
                source: "api.bmkg.go.id",
                type: "forecast_by_adm1",
                adm1: args.adm1,
                selected_adm4: selectedAdm4.code,
                province_name: selectedAdm4.parent_name || "Unknown Province",
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
          return c.json({
            jsonrpc: "2.0",
            error: {
              code: -32603,
              message: `Tool execution failed: ${error.message}`,
            },
            id,
          });
        }
      }

      default:
        return c.json({
          jsonrpc: "2.0",
          error: { code: -32601, message: "Method not found" },
          id,
        });
    }
  } catch (error) {
    console.error("MCP request error:", error);
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
