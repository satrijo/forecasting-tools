import { Hono } from "hono";

const root = new Hono();

root.get("/", (c) => {
  const accept = c.req.header("Accept");
  if (accept && accept.includes("text/event-stream")) {
    // SSE transport for MCP
    return new Response(
      `event: endpoint\ndata: {"url": "https://tools.codeverflow.workers.dev/"}\n\n`,
      {
        headers: {
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache",
          Connection: "keep-alive",
          "Access-Control-Allow-Origin": "*",
        },
      },
    );
  }
  return c.json({
    success: true,
    message: "BMKG Weather API",
    version: "1.0.0",
    documentation: {
      scalar: "/docs",
      openapi: "/openapi.yaml",
    },
    endpoints: {
      aws: "/aws - Automatic Weather Station data (AWS, AAWS, ARG, ASRS, Soil, Iklimmikro)",
      public: "/public - Public weather data (Nowcasting, Weather forecast)",
      mcp: "/mcp - Model Context Protocol server for weather data integration",
    },
    examples: {
      aws: {
        byProvince: "/aws?province=PR013",
        byProvinceMultiple: "/aws?province=PR013,PR015",
        byProvinceAwsOnly: "/aws?province=PR013&type=aws",
        byProvinceGeoJSON: "/aws?province=PR013&format=geojson",
        byRadius: "/aws?lat=-7.5&lon=110.5&radius=50",
        byCity: "/aws?city=cilacap",
        byCityExclude: "/aws?city=banjar&exclude=banjarnegara",
        byStations: "/aws?stations=STA1101,STA1102",
      },
      public: {
        nowcasting: "/public/nowcasting?code=CJH",
        nowcastingXML: "/public/nowcasting?type=xml&province=jawa_tengah",
        weather: "/public/weather",
        weatherFiltered:
          "/public/weather?province=jawa_tengah&kabupaten=banyumas",
      },
    },
    stationTypes: {
      aws: "Automatic Weather Station - Full weather data",
      aaws: "Advanced AWS - AWS with additional sensors",
      arg: "Automatic Rain Gauge - Rainfall only",
      asrs: "Automatic Solar Radiation Station - Solar radiation data",
      soil: "Soil Moisture Station - Soil moisture & temperature",
      iklimmikro:
        "Micro Climate Station - Multi-level (4m, 7m, 10m) measurements",
    },
  });
});

export default root;
