import { useState } from 'react';
import { Canvas } from './components/Canvas';
import { Toolbar } from './components/Toolbar';
import { PropertyPanel } from './components/PropertyPanel';
import { BackgroundPicker } from './components/BackgroundPicker';
import { useStore } from './store';

export default function App() {
  const [bgOpen, setBgOpen] = useState(false);
  const viewport = useStore((s) => s.viewport);

  return (
    <div className="w-full h-full flex">
      {/* Left toolbar */}
      <div className="p-3 z-10">
        <Toolbar onToggleBackground={() => setBgOpen((v) => !v)} />
      </div>

      {/* Canvas area */}
      <div className="flex-1 relative">
        <Canvas />
        {bgOpen && <BackgroundPicker onClose={() => setBgOpen(false)} />}

        {/* Zoom indicator */}
        <div className="absolute bottom-3 left-3 bg-white border border-gray-200 rounded-lg px-3 py-1.5 text-xs font-medium text-gray-700 shadow-sm">
          {Math.round(viewport.scale * 100)}%
        </div>

        {/* Title */}
        <div className="absolute top-3 right-3 bg-white/80 backdrop-blur border border-gray-200 rounded-lg px-3 py-1.5 text-xs font-semibold text-gray-600 shadow-sm pointer-events-none">
          Explainer
        </div>
      </div>

      {/* Right property panel */}
      <div className="p-3 z-10">
        <PropertyPanel />
      </div>
    </div>
  );
}
