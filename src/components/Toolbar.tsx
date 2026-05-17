import {
  MousePointer2,
  Hand,
  Square,
  Circle,
  Triangle,
  Diamond,
  Star,
  ArrowRight,
  Type,
  Pencil,
  Frame,
  ZoomIn,
  ZoomOut,
  Maximize,
  Download,
  Image as ImageIcon,
  Trash2,
  Palette,
  Sparkles,
  Settings,
} from 'lucide-react';
import { useStore, type Tool } from '../store';
import { exportFullCanvas, exportFrames } from '../lib/export';
import { useRef } from 'react';

const TOOLS: { id: Tool; label: string; icon: any; shortcut?: string }[] = [
  { id: 'select', label: 'Auswahl', icon: MousePointer2, shortcut: 'V' },
  { id: 'pan', label: 'Hand (Space)', icon: Hand, shortcut: 'H' },
  { id: 'rect', label: 'Rechteck', icon: Square, shortcut: 'R' },
  { id: 'ellipse', label: 'Ellipse', icon: Circle, shortcut: 'O' },
  { id: 'triangle', label: 'Dreieck', icon: Triangle, shortcut: 'T' },
  { id: 'diamond', label: 'Raute', icon: Diamond, shortcut: 'D' },
  { id: 'star', label: 'Stern', icon: Star, shortcut: 'S' },
  { id: 'arrow', label: 'Pfeil', icon: ArrowRight, shortcut: 'A' },
  { id: 'text', label: 'Text', icon: Type, shortcut: 'X' },
  { id: 'pen', label: 'Stift', icon: Pencil, shortcut: 'P' },
  { id: 'frame', label: 'Export-Rahmen', icon: Frame, shortcut: 'F' },
];

export function Toolbar({
  onToggleBackground,
  onToggleCursor,
  onTogglePresets,
}: {
  onToggleBackground: () => void;
  onToggleCursor: () => void;
  onTogglePresets: () => void;
}) {
  const {
    tool,
    setTool,
    viewport,
    setViewport,
    resetViewport,
    selectedIds,
    removeElements,
    addElement,
    elements,
  } = useStore();
  const fileRef = useRef<HTMLInputElement>(null);

  const zoom = (factor: number) => {
    const oldScale = viewport.scale;
    const newScale = Math.max(0.1, Math.min(8, oldScale * factor));
    // zoom around viewport center (we don't have pointer here)
    const cx = window.innerWidth / 2;
    const cy = window.innerHeight / 2;
    const mx = (cx - viewport.x) / oldScale;
    const my = (cy - viewport.y) / oldScale;
    setViewport({ scale: newScale, x: cx - mx * newScale, y: cy - my * newScale });
  };

  const onUploadImage = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      const src = reader.result as string;
      const img = new Image();
      img.onload = () => {
        const max = 400;
        const ratio = Math.min(1, max / Math.max(img.width, img.height));
        const w = img.width * ratio;
        const h = img.height * ratio;
        const cx = (window.innerWidth / 2 - viewport.x) / viewport.scale;
        const cy = (window.innerHeight / 2 - viewport.y) / viewport.scale;
        addElement({
          id: Date.now().toString(36) + Math.random().toString(36).slice(2, 8),
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
        } as any);
      };
      img.src = src;
    };
    reader.readAsDataURL(file);
  };

  const hasFrames = elements.some((e) => e.type === 'frame');

  return (
    <div className="flex flex-col gap-1 p-2 bg-white border border-gray-200 rounded-xl shadow-sm">
      {TOOLS.map((t) => {
        const Icon = t.icon;
        const active = tool === t.id;
        return (
          <button
            key={t.id}
            onClick={() => setTool(t.id)}
            title={`${t.label}${t.shortcut ? ` (${t.shortcut})` : ''}`}
            className={`w-10 h-10 flex items-center justify-center rounded-lg transition-colors ${
              active
                ? 'bg-blue-600 text-white'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <Icon size={18} />
          </button>
        );
      })}

      <div className="h-px bg-gray-200 my-1" />

      <button
        onClick={() => fileRef.current?.click()}
        title="Bild hochladen"
        className="w-10 h-10 flex items-center justify-center rounded-lg text-gray-700 hover:bg-gray-100"
      >
        <ImageIcon size={18} />
      </button>
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) onUploadImage(f);
          e.target.value = '';
        }}
      />

      <button
        onClick={onToggleBackground}
        title="Hintergrund"
        className="w-10 h-10 flex items-center justify-center rounded-lg text-gray-700 hover:bg-gray-100"
      >
        <Palette size={18} />
      </button>

      <button
        onClick={onToggleCursor}
        title="Präsentations-Cursor"
        className="w-10 h-10 flex items-center justify-center rounded-lg text-gray-700 hover:bg-gray-100"
      >
        <Sparkles size={18} />
      </button>

      <button
        onClick={onTogglePresets}
        title="Presets / Einstellungen"
        className="w-10 h-10 flex items-center justify-center rounded-lg text-gray-700 hover:bg-gray-100"
      >
        <Settings size={18} />
      </button>

      <div className="h-px bg-gray-200 my-1" />

      <button
        onClick={() => zoom(1.2)}
        title="Hineinzoomen (Ctrl/Cmd +)"
        className="w-10 h-10 flex items-center justify-center rounded-lg text-gray-700 hover:bg-gray-100"
      >
        <ZoomIn size={18} />
      </button>
      <button
        onClick={() => zoom(1 / 1.2)}
        title="Herauszoomen (Ctrl/Cmd -)"
        className="w-10 h-10 flex items-center justify-center rounded-lg text-gray-700 hover:bg-gray-100"
      >
        <ZoomOut size={18} />
      </button>
      <button
        onClick={resetViewport}
        title="Zurück zum Mittelpunkt (0 / R)"
        className="w-10 h-10 flex items-center justify-center rounded-lg text-gray-700 hover:bg-gray-100"
      >
        <Maximize size={18} />
      </button>

      <div className="h-px bg-gray-200 my-1" />

      <button
        onClick={() => exportFullCanvas()}
        title="Ganzes Canvas als PNG exportieren"
        className="w-10 h-10 flex items-center justify-center rounded-lg text-gray-700 hover:bg-gray-100"
      >
        <Download size={18} />
      </button>
      <button
        onClick={() => exportFrames()}
        title={
          hasFrames
            ? 'Alle Rahmen als PNG exportieren'
            : 'Keine Rahmen vorhanden — exportiert das ganze Canvas'
        }
        className={`w-10 h-10 flex items-center justify-center rounded-lg ${
          hasFrames
            ? 'text-purple-700 hover:bg-purple-50'
            : 'text-gray-400 hover:bg-gray-100'
        }`}
      >
        <Frame size={18} />
      </button>

      <div className="h-px bg-gray-200 my-1" />

      <button
        onClick={() => selectedIds.length && removeElements(selectedIds)}
        disabled={selectedIds.length === 0}
        title="Löschen (Entf)"
        className="w-10 h-10 flex items-center justify-center rounded-lg text-red-600 hover:bg-red-50 disabled:opacity-30 disabled:hover:bg-transparent"
      >
        <Trash2 size={18} />
      </button>
    </div>
  );
}
