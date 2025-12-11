/**
 * GeoJSON Converter Library - Usage Examples
 *
 * Usage: bun src/geojson/examples.ts
 */

import path from "path";
import {
  toGeoJSON,
  filter,
  filterByBoundingBox,
  saveGeoJSON,
} from "./index.ts";

// Example 1: Load from file
console.log("=== Example 1: Load from File ===");
const locationPath = path.join(import.meta.dir, "../public/location.json");
const allLocations = toGeoJSON(locationPath);
console.log(`Total locations: ${allLocations.features.length}`);
console.log();

// Example 2: Convert from array (simulating API response)
console.log("=== Example 2: Convert from Array (API-like) ===");
const mockAPIData = [
  [
    "DKI Jakarta",
    "Jakarta Pusat",
    "Menteng",
    -6.1944,
    106.8229,
    "31001",
    "202412100800",
    ["75", "28", "0", "NE", "3"],
    "pwx",
  ],
  [
    "DKI Jakarta",
    "Jakarta Selatan",
    "Kebayoran",
    -6.2615,
    106.7809,
    "31002",
    "202412100800",
    ["78", "27", "1", "E", "5"],
    "pwx",
  ],
];
const apiGeoJSON = toGeoJSON(mockAPIData);
console.log(`API data converted: ${apiGeoJSON.features.length} locations`);
console.log();

// Example 3: Filter by province
console.log("=== Example 3: Filter by Province ===");
const acehLocations = filter(allLocations, { province: "Aceh" });
console.log(`Aceh locations: ${acehLocations.features.length}`);
console.log();

// Example 4: Filter by type
console.log("=== Example 4: Filter by Type ===");
const pwxStations = filter(allLocations, { type: "pwx" });
console.log(`PWX stations: ${pwxStations.features.length}`);
console.log();

// Example 5: Filter by bounding box (Java area)
console.log("=== Example 5: Filter by Bounding Box (Java) ===");
const javaLocations = filterByBoundingBox(allLocations, 105, -8, 115, -5);
console.log(`Java area locations: ${javaLocations.features.length}`);
console.log();

// Example 6: Combined filters (Aceh PWX stations)
console.log("=== Example 6: Combined Filters (Aceh + PWX) ===");
const acehPWX = filter(allLocations, { province: "Aceh", type: "pwx" });
console.log(`Aceh PWX stations: ${acehPWX.features.length}`);
console.log();

// Example 7: Province with exclude kabupatens
console.log("=== Example 7: Province + Exclude Kabupatens ===");
const jawaTengahFiltered = filter(allLocations, {
  province: "Jawa Tengah",
  excludeKabupaten: ["Banyumas", "Cilacap"],
});
console.log(
  `Jawa Tengah (excluding Banyumas & Cilacap): ${jawaTengahFiltered.features.length}`,
);

// Check what we excluded
const jawaTengahAll = filter(allLocations, { province: "Jawa Tengah" });
const banyumas = filter(allLocations, {
  province: "Jawa Tengah",
  kabupaten: "Banyumas",
});
const cilacap = filter(allLocations, {
  province: "Jawa Tengah",
  kabupaten: "Cilacap",
});
console.log(`  - Total Jawa Tengah: ${jawaTengahAll.features.length}`);
console.log(`  - Banyumas excluded: ${banyumas.features.length}`);
console.log(`  - Cilacap excluded: ${cilacap.features.length}`);
console.log();

// Example 8: Multiple criteria at once
console.log("=== Example 8: Multiple Criteria ===");
const complexFilter = filter(allLocations, {
  province: "Jawa Barat",
  kabupaten: "Bandung",
  excludeKabupaten: ["Bandung Barat"],
  type: "pwx",
});
console.log(
  `Jawa Barat, Bandung PWX (not Bandung Barat): ${complexFilter.features.length}`,
);
console.log();

// Example 9: Kecamatan filtering
console.log("=== Example 9: Kecamatan Filtering ===");
const banyumasWithoutJatilawang = filter(allLocations, {
  kabupaten: "Banyumas",
  excludeKecamatan: ["Jatilawang"],
});
console.log(
  `Banyumas without Jatilawang: ${banyumasWithoutJatilawang.features.length}`,
);

const purwokertoOnly = filter(allLocations, {
  kabupaten: "Banyumas",
  kecamatan: "Purwokerto",
});
console.log(`Purwokerto area only: ${purwokertoOnly.features.length}`);
console.log();

// Example 10: Display sample GeoJSON feature
console.log("=== Example 10: Sample GeoJSON Feature ===");
if (acehLocations.features.length > 0) {
  console.log(JSON.stringify(acehLocations.features[0], null, 2));
}
console.log();

// Example 11: Save filtered data
console.log("=== Example 11: Save Filtered Data ===");
const outputPath = "./aceh-sample.geojson";
saveGeoJSON(acehLocations, outputPath);
console.log(`✅ Saved Aceh locations to: ${outputPath}`);
