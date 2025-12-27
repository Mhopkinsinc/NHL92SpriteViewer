import { Frame, ParsedData, AnimationDefinition, AnimationStep } from '../types';
import { getFrameBounds, drawFrameIndexed } from './renderer';

const DIR_NAMES = [
  "North", "Northeast", "East", "Southeast", 
  "South", "Southwest", "West", "Northwest"
];

const ASE_MAGIC = 0xA5E0;
const FRAME_MAGIC = 0xF1FA;
const CHUNK_LAYER = 0x2004;
const CHUNK_CEL = 0x2005;
const CHUNK_PALETTE = 0x2019;
const LAYER_TYPE_NORMAL = 0;
const BLEND_NORMAL = 0;
const CEL_TYPE_RAW = 0;
const COLOR_DEPTH_8BPP = 8;

class BufferBuilder {
  private chunks: Uint8Array[] = [];
  private totalSize = 0;

  addBytes(data: Uint8Array | number[]) {
    const arr = data instanceof Uint8Array ? data : new Uint8Array(data);
    this.chunks.push(arr);
    this.totalSize += arr.length;
  }

  addWord(val: number) {
    const buf = new Uint8Array(2);
    new DataView(buf.buffer).setUint16(0, val, true);
    this.chunks.push(buf);
    this.totalSize += 2;
  }

  addShort(val: number) {
    const buf = new Uint8Array(2);
    new DataView(buf.buffer).setInt16(0, val, true);
    this.chunks.push(buf);
    this.totalSize += 2;
  }

  addDword(val: number) {
    const buf = new Uint8Array(4);
    new DataView(buf.buffer).setUint32(0, val, true);
    this.chunks.push(buf);
    this.totalSize += 4;
  }

  addString(str: string) {
    const encoder = new TextEncoder();
    const bytes = encoder.encode(str);
    this.addWord(bytes.length);
    this.addBytes(bytes);
  }

  build(): Uint8Array {
    const result = new Uint8Array(this.totalSize);
    let offset = 0;
    for (const chunk of this.chunks) {
      result.set(chunk, offset);
      offset += chunk.length;
    }
    return result;
  }

  getSize(): number {
    return this.totalSize;
  }
}

