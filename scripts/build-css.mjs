// Minifies styles.css (the readable source) into styles.min.css (what the
// pages load). Run `npm run build:css` after editing styles.css, then bump
// ?v= in index.html, 404.html and admin/*.html: CSS/JS are cached for a year.
import { readFileSync, writeFileSync } from "node:fs";
import { transform } from "lightningcss";

const root = new URL("../", import.meta.url);
const { code } = transform({
  filename: "styles.css",
  code: readFileSync(new URL("styles.css", root)),
  minify: true,
  targets: { safari: 15 << 16, chrome: 100 << 16, firefox: 100 << 16 },
});
writeFileSync(new URL("styles.min.css", root), code);
console.log(`styles.min.css: ${code.length} bytes`);
