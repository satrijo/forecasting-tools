/**
 * Convert weather location.json to GeoJSON format
 * This is a CLI script that uses the geojson library
 *
 * Usage: bun src/geojson/convert-to-geojson.ts <input.json> <output.geojson>
 *
 * Example: bun src/geojson/convert-to-geojson.ts ../public/location.json ../public/location.geojson
 */

import path from "path";
import { toGeoJSON, saveGeoJSON } from "./index.ts";

const args = process.argv.slice(2);
if (args.length < 2) {
  console.error(
    "Usage: bun src/geojson/convert-to-geojson.ts <input.json> <output.geojson>",
  );
  process.exit(1);
}

const inputPath = path.resolve(args[0]!);
const outputPath = path.resolve(args[1]!);

const geojson = toGeoJSON(inputPath);
saveGeoJSON(geojson, outputPath);

console.log(`✅ Converted ${geojson.features.length} locations to GeoJSON`);
console.log(`📁 Output: ${outputPath}`);
