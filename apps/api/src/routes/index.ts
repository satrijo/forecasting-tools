import { Hono } from "hono";

const root = new Hono();

root.get("/", (c) => {
  return c.json({
    success: true,
    message: "BMKG Weather API",
    version: "1.0.0",
    documentation: {
      scalar: "/docs",
      swagger: "/swagger",
      redoc: "/redoc",
      openapi: "/openapi.yaml",
    },
    endpoints: {
      aws: "/aws - Automatic Weather Station data (AWS, AAWS, ARG, ASRS, Soil, Iklimmikro)",
      public: "/public - Public weather data (Nowcasting, Weather forecast)",
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
        weatherFiltered: "/public/weather?province=jawa_tengah&kabupaten=banyumas",
      },
    },
    stationTypes: {
      aws: "Automatic Weather Station - Full weather data",
      aaws: "Advanced AWS - AWS with additional sensors",
      arg: "Automatic Rain Gauge - Rainfall only",
      asrs: "Automatic Solar Radiation Station - Solar radiation data",
      soil: "Soil Moisture Station - Soil moisture & temperature",
      iklimmikro: "Micro Climate Station - Multi-level (4m, 7m, 10m) measurements",
    },
  });
});

export default root;
