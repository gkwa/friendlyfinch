import process from "node:process"
import pc from "picocolors"

export enum LogLevel {
  SILENT = 0,
  ERROR = 1,
  WARN = 2,
  INFO = 3,
  DEBUG = 4,
  TRACE = 5,
}

class Logger {
  private level: LogLevel = LogLevel.SILENT

  setLevel(level: LogLevel): void {
    this.level = level
  }

  incrementLevel(): void {
    if (this.level < LogLevel.TRACE) {
      this.level++
    }
  }

  error(message: string): void {
    if (this.level >= LogLevel.ERROR) {
      console.error(pc.red(`[ERROR] ${message}`))
    }
  }

  warn(message: string): void {
    if (this.level >= LogLevel.WARN) {
      console.error(pc.yellow(`[WARN] ${message}`))
    }
  }

  info(message: string): void {
    if (this.level >= LogLevel.INFO) {
      console.error(pc.blue(`[INFO] ${message}`))
    }
  }

  debug(message: string): void {
    if (this.level >= LogLevel.DEBUG) {
      console.error(pc.gray(`[DEBUG] ${message}`))
    }
  }

  trace(message: string): void {
    if (this.level >= LogLevel.TRACE) {
      console.error(pc.gray(`[TRACE] ${message}`))
    }
  }
}

export const logger = new Logger()
