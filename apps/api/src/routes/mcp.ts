import { Hono } from "hono";
import { AWSDataFetcher, BMKGAuth } from "weather-client";
import { awsToGeoJSON } from "weather-client";

const mcp = new Hono();

// Load credentials from environment variables
const username = process.env.BMKG_USERNAME;
const password = process.env.BMKG_PASSWORD;

// Validate credentials
if (!username || !password) {
  throw new Error(
    "BMKG_USERNAME and BMKG_PASSWORD must be set in environment variables",
  );
}

// MCP endpoint for weather data
mcp.get("/", async (c) => {
  return c.json({
    success: true,
    message: "BMKG Weather MCP Server",
    version: "1.0.0",
    capabilities: {
      weather_data: {
        description: "Get weather station data from BMKG",
        parameters: {
          province: "Province code (e.g., PR013)",
          stations: "Comma-separated station IDs",
          city: "City name",
          type: "Station type (aws, aaws, arg, asrs, soil, iklimmikro)",
          lat: "Latitude for radius search",
          lon: "Longitude for radius search",
          radius: "Radius in kilometers",
          format: "Output format (json, geojson)",
        },
        examples: [
          "/mcp?province=PR013",
          "/mcp?city=cilacap",
          "/mcp?lat=-7.5&lon=110.5&radius=50",
          "/mcp?stations=STA1101,STA1102",
        ],
      },
      nowcasting: {
        description: "Get nowcasting weather data",
        parameters: {
          code: "Station code (e.g., CJH)",
          type: "Output format (xml, json)",
          province: "Province name",
        },
        examples: [
          "/mcp/nowcasting?code=CJH",
          "/mcp/nowcasting?type=xml&province=jawa_tengah",
        ],
      },
    },
  });
});

// MCP endpoint for AWS data
mcp.get("/aws", async (c) => {
  const provinceParam = c.req.query("province");
  const stationsParam = c.req.query("stations");
  const cityParam = c.req.query("city");
  const typeParam = c.req.query("type");
  const matchParam = c.req.query("match");
  const excludeParam = c.req.query("exclude");
  const latParam = c.req.query("lat");
  const lonParam = c.req.query("lon");
  const radiusParam = c.req.query("radius");
  const formatParam = c.req.query("format") || "json";

  // Validasi: harus ada salah satu parameter
  if (!provinceParam && !stationsParam && !cityParam && !latParam) {
    return c.json(
      {
        success: false,
        error:
          "Please provide either 'province', 'city', 'lat+lon+radius', or 'stations' query parameter",
        examples: {
          byProvince: "/mcp/aws?province=PR013",
          byProvinceGeoJSON: "/mcp/aws?province=PR013&format=geojson",
          byCity: "/mcp/aws?city=cilacap",
          byCityGeoJSON: "/mcp/aws?city=cilacap&format=geojson",
          byRadius: "/mcp/aws?lat=-7.5&lon=110.5&radius=50",
          byRadiusGeoJSON:
            "/mcp/aws?lat=-7.5&lon=110.5&radius=50&format=geojson",
          byStations: "/mcp/aws?stations=STA1101,STA1102",
        },
        formats: {
          json: "Default format with metadata (format=json or omit)",
          geojson: "GeoJSON format for mapping (format=geojson)",
        },
      },
      400,
    );
  }

  try {
    const auth = new BMKGAuth(username, password);
    const fetcher = new AWSDataFetcher(auth);

    // Parse parameters
    const province = provinceParam ? provinceParam.split(",") : undefined;
    const stations = stationsParam ? stationsParam.split(",") : undefined;
    const type = typeParam ? typeParam.split(",") : undefined;
    const match = matchParam ? matchParam.split(",") : undefined;
    const exclude = excludeParam ? excludeParam.split(",") : undefined;
    const lat = latParam ? parseFloat(latParam) : undefined;
    const lon = lonParam ? parseFloat(lonParam) : undefined;
    const radius = radiusParam ? parseFloat(radiusParam) : undefined;

    // Fetch data
    let data;
    if (province) {
      data = await fetcher.fetchDataByProvince(
        province,
        type,
        cityParam,
        exclude,
      );
    } else if (stations) {
      data = await fetcher.fetchMultipleStations(
        stations,
        type ? type[0] : "aws",
      );
    } else if (cityParam) {
      data = await fetcher.fetchDataByCity(
        cityParam,
        type ? type[0] : "aws",
        "partial",
      );
    } else if (lat && lon && radius) {
      data = await fetcher.fetchDataByRadius(
        lat,
        lon,
        radius,
        type ? type[0] : "aws",
      );
    } else {
      return c.json({ success: false, error: "Invalid parameters" }, 400);
    }

    // Convert to GeoJSON if requested
    if (formatParam === "geojson") {
      const validData = data
        .filter((item: any) => item.success && item.data)
        .map((item: any) => item.data);
      const geojson = awsToGeoJSON(validData);
      return c.json(geojson);
    }

    return c.json(data);
  } catch (error) {
    console.error("Error fetching AWS data:", error);
    return c.json(
      {
        success: false,
        error: "Failed to fetch weather data",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      500,
    );
  }
});

// MCP endpoint for nowcasting data
mcp.get("/nowcasting", async (c) => {
  const codeParam = c.req.query("code");
  const typeParam = c.req.query("type") || "json";
  const provinceParam = c.req.query("province");

  try {
    const auth = new BMKGAuth(username, password);
    const fetcher = new AWSDataFetcher(auth);

    if (codeParam) {
      // Get data by station code
      const data = await fetcher.fetchStationData(codeParam);

      if (typeParam === "xml") {
        return c.text(JSON.stringify(data), 200, {
          "Content-Type": "application/xml; charset=utf-8",
        });
      }

      return c.json(data);
    } else if (provinceParam) {
      // Get data by province
      const data = await fetcher.fetchDataByProvince([provinceParam]);

      if (typeParam === "xml") {
        return c.text(JSON.stringify(data), 200, {
          "Content-Type": "application/xml; charset=utf-8",
        });
      }

      return c.json(data);
    } else {
      return c.json(
        {
          success: false,
          error: "Please provide either 'code' or 'province' parameter",
          examples: {
            byCode: "/mcp/nowcasting?code=CJH",
            byProvince: "/mcp/nowcasting?province=jawa_tengah",
            byProvinceXML: "/mcp/nowcasting?type=xml&province=jawa_tengah",
          },
        },
        400,
      );
    }
  } catch (error) {
    console.error("Error fetching nowcasting data:", error);
    return c.json(
      {
        success: false,
        error: "Failed to fetch nowcasting data",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      500,
    );
  }
});

export default mcp;
