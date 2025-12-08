/**
 * BMKG Weather Client
 *
 * Unified client for fetching weather data from:
 * - AWS (Automatic Weather Station)
 * - AWOS (Aviation Weather Observation System)
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

// Package version
export const VERSION = "0.0.0";
