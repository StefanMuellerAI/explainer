import { useStore, type Background, type AnimationKind } from '../store';
import { X } from 'lucide-react';

const PATTERNS: Background['pattern'][] = [
  'none',
  'dots',
  'grid',
  'lines',
  'cross',
  'diagonal',
];

const ANIMATIONS: { v: AnimationKind; label: string }[] = [
  { v: 'none', label: 'Statisch' },
  { v: 'drift', label: 'Treiben' },
  { v: 'wave', label: 'Welle' },
  { v: 'shimmer', label: 'Fließen' },
  { v: 'pulse', label: 'Pulsieren' },
];

const PRESET_COLORS = [
  '#ffffff',
  '#f9fafb',
  '#f3f4f6',
  '#fef3c7',
  '#fee2e2',
  '#dcfce7',
  '#dbeafe',
  '#ede9fe',
  '#fce7f3',
  '#1f2937',
  '#0f172a',
  '#fafaf9',
];

export function BackgroundPicker({ onClose }: { onClose: () => void }) {
  const { background, setBackground } = useStore();

  return (
    <div className="absolute top-3 left-20 z-20 w-72 bg-white border border-gray-200 rounded-xl shadow-lg p-4 text-sm">
      <div className="flex items-center justify-between mb-3">
        <div className="font-semibold text-gray-800">Hintergrund</div>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-700"
        >
          <X size={16} />
        </button>
      </div>

      <div className="text-xs text-gray-500 mb-1">Farbe</div>
      <div className="flex items-center gap-2 mb-3">
        <input
          type="color"
          value={background.color}
          onChange={(e) => setBackground({ color: e.target.value })}
          className="w-9 h-9 border border-gray-300 rounded cursor-pointer"
        />
        <input
          type="text"
          value={background.color}
          onChange={(e) => setBackground({ color: e.target.value })}
          className="flex-1 text-xs border border-gray-300 rounded px-2 py-1.5"
        />
      </div>
      <div className="grid grid-cols-6 gap-1 mb-4">
        {PRESET_COLORS.map((c) => (
          <button
            key={c}
            onClick={() => setBackground({ color: c })}
            className={`w-full aspect-square rounded border ${
              background.color === c
                ? 'border-blue-500 ring-2 ring-blue-200'
                : 'border-gray-200'
            }`}
            style={{ background: c }}
          />
        ))}
      </div>

      <div className="text-xs text-gray-500 mb-1">Muster</div>
      <div className="grid grid-cols-3 gap-2 mb-3">
        {PATTERNS.map((p) => (
          <button
            key={p}
            onClick={() => setBackground({ pattern: p })}
            className={`text-xs py-2 rounded border capitalize ${
              background.pattern === p
                ? 'border-blue-500 bg-blue-50 text-blue-700'
                : 'border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
          >
            {labels[p]}
          </button>
        ))}
      </div>

      {background.pattern !== 'none' && (
        <>
          <div className="text-xs text-gray-500 mb-1">Musterfarbe</div>
          <div className="flex items-center gap-2 mb-3">
            <input
              type="color"
              value={background.patternColor}
              onChange={(e) => setBackground({ patternColor: e.target.value })}
              className="w-9 h-9 border border-gray-300 rounded cursor-pointer"
            />
            <input
              type="text"
              value={background.patternColor}
              onChange={(e) => setBackground({ patternColor: e.target.value })}
              className="flex-1 text-xs border border-gray-300 rounded px-2 py-1.5"
            />
          </div>
          <label className="text-xs text-gray-500 block mb-1">
            Mustergröße: {background.patternSize}px
          </label>
          <input
            type="range"
            min={6}
            max={80}
            value={background.patternSize}
            onChange={(e) =>
              setBackground({ patternSize: Number(e.target.value) })
            }
            className="w-full mb-3"
          />

          <div className="text-xs text-gray-500 mb-1">Animation</div>
          <div className="grid grid-cols-3 gap-1 mb-2">
            {ANIMATIONS.map((a) => (
              <button
                key={a.v}
                onClick={() => setBackground({ animation: a.v })}
                className={`text-xs py-1.5 rounded border ${
                  background.animation === a.v
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                {a.label}
              </button>
            ))}
          </div>
          {background.animation !== 'none' && (
            <>
              <label className="text-xs text-gray-500 block mb-1">
                Geschwindigkeit: {background.animationSpeed.toFixed(1)}×
              </label>
              <input
                type="range"
                min={0.1}
                max={3}
                step={0.1}
                value={background.animationSpeed}
                onChange={(e) =>
                  setBackground({ animationSpeed: Number(e.target.value) })
                }
                className="w-full"
              />
            </>
          )}
        </>
      )}
    </div>
  );
}

const labels: Record<Background['pattern'], string> = {
  none: 'Keins',
  dots: 'Punkte',
  grid: 'Raster',
  lines: 'Linien',
  cross: 'Kreuze',
  diagonal: 'Diagonal',
};
