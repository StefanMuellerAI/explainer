import { useStore, type CursorShape } from '../store';
import { X } from 'lucide-react';

const SHAPES: { v: CursorShape; label: string }[] = [
  { v: 'dot', label: 'Punkt' },
  { v: 'ring', label: 'Ring' },
  { v: 'arrow', label: 'Pfeil' },
  { v: 'spotlight', label: 'Spotlight' },
];

const COLOR_PRESETS = [
  '#ef4444',
  '#f97316',
  '#eab308',
  '#22c55e',
  '#06b6d4',
  '#3b82f6',
  '#8b5cf6',
  '#ec4899',
  '#111827',
  '#ffffff',
];

export function CursorSettingsPanel({ onClose }: { onClose: () => void }) {
  const { cursor, setCursor } = useStore();
  return (
    <div className="absolute top-3 left-20 z-30 w-72 bg-white border border-gray-200 rounded-xl shadow-lg p-4 text-sm">
      <div className="flex items-center justify-between mb-3">
        <div className="font-semibold text-gray-800">Präsentations-Cursor</div>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-700"
        >
          <X size={16} />
        </button>
      </div>

      <label className="flex items-center gap-2 cursor-pointer mb-3 select-none">
        <input
          type="checkbox"
          checked={cursor.enabled}
          onChange={(e) => setCursor({ enabled: e.target.checked })}
        />
        <span className="text-sm text-gray-800">Aktiviert</span>
        <span className="ml-auto text-[10px] text-gray-500">
          nur über dem Canvas
        </span>
      </label>

      <div className="text-xs text-gray-500 mb-1">Form</div>
      <div className="grid grid-cols-4 gap-2 mb-3">
        {SHAPES.map((s) => (
          <button
            key={s.v}
            onClick={() => setCursor({ shape: s.v })}
            className={`flex flex-col items-center justify-center rounded-lg border bg-white py-2 text-[11px] ${
              cursor.shape === s.v
                ? 'border-blue-500 ring-2 ring-blue-200'
                : 'border-gray-200 hover:border-blue-300'
            }`}
          >
            <ShapePreview shape={s.v} color={cursor.color} />
            <span className="mt-1 text-gray-700">{s.label}</span>
          </button>
        ))}
      </div>

      <div className="text-xs text-gray-500 mb-1">Farbe</div>
      <div className="flex items-center gap-1 mb-3 flex-wrap">
        {COLOR_PRESETS.map((c) => (
          <button
            key={c}
            onClick={() => setCursor({ color: c })}
            className={`w-6 h-6 rounded-full border-2 ${
              cursor.color.toLowerCase() === c.toLowerCase()
                ? 'border-blue-500 ring-2 ring-blue-200'
                : 'border-white shadow ring-1 ring-gray-200'
            }`}
            style={{ background: c }}
          />
        ))}
        <input
          type="color"
          value={cursor.color}
          onChange={(e) => setCursor({ color: e.target.value })}
          className="w-6 h-6 rounded-full cursor-pointer border border-gray-300 ml-1"
        />
      </div>

      <label className="text-xs text-gray-500 block mb-0.5">
        Größe: {cursor.size}px
      </label>
      <input
        type="range"
        min={10}
        max={200}
        step={1}
        value={cursor.size}
        onChange={(e) => setCursor({ size: Number(e.target.value) })}
        className="w-full mb-2"
      />

      <label className="text-xs text-gray-500 block mb-0.5">
        Deckkraft: {Math.round(cursor.opacity * 100)}%
      </label>
      <input
        type="range"
        min={0.1}
        max={1}
        step={0.05}
        value={cursor.opacity}
        onChange={(e) => setCursor({ opacity: Number(e.target.value) })}
        className="w-full"
      />
    </div>
  );
}

function ShapePreview({ shape, color }: { shape: CursorShape; color: string }) {
  const s = 22;
  if (shape === 'dot')
    return (
      <div
        className="rounded-full"
        style={{ width: s, height: s, background: color }}
      />
    );
  if (shape === 'ring')
    return (
      <div
        className="rounded-full"
        style={{
          width: s,
          height: s,
          border: `3px solid ${color}`,
        }}
      />
    );
  if (shape === 'arrow')
    return <ArrowSvg size={s} color={color} />;
  // spotlight
  return (
    <div
      className="rounded-full"
      style={{
        width: s,
        height: s,
        background: `radial-gradient(circle, transparent 50%, rgba(0,0,0,0.4) 100%)`,
        border: `1.5px solid ${color}`,
      }}
    />
  );
}

export function ArrowSvg({ size, color }: { size: number; color: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      style={{ display: 'block' }}
    >
      <path
        d="M5 3 L5 19 L10 14 L13 21 L16 20 L13 13 L19 13 Z"
        fill={color}
        stroke="#ffffff"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}
