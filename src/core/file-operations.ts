import { promises as fs } from "node:fs"
import { createNode, readNodes, updateNodes, deleteNodes } from "./crud.js"
import { NodeCreationOptions, NodeSelector, NodeUpdateOptions, MdastNode } from "../types/index.js"

/**
 * Read a markdown file
 */
export async function readMarkdownFile(filePath: string): Promise<string> {
  try {
    return await fs.readFile(filePath, "utf-8")
  } catch (error) {
    throw new Error(`Failed to read file ${filePath}: ${(error as Error).message}`)
  }
}

/**
 * Write to a markdown file
 */
export async function writeMarkdownFile(filePath: string, content: string): Promise<void> {
  try {
    await fs.writeFile(filePath, content, "utf-8")
  } catch (error) {
    throw new Error(`Failed to write to file ${filePath}: ${(error as Error).message}`)
  }
}

/**
 * Create a new node in a markdown file
 */
export async function createNodeInFile(
  filePath: string,
  options: NodeCreationOptions,
): Promise<void> {
  const content = await readMarkdownFile(filePath)
  const updatedContent = createNode(content, options)
  await writeMarkdownFile(filePath, updatedContent)
}

/**
 * Read nodes from a markdown file
 */
export async function readNodesFromFile(
  filePath: string,
  selector: NodeSelector,
): Promise<MdastNode[]> {
  const content = await readMarkdownFile(filePath)
  return readNodes(content, selector)
}

/**
 * Update nodes in a markdown file
 */
export async function updateNodesInFile(
  filePath: string,
  selector: NodeSelector,
  updates: NodeUpdateOptions,
): Promise<void> {
  const content = await readMarkdownFile(filePath)
  const updatedContent = updateNodes(content, selector, updates)
  await writeMarkdownFile(filePath, updatedContent)
}

/**
 * Delete nodes from a markdown file
 */
export async function deleteNodesFromFile(filePath: string, selector: NodeSelector): Promise<void> {
  const content = await readMarkdownFile(filePath)
  const updatedContent = deleteNodes(content, selector)
  await writeMarkdownFile(filePath, updatedContent)
}
