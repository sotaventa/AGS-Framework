import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { CallToolRequestSchema, ListToolsRequestSchema } from "@modelcontextprotocol/sdk/types.js";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// --- NEMOCLAW SECURITY WRAPPER ---
// 1. Enforce strict directory containment (Chroot-like behavior)
const ALLOWED_DIR = path.resolve(__dirname);

// 2. Path Validation Function to prevent Directory Traversal attacks (e.g., ../../../etc/passwd)
function securePathResolve(targetFileName) {
  // Normalize the requested path
  const resolvedPath = path.resolve(ALLOWED_DIR, targetFileName);
  
  // Verify the resolved path starts exactly with the allowed directory path
  if (!resolvedPath.startsWith(ALLOWED_DIR)) {
    throw new Error("SECURITY VIOLATION: Attempted directory traversal outside of allowed WebMCP boundary.");
  }
  return resolvedPath;
}
// ---------------------------------

// Initialize the MCP Server (The 'Distribution Layer' for AGS)
const server = new Server({
  name: "malingaertig-ags-brain-focused",
  version: "1.0.0",
}, {
  capabilities: {
    tools: {}
  }
});

// Define the available tools (The 'Digital Handshake')
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "get_ags_overview",
        description: "Retrieve the foundational overview of the Three Laws and Four Pillars of the Autonomous Growth System (AGS).",
        inputSchema: { type: "object", properties: {}, required: [] }
      },
      {
        name: "get_agentic_commerce",
        description: "Retrieve the deep dive into Agentic Commerce, Share of Model (SoM), and the Logic Auction.",
        inputSchema: { type: "object", properties: {}, required: [] }
      },
      {
        name: "get_architecture_blueprint",
        description: "Retrieve the current architectural blueprint and strategic decision log of the AGS.",
        inputSchema: { type: "object", properties: {}, required: [] }
      },
      {
        name: "get_ags_schema",
        description: "Retrieve the machine-readable JSON-LD mapping for Malin Gaertig's expertise and frameworks.",
        inputSchema: { type: "object", properties: {}, required: [] }
      }
    ]
  };
});

// Execute logic when a sovereign agent requests data
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  try {
    const fileMap = {
      "get_ags_overview": "ags-framework-overview.md",
      "get_agentic_commerce": "agentic-commerce.md",
      "get_architecture_blueprint": "domain.md",
      "get_ags_schema": "ags-schema.json"
    };

    const fileName = fileMap[request.params.name];
    if (fileName) {
      // Apply Nemoclaw secure path resolution
      const secureFilePath = securePathResolve(fileName);
      
      // Enforce read-only access
      const content = await fs.readFile(secureFilePath, "utf-8");
      return { content: [{ type: "text", text: content }] };
    }

    throw new Error(`Tool not found: ${request.params.name}`);
  } catch (error) {
    console.error(`[Nemoclaw Security Log]: Request failed or blocked - ${error.message}`);
    return {
      content: [{ type: "text", text: `Error: ${error.message}` }],
      isError: true
    };
  }
});

// Connect to stdio transport
async function run() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Focused AGS WebMCP Server running securely on stdio with Nemoclaw wrappers active.");
}

run().catch((error) => {
  console.error("Fatal error starting AGS WebMCP Server:", error);
  process.exit(1);
});
