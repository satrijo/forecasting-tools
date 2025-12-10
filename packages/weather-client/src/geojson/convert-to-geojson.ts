/**
 * Convert weather location.json to GeoJSON format
 * This is a CLI script that uses the geojson library
 *
 * Usage: bun src/geojson/convert-to-geojson.ts
 */

import path from "path";
import { toGeoJSON, saveGeoJSON } from "./index.ts";

// Convert from default file (../weather/location.json)
const geojson = toGeoJSON();

const outputPath = path.join(import.meta.dir, "../weather/location.geojson");
saveGeoJSON(geojson, outputPath);

console.log(`✅ Converted ${geojson.features.length} locations to GeoJSON`);
console.log(`📁 Output: ${outputPath}`);
