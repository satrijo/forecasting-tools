import { Hono } from "hono";
import { AWSDataFetcher, BMKGAuth } from "weather-client";

const app = new Hono();

// Load credentials from environment variables
const username = process.env.BMKG_USERNAME;
const password = process.env.BMKG_PASSWORD;

// Validate credentials
if (!username || !password) {
  throw new Error(
    "BMKG_USERNAME and BMKG_PASSWORD must be set in environment variables",
  );
}

app.get("/", (c) => {
  return c.json({
    message: "BMKG Weather API",
    endpoints: {
      fetch:
        "/aws?province=PR013 atau /aws?stations=sta1101,sta1102 atau /aws?stations=sta1101",
    },
    examples: {
      byProvince: "/aws?province=PR013 atau /aws?province=PR013,PR015",
      byProvinceAwsOnly: "/aws?province=PR013&type=aws",
      byProvinceAllTypes: "/aws?province=PR013&type=aws,arg",
      byRadius: "/aws?lat=-7.5&lon=110.5&radius=50 (50km dari koordinat)",
      byRadiusAwsOnly: "/aws?lat=-7.5&lon=110.5&radius=50&type=aws",
      byCity: "/aws?city=cilacap atau /aws?city=lamongan",
      byMultipleCities: "/aws?city=cilacap,lamongan,tuban",
      byCityWithSpace: "/aws?city=banjar_baru atau /aws?city=kab._banjar",
      byCityExclude:
        "/aws?city=banjar&exclude=banjarnegara,banjarmasin (hanya Kab. Banjar)",
      byCityExact: "/aws?city=kab._banjar&match=exact",
      byCityStartsWith: "/aws?city=banjar&match=startsWith",
      byCityAwsOnly: "/aws?city=cilacap&type=aws",
      byMultipleStations: "/aws?stations=sta1101,sta1102,sta1103",
      bySingleStation: "/aws?stations=sta1101",
    },
  });
});

