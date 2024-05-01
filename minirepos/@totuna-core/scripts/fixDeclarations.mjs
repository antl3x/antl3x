import fs from "fs";
import path from "path";

export function replaceExtensionInImports(directoryPath) {
  fs.readdir(directoryPath, { withFileTypes: true }, (err, dirents) => {
    if (err) {
      console.error("Failed to read directory:", err);
      return;
    }

    dirents.forEach((dirent) => {
      const fullPath = path.join(directoryPath, dirent.name);
      if (dirent.isDirectory()) {
        replaceExtensionInImports(fullPath); // Recursively handle subdirectories
      } else if (dirent.name.endsWith(".d.ts")) {
        const content = fs.readFileSync(fullPath, "utf8");
        const modifiedContent = content.replace(/(from\s+['"])(.*?)(\.js)(['"];)/g, "$1$2.d.ts$4");
        fs.writeFileSync(fullPath, modifiedContent);
      }
    });
  });
}
