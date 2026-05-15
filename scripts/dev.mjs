import { spawn } from "node:child_process";

const isWindows = process.platform === "win32";
const bin = isWindows ? ".cmd" : "";

const processes = [
  {
    name: "api",
    color: "\x1b[36m",
    command: isWindows ? ".\\node_modules\\.bin\\nest.cmd" : "./node_modules/.bin/nest",
    args: ["start", "--watch"],
    cwd: "apps/api",
  },
  {
    name: "web",
    color: "\x1b[32m",
    command: isWindows ? ".\\node_modules\\.bin\\next.cmd" : "./node_modules/.bin/next",
    args: ["dev", "--port", "3000"],
    cwd: "apps/web",
  },
];

const reset = "\x1b[0m";
const children = [];

function prefixOutput(name, color, chunk) {
  const text = chunk.toString();
  for (const line of text.split(/\r?\n/)) {
    if (line.length > 0) {
      process.stdout.write(`${color}[${name}]${reset} ${line}\n`);
    }
  }
}

for (const entry of processes) {
  const child = spawn(entry.command, entry.args, {
    cwd: entry.cwd,
    env: process.env,
    shell: isWindows,
    stdio: ["inherit", "pipe", "pipe"],
  });

  children.push(child);
  child.stdout.on("data", (chunk) => prefixOutput(entry.name, entry.color, chunk));
  child.stderr.on("data", (chunk) => prefixOutput(entry.name, entry.color, chunk));
  child.on("exit", (code) => {
    if (code !== 0) {
      process.stderr.write(`${entry.name} exited with code ${code}\n`);
      shutdown(code ?? 1);
    }
  });
}

function shutdown(code = 0) {
  for (const child of children) {
    if (!child.killed) {
      child.kill();
    }
  }
  process.exit(code);
}

process.on("SIGINT", () => shutdown(0));
process.on("SIGTERM", () => shutdown(0));
