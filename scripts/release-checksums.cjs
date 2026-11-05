const assert = require("assert");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const { version } = require("../package.json");
const root = path.resolve(__dirname, "../release-assets");
const prefix = `Translate Desktop-${version}-`;
const expected = [
    ...["x64", "ia32", "arm64"].map(arch => `${prefix}win-${arch}-setup.exe`),
    ...["x64", "arm64"].flatMap(arch => ["dmg", "zip"].map(ext => `${prefix}mac-${arch}.${ext}`)),
    ...[["x86_64", "AppImage"], ["amd64", "deb"], ["arm64", "AppImage"], ["arm64", "deb"]].map(([arch, ext]) => `${prefix}linux-${arch}.${ext}`),
].sort();
assert.deepStrictEqual(fs.readdirSync(root).sort(), expected, "Release must contain all 11 platform packages");
const checksums = expected.map(name => {
    const file = path.join(root, name);
    assert(fs.statSync(file).size > 0, `Empty package: ${name}`);
    return `${crypto.createHash("sha256").update(fs.readFileSync(file)).digest("hex")}  ${name}`;
});
fs.writeFileSync(path.join(root, "SHA256SUMS.txt"), checksums.join("\n") + "\n");
console.log(`Verified ${expected.length} release packages; generated SHA256SUMS.txt`);
