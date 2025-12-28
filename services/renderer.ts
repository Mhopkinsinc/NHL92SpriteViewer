
import { Frame, RenderingContext, Sprite } from '../types';

// Decode a single 8x8 tile (4bpp) into a linear array of color indices (0-15)
// Returns 64 integers
const decodeTile = (tileData: Uint8Array, offset: number): number[] => {
  const pixels: number[] = [];
  // Each tile is 32 bytes.
  // Row major 4bpp: 1 byte = 2 pixels.
  for (let i = 0; i < 32; i++) {
    if (offset + i >= tileData.length) {
      pixels.push(0, 0);
      continue;
    }
    const byte = tileData[offset + i];
    pixels.push((byte >> 4) & 0xF); // High nibble
    pixels.push(byte & 0xF);        // Low nibble
  }
  return pixels;
};

export const getFrameBounds = (frame: Frame) => {
  if (!frame.sprites || frame.sprites.length === 0) {
    return { minX: 0, maxX: 0, minY: 0, maxY: 0 };
  }

  let minX = Infinity;
  let maxX = -Infinity;
  let minY = Infinity;
  let maxY = -Infinity;

  frame.sprites.forEach(s => {
    // sprite x/y are signed integers relative to hotspot
    if (s.x < minX) minX = s.x;
    if (s.x + s.w * 8 > maxX) maxX = s.x + s.w * 8;
    if (s.y < minY) minY = s.y;
    if (s.y + s.h * 8 > maxY) maxY = s.y + s.h * 8;
  });

  return { minX, maxX, minY, maxY };
};

export const drawFrame = (
  ctx: CanvasRenderingContext2D,
  frame: Frame,
  tileData: Uint8Array,
  tileCount: number,
  palettes: number[][][],
  offsetX: number,
  offsetY: number,
  scale: number
) => {
  const sprites = frame.sprites;
  if (!sprites) return;

  const data = ctx.getImageData(0, 0, ctx.canvas.width, ctx.canvas.height);
  const pixelData = data.data;
  const canvasWidth = ctx.canvas.width;
  const canvasHeight = ctx.canvas.height;

  sprites.forEach(sprite => {
    const { x, y, w: tileW, h: tileH, tile: tileIdx, pal: paletteLine, fh: flipH, fv: flipV } = sprite;
    const palette = palettes[paletteLine];

    const baseX = x + offsetX;
    const baseY = y + offsetY;

    for (let col = 0; col < tileW; col++) {
      for (let row = 0; row < tileH; row++) {
        const currentTileIdx = tileIdx + col * tileH + row;
        if (currentTileIdx < 0 || currentTileIdx >= tileCount) continue;

        const tileOffset = currentTileIdx * 32;
        if (tileOffset + 32 > tileData.length) continue;

        const tilePixels = decodeTile(tileData, tileOffset);

        const screenCol = flipH ? (tileW - 1 - col) : col;
        const screenRow = flipV ? (tileH - 1 - row) : row;

        const tileX = baseX + screenCol * 8;
        const tileY = baseY + screenRow * 8;

        for (let py = 0; py < 8; py++) {
          for (let px = 0; px < 8; px++) {
            const srcX = flipH ? (7 - px) : px;
            const srcY = flipV ? (7 - py) : py;
            const colorIdx = tilePixels[srcY * 8 + srcX];

            if (colorIdx === 0) continue; 

            const destX = tileX + px;
            const destY = tileY + py;
            const color = palette[colorIdx] || [255, 0, 255, 255];

            for (let sy = 0; sy < scale; sy++) {
              for (let sx = 0; sx < scale; sx++) {
                const finalX = destX * scale + sx;
                const finalY = destY * scale + sy;
                if (finalX >= 0 && finalX < canvasWidth && finalY >= 0 && finalY < canvasHeight) {
                    const idx = (finalY * canvasWidth + finalX) * 4;
                    pixelData[idx] = color[0];
                    pixelData[idx + 1] = color[1];
                    pixelData[idx + 2] = color[2];
                    pixelData[idx + 3] = color[3];
                }
              }
            }
          }
        }
      }
    }
  });

  ctx.putImageData(data, 0, 0);
};

/**
 * Renders a frame to an 8-bit indexed buffer.
 * Maps 4 palette lines to indices 0-63.
 */
