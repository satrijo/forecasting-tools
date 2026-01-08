import { Hono } from "hono";
import {
  PublicWeather,
  publicToGeoJSON,
  filterPublicGeoJSON,
} from "weather-client";

const publicRoute = new Hono();

publicRoute.get("/", (c) => {
  return c.json({
    success: true,
    message: "BMKG Public Weather API",
    version: "1.0.0",
    endpoints: {
      nowcasting: "/public/nowcasting - Nowcasting data",
      weather: "/public/weather - Weather forecast data (GeoJSON)",
      location: "/public/location - Weather by location code (ADM4)",
    },
    examples: {
      nowcasting: "/public/nowcasting?code=CJH",
      nowcastingXML: "/public/nowcasting?type=xml&province=jawa_tengah",
      weather: "/public/weather",
      weatherFiltered:
        "/public/weather?province=jawa_tengah&kabupaten=banyumas",
      locationByCode: "/public/location?code=33.01.22.1003",
      locationByCoords: "/public/location?lat=-7.656747&lon=109.115523",
    },
  });
});

/**
 * GET /public/nowcasting
 *
 * Query Parameters:
 * - type: "databmkg" (default), "signature", or "databmkg"
 * - code: Nowcasting code (e.g., "CJH") for signature type
 * - province: Province name (e.g., "jawa_tengah") for xml/databmkg type
 *
 */

publicRoute.get("/nowcasting", async (c) => {
  const typeParam = c.req.query("type") || "databmkg";
  const codeParam = c.req.query("code") || "CJH";
  const provinceParam = c.req.query("province")?.replace(/_/g, " ");

  const publicWeather = new PublicWeather();

  try {
    if (typeParam === "signature") {
      // Fetch from signature.bmkg.go.id (JSON)
      const data = await publicWeather.getNowcasting(codeParam);
      return c.json({
        success: true,
        source: "signature.bmkg.go.id",
        code: codeParam,
        data,
      });
    } else if (typeParam === "xml" || typeParam === "databmkg") {
      // Fetch from www.bmkg.go.id (XML → JSON)
      if (!provinceParam) {
        // Return list of active provinces with nowcasting data
        try {
          const allData = await publicWeather.getNowcastingXMLLatest();

          if (!allData?.rss?.channel?.item) {
            return c.json(
              {
                success: false,
                error: "Tidak dapat mengambil data nowcasting aktif",
              },
              500,
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
                if (title.toLowerCase().includes(province.toLowerCase())) {
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

          return c.json({
            success: true,
            source: "www.bmkg.go.id",
            type: "active_provinces_list",
            count: provinces.length,
            provinces,
            last_updated: allData.rss.channel.lastBuildDate || null,
          });
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : String(error);
          return c.json(
            {
              success: false,
              error: "Failed to fetch active provinces list",
              details: errorMessage,
            },
            500,
          );
        }
      }

      try {
        const latest =
          await publicWeather.getNowcastingXMLLatest(provinceParam);

        if (!latest?.nowcasting?.[0]?.link) {
          return c.json(
            {
              success: false,
              error: `Tidak ada peringatan dini cuaca ekstrem untuk provinsi: ${provinceParam}`,
            },
            404,
          );
        }

        const data = await publicWeather.getNowcastingXML(
          latest.nowcasting[0].link,
        );
        return c.json({
          success: true,
          source: "www.bmkg.go.id",
          province: provinceParam,
          data,
        });
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : String(error);
        return c.json(
          {
            success: false,
            error: "Failed to fetch or parse XML data",
            details: errorMessage,
          },
          500,
        );
      }
    } else {
      return c.json(
        {
          success: false,
          error: `Unsupported type parameter: ${typeParam}`,
          supported: ["signature", "xml", "databmkg"],
          examples: {
            signature: "/public/nowcasting?type=signature&code=CJH",
            xml: "/public/nowcasting?type=xml&province=jawa_tengah",
          },
        },
        400,
      );
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return c.json(
      {
        success: false,
        error: errorMessage,
      },
      500,
    );
  }
});

publicRoute.get("/location", async (c) => {
  const codeParam = c.req.query("code");
  const latParam = c.req.query("lat");
  const lonParam = c.req.query("lon");

  const publicWeather = new PublicWeather();

  try {
    let data;

    if (codeParam) {
      // Fetch by ADM4 code (e.g., 33.01.22.1003)
      data = await publicWeather.getLocationWeatherByCode(codeParam);
      return c.json({
        success: true,
        source: "signature.bmkg.go.id",
        type: "by_code",
        code: codeParam,
        data,
      });
    } else if (latParam && lonParam) {
      // Fetch by coordinates
      const lat = parseFloat(latParam);
      const lon = parseFloat(lonParam);

      if (isNaN(lat) || isNaN(lon)) {
        return c.json(
          {
            success: false,
            error: "Invalid lat/lon parameters. Must be valid numbers.",
          },
          400,
        );
      }

      data = await publicWeather.getLocationWeather(lat, lon);
      return c.json({
        success: true,
        source: "signature.bmkg.go.id",
        type: "by_coordinates",
        coordinates: { lat, lon },
        data,
      });
    } else {
      return c.json(
        {
          success: false,
          error:
            "Missing required parameters. Provide either 'code' or both 'lat' and 'lon'.",
          examples: {
            byCode: "/public/location?code=33.01.22.1003",
            byCoordinates: "/public/location?lat=-7.656747&lon=109.115523",
          },
        },
        400,
      );
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return c.json(
      {
        success: false,
        error: errorMessage,
      },
      500,
    );
  }
});

publicRoute.get("/weather", async (c) => {
  const provinceParam = c.req.query("province");
  const kabupatenParam = c.req.query("kabupaten");
  const kecamatanParam = c.req.query("kecamatan");
  const formatParam = c.req.query("format") || "geojson";

  const publicWeather = new PublicWeather();

  try {
    const rawData = (await publicWeather.getPwxDarat()) as any[];

    // Always convert to GeoJSON first for filtering
    const geojson = publicToGeoJSON(rawData);

    // Apply filters
    const filteredGeoJSON = filterPublicGeoJSON(geojson, {
      province: provinceParam ? provinceParam.replace(/_/g, " ") : undefined,
      kabupaten: kabupatenParam ? kabupatenParam.replace(/_/g, " ") : undefined,
      kecamatan: kecamatanParam ? kecamatanParam.replace(/_/g, " ") : undefined,
    });

    // Return based on format
    if (formatParam === "geojson") {
      // Add metadata to GeoJSON
      const response = {
        ...filteredGeoJSON,
        metadata: {
          success: true,
          count: filteredGeoJSON.features.length,
          filters: {
            province: provinceParam || null,
            kabupaten: kabupatenParam || null,
            kecamatan: kecamatanParam || null,
          },
          generated: new Date().toISOString(),
        },
      };
      return c.json(response, 200, {
        "Content-Type": "application/geo+json",
      });
    }

    // Return JSON format with wrapper
    return c.json({
      success: true,
      count: filteredGeoJSON.features.length,
      filters: {
        province: provinceParam || null,
        kabupaten: kabupatenParam || null,
        kecamatan: kecamatanParam || null,
      },
      data: filteredGeoJSON.features,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return c.json(
      {
        success: false,
        error: errorMessage,
      },
      500,
    );
  }
});

export default publicRoute;