app.get("/aws", async (c) => {
  const provinceParam = c.req.query("province");
  const stationsParam = c.req.query("stations");
  const cityParam = c.req.query("city");
  const typeParam = c.req.query("type");
  const matchParam = c.req.query("match");
  const excludeParam = c.req.query("exclude");
  const latParam = c.req.query("lat");
  const lonParam = c.req.query("lon");
  const radiusParam = c.req.query("radius");

  // Validasi: harus ada salah satu parameter
  if (!provinceParam && !stationsParam && !cityParam && !latParam) {
    return c.json(
      {
        success: false,
        error:
          "Please provide either 'province', 'city', 'lat+lon+radius', or 'stations' query parameter",
        examples: {
          byProvince: "/aws?province=PR013",
          byCity: "/aws?city=cilacap",
          byRadius: "/aws?lat=-7.5&lon=110.5&radius=50",
          byStations: "/aws?stations=STA1101,STA1102",
        },
      },
      400,
    );
  }

  // Validasi: tidak boleh pakai lebih dari satu
  const paramsProvided = [
    provinceParam,
    stationsParam,
    cityParam,
    latParam,
  ].filter(Boolean).length;
  if (paramsProvided > 1) {
    return c.json(
      {
        success: false,
        error:
          "Please provide only one parameter: either 'province', 'city', 'lat+lon+radius', or 'stations'",
      },
      400,
    );
  }

  // Validasi khusus untuk radius search
  if (latParam && (!lonParam || !radiusParam)) {
    return c.json(
      {
        success: false,
        error: "Radius search requires 'lat', 'lon', and 'radius' parameters",
        example: "/aws?lat=-7.5&lon=110.5&radius=50",
      },
      400,
    );
  }

  try {
    // Setup authentication
    const auth = new BMKGAuth(username, password);
    await auth.authenticate("3");
    console.log("✓ Authenticated");

    const fetcher = new AWSDataFetcher(auth);
    let results;

    if (provinceParam) {
      // Fetch by province
      const provinceCodes = provinceParam
        .split(",")
        .map((code) => code.trim())
        .filter((code) => code.length > 0)
        .map((code) => code.toUpperCase());

      // Parse type parameter
      let type: string | string[] | null = null;
      if (typeParam) {
        const types = typeParam.split(",").map((t) => t.trim().toLowerCase());
        type = types.length === 1 ? types[0] : types;
      }

      console.log(
        "🚀 Fetching AWS data for provinces:",
        provinceCodes,
        "type:",
        type || "all",
      );
      results = await fetcher.fetchDataByProvince(provinceCodes, type);
    } else if (latParam && lonParam && radiusParam) {
      // Fetch by radius
      const lat = parseFloat(latParam);
      const lon = parseFloat(lonParam);
      const radius = parseFloat(radiusParam);

      // Validasi koordinat dan radius
      if (isNaN(lat) || isNaN(lon) || isNaN(radius)) {
        return c.json(
          {
            success: false,
            error: "Invalid lat, lon, or radius value. Must be numbers.",
          },
          400,
        );
      }

      if (lat < -90 || lat > 90 || lon < -180 || lon > 180) {
        return c.json(
          {
            success: false,
            error:
              "Invalid coordinates. Lat must be -90 to 90, Lon must be -180 to 180.",
          },
          400,
        );
      }

      if (radius <= 0) {
        return c.json(
          {
            success: false,
            error: "Radius must be greater than 0",
          },
          400,
        );
      }

      // Parse type parameter
      let type: string | string[] | null = null;
      if (typeParam) {
        const types = typeParam.split(",").map((t) => t.trim().toLowerCase());
        type = types.length === 1 ? types[0] : types;
      }

      console.log(
        "🚀 Fetching data within radius:",
        radius,
        "km from (",
        lat,
        ",",
        lon,
        ") type:",
        type || "all",
      );
      results = await fetcher.fetchDataByRadius(lat, lon, radius, type);
    } else if (cityParam) {
      // Fetch by city name(s)
      const cityNames = cityParam
        .split(",")
        .map((name) => name.trim())
        .filter((name) => name.length > 0);

      // Parse type parameter
      let type: string | string[] | null = null;
      if (typeParam) {
        const types = typeParam.split(",").map((t) => t.trim().toLowerCase());
        type = types.length === 1 ? types[0] : types;
      }

      // Parse match mode
      const matchMode =
        matchParam === "exact" || matchParam === "startsWith"
          ? matchParam
          : "partial";

      // Parse exclude cities
      const excludeCities = excludeParam
        ? excludeParam
            .split(",")
            .map((name) => name.trim())
            .filter((name) => name.length > 0)
        : null;

      console.log(
        "🚀 Fetching data for cities:",
        cityNames,
        "type:",
        type || "all",
        "match:",
        matchMode,
        "exclude:",
        excludeCities || "none",
      );
      results = await fetcher.fetchDataByCity(
        cityNames.length === 1 ? cityNames[0] : cityNames,
        type,
        matchMode,
        excludeCities,
      );
    } else if (stationsParam) {
      // Fetch by station IDs
      const stationIds = stationsParam
        .split(",")
        .map((id) => id.trim())
        .filter((id) => id.length > 0)
        .map((id) => id.toUpperCase());

      console.log("🚀 Fetching data for stations:", stationIds);
      results = await fetcher.fetchMultipleStations(stationIds);
    } else {
      // Tidak akan terjadi karena sudah divalidasi di atas
      throw new Error("Invalid request");
    }

    // Separate successful and failed results
    const successful = results.filter((r) => r.success);
    const failed = results.filter((r) => !r.success);

    console.log(`✅ Success: ${successful.length}/${results.length} stations`);

    const response = {
      success: true,
      summary: {
        total: results.length,
        successful: successful.length,
        failed: failed.length,
      },
      stations: successful,
      failed: failed,
    };

    console.log("📤 Sending response...");
    console.log("Response size:", JSON.stringify(response).length, "bytes");

    return c.json(response);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("❌ Error:", errorMessage);
    console.error("Stack:", error instanceof Error ? error.stack : "N/A");

    return c.json(
      {
        success: false,
        error: errorMessage,
      },
      500,
    );
  }
});

export default app;
