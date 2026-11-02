const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '../ab-express-assets');
const files = [];
function walk(dir) { for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
  const p = path.join(dir, e.name);
  if (e.isDirectory()) walk(p);
  else if (/\.(webp|png|aac|wav|mp3)$/i.test(e.name) && e.name !== 'flair.webp' && (!/reference|resference/.test(e.name) || /page-[56]-reference/.test(e.name))) files.push({ path: path.relative(root, p).replaceAll('\\', '/'), bytes: fs.statSync(p).size });
} }
walk(root);
fs.writeFileSync(path.join(__dirname, 'ab-express-assets.js'), 'window.ABAssets = ' + JSON.stringify(files, null, 2) + ';\n');
console.log(`AB Express: ${files.length} assets`);
