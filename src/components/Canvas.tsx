import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Stage,
  Layer,
  Rect,
  Ellipse,
  Line,
  Star,
  Arrow,
  Image as KImage,
  Text,
  Transformer,
  Group,
} from 'react-konva';
import Konva from 'konva';
import useImage from 'use-image';
import {
  useStore,
  newId,
  type CanvasEl,
  type ShapeEl,
  type ImageEl,
  type ArrowEl,
  type FrameEl,
  type ShapeType,
} from '../store';
import { patternDataUri, loadPatternImage } from '../lib/patterns';
import { setStage as setStageRef } from '../lib/stageRef';
import { TextOverlay } from './TextOverlay';

interface DraftShape {
  type: ShapeType | 'frame';
  start: { x: number; y: number };
  end: { x: number; y: number };
}
interface DraftArrow {
  start: { x: number; y: number };
  end: { x: number; y: number };
}

export function Canvas() {
  const containerRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<Konva.Stage | null>(null);
  const trRef = useRef<Konva.Transformer | null>(null);
  const layerRef = useRef<Konva.Layer | null>(null);
  const bgLayerRef = useRef<Konva.Layer | null>(null);
  const patternRectRef = useRef<Konva.Rect | null>(null);
  const [size, setSize] = useState({ w: 1, h: 1 });
  const [draftShape, setDraftShape] = useState<DraftShape | null>(null);
  const [draftArrow, setDraftArrow] = useState<DraftArrow | null>(null);
  const [spaceDown, setSpaceDown] = useState(false);

  const {
    elements,
    selectedIds,
    setSelected,
    tool,
    setTool,
    background,
    viewport,
    setViewport,
    resetViewport,
    addElement,
    updateElement,
    removeElements,
    editingId,
    setEditing,
    defaultShapeFill,
    defaultShapeStroke,
    defaultShapeStrokeWidth,
    defaultArrowStroke,
    defaultArrowStrokeWidth,
    defaultFontFamily,
    duplicate,
  } = useStore();

  // Register the stage globally for export utilities
  useEffect(() => {
    setStageRef(stageRef.current);
    return () => setStageRef(null);
  }, []);

  // Track container size
  useEffect(() => {
    if (!containerRef.current) return;
    const el = containerRef.current;
    const update = () =>
      setSize({ w: el.clientWidth, h: el.clientHeight });
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Keyboard
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.isContentEditable)
      )
        return;
      if (e.code === 'Space') {
        e.preventDefault();
        setSpaceDown(true);
      }
      if (e.key === '0' || e.key === 'r' || e.key === 'R') {
        resetViewport();
      }
      if (e.key === 'Escape') {
        setSelected([]);
        setEditing(null);
        setTool('select');
      }
      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (selectedIds.length) removeElements(selectedIds);
      }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'd') {
        e.preventDefault();
        if (selectedIds.length) duplicate(selectedIds);
      }
      if ((e.ctrlKey || e.metaKey) && e.key === '=') {
        e.preventDefault();
        zoomBy(1.2);
      }
      if ((e.ctrlKey || e.metaKey) && e.key === '-') {
        e.preventDefault();
        zoomBy(1 / 1.2);
      }
    };
    const up = (e: KeyboardEvent) => {
      if (e.code === 'Space') setSpaceDown(false);
    };
    window.addEventListener('keydown', down);
    window.addEventListener('keyup', up);
    return () => {
      window.removeEventListener('keydown', down);
      window.removeEventListener('keyup', up);
    };
  }, [selectedIds, removeElements, resetViewport, setSelected, setEditing, setTool, duplicate]);

  // Paste images
  useEffect(() => {
    const onPaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;
      for (const item of items) {
        if (item.type.startsWith('image/')) {
          const file = item.getAsFile();
          if (!file) continue;
          const reader = new FileReader();
          reader.onload = () => {
            const src = reader.result as string;
            const img = new Image();
            img.onload = () => {
              const max = 400;
              const ratio = Math.min(
                1,
                max / Math.max(img.width, img.height),
              );
              const w = img.width * ratio;
              const h = img.height * ratio;
              // center on visible viewport
              const cx = (size.w / 2 - viewport.x) / viewport.scale;
              const cy = (size.h / 2 - viewport.y) / viewport.scale;
              addElement({
                id: newId(),
                type: 'image',
                x: cx - w / 2,
                y: cy - h / 2,
                width: w,
                height: h,
                rotation: 0,
                src,
                naturalWidth: img.width,
                naturalHeight: img.height,
                cropX: 0,
                cropY: 0,
                cropWidth: img.width,
                cropHeight: img.height,
              } as ImageEl);
            };
            img.src = src;
          };
          reader.readAsDataURL(file);
        }
      }
    };
    window.addEventListener('paste', onPaste);
    return () => window.removeEventListener('paste', onPaste);
  }, [addElement, size, viewport]);

  // Background pattern image
  const [patternImg, setPatternImg] = useState<HTMLImageElement | null>(null);
  useEffect(() => {
    const uri = patternDataUri(background);
    if (!uri) {
      setPatternImg(null);
      return;
    }
    let cancelled = false;
    loadPatternImage(uri).then((img) => {
      if (!cancelled) setPatternImg(img);
    });
    return () => {
      cancelled = true;
    };
  }, [background.pattern, background.patternColor, background.patternSize]);

  // Animated background
  useEffect(() => {
    const node = patternRectRef.current;
    const layer = bgLayerRef.current;
    if (!node || !layer) return;
    // reset
    node.fillPatternOffset({ x: 0, y: 0 });
    node.opacity(1);
    if (background.animation === 'none' || !patternImg) {
      layer.batchDraw();
      return;
    }
    const speed = background.animationSpeed;
    const size = background.patternSize;
    const anim = new Konva.Animation((frame) => {
      if (!frame) return;
      const t = (frame.time / 1000) * speed;
      switch (background.animation) {
        case 'drift':
          node.fillPatternOffset({
            x: Math.cos(t * 0.6) * size,
            y: Math.sin(t * 0.6) * size,
          });
          break;
        case 'wave':
          node.fillPatternOffset({
            x: Math.sin(t * 1.2) * size * 1.5,
            y: 0,
          });
          break;
        case 'pulse':
          node.opacity(0.35 + 0.65 * (0.5 + 0.5 * Math.sin(t * 1.8)));
          break;
        case 'shimmer':
          node.fillPatternOffset({ x: -t * size * 0.8, y: -t * size * 0.4 });
          break;
      }
    }, layer);
    anim.start();
    return () => {
      anim.stop();
      node.fillPatternOffset({ x: 0, y: 0 });
      node.opacity(1);
      layer.batchDraw();
    };
  }, [
    background.animation,
    background.animationSpeed,
    background.patternSize,
    patternImg,
  ]);

  // Attach transformer to selected nodes
  useEffect(() => {
    const tr = trRef.current;
    const layer = layerRef.current;
    if (!tr || !layer) return;
    if (editingId) {
      tr.nodes([]);
      tr.getLayer()?.batchDraw();
      return;
    }
    const nodes = selectedIds
      .map((id) => layer.findOne(`#${id}`))
      .filter(Boolean) as Konva.Node[];
    tr.nodes(nodes);
    tr.getLayer()?.batchDraw();
  }, [selectedIds, elements, editingId]);

  // Zoom helpers
  const zoomBy = (factor: number) => {
    const stage = stageRef.current;
    if (!stage) return;
    const pointer = stage.getPointerPosition() ?? {
      x: size.w / 2,
      y: size.h / 2,
    };
    const oldScale = viewport.scale;
    const newScale = Math.max(0.1, Math.min(8, oldScale * factor));
    const mx = (pointer.x - viewport.x) / oldScale;
    const my = (pointer.y - viewport.y) / oldScale;
    setViewport({
      scale: newScale,
      x: pointer.x - mx * newScale,
      y: pointer.y - my * newScale,
    });
  };

  const onWheel = (e: Konva.KonvaEventObject<WheelEvent>) => {
    e.evt.preventDefault();
    if (e.evt.ctrlKey || e.evt.metaKey) {
      const factor = Math.pow(0.999, e.evt.deltaY);
      zoomBy(factor);
    } else {
      setViewport({
        x: viewport.x - e.evt.deltaX,
        y: viewport.y - e.evt.deltaY,
      });
    }
  };

  // Stage pointer in world coordinates
  const worldPointer = () => {
    const stage = stageRef.current;
    if (!stage) return { x: 0, y: 0 };
    const p = stage.getPointerPosition();
    if (!p) return { x: 0, y: 0 };
    return {
      x: (p.x - viewport.x) / viewport.scale,
      y: (p.y - viewport.y) / viewport.scale,
    };
  };

  const onMouseDown = (e: Konva.KonvaEventObject<MouseEvent>) => {
    // If clicked on stage (not a shape) — handle background interactions
    const isStage = e.target === e.target.getStage();
    if (spaceDown) return; // dragging is enabled
    if (tool === 'select' && isStage) {
      setSelected([]);
      return;
    }
    if (tool === 'arrow') {
      const p = worldPointer();
      setDraftArrow({ start: p, end: p });
      return;
    }
    if (
      tool === 'rect' ||
      tool === 'ellipse' ||
      tool === 'triangle' ||
      tool === 'diamond' ||
      tool === 'star' ||
      tool === 'frame'
    ) {
      const p = worldPointer();
      setDraftShape({ type: tool, start: p, end: p });
      return;
    }
  };

  const onMouseMove = () => {
    if (draftShape) {
      const p = worldPointer();
      setDraftShape({ ...draftShape, end: p });
    }
    if (draftArrow) {
      const p = worldPointer();
      setDraftArrow({ ...draftArrow, end: p });
    }
  };

  const onMouseUp = () => {
    if (draftShape) {
      const { type, start, end } = draftShape;
      let x = Math.min(start.x, end.x);
      let y = Math.min(start.y, end.y);
      let w = Math.abs(end.x - start.x);
      let h = Math.abs(end.y - start.y);
      if (w < 4 && h < 4) {
        // simple click: create default-sized shape
        w = 160;
        h = 100;
        x = start.x - w / 2;
        y = start.y - h / 2;
      }
      if (type === 'frame') {
        const id = newId();
        addElement({
          id,
          type: 'frame',
          x,
          y,
          width: Math.max(40, w),
          height: Math.max(40, h),
          rotation: 0,
          name: `Frame ${useStore.getState().elements.filter((e) => e.type === 'frame').length + 1}`,
        } as FrameEl);
      } else {
        const id = newId();
        addElement({
          id,
          type,
          x,
          y,
          width: Math.max(20, w),
          height: Math.max(20, h),
          rotation: 0,
          fill: defaultShapeFill,
          stroke: defaultShapeStroke,
          strokeWidth: defaultShapeStrokeWidth,
          dash: null,
          cornerRadius: type === 'rect' ? 8 : 0,
          text: '',
          fontFamily: defaultFontFamily,
          fontSize: 20,
          bold: false,
          italic: false,
          textColor: '#111827',
          textAlign: 'center',
        } as ShapeEl);
      }
      setDraftShape(null);
      setTool('select');
    }
    if (draftArrow) {
      const { start, end } = draftArrow;
      if (Math.hypot(end.x - start.x, end.y - start.y) > 4) {
        const id = newId();
        const minX = Math.min(start.x, end.x);
        const minY = Math.min(start.y, end.y);
        addElement({
          id,
          type: 'arrow',
          x: minX,
          y: minY,
          width: Math.abs(end.x - start.x),
          height: Math.abs(end.y - start.y),
          rotation: 0,
          points: [
            start.x - minX,
            start.y - minY,
            end.x - minX,
            end.y - minY,
          ],
          stroke: defaultArrowStroke,
          strokeWidth: defaultArrowStrokeWidth,
          dash: null,
          startHead: false,
          endHead: true,
          pointerLength: 12,
          pointerWidth: 12,
          curved: false,
          curvature: 0.3,
        } as ArrowEl);
      }
      setDraftArrow(null);
      setTool('select');
    }
  };

  // Worldspace big background rect bounds
  const bgRect = useMemo(() => {
    const pad = 10000;
    return { x: -pad, y: -pad, width: pad * 2, height: pad * 2 };
  }, []);

  const cursor =
    spaceDown || tool === 'pan'
      ? 'grab'
      : tool === 'select'
        ? 'default'
        : 'crosshair';

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full overflow-hidden"
      style={{ cursor }}
    >
      <Stage
        ref={stageRef}
        width={size.w}
        height={size.h}
        x={viewport.x}
        y={viewport.y}
        scaleX={viewport.scale}
        scaleY={viewport.scale}
        draggable={spaceDown || tool === 'pan'}
        onDragEnd={(e) => {
          if (e.target === e.target.getStage()) {
            setViewport({ x: e.target.x(), y: e.target.y() });
          }
        }}
        onWheel={onWheel}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onTouchStart={onMouseDown as any}
        onTouchMove={onMouseMove as any}
        onTouchEnd={onMouseUp as any}
      >
        {/* Background */}
        <Layer ref={bgLayerRef} listening={false}>
          <Rect
            x={bgRect.x}
            y={bgRect.y}
            width={bgRect.width}
            height={bgRect.height}
            fill={background.color}
          />
          {patternImg && (
            <Rect
              ref={patternRectRef}
              x={bgRect.x}
              y={bgRect.y}
              width={bgRect.width}
              height={bgRect.height}
              fillPatternImage={patternImg}
              fillPatternRepeat="repeat"
              fillPriority="pattern"
            />
          )}
        </Layer>

        {/* Content */}
        <Layer ref={layerRef}>
          {elements.map((el) => (
            <ElementRenderer
              key={el.id}
              el={el}
              selected={selectedIds.includes(el.id)}
              tool={tool}
              isEditing={editingId === el.id}
            />
          ))}

          {/* Draft preview */}
          {draftShape && <DraftPreview draft={draftShape} />}
          {draftArrow && (
            <Arrow
              points={[
                draftArrow.start.x,
                draftArrow.start.y,
                draftArrow.end.x,
                draftArrow.end.y,
              ]}
              stroke={defaultArrowStroke}
              strokeWidth={defaultArrowStrokeWidth}
              pointerLength={12}
              pointerWidth={12}
              fill={defaultArrowStroke}
              listening={false}
            />
          )}

          {/* Transformer */}
          <Transformer
            ref={trRef}
            rotateEnabled
            anchorSize={8}
            anchorStroke="#2563eb"
            anchorFill="#ffffff"
            borderStroke="#2563eb"
            ignoreStroke
            keepRatio={false}
            boundBoxFunc={(oldBox, newBox) => {
              if (Math.abs(newBox.width) < 5 || Math.abs(newBox.height) < 5)
                return oldBox;
              return newBox;
            }}
          />
        </Layer>
      </Stage>

      {/* Text editing overlay */}
      {editingId &&
        (() => {
          const el = elements.find((e) => e.id === editingId);
          if (!el || el.type === 'image' || el.type === 'arrow' || el.type === 'frame')
            return null;
          return (
            <TextOverlay
              el={el as ShapeEl}
              viewport={viewport}
              onCommit={(text) => {
                updateElement(el.id, { text } as any);
                setEditing(null);
              }}
              onCancel={() => setEditing(null)}
            />
          );
        })()}
    </div>
  );
}

