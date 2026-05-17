import { useStore, PEN_PRESETS, type PenKind } from '../store';
import { Pencil, Highlighter, PenTool, Brush } from 'lucide-react';

const PEN_COLORS = [
  '#111827',
  '#ef4444',
  '#f97316',
  '#eab308',
  '#22c55e',
  '#06b6d4',
  '#3b82f6',
  '#8b5cf6',
  '#ec4899',
  '#ffffff',
];

const HIGHLIGHTER_COLORS = [
  '#fde047',
  '#fca5a5',
  '#86efac',
  '#93c5fd',
  '#d8b4fe',
  '#fdba74',
];

const KIND_ICONS: Record<PenKind, any> = {
  pen: PenTool,
  marker: Brush,
  highlighter: Highlighter,
  pencil: Pencil,
};

export function PenSettings() {
  const { penKind, penColor, penWidth, penOpacity, setDefault } = useStore();
  const isHighlighter = penKind === 'highlighter';
  const swatches = isHighlighter ? HIGHLIGHTER_COLORS : PEN_COLORS;

  const setKind = (k: PenKind) => {
    const preset = PEN_PRESETS[k];
    setDefault('penKind', k);
    setDefault('penColor', preset.color);
    setDefault('penWidth', preset.width);
    setDefault('penOpacity', preset.opacity);
  };

  return (
    <div className="absolute top-3 left-1/2 -translate-x-1/2 z-20 bg-white border border-gray-200 rounded-xl shadow-lg px-3 py-2 flex items-center gap-2">
      {(Object.keys(PEN_PRESETS) as PenKind[]).map((k) => {
        const Icon = KIND_ICONS[k];
        const active = penKind === k;
        return (
          <button
            key={k}
            onClick={() => setKind(k)}
            title={PEN_PRESETS[k].label}
            className={`h-9 px-2 flex items-center gap-1.5 rounded-lg text-xs font-medium ${
              active
                ? 'bg-blue-600 text-white'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <Icon size={15} />
            <span>{PEN_PRESETS[k].label}</span>
          </button>
        );
      })}

      <div className="w-px h-7 bg-gray-200 mx-1" />

      <div className="flex items-center gap-1">
        {swatches.map((c) => (
          <button
            key={c}
            onClick={() => setDefault('penColor', c)}
            className={`w-6 h-6 rounded-full border-2 ${
              penColor.toLowerCase() === c.toLowerCase()
                ? 'border-blue-500 ring-2 ring-blue-200'
                : 'border-white shadow ring-1 ring-gray-200'
            }`}
            style={{ background: c }}
          />
        ))}
        <input
          type="color"
          value={penColor}
          onChange={(e) => setDefault('penColor', e.target.value)}
          className="w-6 h-6 rounded-full cursor-pointer border border-gray-300 ml-1"
          title="Eigene Farbe"
        />
      </div>

      <div className="w-px h-7 bg-gray-200 mx-1" />

      <label className="flex items-center gap-2 text-xs text-gray-700">
        <span className="whitespace-nowrap">Spitze {Math.round(penWidth)}px</span>
        <input
          type="range"
          min={1}
          max={80}
          step={1}
          value={penWidth}
          onChange={(e) => setDefault('penWidth', Number(e.target.value))}
          className="w-28"
        />
      </label>

      <label className="flex items-center gap-2 text-xs text-gray-700">
        <span className="whitespace-nowrap">Deckkraft {Math.round(penOpacity * 100)}%</span>
        <input
          type="range"
          min={0.1}
          max={1}
          step={0.05}
          value={penOpacity}
          onChange={(e) => setDefault('penOpacity', Number(e.target.value))}
          className="w-20"
        />
      </label>
    </div>
  );
}
