import { useRef, useState } from 'react';
import { ChevronRight, ChevronLeft } from 'lucide-react';
import { Canvas } from './components/Canvas';
import { Toolbar } from './components/Toolbar';
import { PropertyPanel } from './components/PropertyPanel';
import { BackgroundPicker } from './components/BackgroundPicker';
import { PenSettings } from './components/PenSettings';
import { CursorSettingsPanel } from './components/CursorSettingsPanel';
import { CustomCursor } from './components/CustomCursor';
import { PresetPanel } from './components/PresetPanel';
import { useStore } from './store';

export default function App() {
  const [bgOpen, setBgOpen] = useState(false);
  const [cursorOpen, setCursorOpen] = useState(false);
  const [presetOpen, setPresetOpen] = useState(false);
  const [panelOpen, setPanelOpen] = useState(true);
  const viewport = useStore((s) => s.viewport);
  const tool = useStore((s) => s.tool);
  const canvasContainerRef = useRef<HTMLDivElement>(null);

  const openOne = (which: 'bg' | 'cursor' | 'preset' | null) => {
    setBgOpen(which === 'bg');
    setCursorOpen(which === 'cursor');
    setPresetOpen(which === 'preset');
  };

  return (
    <div className="w-full h-full flex">
      {/* Left toolbar */}
      <div className="p-3 z-10">
        <Toolbar
          onToggleBackground={() =>
            bgOpen ? openOne(null) : openOne('bg')
          }
          onToggleCursor={() =>
            cursorOpen ? openOne(null) : openOne('cursor')
          }
          onTogglePresets={() =>
            presetOpen ? openOne(null) : openOne('preset')
          }
        />
      </div>

      {/* Canvas area */}
      <div ref={canvasContainerRef} className="flex-1 relative">
        <Canvas />
        {bgOpen && <BackgroundPicker onClose={() => openOne(null)} />}
        {cursorOpen && (
          <CursorSettingsPanel onClose={() => openOne(null)} />
        )}
        {presetOpen && <PresetPanel onClose={() => openOne(null)} />}
        {tool === 'pen' && <PenSettings />}

        {/* Zoom indicator */}
        <div className="absolute bottom-3 left-3 bg-white border border-gray-200 rounded-lg px-3 py-1.5 text-xs font-medium text-gray-700 shadow-sm">
          {Math.round(viewport.scale * 100)}%
        </div>
      </div>

      {/* Right property panel */}
      {panelOpen && (
        <div className="p-3 z-10">
          <PropertyPanel />
        </div>
      )}

      {/* Panel toggle — fixed so it stays reachable in both states */}
      <button
        onClick={() => setPanelOpen((v) => !v)}
        title={panelOpen ? 'Panel ausblenden' : 'Panel einblenden'}
        className="fixed top-3 z-40 bg-white border border-gray-200 rounded-lg w-8 h-8 flex items-center justify-center text-gray-600 hover:bg-gray-50 shadow-sm"
        style={{ right: panelOpen ? 320 : 12 }}
      >
        {panelOpen ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
      </button>

      <CustomCursor containerRef={canvasContainerRef} />
    </div>
  );
}
