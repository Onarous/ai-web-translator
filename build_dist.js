/**
 * Production Build & Packager Script for AI Web Translator
 * Creates:
 *  1. dist/extension/ (raw unpacked extension files)
 *  2. dist/ai-web-translator-v1.0.0.zip (extension + 1-click installer: install.bat, installer.ps1, uninstall.bat)
 *  3. dist/ai-web-translator-v1.0.0-extension-only.zip (unpacked extension archive only)
 */

const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");
const crypto = require("crypto");

const ROOT_DIR = path.resolve(__dirname);
const DIST_DIR = path.join(ROOT_DIR, "dist");
const EXT_DIR = path.join(DIST_DIR, "extension");
const PACKAGE_DIR = path.join(DIST_DIR, "ai-web-translator-installer-bundle");

console.log("=========================================");
console.log("  Building AI Web Translator Release     ");
console.log("=========================================");

// 1. Clean previous dist
if (fs.existsSync(DIST_DIR)) {
  fs.rmSync(DIST_DIR, { recursive: true, force: true });
}
fs.mkdirSync(EXT_DIR, { recursive: true });
fs.mkdirSync(PACKAGE_DIR, { recursive: true });

// 2. Ensure icons are generated
const iconsDir = path.join(ROOT_DIR, "icons");
if (!fs.existsSync(iconsDir) || fs.readdirSync(iconsDir).length < 4) {
  console.log("Generating icons...");
  require("./scripts/generate_icons.js");
}

// 3. List of production extension files
const EXT_FILES = [
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

const EXT_DIRS = [
  "_locales",
  "icons"
];

// Installer launcher files
const INSTALLER_FILES = [
  "install.bat",
  "installer.ps1",
  "uninstall.bat"
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

// Copy extension files to dist/extension and package dir
for (const file of EXT_FILES) {
  const src = path.join(ROOT_DIR, file);
  if (fs.existsSync(src)) {
    fs.copyFileSync(src, path.join(EXT_DIR, file));
    fs.copyFileSync(src, path.join(PACKAGE_DIR, file));
    console.log(`[+] Included extension file: ${file}`);
  } else {
    console.warn(`[!] Warning: Missing file: ${file}`);
  }
}

for (const dir of EXT_DIRS) {
  const src = path.join(ROOT_DIR, dir);
  if (fs.existsSync(src)) {
    copyDirRecursive(src, path.join(EXT_DIR, dir));
    copyDirRecursive(src, path.join(PACKAGE_DIR, dir));
    console.log(`[+] Included directory: ${dir}/`);
  } else {
    console.warn(`[!] Warning: Missing directory: ${dir}/`);
  }
}

// Copy installer files into package dir
for (const file of INSTALLER_FILES) {
  const src = path.join(ROOT_DIR, file);
  if (fs.existsSync(src)) {
    fs.copyFileSync(src, path.join(PACKAGE_DIR, file));
    console.log(`[+] Included installer file: ${file}`);
  } else {
    console.warn(`[!] Warning: Missing installer file: ${file}`);
  }
}

// Validate manifest
const manifestPath = path.join(EXT_DIR, "manifest.json");
const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
console.log(`[✓] Validated manifest.json (v${manifest.version}, Manifest V${manifest.manifest_version})`);

// 4. Create primary release ZIP: Extension + Windows Installer
const releaseZipName = `ai-web-translator-v${manifest.version}.zip`;
const releaseZipPath = path.join(DIST_DIR, releaseZipName);

try {
  const psCmd1 = `powershell -NoProfile -Command "Compress-Archive -Path '${PACKAGE_DIR}\\*' -DestinationPath '${releaseZipPath}' -Force"`;
  execSync(psCmd1, { stdio: "inherit" });
  
  const stats1 = fs.statSync(releaseZipPath);
  const sha1 = crypto.createHash("sha256").update(fs.readFileSync(releaseZipPath)).digest("hex");

  console.log("-----------------------------------------");
  console.log(`[✓] Release ZIP Created (Extension + Installer): dist/${releaseZipName}`);
  console.log(`[✓] Size: ${(stats1.size / 1024).toFixed(1)} KB`);
  console.log(`[✓] SHA256: ${sha1}`);
  console.log("-----------------------------------------");
} catch (e) {
  console.error("[!] Could not create release ZIP:", e.message);
}

// 5. Also create standalone extension-only ZIP
const extZipName = `ai-web-translator-v${manifest.version}-extension-only.zip`;
const extZipPath = path.join(DIST_DIR, extZipName);

try {
  const psCmd2 = `powershell -NoProfile -Command "Compress-Archive -Path '${EXT_DIR}\\*' -DestinationPath '${extZipPath}' -Force"`;
  execSync(psCmd2, { stdio: "inherit" });
  
  const stats2 = fs.statSync(extZipPath);
  const sha2 = crypto.createHash("sha256").update(fs.readFileSync(extZipPath)).digest("hex");

  console.log(`[✓] Standalone Extension ZIP Created: dist/${extZipName}`);
  console.log(`[✓] Size: ${(stats2.size / 1024).toFixed(1)} KB`);
  console.log(`[✓] SHA256: ${sha2}`);
  console.log("-----------------------------------------");
} catch (e) {
  console.error("[!] Could not create extension ZIP:", e.message);
}

// Clean up intermediate bundle folder
fs.rmSync(PACKAGE_DIR, { recursive: true, force: true });

console.log(`All packages ready in: ${DIST_DIR}`);
