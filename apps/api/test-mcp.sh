#!/bin/bash

echo "Testing MCP Server endpoints..."

# Start server in background
echo "Starting server..."
bun run dev &
SERVER_PID=$!

# Wait for server to start
sleep 3

echo "Testing MCP info endpoint..."
curl -s "http://localhost:3000/mcp" | jq '.message'

echo "Testing AWS data endpoint..."
curl -s "http://localhost:3000/mcp/aws?province=PR013" | jq '.success'

echo "Testing nowcasting endpoint..."
curl -s "http://localhost:3000/mcp/nowcasting?province=jawa_tengah" | jq '.success'

# Stop server
echo "Stopping server..."
kill $SERVER_PID

echo "MCP Server test completed!"