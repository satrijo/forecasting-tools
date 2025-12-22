// Using built-in fetch (Node.js 18+)

async function testRegionalCodes() {
  const serverUrl = "https://tools.codeverflow.workers.dev";

  try {
    // Initialize
    console.log("🔧 Initializing MCP connection...");
    const initResponse = await fetch(serverUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: 1,
        method: "initialize",
        params: {
          protocolVersion: "2024-11-05",
          capabilities: {},
          clientInfo: { name: "test-client", version: "1.0.0" },
        },
      }),
    });
    const initResult = await initResponse.json();
    console.log("✅ Initialized");

    // Test getting all provinces
    console.log("\n🗺️  Testing regional codes - Provinces:");
    const provincesResponse = await fetch(serverUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: 2,
        method: "tools/call",
        params: {
          name: "get_regional_codes",
          arguments: { level: 1, limit: 5 },
        },
      }),
    });
    const provincesResult = await provincesResponse.json();
    const provinces = provincesResult.result.content[0].text;
    const provincesData = JSON.parse(provinces);
    console.log(
      `Found ${provincesData.total} total codes, ${provincesData.filtered} filtered, ${provincesData.returned} returned`,
    );
    console.log(
      "Sample provinces:",
      provincesData.data.map((p) => p.name).join(", "),
    );

    // Test getting regencies in Jawa Tengah
    console.log("\n🏛️  Testing regional codes - Jawa Tengah Regencies:");
    const jtResponse = await fetch(serverUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: 3,
        method: "tools/call",
        params: {
          name: "get_regional_codes",
          arguments: { parent_code: "33", level: 2, limit: 5 },
        },
      }),
    });
    const jtResult = await jtResponse.json();
    const jtData = JSON.parse(jtResult.result.content[0].text);
    console.log(
      "Jawa Tengah regencies:",
      jtData.data.map((r) => r.name).join(", "),
    );

    // Test search functionality
    console.log("\n🔍 Testing regional codes - Search for Semarang:");
    const searchResponse = await fetch(serverUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: 4,
        method: "tools/call",
        params: {
          name: "get_regional_codes",
          arguments: { query: "semarang", limit: 3 },
        },
      }),
    });
    const searchResult = await searchResponse.json();
    const searchData = JSON.parse(searchResult.result.content[0].text);
    console.log(
      "Semarang search results:",
      searchData.data.map((r) => `${r.code}: ${r.name}`).join(", "),
    );

    console.log("\n✅ All regional codes tests passed!");
  } catch (error) {
    console.error("❌ Error:", error.message);
  }
}

testRegionalCodes();
