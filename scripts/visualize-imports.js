#!/usr/bin/env node
/**
 * Scans src/javascript, builds the JS/TS import graph, renders it with fdp,
 * and produces a self-contained interactive HTML file.
 *
 * Usage:
 *   node scripts/visualize-imports.js [output.html]
 *
 * Output defaults to graphs/imports.html
 * Requires graphviz to be installed: brew install graphviz
 */

'use strict';

const fs           = require('fs');
const path         = require('path');
const os           = require('os');
const {execFileSync} = require('child_process');

const ROOT       = path.resolve(__dirname, '../src/javascript');
const EXTENSIONS = ['.js', '.jsx', '.ts', '.tsx'];
const OUT_HTML   = path.resolve(__dirname, '..', process.argv[2] || 'graphs/imports.html');

// ── 1. Collect all source files ───────────────────────────────────────────────

function walk(dir, results = []) {
    for (const entry of fs.readdirSync(dir, {withFileTypes: true})) {
        const full = path.join(dir, entry.name);
        if (entry.isDirectory()) {
            if (entry.name === '__mocks__' || entry.name === 'node_modules') continue;
            walk(full, results);
        } else if (EXTENSIONS.includes(path.extname(entry.name))) {
            results.push(full);
        }
    }
    return results;
}

const allFiles = new Set(walk(ROOT));
console.error(`[1/4] Found ${allFiles.size} source files`);

// ── 2. Resolve import specifiers to absolute paths ────────────────────────────

function tryExtensions(base) {
    if (fs.existsSync(base) && fs.statSync(base).isFile()) return base;
    for (const ext of EXTENSIONS) {
        const c = base + ext;
        if (fs.existsSync(c)) return c;
    }
    for (const ext of EXTENSIONS) {
        const c = path.join(base, 'index' + ext);
        if (fs.existsSync(c)) return c;
    }
    return null;
}

function resolveImport(fromFile, specifier) {
    if (!specifier.startsWith('.') && !specifier.startsWith('~')) return null;
    const base = specifier.startsWith('~')
        ? path.join(ROOT, specifier.slice(1))
        : path.resolve(path.dirname(fromFile), specifier);
    const resolved = tryExtensions(base);
    return resolved && allFiles.has(resolved) ? resolved : null;
}

// ── 3. Extract imports ────────────────────────────────────────────────────────

