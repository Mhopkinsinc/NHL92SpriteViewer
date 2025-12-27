import React, { useState, useEffect, useRef, useCallback } from 'react';
import { parseSpritesAnim, parsePaletteText } from './services/parser';
import { SpriteViewer } from './components/SpriteViewer';
import { ParsedData, AnimationStep } from './types';
import { ANIMATION_DATA } from './data/animations';
import { PALETTE_TEXT } from './constants';
import { generateAseprite, generateAsepriteFromRange } from './services/aseprite';
import { ArrowLeft, ArrowRight, Play, Square, Upload, ZoomIn, ZoomOut, Compass, Eye, List, RotateCcw, Search, X, Download, Palette } from 'lucide-react';

const App: React.FC = () => {
  const [data, setData] = useState<ParsedData | null>(null);
  const [scale, setScale] = useState(3);
  const [isPlaying, setIsPlaying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [bgColor, setBgColor] = useState('#90FCFC'); // Default to NHL 92 Ice Color (0xEE8 -> RGB 144,252,252)
  const [isExporting, setIsExporting] = useState(false);
  const [paletteText, setPaletteText] = useState(PALETTE_TEXT);

  // Mode: 'raw' for inspecting frames manually, 'anim' for playing predefined animations
  const [viewMode, setViewMode] = useState<'raw' | 'anim'>('anim');

  // --- RAW MODE STATE ---
  const [frameIndex, setFrameIndex] = useState(0);
  const [playbackSpeed, setPlaybackSpeed] = useState(500); // ms per frame (Default 2 FPS)
  const [exportStartFrame, setExportStartFrame] = useState(1);
  const [exportEndFrame, setExportEndFrame] = useState(1);

  // --- ANIMATION MODE STATE ---
  const [selectedAnimKey, setSelectedAnimKey] = useState<string>('SPAskatewp');
  const [direction, setDirection] = useState<number>(2); // Default to East (2)
  const [animStepIndex, setAnimStepIndex] = useState(0);
  const [animFrameIndex, setAnimFrameIndex] = useState(0);
  const [animSpeed, setAnimSpeed] = useState(0.3); // Speed multiplier (Default 0.3x)
  const [searchQuery, setSearchQuery] = useState('');
  
  // Game loop refs
  const playTimerRef = useRef<number | null>(null);
  const animationTickRef = useRef<number>(0);
  const currentStepRef = useRef<number>(0);

  // Reactive Palette Update
  useEffect(() => {
    if (data) {
      try {
        const newPalettes = parsePaletteText(paletteText);
        setData(prev => prev ? { ...prev, palettes: newPalettes } : null);
      } catch (e) {
        console.error("Invalid palette format entered", e);
      }
    }
  }, [paletteText]);

  const processFile = async (file: File) => {
    setError(null);
    try {
      const buffer = await file.arrayBuffer();
      const parsed = parseSpritesAnim(buffer);
      if (parsed.frames.length === 0) {
        throw new Error("No frames found. Is this a valid Sprites.anim file?");
      }
      
      // Override parsed default palette with current editor state
      parsed.palettes = parsePaletteText(paletteText);
      
      setData(parsed);
      setFrameIndex(0);
      setExportStartFrame(1);
      setExportEndFrame(parsed.frames.length);
      setIsPlaying(false);
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "Failed to parse file");
      setData(null);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) processFile(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.relatedTarget && e.currentTarget.contains(e.relatedTarget as Node)) {
      return;
    }
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  };

  const handleExportAseprite = async () => {
    if (!data) return;
    
    try {
      setIsExporting(true);
      const animDef = ANIMATION_DATA.animations[selectedAnimKey];
      const blob = await generateAseprite(selectedAnimKey, animDef, data);
      
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${selectedAnimKey}.aseprite`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error(e);
      setError("Failed to generate Aseprite file");
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportRawAseprite = async () => {
    if (!data) return;
    try {
      setIsExporting(true);
      const start = exportStartFrame - 1;
      const end = exportEndFrame - 1;
      const blob = await generateAsepriteFromRange(data, start, end);
      
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `frames_${exportStartFrame}-${exportEndFrame}.aseprite`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error(e);
      setError("Failed to generate Aseprite file");
    } finally {
      setIsExporting(false);
    }
  };

  const stopAnimation = useCallback(() => {
    if (playTimerRef.current) {
      window.clearInterval(playTimerRef.current);
      playTimerRef.current = null;
    }
    setIsPlaying(false);
  }, []);

  const togglePlay = () => {
    if (isPlaying) {
      stopAnimation();
    } else {
      setIsPlaying(true);
    }
  };

  // --- GAME LOOP (RAW MODE) ---
  useEffect(() => {
    if (viewMode === 'raw' && isPlaying && data) {
      playTimerRef.current = window.setInterval(() => {
        setFrameIndex((prev) => (prev + 1) % data.frames.length);
      }, playbackSpeed);
    }
    return () => {
      if (playTimerRef.current && viewMode === 'raw') clearInterval(playTimerRef.current);
    };
  }, [viewMode, isPlaying, data, playbackSpeed]);

  // --- GAME LOOP (ANIMATION MODE) ---
  // Run at ~60Hz (16.67ms) * Speed Multiplier
  useEffect(() => {
    if (viewMode === 'anim' && isPlaying && data) {
      
      const animDef = ANIMATION_DATA.animations[selectedAnimKey];
      let sequence: AnimationStep[] = [];
      
      if (animDef.sequence_by_direction && animDef.sequence_by_direction[direction.toString()]) {
        sequence = animDef.sequence_by_direction[direction.toString()];
      } else if (animDef.sequence) {
        sequence = animDef.sequence;
      }

      if (!sequence || sequence.length === 0) return;

      // Initialize if just started
      if (playTimerRef.current === null) {
        animationTickRef.current = Math.abs(sequence[currentStepRef.current].ticks);
      }

      const intervalMs = 1000 / (60 * animSpeed);

      playTimerRef.current = window.setInterval(() => {
        // Decrement ticks
        animationTickRef.current -= 1;

        if (animationTickRef.current <= 0) {
           const currentStep = sequence[currentStepRef.current];
           const ticksVal = currentStep.ticks;

           // Check if we need to loop or stop
           if (ticksVal < 0) {
             // Negative ticks indicate end of sequence (or loop point)
             if (animDef.looping) {
               currentStepRef.current = 0;
             } else {
               // Animation finished
               stopAnimation();
               // Reset to start for next playback, but maintain current view on last frame
               currentStepRef.current = 0;
               return;
             }
           } else {
             // Positive ticks = advance
             currentStepRef.current = (currentStepRef.current + 1) % sequence.length;
           }

           // Reset ticks for next frame
           const nextStep = sequence[currentStepRef.current];
           // Handle hold indefinitely
           if (nextStep.ticks === -4096) {
              animationTickRef.current = 999999;
           } else {
              animationTickRef.current = Math.abs(nextStep.ticks);
           }
        }
        
        // Update UI state for render
        setAnimStepIndex(currentStepRef.current);

      }, intervalMs);
    } else {
      // Reset logic when stopping or changing animations handled in side effects below
    }

    return () => {
      // We clear interval on cleanup, but do NOT set current to null here
      // This allows speed changes to pick up where they left off
      if (playTimerRef.current && viewMode === 'anim') clearInterval(playTimerRef.current);
    };
  }, [viewMode, isPlaying, data, selectedAnimKey, direction, animSpeed, stopAnimation]);

  // Reset animation state when selection changes
  useEffect(() => {
    stopAnimation();
    setAnimStepIndex(0);
    currentStepRef.current = 0;
    animationTickRef.current = 0;
  }, [selectedAnimKey, direction, viewMode, stopAnimation]);

  // Calculate the actual frame index for Animation Mode
  useEffect(() => {
    if (viewMode === 'anim' && data) {
       const animDef = ANIMATION_DATA.animations[selectedAnimKey];
       if (!animDef) return;

       let sequence: AnimationStep[] = [];
       if (animDef.sequence_by_direction && animDef.sequence_by_direction[direction.toString()]) {
         sequence = animDef.sequence_by_direction[direction.toString()];
       } else if (animDef.sequence) {
         sequence = animDef.sequence;
       }

       if (sequence && sequence.length > 0 && sequence[animStepIndex]) {
         const step = sequence[animStepIndex];
         
         // NOTE: JSON animation data uses 1-based indexing.
         // We must subtract 1 from calculations to get the 0-based array index.

         // Special case for 'duck' or other source frames
         if (step.frame_source === 'duck' && animDef.duck_frame) {
            setAnimFrameIndex((animDef.duck_frame + (step.frame_offset || 0)) - 1);
         } 
         // Absolute frame override
         else if (step.frame_absolute !== undefined) {
            setAnimFrameIndex(step.frame_absolute - 1);
         } 
         // Standard calculation
         else {
            const base = animDef.base_frame + (direction * (animDef.dir_offset || 0));
            setAnimFrameIndex((base + (step.frame_offset || 0)) - 1);
         }
       }
    }
  }, [viewMode, data, selectedAnimKey, direction, animStepIndex]);


  const getDisplayFrameIndex = () => {
    if (viewMode === 'raw') return frameIndex;
    return animFrameIndex;
  };

  const currentFrame = data?.frames[getDisplayFrameIndex()];

  const filteredAnimations = Object.keys(ANIMATION_DATA.animations).filter(key => {
    const anim = ANIMATION_DATA.animations[key];
    const query = searchQuery.toLowerCase();
    return key.toLowerCase().includes(query) || anim.description.toLowerCase().includes(query);
  });

  const selectedAnimDef = ANIMATION_DATA.animations[selectedAnimKey];
  const isDirectional = selectedAnimDef.dir_offset !== 0 || !!selectedAnimDef.sequence_by_direction;

  return (
    <div 
      className="min-h-screen bg-gray-950 text-gray-100 flex flex-col font-sans"
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      
      {/* Header */}
      <header className="bg-gray-900 border-b border-gray-800 p-4 shadow-md sticky top-0 z-10">
        <div className="container mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
             <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center font-bold text-white">92</div>
             <h1 className="text-xl font-bold tracking-tight text-white">NHL Hockey Sprite Viewer</h1>
          </div>
          
          <div className="flex items-center gap-4">
             {data && (
               <div className="flex bg-gray-800 rounded-lg p-1 border border-gray-700">
                  <button 
                    onClick={() => setViewMode('anim')}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded text-sm font-medium transition-colors ${viewMode === 'anim' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'}`}
                  >
                    <List size={16} /> Animations
                  </button>
                  <button 
                    onClick={() => setViewMode('raw')}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded text-sm font-medium transition-colors ${viewMode === 'raw' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'}`}
                  >
                    <Eye size={16} /> Raw Inspector
                  </button>
               </div>
             )}

             <label className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-md cursor-pointer transition-colors border border-gray-700 font-medium text-sm">
                <Upload size={16} />
                <span>Load File</span>
                <input type="file" onChange={handleFileUpload} className="hidden" accept=".anim,application/octet-stream" />
             </label>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 container mx-auto p-4 md:p-6 relative">
        
        {error && (
          <div className="mb-6 p-4 bg-red-900/30 border border-red-800 text-red-200 rounded-md text-center">
            {error}
          </div>
        )}

        {/* Empty State / Drop Zone */}
        {!data && !error && (
          <div className={`flex flex-col items-center justify-center h-[60vh] space-y-4 border-dashed rounded-xl transition-all duration-200 
            ${isDragging 
              ? 'border-4 border-blue-500 bg-blue-900/10 text-blue-100' 
              : 'border-2 border-gray-800 bg-gray-900/50 text-gray-500'}`}
          >
            {isDragging ? (
              <>
                <Upload size={64} className="text-blue-400 animate-bounce" />
                <p className="text-3xl font-bold">Drop file to load</p>
              </>
            ) : (
              <>
                <Upload size={48} className="opacity-50" />
                <p className="text-lg">Drag & Drop or upload <code className="text-blue-400 font-mono bg-gray-800 px-2 py-1 rounded">Sprites.anim</code> to begin.</p>
              </>
            )}
          </div>
        )}

        {/* Loaded Data Overlay for Dragging */}
        {data && isDragging && (
           <div className="absolute inset-0 z-50 flex items-center justify-center p-4">
              <div className="w-full h-[60vh] border-4 border-dashed border-blue-500 bg-gray-950/80 backdrop-blur-sm rounded-xl flex flex-col items-center justify-center space-y-4 shadow-2xl">
                 <Upload size={64} className="text-blue-400 animate-bounce" />
                 <div className="text-3xl font-bold text-blue-100">Drop to replace file</div>
              </div>
           </div>
        )}

        {/* Data View */}
        {data && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Left Column: Animation List (Only visible in Anim Mode) */}
            {viewMode === 'anim' && (
              <div className="lg:col-span-1 bg-gray-900 border border-gray-800 rounded-lg flex flex-col h-[600px]">
                 <div className="p-4 border-b border-gray-800 space-y-3">
                    <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Animations</h3>
                    <div className="relative">
                      <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                      <input
                        type="text"
                        placeholder="Search animations..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-gray-950 border border-gray-700 text-gray-200 text-sm rounded-md pl-9 pr-8 py-2 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none placeholder-gray-600 transition-colors"
                      />
                      {searchQuery && (
                        <button 
                          onClick={() => setSearchQuery('')}
                          className="absolute right-2.5 top-2.5 text-gray-500 hover:text-white"
                        >
                          <X size={16} />
                        </button>
                      )}
                    </div>
                 </div>
                 <div className="flex-1 overflow-y-auto p-2 space-y-1">
                    {filteredAnimations.length > 0 ? (
                      filteredAnimations.map((key) => (
                        <button
                          key={key}
                          onClick={() => setSelectedAnimKey(key)}
                          className={`w-full text-left px-3 py-2 rounded text-sm transition-colors ${
                            selectedAnimKey === key 
                              ? 'bg-blue-600 text-white shadow-md' 
                              : 'text-gray-300 hover:bg-gray-800'
                          }`}
                        >
                          <div className="font-medium">{key}</div>
                          <div className={`text-xs truncate ${selectedAnimKey === key ? 'text-blue-200' : 'text-gray-500'}`}>
                            {ANIMATION_DATA.animations[key].description}
                          </div>
                        </button>
                      ))
                    ) : (
                       <div className="flex flex-col items-center justify-center h-40 text-gray-500 text-sm">
                          <Search size={24} className="mb-2 opacity-50" />
                          <p>No animations found</p>
                       </div>
                    )}
                 </div>
              </div>
            )}

            {/* Center/Main Column: Canvas & Controls */}
            <div className={`${viewMode === 'anim' ? 'lg:col-span-1' : 'lg:col-span-2'} space-y-4`}>
              <div 
                className="rounded-xl overflow-hidden min-h-[460px] flex items-center justify-center transition-colors duration-300"
                style={{ backgroundColor: bgColor }}
              >
                {currentFrame ? (
                  <SpriteViewer 
                    frame={currentFrame}
                    tileData={data.tileData}
                    tileCount={data.tileCount}
                    palettes={data.palettes}
                    scale={scale}
                  />
                ) : (
                  <div className="text-red-400 font-mono text-center p-6 bg-red-900/10 rounded-lg">
                    <p className="font-bold text-lg mb-2">Frame Not Found</p>
                    <p>Calculated Frame: #{getDisplayFrameIndex() + 1}</p>
                    <p className="text-sm text-red-500/80 mt-1">(Index {getDisplayFrameIndex()} is out of bounds)</p>
                  </div>
                )}
              </div>

              {/* Playback Controls */}
              <div className="bg-gray-900 border border-gray-800 rounded-lg p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                
                <div className="flex items-center gap-2">
                   {viewMode === 'raw' && (
                     <button 
                      onClick={() => setFrameIndex((prev) => (prev - 1 + data.frames.length) % data.frames.length)}
                      className="p-2 hover:bg-gray-800 rounded text-gray-300 hover:text-white transition-colors"
                     >
                       <ArrowLeft size={20} />
                     </button>
                   )}
                   
                   <button 
                    onClick={togglePlay}
                    className={`flex items-center gap-2 px-4 py-2 rounded-md font-medium transition-all ${
                      isPlaying 
                        ? 'bg-red-900/50 text-red-400 hover:bg-red-900/80' 
                        : 'bg-green-900/50 text-green-400 hover:bg-green-900/80'
                    }`}
                   >
                     {isPlaying ? <Square size={16} fill="currentColor" /> : <Play size={16} fill="currentColor" />}
                     {isPlaying ? 'Stop' : 'Play'}
                   </button>

                   {viewMode === 'raw' && (
                     <button 
                      onClick={() => setFrameIndex((prev) => (prev + 1) % data.frames.length)}
                      className="p-2 hover:bg-gray-800 rounded text-gray-300 hover:text-white transition-colors"
                     >
                       <ArrowRight size={20} />
                     </button>
                   )}
                </div>

                {viewMode === 'raw' && (
                  <div className="flex items-center gap-4 w-full sm:w-auto">
                     <div className="flex items-center gap-2 bg-gray-800 px-3 py-1.5 rounded-md">
                        <span className="text-xs text-gray-400 uppercase tracking-wider font-bold">Frame</span>
                        <input 
                          type="number"
                          min="1"
                          max={data.frames.length}
                          value={frameIndex + 1}
                          onChange={(e) => {
                            const val = parseInt(e.target.value);
                            if (!isNaN(val)) {
                              setFrameIndex(Math.max(0, Math.min(val - 1, data.frames.length - 1)));
                            }
                          }}
                          className="w-16 bg-gray-700 text-white px-2 py-0.5 rounded text-sm font-mono border border-gray-600 focus:border-blue-500 outline-none text-center"
                        />
                     </div>

                     <div className="flex items-center gap-2 bg-gray-800 px-3 py-1.5 rounded-md">
                       <span className="text-xs text-gray-400 uppercase tracking-wider font-bold">FPS</span>
                       <input 
                         type="range" 
                         min="10" 
                         max="500" 
                         step="10"
                         value={playbackSpeed}
                         onChange={(e) => setPlaybackSpeed(Number(e.target.value))}
                         className="w-24 accent-blue-500 h-1.5 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                       />
                       <span className="text-xs w-8 text-right font-mono">{(1000/playbackSpeed).toFixed(0)}</span>
                     </div>
                  </div>
                )}

                {viewMode === 'anim' && (
                  <div className="flex items-center gap-4 w-full sm:w-auto">
                     <div className="flex items-center gap-2 bg-gray-800 px-3 py-1.5 rounded-md">
                       <span className="text-xs text-gray-400 uppercase tracking-wider font-bold">Speed</span>
                       <input 
                         type="range" 
                         min="0.1" 
                         max="2.0" 
                         step="0.1"
                         value={animSpeed}
                         onChange={(e) => setAnimSpeed(Number(e.target.value))}
                         className="w-24 accent-blue-500 h-1.5 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                       />
                       <span className="text-xs w-10 text-right font-mono">{animSpeed.toFixed(1)}x</span>
                     </div>
                  </div>
                )}
              </div>
            </div>

            {/* Right Column: Details & Direction Pad */}
            <div className="space-y-4 lg:col-span-1">
              
              {viewMode === 'anim' && (
                <div className="bg-gray-900 border border-gray-800 rounded-lg p-5">
                   <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4 border-b border-gray-800 pb-2 flex items-center gap-2">
                      <Compass size={16} /> Direction
                   </h3>
                   
                   {isDirectional ? (
                     <>
                       <div className="flex justify-center mb-4">
                         <div className="grid grid-cols-3 gap-2">
                            {[7, 0, 1, 6, -1, 2, 5, 4, 3].map((dir, i) => (
                              dir === -1 ? (
                                <div key="center" className="w-10 h-10 flex items-center justify-center text-gray-600 font-bold"></div>
                              ) : (
                                <button
                                  key={dir}
                                  onClick={() => setDirection(dir)}
                                  className={`w-10 h-10 rounded-md flex items-center justify-center font-bold transition-all ${
                                    direction === dir 
                                      ? 'bg-blue-600 text-white shadow-lg scale-110' 
                                      : 'bg-gray-800 text-gray-400 hover:text-gray-200'
                                  }`}
                                  title={ANIMATION_DATA.direction_mapping[dir.toString()].name}
                                >
                                  {ANIMATION_DATA.direction_mapping[dir.toString()].arrow}
                                </button>
                              )
                            ))}
                         </div>
                       </div>
                       
                       <div className="text-center text-sm text-gray-400">
                         {ANIMATION_DATA.direction_mapping[direction.toString()].name}
                       </div>
                     </>
                   ) : (
                      <div className="flex flex-col items-center justify-center py-6 text-gray-500">
                         <div className="bg-gray-800 p-3 rounded-full mb-3 opacity-50">
                           <Square size={24} />
                         </div>
                         <p className="text-sm font-medium">Single View</p>
                         <p className="text-xs text-gray-600 mt-1">Non-directional animation</p>
                      </div>
                   )}
                </div>
              )}

              {/* Palette Settings Card */}
              <div className="bg-gray-900 border border-gray-800 rounded-lg p-5">
                <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4 border-b border-gray-800 pb-2 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Palette size={16} /> Palette Editor
                  </div>
                  <button 
                    onClick={() => setPaletteText(PALETTE_TEXT)}
                    className="text-[10px] bg-gray-800 hover:bg-gray-700 px-2 py-0.5 rounded text-gray-400 hover:text-white transition-colors"
                  >
                    Reset Defaults
                  </button>
                </h3>
                <div className="space-y-2">
                  <p className="text-[10px] text-gray-500 leading-tight">
                    Paste 4 rows of 16 colors (0x0BGR hex format). 
                    Each line represents one palette line.
                  </p>
                  <textarea
                    value={paletteText}
                    onChange={(e) => setPaletteText(e.target.value)}
                    className="w-full h-32 bg-gray-950 border border-gray-700 rounded p-2 text-[10px] font-mono text-gray-300 focus:ring-1 focus:ring-blue-500 outline-none resize-none"
                    placeholder="EE8 EEE EEC CCC..."
                    spellCheck={false}
                  />
                </div>
              </div>

              {/* Frame Info Card */}
              <div className="bg-gray-900 border border-gray-800 rounded-lg p-5">
                <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4 border-b border-gray-800 pb-2">
                  Stats
                </h3>
                <div className="space-y-3 font-mono text-sm">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500">Frame #</span>
                    <span className="text-white text-lg font-bold">
                      {getDisplayFrameIndex() + 1} <span className="text-gray-600 text-sm font-normal">/ {data.frames.length}</span>
                    </span>
                  </div>
                  {viewMode === 'anim' && (
                     <>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Step</span>
                          <span className="text-white">{animStepIndex}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Looping</span>
                          <span className={ANIMATION_DATA.animations[selectedAnimKey].looping ? "text-green-400" : "text-gray-400"}>
                             {ANIMATION_DATA.animations[selectedAnimKey].looping ? 'Yes' : 'No'}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Speed</span>
                          <span className="text-white">{animSpeed.toFixed(2)}x</span>
                        </div>
                     </>
                  )}
                  <div className="flex justify-between">
                    <span className="text-gray-500">Sprite Count</span>
                    <span className="text-white">{currentFrame?.sprites.length ?? '-'}</span>
                  </div>
                   <div className="flex justify-between">
                    <span className="text-gray-500">Hotspot</span>
                    <span className="text-gray-400 font-mono text-xs">
                       {currentFrame ? `X:${currentFrame.hotspotX} Y:${currentFrame.hotspotY}` : '-'}
                    </span>
                  </div>
                </div>
              </div>
              
              {/* Actions Card */}
              {viewMode === 'anim' && (
                <div className="bg-gray-900 border border-gray-800 rounded-lg p-5">
                   <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4 border-b border-gray-800 pb-2">
                     Actions
                   </h3>
                   <button 
                    onClick={handleExportAseprite}
                    disabled={isExporting}
                    className="w-full flex items-center justify-center gap-2 bg-blue-700 hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed text-white py-2 px-4 rounded-md transition-colors shadow-sm"
                   >
                     {isExporting ? (
                       <div className="w-4 h-4 border-2 border-white/50 border-t-white rounded-full animate-spin"></div>
                     ) : (
                       <Download size={16} />
                     )}
                     <span>Export .aseprite</span>
                   </button>
                   <p className="text-xs text-gray-500 mt-2 text-center">
                     {isDirectional 
                       ? "Exports all 8 directions as separate layers." 
                       : "Exports animation as a single layer."}
                   </p>
                </div>
              )}

              {/* Export Range Card (Raw Mode) */}
              {viewMode === 'raw' && (
                <div className="bg-gray-900 border border-gray-800 rounded-lg p-5">
                    <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4 border-b border-gray-800 pb-2">
                      Export Frames
                    </h3>
                    <div className="space-y-4">
                      <div className="flex items-center gap-2">
                         <div className="flex-1">
                           <label className="text-xs text-gray-500 block mb-1">Start Frame</label>
                           <input 
                              type="number" 
                              min="1" 
                              max={data.frames.length}
                              value={exportStartFrame}
                              onChange={(e) => setExportStartFrame(Math.min(data.frames.length, Math.max(1, parseInt(e.target.value) || 1)))}
                              className="w-full bg-gray-800 border border-gray-700 rounded px-2 py-1 text-sm focus:border-blue-500 outline-none text-white"
                           />
                         </div>
                         <span className="text-gray-600 pt-5">-</span>
                         <div className="flex-1">
                           <label className="text-xs text-gray-500 block mb-1">End Frame</label>
                           <input 
                              type="number" 
                              min="1" 
                              max={data.frames.length}
                              value={exportEndFrame}
                              onChange={(e) => setExportEndFrame(Math.min(data.frames.length, Math.max(1, parseInt(e.target.value) || 1)))}
                              className="w-full bg-gray-800 border border-gray-700 rounded px-2 py-1 text-sm focus:border-blue-500 outline-none text-white"
                           />
                         </div>
                      </div>
                      
                      <button 
                        onClick={handleExportRawAseprite}
                        disabled={isExporting}
                        className="w-full flex items-center justify-center gap-2 bg-blue-700 hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed text-white py-2 px-4 rounded-md transition-colors shadow-sm"
                      >
                        {isExporting ? (
                          <div className="w-4 h-4 border-2 border-white/50 border-t-white rounded-full animate-spin"></div>
                        ) : (
                          <Download size={16} />
                        )}
                        <span>Export Range</span>
                      </button>
                    </div>
                </div>
              )}

              {/* View Settings */}
              <div className="bg-gray-900 border border-gray-800 rounded-lg p-5">
                <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4 border-b border-gray-800 pb-2">
                  View Settings
                </h3>
                
                <div className="flex items-center justify-between mb-2">
                   <span className="text-gray-400 text-sm">Background</span>
                   <div className="flex items-center gap-2">
                      <input 
                        type="color" 
                        value={bgColor}
                        onChange={(e) => setBgColor(e.target.value)}
                        className="w-6 h-6 rounded cursor-pointer border-0 p-0 bg-transparent"
                        title="Change Background Color"
                      />
                      <button 
                        onClick={() => setBgColor('#90FCFC')}
                        className="p-1 hover:bg-gray-800 rounded text-gray-400 hover:text-white"
                        title="Reset to Ice Color"
                      >
                        <RotateCcw size={14} />
                      </button>
                   </div>
                </div>

                <div className="flex items-center justify-between mb-2">
                   <span className="text-gray-400 text-sm">Scale ({scale}x)</span>
                   <div className="flex gap-1">
                      <button 
                        onClick={() => setScale(Math.max(1, scale - 1))}
                        className="p-1 hover:bg-gray-800 rounded text-gray-400 hover:text-white"
                      >
                        <ZoomOut size={16} />
                      </button>
                      <button 
                        onClick={() => setScale(Math.min(10, scale + 1))}
                        className="p-1 hover:bg-gray-800 rounded text-gray-400 hover:text-white"
                      >
                        <ZoomIn size={16} />
                      </button>
                   </div>
                </div>
              </div>

            </div>
          </div>
        )}
      </main>

      <footer className="bg-gray-900 border-t border-gray-800 p-4 text-center text-gray-600 text-xs">
         <p>Processed entirely in-browser. No data sent to server.</p>
      </footer>
    </div>
  );
};

export default App;