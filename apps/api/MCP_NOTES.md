# 📓 MCP Server – Quick Reference Notes

## What is MCP?

- **MCP (Model Context Protocol)** is a lightweight protocol that standardises how AI‑agents or automation tools request data from a service.
- In this project the MCP server is just a thin wrapper around the existing BMKG Weather API, exposing the same functionality under the `/mcp` prefix.

---

## ✅ Why use MCP?

| Reason                        | Explanation                                                                                             |
| ----------------------------- | ------------------------------------------------------------------------------------------------------- |
| **Standardised contract**     | Agents (n8n, LangChain, custom AI bots) can discover capabilities via the `/mcp` info endpoint.         |
| **Machine‑friendly metadata** | The info payload lists parameters, examples and data formats – no need to read the OpenAPI spec.        |
| **Future‑proof**              | If you later replace the underlying API, the MCP contract can stay stable for downstream agents.        |
| **Single entry point**        | Keeps your automation scripts clean – they always call `/mcp/...` regardless of internal route changes. |

---

## 📍 Endpoints Overview

| Endpoint          | Method | Description                                                                                                           |
| ----------------- | ------ | --------------------------------------------------------------------------------------------------------------------- |
| `/mcp`            | `GET`  | Returns MCP metadata (version, capabilities, example URLs).                                                           |
| `/mcp/aws`        | `GET`  | Same as the regular `/aws` endpoint – supports all query parameters (province, city, stations, radius, format, etc.). |
| `/mcp/nowcasting` | `GET`  | Same as `/public/nowcasting` – returns now‑casting data in JSON or XML.                                               |

---

## 🛠️ Example Calls (cURL)

```bash
# 1️⃣ Get MCP metadata
curl -s http://localhost:3000/mcp | jq .

# 2️⃣ AWS data – JSON (province filter)
curl -s "http://localhost:3000/mcp/aws?province=PR013" | jq .

# 3️⃣ AWS data – GeoJSON (multiple stations)
curl -s "http://localhost:3000/mcp/aws?stations=STA1101,STA1102&format=geojson" | jq .

# 4️⃣ Nowcasting – JSON (by station code)
curl -s "http://localhost:3000/mcp/nowcasting?code=CJH" | jq .

# 5️⃣ Nowcasting – XML (by province)
curl -s "http://localhost:3000/mcp/nowcasting?type=xml&province=jawa_tengah"
```

---

## 🤖 Using MCP in **n8n**

1. **Add an HTTP Request node**
   - **Method**: `GET`
   - **URL**: `http://localhost:3000/mcp/aws?province=PR013`
   - **Response Format**: `JSON`
   - **Headers**: `Content-Type: application/json`
2. **Process the data** with a **Function** node (e.g., calculate average temperature, total rainfall).
3. **Conditional alerts** – add an **IF** node that checks for extreme values (e.g., `temp > 35`).
4. **Notify** – use Email, Slack, or Telegram nodes to send the alert.

> A ready‑to‑import n8n workflow is provided in `N8N_INTEGRATION.md`.

---

## ⚠️ Error handling

| HTTP code | Meaning                                         | Quick fix                                                                                        |
| --------- | ----------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| `400`     | Missing/invalid query parameters                | Verify the query string (province, city, lat/lon/radius, etc.).                                  |
| `401`     | BMKG credentials not set or wrong               | Ensure `BMKG_USERNAME` and `BMKG_PASSWORD` are exported (e.g., in `.env`).                       |
| `500`     | Internal server error – usually a fetch failure | Check server console logs for the stack trace; retry later if the external BMKG service is down. |

---

## 📦 Quick start checklist

- [ ] `cd /home/rio/Work/Coding/BMKG/tools/apps/api`
- [ ] `bun run dev` (or `bun run start` for production)
- [ ] Verify env vars: `echo $BMKG_USERNAME $BMKG_PASSWORD`
- [ ] Test the info endpoint: `curl http://localhost:3000/mcp`
- [ ] Build your n8n workflow using the examples above.

---

## 📚 Further reading

- **MCP spec** – (internal) see `MCP_CONFIG.md` for the contract definition.
- **n8n documentation** – https://docs.n8n.io/
- **BMKG Weather‑Client library** – located in `packages/weather-client`.

---

_Created on December 21 2025 – keep this file up‑to‑date as the MCP server evolves._
