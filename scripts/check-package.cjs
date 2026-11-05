const assert = require("assert");
const fs = require("fs");
const path = require("path");
const asar = require("@electron/asar");
const pkg = require("../package.json");
const [platform, arch] = process.argv.slice(2);
const root = path.resolve(__dirname, "../dist_electron");
let directory, executable, resources;

if (platform === "win") {
    assert(["x64", "ia32", "arm64"].includes(arch));
    directory = arch === "x64" ? "win-unpacked" : `win-${arch}-unpacked`;
    executable = path.join(root, directory, "Translate Desktop.exe");
    resources = path.join(root, directory, "resources");
    const binary = fs.readFileSync(executable);
    assert.strictEqual(binary.toString("ascii", 0, 2), "MZ");
    const offset = binary.readUInt32LE(0x3c);
    assert.strictEqual(binary.readUInt32LE(offset), 0x4550);
    assert.strictEqual(binary.readUInt16LE(offset + 4), { x64: 0x8664, ia32: 0x14c, arm64: 0xaa64 }[arch]);
} else if (platform === "mac") {
    assert(["x64", "arm64"].includes(arch));
    directory = arch === "x64" ? "mac" : "mac-arm64";
    const contents = path.join(root, directory, "Translate Desktop.app/Contents");
    executable = path.join(contents, "MacOS/Translate Desktop");
    resources = path.join(contents, "Resources");
    const binary = fs.readFileSync(executable);
    assert.strictEqual(binary.readUInt32LE(0), 0xfeedfacf);
    assert.strictEqual(binary.readUInt32LE(4), { x64: 0x1000007, arm64: 0x100000c }[arch]);
} else {
    assert.strictEqual(platform, "linux");
    assert(["x64", "arm64"].includes(arch));
    directory = arch === "x64" ? "linux-unpacked" : "linux-arm64-unpacked";
    executable = path.join(root, directory, "translate-desktop");
    resources = path.join(root, directory, "resources");
    const binary = fs.readFileSync(executable);
    assert.strictEqual(binary.subarray(0, 4).toString("hex"), "7f454c46");
    assert.strictEqual(binary[4], 2);
    assert.strictEqual(binary.readUInt16LE(18), { x64: 62, arm64: 183 }[arch]);
}

const archive = path.join(resources, "app.asar");
assert(asar.extractFile(archive, "background.js").equals(fs.readFileSync(path.join(root, "bundled/background.js"))));
const manifest = JSON.parse(asar.extractFile(archive, "package.json"));
assert.strictEqual(manifest.version, pkg.version);
const files = asar.listPackage(archive).map(file => file.replaceAll(String.fromCharCode(92), "/"));
assert(files.includes("/index.html"));
assert(!files.some(file => file.startsWith("/node_modules/")));
console.log(`Verified ${pkg.version}: ${platform}-${arch}, executable architecture and bundled application`);
