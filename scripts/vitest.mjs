// Runs Vitest with Windows drive letters uppercased.
//
// On Windows, a lowercase drive letter (VS Code's terminal often opens as
// `c:\...`, and npm copies it into INIT_CWD and friends) makes Vitest's workers
// load the test runner twice, and every suite fails with
// "Cannot read properties of undefined (reading 'config')".
// Elsewhere this just runs Vitest. Arguments are passed through.
import { spawnSync } from "node:child_process";
import { join } from "node:path";

const upperDrive = (value) =>
  value.replace(/^[a-z]:[\\/]/, (drive) => drive.toUpperCase());

const cwd = upperDrive(process.cwd());
const env = Object.fromEntries(
  Object.entries(process.env).map(([key, value]) => [key, upperDrive(value)]),
);

const result = spawnSync(
  process.execPath,
  [join(cwd, "node_modules", "vitest", "vitest.mjs"), ...process.argv.slice(2)],
  { cwd, env, stdio: "inherit" },
);
process.exit(result.status ?? 1);
