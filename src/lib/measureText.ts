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
): { width: number; height: number; lineHeight: number; lines: string[] } {
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
      lines,
    };
  }

  // Effective wrap width — clamp to a safe minimum
  const W = Math.max(20, maxWidth);

  // word-wrap to W; if a single word does not fit, fall back to char-break
  const sourceLines = text.split('\n');
  const out: string[] = [];

  function fitsOrBreakLong(word: string): string[] {
    // returns chunks of the word, each fitting within W
    if (c.measureText(word).width <= W) return [word];
    const chunks: string[] = [];
    let buf = '';
    for (const ch of word) {
      const test = buf + ch;
      if (c.measureText(test).width > W && buf) {
        chunks.push(buf);
        buf = ch;
      } else {
        buf = test;
      }
    }
    if (buf) chunks.push(buf);
    return chunks;
  }

  for (const line of sourceLines) {
    if (!line) {
      out.push('');
      continue;
    }
    const tokens = line.split(/(\s+)/); // keep separators
    let current = '';
    for (const token of tokens) {
      if (!token) continue;
      const test = current + token;
      if (c.measureText(test).width > W && current.trim()) {
        out.push(current);
        // start a new line; if the token itself is a too-long single word,
        // explode it into char chunks
        const stripped = token.replace(/^\s+/, '');
        const chunks = fitsOrBreakLong(stripped);
        // push all but the last as full lines
        for (let i = 0; i < chunks.length - 1; i++) out.push(chunks[i]);
        current = chunks[chunks.length - 1] ?? '';
      } else {
        current = test;
      }
    }
    if (current) out.push(current);
  }
  return {
    width: W,
    height: Math.max(lineHeight, out.length * lineHeight),
    lineHeight,
    lines: out,
  };
}
