import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const out = path.join(__dirname, ".blog-posts.snapshot.json");
const tsPath = path.join(ROOT, "src/data/blogPosts.ts");

const mod = await import(pathToFileURL(tsPath).href);
fs.writeFileSync(out, JSON.stringify(mod.blogPosts, null, 2), "utf8");
console.log(`Wrote ${mod.blogPosts.length} posts → ${out}`);
