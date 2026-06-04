import { execSync } from "child_process"
import fs from "fs"
import path from "path"
import { fileURLToPath } from "url"
import { createRequire } from "module"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(__dirname, "..")
const require = createRequire(import.meta.url)

try {
  execSync("prisma generate", { cwd: root, stdio: "inherit" })
} catch {
  // may fail if no database configured yet
}

const target = path.join(root, "node_modules", ".prisma")
if (fs.existsSync(target)) process.exit(0)

try {
  const pkgPath = require.resolve("@prisma/client/package.json")
  const genDir = path.resolve(path.dirname(pkgPath), "..", ".prisma")
  if (fs.existsSync(genDir)) {
    const rel = path.relative(path.dirname(target), genDir)
    fs.symlinkSync(rel, target, "dir")
  }
} catch {
  // symlink is optional
}
