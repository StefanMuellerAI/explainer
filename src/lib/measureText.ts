let canvas: HTMLCanvasElement | null = null;
function ctx() {
  if (!canvas) canvas = document.createElement('canvas');
  return canvas.getContext('2d')!;
}

export function measureText(
  text: string,
  fontFamily: string,
  fontSize: number,
  bold: boolean,
  italic: boolean,
): { width: number; height: number; lineHeight: number } {
  const c = ctx();
  const style = italic ? 'italic' : 'normal';
  const weight = bold ? '700' : '400';
  c.font = `${style} ${weight} ${fontSize}px ${fontFamily}, sans-serif`;
  const lines = text.split('\n');
  const widths = lines.map((l) => c.measureText(l || ' ').width);
  const lineHeight = fontSize * 1.25;
  return {
    width: Math.max(20, ...widths),
    height: Math.max(lineHeight, lines.length * lineHeight),
    lineHeight,
  };
}
