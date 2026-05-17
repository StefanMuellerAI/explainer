import {
  useStore,
  FONT_FAMILIES,
  type CanvasEl,
  type ShapeEl,
  type ArrowEl,
  type ImageEl,
  type FrameEl,
} from '../store';
import {
  Bold,
  Italic,
  AlignLeft,
  AlignCenter,
  AlignRight,
  ArrowLeft,
  ArrowRight,
  Minus,
  MoveUp,
  MoveDown,
  Copy,
} from 'lucide-react';

export function PropertyPanel() {
  const {
    elements,
    selectedIds,
    updateElement,
    bringToFront,
    sendToBack,
    duplicate,
  } = useStore();

  if (selectedIds.length === 0) {
    return (
      <aside className="w-72 bg-white border border-gray-200 rounded-xl shadow-sm p-4 text-sm text-gray-500">
        <div className="font-semibold text-gray-700 mb-2">Eigenschaften</div>
        <p className="text-xs leading-relaxed">
          Wähle ein Element aus oder erstelle ein neues mit der Werkzeugleiste.
          <br />
          <br />
          <span className="font-medium text-gray-600">Tipps:</span>
          <br />• Bilder per <kbd className="kbd">Ctrl/Cmd + V</kbd> einfügen
          <br />• <kbd className="kbd">Space</kbd> halten zum Pannen
          <br />• <kbd className="kbd">Ctrl/Cmd + Scroll</kbd> zum Zoomen
          <br />• <kbd className="kbd">0</kbd> oder <kbd className="kbd">R</kbd>
          {' '}zentriert die Ansicht
          <br />• Doppelklick in Formen für Text
          <br />• <kbd className="kbd">Ctrl/Cmd + D</kbd> dupliziert
          <br />• <kbd className="kbd">Entf</kbd> löscht
        </p>
        <style>{`.kbd{font-family:monospace;background:#f3f4f6;border:1px solid #e5e7eb;border-radius:4px;padding:1px 5px;font-size:11px;}`}</style>
      </aside>
    );
  }

  const el = elements.find((e) => e.id === selectedIds[selectedIds.length - 1]);
  if (!el) return null;

  return (
    <aside className="w-72 bg-white border border-gray-200 rounded-xl shadow-sm p-4 text-sm overflow-y-auto max-h-[calc(100vh-32px)]">
      <div className="flex items-center justify-between mb-3">
        <div className="font-semibold text-gray-800 capitalize">
          {labelFor(el.type)}
        </div>
        <div className="flex gap-1">
          <IconBtn title="Duplizieren" onClick={() => duplicate([el.id])}>
            <Copy size={14} />
          </IconBtn>
          <IconBtn title="Nach vorne" onClick={() => bringToFront(el.id)}>
            <MoveUp size={14} />
          </IconBtn>
          <IconBtn title="Nach hinten" onClick={() => sendToBack(el.id)}>
            <MoveDown size={14} />
          </IconBtn>
        </div>
      </div>

      <Section title="Position & Größe">
        <Row>
          <NumberInput
            label="X"
            value={el.x}
            onChange={(v) => updateElement(el.id, { x: v })}
          />
          <NumberInput
            label="Y"
            value={el.y}
            onChange={(v) => updateElement(el.id, { y: v })}
          />
        </Row>
        <Row>
          <NumberInput
            label="B"
            value={el.width}
            onChange={(v) => updateElement(el.id, { width: Math.max(5, v) })}
          />
          <NumberInput
            label="H"
            value={el.height}
            onChange={(v) => updateElement(el.id, { height: Math.max(5, v) })}
          />
        </Row>
        <Row>
          <NumberInput
            label="Rot°"
            value={el.rotation}
            onChange={(v) => updateElement(el.id, { rotation: v })}
          />
        </Row>
      </Section>

      {isShape(el) && <ShapeFields el={el} />}
      {el.type === 'arrow' && <ArrowFields el={el as ArrowEl} />}
      {el.type === 'image' && <ImageFields el={el as ImageEl} />}
      {el.type === 'frame' && <FrameFields el={el as FrameEl} />}
    </aside>
  );
}

function labelFor(t: string) {
  return {
    rect: 'Rechteck',
    ellipse: 'Ellipse',
    triangle: 'Dreieck',
    diamond: 'Raute',
    star: 'Stern',
    arrow: 'Pfeil',
    image: 'Bild',
    frame: 'Export-Rahmen',
  }[t] ?? t;
}

function isShape(el: CanvasEl): el is ShapeEl {
  return ['rect', 'ellipse', 'triangle', 'diamond', 'star'].includes(el.type);
}

