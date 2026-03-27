#!/usr/bin/env node
/**
 * Generates a Graphviz DOT file visualizing JS/TS import dependencies
 * in src/javascript, with nested subgraphs for the directory structure.
 *
 * Usage:
 *   node scripts/graph-imports.js > graph.dot
 *   dot -Tsvg graph.dot -o graph.svg
 *   # For large graphs try: sfdp -x -Goverlap=scale -Tsvg graph.dot -o graph.svg
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '../src/javascript');
const EXTENSIONS = ['.js', '.jsx', '.ts', '.tsx'];

// ── 1. Collect all source files ───────────────────────────────────────────────

function walk(dir, results = []) {
    for (const entry of fs.readdirSync(dir, {withFileTypes: true})) {
        const full = path.join(dir, entry.name);
        if (entry.isDirectory()) {
            // Skip mock / test helper dirs that aren't real source
            if (entry.name === '__mocks__' || entry.name === 'node_modules') continue;
            walk(full, results);
        } else if (EXTENSIONS.includes(path.extname(entry.name))) {
            results.push(full);
        }
    }
    return results;
}

const allFiles = new Set(walk(ROOT));

// ── 2. Resolve an import specifier to an absolute path ────────────────────────

function tryExtensions(base) {
    // Try exact path first
    if (fs.existsSync(base) && fs.statSync(base).isFile()) return base;
    // Try appending each extension
    for (const ext of EXTENSIONS) {
        const candidate = base + ext;
        if (fs.existsSync(candidate)) return candidate;
    }
    // Try as a directory with index file
    for (const ext of EXTENSIONS) {
        const candidate = path.join(base, 'index' + ext);
        if (fs.existsSync(candidate)) return candidate;
    }
    return null;
}

function resolveImport(fromFile, specifier) {
    // Ignore bare package imports
    if (!specifier.startsWith('.') && !specifier.startsWith('~')) return null;

    let base;
    if (specifier.startsWith('~')) {
        // ~ is aliased to src/javascript
        base = path.join(ROOT, specifier.slice(1)); // remove the '~'
    } else {
        base = path.resolve(path.dirname(fromFile), specifier);
    }

    const resolved = tryExtensions(base);
    if (resolved && allFiles.has(resolved)) return resolved;
    return null;
}

// ── 3. Extract imports from a file ───────────────────────────────────────────

const IMPORT_RE = /(?:import\s+(?:.+?\s+from\s+)?|require\s*\()\s*['"]([^'"]+)['"]/g;

function extractImports(filePath) {
    const src = fs.readFileSync(filePath, 'utf8');
    const deps = new Set();
    let m;
    IMPORT_RE.lastIndex = 0;
    while ((m = IMPORT_RE.exec(src)) !== null) {
        const resolved = resolveImport(filePath, m[1]);
        if (resolved) deps.add(resolved);
    }
    return deps;
}

// ── 4. Build the graph ───────────────────────────────────────────────────────

// Pastel color palette for top-level directories (fill, then progressively lighter for nesting)
const TOP_LEVEL_COLORS = {
    'ContentEditor': ['#c6dcf5', '#d8eaf7', '#eaf4fb'],
    'JContent':      ['#c6f5d0', '#d8f7e0', '#eafbee'],
    'icons':         ['#f5f0c6', '#f7f3d8', '#fbf9ea'],
    'shared':        ['#f5c6e8', '#f7d8ef', '#fbeaf7'],
    'UsagesTable':   ['#f5d6c6', '#f7e3d8', '#fbefea'],
    'utils':         ['#e0c6f5', '#ebd8f7', '#f4eafb'],
    '__mocks__':     ['#d0d0d0', '#e0e0e0', '#f0f0f0'],
};
const DEFAULT_COLORS = ['#e8e8e8', '#f0f0f0', '#f8f8f8'];

// Map absolute path → short label (relative to ROOT)
function label(absPath) {
    return path.relative(ROOT, absPath);
}

// Safe DOT identifier: replace non-alphanumeric chars with underscores
function nodeId(absPath) {
    return 'n_' + label(absPath).replace(/[^a-zA-Z0-9]/g, '_');
}

// Build a tree of directories from the file list
function buildDirTree(files) {
    const tree = {__files: []};
    for (const f of files) {
        const rel = label(f);
        const parts = rel.split(path.sep);
        let node = tree;
        for (let i = 0; i < parts.length - 1; i++) {
            const part = parts[i];
            if (!node[part]) node[part] = {__files: []};
            node = node[part];
        }
        node.__files.push(f);
    }
    return tree;
}

// Recursively emit subgraphs and nodes
// topLevelName: the name of the top-level dir this subtree belongs to
// depth: 0 = top-level dir, 1 = first nesting, etc.
let sgIndex = 0;
function emitSubgraph(node, dirName, indent, topLevelName, depth) {
    const lines = [];
    const id = `cluster_${sgIndex++}`;
    const pad = ' '.repeat(indent);

    // Pick fill color based on top-level parent and nesting depth
    const palette = TOP_LEVEL_COLORS[topLevelName] || DEFAULT_COLORS;
    const fillColor = palette[Math.min(depth, palette.length - 1)];
    const isTopLevel = depth === 0;

    lines.push(`${pad}subgraph ${id} {`);
    lines.push(`${pad}  label="${dirName}";`);
    lines.push(`${pad}  style="rounded,filled";`);
    lines.push(`${pad}  fillcolor="${fillColor}";`);
    if (isTopLevel) {
        lines.push(`${pad}  penwidth=2;`);
        lines.push(`${pad}  fontname="Helvetica-Bold";`);
        lines.push(`${pad}  fontsize=13;`);
    } else {
        lines.push(`${pad}  penwidth=1;`);
        lines.push(`${pad}  fontsize=11;`);
    }

    // Files directly in this dir
    for (const f of node.__files) {
        const filename = path.basename(f);
        lines.push(`${pad}  ${nodeId(f)} [label="${filename}", tooltip="${label(f)}"];`);
    }

    // Recurse into subdirs
    for (const [key, child] of Object.entries(node)) {
        if (key === '__files') continue;
        lines.push(...emitSubgraph(child, key, indent + 2, topLevelName || key, depth + 1));
    }

    lines.push(`${pad}}`);
    return lines;
}

// ── 5. Main ──────────────────────────────────────────────────────────────────

const edges = [];
for (const f of allFiles) {
    for (const dep of extractImports(f)) {
        // Arrow: dep → f  (dep is imported BY f, i.e. dep -> f means "dep is used by f")
        // Convention: A -> B means A is imported by B  (as specified)
        edges.push(`  ${nodeId(dep)} -> ${nodeId(f)};`);
    }
}

const dirTree = buildDirTree([...allFiles].sort());

const lines = [];
lines.push('digraph imports {');
lines.push('  rankdir=LR;');
lines.push('  node [shape=box, fontsize=9, style="rounded,filled", fillcolor=white, margin="0.1,0.05"];');
lines.push('  edge [color="#555555", arrowsize=0.6];');
lines.push('  graph [fontsize=11, compound=true, pad=0.5, nodesep=0.15, ranksep=0.5];');
lines.push('');

// Emit the root subgraph which represents src/javascript itself
lines.push('  subgraph cluster_root {');
lines.push('    label="src/javascript";');
lines.push('    style="rounded,filled";');
lines.push('    fillcolor="#f5f5f5";');
lines.push('    fontname="Helvetica-Bold";');
lines.push('    fontsize=14;');
lines.push('    penwidth=2;');

// Files at root level
for (const f of dirTree.__files) {
    const filename = path.basename(f);
    lines.push(`    ${nodeId(f)} [label="${filename}", tooltip="${label(f)}"];`);
}

// Subdirectories — pass the dir name as topLevelName, depth=0
for (const [key, child] of Object.entries(dirTree)) {
    if (key === '__files') continue;
    lines.push(...emitSubgraph(child, key, 4, key, 0));
}

lines.push('  }');
lines.push('');
lines.push(...edges);
lines.push('}');

console.log(lines.join('\n'));
