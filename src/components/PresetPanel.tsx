import { useRef } from 'react';
import { X, Download, Upload, RotateCcw } from 'lucide-react';
import {
  useStore,
  exportPresetJSON,
  applyPresetJSON,
  FONT_FAMILIES,
} from '../store';

export function PresetPanel({ onClose }: { onClose: () => void }) {
  const fileRef = useRef<HTMLInputElement>(null);
  const {
    defaultShapeFill,
    defaultShapeStroke,
    defaultShapeStrokeWidth,
    defaultArrowStroke,
    defaultArrowStrokeWidth,
    defaultFontFamily,
    setDefault,
  } = useStore();

  const onDownload = () => {
    const json = exportPresetJSON();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `explainer-preset-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const onUpload = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      const ok = applyPresetJSON(reader.result as string);
      if (!ok) {
        alert('Preset konnte nicht geladen werden – ungültiges JSON.');
      }
    };
    reader.readAsText(file);
  };

  const onReset = () => {
    if (!confirm('Alle Einstellungen auf Standardwerte zurücksetzen?')) return;
    try {
      localStorage.removeItem('explainer-storage');
    } catch {
      // ignore
    }
    location.reload();
  };

  return (
    <div className="absolute top-3 left-20 z-30 w-80 bg-white border border-gray-200 rounded-xl shadow-lg p-4 text-sm max-h-[80vh] overflow-y-auto">
      <div className="flex items-center justify-between mb-3">
        <div className="font-semibold text-gray-800">
          Presets & Einstellungen
        </div>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-700"
        >
          <X size={16} />
        </button>
      </div>

      <p className="text-xs text-gray-500 mb-3">
        Standardwerte werden automatisch im Browser gespeichert. Du kannst sie
        zusätzlich als Preset-Datei sichern und auf anderen Rechnern wieder
        laden.
      </p>

      <div className="flex gap-2 mb-4">
        <button
          onClick={onDownload}
          className="flex-1 flex items-center justify-center gap-1.5 text-xs font-medium bg-blue-600 text-white rounded-lg px-2 py-2 hover:bg-blue-700"
        >
          <Download size={14} /> Herunterladen
        </button>
        <button
          onClick={() => fileRef.current?.click()}
          className="flex-1 flex items-center justify-center gap-1.5 text-xs font-medium bg-gray-100 text-gray-700 rounded-lg px-2 py-2 hover:bg-gray-200"
        >
          <Upload size={14} /> Hochladen
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="application/json,.json"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) onUpload(f);
            e.target.value = '';
          }}
        />
      </div>

      <div className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-2">
        Standard-Schriftart
      </div>
      <select
        value={defaultFontFamily}
        onChange={(e) => setDefault('defaultFontFamily', e.target.value)}
        className="w-full text-sm border border-gray-300 rounded px-2 py-1.5 mb-3"
        style={{ fontFamily: defaultFontFamily }}
      >
        {FONT_FAMILIES.map((f) => (
          <option key={f} value={f} style={{ fontFamily: f }}>
            {f}
          </option>
        ))}
      </select>

      <div className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-2">
        Standard-Form
      </div>
      <div className="grid grid-cols-2 gap-2 mb-3">
        <ColorField
          label="Füllung"
          value={defaultShapeFill}
          onChange={(v) => setDefault('defaultShapeFill', v)}
        />
        <ColorField
          label="Rand"
          value={defaultShapeStroke}
          onChange={(v) => setDefault('defaultShapeStroke', v)}
        />
        <NumField
          label="Randstärke"
          value={defaultShapeStrokeWidth}
          onChange={(v) => setDefault('defaultShapeStrokeWidth', v)}
        />
      </div>

      <div className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-2">
        Standard-Pfeil
      </div>
      <div className="grid grid-cols-2 gap-2 mb-4">
        <ColorField
          label="Farbe"
          value={defaultArrowStroke}
          onChange={(v) => setDefault('defaultArrowStroke', v)}
        />
        <NumField
          label="Dicke"
          value={defaultArrowStrokeWidth}
          onChange={(v) => setDefault('defaultArrowStrokeWidth', v)}
        />
      </div>

      <button
        onClick={onReset}
        className="w-full flex items-center justify-center gap-1.5 text-xs font-medium bg-red-50 text-red-700 rounded-lg px-2 py-2 hover:bg-red-100"
      >
        <RotateCcw size={14} /> Alle Einstellungen & Canvas zurücksetzen
      </button>
    </div>
  );
}

function ColorField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <label className="flex flex-col">
      <span className="text-[10px] text-gray-500 mb-0.5">{label}</span>
      <div className="flex items-center gap-1 border border-gray-300 rounded overflow-hidden">
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-7 h-7 border-0 p-0 cursor-pointer"
        />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 text-xs px-1 py-1 min-w-0 outline-none"
        />
      </div>
    </label>
  );
}

function NumField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <label className="flex flex-col">
      <span className="text-[10px] text-gray-500 mb-0.5">{label}</span>
      <input
        type="number"
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full text-sm border border-gray-300 rounded px-2 py-1"
      />
    </label>
  );
}
