import React, { useEffect, useRef, useState } from 'react';
import { renderFrameToCanvas } from '../services/renderer';
import { Frame } from '../types';

interface SpriteViewerProps {
  frame: Frame;
  tileData: Uint8Array;
  tileCount: number;
  palettes: number[][][];
  scale: number;
}

export const SpriteViewer: React.FC<SpriteViewerProps> = ({
  frame,
  tileData,
  tileCount,
  palettes,
  scale,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    renderFrameToCanvas(ctx, {
      frame,
      tileData,
      tileCount,
      palettes,
      scale,
    });

    // Update dimensions state to match the rendered canvas
    setDimensions({ width: canvas.width, height: canvas.height });
  }, [frame, tileData, tileCount, palettes, scale]);

  return (
    <div className="flex flex-col items-center w-full h-[450px]">
      <div className="flex-1 w-full flex items-center justify-center overflow-hidden">
        <canvas
          ref={canvasRef}
          style={{ imageRendering: 'pixelated' }}
        />
      </div>
      <div className="h-6 mt-2 flex items-center justify-center text-xs text-gray-400 font-mono shrink-0">
         Size: {dimensions.width}x{dimensions.height}px
      </div>
    </div>
  );
};