function ShapeFields({ el }: { el: ShapeEl }) {
  const update = useStore((s) => s.updateElement);
  return (
    <>
      <Section title="Füllung & Rahmen">
        <Row>
          <ColorInput
            label="Füllung"
            value={el.fill}
            onChange={(v) => update(el.id, { fill: v } as any)}
          />
          <ColorInput
            label="Rand"
            value={el.stroke}
            onChange={(v) => update(el.id, { stroke: v } as any)}
          />
        </Row>
        <Row>
          <NumberInput
            label="Randstärke"
            value={el.strokeWidth}
            onChange={(v) =>
              update(el.id, { strokeWidth: Math.max(0, v) } as any)
            }
          />
          {el.type === 'rect' && (
            <NumberInput
              label="Radius"
              value={el.cornerRadius}
              onChange={(v) =>
                update(el.id, { cornerRadius: Math.max(0, v) } as any)
              }
            />
          )}
        </Row>
        <DashSelector
          value={el.dash}
          onChange={(d) => update(el.id, { dash: d } as any)}
        />
      </Section>
      <Section title="Text">
        <textarea
          value={el.text}
          onChange={(e) => update(el.id, { text: e.target.value } as any)}
          placeholder="Doppelklick auf Form für Inline-Bearbeitung"
          className="w-full text-sm border border-gray-300 rounded px-2 py-1 mb-2 resize-y min-h-[60px]"
        />
        <Row>
          <select
            value={el.fontFamily}
            onChange={(e) =>
              update(el.id, { fontFamily: e.target.value } as any)
            }
            className="flex-1 text-xs border border-gray-300 rounded px-2 py-1"
            style={{ fontFamily: el.fontFamily }}
          >
            {FONT_FAMILIES.map((f) => (
              <option key={f} value={f} style={{ fontFamily: f }}>
                {f}
              </option>
            ))}
          </select>
        </Row>
        <Row>
          <NumberInput
            label="Größe"
            value={el.fontSize}
            onChange={(v) =>
              update(el.id, { fontSize: Math.max(6, v) } as any)
            }
          />
          <ColorInput
            label="Textfarbe"
            value={el.textColor}
            onChange={(v) => update(el.id, { textColor: v } as any)}
          />
        </Row>
        <div className="flex gap-1 mt-2">
          <ToggleBtn
            active={el.bold}
            onClick={() => update(el.id, { bold: !el.bold } as any)}
            title="Fett"
          >
            <Bold size={14} />
          </ToggleBtn>
          <ToggleBtn
            active={el.italic}
            onClick={() => update(el.id, { italic: !el.italic } as any)}
            title="Kursiv"
          >
            <Italic size={14} />
          </ToggleBtn>
          <div className="w-px bg-gray-200 mx-1" />
          <ToggleBtn
            active={el.textAlign === 'left'}
            onClick={() => update(el.id, { textAlign: 'left' } as any)}
          >
            <AlignLeft size={14} />
          </ToggleBtn>
          <ToggleBtn
            active={el.textAlign === 'center'}
            onClick={() => update(el.id, { textAlign: 'center' } as any)}
          >
            <AlignCenter size={14} />
          </ToggleBtn>
          <ToggleBtn
            active={el.textAlign === 'right'}
            onClick={() => update(el.id, { textAlign: 'right' } as any)}
          >
            <AlignRight size={14} />
          </ToggleBtn>
        </div>
      </Section>
    </>
  );
}

function ArrowFields({ el }: { el: ArrowEl }) {
  const update = useStore((s) => s.updateElement);
  return (
    <Section title="Pfeil">
      <Row>
        <ColorInput
          label="Farbe"
          value={el.stroke}
          onChange={(v) => update(el.id, { stroke: v } as any)}
        />
        <NumberInput
          label="Dicke"
          value={el.strokeWidth}
          onChange={(v) =>
            update(el.id, { strokeWidth: Math.max(1, v) } as any)
          }
        />
      </Row>
      <DashSelector
        value={el.dash}
        onChange={(d) => update(el.id, { dash: d } as any)}
      />
      <div className="flex gap-1 mt-2 mb-2">
        <ToggleBtn
          active={el.startHead}
          onClick={() => update(el.id, { startHead: !el.startHead } as any)}
          title="Spitze am Anfang"
        >
          <ArrowLeft size={14} />
        </ToggleBtn>
        <ToggleBtn
          active={!el.startHead && !el.endHead}
          onClick={() =>
            update(el.id, { startHead: false, endHead: false } as any)
          }
          title="Keine Spitze"
        >
          <Minus size={14} />
        </ToggleBtn>
        <ToggleBtn
          active={el.endHead}
          onClick={() => update(el.id, { endHead: !el.endHead } as any)}
          title="Spitze am Ende"
        >
          <ArrowRight size={14} />
        </ToggleBtn>
      </div>
      <Row>
        <NumberInput
          label="Spitze L"
          value={el.pointerLength}
          onChange={(v) =>
            update(el.id, { pointerLength: Math.max(2, v) } as any)
          }
        />
        <NumberInput
          label="Spitze B"
          value={el.pointerWidth}
          onChange={(v) =>
            update(el.id, { pointerWidth: Math.max(2, v) } as any)
          }
        />
      </Row>
      <label className="flex items-center gap-2 mt-2 cursor-pointer">
        <input
          type="checkbox"
          checked={!!el.curved}
          onChange={(e) => update(el.id, { curved: e.target.checked } as any)}
        />
        <span className="text-xs text-gray-700">Geschwungen</span>
      </label>
      {el.curved && (
        <div className="mt-1">
          <label className="text-[10px] text-gray-500 block mb-0.5">
            Krümmung: {(el.curvature ?? 0.3).toFixed(2)}
          </label>
          <input
            type="range"
            min={-1.5}
            max={1.5}
            step={0.05}
            value={el.curvature ?? 0.3}
            onChange={(e) =>
              update(el.id, { curvature: Number(e.target.value) } as any)
            }
            className="w-full"
          />
        </div>
      )}
    </Section>
  );
}

