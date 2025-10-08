import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'

import { exec as execSync } from 'child_process'
import { promisify } from 'util'
import { z } from 'zod'

const exec = promisify(execSync)

// Initialize the MCP server with a name and version
const server = new McpServer({ name: 'workshops-de-your-mcp', version: '1.0.0' })

server.registerTool(
  'deep-dive-scraping',
  {
    title: 'Deep Dive Web Scraping',
    description: 'A tool that allows you to scrape a website and get the data you need.',
    inputSchema: {
      // url: z.string().url().describe('The target URL that should be scraped and analysed.'),
      urls: z
        .array(z.string().url())
        .describe('The target URLs that should be scraped and analysed.'),
    },
  },
  async ({ urls }) => {
    const requests = urls.map((url) => fetch(url))
    const responses = await Promise.all(requests)
    const texts = await Promise.all(responses.map(async (response) => await response.text()))

    const content: { type: 'text'; text: string }[] = texts.flatMap((text) => [
      {
        type: 'text',
        text,
      },
    ])

    return { content }
  },
)

// Start listening for MCP messages on STDIN/STDOUT
const transport = new StdioServerTransport()

server
  .connect(transport)
  .then(() => console.log('MCP server started'))
  .catch((error) => console.error('Error connecting to MCP server:', error))