function DraftPreview({ draft }: { draft: DraftShape }) {
  const x = Math.min(draft.start.x, draft.end.x);
  const y = Math.min(draft.start.y, draft.end.y);
  const w = Math.abs(draft.end.x - draft.start.x);
  const h = Math.abs(draft.end.y - draft.start.y);
  const common = {
    listening: false,
    stroke: '#2563eb',
    strokeWidth: 1.5,
    dash: [6, 4],
    fill: 'rgba(37,99,235,0.08)',
  };
  if (draft.type === 'ellipse') {
    return (
      <Ellipse
        x={x + w / 2}
        y={y + h / 2}
        radiusX={w / 2}
        radiusY={h / 2}
        {...common}
      />
    );
  }
  if (draft.type === 'triangle') {
    return (
      <Line
        points={[x + w / 2, y, x + w, y + h, x, y + h]}
        closed
        {...common}
      />
    );
  }
  if (draft.type === 'diamond') {
    return (
      <Line
        points={[x + w / 2, y, x + w, y + h / 2, x + w / 2, y + h, x, y + h / 2]}
        closed
        {...common}
      />
    );
  }
  if (draft.type === 'star') {
    return (
      <Star
        x={x + w / 2}
        y={y + h / 2}
        numPoints={5}
        innerRadius={Math.min(w, h) / 4}
        outerRadius={Math.min(w, h) / 2}
        {...common}
      />
    );
  }
  return <Rect x={x} y={y} width={w} height={h} cornerRadius={8} {...common} />;
}

