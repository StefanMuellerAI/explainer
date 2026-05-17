import { useEffect, useRef } from 'react';
import type { ShapeEl, Viewport } from '../store';

export function TextOverlay({
  el,
  viewport,
  onCommit,
  onCancel,
}: {
  el: ShapeEl;
  viewport: Viewport;
  onCommit: (text: string) => void;
  onCancel: () => void;
}) {
  const ref = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const ta = ref.current;
    if (!ta) return;
    ta.focus();
    ta.select();
  }, []);

  const left = viewport.x + el.x * viewport.scale;
  const top = viewport.y + el.y * viewport.scale;
  const width = el.width * viewport.scale;
  const height = el.height * viewport.scale;

  return (
    <textarea
      ref={ref}
      defaultValue={el.text}
      onBlur={(e) => onCommit(e.currentTarget.value)}
      onKeyDown={(e) => {
        if (e.key === 'Escape') {
          e.preventDefault();
          onCancel();
        }
        if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
          e.preventDefault();
          onCommit((e.target as HTMLTextAreaElement).value);
        }
      }}
      style={{
        position: 'absolute',
        left,
        top,
        width,
        height,
        padding: `0 ${6 * viewport.scale}px`,
        background: 'transparent',
        border: '2px dashed #2563eb',
        outline: 'none',
        resize: 'none',
        textAlign: el.textAlign,
        fontFamily: el.fontFamily,
        fontSize: el.fontSize * viewport.scale,
        fontWeight: el.bold ? 700 : 400,
        fontStyle: el.italic ? 'italic' : 'normal',
        color: el.textColor,
        lineHeight: 1.2,
        boxSizing: 'border-box',
        overflow: 'hidden',
        display: 'flex',
      }}
    />
  );
}
