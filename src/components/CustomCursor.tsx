import { useEffect, useState, useRef } from 'react';
import { useStore } from '../store';
import { ArrowSvg } from './CursorSettingsPanel';

export function CustomCursor({
  containerRef,
}: {
  containerRef: React.RefObject<HTMLElement | null>;
}) {
  const cursor = useStore((s) => s.cursor);
  const [pos, setPos] = useState<{ x: number; y: number } | null>(null);
  const overRef = useRef(false);

  useEffect(() => {
    if (!cursor.enabled) {
      setPos(null);
      return;
    }
    const onMove = (e: MouseEvent) => {
      const el = containerRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const inside =
        e.clientX >= rect.left &&
        e.clientX <= rect.right &&
        e.clientY >= rect.top &&
        e.clientY <= rect.bottom;
      overRef.current = inside;
      setPos(inside ? { x: e.clientX, y: e.clientY } : null);
    };
    const onLeave = () => {
      overRef.current = false;
      setPos(null);
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseleave', onLeave);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseleave', onLeave);
    };
  }, [cursor.enabled, containerRef]);

  // hide native cursor on container while enabled
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    if (cursor.enabled) {
      el.classList.add('cursor-hidden');
    } else {
      el.classList.remove('cursor-hidden');
    }
    return () => {
      el.classList.remove('cursor-hidden');
    };
  }, [cursor.enabled, containerRef]);

  if (!cursor.enabled || !pos) return null;

  const s = cursor.size;
  const common: React.CSSProperties = {
    position: 'fixed',
    left: pos.x,
    top: pos.y,
    pointerEvents: 'none',
    zIndex: 9999,
    opacity: cursor.opacity,
    transform: 'translate(-50%, -50%)',
  };

  if (cursor.shape === 'dot') {
    return (
      <div
        style={{
          ...common,
          width: s,
          height: s,
          borderRadius: '50%',
          background: cursor.color,
          boxShadow: `0 0 ${s * 0.3}px ${cursor.color}88`,
        }}
      />
    );
  }
  if (cursor.shape === 'ring') {
    return (
      <div
        style={{
          ...common,
          width: s,
          height: s,
          borderRadius: '50%',
          border: `${Math.max(2, s * 0.08)}px solid ${cursor.color}`,
          boxShadow: `0 0 ${s * 0.25}px ${cursor.color}66, inset 0 0 0 1px rgba(255,255,255,0.6)`,
          background: 'transparent',
        }}
      />
    );
  }
  if (cursor.shape === 'arrow') {
    return (
      <div style={{ ...common, transform: 'translate(-10%, -10%)' }}>
        <ArrowSvg size={s} color={cursor.color} />
      </div>
    );
  }
  // spotlight: fills the whole window with a darker overlay around a clear circle
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 9999,
        background: `radial-gradient(circle ${s}px at ${pos.x}px ${pos.y}px, transparent 0%, transparent ${Math.max(0, s - 2)}px, ${cursor.color}${Math.round(cursor.opacity * 255).toString(16).padStart(2, '0')} ${s}px, rgba(0,0,0,${cursor.opacity * 0.55}) 100%)`,
      }}
    />
  );
}