function ElementRenderer({
  el,
  selected,
  tool,
  isEditing,
}: {
  el: CanvasEl;
  selected: boolean;
  tool: string;
  isEditing: boolean;
}) {
  const { setSelected, updateElement, setEditing, setTool } = useStore();
  const draggable = tool === 'select';

  const commonHandlers = {
    draggable,
    onClick: (e: Konva.KonvaEventObject<MouseEvent>) => {
      e.cancelBubble = true;
      if (tool !== 'select') return;
      const additive = e.evt.shiftKey;
      if (additive) {
        const cur = useStore.getState().selectedIds;
        setSelected(
          cur.includes(el.id) ? cur.filter((i) => i !== el.id) : [...cur, el.id],
        );
      } else {
        setSelected([el.id]);
      }
    },
    onTap: (e: Konva.KonvaEventObject<MouseEvent>) => {
      e.cancelBubble = true;
      setSelected([el.id]);
    },
    onDragEnd: (e: Konva.KonvaEventObject<DragEvent>) => {
      updateElement(el.id, { x: e.target.x(), y: e.target.y() });
    },
    onTransformEnd: (e: Konva.KonvaEventObject<Event>) => {
      const node = e.target;
      const sx = node.scaleX();
      const sy = node.scaleY();
      const newW = Math.max(5, node.width() * sx);
      const newH = Math.max(5, node.height() * sy);
      node.scaleX(1);
      node.scaleY(1);
      const patch: any = {
        x: node.x(),
        y: node.y(),
        width: newW,
        height: newH,
        rotation: node.rotation(),
      };
      if (el.type === 'arrow') {
        // scale points proportionally
        const a = el as ArrowEl;
        const oldW = a.width || 1;
        const oldH = a.height || 1;
        const fx = newW / oldW;
        const fy = newH / oldH;
        patch.points = a.points.map((v, i) => (i % 2 === 0 ? v * fx : v * fy));
      }
      updateElement(el.id, patch);
    },
  };

  if (el.type === 'image') {
    return <ImageNode el={el} handlers={commonHandlers} />;
  }
  if (el.type === 'arrow') {
    return <ArrowNode el={el} handlers={commonHandlers} selected={selected} />;
  }
  if (el.type === 'frame') {
    return <FrameNode el={el} handlers={commonHandlers} />;
  }
  return (
    <ShapeNode
      el={el}
      handlers={commonHandlers}
      isEditing={isEditing}
      onDblClick={() => {
        setTool('select');
        setSelected([el.id]);
        setEditing(el.id);
      }}
    />
  );
}

