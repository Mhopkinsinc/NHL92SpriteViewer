import { Frame, ParsedData, Sprite } from '../types';
import { PALETTE_TEXT } from '../constants';

// Helper to convert Genesis 0x0BGR color to RGB [r, g, b]
const genesisToRgb = (color: number): [number, number, number] => {
  const r = ((color >> 1) & 7) * 36;
  const g = ((color >> 5) & 7) * 36;
  const b = ((color >> 9) & 7) * 36;
  return [r, g, b];
};

/**
 * Parses a string of space-separated hex codes (0x0BGR format) into
 * a standard number[][][] palette structure.
 */
export const parsePaletteText = (text: string): number[][][] => {
  // Split by any whitespace to get all hex codes in a flat array
  const hexCodes = text.trim().split(/\s+/);
  const allColors = hexCodes.map(hex => parseInt(hex, 16));

  const palettes: number[][][] = [];
  
  for (let palLine = 0; palLine < 4; palLine++) {
    // Start with transparent color (index 0 is always transparent in Genesis sprites)
    const pal: number[][] = [[0, 0, 0, 0]]; 
    
    for (let i = 1; i < 16; i++) {
      const c = allColors[palLine * 16 + i];
      if (c !== undefined && !isNaN(c)) {
        const [r, g, b] = genesisToRgb(c);
        pal.push([r, g, b, 255]); // Alpha 255
      } else {
        pal.push([0, 0, 0, 255]); // Fallback
      }
    }
    palettes.push(pal);
  }
  
  return palettes;
};

export const loadGamePalette = (): number[][][] => {
  return parsePaletteText(PALETTE_TEXT);
};

const get15BitTileIndex = (sizeLinkWord: number, tileAttrWord: number): number => {
  // Upper 4 bits come from (size_link_word & 0xF000) >> 1
  // Lower 11 bits come from (tile_attr_word & 0x7FF)
  const upper = (sizeLinkWord & 0xF000) >> 1;
  const lower = tileAttrWord & 0x7FF;
  return upper | lower;
};

export const parseSpritesAnim = (buffer: ArrayBuffer): ParsedData => {
  const dataView = new DataView(buffer);
  const uint8Array = new Uint8Array(buffer);
  
  const frames: Frame[] = [];
  
  // Header: Number of frames at offset 2 (Big Endian)
  const numFrames = dataView.getUint16(2, false) + 1;
  console.log(`Header indicates ${numFrames} frames`);

  let pos = 6;
  const fileSize = buffer.byteLength;

  // 1. Parse Frames
  while (pos < fileSize - 40) {
    // Check for 'SS' marker (0x5353)
    if (uint8Array[pos] === 0x53 && uint8Array[pos + 1] === 0x53) {
      // Hotspot data at offsets 24 and 26 relative to SS marker start
      const hotspotX = dataView.getInt16(pos + 24, false);
      const hotspotY = dataView.getInt16(pos + 26, false);

      const numSprites = dataView.getUint16(pos + 36, false) + 1;
      
      const sprites: Sprite[] = [];
      let spritePos = pos + 38;
      
      for (let i = 0; i < numSprites; i++) {
        if (spritePos + 8 > fileSize) break;

        const y = dataView.getInt16(spritePos, false);
        const sizeLink = dataView.getUint16(spritePos + 2, false);
        const tileAttr = dataView.getUint16(spritePos + 4, false);
        const x = dataView.getInt16(spritePos + 6, false);

        // Size from bits 8-11 of size_link
        const sizeNibble = (sizeLink >> 8) & 0x0F;
        const width = ((sizeNibble >> 2) & 3) + 1; // in tiles
        const height = (sizeNibble & 3) + 1;       // in tiles

        const tileIndex = get15BitTileIndex(sizeLink, tileAttr);
        const paletteLine = (tileAttr >> 13) & 3;

        // Flags
        const flipH = !!(tileAttr & 0x0800);
        const flipV = !!(tileAttr & 0x1000);

        sprites.push({
          x,
          y,
          w: width,
          h: height,
          tile: tileIndex,
          pal: paletteLine,
          fh: flipH,
          fv: flipV
        });

        spritePos += 8;
      }

      frames.push({
        index: frames.length,
        offset: pos,
        sprites,
        hotspotX,
        hotspotY
      });

      pos = spritePos;
    } else if (uint8Array[pos] === 0x43 && uint8Array[pos + 1] === 0x43) {
      // 'CC' Marker found, stop frame parsing
      break;
    } else {
      pos += 2;
    }
  }

  // 2. Find Tile Data
  // Locate 'CC' marker
  while (pos < fileSize - 4) {
    if (uint8Array[pos] === 0x43 && uint8Array[pos + 1] === 0x43) {
      break;
    }
    pos++;
  }

  pos += 2; // Skip 'CC'
  const tileCount = dataView.getUint16(pos, false);
  const tileStart = pos + 2;
  
  // Create a copy of the tile data section
  const tileDataLength = tileCount * 32;
  const tileData = uint8Array.slice(tileStart, tileStart + tileDataLength);

  return {
    frames,
    tileData,
    tileCount,
    palettes: loadGamePalette()
  };
};