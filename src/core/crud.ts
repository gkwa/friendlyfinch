import { fromMarkdown } from "mdast-util-from-markdown"
import { toMarkdown } from "mdast-util-to-markdown"
import { gfmFromMarkdown } from "mdast-util-gfm"
import { gfm } from "micromark-extension-gfm"
import { visit } from "unist-util-visit"
import { Root, Text } from "mdast"
import {
  NodeCreationOptions,
  NodeSelector,
  NodeUpdateOptions,
  MdastNode,
  NodeMatcher,
  ParentNode,
} from "../types/index.js"

/**
 * Creates a matcher function from a selector object
 */
export function createMatcher(selector: NodeSelector): NodeMatcher {
  return (node: MdastNode) => {
    // Check if the node type matches
    if (node.type !== selector.type) {
      return false
    }
    // Check if all other properties match
    for (const [key, value] of Object.entries(selector)) {
      if (key === "type") continue
      if (node[key as keyof MdastNode] !== value) {
        return false
      }
    }
    return true
  }
}

/**
 * Parse markdown to mdast
 */
export function parseMarkdown(markdown: string): Root {
  return fromMarkdown(markdown, {
    extensions: [gfm()],
    mdastExtensions: [gfmFromMarkdown()],
  })
}

/**
 * Stringify mdast to markdown
 */
export function stringifyMarkdown(root: Root): string {
  return toMarkdown(root)
}

/**
 * Create a text node with content
 */
export function createTextNode(content: string): Text {
  return {
    type: "text",
    value: content,
  }
}

/**
 * Create a new node in the markdown content
 */
export function createNode(markdown: string, options: NodeCreationOptions): string {
  const ast = parseMarkdown(markdown)
  const newNode = createNodeFromOptions(options)
  ast.children.push(newNode as any)
  return stringifyMarkdown(ast)
}

/**
 * Create a node from options
 */
function createNodeFromOptions(options: NodeCreationOptions): MdastNode {
  const { type, content, ...rest } = options
  switch (type) {
    case "heading": {
      const level = (rest.level as number) || 1
      return {
        type: "heading",
        depth: level,
        children: [createTextNode(content)],
      } as MdastNode
    }
    case "paragraph":
      return {
        type: "paragraph",
        children: [createTextNode(content)],
      } as MdastNode
    case "link": {
      const url = (rest.url as string) || ""
      const title = (rest.title as string) || null
      return {
        type: "link",
        url,
        title,
        children: [createTextNode(content)],
      } as MdastNode
    }
    case "code": {
      const lang = (rest.lang as string) || null
      return {
        type: "code",
        lang,
        value: content,
      } as MdastNode
    }
    case "inlineCode":
      return {
        type: "inlineCode",
        value: content,
      } as MdastNode
    case "emphasis":
      return {
        type: "emphasis",
        children: [createTextNode(content)],
      } as MdastNode
    case "strong":
      return {
        type: "strong",
        children: [createTextNode(content)],
      } as MdastNode
    case "image": {
      const url = (rest.url as string) || ""
      const alt = (rest.alt as string) || ""
      const title = (rest.title as string) || null
      return {
        type: "image",
        url,
        alt,
        title,
      } as MdastNode
    }
    case "thematicBreak":
      return {
        type: "thematicBreak",
      } as MdastNode
    case "blockquote":
      return {
        type: "blockquote",
        children: [
          {
            type: "paragraph",
            children: [createTextNode(content)],
          },
        ],
      } as MdastNode
    case "html":
      return {
        type: "html",
        value: content,
      } as MdastNode
    default:
      throw new Error(`Unsupported node type: ${type}`)
  }
}

/**
 * Read nodes from the markdown content
 */
export function readNodes(markdown: string, selector: NodeSelector): MdastNode[] {
  const ast = parseMarkdown(markdown)
  const matcher = createMatcher(selector)
  const nodes: MdastNode[] = []
  visit(ast, (node) => {
    if (matcher(node)) {
      nodes.push(node)
    }
  })
  return nodes
}

/**
 * Check if a node has children (is a Parent node)
 */
function hasChildren(node: MdastNode): node is ParentNode {
  return "children" in node && Array.isArray((node as any).children)
}

/**
 * Check if a node has a value property
 */
function hasValue(node: MdastNode): boolean {
  return "value" in node && typeof (node as any).value === "string"
}

/**
 * Update nodes in the markdown content
 */
export function updateNodes(
  markdown: string,
  selector: NodeSelector,
  updates: NodeUpdateOptions,
): string {
  // Parse the markdown into an AST
  const ast = parseMarkdown(markdown)
  const matcher = createMatcher(selector)

  // Process the AST, updating matching nodes
  visit(ast, (node) => {
    if (matcher(node)) {
      Object.entries(updates).forEach(([key, value]) => {
        if (key === "content" && hasChildren(node)) {
          // Special handling for content in parent nodes
          if (
            node.type === "heading" ||
            node.type === "paragraph" ||
            node.type === "link" ||
            node.type === "emphasis" ||
            node.type === "strong"
          ) {
            node.children = [createTextNode(value as string)]
          }
        } else if (key === "content" && hasValue(node)) {
          // For nodes like code, inlineCode, and html
          ;(node as any).value = value
        } else if (key === "level" && node.type === "heading") {
          // Special handling for heading level -> depth
          ;(node as any).depth = value
        } else {
          // For other properties
          ;(node as any)[key] = value
        }
      })
    }
  })

  // Convert the AST back to markdown
  return stringifyMarkdown(ast)
}

/**
 * Delete nodes from the markdown content
 */
export function deleteNodes(markdown: string, selector: NodeSelector): string {
  const ast = parseMarkdown(markdown)
  const matcher = createMatcher(selector)
  const nodesToRemove: { node: MdastNode; index: number; parent: ParentNode }[] = []

  visit(ast, (node, index, parent) => {
    if (matcher(node) && parent && typeof index === "number" && hasChildren(parent)) {
      nodesToRemove.push({ node, index, parent })
    }
  })

  // Remove nodes in reverse order to avoid index issues
  for (let i = nodesToRemove.length - 1; i >= 0; i--) {
    const { index, parent } = nodesToRemove[i]
    parent.children.splice(index, 1)
  }

  return stringifyMarkdown(ast)
}