function ShapeNode({
  el,
  handlers,
  onDblClick,
  isEditing,
}: {
  el: ShapeEl;
  handlers: any;
  onDblClick: () => void;
  isEditing: boolean;
}) {
  const fontStyle =
    `${el.italic ? 'italic ' : ''}${el.bold ? '700' : 'normal'}`.trim();
  const renderShape = () => {
    if (el.type === 'rect') {
      return (
        <Rect
          width={el.width}
          height={el.height}
          fill={el.fill}
          stroke={el.stroke}
          strokeWidth={el.strokeWidth}
          dash={el.dash ?? undefined}
          cornerRadius={el.cornerRadius}
        />
      );
    }
    if (el.type === 'ellipse') {
      return (
        <Ellipse
          x={el.width / 2}
          y={el.height / 2}
          radiusX={el.width / 2}
          radiusY={el.height / 2}
          fill={el.fill}
          stroke={el.stroke}
          strokeWidth={el.strokeWidth}
          dash={el.dash ?? undefined}
        />
      );
    }
    if (el.type === 'triangle') {
      return (
        <Line
          points={[el.width / 2, 0, el.width, el.height, 0, el.height]}
          closed
          fill={el.fill}
          stroke={el.stroke}
          strokeWidth={el.strokeWidth}
          dash={el.dash ?? undefined}
        />
      );
    }
    if (el.type === 'diamond') {
      return (
        <Line
          points={[
            el.width / 2,
            0,
            el.width,
            el.height / 2,
            el.width / 2,
            el.height,
            0,
            el.height / 2,
          ]}
          closed
          fill={el.fill}
          stroke={el.stroke}
          strokeWidth={el.strokeWidth}
          dash={el.dash ?? undefined}
        />
      );
    }
    if (el.type === 'star') {
      const r = Math.min(el.width, el.height) / 2;
      return (
        <Star
          x={el.width / 2}
          y={el.height / 2}
          numPoints={5}
          innerRadius={r * 0.5}
          outerRadius={r}
          fill={el.fill}
          stroke={el.stroke}
          strokeWidth={el.strokeWidth}
          dash={el.dash ?? undefined}
        />
      );
    }
    return null;
  };

  return (
    <Group
      id={el.id}
      x={el.x}
      y={el.y}
      width={el.width}
      height={el.height}
      rotation={el.rotation}
      onDblClick={onDblClick}
      onDblTap={onDblClick}
      {...handlers}
    >
      {renderShape()}
      {!isEditing && el.text && (
        <Text
          x={6}
          y={0}
          width={el.width - 12}
          height={el.height}
          text={el.text}
          fontSize={el.fontSize}
          fontFamily={el.fontFamily}
          fontStyle={fontStyle}
          fill={el.textColor}
          align={el.textAlign}
          verticalAlign="middle"
          listening={false}
        />
      )}
    </Group>
  );
}

