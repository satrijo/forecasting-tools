/**
 * BMKG Weather Client
 *
 * Unified client for fetching weather data from:
 * - AWS (Automatic Weather Station)
 * - AWOS (Aviation Weather Observation System)
 * - GeoJSON (Location data converter)
 * - Weather (Forecast data)
 *
 * @example
 * ```typescript
 * import { fetchAWSData, fetchAWOSData } from 'weather-client'
 *
 * const awsData = await fetchAWSData('api-key')
 * const awosData = await fetchAWOSData('api-key')
 * ```
 */

// Export AWS module
export * from "./aws";

// Export AWOS module
export * from "./awos";

// Export GeoJSON module
export * from "./geojson";

// Export Weather forecast module
export * from "./public";

// Package version
export const VERSION = "0.0.0";
