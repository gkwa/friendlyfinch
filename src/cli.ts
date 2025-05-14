#!/usr/bin/env node
import { Command } from "commander"
import {
  createNodeInFile,
  readNodesFromFile,
  updateNodesInFile,
  deleteNodesFromFile,
} from "./core/file-operations.js"
import { logger, LogLevel } from "./utils/logger.js"
import { MdastNode, NodeSelector } from "./types/index.js"

const program = new Command()

// Helper function to count verbose flags
function countVerboseFlags(options: any): number {
  if (typeof options.verbose === "boolean") {
    return options.verbose ? 1 : 0
  }
  return options.verbose || 0
}

program
  .name("mdast-crud")
  .description("CRUD operations for markdown files using mdast")
  .version("0.1.0")
  .option(
    "-v, --verbose",
    "Enable verbose output. Can be used multiple times to increase verbosity",
    (_, prev) => prev + 1,
    0,
  )

// Create command
program
  .command("create <file>")
  .description("Create a new node in a markdown file")
  .requiredOption("--type <type>", "Node type (heading, paragraph, link, etc.)")
  .requiredOption("--content <content>", "Node content")
  .option("--level <level>", "Heading level (for heading nodes)", (val) => parseInt(val, 10))
  .option("--url <url>", "URL (for link or image nodes)")
  .option("--title <title>", "Title (for link or image nodes)")
  .option("--alt <alt>", "Alt text (for image nodes)")
  .option("--lang <lang>", "Language (for code blocks)")
  .action(async (file, options) => {
    try {
      const { type, content, ...rest } = options
      logger.setLevel(LogLevel.ERROR + countVerboseFlags(options))

      logger.debug(`Creating ${type} in ${file}`)
      logger.trace(`Options: ${JSON.stringify({ type, content, ...rest })}`)

      await createNodeInFile(file, { type, content, ...rest })
    } catch (error) {
      logger.error((error as Error).message)
      process.exit(1)
    }
  })

// Read command
program
  .command("read <file>")
  .description("Read nodes from a markdown file")
  .requiredOption("--type <type>", "Node type to read")
  .option("--depth <depth>", "Heading depth (for heading nodes)", (val) => parseInt(val, 10))
  .action(async (file, options) => {
    try {
      const { type, ...rest } = options
      logger.setLevel(LogLevel.ERROR + countVerboseFlags(options))

      logger.debug(`Reading ${type} from ${file}`)
      logger.trace(`Selector: ${JSON.stringify({ type, ...rest })}`)

      const nodes = await readNodesFromFile(file, { type, ...rest })

      // Only output to stdout for read command (as this is the actual result)
      if (nodes.length > 0) {
        const formatter = new NodeFormatter()
        console.log(formatter.formatNodes(nodes))
      }
    } catch (error) {
      logger.error((error as Error).message)
      process.exit(1)
    }
  })

// Update command
program
  .command("update <file>")
  .description("Update nodes in a markdown file")
  .requiredOption("--selector <selector>", "Node selector (type[property=value])")
  .option("--content <content>", "New content")
  .option("--level <level>", "New heading level", (val) => parseInt(val, 10))
  .option("--url <url>", "New URL")
  .option("--title <title>", "New title")
  .option("--alt <alt>", "New alt text")
  .option("--lang <lang>", "New language")
  .action(async (file, options) => {
    try {
      const { selector, ...updates } = options
      logger.setLevel(LogLevel.ERROR + countVerboseFlags(options))

      logger.debug(`Updating nodes in ${file}`)
      logger.trace(`Selector: ${selector}`)
      logger.trace(`Updates: ${JSON.stringify(updates)}`)

      const parsedSelector = parseSelectorString(selector)
      await updateNodesInFile(file, parsedSelector as NodeSelector, updates)
    } catch (error) {
      logger.error((error as Error).message)
      process.exit(1)
    }
  })

// Delete command
program
  .command("delete <file>")
  .description("Delete nodes from a markdown file")
  .requiredOption("--selector <selector>", "Node selector (type[property=value])")
  .action(async (file, options) => {
    try {
      const { selector } = options
      logger.setLevel(LogLevel.ERROR + countVerboseFlags(options))

      logger.debug(`Deleting nodes from ${file}`)
      logger.trace(`Selector: ${selector}`)

      const parsedSelector = parseSelectorString(selector)
      await deleteNodesFromFile(file, parsedSelector as NodeSelector)
    } catch (error) {
      logger.error((error as Error).message)
      process.exit(1)
    }
  })

// Helper to parse selector strings like "heading[level=2]"
function parseSelectorString(selectorStr: string): NodeSelector {
  const match = selectorStr.match(/^([a-z]+)(?:\[([^\]]+)\])?$/)

  if (!match) {
    throw new Error(`Invalid selector: ${selectorStr}`)
  }

  const [, type, propStr] = match
  const selector: NodeSelector = { type }

  if (propStr) {
    const propMatch = propStr.match(/([a-z]+)=(.+)/)
    if (propMatch) {
      const [, prop, value] = propMatch
      // Try to parse numbers
      selector[prop] = /^\d+$/.test(value) ? parseInt(value, 10) : value
    }
  }

  return selector
}

// Helper class to format nodes for output
class NodeFormatter {
  formatNodes(nodes: MdastNode[]): string {
    return nodes.map((node) => this.formatNode(node)).join("\n\n")
  }

  formatNode(node: MdastNode): string {
    switch (node.type) {
      case "heading":
        return `${"#".repeat(node.depth)} ${this.getTextContent(node)}`
      case "paragraph":
        return this.getTextContent(node)
      case "code":
        return `\`\`\`${node.lang || ""}\n${node.value}\n\`\`\``
      case "inlineCode":
        return `\`${node.value}\``
      case "link":
        return `[${this.getTextContent(node)}](${node.url})`
      case "image":
        return `![${node.alt || ""}](${node.url})`
      default:
        return JSON.stringify(node, null, 2)
    }
  }

  private getTextContent(node: any): string {
    if (node.children) {
      return node.children
        .filter((child: any) => child.type === "text")
        .map((child: any) => child.value)
        .join("")
    }
    return ""
  }
}

program.parse()
