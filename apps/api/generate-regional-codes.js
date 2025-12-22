const fs = require("fs");
const path = require("path");

// Parse regional codes from CSV
function parseRegionalCodes(csvPath) {
  const csvContent = fs.readFileSync(csvPath, "utf-8");
  const lines = csvContent.trim().split("\n");

  const codes = [];

  for (const line of lines) {
    if (!line.trim()) continue;

    // Handle quoted fields with commas inside
    let [code, name] = ["", ""];
    if (line.includes('"')) {
      // Find the first comma that's not inside quotes
      let inQuotes = false;
      let commaIndex = -1;
      for (let i = 0; i < line.length; i++) {
        if (line[i] === '"') {
          inQuotes = !inQuotes;
        } else if (line[i] === "," && !inQuotes) {
          commaIndex = i;
          break;
        }
      }
      if (commaIndex !== -1) {
        code = line.substring(0, commaIndex).trim();
        name = line.substring(commaIndex + 1).trim();
        // Remove surrounding quotes if present
        if (name.startsWith('"') && name.endsWith('"')) {
          name = name.slice(1, -1);
        }
      }
    } else {
      [code, name] = line.split(",");
    }

    if (!code || !name) continue;

    // Determine level based on dot count
    const level = (code.match(/\./g) || []).length + 1;

    codes.push({
      code: code.trim(),
      name: name.trim(),
      level,
    });
  }

  return codes;
}

// Generate TypeScript code for MCP server
function generateTypeScriptCode(codes) {
  let code = "// Auto-generated regional codes from kode_wilayah.csv\n";
  code +=
    "const regionalCodes: Array<{ code: string; name: string; level: number }> = [\n";

  for (const item of codes) {
    code += `  { code: "${item.code}", name: "${item.name}", level: ${item.level} },\n`;
  }

  code += "];\n\n";
  code += "export default regionalCodes;\n";

  return code;
}

// Main execution
const csvPath = path.join(__dirname, "assets/kode_wilayah.csv");
const outputPath = path.join(__dirname, "src/regional-codes.ts");

console.log("Parsing regional codes from CSV...");
const codes = parseRegionalCodes(csvPath);
console.log(`Found ${codes.length} regional codes`);

console.log("Generating TypeScript code...");
const tsCode = generateTypeScriptCode(codes);

console.log("Writing to file...");
fs.writeFileSync(outputPath, tsCode);

console.log(`✅ Generated regional codes file: ${outputPath}`);
console.log(`📊 Total codes: ${codes.length}`);
console.log(`🏛️  Provinces: ${codes.filter((c) => c.level === 1).length}`);
console.log(
  `🏛️  Regencies/Cities: ${codes.filter((c) => c.level === 2).length}`,
);
console.log(`🏛️  Districts: ${codes.filter((c) => c.level === 3).length}`);
console.log(`🏛️  Villages: ${codes.filter((c) => c.level === 4).length}`);
