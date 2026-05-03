const fs = require("fs");
const path = require("path");
const { spawn } = require("child_process");

const electronExe = path.join(
  __dirname,
  "node_modules",
  "electron",
  "dist",
  process.platform === "win32" ? "electron.exe" : "electron"
);

const electronCmdFallback = path.join(
  __dirname,
  "node_modules",
  ".bin",
  process.platform === "win32" ? "electron.cmd" : "electron"
);

const electronCmd = fs.existsSync(electronExe) ? electronExe : electronCmdFallback;

if (!fs.existsSync(electronCmd)) {
  console.log("Electron n'est pas encore installe.");
  console.log("Lancez : npm install --save-dev electron --no-audit --no-fund");
  console.log("Si le reseau coupe, relancez la meme commande.");
  process.exit(1);
}

const child = spawn(electronCmd, ["."], {
  cwd: __dirname,
  detached: true,
  stdio: "ignore",
  shell: false
});

child.unref();
console.log("EgliseManager est lance.");
