#!/usr/bin/env node

import { spawn } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(scriptDirectory, "..");
const isWindows = process.platform === "win32";
const nextArgs = ["dev", ...process.argv.slice(2)];
const restartDebounceMs = 500;

let nextProcess = null;
let isExiting = false;
let isRestarting = false;
let restartQueued = false;
let restartTimer = null;

function binPath(name) {
  return path.join(projectRoot, "node_modules", ".bin", `${name}${isWindows ? ".cmd" : ""}`);
}

function log(message) {
  console.log(`[dev] ${message}`);
}

function run(command, args) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      cwd: projectRoot,
      env: process.env,
      shell: isWindows,
      stdio: "inherit",
    });

    child.on("error", reject);
    child.on("exit", (code, signal) => {
      if (code === 0) {
        resolve();
        return;
      }

      reject(new Error(`${path.basename(command)} exited with ${signal ?? code}.`));
    });
  });
}

function generatePrismaClient() {
  log("Generating Prisma client...");
  return run(binPath("prisma"), ["generate"]);
}

function startNext() {
  log(`Starting Next.js: next ${nextArgs.join(" ")}`);

  nextProcess = spawn(binPath("next"), nextArgs, {
    cwd: projectRoot,
    env: process.env,
    shell: isWindows,
    stdio: "inherit",
  });

  nextProcess.on("error", (error) => {
    console.error("[dev] Failed to start Next.js:", error);
    if (!isRestarting && !isExiting) {
      process.exitCode = 1;
      void shutdown();
    }
  });

  nextProcess.on("exit", (code, signal) => {
    nextProcess = null;

    if (isRestarting || isExiting) {
      return;
    }

    console.error(`[dev] Next.js exited with ${signal ?? code}.`);
    process.exit(code ?? 1);
  });
}

function stopNext() {
  return new Promise((resolve) => {
    const child = nextProcess;
    if (!child?.pid) {
      resolve();
      return;
    }

    let resolved = false;
    const finish = () => {
      if (resolved) {
        return;
      }

      resolved = true;
      resolve();
    };

    child.once("exit", finish);

    if (isWindows) {
      const taskkill = spawn("taskkill", ["/pid", String(child.pid), "/t", "/f"], {
        stdio: "ignore",
      });
      taskkill.once("exit", finish);
      taskkill.once("error", finish);
      return;
    }

    child.kill("SIGTERM");
    setTimeout(() => {
      if (!child.killed) {
        child.kill("SIGKILL");
      }
      finish();
    }, 3000).unref();
  });
}

async function restartNext(source) {
  if (isExiting) {
    return;
  }

  if (isRestarting) {
    restartQueued = true;
    return;
  }

  isRestarting = true;

  do {
    restartQueued = false;
    log(`${source} changed. Regenerating Prisma client and restarting Next.js...`);

    await stopNext();

    try {
      await generatePrismaClient();
      startNext();
    } catch (error) {
      console.error("[dev] Restart failed:", error);
      process.exitCode = 1;
      await shutdown();
      return;
    }
  } while (restartQueued && !isExiting);

  isRestarting = false;
}

function scheduleRestart(source) {
  clearTimeout(restartTimer);
  restartTimer = setTimeout(() => {
    void restartNext(source);
  }, restartDebounceMs);
}

function watchPath(targetPath, options, sourceLabel) {
  if (!fs.existsSync(targetPath)) {
    return;
  }

  try {
    const watcher = fs.watch(targetPath, options, () => {
      scheduleRestart(sourceLabel);
    });
    watcher.on("error", (error) => {
      console.warn(`[dev] Failed to watch ${sourceLabel}:`, error.message);
    });
  } catch (error) {
    console.warn(`[dev] Failed to watch ${sourceLabel}:`, error.message);
  }
}

function watchPrismaInputs() {
  watchPath(path.join(projectRoot, "prisma", "schema.prisma"), {}, "prisma/schema.prisma");
  watchPath(
    path.join(projectRoot, "prisma", "migrations"),
    { recursive: isWindows || process.platform === "darwin" },
    "prisma/migrations",
  );
}

async function shutdown() {
  if (isExiting) {
    return;
  }

  isExiting = true;
  clearTimeout(restartTimer);
  await stopNext();
}

process.on("SIGINT", () => {
  void shutdown().then(() => process.exit(0));
});

process.on("SIGTERM", () => {
  void shutdown().then(() => process.exit(0));
});

async function main() {
  await generatePrismaClient();
  watchPrismaInputs();
  startNext();
}

main().catch((error) => {
  console.error("[dev] Startup failed:", error);
  process.exit(1);
});
