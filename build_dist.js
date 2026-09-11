/**
 * Production Build & Packager Script for AI Translator
 * Copies clean production files to dist/extension and creates dist/AI-Translator-v1.0.0.zip
 */

const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");
const crypto = require("crypto");

const ROOT_DIR = path.resolve(__dirname);
const DIST_DIR = path.join(ROOT_DIR, "dist");
const EXT_DIR = path.join(DIST_DIR, "extension");

console.log("=========================================");
console.log("  Building AI Translator Distribution    ");
console.log("=========================================");

// 1. Clean previous dist
if (fs.existsSync(DIST_DIR)) {
  fs.rmSync(DIST_DIR, { recursive: true, force: true });
}
fs.mkdirSync(EXT_DIR, { recursive: true });

// 2. Ensure icons are generated
const iconsDir = path.join(ROOT_DIR, "icons");
if (!fs.existsSync(iconsDir) || fs.readdirSync(iconsDir).length < 4) {
  console.log("Generating icons...");
  require("./scripts/generate_icons.js");
}

// 3. List of production files and directories to include
const FILES_TO_COPY = [
  "manifest.json",
  "popup.html",
  "popup.js",
  "content.js",
  "background.js",
  "config.js",
  "i18n.js",
  "README.md",
  "README.ru.md",
  "LICENSE"
];

const DIRS_TO_COPY = [
  "_locales",
  "icons"
];

function copyDirRecursive(src, dest) {
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }
  const entries = fs.readdirSync(src, { withFileTypes: true });
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDirRecursive(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

// Copy individual files
for (const file of FILES_TO_COPY) {
  const src = path.join(ROOT_DIR, file);
  const dest = path.join(EXT_DIR, file);
  if (fs.existsSync(src)) {
    fs.copyFileSync(src, dest);
    console.log(`[+] Copied file: ${file}`);
  } else {
    console.warn(`[!] Warning: Missing file: ${file}`);
  }
}

// Copy directories
for (const dir of DIRS_TO_COPY) {
  const src = path.join(ROOT_DIR, dir);
  const dest = path.join(EXT_DIR, dir);
  if (fs.existsSync(src)) {
    copyDirRecursive(src, dest);
    console.log(`[+] Copied directory: ${dir}/`);
  } else {
    console.warn(`[!] Warning: Missing directory: ${dir}/`);
  }
}

// 4. Validate manifest in dist
const manifestPath = path.join(EXT_DIR, "manifest.json");
const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
console.log(`[✓] Validated manifest.json (v${manifest.version}, Manifest V${manifest.manifest_version})`);

// 5. Create ZIP package using PowerShell Compress-Archive
const zipFileName = `AI-Translator-v${manifest.version}.zip`;
const zipPath = path.join(DIST_DIR, zipFileName);

try {
  const psCmd = `powershell -NoProfile -Command "Compress-Archive -Path '${EXT_DIR}\\*' -DestinationPath '${zipPath}' -Force"`;
  execSync(psCmd, { stdio: "inherit" });
  
  const stats = fs.statSync(zipPath);
  const fileBuf = fs.readFileSync(zipPath);
  const sha256 = crypto.createHash("sha256").update(fileBuf).digest("hex");

  console.log("-----------------------------------------");
  console.log(`[✓] ZIP Package Created: dist/${zipFileName}`);
  console.log(`[✓] Size: ${(stats.size / 1024).toFixed(1)} KB`);
  console.log(`[✓] SHA256: ${sha256}`);
  console.log("-----------------------------------------");
} catch (e) {
  console.error("[!] Could not create ZIP archive automatically:", e.message);
}

console.log(`Ready for installation in: ${EXT_DIR}`);
