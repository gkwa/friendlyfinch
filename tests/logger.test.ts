import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"
import { logger, LogLevel } from "../src/utils/logger.js"

describe("Logger", () => {
  beforeEach(() => {
    vi.spyOn(console, "error").mockImplementation(() => {})
    logger.setLevel(LogLevel.SILENT)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it("should not log anything when level is SILENT", () => {
    logger.setLevel(LogLevel.SILENT)

    logger.error("Error message")
    logger.warn("Warning message")
    logger.info("Info message")
    logger.debug("Debug message")
    logger.trace("Trace message")

    expect(console.error).not.toHaveBeenCalled()
  })

  it("should only log errors when level is ERROR", () => {
    logger.setLevel(LogLevel.ERROR)

    logger.error("Error message")
    logger.warn("Warning message")
    logger.info("Info message")

    expect(console.error).toHaveBeenCalledTimes(1)
    expect(console.error).toHaveBeenCalledWith(expect.stringContaining("Error message"))
  })

  it("should log errors and warnings when level is WARN", () => {
    logger.setLevel(LogLevel.WARN)

    logger.error("Error message")
    logger.warn("Warning message")
    logger.info("Info message")

    expect(console.error).toHaveBeenCalledTimes(2)
    expect(console.error).toHaveBeenCalledWith(expect.stringContaining("Error message"))
    expect(console.error).toHaveBeenCalledWith(expect.stringContaining("Warning message"))
  })

  it("should increment log level", () => {
    logger.setLevel(LogLevel.ERROR)
    logger.incrementLevel()

    logger.warn("Warning message")

    expect(console.error).toHaveBeenCalledWith(expect.stringContaining("Warning message"))
  })

  it("should not increment beyond TRACE", () => {
    logger.setLevel(LogLevel.TRACE)
    logger.incrementLevel()

    // Should still be at TRACE level
    expect(console.error).toHaveBeenCalledTimes(0)
  })
})
