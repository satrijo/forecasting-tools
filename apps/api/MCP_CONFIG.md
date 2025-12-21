# BMKG Weather MCP Server Configuration

## Overview

MCP Server endpoint untuk BMKG Weather API yang dapat dihubungkan dengan n8n agent.

## Endpoint

- **Base URL**: `http://localhost:3000/mcp` (sesuaikan dengan port server Anda)
- **Documentation**: `http://localhost:3000/docs`

## Available Endpoints

### 1. MCP Server Info

```
GET /mcp
```

Menginformasikan capabilities dan parameter yang tersedia.

### 2. AWS Weather Data

```
GET /mcp/aws
```

Parameter:

- `province`: Province code (e.g., PR013)
- `stations`: Comma-separated station IDs
- `city`: City name
- `type`: Station type (aws, aaws, arg, asrs, soil, iklimmikro)
- `lat` + `lon` + `radius`: Location-based search
- `format`: Output format (json, geojson)

Contoh:

- `/mcp/aws?province=PR013`
- `/mcp/aws?city=cilacap`
- `/mcp/aws?lat=-7.5&lon=110.5&radius=50`
- `/mcp/aws?stations=STA1101,STA1102&format=geojson`

### 3. Nowcasting Data

```
GET /mcp/nowcasting
```

Parameter:

- `code`: Station code (e.g., CJH)
- `province`: Province name
- `type`: Output format (xml, json)

Contoh:

- `/mcp/nowcasting?code=CJH`
- `/mcp/nowcasting?province=jawa_tengah`
- `/mcp/nowcasting?type=xml&province=jawa_tengah`

## n8n Agent Configuration

### 1. HTTP Request Node

Gunakan HTTP Request node untuk mengakses endpoint MCP:

**Method**: GET
**URL**: `{{ $json.url }}` (gunakan expression untuk dinamis)
**Headers**:

```
Content-Type: application/json
```

### 2. Contoh Workflow n8n

**Step 1: Get AWS Data by Province**

- Node: HTTP Request
- Method: GET
- URL: `http://localhost:3000/mcp/aws?province={{ $json.province }}`
- Output: Simpan di `awsData`

**Step 2: Process Data**

- Node: Code
- JavaScript:

```javascript
const data = $node["awsData"].json;
return {
  success: data.success,
  count: data.data?.length || 0,
  stations: data.data?.map((s) => s.station_name) || [],
};
```

### 3. Error Handling

Tambahkan node IF untuk check response:

- Condition: `{{ $json.success === false }}`
- Action: Send error notification

## Environment Variables

Pastikan environment variables sudah ter-set:

- `BMKG_USERNAME`: Username BMKG API
- `BMKG_PASSWORD`: Password BMKG API

## Testing

1. Start server: `bun run dev`
2. Akses `http://localhost:3000/mcp` untuk melihat capabilities
3. Test endpoint dengan browser atau curl:

```bash
curl "http://localhost:3000/mcp/aws?province=PR013"
```

## Integration dengan n8n

1. Buat new workflow di n8n
2. Tambahkan HTTP Request node
3. Set URL ke endpoint MCP
4. Parse response JSON
5. Gunakan data untuk workflow selanjutnya