export const generateAseprite = async (
  animKey: string,
  animDef: AnimationDefinition,
  parsedData: ParsedData
): Promise<Blob> => {
  const isDirectional = animDef.dir_offset !== 0 || !!animDef.sequence_by_direction;
  const numDirs = isDirectional ? 8 : 1;

  let maxSteps = 0;
  if (animDef.sequence_by_direction) {
    for (const seq of Object.values(animDef.sequence_by_direction)) {
      maxSteps = Math.max(maxSteps, seq.length);
    }
  } else if (animDef.sequence) {
    maxSteps = animDef.sequence.length;
  }
  
  let maxLeft = 0, maxRight = 0, maxUp = 0, maxDown = 0, hasFrames = false;
  
  const processFrame = (fIndex: number) => {
    if (fIndex < 0 || fIndex >= parsedData.frames.length) return;
    const f = parsedData.frames[fIndex];
    const b = getFrameBounds(f);
    if (b.maxX === -Infinity) return;
    hasFrames = true;
    maxLeft = Math.max(maxLeft, Math.abs(b.minX));
    maxRight = Math.max(maxRight, Math.abs(b.maxX));
    maxUp = Math.max(maxUp, Math.abs(b.minY));
    maxDown = Math.max(maxDown, Math.abs(b.maxY));
  };

  for (let d = 0; d < numDirs; d++) {
    const seq = animDef.sequence_by_direction?.[d.toString()] || animDef.sequence || [];
    for (let s = 0; s < seq.length; s++) {
      const step = seq[s];
      let fIndex = -1;
      if (step.frame_source === 'duck' && animDef.duck_frame) {
        fIndex = (animDef.duck_frame + (step.frame_offset || 0)) - 1;
      } else if (step.frame_absolute !== undefined) {
        fIndex = step.frame_absolute - 1;
      } else {
        const base = animDef.base_frame + (d * (animDef.dir_offset || 0));
        fIndex = (base + (step.frame_offset || 0)) - 1;
      }
      processFrame(fIndex);
    }
  }

  const PADDING = 2;
  if (!hasFrames) { maxLeft = 16; maxRight = 16; maxUp = 16; maxDown = 16; }
  
  const halfWidth = Math.max(maxLeft, maxRight) + PADDING;
  const halfHeight = Math.max(maxUp, maxDown) + PADDING;
  const width = halfWidth * 2;
  const height = halfHeight * 2;
  const originX = halfWidth;
  const originY = halfHeight;

  const fileBuilder = new BufferBuilder();

  // --- FILE HEADER (128 bytes) ---
  fileBuilder.addDword(0); 
  fileBuilder.addWord(ASE_MAGIC);
  fileBuilder.addWord(maxSteps);
  fileBuilder.addWord(width);
  fileBuilder.addWord(height);
  fileBuilder.addWord(COLOR_DEPTH_8BPP);
  fileBuilder.addDword(1); 
  fileBuilder.addWord(100); 
  fileBuilder.addDword(0);
  fileBuilder.addDword(0);
  fileBuilder.addBytes([0]); // Transparent index (0)
  fileBuilder.addBytes(new Uint8Array(3)); 
  fileBuilder.addWord(256); // Number of colors
  fileBuilder.addBytes([1, 1]); 
  fileBuilder.addShort(0); 
  fileBuilder.addShort(0); 
  fileBuilder.addWord(16); 
  fileBuilder.addWord(16); 
  fileBuilder.addBytes(new Uint8Array(84)); 

  for (let frameIdx = 0; frameIdx < maxSteps; frameIdx++) {
    const frameBuilder = new BufferBuilder();
    let chunkCount = 0;

    // --- Palette Chunk (Only on Frame 0) ---
    if (frameIdx === 0) {
      chunkCount++;
      const palBuilder = new BufferBuilder();
      palBuilder.addDword(0); // Size
      palBuilder.addWord(CHUNK_PALETTE);
      palBuilder.addDword(256); // Palette size
      palBuilder.addDword(0); // First index
      palBuilder.addDword(255); // Last index
      palBuilder.addBytes(new Uint8Array(8)); // Reserved

      // Add the 64 colors from the 4 Genesis palette lines
      for (let line = 0; line < 4; line++) {
        for (let i = 0; i < 16; i++) {
          const color = parsedData.palettes[line][i] || [0,0,0,0];
          palBuilder.addWord(0); // Flags
          palBuilder.addBytes([color[0], color[1], color[2], color[3]]); // RGBA
        }
      }
      // Fill remaining 192 slots with black/transparent
      for (let i = 64; i < 256; i++) {
        palBuilder.addWord(0);
        palBuilder.addBytes([0, 0, 0, 0]);
      }

      const palData = palBuilder.build();
      new DataView(palData.buffer).setUint32(0, palData.length, true);
      frameBuilder.addBytes(palData);

      // --- Add Layer Chunks ---
      for (let d = 0; d < numDirs; d++) {
        chunkCount++;
        const layerBuilder = new BufferBuilder();
        layerBuilder.addDword(0);
        layerBuilder.addWord(CHUNK_LAYER);
        layerBuilder.addWord(1);
        layerBuilder.addWord(LAYER_TYPE_NORMAL);
        layerBuilder.addWord(0);
        layerBuilder.addWord(0);
        layerBuilder.addWord(0);
        layerBuilder.addWord(BLEND_NORMAL);
        layerBuilder.addBytes([255]);
        layerBuilder.addBytes([0, 0, 0]);
        layerBuilder.addString(isDirectional ? DIR_NAMES[d] : "Animation");
        const layerData = layerBuilder.build();
        new DataView(layerData.buffer).setUint32(0, layerData.length, true);
        frameBuilder.addBytes(layerData);
      }
    }

    // --- Add Cel Chunks ---
    for (let d = 0; d < numDirs; d++) {
      const seq = animDef.sequence_by_direction?.[d.toString()] || animDef.sequence || [];
      if (frameIdx >= seq.length) continue;

      const step = seq[frameIdx];
      let gameFrameIdx = -1;
      if (step.frame_source === 'duck' && animDef.duck_frame) {
        gameFrameIdx = (animDef.duck_frame + (step.frame_offset || 0)) - 1;
      } else if (step.frame_absolute !== undefined) {
        gameFrameIdx = step.frame_absolute - 1;
      } else {
        const base = animDef.base_frame + (d * (animDef.dir_offset || 0));
        gameFrameIdx = (base + (step.frame_offset || 0)) - 1;
      }

      const frame = parsedData.frames[gameFrameIdx];
      if (!frame) continue;

      const celPixels = new Uint8Array(width * height);
      drawFrameIndexed(celPixels, width, height, frame, parsedData.tileData, parsedData.tileCount, originX, originY);

      chunkCount++;
      const celBuilder = new BufferBuilder();
      celBuilder.addDword(0);
      celBuilder.addWord(CHUNK_CEL);
      celBuilder.addWord(d); // Layer Index
      celBuilder.addShort(0);
      celBuilder.addShort(0);
      celBuilder.addBytes([255]);
      celBuilder.addWord(CEL_TYPE_RAW);
      celBuilder.addBytes(new Uint8Array(7));
      celBuilder.addWord(width);
      celBuilder.addWord(height);
      celBuilder.addBytes(celPixels); // 8-bit indexed pixels

      const celData = celBuilder.build();
      new DataView(celData.buffer).setUint32(0, celData.length, true);
      frameBuilder.addBytes(celData);
    }

    const frameData = frameBuilder.build();
    const frameHeaderBuilder = new BufferBuilder();
    frameHeaderBuilder.addDword(frameData.length + 16);
    frameHeaderBuilder.addWord(FRAME_MAGIC);
    frameHeaderBuilder.addWord(chunkCount);
    
    let duration = 100;
    const refSeq = animDef.sequence_by_direction?.["2"] || animDef.sequence;
    if (refSeq && refSeq[frameIdx]) {
        const ticks = Math.abs(refSeq[frameIdx].ticks);
        duration = Math.max(1, Math.round(ticks * (1000/60)));
    }
    frameHeaderBuilder.addWord(duration);
    frameHeaderBuilder.addBytes([0, 0]);
    frameHeaderBuilder.addDword(chunkCount);

    fileBuilder.addBytes(frameHeaderBuilder.build());
    fileBuilder.addBytes(frameData);
  }

  const finalBuffer = fileBuilder.build();
  new DataView(finalBuffer.buffer).setUint32(0, finalBuffer.length, true);
  return new Blob([finalBuffer], { type: 'application/octet-stream' });
};