function ImageFields({ el }: { el: ImageEl }) {
  const update = useStore((s) => s.updateElement);
  return (
    <Section title="Bild zuschneiden">
      <Row>
        <NumberInput
          label="Crop X"
          value={Math.round(el.cropX)}
          onChange={(v) =>
            update(el.id, {
              cropX: Math.max(0, Math.min(el.naturalWidth - 1, v)),
            } as any)
          }
        />
        <NumberInput
          label="Crop Y"
          value={Math.round(el.cropY)}
          onChange={(v) =>
            update(el.id, {
              cropY: Math.max(0, Math.min(el.naturalHeight - 1, v)),
            } as any)
          }
        />
      </Row>
      <Row>
        <NumberInput
          label="Crop B"
          value={Math.round(el.cropWidth)}
          onChange={(v) =>
            update(el.id, {
              cropWidth: Math.max(1, Math.min(el.naturalWidth - el.cropX, v)),
            } as any)
          }
        />
        <NumberInput
          label="Crop H"
          value={Math.round(el.cropHeight)}
          onChange={(v) =>
            update(el.id, {
              cropHeight: Math.max(
                1,
                Math.min(el.naturalHeight - el.cropY, v),
              ),
            } as any)
          }
        />
      </Row>
      <button
        className="mt-2 w-full text-xs bg-gray-100 hover:bg-gray-200 rounded px-2 py-1.5"
        onClick={() =>
          update(el.id, {
            cropX: 0,
            cropY: 0,
            cropWidth: el.naturalWidth,
            cropHeight: el.naturalHeight,
          } as any)
        }
      >
        Zuschnitt zurücksetzen
      </button>
    </Section>
  );
}

function FrameFields({ el }: { el: FrameEl }) {
  const update = useStore((s) => s.updateElement);
  return (
    <Section title="Rahmen">
      <label className="text-xs text-gray-600 mb-1 block">Name</label>
      <input
        value={el.name}
        onChange={(e) => update(el.id, { name: e.target.value } as any)}
        className="w-full text-sm border border-gray-300 rounded px-2 py-1"
      />
      <p className="text-xs text-gray-500 mt-2">
        Beim Rahmen-Export wird nur der Bereich innerhalb dieses Rahmens als PNG
        gespeichert. Mehrere Rahmen erzeugen mehrere Dateien.
      </p>
    </Section>
  );
}

// --- UI atoms ---

function Section({ title, children }: any) {
  return (
    <div className="mb-4">
      <div className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-2">
        {title}
      </div>
      {children}
    </div>
  );
}

function Row({ children }: any) {
  return <div className="flex gap-2 mb-2">{children}</div>;
}

function NumberInput({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <label className="flex-1 flex flex-col">
      <span className="text-[10px] text-gray-500 mb-0.5">{label}</span>
      <input
        type="number"
        value={Math.round(value)}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full text-xs border border-gray-300 rounded px-2 py-1"
      />
    </label>
  );
}

function ColorInput({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <label className="flex-1 flex flex-col">
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

function DashSelector({
  value,
  onChange,
}: {
  value: number[] | null;
  onChange: (d: number[] | null) => void;
}) {
  const options: { label: string; v: number[] | null }[] = [
    { label: 'Linie', v: null },
    { label: '— — —', v: [10, 6] },
    { label: '· · ·', v: [2, 4] },
    { label: '—·—·', v: [10, 4, 2, 4] },
  ];
  const cur = JSON.stringify(value);
  return (
    <div className="flex gap-1">
      {options.map((o) => (
        <button
          key={o.label}
          onClick={() => onChange(o.v)}
          className={`flex-1 text-xs border rounded px-1 py-1 ${
            cur === JSON.stringify(o.v)
              ? 'border-blue-500 bg-blue-50 text-blue-700'
              : 'border-gray-300 text-gray-600 hover:bg-gray-50'
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

function ToggleBtn({
  active,
  children,
  onClick,
  title,
}: {
  active: boolean;
  children: any;
  onClick: () => void;
  title?: string;
}) {
  return (
    <button
      onClick={onClick}
      title={title}
      className={`w-7 h-7 flex items-center justify-center rounded border ${
        active
          ? 'bg-blue-600 text-white border-blue-600'
          : 'border-gray-300 text-gray-700 hover:bg-gray-50'
      }`}
    >
      {children}
    </button>
  );
}

function IconBtn({
  children,
  onClick,
  title,
}: {
  children: any;
  onClick: () => void;
  title?: string;
}) {
  return (
    <button
      onClick={onClick}
      title={title}
      className="w-7 h-7 flex items-center justify-center rounded text-gray-600 hover:bg-gray-100"
    >
      {children}
    </button>
  );
}
