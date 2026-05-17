import { create } from 'zustand';

export type Tool =
  | 'select'
  | 'pan'
  | 'rect'
  | 'ellipse'
  | 'triangle'
  | 'diamond'
  | 'star'
  | 'arrow'
  | 'frame';

export type ShapeType = 'rect' | 'ellipse' | 'triangle' | 'diamond' | 'star';

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
}

export interface FrameEl extends BaseEl {
  type: 'frame';
  name: string;
}

export type CanvasEl = ShapeEl | ImageEl | ArrowEl | FrameEl;

export interface Background {
  color: string;
  pattern: 'none' | 'dots' | 'grid' | 'lines' | 'cross' | 'diagonal';
  patternColor: string;
  patternSize: number;
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
  viewport: Viewport;
  editingId: string | null;
  // default style for new shapes/arrows
  defaultShapeFill: string;
  defaultShapeStroke: string;
  defaultShapeStrokeWidth: number;
  defaultArrowStroke: string;
  defaultArrowStrokeWidth: number;
  defaultFontFamily: string;

  setTool: (t: Tool) => void;
  setSelected: (ids: string[]) => void;
  addElement: (el: CanvasEl) => void;
  updateElement: (id: string, patch: Partial<CanvasEl>) => void;
  removeElements: (ids: string[]) => void;
  setBackground: (b: Partial<Background>) => void;
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

export const useStore = create<State>((set) => ({
  elements: [],
  selectedIds: [],
  tool: 'select',
  background: {
    color: '#ffffff',
    pattern: 'dots',
    patternColor: '#d1d5db',
    patternSize: 20,
  },
  viewport: { x: 0, y: 0, scale: 1 },
  editingId: null,
  defaultShapeFill: '#dbeafe',
  defaultShapeStroke: '#1e40af',
  defaultShapeStrokeWidth: 2,
  defaultArrowStroke: '#111827',
  defaultArrowStrokeWidth: 3,
  defaultFontFamily: 'Inter',

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
}));

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
