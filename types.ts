export interface Sprite {
  x: number;
  y: number;
  w: number; // width in tiles
  h: number; // height in tiles
  tile: number; // 15-bit tile index
  pal: number; // palette line (0-3)
  fh: boolean; // flip horizontal
  fv: boolean; // flip vertical
}

export interface Frame {
  index: number;
  offset: number;
  sprites: Sprite[];
  hotspotX: number;
  hotspotY: number;
}

export interface ParsedData {
  frames: Frame[];
  tileData: Uint8Array;
  tileCount: number;
  palettes: number[][][]; // [paletteLine][colorIndex] -> [r, g, b, a]
}

export interface RenderingContext {
  frame: Frame;
  tileData: Uint8Array;
  tileCount: number;
  palettes: number[][][];
  scale: number;
}

// Animation Types

export interface AnimationStep {
  frame_offset?: number;
  frame_absolute?: number;
  frame_source?: string; // e.g., "duck"
  ticks: number;
}

export interface AnimationDefinition {
  description: string;
  base_frame: number;
  dir_offset: number;
  looping: boolean;
  sequence?: AnimationStep[];
  sequence_by_direction?: Record<string, AnimationStep[]>;
  directions_used?: number[];
  duck_frame?: number;
  note?: string;
}

export interface AnimationData {
  metadata: any;
  frame_definitions: Record<string, any>;
  animations: Record<string, AnimationDefinition>;
  direction_mapping: Record<string, { name: string; description: string; arrow: string }>;
  usage_example: any;
}