export const drawFrameIndexed = (
  buffer: Uint8Array,
  width: number,
  height: number,
  frame: Frame,
  tileData: Uint8Array,
  tileCount: number,
  offsetX: number,
  offsetY: number
) => {
  const sprites = frame.sprites;
  if (!sprites) return;

  sprites.forEach(sprite => {
    const { x, y, w: tileW, h: tileH, tile: tileIdx, pal: paletteLine, fh: flipH, fv: flipV } = sprite;
    
    const baseX = x + offsetX;
    const baseY = y + offsetY;

    for (let col = 0; col < tileW; col++) {
      for (let row = 0; row < tileH; row++) {
        const currentTileIdx = tileIdx + col * tileH + row;
        if (currentTileIdx < 0 || currentTileIdx >= tileCount) continue;

        const tileOffset = currentTileIdx * 32;
        if (tileOffset + 32 > tileData.length) continue;

        const tilePixels = decodeTile(tileData, tileOffset);

        const screenCol = flipH ? (tileW - 1 - col) : col;
        const screenRow = flipV ? (tileH - 1 - row) : row;

        const tileX = baseX + screenCol * 8;
        const tileY = baseY + screenRow * 8;

        for (let py = 0; py < 8; py++) {
          for (let px = 0; px < 8; px++) {
            const srcX = flipH ? (7 - px) : px;
            const srcY = flipV ? (7 - py) : py;
            const colorIdx = tilePixels[srcY * 8 + srcX];

            // In Aseprite Indexed mode, we treat index 0 of any line as transparent (index 0)
            if (colorIdx === 0) continue;

            const destX = tileX + px;
            const destY = tileY + py;

            if (destX >= 0 && destX < width && destY >= 0 && destY < height) {
                // Map to unique index in 0-63 range
                const finalIdx = colorIdx + (paletteLine * 16);
                buffer[destY * width + destX] = finalIdx;
            }
          }
        }
      }
    }
  });
};

export const renderFrameToCanvas = (
  ctx: CanvasRenderingContext2D,
  context: RenderingContext
) => {
  const { frame, tileData, tileCount, palettes, scale } = context;

  if (!frame.sprites || frame.sprites.length === 0) {
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    return;
  }

  const bounds = getFrameBounds(frame);
  const padding = 8;
  
  const maxLeft = Math.abs(bounds.minX);
  const maxRight = Math.abs(bounds.maxX);
  const maxUp = Math.abs(bounds.minY);
  const maxDown = Math.abs(bounds.maxY);
  
  const halfWidth = Math.max(maxLeft, maxRight) + padding;
  const halfHeight = Math.max(maxUp, maxDown) + padding;

  const contentWidth = halfWidth * 2;
  const contentHeight = halfHeight * 2;

  ctx.canvas.width = contentWidth * scale;
  ctx.canvas.height = contentHeight * scale;
  
  const offsetX = halfWidth;
  const offsetY = halfHeight;

  drawFrame(ctx, frame, tileData, tileCount, palettes, offsetX, offsetY, scale);

  const cx = ctx.canvas.width / 2;
  const cy = ctx.canvas.height / 2;
  const chSize = 3 * scale;

  ctx.strokeStyle = 'rgba(239, 68, 68, 0.6)';
  ctx.lineWidth = Math.max(1, scale / 2);
  ctx.beginPath();
  ctx.moveTo(cx - chSize, cy);
  ctx.lineTo(cx + chSize, cy);
  ctx.moveTo(cx, cy - chSize);
  ctx.lineTo(cx, cy + chSize);
  ctx.stroke();
};

/**
 * Renders a single 8x8 tile to a canvas context at the specified scale.
 */
export const renderTileToCanvas = (
  ctx: CanvasRenderingContext2D,
  tileIndex: number,
  paletteLine: number,
  tileData: Uint8Array,
  tileCount: number,
  palettes: number[][][],
  scale: number = 1
) => {
  if (tileIndex < 0 || tileIndex >= tileCount) return;

  const tileOffset = tileIndex * 32;
  if (tileOffset + 32 > tileData.length) return;

  const tilePixels = decodeTile(tileData, tileOffset);
  const palette = palettes[paletteLine];

  ctx.canvas.width = 8 * scale;
  ctx.canvas.height = 8 * scale;
  const imgData = ctx.createImageData(ctx.canvas.width, ctx.canvas.height);
  const pixels = imgData.data;

  for (let py = 0; py < 8; py++) {
    for (let px = 0; px < 8; px++) {
      const colorIdx = tilePixels[py * 8 + px];
      const color = palette[colorIdx] || [0, 0, 0, 0];

      for (let sy = 0; sy < scale; sy++) {
        for (let sx = 0; sx < scale; sx++) {
          const finalX = px * scale + sx;
          const finalY = py * scale + sy;
          const idx = (finalY * ctx.canvas.width + finalX) * 4;
          pixels[idx] = color[0];
          pixels[idx + 1] = color[1];
          pixels[idx + 2] = color[2];
          pixels[idx + 3] = color[3];
        }
      }
    }
  }
  ctx.putImageData(imgData, 0, 0);
};
