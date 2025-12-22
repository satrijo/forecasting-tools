#!/usr/bin/env node

// Simple MCP client for testing BMKG Weather MCP Server

class MCPClient {
  constructor(serverUrl) {
    this.serverUrl = serverUrl;
    this.nextId = 1;
  }

  async sendRequest(method, params = {}) {
    const request = {
      jsonrpc: "2.0",
      id: this.nextId++,
      method,
      params,
    };

    console.log(`\n📤 Sending request: ${method}`);
    console.log(`📋 Parameters:`, JSON.stringify(params, null, 2));

    try {
      const response = await fetch(this.serverUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(request),
      });

      const result = await response.json();
      console.log(`✅ Response:`, JSON.stringify(result, null, 2));
      return result;
    } catch (error) {
      console.error(`❌ Error:`, error.message);
      return null;
    }
  }

  async initialize() {
    return await this.sendRequest("initialize", {
      protocolVersion: "2024-11-05",
      capabilities: {},
      clientInfo: {
        name: "mcp-test-client",
        version: "1.0.0",
      },
    });
  }

  async listTools() {
    return await this.sendRequest("tools/list");
  }

  async callTool(toolName, args) {
    return await this.sendRequest("tools/call", {
      name: toolName,
      arguments: args,
    });
  }
}

async function runInteractiveTest(
  serverUrl = "https://tools.codeverflow.workers.dev",
) {
  const client = new MCPClient(serverUrl);

  console.log("🌤️  BMKG Weather MCP Client Test");
  console.log("=================================");
  console.log(`Server URL: ${serverUrl}`);
  console.log("");

  // Initialize
  console.log("🔧 Initializing MCP connection...");
  const initResult = await client.initialize();
  if (!initResult || initResult.error) {
    console.error("❌ Failed to initialize MCP connection");
    process.exit(1);
  }
  console.log("✅ MCP connection initialized successfully\n");

  // List tools
  console.log("📋 Fetching available tools...");
  const toolsResult = await client.listTools();
  if (!toolsResult || toolsResult.error) {
    console.error("❌ Failed to list tools");
    process.exit(1);
  }

  const tools = toolsResult.result.tools;
  console.log(`✅ Found ${tools.length} tools:\n`);

  tools.forEach((tool, index) => {
    console.log(`${index + 1}. ${tool.name}`);
    console.log(`   ${tool.description}`);
  });

  console.log("\n🧪 Testing weather tools...\n");

  // Test each tool with sample data
  const testCases = [
    {
      name: "get_weather_by_city",
      args: { city: "semarang", format: "json" },
      description: "Weather data for Semarang city",
    },
    {
      name: "get_weather_by_province",
      args: { province: "PR013", format: "json" },
      description: "Weather data for Jawa Tengah province",
    },
    {
      name: "get_weather_by_radius",
      args: { lat: -6.9667, lon: 110.4167, radius: 25, format: "json" },
      description: "Weather data within 25km of Semarang center",
    },
    {
      name: "get_weather_by_stations",
      args: { stations: ["STA5052", "STA2182"], format: "json" },
      description: "Weather data for specific station IDs",
    },
    {
      name: "get_nowcasting",
      args: { province: "jawa_tengah", format: "json" },
      description: "Nowcasting data for Jawa Tengah",
    },
  ];

  for (const testCase of testCases) {
    console.log(`🌤️  Testing: ${testCase.description}`);
    const result = await client.callTool(testCase.name, testCase.args);

    if (result && !result.error) {
      try {
        const data = JSON.parse(result.result.content[0].text);
        if (Array.isArray(data)) {
          console.log(`✅ Success: Retrieved ${data.length} weather stations`);
        } else {
          console.log(`✅ Success: Retrieved weather data`);
        }
      } catch (e) {
        console.log(
          `✅ Success: Retrieved data (${result.result.content[0].text.length} chars)`,
        );
      }
    } else {
      console.log(`❌ Failed: ${result?.error?.message || "Unknown error"}`);
    }
    console.log("");
  }

  console.log("🎉 MCP client test completed!");
  console.log("\n💡 To use with n8n:");
  console.log("1. Add MCP Server node in n8n");
  console.log(`2. Set Server URL: ${serverUrl}`);
  console.log("3. Set Transport: HTTP");
  console.log("4. The server will automatically discover available tools");
}

async function runQuickTest(
  serverUrl = "https://tools.codeverflow.workers.dev",
) {
  const client = new MCPClient(serverUrl);

  console.log("🚀 Quick MCP Test");
  console.log("=================");

  // Quick initialize and tools list test
  const initResult = await client.initialize();
  const toolsResult = await client.listTools();

  if (initResult && !initResult.error && toolsResult && !toolsResult.error) {
    console.log("✅ MCP server is working!");
    console.log(`📊 Available tools: ${toolsResult.result.tools.length}`);

    // Quick tool test
    const testResult = await client.callTool("get_weather_by_city", {
      city: "semarang",
      format: "json",
    });

    if (testResult && !testResult.error) {
      console.log("✅ Weather data retrieval working!");
    } else {
      console.log("❌ Weather data retrieval failed");
    }
  } else {
    console.log("❌ MCP server test failed");
    process.exit(1);
  }
}

// Check command line arguments
const args = process.argv.slice(2);
let serverUrl = "https://tools.codeverflow.workers.dev";
let command = null;

for (let i = 0; i < args.length; i++) {
  const arg = args[i];
  if (arg === "--quick" || arg === "-q") {
    command = "quick";
  } else if (arg === "--help" || arg === "-h") {
    command = "help";
  } else if (!arg.startsWith("-")) {
    serverUrl = arg;
  }
}

if (command === "help") {
  console.log(`
BMKG Weather MCP Client Test
============================

Usage:
  node mcp-client.js [server-url]     # Interactive test
  node mcp-client.js --quick          # Quick connectivity test
  node mcp-client.js --help           # Show this help

Examples:
  node mcp-client.js
  node mcp-client.js https://tools.codeverflow.workers.dev
  node mcp-client.js --quick

Default server URL: https://tools.codeverflow.workers.dev
  `);
} else if (command === "quick") {
  runQuickTest(serverUrl);
} else {
  // Default to interactive test
  runInteractiveTest(serverUrl);
}