const IMPORT_RE = /(?:import\s+(?:.+?\s+from\s+)?|require\s*\()\s*['"]([^'"]+)['"]/g;

function extractImports(filePath) {
    const src  = fs.readFileSync(filePath, 'utf8');
    const deps = new Set();
    let m;
    IMPORT_RE.lastIndex = 0;
    while ((m = IMPORT_RE.exec(src)) !== null) {
        const resolved = resolveImport(filePath, m[1]);
        if (resolved) deps.add(resolved);
    }
    return deps;
}

// ── 4. Build DOT source ───────────────────────────────────────────────────────

const TOP_LEVEL_COLORS = {
    'ContentEditor': ['#c6dcf5', '#d8eaf7', '#eaf4fb'],
    'JContent':      ['#c6f5d0', '#d8f7e0', '#eafbee'],
    'icons':         ['#f5f0c6', '#f7f3d8', '#fbf9ea'],
    'shared':        ['#f5c6e8', '#f7d8ef', '#fbeaf7'],
    'UsagesTable':   ['#f5d6c6', '#f7e3d8', '#fbefea'],
    'utils':         ['#e0c6f5', '#ebd8f7', '#f4eafb'],
};
const DEFAULT_COLORS = ['#e8e8e8', '#f0f0f0', '#f8f8f8'];

const rel    = p  => path.relative(ROOT, p);
const nodeId = p  => 'n_' + rel(p).replace(/[^a-zA-Z0-9]/g, '_');

function buildDirTree(files) {
    const tree = {__files: []};
    for (const f of files) {
        const parts = rel(f).split(path.sep);
        let node = tree;
        for (let i = 0; i < parts.length - 1; i++) {
            if (!node[parts[i]]) node[parts[i]] = {__files: []};
            node = node[parts[i]];
        }
        node.__files.push(f);
    }
    return tree;
}

let sgIndex = 0;
function emitSubgraph(node, dirName, indent, topLevelName, depth) {
    const pad     = ' '.repeat(indent);
    const id      = `cluster_${sgIndex++}`;
    const palette = TOP_LEVEL_COLORS[topLevelName] || DEFAULT_COLORS;
    const fill    = palette[Math.min(depth, palette.length - 1)];
    const lines   = [];

    lines.push(`${pad}subgraph ${id} {`);
    lines.push(`${pad}  label="${dirName}";`);
    lines.push(`${pad}  style="rounded,filled";`);
    lines.push(`${pad}  fillcolor="${fill}";`);
    if (depth === 0) {
        lines.push(`${pad}  penwidth=2; fontname="Helvetica-Bold"; fontsize=13;`);
    } else {
        lines.push(`${pad}  penwidth=1; fontsize=11;`);
    }
    for (const f of node.__files) {
        lines.push(`${pad}  ${nodeId(f)} [label="${path.basename(f)}", tooltip="${rel(f)}"];`);
    }
    for (const [key, child] of Object.entries(node)) {
        if (key !== '__files') lines.push(...emitSubgraph(child, key, indent + 2, topLevelName || key, depth + 1));
    }
    lines.push(`${pad}}`);
    return lines;
}

// Collect edges
const edges = [];
let edgeCount = 0;
for (const f of allFiles) {
    for (const dep of extractImports(f)) {
        edges.push(`  ${nodeId(dep)} -> ${nodeId(f)};`);
        edgeCount++;
    }
}
console.error(`[2/4] Built graph: ${allFiles.size} nodes, ${edgeCount} edges`);

const dirTree = buildDirTree([...allFiles].sort());

const dotLines = [
    'digraph imports {',
    '  rankdir=LR;',
    '  node [shape=box, fontsize=9, style="rounded,filled", fillcolor=white, margin="0.1,0.05"];',
    '  edge [color="#555555", arrowsize=0.6];',
    '  graph [fontsize=11, compound=true, pad=0.5, nodesep=0.15, ranksep=0.5];',
    '',
    '  subgraph cluster_root {',
    '    label="src/javascript";',
    '    style="rounded,filled";',
    '    fillcolor="#f5f5f5";',
    '    fontname="Helvetica-Bold"; fontsize=14; penwidth=2;',
];

for (const f of dirTree.__files) {
    dotLines.push(`    ${nodeId(f)} [label="${path.basename(f)}", tooltip="${rel(f)}"];`);
}
for (const [key, child] of Object.entries(dirTree)) {
    if (key !== '__files') dotLines.push(...emitSubgraph(child, key, 4, key, 0));
}

dotLines.push('  }', '', ...edges, '}');
const dotSource = dotLines.join('\n');

// ── 5. Render SVG via fdp ─────────────────────────────────────────────────────

console.error('[3/4] Running fdp (this may take 30-60s for large graphs)…');

// Write DOT to a temp file so we don't depend on shell stdin buffering
const tmpDot = path.join(os.tmpdir(), `imports-${Date.now()}.dot`);
fs.writeFileSync(tmpDot, dotSource, 'utf8');

let svgBuf;
try {
    svgBuf = execFileSync('fdp', [
        '-Tsvg',
        '-Goverlap=prism',
        '-Gsplines=curved',
        `-GK=0.8`,
        '-Gmaxiter=1000',
        '-Gpad=0.8',
        tmpDot,
    ], {maxBuffer: 64 * 1024 * 1024});
} catch (e) {
    fs.unlinkSync(tmpDot);
    console.error('fdp failed:', e.message);
    console.error('Make sure graphviz is installed: brew install graphviz');
    process.exit(1);
}
fs.unlinkSync(tmpDot);

let svg = svgBuf.toString('utf8');
console.error('[3/4] fdp render complete');

// ── 6. Build self-contained HTML ──────────────────────────────────────────────

// Parse natural pixel dimensions from viewBox (graphviz units are pt, 1pt = 96/72 px)
const vbMatch = svg.match(/viewBox="[\d.]+\s+[\d.]+\s+([\d.]+)\s+([\d.]+)"/);
const PT_TO_PX = 96 / 72;
const svgW = vbMatch ? Math.round(parseFloat(vbMatch[1]) * PT_TO_PX) : 2000;
const svgH = vbMatch ? Math.round(parseFloat(vbMatch[2]) * PT_TO_PX) : 2000;

// Strip fixed pt dimensions and set explicit pixel size
svg = svg.replace(/\bwidth="[\d.]+pt"\s*/g, '');
svg = svg.replace(/\bheight="[\d.]+pt"\s*/g, '');
svg = svg.replace(/<svg\b/, `<svg width="${svgW}" height="${svgH}" style="display:block;" `);

const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>Import graph — src/javascript</title>
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    html, body { width: 100%; height: 100%; overflow: hidden; background: #fff; font-family: sans-serif; }

    #toolbar {
      position: fixed; top: 8px; left: 50%; transform: translateX(-50%);
      display: flex; gap: 6px; z-index: 10;
    }
    #toolbar button {
      padding: 4px 12px; border: 1px solid #ccc; border-radius: 4px;
      background: #fff; cursor: pointer; font-size: 13px;
    }
    #toolbar button:hover { background: #f0f0f0; }
    #info {
      position: fixed; top: 8px; right: 12px; font-size: 11px; color: #888;
      z-index: 10; pointer-events: none;
    }
    #hint {
      position: fixed; bottom: 8px; left: 50%; transform: translateX(-50%);
      font-size: 11px; color: #888; pointer-events: none;
    }
    #viewport { width: 100%; height: 100%; overflow: hidden; cursor: grab; }
    #viewport.dragging { cursor: grabbing; }
    #scene { position: absolute; transform-origin: 0 0; }
    #scene svg { display: block; }
  </style>
