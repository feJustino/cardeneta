import { PrismaClient } from "@prisma/client"
import fs from "fs"
import path from "path"

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

if (process.env.NODE_ENV !== "production") {
  const target = path.join(process.cwd(), "node_modules", ".prisma")
  if (!fs.existsSync(target)) {
    const pnpmDir = path.join(process.cwd(), "node_modules", ".pnpm")
    if (fs.existsSync(pnpmDir)) {
      const entries = fs.readdirSync(pnpmDir)
      const clientDir = entries.find((e) => e.startsWith("@prisma+client@"))
      if (clientDir) {
        const genDir = path.join(pnpmDir, clientDir, "node_modules", ".prisma")
        if (fs.existsSync(genDir)) {
          try {
            const rel = path.relative(path.dirname(target), genDir)
            fs.symlinkSync(rel, target, "dir")
          } catch {
            // symlink may fail
          }
        }
      }
    }
  }
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient()

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma
