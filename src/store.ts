import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Tool =
  | 'select'
  | 'pan'
  | 'rect'
  | 'ellipse'
  | 'triangle'
  | 'diamond'
  | 'star'
  | 'arrow'
  | 'text'
  | 'pen'
  | 'frame';

export type ShapeType = 'rect' | 'ellipse' | 'triangle' | 'diamond' | 'star';

export type PenKind = 'pen' | 'marker' | 'highlighter' | 'pencil';

export type TextEffect =
  | 'none'
  | 'drop'
  | 'glow'
  | 'echo'
  | 'outline'
  | 'background'
  | 'outlineShadow'
  | 'hollow'
  | 'neon'
  | 'splice'
  | 'curve';

export interface BaseEl {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
}

export interface ShapeEl extends BaseEl {
  type: ShapeType;
  fill: string;
  stroke: string;
  strokeWidth: number;
  dash: number[] | null;
  cornerRadius: number;
  text: string;
  fontFamily: string;
  fontSize: number;
  bold: boolean;
  italic: boolean;
  textColor: string;
  textAlign: 'left' | 'center' | 'right';
}

export interface ImageEl extends BaseEl {
  type: 'image';
  src: string;
  naturalWidth: number;
  naturalHeight: number;
  cropX: number;
  cropY: number;
  cropWidth: number;
  cropHeight: number;
}

export interface ArrowEl extends BaseEl {
  type: 'arrow';
  // points are in element-local coords (relative to x,y): [x1,y1,x2,y2]
  points: number[];
  stroke: string;
  strokeWidth: number;
  dash: number[] | null;
  startHead: boolean;
  endHead: boolean;
  pointerLength: number;
  pointerWidth: number;
  curved: boolean;
  curvature: number; // -1 .. 1 (sign = side, magnitude = how much it bulges)
}

export interface FrameEl extends BaseEl {
  type: 'frame';
  name: string;
}

export interface PenEl extends BaseEl {
  type: 'pen';
  // points in local coords relative to (x, y): [x1,y1,x2,y2,...]
  points: number[];
  stroke: string;
  strokeWidth: number;
  opacity: number;
  penKind: PenKind;
  tension: number;
}

export interface TextEl extends BaseEl {
  type: 'text';
  text: string;
  fontFamily: string;
  fontSize: number;
  bold: boolean;
  italic: boolean;
  fill: string;
  align: 'left' | 'center' | 'right';
  effect: TextEffect;
  effectColor: string;
  effectIntensity: number; // 0 .. 1, controls blur/offset magnitude
  curveBend: number; // -1 .. 1, only used for curve effect
}

export type CanvasEl = ShapeEl | ImageEl | ArrowEl | FrameEl | TextEl | PenEl;

export const PEN_PRESETS: Record<
  PenKind,
  { color: string; width: number; opacity: number; label: string }
> = {
  pen: { color: '#111827', width: 4, opacity: 1, label: 'Stift' },
  marker: { color: '#111827', width: 10, opacity: 0.95, label: 'Filzstift' },
  highlighter: {
    color: '#fde047',
    width: 22,
    opacity: 0.4,
    label: 'Textmarker',
  },
  pencil: { color: '#374151', width: 2, opacity: 0.7, label: 'Bleistift' },
};

export type PatternKind =
  | 'none'
  | 'dots'
  | 'grid'
  | 'lines'
  | 'cross'
  | 'diagonal';

export type AnimationKind = 'none' | 'drift' | 'wave' | 'pulse' | 'shimmer';

export interface Background {
  color: string;
  pattern: PatternKind;
  patternColor: string;
  patternSize: number;
  animation: AnimationKind;
  animationSpeed: number; // 0.1 .. 3
}

export type CursorShape = 'dot' | 'ring' | 'arrow' | 'spotlight';

export interface CursorSettings {
  enabled: boolean;
  shape: CursorShape;
  size: number;
  color: string;
  opacity: number;
}

export interface Viewport {
  x: number;
  y: number;
  scale: number;
}

interface State {
  elements: CanvasEl[];
  selectedIds: string[];
  tool: Tool;
  background: Background;
  cursor: CursorSettings;
  viewport: Viewport;
  editingId: string | null;
  // default style for new shapes/arrows
  defaultShapeFill: string;
  defaultShapeStroke: string;
  defaultShapeStrokeWidth: number;
  defaultArrowStroke: string;
  defaultArrowStrokeWidth: number;
  defaultFontFamily: string;
  // pen settings
  penKind: PenKind;
  penColor: string;
  penWidth: number;
  penOpacity: number;

  setTool: (t: Tool) => void;
  setSelected: (ids: string[]) => void;
  addElement: (el: CanvasEl) => void;
  updateElement: (id: string, patch: Partial<CanvasEl>) => void;
  removeElements: (ids: string[]) => void;
  setBackground: (b: Partial<Background>) => void;
  setCursor: (c: Partial<CursorSettings>) => void;
  setViewport: (v: Partial<Viewport>) => void;
  resetViewport: () => void;
  setEditing: (id: string | null) => void;
  setDefault: (k: string, v: any) => void;
  bringToFront: (id: string) => void;
  sendToBack: (id: string) => void;
  duplicate: (ids: string[]) => void;
}

export const newId = () =>
  Date.now().toString(36) + Math.random().toString(36).slice(2, 8);

export const PRESET_KEYS = [
  'background',
  'cursor',
  'defaultShapeFill',
  'defaultShapeStroke',
  'defaultShapeStrokeWidth',
  'defaultArrowStroke',
  'defaultArrowStrokeWidth',
  'defaultFontFamily',
  'penKind',
  'penColor',
  'penWidth',
  'penOpacity',
] as const;

export const useStore = create<State>()(
  persist(
    (set) => ({
  elements: [],
  selectedIds: [],
  tool: 'select',
  background: {
    color: '#ffffff',
    pattern: 'dots',
    patternColor: '#d1d5db',
    patternSize: 20,
    animation: 'none',
    animationSpeed: 1,
  },
  cursor: {
    enabled: false,
    shape: 'ring',
    size: 40,
    color: '#ef4444',
    opacity: 0.85,
  },
  viewport: { x: 0, y: 0, scale: 1 },
  editingId: null,
  defaultShapeFill: '#dbeafe',
  defaultShapeStroke: '#1e40af',
  defaultShapeStrokeWidth: 2,
  defaultArrowStroke: '#111827',
  defaultArrowStrokeWidth: 3,
  defaultFontFamily: 'Inter',
  penKind: 'pen',
  penColor: '#111827',
  penWidth: 4,
  penOpacity: 1,

  setTool: (t) => set({ tool: t, selectedIds: [], editingId: null }),
  setSelected: (ids) => set({ selectedIds: ids }),
  addElement: (el) =>
    set((s) => ({ elements: [...s.elements, el], selectedIds: [el.id] })),
  updateElement: (id, patch) =>
    set((s) => ({
      elements: s.elements.map((e) =>
        e.id === id ? ({ ...e, ...patch } as CanvasEl) : e,
      ),
    })),
  removeElements: (ids) =>
    set((s) => ({
      elements: s.elements.filter((e) => !ids.includes(e.id)),
      selectedIds: s.selectedIds.filter((i) => !ids.includes(i)),
      editingId: ids.includes(s.editingId ?? '') ? null : s.editingId,
    })),
  setBackground: (b) =>
    set((s) => ({ background: { ...s.background, ...b } })),
  setCursor: (c) => set((s) => ({ cursor: { ...s.cursor, ...c } })),
  setViewport: (v) => set((s) => ({ viewport: { ...s.viewport, ...v } })),
  resetViewport: () => set({ viewport: { x: 0, y: 0, scale: 1 } }),
  setEditing: (id) => set({ editingId: id }),
  setDefault: (k, v) => set({ [k]: v } as any),
  bringToFront: (id) =>
    set((s) => {
      const el = s.elements.find((e) => e.id === id);
      if (!el) return {};
      return { elements: [...s.elements.filter((e) => e.id !== id), el] };
    }),
  sendToBack: (id) =>
    set((s) => {
      const el = s.elements.find((e) => e.id === id);
      if (!el) return {};
      return { elements: [el, ...s.elements.filter((e) => e.id !== id)] };
    }),
  duplicate: (ids) =>
    set((s) => {
      const copies: CanvasEl[] = s.elements
        .filter((e) => ids.includes(e.id))
        .map((e) => ({ ...e, id: newId(), x: e.x + 20, y: e.y + 20 }));
      return {
        elements: [...s.elements, ...copies],
        selectedIds: copies.map((c) => c.id),
      };
    }),
    }),
    {
      name: 'explainer-storage',
      version: 1,
      // persist preferences AND canvas elements so refresh doesn't lose work
      partialize: (state) => ({
        background: state.background,
        cursor: state.cursor,
        defaultShapeFill: state.defaultShapeFill,
        defaultShapeStroke: state.defaultShapeStroke,
        defaultShapeStrokeWidth: state.defaultShapeStrokeWidth,
        defaultArrowStroke: state.defaultArrowStroke,
        defaultArrowStrokeWidth: state.defaultArrowStrokeWidth,
        defaultFontFamily: state.defaultFontFamily,
        penKind: state.penKind,
        penColor: state.penColor,
        penWidth: state.penWidth,
        penOpacity: state.penOpacity,
        elements: state.elements,
      }),
    },
  ),
);

export function exportPresetJSON(): string {
  const s = useStore.getState();
  const payload: any = {};
  for (const k of PRESET_KEYS) payload[k] = (s as any)[k];
  return JSON.stringify({ explainerPreset: 1, ...payload }, null, 2);
}

export function applyPresetJSON(json: string): boolean {
  try {
    const data = JSON.parse(json);
    if (!data || typeof data !== 'object') return false;
    const patch: any = {};
    for (const k of PRESET_KEYS) {
      if (k in data) patch[k] = data[k];
    }
    useStore.setState(patch);
    return true;
  } catch {
    return false;
  }
}

export const FONT_FAMILIES = [
  'Inter',
  'Roboto',
  'Lato',
  'Open Sans',
  'Montserrat',
  'Poppins',
  'Source Sans 3',
  'Nunito',
  'Raleway',
  'Work Sans',
  'Rubik',
  'Quicksand',
  'Comfortaa',
  'Playfair Display',
  'Merriweather',
  'Lora',
  'PT Serif',
  'Bitter',
  'Bebas Neue',
  'Oswald',
  'Anton',
  'Lobster',
  'Pacifico',
  'Dancing Script',
  'Caveat',
  'Permanent Marker',
  'Architects Daughter',
  'Shadows Into Light',
  'Indie Flower',
  'Kalam',
  'Patrick Hand',
  'Special Elite',
  'Press Start 2P',
  'JetBrains Mono',
  'Fira Code',
  'Source Code Pro',
  'Space Mono',
];