export const generateAsepriteFromRange = async (
  parsedData: ParsedData,
  startFrameIndex: number,
  endFrameIndex: number
): Promise<Blob> => {
  const start = Math.max(0, startFrameIndex);
  const end = Math.min(parsedData.frames.length - 1, endFrameIndex);
  const numFrames = end - start + 1;
  if (numFrames <= 0) throw new Error("Invalid frame range");

  let maxLeft = 0, maxRight = 0, maxUp = 0, maxDown = 0, hasFrames = false;
  for (let i = start; i <= end; i++) {
    const f = parsedData.frames[i];
    const b = getFrameBounds(f);
    if (b.maxX === -Infinity) continue;
    hasFrames = true;
    maxLeft = Math.max(maxLeft, Math.abs(b.minX));
    maxRight = Math.max(maxRight, Math.abs(b.maxX));
    maxUp = Math.max(maxUp, Math.abs(b.minY));
    maxDown = Math.max(maxDown, Math.abs(b.maxY));
  }

  const PADDING = 2;
  if (!hasFrames) { maxLeft = 16; maxRight = 16; maxUp = 16; maxDown = 16; }
  const halfWidth = Math.max(maxLeft, maxRight) + PADDING;
  const halfHeight = Math.max(maxUp, maxDown) + PADDING;
  const width = halfWidth * 2;
  const height = halfHeight * 2;
  const originX = halfWidth;
  const originY = halfHeight;

  const fileBuilder = new BufferBuilder();
  fileBuilder.addDword(0); 
  fileBuilder.addWord(ASE_MAGIC);
  fileBuilder.addWord(numFrames);
  fileBuilder.addWord(width);
  fileBuilder.addWord(height);
  fileBuilder.addWord(COLOR_DEPTH_8BPP);
  fileBuilder.addDword(1); 
  fileBuilder.addWord(100); 
  fileBuilder.addDword(0);
  fileBuilder.addDword(0);
  fileBuilder.addBytes([0]); 
  fileBuilder.addBytes(new Uint8Array(3)); 
  fileBuilder.addWord(256); 
  fileBuilder.addBytes([1, 1]); 
  fileBuilder.addShort(0); 
  fileBuilder.addShort(0); 
  fileBuilder.addWord(16); 
  fileBuilder.addWord(16); 
  fileBuilder.addBytes(new Uint8Array(84)); 

  for (let i = 0; i < numFrames; i++) {
    const currentFrameIdx = start + i;
    const frame = parsedData.frames[currentFrameIdx];
    const frameBuilder = new BufferBuilder();
    let chunkCount = 0;

    if (i === 0) {
      // Palette Chunk
      chunkCount++;
      const palBuilder = new BufferBuilder();
      palBuilder.addDword(0);
      palBuilder.addWord(CHUNK_PALETTE);
      palBuilder.addDword(256);
      palBuilder.addDword(0);
      palBuilder.addDword(255);
      palBuilder.addBytes(new Uint8Array(8));
      for (let line = 0; line < 4; line++) {
        for (let j = 0; j < 16; j++) {
          const color = parsedData.palettes[line][j] || [0,0,0,0];
          palBuilder.addWord(0);
          palBuilder.addBytes([color[0], color[1], color[2], color[3]]);
        }
      }
      for (let j = 64; j < 256; j++) {
        palBuilder.addWord(0);
        palBuilder.addBytes([0,0,0,0]);
      }
      const palData = palBuilder.build();
      new DataView(palData.buffer).setUint32(0, palData.length, true);
      frameBuilder.addBytes(palData);

      // Layer Chunk
      chunkCount++;
      const layerBuilder = new BufferBuilder();
      layerBuilder.addDword(0);
      layerBuilder.addWord(CHUNK_LAYER);
      layerBuilder.addWord(1);
      layerBuilder.addWord(LAYER_TYPE_NORMAL);
      layerBuilder.addWord(0);
      layerBuilder.addWord(0);
      layerBuilder.addWord(0);
      layerBuilder.addWord(BLEND_NORMAL);
      layerBuilder.addBytes([255]);
      layerBuilder.addBytes([0, 0, 0]);
      layerBuilder.addString("Raw Frames");
      const layerData = layerBuilder.build();
      new DataView(layerData.buffer).setUint32(0, layerData.length, true);
      frameBuilder.addBytes(layerData);
    }

    const celPixels = new Uint8Array(width * height);
    if (frame) {
        drawFrameIndexed(celPixels, width, height, frame, parsedData.tileData, parsedData.tileCount, originX, originY);
    }

    chunkCount++;
    const celBuilder = new BufferBuilder();
    celBuilder.addDword(0);
    celBuilder.addWord(CHUNK_CEL);
    celBuilder.addWord(0);
    celBuilder.addShort(0);
    celBuilder.addShort(0);
    celBuilder.addBytes([255]);
    celBuilder.addWord(CEL_TYPE_RAW);
    celBuilder.addBytes(new Uint8Array(7));
    celBuilder.addWord(width);
    celBuilder.addWord(height);
    celBuilder.addBytes(celPixels);
    const celData = celBuilder.build();
    new DataView(celData.buffer).setUint32(0, celData.length, true);
    frameBuilder.addBytes(celData);

    const frameData = frameBuilder.build();
    const frameHeaderBuilder = new BufferBuilder();
    frameHeaderBuilder.addDword(frameData.length + 16);
    frameHeaderBuilder.addWord(FRAME_MAGIC);
    frameHeaderBuilder.addWord(chunkCount);
    frameHeaderBuilder.addWord(100); 
    frameHeaderBuilder.addBytes([0, 0]);
    frameHeaderBuilder.addDword(chunkCount);
    fileBuilder.addBytes(frameHeaderBuilder.build());
    fileBuilder.addBytes(frameData);
  }

  const finalBuffer = fileBuilder.build();
  new DataView(finalBuffer.buffer).setUint32(0, finalBuffer.length, true);
  return new Blob([finalBuffer], { type: 'application/octet-stream' });
};
