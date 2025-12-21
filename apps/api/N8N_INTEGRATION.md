# n8n Integration with BMKG Weather API

## Overview

Cara integrasi n8n dengan BMKG Weather API langsung (tanpa MCP layer) untuk weather data automation.

## Available Endpoints

### 1. AWS Weather Data

```
GET /aws
```

**Parameters:**

- `province`: Province code (e.g., PR013)
- `city`: City name
- `stations`: Comma-separated station IDs
- `lat` + `lon` + `radius`: Location search
- `type`: Station type (aws, aaws, arg, asrs, soil, iklimmikro)
- `format`: json (default) or geojson

**Examples:**

- `/aws?province=PR013`
- `/aws?city=cilacap`
- `/aws?lat=-7.5&lon=110.5&radius=50`
- `/aws?stations=STA1101,STA1102&format=geojson`

### 2. Public Weather Data

```
GET /public/nowcasting
```

**Parameters:**

- `code`: Station code (e.g., CJH)
- `type`: json (default) or xml
- `province`: Province name

**Examples:**

- `/public/nowcasting?code=CJH`
- `/public/nowcasting?province=jawa_tengah`
- `/public/nowcasting?type=xml&province=jawa_tengah`

## n8n Workflow Examples

### Example 1: Daily Weather Report by Province

**Step 1: HTTP Request - Get AWS Data**

- **Node**: HTTP Request
- **Method**: GET
- **URL**: `{{ $json.provinceUrl || '/aws?province=PR013' }}`
- **Headers**:
  ```
  Content-Type: application/json
  ```
- **Authentication**: None (uses env vars)

**Step 2: Data Processing**

- **Node**: Code
- **JavaScript**:

```javascript
const awsData = $node["HTTP Request"].json;

// Process data
const result = {
  timestamp: new Date().toISOString(),
  province: $json.province || "PR013",
  totalStations: awsData.data?.length || 0,
  stations:
    awsData.data?.map((station) => ({
      id: station.id_station,
      name: station.station_name,
      city: station.nama_kota,
      temperature: station.T2M?.avg || "N/A",
      humidity: station.RH2M?.avg || "N/A",
      rainfall: station.RF?.sum || "N/A",
    })) || [],
  summary: {
    avgTemp:
      awsData.data?.reduce((sum, station) => sum + (station.T2M?.avg || 0), 0) /
      (awsData.data?.length || 1),
    totalRainfall: awsData.data?.reduce(
      (sum, station) => sum + (station.RF?.sum || 0),
      0,
    ),
  },
};

return result;
```

**Step 3: Send Email/Notification**

- **Node**: Send Email (SMTP) or Slack
- **Use data from**: Code node output

### Example 2: Weather Alert System

**Step 1: HTTP Request - Get Weather Data**

- **Method**: GET
- **URL**: `/aws?province=PR013`
- **Options**: Follow redirects: true, Timeout: 30000

**Step 2: IF Condition - Check for Alerts**

- **Condition**:

```javascript
{
  {
    $json.success === true && $json.data && $json.data.length > 0;
  }
}
```

**Step 3: Code - Process Alerts**

```javascript
const data = $node["HTTP Request"].json;
const alerts = [];

data.data.forEach((station) => {
  // Check for extreme weather conditions
  if (station.T2M?.max > 35) {
    alerts.push({
      type: "HIGH_TEMP",
      station: station.station_name,
      value: station.T2M.max,
      threshold: 35,
      message: `High temperature alert: ${station.T2M.max}°C`,
    });
  }

  if (station.RF?.sum > 50) {
    alerts.push({
      type: "HEAVY_RAIN",
      station: station.station_name,
      value: station.RF.sum,
      threshold: 50,
      message: `Heavy rainfall alert: ${station.RF.sum}mm`,
    });
  }
});

return {
  hasAlerts: alerts.length > 0,
  alertCount: alerts.length,
  alerts: alerts,
  timestamp: new Date().toISOString(),
};
```

**Step 4: Send Alert**

- **Condition**: `{{ $json.hasAlerts === true }}`
- **Action**: Send notification via email/Slack

### Example 3: Weather Data to Database

**Step 1: Schedule Trigger**

- **Settings**: Run every hour

**Step 2: HTTP Request - Fetch Data**

- **URL**: `/aws?province=PR013,PR015,PR016`

**Step 3: Code - Transform for Database**

```javascript
const rawData = $node["HTTP Request"].json;
const timestamp = new Date().toISOString();

const processedData = rawData.data.map((station) => ({
  station_id: station.id_station,
  station_name: station.station_name,
  province_code: station.kode_propinsi,
  city: station.nama_kota,
  latitude: station.latitude,
  longitude: station.longitude,
  timestamp: timestamp,
  temperature_avg: station.T2M?.avg,
  temperature_max: station.T2M?.max,
  temperature_min: station.T2M?.min,
  humidity_avg: station.RH2M?.avg,
  humidity_max: station.RH2M?.max,
  humidity_min: station.RH2M?.min,
  rainfall_sum: station.RF?.sum,
  wind_speed_avg: station.WS10M?.avg,
  wind_direction: station.WD10M?.avg,
  pressure: station.PRES?.avg,
  solar_radiation: station.SOLAR?.avg,
}));

return {
  timestamp: timestamp,
  recordCount: processedData.length,
  data: processedData,
};
```

**Step 4: Insert to Database**

- **Node**: PostgreSQL/MongoDB Insert
- **Use data from**: Code node output

## Environment Variables Setup

Di n8n:

1. **BMKG_USERNAME**: Username BMKG API
2. **BMKG_PASSWORD**: Password BMKG API
3. **API_BASE_URL**: `http://localhost:3000` (sesuaikan dengan server Anda)

## Error Handling

### HTTP Request Node Settings:

- **Follow redirects**: true
- **Timeout**: 30000 ms
- **Authentication**: None (server handles auth via env vars)

### Common Error Codes:

- `400`: Invalid parameters
- `401`: Authentication failed
- `500`: Server error

## Testing API Endpoints

### Test with curl:

```bash
# Test AWS data
curl "http://localhost:3000/aws?province=PR013"

# Test nowcasting
curl "http://localhost:3000/public/nowcasting?code=CJH"

# Test with error handling
curl -I "http://localhost:3000/aws"  # Should return 400 (no parameters)
```

### Test in n8n:

1. Create new workflow
2. Add HTTP Request node
3. Set URL to test endpoint
4. Check response in node output
5. Parse JSON data

## Performance Tips

1. **Use specific parameters** to reduce data size
2. **Implement caching** in n8n if data doesn't change often
3. **Use pagination** for large datasets (if available)
4. **Schedule during off-peak hours** for frequent runs

## Troubleshooting

### Common Issues:

1. **401 Unauthorized**: Check BMKG credentials in server env vars
2. **400 Bad Request**: Check parameter format
3. **Empty response**: Verify province codes and station IDs
4. **Slow response**: Use specific filters instead of broad searches

### Debug Steps:

1. Test endpoint with curl first
2. Check server logs for errors
3. Verify parameter format in n8n
4. Test with minimal parameters first
