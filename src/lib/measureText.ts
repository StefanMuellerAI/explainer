let canvas: HTMLCanvasElement | null = null;
function ctx() {
  if (!canvas) canvas = document.createElement('canvas');
  return canvas.getContext('2d')!;
}

function setFont(
  c: CanvasRenderingContext2D,
  fontFamily: string,
  fontSize: number,
  bold: boolean,
  italic: boolean,
) {
  const style = italic ? 'italic' : 'normal';
  const weight = bold ? '700' : '400';
  c.font = `${style} ${weight} ${fontSize}px ${fontFamily}, sans-serif`;
}

export function measureText(
  text: string,
  fontFamily: string,
  fontSize: number,
  bold: boolean,
  italic: boolean,
  maxWidth?: number,
): { width: number; height: number; lineHeight: number } {
  const c = ctx();
  setFont(c, fontFamily, fontSize, bold, italic);
  const lineHeight = fontSize * 1.25;

  if (!maxWidth) {
    const lines = text.split('\n');
    const widths = lines.map((l) => c.measureText(l || ' ').width);
    return {
      width: Math.max(20, ...widths),
      height: Math.max(lineHeight, lines.length * lineHeight),
      lineHeight,
    };
  }

  // word-wrap to maxWidth
  const sourceLines = text.split('\n');
  const out: string[] = [];
  for (const line of sourceLines) {
    if (!line) {
      out.push('');
      continue;
    }
    const words = line.split(/(\s+)/); // keep separators
    let current = '';
    for (const w of words) {
      const test = current + w;
      if (c.measureText(test).width > maxWidth && current.trim()) {
        out.push(current);
        current = w.replace(/^\s+/, '');
      } else {
        current = test;
      }
    }
    if (current) out.push(current);
  }
  return {
    width: maxWidth,
    height: Math.max(lineHeight, out.length * lineHeight),
    lineHeight,
  };
}
