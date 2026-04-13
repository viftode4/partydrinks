/* eslint-disable @typescript-eslint/no-require-imports */
const { rmSync } = require("node:fs")
const { spawnSync } = require("node:child_process")

const isWindows = process.platform === "win32"

function run(command, args) {
  const result = spawnSync(command, args, {
    stdio: "inherit",
    shell: false,
  })

  if (result.status !== 0) {
    process.exit(result.status ?? 1)
  }
}

rmSync("tsconfig.tsbuildinfo", { force: true })

run(isWindows ? "npx.cmd" : "npx", ["next", "typegen"])
rmSync("tsconfig.tsbuildinfo", { force: true })
run(isWindows ? "npx.cmd" : "npx", ["tsc", "--noEmit"])
