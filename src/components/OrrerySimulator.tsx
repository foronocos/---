import { useState, useEffect, useRef, useCallback, MouseEvent, WheelEvent } from 'react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  ZoomIn, 
  ZoomOut, 
  Maximize2, 
  Info, 
  Eye, 
  Layers, 
  SlidersHorizontal,
  X,
  Compass,
  Thermometer,
  Weight,
  Rocket
} from 'lucide-react';
import { planetsData } from '../data/planetsData';
import { PlanetData } from '../types';

export function OrrerySimulator() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Simulation State
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [speedMultiplier, setSpeedMultiplier] = useState<number>(1.5);
  const [selectedPlanetId, setSelectedPlanetId] = useState<string | null>('earth');
  const [userWeightKg, setUserWeightKg] = useState<number>(70);

  // View Options
  const [showOrbitLines, setShowOrbitLines] = useState<boolean>(true);
  const [showLabels, setShowLabels] = useState<boolean>(true);
  const [showAsteroids, setShowAsteroids] = useState<boolean>(true);
  const [showAuRings, setShowAuRings] = useState<boolean>(false);
  const [scaleMode, setScaleMode] = useState<'visual' | 'distance'>('visual');

  // Camera Navigation State
  const cameraRef = useRef({
    x: 0,
    y: 0,
    zoom: 1.0,
    isDragging: false,
    dragStartX: 0,
    dragStartY: 0,
    trackedPlanetId: null as string | null
  });

  // Orbital angles for each body
  const anglesRef = useRef<{ [key: string]: number }>({
    mercury: 0.8,
    venus: 1.5,
    earth: 2.2,
    mars: 0.3,
    jupiter: 4.1,
    saturn: 5.2,
    uranus: 1.1,
    neptune: 3.4,
    pluto: 0.9,
    moon: 0
  });

  // Background stars and asteroid particles generated once
  const starsRef = useRef<{ x: number; y: number; size: number; alpha: number }[]>([]);
  const asteroidsRef = useRef<{ angle: number; distance: number; size: number; speed: number }[]>([]);

  // Initialize stars and asteroids
  useEffect(() => {
    const stars: { x: number; y: number; size: number; alpha: number }[] = [];
    for (let i = 0; i < 400; i++) {
      stars.push({
        x: (Math.random() - 0.5) * 4000,
        y: (Math.random() - 0.5) * 4000,
        size: Math.random() * 1.5 + 0.5,
        alpha: Math.random() * 0.7 + 0.3
      });
    }
    starsRef.current = stars;

    const asteroids: { angle: number; distance: number; size: number; speed: number }[] = [];
    for (let i = 0; i < 350; i++) {
      // Asteroid belt between Mars (dist ~210) and Jupiter (dist ~320)
      asteroids.push({
        angle: Math.random() * Math.PI * 2,
        distance: 220 + Math.random() * 80,
        size: Math.random() * 1.8 + 0.6,
        speed: 0.003 + Math.random() * 0.002
      });
    }
    asteroidsRef.current = asteroids;
  }, []);

  // Selected planet data
  const activePlanet: PlanetData | undefined = planetsData.find(p => p.id === selectedPlanetId);

  // Orbital radii mappings for visual scale vs realistic logarithmic scale
  const getOrbitRadius = useCallback((planetId: string): number => {
    const radiiVisual: { [key: string]: number } = {
      sun: 0,
      mercury: 65,
      venus: 105,
      earth: 155,
      mars: 205,
      jupiter: 320,
      saturn: 430,
      uranus: 540,
      neptune: 640,
      pluto: 730
    };

    if (scaleMode === 'visual') {
      return radiiVisual[planetId] || 100;
    } else {
      // Logarithmic astronomical distances
      const p = planetsData.find(pl => pl.id === planetId);
      if (!p || p.distanceFromSunAU === 0) return 0;
      return 50 + Math.log2(p.distanceFromSunAU + 1) * 125;
    }
  }, [scaleMode]);

  // Planet visual body radii
  const getPlanetRadius = (planetId: string): number => {
    const sizes: { [key: string]: number } = {
      sun: 24,
      mercury: 5,
      venus: 8,
      earth: 9,
      mars: 7,
      jupiter: 18,
      saturn: 15,
      uranus: 12,
      neptune: 11,
      pluto: 4
    };
    return sizes[planetId] || 7;
  };

  // Main canvas rendering & animation loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;

    const handleResize = () => {
      if (containerRef.current && canvas) {
        canvas.width = containerRef.current.clientWidth;
        canvas.height = containerRef.current.clientHeight;
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);

    const render = () => {
      const width = canvas.width;
      const height = canvas.height;

      // Clear with deep space obsidian
      ctx.fillStyle = '#070B14';
      ctx.fillRect(0, 0, width, height);

      // Save context for camera transformation
      ctx.save();
      ctx.translate(width / 2 + cameraRef.current.x, height / 2 + cameraRef.current.y);
      ctx.scale(cameraRef.current.zoom, cameraRef.current.zoom);

      // 1. Draw Starfield
      starsRef.current.forEach(star => {
        ctx.fillStyle = `rgba(241, 245, 249, ${star.alpha})`;
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fill();
      });

      // 2. Draw Astronomical Distance Grid (AU rings)
      if (showAuRings) {
        ctx.strokeStyle = 'rgba(71, 85, 105, 0.25)';
        ctx.lineWidth = 1;
        ctx.setLineDash([4, 4]);
        [1, 5, 10, 20, 30].forEach(au => {
          const r = au === 1 ? 155 : 50 + Math.log2(au + 1) * 125;
          ctx.beginPath();
          ctx.arc(0, 0, r, 0, Math.PI * 2);
          ctx.stroke();
          ctx.fillStyle = 'rgba(148, 163, 184, 0.4)';
          ctx.font = '10px monospace';
          ctx.fillText(`${au} а.е.`, r + 6, -6);
        });
        ctx.setLineDash([]);
      }

      // 3. Draw Orbit Lines
      if (showOrbitLines) {
        planetsData.forEach(planet => {
          if (planet.id === 'sun') return;
          const radius = getOrbitRadius(planet.id);
          ctx.beginPath();
          ctx.arc(0, 0, radius, 0, Math.PI * 2);
          ctx.strokeStyle = selectedPlanetId === planet.id ? 'rgba(56, 189, 248, 0.45)' : 'rgba(51, 65, 85, 0.35)';
          ctx.lineWidth = selectedPlanetId === planet.id ? 1.5 : 1;
          ctx.stroke();
        });
      }

      // 4. Draw Asteroid Belt
      if (showAsteroids && scaleMode === 'visual') {
        asteroidsRef.current.forEach(ast => {
          if (isPlaying) {
            ast.angle += ast.speed * speedMultiplier * 0.3;
          }
          const ax = Math.cos(ast.angle) * ast.distance;
          const ay = Math.sin(ast.angle) * ast.distance;
          ctx.fillStyle = 'rgba(148, 163, 184, 0.4)';
          ctx.fillRect(ax, ay, ast.size, ast.size);
        });
      }

      // 5. Draw Sun in Center
      const sun = planetsData.find(p => p.id === 'sun');
      if (sun) {
        // Sun Outer Corona Pulse
        const coronaGrad = ctx.createRadialGradient(0, 0, 15, 0, 0, 60);
        coronaGrad.addColorStop(0, 'rgba(251, 191, 36, 0.8)');
        coronaGrad.addColorStop(0.3, 'rgba(245, 158, 11, 0.3)');
        coronaGrad.addColorStop(1, 'rgba(245, 158, 11, 0)');
        ctx.fillStyle = coronaGrad;
        ctx.beginPath();
        ctx.arc(0, 0, 60, 0, Math.PI * 2);
        ctx.fill();

        // Sun Body
        const sunGrad = ctx.createRadialGradient(-6, -6, 2, 0, 0, 24);
        sunGrad.addColorStop(0, '#FEF08A');
        sunGrad.addColorStop(0.6, '#F59E0B');
        sunGrad.addColorStop(1, '#D97706');
        ctx.fillStyle = sunGrad;
        ctx.beginPath();
        ctx.arc(0, 0, 24, 0, Math.PI * 2);
        ctx.fill();

        if (showLabels) {
          ctx.fillStyle = '#FDE68A';
          ctx.font = '11px sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText('Солнце', 0, 38);
        }
      }

      // 6. Draw Planets & Moons
      planetsData.forEach(planet => {
        if (planet.id === 'sun') return;

        const orbitRadius = getOrbitRadius(planet.id);
        const planetBodyRadius = getPlanetRadius(planet.id);

        // Update angle according to Kepler's speed
        if (isPlaying) {
          // Kepler speed: v ~ 1 / sqrt(r)
          const baseAngularSpeed = (40 / Math.sqrt(planet.distanceFromSunMillionKm || 50)) * 0.008;
          anglesRef.current[planet.id] = (anglesRef.current[planet.id] + baseAngularSpeed * speedMultiplier) % (Math.PI * 2);
        }

        const angle = anglesRef.current[planet.id];
        const px = Math.cos(angle) * orbitRadius;
        const py = Math.sin(angle) * orbitRadius;

        // If tracked by camera, smooth camera movement
        if (cameraRef.current.trackedPlanetId === planet.id) {
          cameraRef.current.x += (-px * cameraRef.current.zoom - cameraRef.current.x) * 0.08;
          cameraRef.current.y += (-py * cameraRef.current.zoom - cameraRef.current.y) * 0.08;
        }

        // Selection Aura
        if (selectedPlanetId === planet.id) {
          ctx.strokeStyle = '#38BDF8';
          ctx.lineWidth = 1.5;
          ctx.setLineDash([3, 3]);
          ctx.beginPath();
          ctx.arc(px, py, planetBodyRadius + 7, 0, Math.PI * 2);
          ctx.stroke();
          ctx.setLineDash([]);
        }

        // Planetary Rings (Saturn, Uranus)
        if (planet.ringSystem) {
          ctx.save();
          ctx.translate(px, py);
          ctx.rotate(planet.axialTiltDeg * (Math.PI / 180));
          ctx.scale(1, 0.38);

          ctx.beginPath();
          ctx.arc(0, 0, planetBodyRadius * planet.ringSystem.outerRadius, 0, Math.PI * 2);
          ctx.strokeStyle = planet.ringSystem.color;
          ctx.lineWidth = planetBodyRadius * (planet.ringSystem.outerRadius - planet.ringSystem.innerRadius);
          ctx.stroke();
          ctx.restore();
        }

        // Planet Body
        const grad = ctx.createRadialGradient(
          px - planetBodyRadius * 0.3,
          py - planetBodyRadius * 0.3,
          planetBodyRadius * 0.1,
          px,
          py,
          planetBodyRadius
        );
        grad.addColorStop(0, '#FFFFFF');
        grad.addColorStop(0.3, planet.color);
        grad.addColorStop(1, '#0B0F19');

        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(px, py, planetBodyRadius, 0, Math.PI * 2);
        ctx.fill();

        // Moon for Earth
        if (planet.id === 'earth') {
          if (isPlaying) {
            anglesRef.current.moon = (anglesRef.current.moon + 0.05 * speedMultiplier) % (Math.PI * 2);
          }
          const moonDist = planetBodyRadius + 10;
          const mx = px + Math.cos(anglesRef.current.moon) * moonDist;
          const my = py + Math.sin(anglesRef.current.moon) * moonDist;

          ctx.fillStyle = '#CBD5E1';
          ctx.beginPath();
          ctx.arc(mx, my, 2, 0, Math.PI * 2);
          ctx.fill();
        }

        // Labels
        if (showLabels) {
          ctx.fillStyle = selectedPlanetId === planet.id ? '#38BDF8' : '#94A3B8';
          ctx.font = selectedPlanetId === planet.id ? 'bold 11px sans-serif' : '10px sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText(planet.russianName, px, py + planetBodyRadius + 14);
        }
      });

      ctx.restore();

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
    };
  }, [isPlaying, speedMultiplier, selectedPlanetId, showOrbitLines, showLabels, showAsteroids, showAuRings, scaleMode, getOrbitRadius]);

  // Handle Canvas Mouse & Touch Interactions (Pan & Zoom)
  const handleMouseDown = (e: MouseEvent<HTMLCanvasElement>) => {
    cameraRef.current.isDragging = true;
    cameraRef.current.dragStartX = e.clientX - cameraRef.current.x;
    cameraRef.current.dragStartY = e.clientY - cameraRef.current.y;
    cameraRef.current.trackedPlanetId = null; // Unbind tracking on manual drag
  };

  const handleMouseMove = (e: MouseEvent<HTMLCanvasElement>) => {
    if (!cameraRef.current.isDragging) return;
    cameraRef.current.x = e.clientX - cameraRef.current.dragStartX;
    cameraRef.current.y = e.clientY - cameraRef.current.dragStartY;
  };

  const handleMouseUp = () => {
    cameraRef.current.isDragging = false;
  };

  const handleWheel = (e: WheelEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const zoomFactor = e.deltaY < 0 ? 1.15 : 0.87;
    const newZoom = Math.min(Math.max(cameraRef.current.zoom * zoomFactor, 0.25), 4.5);
    cameraRef.current.zoom = newZoom;
  };

  // Click on Canvas to Select Planet
  const handleCanvasClick = (e: MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    // Convert screen coordinates to world coordinates
    const worldX = (clickX - canvas.width / 2 - cameraRef.current.x) / cameraRef.current.zoom;
    const worldY = (clickY - canvas.height / 2 - cameraRef.current.y) / cameraRef.current.zoom;

    // Check Sun
    const sunDist = Math.hypot(worldX, worldY);
    if (sunDist < 30) {
      setSelectedPlanetId('sun');
      return;
    }

    // Check Planets
    for (const planet of planetsData) {
      if (planet.id === 'sun') continue;
      const orbitR = getOrbitRadius(planet.id);
      const angle = anglesRef.current[planet.id] || 0;
      const px = Math.cos(angle) * orbitR;
      const py = Math.sin(angle) * orbitR;
      const dist = Math.hypot(worldX - px, worldY - py);

      if (dist < getPlanetRadius(planet.id) + 12) {
        setSelectedPlanetId(planet.id);
        return;
      }
    }
  };

  // Zoom controls
  const handleZoom = (direction: 'in' | 'out') => {
    const factor = direction === 'in' ? 1.25 : 0.8;
    cameraRef.current.zoom = Math.min(Math.max(cameraRef.current.zoom * factor, 0.25), 4.5);
  };

  const handleResetCamera = () => {
    cameraRef.current.x = 0;
    cameraRef.current.y = 0;
    cameraRef.current.zoom = 1.0;
    cameraRef.current.trackedPlanetId = null;
  };

  const handleTrackPlanet = (planetId: string) => {
    setSelectedPlanetId(planetId);
    cameraRef.current.trackedPlanetId = planetId;
  };

  return (
    <div className="relative w-full h-[calc(100vh-65px)] overflow-hidden flex flex-col bg-[#070B14]">
      
      {/* Top Planetary Quick Switcher Ribbon */}
      <div className="z-10 bg-[#0B0F19]/80 backdrop-blur border-b border-slate-800/80 px-4 py-2 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider mr-2 hidden sm:inline">
          Тела:
        </span>
        {planetsData.map((p) => {
          const isSelected = selectedPlanetId === p.id;
          return (
            <button
              key={p.id}
              id={`orrery-select-${p.id}`}
              onClick={() => handleTrackPlanet(p.id)}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-all ${
                isSelected 
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm' 
                  : 'bg-slate-800/50 text-slate-400 hover:text-slate-200 border border-slate-700/40'
              }`}
            >
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: p.color }}></span>
              <span>{p.russianName}</span>
            </button>
          );
        })}
      </div>

      {/* Main Interactive Canvas Area */}
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

        {/* Floating Simulation Control Dock */}
        <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-20 bg-[#0F172A]/90 backdrop-blur-md border border-slate-700/70 rounded-2xl px-4 py-2.5 flex items-center gap-3 shadow-xl">
          
          {/* Play/Pause Button */}
          <button
            id="simulation-play-toggle"
            onClick={() => setIsPlaying(!isPlaying)}
            className="w-9 h-9 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 flex items-center justify-center transition-all"
            title={isPlaying ? 'Пауза' : 'Возобновить'}
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
          </button>

          {/* Speed Multiplier Slider */}
          <div className="flex items-center gap-2 pl-1 border-l border-slate-700">
            <span className="text-[11px] font-mono text-slate-400">Скорость:</span>
            <input
              type="range"
              min="0.2"
              max="5.0"
              step="0.2"
              value={speedMultiplier}
              onChange={(e) => setSpeedMultiplier(parseFloat(e.target.value))}
              className="w-20 sm:w-28 accent-cyan-400 cursor-pointer"
            />
            <span className="text-xs font-mono text-cyan-400 w-8">{speedMultiplier.toFixed(1)}x</span>
          </div>

          {/* Scale Mode Switcher */}
          <div className="hidden sm:flex items-center gap-1 pl-2 border-l border-slate-700">
            <button
              onClick={() => setScaleMode(scaleMode === 'visual' ? 'distance' : 'visual')}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-all ${
                scaleMode === 'visual' 
                  ? 'bg-slate-800 text-slate-200 border-slate-600' 
                  : 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
              }`}
              title="Переключить между наглядным и масштабным расстоянием"
            >
              {scaleMode === 'visual' ? 'Визуальный' : 'Реальный (Log AU)'}
            </button>
          </div>

          {/* Zoom and Reset Controls */}
          <div className="flex items-center gap-1 pl-2 border-l border-slate-700">
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
              title="Сбросить камеру в центр"
            >
              <Maximize2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* View Layers Toggle Dropdown (Top Right) */}
        <div className="absolute top-4 right-4 z-20 flex flex-col gap-2">
          <div className="bg-[#0F172A]/90 backdrop-blur-md border border-slate-700/70 rounded-xl p-2 shadow-lg flex flex-col gap-1.5">
            <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer px-2 py-1 rounded hover:bg-slate-800/60">
              <input
                type="checkbox"
                checked={showOrbitLines}
                onChange={(e) => setShowOrbitLines(e.target.checked)}
                className="accent-cyan-400 rounded"
              />
              <span>Орбиты</span>
            </label>
            <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer px-2 py-1 rounded hover:bg-slate-800/60">
              <input
                type="checkbox"
                checked={showLabels}
                onChange={(e) => setShowLabels(e.target.checked)}
                className="accent-cyan-400 rounded"
              />
              <span>Названия</span>
            </label>
            <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer px-2 py-1 rounded hover:bg-slate-800/60">
              <input
                type="checkbox"
                checked={showAsteroids}
                onChange={(e) => setShowAsteroids(e.target.checked)}
                className="accent-cyan-400 rounded"
              />
              <span>Пояс астероидов</span>
            </label>
            <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer px-2 py-1 rounded hover:bg-slate-800/60">
              <input
                type="checkbox"
                checked={showAuRings}
                onChange={(e) => setShowAuRings(e.target.checked)}
                className="accent-cyan-400 rounded"
              />
              <span>Сетка расстояний (AU)</span>
            </label>
          </div>
        </div>

        {/* Informative Hint (Top Left) */}
        <div className="absolute top-4 left-4 z-20 pointer-events-none hidden sm:block">
          <div className="bg-[#0F172A]/70 backdrop-blur-sm border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-400 font-mono flex items-center gap-2">
            <Compass className="w-3.5 h-3.5 text-cyan-400" />
            <span>Перетаскивайте для обзора • Колесико мыши: масштаб</span>
          </div>
        </div>

        {/* Selected Planet Scientific Telemetry Drawer */}
        {activePlanet && (
          <aside className="absolute top-0 right-0 bottom-0 w-full sm:w-96 z-30 bg-[#0F172A]/95 backdrop-blur-xl border-l border-slate-700/80 p-5 overflow-y-auto shadow-2xl transition-all">
            
            {/* Header with Close */}
            <div className="flex items-start justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div 
                  className="w-10 h-10 rounded-xl flex items-center justify-center border shadow-inner"
                  style={{ 
                    backgroundColor: `${activePlanet.color}22`,
                    borderColor: `${activePlanet.color}66`
                  }}
                >
                  <div className="w-5 h-5 rounded-full" style={{ backgroundColor: activePlanet.color }}></div>
                </div>
                <div>
                  <h3 className="font-display font-bold text-xl text-white flex items-center gap-2">
                    {activePlanet.russianName}
                  </h3>
                  <span className="text-xs text-slate-400 font-mono">
                    {activePlanet.name} • {
                      activePlanet.category === 'star' ? 'Звезда' :
                      activePlanet.category === 'terrestrial' ? 'Планета земной группы' :
                      activePlanet.category === 'gas_giant' ? 'Газовый гигант' :
                      activePlanet.category === 'ice_giant' ? 'Ледяной гигант' : 'Карликовая планета'
                    }
                  </span>
                </div>
              </div>
              <button
                id="close-planet-drawer"
                onClick={() => setSelectedPlanetId(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                title="Закрыть панель"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Summary */}
            <p className="text-xs leading-relaxed text-slate-300 mt-3 bg-slate-800/40 p-3 rounded-xl border border-slate-800">
              {activePlanet.summary}
            </p>

            {/* Telemetry Metrics Grid */}
            <div className="grid grid-cols-2 gap-2.5 mt-4">
              <div className="bg-slate-800/50 p-2.5 rounded-xl border border-slate-700/50">
                <span className="text-[10px] text-slate-400 uppercase font-mono block">Расстояние до Солнца</span>
                <span className="text-sm font-semibold text-white mt-0.5 block">
                  {activePlanet.distanceFromSunAU > 0 ? `${activePlanet.distanceFromSunAU} а.е.` : 'Центр системы'}
                </span>
                <span className="text-[10px] text-slate-500 font-mono">
                  {activePlanet.distanceFromSunMillionKm > 0 ? `${activePlanet.distanceFromSunMillionKm} млн км` : '—'}
                </span>
              </div>

              <div className="bg-slate-800/50 p-2.5 rounded-xl border border-slate-700/50">
                <span className="text-[10px] text-slate-400 uppercase font-mono block">Период обращения</span>
                <span className="text-sm font-semibold text-white mt-0.5 block">
                  {activePlanet.orbitalPeriodDays > 0 
                    ? (activePlanet.orbitalPeriodDays > 365 
                        ? `${(activePlanet.orbitalPeriodDays / 365.25).toFixed(1)} земн. лет` 
                        : `${activePlanet.orbitalPeriodDays} дн.`)
                    : '—'}
                </span>
                <span className="text-[10px] text-slate-500 font-mono">
                  {activePlanet.orbitalSpeedKmS > 0 ? `${activePlanet.orbitalSpeedKmS} км/с` : '—'}
                </span>
              </div>

              <div className="bg-slate-800/50 p-2.5 rounded-xl border border-slate-700/50">
                <span className="text-[10px] text-slate-400 uppercase font-mono block">Диаметр</span>
                <span className="text-sm font-semibold text-white mt-0.5 block">
                  {activePlanet.diameterKm.toLocaleString('ru-RU')} км
                </span>
                <span className="text-[10px] text-slate-500 font-mono">
                  {activePlanet.id === 'earth' ? '1.0 Земли' : `${(activePlanet.diameterKm / 12742).toFixed(2)}x от Земли`}
                </span>
              </div>

              <div className="bg-slate-800/50 p-2.5 rounded-xl border border-slate-700/50">
                <span className="text-[10px] text-slate-400 uppercase font-mono block">Температура (средняя)</span>
                <span className="text-sm font-semibold text-white mt-0.5 flex items-center gap-1">
                  <Thermometer className="w-3.5 h-3.5 text-rose-400" />
                  {activePlanet.surfaceTempC.avg > 0 ? `+${activePlanet.surfaceTempC.avg}` : activePlanet.surfaceTempC.avg} °C
                </span>
                <span className="text-[10px] text-slate-500 font-mono">
                  от {activePlanet.surfaceTempC.min}° до {activePlanet.surfaceTempC.max}°
                </span>
              </div>
            </div>

            {/* Interactive Weight Calculator */}
            <div className="mt-4 p-3.5 rounded-xl bg-gradient-to-br from-slate-800/80 to-slate-900 border border-slate-700/60">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-white flex items-center gap-1.5">
                  <Weight className="w-4 h-4 text-cyan-400" />
                  Ваш вес на этой планете
                </span>
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    min="10"
                    max="300"
                    value={userWeightKg}
                    onChange={(e) => setUserWeightKg(Math.max(1, parseInt(e.target.value) || 70))}
                    className="w-14 bg-slate-950 border border-slate-700 rounded px-1.5 py-0.5 text-xs text-right font-mono text-cyan-300"
                  />
                  <span className="text-xs text-slate-400">кг</span>
                </div>
              </div>
              <div className="flex items-baseline justify-between mt-1">
                <span className="text-2xl font-bold font-display text-cyan-400">
                  {(userWeightKg * activePlanet.gravityEarthRelative).toFixed(1)} кг
                </span>
                <span className="text-xs text-slate-400 font-mono">
                  Ускорение: {activePlanet.gravityMs2} м/с² ({activePlanet.gravityEarthRelative}g)
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1.5">
                {activePlanet.gravityEarthRelative < 0.5 
                  ? 'Здесь вы могли бы прыгать на колоссальную высоту без усилий!' 
                  : activePlanet.gravityEarthRelative > 2.0 
                    ? 'Гравитация здесь раздавила бы человека под собственной тяжестью.'
                    : 'Гравитация комфортна и близка к земным условиям.'}
              </p>
            </div>

            {/* Atmosphere Breakdown */}
            <div className="mt-4">
              <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Состав атмосферы
              </h4>
              <div className="space-y-1.5">
                {activePlanet.atmosphere.map((gas, i) => (
                  <div key={i} className="text-xs">
                    <div className="flex justify-between text-slate-300 mb-0.5">
                      <span>{gas.gas}</span>
                      <span className="font-mono text-cyan-400">{gas.percentage}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-cyan-500 rounded-full"
                        style={{ width: `${Math.min(gas.percentage, 100)}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Moons and Features */}
            {activePlanet.moonsCount > 0 && (
              <div className="mt-4">
                <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Спутники ({activePlanet.moonsCount})
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {activePlanet.notableMoons.map((moon, i) => (
                    <span key={i} className="px-2 py-0.5 rounded-md bg-slate-800 text-xs text-slate-300 border border-slate-700">
                      {moon}
                    </span>
                  ))}
                  {activePlanet.moonsCount > activePlanet.notableMoons.length && (
                    <span className="px-2 py-0.5 rounded-md bg-slate-800/40 text-[11px] text-slate-500">
                      +{activePlanet.moonsCount - activePlanet.notableMoons.length} мелких
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Famous Missions */}
            <div className="mt-5 pb-4">
              <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Rocket className="w-3.5 h-3.5 text-cyan-400" />
                Знаковые космические миссии
              </h4>
              <div className="space-y-2">
                {activePlanet.famousMissions.map((mission, i) => (
                  <div key={i} className="p-2.5 rounded-lg bg-slate-800/40 border border-slate-800 text-xs">
                    <div className="flex items-center justify-between text-white font-medium">
                      <span>{mission.name}</span>
                      <span className="text-[10px] font-mono text-cyan-400 px-1.5 py-0.5 rounded bg-cyan-950/60 border border-cyan-800/50">
                        {mission.year} ({mission.agency})
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1">
                      {mission.achievement}
                    </p>
                  </div>
                ))}
              </div>
            </div>

          </aside>
        )}

      </div>
    </div>
  );
}
