import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { transformSync } from "esbuild";

const projectRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
const sourcePath = join(projectRoot, "Chapter_experience_L_S.html");
const source = readFileSync(sourcePath, "utf8");
const babelBlock = source.match(/<script type="text\/babel">\s*([\s\S]*?)\s*<\/script>/)
  || source.match(/<script>\s*(const \{ useState, useEffect, useRef \} = React;[\s\S]*?ReactDOM\.createRoot[\s\S]*?)\s*<\/script>/);

if (!babelBlock) {
  throw new Error("Could not find the standalone chapter JSX block.");
}

const compiled = transformSync(babelBlock[1], {
  loader: "jsx",
  jsxFactory: "React.createElement",
  jsxFragment: "React.Fragment",
  target: "es2020",
  legalComments: "none",
}).code;

const chapterHtml = source
  .replace(/<script src="https:\/\/unpkg\.com\/react@18\/umd\/react\.production\.min\.js" crossorigin><\/script>/, '<script src="./vendor/react.production.min.js"></script>')
  .replace(/<script src="https:\/\/unpkg\.com\/react-dom@18\/umd\/react-dom\.production\.min\.js" crossorigin><\/script>/, '<script src="./vendor/react-dom.production.min.js"></script>')
  .replace(/\s*<script src="https:\/\/unpkg\.com\/@babel\/standalone@7\/babel\.min\.js"><\/script>/, "")
  .replace(/<script src="https:\/\/cdnjs\.cloudflare\.com\/ajax\/libs\/three\.js\/r128\/three\.min\.js"><\/script>/, '<script src="./vendor/three.min.js"></script>')
  .replace(/script\.src = "https:\/\/cdnjs\.cloudflare\.com\/ajax\/libs\/three\.js\/r128\/three\.min\.js";/, 'script.src = "./vendor/three.min.js";')
  .replace('<link rel="stylesheet" href="styles.css">', '<link rel="stylesheet" href="legacy-styles.css">')
  .replace(babelBlock[0], `<script>\n${compiled}\n  </script>`);

for (const outputPath of [
  join(projectRoot, "Chapter_experience_L_S.html"),
  join(projectRoot, "public", "Chapter_experience_L_S.html"),
]) {
  writeFileSync(outputPath, chapterHtml);
}

console.log("Synced standalone Chapter_experience_L_S.html without runtime Babel dependency.");
