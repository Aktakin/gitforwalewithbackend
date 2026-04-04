/**
 * Builds docs/SkillBridge-Deployment-Guide.html from SKILLBRIDGE_DEPLOYMENT_GUIDE.md
 * Open the HTML in a browser → Print → Save as PDF.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { marked } from 'marked';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const mdPath = path.join(root, 'docs', 'SKILLBRIDGE_DEPLOYMENT_GUIDE.md');
const outPath = path.join(root, 'docs', 'SkillBridge-Deployment-Guide.html');

const md = fs.readFileSync(mdPath, 'utf8');
const body = marked.parse(md);

const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1"/>
<title>SkillBridge — Deployment Guide</title>
<style>
  body { font-family: Georgia, 'Times New Roman', serif; max-width: 720px; margin: 24px auto; padding: 0 16px 48px; line-height: 1.55; color: #111; }
  h1 { font-size: 1.75rem; border-bottom: 2px solid #1E90FF; padding-bottom: 0.25em; }
  h2 { font-size: 1.35rem; margin-top: 1.75em; page-break-after: avoid; }
  h3 { font-size: 1.1rem; }
  table { border-collapse: collapse; width: 100%; margin: 1em 0; font-size: 0.9rem; }
  th, td { border: 1px solid #ccc; padding: 8px 10px; text-align: left; vertical-align: top; }
  th { background: #f4f4f4; }
  code { background: #f0f0f0; padding: 0.1em 0.35em; font-size: 0.9em; }
  pre { background: #f5f5f5; padding: 12px; overflow-x: auto; font-size: 0.85rem; }
  pre code { background: none; padding: 0; }
  ul, ol { padding-left: 1.35em; }
  a { color: #0066cc; word-break: break-all; }
  hr { border: none; border-top: 1px solid #ddd; margin: 2em 0; }
  @media print {
    body { margin: 12mm 15mm; max-width: none; }
    h1, h2, h3 { page-break-after: avoid; }
    tr { page-break-inside: avoid; }
  }
</style>
</head>
<body>
${body}
<hr/>
<p style="font-size:0.95rem;color:#333"><strong>Create a PDF:</strong> Press <kbd>Ctrl+P</kbd> (Windows) or <kbd>Cmd+P</kbd> (Mac) → choose <em>Save as PDF</em> or <em>Microsoft Print to PDF</em> → Save.</p>
</body>
</html>`;

fs.writeFileSync(outPath, html, 'utf8');
console.log('Wrote', outPath);
console.log('Open in browser, then Print → Save as PDF.');
