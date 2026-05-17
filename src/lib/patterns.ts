import type { Background } from '../store';

// Returns an HTMLImageElement-compatible source (data URI) for the chosen pattern.
// Used both for on-screen rendering (CSS background) and for Konva fillPatternImage on export.
export function patternDataUri(bg: Background): string | null {
  if (bg.pattern === 'none') return null;
  const s = bg.patternSize;
  const c = bg.patternColor;
  let svg = '';
  switch (bg.pattern) {
    case 'dots':
      svg = `<svg xmlns='http://www.w3.org/2000/svg' width='${s}' height='${s}'><circle cx='${s / 2}' cy='${s / 2}' r='${Math.max(1, s / 14)}' fill='${c}'/></svg>`;
      break;
    case 'grid':
      svg = `<svg xmlns='http://www.w3.org/2000/svg' width='${s}' height='${s}'><path d='M ${s} 0 L 0 0 0 ${s}' fill='none' stroke='${c}' stroke-width='1'/></svg>`;
      break;
    case 'lines':
      svg = `<svg xmlns='http://www.w3.org/2000/svg' width='${s}' height='${s}'><line x1='0' y1='${s / 2}' x2='${s}' y2='${s / 2}' stroke='${c}' stroke-width='1'/></svg>`;
      break;
    case 'cross':
      svg = `<svg xmlns='http://www.w3.org/2000/svg' width='${s}' height='${s}'><line x1='${s / 2}' y1='0' x2='${s / 2}' y2='${s}' stroke='${c}' stroke-width='1'/><line x1='0' y1='${s / 2}' x2='${s}' y2='${s / 2}' stroke='${c}' stroke-width='1'/></svg>`;
      break;
    case 'diagonal':
      svg = `<svg xmlns='http://www.w3.org/2000/svg' width='${s}' height='${s}'><line x1='0' y1='${s}' x2='${s}' y2='0' stroke='${c}' stroke-width='1'/></svg>`;
      break;
  }
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

export function loadPatternImage(uri: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = uri;
  });
}
