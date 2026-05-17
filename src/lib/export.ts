import type Konva from 'konva';
import { useStore } from '../store';
import { getStage } from './stageRef';

function downloadDataURL(uri: string, name: string) {
  const a = document.createElement('a');
  a.href = uri;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

interface ExportOpts {
  pixelRatio?: number;
  padding?: number;
}

function withCleanStage<T>(stage: Konva.Stage, fn: () => T): T {
  const orig = {
    x: stage.x(),
    y: stage.y(),
    sx: stage.scaleX(),
    sy: stage.scaleY(),
  };
  stage.x(0);
  stage.y(0);
  stage.scaleX(1);
  stage.scaleY(1);

  // Hide transformer and frames during export
  const layers = stage.getLayers();
  const transformerHidden: Konva.Node[] = [];
  const framesHidden: Konva.Node[] = [];
  layers.forEach((layer) => {
    layer.find('Transformer').forEach((t) => {
      if (t.visible()) {
        t.hide();
        transformerHidden.push(t);
      }
    });
  });
  // Hide frame groups (we marked them by element type — find via name attr or className later).
  // Identify frames by id (matching store).
  const frameIds = useStore
    .getState()
    .elements.filter((e) => e.type === 'frame')
    .map((e) => e.id);
  frameIds.forEach((id) => {
    layers.forEach((layer) => {
      const node = layer.findOne(`#${id}`);
      if (node && node.visible()) {
        node.hide();
        framesHidden.push(node);
      }
    });
  });

  stage.batchDraw();
  try {
    return fn();
  } finally {
    transformerHidden.forEach((n) => n.show());
    framesHidden.forEach((n) => n.show());
    stage.x(orig.x);
    stage.y(orig.y);
    stage.scaleX(orig.sx);
    stage.scaleY(orig.sy);
    stage.batchDraw();
  }
}

export function exportFullCanvas(opts: ExportOpts = {}) {
  const stage = getStage();
  if (!stage) return;
  const { pixelRatio = 2, padding = 40 } = opts;
  const elements = useStore
    .getState()
    .elements.filter((e) => e.type !== 'frame');

  let bounds = { x: 0, y: 0, width: 800, height: 600 };
  if (elements.length > 0) {
    let minX = Infinity,
      minY = Infinity,
      maxX = -Infinity,
      maxY = -Infinity;
    elements.forEach((el) => {
      // For arrows, use stroke width margin
      const margin = el.type === 'arrow' ? (el as any).strokeWidth + 16 : 0;
      minX = Math.min(minX, el.x - margin);
      minY = Math.min(minY, el.y - margin);
      maxX = Math.max(maxX, el.x + el.width + margin);
      maxY = Math.max(maxY, el.y + el.height + margin);
    });
    bounds = {
      x: minX - padding,
      y: minY - padding,
      width: maxX - minX + padding * 2,
      height: maxY - minY + padding * 2,
    };
  }
  withCleanStage(stage, () => {
    const uri = stage.toDataURL({
      x: bounds.x,
      y: bounds.y,
      width: bounds.width,
      height: bounds.height,
      pixelRatio,
      mimeType: 'image/png',
    });
    downloadDataURL(uri, `explainer-${Date.now()}.png`);
  });
}

export function exportFrames(opts: ExportOpts = {}) {
  const stage = getStage();
  if (!stage) return;
  const { pixelRatio = 2 } = opts;
  const frames = useStore.getState().elements.filter((e) => e.type === 'frame');
  if (frames.length === 0) {
    // fall back to full export
    exportFullCanvas(opts);
    return;
  }
  withCleanStage(stage, () => {
    frames.forEach((f) => {
      const uri = stage.toDataURL({
        x: f.x,
        y: f.y,
        width: f.width,
        height: f.height,
        pixelRatio,
        mimeType: 'image/png',
      });
      const name = (f as any).name?.replace(/[^a-z0-9-_]/gi, '_') || f.id;
      downloadDataURL(uri, `${name}.png`);
    });
  });
}
