# BMKG Weather Forecast Library

Library for fetching and processing weather forecast data from BMKG.

## Status

🚧 Under Development

This library is currently under development. Weather forecast fetching functionality will be implemented soon.

## Planned Features

- Fetch weather forecast data from BMKG
- Support for multiple locations
- Multi-day forecast
- Detailed weather information (temperature, humidity, wind, etc.)
- Type-safe TypeScript interfaces

## API Source

Weather forecast data will be sourced from:

- https://signature.bmkg.go.id/dwt/asset/boot/api_dwt2.php?type=pwxDarat
- https://signature.bmkg.go.id/dwt/asset/boot/api_dwt2.php?type=lokasiCuaca&lon=109.11552349560588&lat=-7.656747622457885
- https://signature.bmkg.go.id/dwt/asset/boot/api_dwt2.php?type=getForecastDarat&code=202512111800.json
- https://signature.bmkg.go.id/dwt/asset/boot/api_dwt2.php?type=getManifest&code=jalurDarat
