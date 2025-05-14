import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"
import { promises as fs } from "node:fs"
import {
  readMarkdownFile,
  writeMarkdownFile,
  createNodeInFile,
  readNodesFromFile,
  updateNodesInFile,
  deleteNodesFromFile,
} from "../src/core/file-operations.js"

// Mock the fs module
vi.mock("node:fs", () => ({
  promises: {
    readFile: vi.fn(),
    writeFile: vi.fn(),
  },
}))

describe("File Operations", () => {
  const testFilePath = "test.md"
  const testContent = `# Test File\n\nThis is a test file.`

  beforeEach(() => {
    // Setup the mock implementation
    vi.mocked(fs.readFile).mockResolvedValue(testContent)
    vi.mocked(fs.writeFile).mockResolvedValue()
  })

  afterEach(() => {
    vi.resetAllMocks()
  })

  describe("readMarkdownFile", () => {
    it("should read a markdown file", async () => {
      const content = await readMarkdownFile(testFilePath)

      expect(content).toBe(testContent)
      expect(fs.readFile).toHaveBeenCalledWith(testFilePath, "utf-8")
    })

    it("should throw an error if reading fails", async () => {
      vi.mocked(fs.readFile).mockRejectedValue(new Error("Read error"))

      await expect(readMarkdownFile(testFilePath)).rejects.toThrow("Failed to read file test.md")
    })
  })

  describe("writeMarkdownFile", () => {
    it("should write to a markdown file", async () => {
      await writeMarkdownFile(testFilePath, testContent)

      expect(fs.writeFile).toHaveBeenCalledWith(testFilePath, testContent, "utf-8")
    })

    it("should throw an error if writing fails", async () => {
      vi.mocked(fs.writeFile).mockRejectedValue(new Error("Write error"))

      await expect(writeMarkdownFile(testFilePath, testContent)).rejects.toThrow(
        "Failed to write to file test.md",
      )
    })
  })

  describe("createNodeInFile", () => {
    it("should create a node in a file", async () => {
      await createNodeInFile(testFilePath, {
        type: "heading",
        content: "New Section",
        level: 2,
      })

      expect(fs.readFile).toHaveBeenCalledWith(testFilePath, "utf-8")
      expect(fs.writeFile).toHaveBeenCalled()
      expect(vi.mocked(fs.writeFile).mock.calls[0][0]).toBe(testFilePath)
      expect(vi.mocked(fs.writeFile).mock.calls[0][1]).toContain("New Section")
    })
  })

  describe("readNodesFromFile", () => {
    it("should read nodes from a file", async () => {
      const nodes = await readNodesFromFile(testFilePath, { type: "heading" })

      expect(fs.readFile).toHaveBeenCalledWith(testFilePath, "utf-8")
      expect(nodes).toHaveLength(1)
      expect(nodes[0].type).toBe("heading")
    })
  })

  describe("updateNodesInFile", () => {
    it("should update nodes in a file", async () => {
      await updateNodesInFile(testFilePath, { type: "heading" }, { content: "Updated Title" })

      expect(fs.readFile).toHaveBeenCalledWith(testFilePath, "utf-8")
      expect(fs.writeFile).toHaveBeenCalled()
      expect(vi.mocked(fs.writeFile).mock.calls[0][0]).toBe(testFilePath)
      expect(vi.mocked(fs.writeFile).mock.calls[0][1]).toContain("Updated Title")
    })
  })

  describe("deleteNodesFromFile", () => {
    it("should delete nodes from a file", async () => {
      await deleteNodesFromFile(testFilePath, { type: "paragraph" })

      expect(fs.readFile).toHaveBeenCalledWith(testFilePath, "utf-8")
      expect(fs.writeFile).toHaveBeenCalled()
      expect(vi.mocked(fs.writeFile).mock.calls[0][0]).toBe(testFilePath)
      expect(vi.mocked(fs.writeFile).mock.calls[0][1]).not.toContain("This is a test file.")
    })
  })
})
