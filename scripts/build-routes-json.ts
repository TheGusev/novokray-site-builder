// Собирает список всех маршрутов и пишет в src/generated/routes.json,
// чтобы vite.config (обычный Node без alias @) мог импортировать без пересборки.
import { mkdirSync, writeFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { getAllPaths } from "../src/lib/all-routes";

const __dirname = dirname(fileURLToPath(import.meta.url));
const outDir = resolve(__dirname, "../src/generated");
mkdirSync(outDir, { recursive: true });
const paths = getAllPaths();
writeFileSync(resolve(outDir, "routes.json"), JSON.stringify({ paths }, null, 2), "utf8");
console.log(`[build-routes-json] записано ${paths.length} маршрутов → src/generated/routes.json`);