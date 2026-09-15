import { useState, useEffect, useRef, MouseEvent, WheelEvent } from 'react';
import { 
  Sparkles, 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  Clock, 
  Eye, 
  Info, 
  X,
  Compass,
  Star as StarIcon
} from 'lucide-react';
import { constellationsData } from '../data/constellationsData';
import { Constellation, Star } from '../types';

export function ConstellationMap() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // State
  const [selectedConstellation, setSelectedConstellation] = useState<Constellation | null>(constellationsData[0]);
  const [selectedStar, setSelectedStar] = useState<Star | null>(null);
  const [skyRotationHours, setSkyRotationHours] = useState<number>(22); // 22:00 night sky
  const [showLines, setShowLines] = useState<boolean>(true);
  const [showStarNames, setShowStarNames] = useState<boolean>(true);
  const [showDeepSky, setShowDeepSky] = useState<boolean>(true);
  const [seasonFilter, setSeasonFilter] = useState<string>('Все');

  // Camera Pan & Zoom
  const cameraRef = useRef({
    x: 0,
    y: 0,
    zoom: 1.0,
    isDragging: false,
    dragStartX: 0,
    dragStartY: 0
  });

  // Background random ambient stars
  const backgroundStarsRef = useRef<{ x: number; y: number; mag: number; color: string; alpha: number }[]>([]);

  useEffect(() => {
    const bgStars: { x: number; y: number; mag: number; color: string; alpha: number }[] = [];
    const colors = ['#FFFFFF', '#E0F2FE', '#FEF08A', '#FED7AA', '#BAE6FD'];
    for (let i = 0; i < 700; i++) {
      bgStars.push({
        x: (Math.random() - 0.5) * 3000,
        y: (Math.random() - 0.5) * 3000,
        mag: Math.random() * 2 + 0.5,
        color: colors[Math.floor(Math.random() * colors.length)],
        alpha: Math.random() * 0.7 + 0.3
      });
    }
    backgroundStarsRef.current = bgStars;
  }, []);

  // Filtered constellations
  const visibleConstellations = seasonFilter === 'Все'
    ? constellationsData
    : constellationsData.filter(c => c.season === seasonFilter || c.season === 'Всесезонное');

  // Main Canvas Render
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;

    const render = () => {
      canvas.width = containerRef.current?.clientWidth || 800;
      canvas.height = containerRef.current?.clientHeight || 600;

      const width = canvas.width;
      const height = canvas.height;

      // Deep celestial gradient
      ctx.fillStyle = '#060913';
      ctx.fillRect(0, 0, width, height);

      ctx.save();
      ctx.translate(width / 2 + cameraRef.current.x, height / 2 + cameraRef.current.y);
      ctx.scale(cameraRef.current.zoom, cameraRef.current.zoom);

      // Sky diurnal rotation according to the time of night
      const rotationAngle = ((skyRotationHours - 12) / 24) * Math.PI * 2;
      ctx.rotate(rotationAngle);

      // Draw Milky Way faint luminous galactic glow
      const mwGrad = ctx.createLinearGradient(-800, -800, 800, 800);
      mwGrad.addColorStop(0, 'rgba(56, 189, 248, 0)');
      mwGrad.addColorStop(0.4, 'rgba(148, 163, 184, 0.05)');
      mwGrad.addColorStop(0.5, 'rgba(192, 132, 252, 0.07)');
      mwGrad.addColorStop(0.6, 'rgba(148, 163, 184, 0.05)');
      mwGrad.addColorStop(1, 'rgba(56, 189, 248, 0)');
      ctx.fillStyle = mwGrad;
      ctx.fillRect(-1500, -1500, 3000, 3000);

      // Draw Ambient Stars
      backgroundStarsRef.current.forEach(s => {
        ctx.fillStyle = s.color;
        ctx.globalAlpha = s.alpha;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.mag, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.globalAlpha = 1.0;

      // Draw Constellations
      visibleConstellations.forEach(c => {
        const isSelected = selectedConstellation?.id === c.id;

        // Draw Lines
        if (showLines) {
          ctx.strokeStyle = isSelected ? 'rgba(56, 189, 248, 0.85)' : 'rgba(71, 85, 105, 0.45)';
          ctx.lineWidth = isSelected ? 2 : 1;
          ctx.setLineDash(isSelected ? [] : [2, 2]);

          c.lines.forEach(([startIdx, endIdx]) => {
            const startStar = c.stars[startIdx];
            const endStar = c.stars[endIdx];
            if (!startStar || !endStar) return;

            ctx.beginPath();
            ctx.moveTo(startStar.x - 450, startStar.y - 300);
            ctx.lineTo(endStar.x - 450, endStar.y - 300);
            ctx.stroke();
          });
          ctx.setLineDash([]);
        }

        // Draw Deep Sky Objects
        if (showDeepSky && c.deepSkyObjects) {
          c.deepSkyObjects.forEach((dso, idx) => {
            const dsoX = c.centerX - 450 + (idx * 30 - 15);
            const dsoY = c.centerY - 300 + 40;

            // Faint spiral/diffuse nebula representation
            ctx.strokeStyle = 'rgba(236, 72, 153, 0.6)';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.arc(dsoX, dsoY, 7, 0, Math.PI * 2);
            ctx.stroke();

            ctx.fillStyle = 'rgba(236, 72, 153, 0.2)';
            ctx.fill();

            ctx.fillStyle = '#F472B6';
            ctx.font = '9px monospace';
            ctx.textAlign = 'center';
            ctx.fillText(dso.name, dsoX, dsoY + 16);
          });
        }

        // Draw Stars in Constellation
        c.stars.forEach(star => {
          const sx = star.x - 450;
          const sy = star.y - 300;
          const isStarSelected = selectedStar?.id === star.id;

          // Radius derived from stellar magnitude (lower magnitude = brighter/larger)
          const starRadius = Math.max(2.5, (4.0 - star.magnitude) * 1.8);

          // Star Glow
          const glowGrad = ctx.createRadialGradient(sx, sy, 1, sx, sy, starRadius * 3);
          glowGrad.addColorStop(0, star.color);
          glowGrad.addColorStop(0.5, `${star.color}66`);
          glowGrad.addColorStop(1, 'transparent');
          ctx.fillStyle = glowGrad;
          ctx.beginPath();
          ctx.arc(sx, sy, starRadius * 3, 0, Math.PI * 2);
          ctx.fill();

          // Star Core
          ctx.fillStyle = '#FFFFFF';
          ctx.beginPath();
          ctx.arc(sx, sy, starRadius, 0, Math.PI * 2);
          ctx.fill();

          // Diffraction Spike for very bright stars (mag < 1.0)
          if (star.magnitude < 1.0) {
            ctx.strokeStyle = `${star.color}AA`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(sx - starRadius * 2.5, sy);
            ctx.lineTo(sx + starRadius * 2.5, sy);
            ctx.moveTo(sx, sy - starRadius * 2.5);
            ctx.lineTo(sx, sy + starRadius * 2.5);
            ctx.stroke();
          }

          // Star Selection Ring
          if (isStarSelected) {
            ctx.strokeStyle = '#38BDF8';
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.arc(sx, sy, starRadius + 6, 0, Math.PI * 2);
            ctx.stroke();
          }

          // Star Labels
          if (showStarNames) {
            ctx.fillStyle = isStarSelected ? '#38BDF8' : '#CBD5E1';
            ctx.font = isStarSelected ? 'bold 10px sans-serif' : '10px sans-serif';
            ctx.textAlign = 'left';
            ctx.fillText(star.name, sx + starRadius + 4, sy + 3);
          }
        });

        // Constellation Name in Center
        ctx.fillStyle = isSelected ? '#38BDF8' : '#64748B';
        ctx.font = isSelected ? 'bold 13px sans-serif' : '11px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(c.name, c.centerX - 450, c.centerY - 300 - 30);
      });

      ctx.restore();
    };

    render();
    window.addEventListener('resize', render);
    return () => {
      window.removeEventListener('resize', render);
    };
  }, [visibleConstellations, selectedConstellation, selectedStar, skyRotationHours, showLines, showStarNames, showDeepSky]);

  // Click on Star to Inspect
  const handleCanvasClick = (e: MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    // Convert click into world rotated coordinates
    const unscaledX = (clickX - canvas.width / 2 - cameraRef.current.x) / cameraRef.current.zoom;
    const unscaledY = (clickY - canvas.height / 2 - cameraRef.current.y) / cameraRef.current.zoom;

    const rotationAngle = ((skyRotationHours - 12) / 24) * Math.PI * 2;
    // Reverse rotation
    const worldX = unscaledX * Math.cos(-rotationAngle) - unscaledY * Math.sin(-rotationAngle);
    const worldY = unscaledX * Math.sin(-rotationAngle) + unscaledY * Math.cos(-rotationAngle);

    // Find closest star in any constellation
    for (const c of visibleConstellations) {
      for (const star of c.stars) {
        const sx = star.x - 450;
        const sy = star.y - 300;
        const dist = Math.hypot(worldX - sx, worldY - sy);
        if (dist < 16) {
          setSelectedStar(star);
          setSelectedConstellation(c);
          return;
        }
      }
    }

    // Check click near constellation center
    for (const c of visibleConstellations) {
      const cx = c.centerX - 450;
      const cy = c.centerY - 300;
      const dist = Math.hypot(worldX - cx, worldY - cy);
      if (dist < 50) {
        setSelectedConstellation(c);
        setSelectedStar(null);
        return;
      }
    }
  };

  // Dragging to Pan
  const handleMouseDown = (e: MouseEvent<HTMLCanvasElement>) => {
    cameraRef.current.isDragging = true;
    cameraRef.current.dragStartX = e.clientX - cameraRef.current.x;
    cameraRef.current.dragStartY = e.clientY - cameraRef.current.y;
  };

  const handleMouseMove = (e: MouseEvent<HTMLCanvasElement>) => {
    if (!cameraRef.current.isDragging) return;
    cameraRef.current.x = e.clientX - cameraRef.current.dragStartX;
    cameraRef.current.y = e.clientY - cameraRef.current.dragStartY;
    // Re-render
    const canvas = canvasRef.current;
    if (canvas) {
      const evt = new Event('resize');
      window.dispatchEvent(evt);
    }
  };

  const handleMouseUp = () => {
    cameraRef.current.isDragging = false;
  };

  const handleWheel = (e: WheelEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const factor = e.deltaY < 0 ? 1.15 : 0.88;
    cameraRef.current.zoom = Math.min(Math.max(cameraRef.current.zoom * factor, 0.4), 3.5);
    window.dispatchEvent(new Event('resize'));
  };

  const handleZoom = (dir: 'in' | 'out') => {
    const factor = dir === 'in' ? 1.25 : 0.8;
    cameraRef.current.zoom = Math.min(Math.max(cameraRef.current.zoom * factor, 0.4), 3.5);
    window.dispatchEvent(new Event('resize'));
  };

  const handleResetCamera = () => {
    cameraRef.current.x = 0;
    cameraRef.current.y = 0;
    cameraRef.current.zoom = 1.0;
    window.dispatchEvent(new Event('resize'));
  };

  return (
    <div className="relative w-full h-[calc(100vh-65px)] overflow-hidden flex flex-col bg-[#060913]">
      
      {/* Top Filter and Constellation Carousel */}
      <div className="z-10 bg-[#0B0F19]/85 backdrop-blur border-b border-slate-800 px-4 py-2 flex items-center justify-between gap-3 overflow-x-auto no-scrollbar">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider hidden sm:inline">
            Сезон:
          </span>
          {['Все', 'Зима', 'Весна', 'Лето', 'Осень'].map(s => (
            <button
              key={s}
              onClick={() => setSeasonFilter(s)}
              className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
                seasonFilter === s
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                  : 'bg-slate-800/40 text-slate-400 hover:text-slate-200 border border-transparent'
              }`}
            >
              {s}
            </button>
          ))}
        </div>

        {/* List of Constellations */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          {visibleConstellations.map(c => {
            const isSelected = selectedConstellation?.id === c.id;
            return (
              <button
                key={c.id}
                onClick={() => {
                  setSelectedConstellation(c);
                  setSelectedStar(null);
                }}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                  isSelected
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                    : 'bg-slate-800/40 text-slate-400 hover:text-slate-200 border border-slate-700/40'
                }`}
              >
                <Sparkles className="w-3 h-3 text-cyan-400" />
                <span>{c.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Canvas Area */}
      <div ref={containerRef} className="relative flex-1 w-full h-full cursor-grab active:cursor-grabbing select-none">
        <canvas
          ref={canvasRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onWheel={handleWheel}
          onClick={handleCanvasClick}
          className="w-full h-full block"
        />

        {/* Bottom Diurnal Sky Rotation & Zoom Dock */}
        <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-20 bg-[#0F172A]/90 backdrop-blur-md border border-slate-700/70 rounded-2xl px-4 py-2.5 flex items-center gap-4 shadow-xl">
          
          {/* Time of night slider */}
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-cyan-400" />
            <span className="text-xs font-mono text-slate-300">
              {String(Math.floor(skyRotationHours)).padStart(2, '0')}:00
            </span>
            <input
              type="range"
              min="0"
              max="24"
              step="0.5"
              value={skyRotationHours}
              onChange={(e) => setSkyRotationHours(parseFloat(e.target.value))}
              className="w-28 sm:w-40 accent-cyan-400 cursor-pointer"
              title="Суточное вращение небесной сферы"
            />
          </div>

          {/* Zoom controls */}
          <div className="flex items-center gap-1 border-l border-slate-700 pl-3">
            <button
              onClick={() => handleZoom('in')}
              className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-300"
              title="Приблизить"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <button
              onClick={() => handleZoom('out')}
              className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-300"
              title="Отдалить"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <button
              onClick={handleResetCamera}
              className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-300"
              title="Сброс положения"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Top Right Visibility Toggles */}
        <div className="absolute top-4 right-4 z-20 bg-[#0F172A]/90 backdrop-blur-md border border-slate-700/70 rounded-xl p-2.5 shadow-lg flex flex-col gap-1.5">
          <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer px-2 py-1 rounded hover:bg-slate-800/60">
            <input
              type="checkbox"
              checked={showLines}
              onChange={(e) => setShowLines(e.target.checked)}
              className="accent-cyan-400 rounded"
            />
            <span>Линии созвездий</span>
          </label>
          <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer px-2 py-1 rounded hover:bg-slate-800/60">
            <input
              type="checkbox"
              checked={showStarNames}
              onChange={(e) => setShowStarNames(e.target.checked)}
              className="accent-cyan-400 rounded"
            />
            <span>Имена звезд</span>
          </label>
          <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer px-2 py-1 rounded hover:bg-slate-800/60">
            <input
              type="checkbox"
              checked={showDeepSky}
              onChange={(e) => setShowDeepSky(e.target.checked)}
              className="accent-cyan-400 rounded"
            />
            <span>Туманности (DSO)</span>
          </label>
        </div>

        {/* Selected Constellation / Star Detail Sidebar */}
        {(selectedStar || selectedConstellation) && (
          <aside className="absolute top-0 right-0 bottom-0 w-full sm:w-96 z-30 bg-[#0F172A]/95 backdrop-blur-xl border-l border-slate-700/80 p-5 overflow-y-auto shadow-2xl">
            
            <div className="flex items-start justify-between pb-3 border-b border-slate-800">
              <div>
                {selectedStar ? (
                  <>
                    <div className="flex items-center gap-2">
                      <span 
                        className="w-3.5 h-3.5 rounded-full inline-block shadow-sm"
                        style={{ backgroundColor: selectedStar.color }}
                      ></span>
                      <h3 className="font-display font-bold text-xl text-white">
                        {selectedStar.name}
                      </h3>
                    </div>
                    <span className="text-xs text-cyan-400 font-mono">
                      {selectedStar.bayer} • {selectedConstellation?.name}
                    </span>
                  </>
                ) : (
                  <>
                    <h3 className="font-display font-bold text-xl text-white flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-cyan-400" />
                      {selectedConstellation?.name}
                    </h3>
                    <span className="text-xs text-slate-400 font-mono">
                      {selectedConstellation?.latinName}
                    </span>
                  </>
                )}
              </div>
              <button
                onClick={() => {
                  setSelectedStar(null);
                  setSelectedConstellation(null);
                }}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Star Specific Metrics */}
            {selectedStar ? (
              <div className="mt-4 space-y-3">
                <p className="text-xs text-slate-300 leading-relaxed bg-slate-800/40 p-3 rounded-xl border border-slate-800">
                  {selectedStar.description}
                </p>

                <div className="grid grid-cols-2 gap-2.5">
                  <div className="bg-slate-800/50 p-2.5 rounded-xl border border-slate-700/50">
                    <span className="text-[10px] text-slate-400 uppercase font-mono block">Видимый блеск (m)</span>
                    <span className="text-sm font-semibold text-white mt-0.5 block">
                      +{selectedStar.magnitude.toFixed(2)}
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">
                      {selectedStar.magnitude < 1.0 ? 'Первая величина' : 'Видна невооруженным глазом'}
                    </span>
                  </div>

                  <div className="bg-slate-800/50 p-2.5 rounded-xl border border-slate-700/50">
                    <span className="text-[10px] text-slate-400 uppercase font-mono block">Расстояние</span>
                    <span className="text-sm font-semibold text-white mt-0.5 block">
                      {selectedStar.distanceLy} св. лет
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">
                      {(selectedStar.distanceLy * 0.3066).toFixed(1)} парсек
                    </span>
                  </div>

                  <div className="bg-slate-800/50 p-2.5 rounded-xl border border-slate-700/50 col-span-2">
                    <span className="text-[10px] text-slate-400 uppercase font-mono block">Спектральный класс</span>
                    <div className="flex items-center justify-between mt-0.5">
                      <span className="text-sm font-semibold text-cyan-300 font-mono">
                        {selectedStar.spectralType}
                      </span>
                      <span 
                        className="px-2 py-0.5 text-[10px] font-mono rounded"
                        style={{ backgroundColor: `${selectedStar.color}22`, color: selectedStar.color }}
                      >
                        Класс излучения
                      </span>
                    </div>
                  </div>
                </div>

                {/* Back to constellation button */}
                <button
                  onClick={() => setSelectedStar(null)}
                  className="w-full mt-2 py-2 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-300 flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Показать всё созвездие {selectedConstellation?.name}</span>
                </button>
              </div>
            ) : selectedConstellation ? (
              <div className="mt-4 space-y-4">
                {/* Constellation Mythological Lore */}
                <div className="bg-slate-800/40 p-3.5 rounded-xl border border-slate-800">
                  <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                    <Info className="w-3.5 h-3.5 text-cyan-400" />
                    Мифология и легенда
                  </h4>
                  <p className="text-xs leading-relaxed text-slate-300">
                    {selectedConstellation.lore}
                  </p>
                </div>

                {/* Key Stars List */}
                <div>
                  <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                    Главные звезды ({selectedConstellation.stars.length})
                  </h4>
                  <div className="space-y-1.5">
                    {selectedConstellation.stars.map(star => (
                      <button
                        key={star.id}
                        onClick={() => setSelectedStar(star)}
                        className="w-full p-2 rounded-lg bg-slate-800/40 hover:bg-slate-800 border border-slate-800/80 flex items-center justify-between text-left transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          <span 
                            className="w-2.5 h-2.5 rounded-full"
                            style={{ backgroundColor: star.color }}
                          ></span>
                          <div>
                            <span className="text-xs font-medium text-white block">{star.name}</span>
                            <span className="text-[10px] text-slate-400 font-mono">{star.bayer}</span>
                          </div>
                        </div>
                        <div className="text-right font-mono text-[11px] text-slate-400">
                          <span>{star.magnitude.toFixed(1)}m</span>
                          <span className="block text-[10px] text-slate-500">{star.distanceLy} св.л.</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Deep Sky Objects */}
                {selectedConstellation.deepSkyObjects && (
                  <div>
                    <h4 className="text-xs font-semibold text-pink-400 uppercase tracking-wider mb-2">
                      Объекты глубокого космоса (DSO)
                    </h4>
                    <div className="space-y-2">
                      {selectedConstellation.deepSkyObjects.map((dso, i) => (
                        <div key={i} className="p-2.5 rounded-lg bg-pink-950/20 border border-pink-900/40 text-xs">
                          <div className="flex justify-between text-pink-300 font-medium">
                            <span>{dso.name}</span>
                            <span className="font-mono text-[10px] text-pink-400">Блеск: {dso.magnitude}m</span>
                          </div>
                          <span className="text-[11px] text-slate-400 block mt-0.5">{dso.type}</span>
                          <p className="text-[11px] text-slate-300 mt-1">{dso.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : null}

          </aside>
        )}

      </div>
    </div>
  );
}