function ImageNode({ el, handlers }: { el: ImageEl; handlers: any }) {
  const [img] = useImage(el.src, 'anonymous');
  return (
    <KImage
      id={el.id}
      image={img}
      x={el.x}
      y={el.y}
      width={el.width}
      height={el.height}
      rotation={el.rotation}
      crop={{
        x: el.cropX,
        y: el.cropY,
        width: el.cropWidth,
        height: el.cropHeight,
      }}
      {...handlers}
    />
  );
}

function ArrowNode({
  el,
  handlers,
}: {
  el: ArrowEl;
  handlers: any;
  selected: boolean;
}) {
  const pts =
    el.curved && el.points.length >= 4
      ? curvedPoints(el.points, el.curvature ?? 0.3)
      : el.points;
  return (
    <Arrow
      id={el.id}
      x={el.x}
      y={el.y}
      points={pts}
      tension={el.curved ? 0.5 : 0}
      rotation={el.rotation}
      stroke={el.stroke}
      strokeWidth={el.strokeWidth}
      fill={el.stroke}
      dash={el.dash ?? undefined}
      pointerLength={el.pointerLength}
      pointerWidth={el.pointerWidth}
      pointerAtBeginning={el.startHead}
      pointerAtEnding={el.endHead}
      hitStrokeWidth={Math.max(12, el.strokeWidth + 8)}
      {...handlers}
    />
  );
}

function curvedPoints(p: number[], curvature: number): number[] {
  const [x1, y1, x2, y2] = p;
  const dx = x2 - x1;
  const dy = y2 - y1;
  const len = Math.hypot(dx, dy) || 1;
  // perpendicular unit vector
  const px = -dy / len;
  const py = dx / len;
  const mx = (x1 + x2) / 2 + px * len * curvature * 0.5;
  const my = (y1 + y2) / 2 + py * len * curvature * 0.5;
  return [x1, y1, mx, my, x2, y2];
}

function FrameNode({ el, handlers }: { el: FrameEl; handlers: any }) {
  return (
    <Group
      id={el.id}
      x={el.x}
      y={el.y}
      width={el.width}
      height={el.height}
      rotation={el.rotation}
      {...handlers}
    >
      <Rect
        width={el.width}
        height={el.height}
        stroke="#7c3aed"
        strokeWidth={2}
        dash={[10, 6]}
        fill="rgba(124,58,237,0.04)"
      />
      <Text
        x={0}
        y={-22}
        text={el.name}
        fontSize={14}
        fontStyle="700"
        fill="#7c3aed"
        listening={false}
      />
    </Group>
  );
}
