import { useEffect, useRef } from 'react';
import type { TextEl, Viewport } from '../store';

export function TextElementOverlay({
  el,
  viewport,
  onCommit,
  onCancel,
}: {
  el: TextEl;
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

  const scale = viewport.scale;
  const left = viewport.x + el.x * scale;
  const top = viewport.y + el.y * scale;

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
      onInput={(e) => {
        const ta = e.currentTarget;
        ta.style.height = 'auto';
        ta.style.height = ta.scrollHeight + 'px';
        ta.style.width = 'auto';
        ta.style.width = ta.scrollWidth + 4 + 'px';
      }}
      style={{
        position: 'absolute',
        left,
        top,
        minWidth: el.width * scale,
        minHeight: el.height * scale,
        padding: 0,
        background: 'rgba(255,255,255,0.6)',
        border: '2px dashed #2563eb',
        outline: 'none',
        resize: 'none',
        overflow: 'hidden',
        whiteSpace: 'pre',
        textAlign: el.align,
        fontFamily: el.fontFamily,
        fontSize: el.fontSize * scale,
        fontWeight: el.bold ? 700 : 400,
        fontStyle: el.italic ? 'italic' : 'normal',
        color: el.fill,
        lineHeight: 1.25,
        boxSizing: 'content-box',
      }}
    />
  );
}
