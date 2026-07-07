import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { cleanMarkdownText, DATA_PATH } from '../src/utils/markdown-parse.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const source = process.argv[2] || path.join(process.env.USERPROFILE || '', 'Downloads', "Lucy's Travelogue.md");
const dest = DATA_PATH;

if (!fs.existsSync(source)) {
    console.error(`Source file not found: ${source}`);
    process.exit(1);
}

const raw = fs.readFileSync(source, 'utf8');
const cleaned = cleanMarkdownText(raw);
fs.mkdirSync(path.dirname(dest), { recursive: true });
fs.writeFileSync(dest, cleaned, 'utf8');
console.log(`Cleaned markdown written to ${dest}`);
