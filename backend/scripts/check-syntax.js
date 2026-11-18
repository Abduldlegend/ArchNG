import { readdirSync } from "node:fs";
import { extname, join } from "node:path";
import { spawnSync } from "node:child_process";

const roots = ["src", "prisma", "scripts", "tests"];
const files = [];

const walk = (directory) => {
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const full = join(directory, entry.name);
    if (entry.isDirectory()) walk(full);
    else if ([".js", ".mjs"].includes(extname(entry.name))) files.push(full);
  }
};

for (const root of roots) {
  try {
    walk(root);
  } catch {
    // Optional directory.
  }
}

let failed = false;
for (const file of files) {
  const result = spawnSync(process.execPath, ["--check", file], { stdio: "pipe", encoding: "utf8" });
  if (result.status !== 0) {
    failed = true;
    console.error(`Syntax error in ${file}\n${result.stderr}`);
  }
}

if (failed) process.exit(1);
console.log(`Syntax OK (${files.length} files).`);
