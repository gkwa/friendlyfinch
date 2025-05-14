import { describe, expect, it, beforeAll } from "vitest"
import { promises as fs } from "node:fs"
import { createNode, readNodes, updateNodes, deleteNodes } from "../src/core/crud.js"

describe("CRUD operations", () => {
  let sampleMarkdown: string
  let expectedUpdatedHeadingContent: string
  let expectedUpdatedHeadingLevel: string
  let expectedDeletedParagraphs: string
  let expectedDeletedLevel2Headings: string
  let expectedCreatedHeading: string
  let expectedCreatedParagraph: string
  let expectedCreatedCode: string

  // Load all test fixtures before running tests
  beforeAll(async () => {
    sampleMarkdown = await fs.readFile("test-fixtures/sample.md", "utf-8")
    expectedUpdatedHeadingContent = await fs.readFile(
      "test-fixtures/expected/updated-heading-content.md",
      "utf-8",
    )
    expectedUpdatedHeadingLevel = await fs.readFile(
      "test-fixtures/expected/updated-heading-level.md",
      "utf-8",
    )
    expectedDeletedParagraphs = await fs.readFile(
      "test-fixtures/expected/deleted-paragraphs.md",
      "utf-8",
    )
    expectedDeletedLevel2Headings = await fs.readFile(
      "test-fixtures/expected/deleted-level2-headings.md",
      "utf-8",
    )
    expectedCreatedHeading = await fs.readFile("test-fixtures/expected/created-heading.md", "utf-8")
    expectedCreatedParagraph = await fs.readFile(
      "test-fixtures/expected/created-paragraph.md",
      "utf-8",
    )
    expectedCreatedCode = await fs.readFile("test-fixtures/expected/created-code.md", "utf-8")
  })

  // Helper function to normalize whitespace for comparison
  function normalizeWhitespace(text: string): string {
    return text.replace(/\r\n/g, "\n").trim()
  }

  describe("createNode", () => {
    it("should create a heading node", () => {
      const result = createNode(sampleMarkdown, {
        type: "heading",
        content: "New Section",
        level: 3,
      })

      expect(normalizeWhitespace(result)).toBe(normalizeWhitespace(expectedCreatedHeading))
    })

    it("should create a paragraph node", () => {
      const result = createNode(sampleMarkdown, {
        type: "paragraph",
        content: "This is a new paragraph.",
      })

      expect(normalizeWhitespace(result)).toBe(normalizeWhitespace(expectedCreatedParagraph))
    })

    it("should create a code block", () => {
      const result = createNode(sampleMarkdown, {
        type: "code",
        content: 'console.log("Hello");',
        lang: "js",
      })

      expect(normalizeWhitespace(result)).toBe(normalizeWhitespace(expectedCreatedCode))
    })
  })

  describe("readNodes", () => {
    it("should read all heading nodes", () => {
      const nodes = readNodes(sampleMarkdown, { type: "heading" })

      expect(nodes).toHaveLength(3)
      expect(nodes[0]).toHaveProperty("depth", 1)
      expect(nodes[1]).toHaveProperty("depth", 2)
      expect(nodes[2]).toHaveProperty("depth", 2)
    })

    it("should read nodes with specific properties", () => {
      const nodes = readNodes(sampleMarkdown, { type: "heading", depth: 2 })

      expect(nodes).toHaveLength(2)

      // Type guard to safely access properties
      nodes.forEach((node) => {
        if (
          node.type === "heading" &&
          node.children &&
          node.children[0] &&
          node.children[0].type === "text"
        ) {
          expect(["Section 1", "Section 2"]).toContain(node.children[0].value)
        }
      })
    })
  })

  describe("updateNodes", () => {
    it("should update heading content", () => {
      const result = updateNodes(
        sampleMarkdown,
        { type: "heading", depth: 2 },
        { content: "Updated Section" },
      )

      expect(normalizeWhitespace(result)).toBe(normalizeWhitespace(expectedUpdatedHeadingContent))
    })

    it("should update heading level", () => {
      const result = updateNodes(sampleMarkdown, { type: "heading", depth: 2 }, { level: 3 })

      expect(normalizeWhitespace(result)).toBe(normalizeWhitespace(expectedUpdatedHeadingLevel))
    })
  })

  describe("deleteNodes", () => {
    it("should delete heading nodes", () => {
      const result = deleteNodes(sampleMarkdown, { type: "heading", depth: 2 })

      expect(normalizeWhitespace(result)).toBe(normalizeWhitespace(expectedDeletedLevel2Headings))
    })

    it("should delete paragraph nodes", () => {
      const result = deleteNodes(sampleMarkdown, { type: "paragraph" })

      expect(normalizeWhitespace(result)).toBe(normalizeWhitespace(expectedDeletedParagraphs))
    })
  })
})
