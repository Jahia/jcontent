#!/usr/bin/env node
/**
 * Wraps a Graphviz SVG in a self-contained HTML file with:
 *  - the diagram scaled to fill the browser viewport
 *  - mouse-wheel zoom
 *  - click-and-drag pan
 *
 * Usage: node scripts/wrap-svg-html.js <input.svg> <output.html>
 */

const fs = require('fs');
const path = require('path');

const [,, input, output] = process.argv;
if (!input || !output) {
    console.error('Usage: node wrap-svg-html.js <input.svg> <output.html>');
    process.exit(1);
}

let svg = fs.readFileSync(input, 'utf8');

// Parse the natural pt dimensions from the viewBox (graphviz units are in pt)
// 1pt = 96/72 px = 1.3333px
const vbMatch = svg.match(/viewBox="[\d.]+\s+[\d.]+\s+([\d.]+)\s+([\d.]+)"/);
const PT_TO_PX = 96 / 72;
const svgW = vbMatch ? Math.round(parseFloat(vbMatch[1]) * PT_TO_PX) : 2000;
const svgH = vbMatch ? Math.round(parseFloat(vbMatch[2]) * PT_TO_PX) : 2000;

// Strip the fixed pt dimensions and replace with explicit pixel dimensions
svg = svg.replace(/\bwidth="[\d.]+pt"\s*/g, '');
svg = svg.replace(/\bheight="[\d.]+pt"\s*/g, '');
svg = svg.replace(/<svg\b/, `<svg width="${svgW}" height="${svgH}" style="display:block;" `);

const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>${path.basename(input, '.svg')}</title>
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
    #hint {
      position: fixed; bottom: 8px; left: 50%; transform: translateX(-50%);
      font-size: 11px; color: #888; pointer-events: none;
    }

    #viewport {
      width: 100%; height: 100%; overflow: hidden; cursor: grab;
    }
    #viewport.dragging { cursor: grabbing; }

    #scene {
      position: absolute;
      transform-origin: 0 0;
    }
    #scene svg { display: block; }
  </style>
</head>
<body>
  <div id="toolbar">
    <button id="btn-zoom-in">＋ Zoom in</button>
    <button id="btn-reset">⟳ Reset</button>
    <button id="btn-zoom-out">－ Zoom out</button>
  </div>
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
      scene.style.transform = \`translate(\${tx}px, \${ty}px) scale(\${scale})\`;
    }

    function fitToViewport() {
      const svg = scene.querySelector('svg');
      const vw = viewport.clientWidth;
      const vh = viewport.clientHeight;
      const nw = parseFloat(svg.getAttribute('width'))  || vw;
      const nh = parseFloat(svg.getAttribute('height')) || vh;
      // Scale so the whole diagram fits with a small margin
      scale = Math.min((vw - 32) / nw, (vh - 32) / nh);
      tx = (vw - nw * scale) / 2;
      ty = (vh - nh * scale) / 2;
      applyTransform();
    }

    window.addEventListener('load', fitToViewport);
    window.addEventListener('resize', fitToViewport);

    document.getElementById('btn-zoom-in').addEventListener('click', () => {
      zoom(1.25, viewport.clientWidth / 2, viewport.clientHeight / 2);
    });
    document.getElementById('btn-zoom-out').addEventListener('click', () => {
      zoom(0.8, viewport.clientWidth / 2, viewport.clientHeight / 2);
    });
    document.getElementById('btn-reset').addEventListener('click', fitToViewport);

    function zoom(factor, cx, cy) {
      const newScale = Math.min(Math.max(scale * factor, 0.02), 20);
      const ratio = newScale / scale;
      tx = cx - ratio * (cx - tx);
      ty = cy - ratio * (cy - ty);
      scale = newScale;
      applyTransform();
    }

    // Mouse wheel zoom
    viewport.addEventListener('wheel', e => {
      e.preventDefault();
      const factor = e.deltaY < 0 ? 1.12 : 1 / 1.12;
      const rect = viewport.getBoundingClientRect();
      zoom(factor, e.clientX - rect.left, e.clientY - rect.top);
    }, { passive: false });

    // Drag pan
    viewport.addEventListener('mousedown', e => {
      if (e.button !== 0) return;
      dragging = true;
      startX = e.clientX; startY = e.clientY;
      startTx = tx; startTy = ty;
      viewport.classList.add('dragging');
    });
    window.addEventListener('mousemove', e => {
      if (!dragging) return;
      tx = startTx + (e.clientX - startX);
      ty = startTy + (e.clientY - startY);
      applyTransform();
    });
    window.addEventListener('mouseup', () => {
      dragging = false;
      viewport.classList.remove('dragging');
    });

    // Touch pan/pinch
    let lastTouchDist = null;
    viewport.addEventListener('touchstart', e => {
      if (e.touches.length === 1) {
        dragging = true;
        startX = e.touches[0].clientX; startY = e.touches[0].clientY;
        startTx = tx; startTy = ty;
      }
      lastTouchDist = null;
    }, { passive: true });
    viewport.addEventListener('touchmove', e => {
      if (e.touches.length === 2) {
        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        const dist = Math.sqrt(dx*dx + dy*dy);
        if (lastTouchDist !== null) {
          const mx = (e.touches[0].clientX + e.touches[1].clientX) / 2;
          const my = (e.touches[0].clientY + e.touches[1].clientY) / 2;
          const rect = viewport.getBoundingClientRect();
          zoom(dist / lastTouchDist, mx - rect.left, my - rect.top);
        }
        lastTouchDist = dist;
      } else if (e.touches.length === 1 && dragging) {
        tx = startTx + (e.touches[0].clientX - startX);
        ty = startTy + (e.touches[0].clientY - startY);
        applyTransform();
      }
    }, { passive: true });
    viewport.addEventListener('touchend', () => { dragging = false; lastTouchDist = null; }, { passive: true });
  </script>
</body>
</html>
`;

fs.writeFileSync(output, html, 'utf8');
console.log(`Written: ${output} (${(fs.statSync(output).size / 1024).toFixed(0)} KB)`);