</head>
<body>
  <div id="toolbar">
    <button id="btn-zoom-in">＋</button>
    <button id="btn-reset">⟳ Fit</button>
    <button id="btn-zoom-out">－</button>
  </div>
  <div id="info">${allFiles.size} files · ${edgeCount} imports</div>
  <div id="viewport">
    <div id="scene">
${svg}
    </div>
  </div>
  <div id="hint">Scroll to zoom · Drag to pan</div>

  <script>
    const viewport = document.getElementById('viewport');
    const scene    = document.getElementById('scene');
    let scale = 1, tx = 0, ty = 0;
    let dragging = false, startX = 0, startY = 0, startTx = 0, startTy = 0;

    function applyTransform() {
      scene.style.transform = \`translate(\${tx}px,\${ty}px) scale(\${scale})\`;
    }

    function fitToViewport() {
      const svg = scene.querySelector('svg');
      const vw  = viewport.clientWidth;
      const vh  = viewport.clientHeight;
      const nw  = parseFloat(svg.getAttribute('width'))  || vw;
      const nh  = parseFloat(svg.getAttribute('height')) || vh;
      scale = Math.min((vw - 32) / nw, (vh - 32) / nh);
      tx = (vw - nw * scale) / 2;
      ty = (vh - nh * scale) / 2;
      applyTransform();
    }

    window.addEventListener('load',   fitToViewport);
    window.addEventListener('resize', fitToViewport);

    function zoom(factor, cx, cy) {
      const next  = Math.min(Math.max(scale * factor, 0.02), 20);
      const ratio = next / scale;
      tx = cx - ratio * (cx - tx);
      ty = cy - ratio * (cy - ty);
      scale = next;
      applyTransform();
    }

    document.getElementById('btn-zoom-in') .addEventListener('click', () => zoom(1.25, viewport.clientWidth/2, viewport.clientHeight/2));
    document.getElementById('btn-zoom-out').addEventListener('click', () => zoom(0.8,  viewport.clientWidth/2, viewport.clientHeight/2));
    document.getElementById('btn-reset')   .addEventListener('click', fitToViewport);

    viewport.addEventListener('wheel', e => {
      e.preventDefault();
      const r = viewport.getBoundingClientRect();
      zoom(e.deltaY < 0 ? 1.12 : 1/1.12, e.clientX - r.left, e.clientY - r.top);
    }, {passive: false});

    viewport.addEventListener('mousedown', e => {
      if (e.button !== 0) return;
      dragging = true;
      startX = e.clientX; startY = e.clientY; startTx = tx; startTy = ty;
      viewport.classList.add('dragging');
    });
    window.addEventListener('mousemove', e => {
      if (!dragging) return;
      tx = startTx + (e.clientX - startX);
      ty = startTy + (e.clientY - startY);
      applyTransform();
    });
    window.addEventListener('mouseup', () => { dragging = false; viewport.classList.remove('dragging'); });

    let lastTouchDist = null;
    viewport.addEventListener('touchstart', e => {
      if (e.touches.length === 1) { dragging = true; startX = e.touches[0].clientX; startY = e.touches[0].clientY; startTx = tx; startTy = ty; }
      lastTouchDist = null;
    }, {passive: true});
    viewport.addEventListener('touchmove', e => {
      if (e.touches.length === 2) {
        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        const d  = Math.hypot(dx, dy);
        if (lastTouchDist !== null) {
          const r  = viewport.getBoundingClientRect();
          const mx = (e.touches[0].clientX + e.touches[1].clientX) / 2 - r.left;
          const my = (e.touches[0].clientY + e.touches[1].clientY) / 2 - r.top;
          zoom(d / lastTouchDist, mx, my);
        }
        lastTouchDist = d;
      } else if (e.touches.length === 1 && dragging) {
        tx = startTx + (e.touches[0].clientX - startX);
        ty = startTy + (e.touches[0].clientY - startY);
        applyTransform();
      }
    }, {passive: true});
    viewport.addEventListener('touchend', () => { dragging = false; lastTouchDist = null; }, {passive: true});
  </script>
</body>
</html>`;

// ── 7. Write output ───────────────────────────────────────────────────────────

fs.mkdirSync(path.dirname(OUT_HTML), {recursive: true});
fs.writeFileSync(OUT_HTML, html, 'utf8');
const kb = (fs.statSync(OUT_HTML).size / 1024).toFixed(0);
console.error(`[4/4] Written: ${OUT_HTML} (${kb} KB)`);
