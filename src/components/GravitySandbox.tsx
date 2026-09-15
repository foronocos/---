import { useState, useEffect, useRef, MouseEvent } from 'react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Trash2, 
  Crosshair, 
  Compass, 
  Sparkles,
  Zap,
  Info,
  Layers
} from 'lucide-react';
import { GravityBody } from '../types';

export function GravitySandbox() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Simulation controls
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [showVectors, setShowVectors] = useState<boolean>(true);
  const [showTrails, setShowTrails] = useState<boolean>(true);
  const [launchMass, setLaunchMass] = useState<number>(5); // 1 = light satellite, 50 = asteroid, 500 = dwarf star
  const [activePreset, setActivePreset] = useState<string>('orbit');

  // Aiming state for launching new bodies
  const [aiming, setAiming] = useState<{
    startX: number;
    startY: number;
    currentX: number;
    currentY: number;
  } | null>(null);

  // Bodies state inside ref for 60fps physics integration
  const bodiesRef = useRef<GravityBody[]>([]);
  const trailLength = 80;

  // Preset loaders
  const loadPreset = (presetName: string) => {
    setActivePreset(presetName);
    const canvas = canvasRef.current;
    const cx = (canvas?.width || 800) / 2;
    const cy = (canvas?.height || 600) / 2;

    if (presetName === 'orbit') {
      // Massive Central Star + 2 Stable Orbiters
      bodiesRef.current = [
        {
          id: 'star-1',
          name: 'Центральная звезда',
          x: cx,
          y: cy,
          vx: 0,
          vy: 0,
          mass: 2500,
          radius: 18,
          color: '#F59E0B',
          isStatic: true,
          trail: []
        },
        {
          id: 'probe-1',
          name: 'Спутник 1',
          x: cx,
          y: cy - 140,
          vx: 4.2,
          vy: 0,
          mass: 1,
          radius: 4,
          color: '#38BDF8',
          trail: []
        },
        {
          id: 'probe-2',
          name: 'Спутник 2 (Эллипс)',
          x: cx + 220,
          y: cy,
          vx: 0,
          vy: 3.1,
          mass: 2,
          radius: 5,
          color: '#34D399',
          trail: []
        }
      ];
    } else if (presetName === 'slingshot') {
      // Gravitational Slingshot / Flyby Assist
      bodiesRef.current = [
        {
          id: 'jupiter-sim',
          name: 'Юпитер (Тяжелая планета)',
          x: cx + 50,
          y: cy,
          vx: 0,
          vy: -0.4,
          mass: 3200,
          radius: 22,
          color: '#E0A96D',
          isStatic: false,
          trail: []
        },
        {
          id: 'voyager-probe',
          name: 'Межпланетный зонд',
          x: cx - 350,
          y: cy + 120,
          vx: 3.8,
          vy: -1.2,
          mass: 0.5,
          radius: 4,
          color: '#F472B6',
          trail: []
        }
      ];
    } else if (presetName === 'binary') {
      // Binary Star System
      const dist = 110;
      const v = 2.8;
      bodiesRef.current = [
        {
          id: 'binary-1',
          name: 'Звезда Альфа',
          x: cx - dist,
          y: cy,
          vx: 0,
          vy: v,
          mass: 1800,
          radius: 14,
          color: '#38BDF8',
          trail: []
        },
        {
          id: 'binary-2',
          name: 'Звезда Бета',
          x: cx + dist,
          y: cy,
          vx: 0,
          vy: -v,
          mass: 1800,
          radius: 14,
          color: '#F97316',
          trail: []
        },
        {
          id: 'binary-planet',
          name: 'Циркумбинарная планета',
          x: cx,
          y: cy - 280,
          vx: 3.5,
          vy: 0,
          mass: 1,
          radius: 4,
          color: '#A855F7',
          trail: []
        }
      ];
    }
  };

  // Initialize on mount
  useEffect(() => {
    loadPreset('orbit');
  }, []);

  // Main Physics Simulation Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    const G = 1.0; // Gravitational constant for sandbox scale
    const softening = 25; // Softening parameter to prevent singularity

    const stepPhysics = () => {
      const bodies = bodiesRef.current;
      const n = bodies.length;

      // Compute pairwise gravitational forces: F = G * m1 * m2 / (r^2 + softening)
      for (let i = 0; i < n; i++) {
        const b1 = bodies[i];
        if (b1.isStatic) continue;

        let fx = 0;
        let fy = 0;

        for (let j = 0; j < n; j++) {
          if (i === j) continue;
          const b2 = bodies[j];
          const dx = b2.x - b1.x;
          const dy = b2.y - b1.y;
          const distSq = dx * dx + dy * dy + softening;
          const dist = Math.sqrt(distSq);

          // Force magnitude
          const force = (G * b1.mass * b2.mass) / distSq;
          fx += force * (dx / dist);
          fy += force * (dy / dist);
        }

        // Acceleration: a = F / m
        const ax = fx / b1.mass;
        const ay = fy / b1.mass;

        b1.vx += ax;
        b1.vy += ay;
      }

      // Update positions & trails
      for (let i = 0; i < n; i++) {
        const b = bodies[i];
        if (!b.isStatic) {
          b.x += b.vx;
          b.y += b.vy;
        }

        // Record trail
        b.trail.push({ x: b.x, y: b.y });
        if (b.trail.length > trailLength) {
          b.trail.shift();
        }
      }

      // Collision detection / merging
      for (let i = 0; i < bodies.length; i++) {
        for (let j = i + 1; j < bodies.length; j++) {
          const b1 = bodies[i];
          const b2 = bodies[j];
          const dist = Math.hypot(b1.x - b2.x, b1.y - b2.y);
          if (dist < b1.radius + b2.radius) {
            // Collision: larger body absorbs smaller body
            if (b1.mass >= b2.mass) {
              b1.vx = (b1.vx * b1.mass + b2.vx * b2.mass) / (b1.mass + b2.mass);
              b1.vy = (b1.vy * b1.mass + b2.vy * b2.mass) / (b1.mass + b2.mass);
              b1.mass += b2.mass;
              b1.radius = Math.min(28, b1.radius + 1);
              bodies.splice(j, 1);
              j--;
            } else {
              b2.vx = (b1.vx * b1.mass + b2.vx * b2.mass) / (b1.mass + b2.mass);
              b2.vy = (b1.vy * b1.mass + b2.vy * b2.mass) / (b1.mass + b2.mass);
              b2.mass += b1.mass;
              b2.radius = Math.min(28, b2.radius + 1);
              bodies.splice(i, 1);
              i--;
              break;
            }
          }
        }
      }
    };

    const render = () => {
      canvas.width = containerRef.current?.clientWidth || 800;
      canvas.height = containerRef.current?.clientHeight || 600;

      const width = canvas.width;
      const height = canvas.height;

      // Deep space background
      ctx.fillStyle = '#080C17';
      ctx.fillRect(0, 0, width, height);

      // Subtle gravitational space-time coordinate grid
      ctx.strokeStyle = 'rgba(30, 41, 59, 0.4)';
      ctx.lineWidth = 1;
      const gridSize = 50;
      for (let x = 0; x < width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      if (isPlaying) {
        stepPhysics();
      }

      const bodies = bodiesRef.current;

      // Draw Trails
      if (showTrails) {
        bodies.forEach(b => {
          if (b.trail.length < 2) return;
          ctx.beginPath();
          ctx.moveTo(b.trail[0].x, b.trail[0].y);
          for (let i = 1; i < b.trail.length; i++) {
            ctx.lineTo(b.trail[i].x, b.trail[i].y);
          }
          ctx.strokeStyle = `${b.color}55`;
          ctx.lineWidth = 1.5;
          ctx.stroke();
        });
      }

      // Draw Bodies
      bodies.forEach(b => {
        // Gravitational aura
        const aura = ctx.createRadialGradient(b.x, b.y, b.radius * 0.5, b.x, b.y, b.radius * 3);
        aura.addColorStop(0, `${b.color}88`);
        aura.addColorStop(1, 'transparent');
        ctx.fillStyle = aura;
        ctx.beginPath();
        ctx.arc(b.x, b.y, b.radius * 3, 0, Math.PI * 2);
        ctx.fill();

        // Body Core
        ctx.fillStyle = b.color;
        ctx.beginPath();
        ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2);
        ctx.fill();

        // Velocity vector arrow
        if (showVectors && !b.isStatic && (Math.abs(b.vx) > 0.05 || Math.abs(b.vy) > 0.05)) {
          const vectorScale = 8;
          const endX = b.x + b.vx * vectorScale;
          const endY = b.y + b.vy * vectorScale;

          ctx.strokeStyle = '#38BDF8';
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.moveTo(b.x, b.y);
          ctx.lineTo(endX, endY);
          ctx.stroke();

          // Arrowhead
          const angle = Math.atan2(b.vy, b.vx);
          ctx.fillStyle = '#38BDF8';
          ctx.beginPath();
          ctx.moveTo(endX, endY);
          ctx.lineTo(endX - 5 * Math.cos(angle - Math.PI / 6), endY - 5 * Math.sin(angle - Math.PI / 6));
          ctx.lineTo(endX - 5 * Math.cos(angle + Math.PI / 6), endY - 5 * Math.sin(angle + Math.PI / 6));
          ctx.closePath();
          ctx.fill();
        }

        // Body Label
        if (b.name) {
          ctx.fillStyle = '#94A3B8';
          ctx.font = '10px monospace';
          ctx.textAlign = 'center';
          ctx.fillText(b.name, b.x, b.y + b.radius + 14);
        }
      });

      // Draw Aiming Vector when user drags to launch
      if (aiming) {
        ctx.strokeStyle = '#F43F5E';
        ctx.lineWidth = 2;
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.moveTo(aiming.startX, aiming.startY);
        ctx.lineTo(aiming.currentX, aiming.currentY);
        ctx.stroke();
        ctx.setLineDash([]);

        // Preview Launching Probe
        ctx.fillStyle = '#38BDF8';
        ctx.beginPath();
        ctx.arc(aiming.startX, aiming.startY, Math.max(3, Math.min(16, launchMass * 0.5 + 3)), 0, Math.PI * 2);
        ctx.fill();

        // Speed readout
        const dx = aiming.startX - aiming.currentX;
        const dy = aiming.startY - aiming.currentY;
        const speed = (Math.hypot(dx, dy) * 0.04).toFixed(1);
        ctx.fillStyle = '#F43F5E';
        ctx.font = '11px monospace';
        ctx.fillText(`V = ${speed} км/с`, aiming.currentX + 10, aiming.currentY - 10);
      }

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
    };
  }, [isPlaying, showVectors, showTrails, aiming, launchMass]);

  // Mouse drag handlers for launching bodies
  const handleMouseDown = (e: MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setAiming({
      startX: x,
      startY: y,
      currentX: x,
      currentY: y
    });
  };

  const handleMouseMove = (e: MouseEvent<HTMLCanvasElement>) => {
    if (!aiming) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    setAiming({
      ...aiming,
      currentX: e.clientX - rect.left,
      currentY: e.clientY - rect.top
    });
  };

  const handleMouseUp = () => {
    if (!aiming) return;

    // Launch velocity is in direction of drag release
    const vx = (aiming.startX - aiming.currentX) * 0.04;
    const vy = (aiming.startY - aiming.currentY) * 0.04;

    const colors = ['#38BDF8', '#34D399', '#F472B6', '#FBBF24', '#A78BFA'];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];

    bodiesRef.current.push({
      id: `body-${Date.now()}`,
      name: launchMass > 100 ? 'Астероид' : 'Зонд',
      x: aiming.startX,
      y: aiming.startY,
      vx,
      vy,
      mass: launchMass,
      radius: Math.max(3, Math.min(16, launchMass * 0.4 + 3)),
      color: randomColor,
      trail: []
    });

    setAiming(null);
  };

  const handleClearDebris = () => {
    // Keep only the first body (or static bodies)
    bodiesRef.current = bodiesRef.current.filter(b => b.isStatic);
  };

  return (
    <div className="relative w-full h-[calc(100vh-65px)] overflow-hidden flex flex-col bg-[#080C17]">
      
      {/* Top Presets Ribbon */}
      <div className="z-10 bg-[#0B0F19]/90 backdrop-blur border-b border-slate-800 px-4 py-2.5 flex items-center justify-between gap-4 overflow-x-auto no-scrollbar">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider hidden sm:inline">
            Пресеты:
          </span>
          <button
            onClick={() => loadPreset('orbit')}
            className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
              activePreset === 'orbit'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                : 'bg-slate-800/40 text-slate-400 hover:text-slate-200 border border-transparent'
            }`}
          >
            Круговая орбита
          </button>
          <button
            onClick={() => loadPreset('slingshot')}
            className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
              activePreset === 'slingshot'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                : 'bg-slate-800/40 text-slate-400 hover:text-slate-200 border border-transparent'
            }`}
          >
            Гравитационный маневр
          </button>
          <button
            onClick={() => loadPreset('binary')}
            className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
              activePreset === 'binary'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                : 'bg-slate-800/40 text-slate-400 hover:text-slate-200 border border-transparent'
            }`}
          >
            Двойная звезда
          </button>
        </div>

        {/* Mass of Launched Probe */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 font-mono hidden md:inline">Масса запуска:</span>
          <input
            type="range"
            min="1"
            max="30"
            step="1"
            value={launchMass}
            onChange={(e) => setLaunchMass(parseInt(e.target.value))}
            className="w-20 sm:w-28 accent-cyan-400 cursor-pointer"
          />
          <span className="text-xs font-mono text-cyan-400 w-12">{launchMass} M</span>
        </div>
      </div>

      {/* Main Interactive Canvas Area */}
      <div ref={containerRef} className="relative flex-1 w-full h-full cursor-crosshair select-none">
        <canvas
          ref={canvasRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          className="w-full h-full block"
        />

        {/* Hint banner */}
        <div className="absolute top-4 left-4 z-20 pointer-events-none hidden sm:block">
          <div className="bg-[#0F172A]/80 backdrop-blur border border-slate-800 rounded-lg px-3.5 py-2 text-xs text-slate-300 flex items-center gap-2 shadow-lg">
            <Crosshair className="w-4 h-4 text-cyan-400" />
            <span>Нажмите и потяните мышь в любую сторону, чтобы запустить объект с вектором скорости!</span>
          </div>
        </div>

        {/* Floating Controls Dock */}
        <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-20 bg-[#0F172A]/90 backdrop-blur-md border border-slate-700/70 rounded-2xl px-4 py-2.5 flex items-center gap-3 shadow-xl">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="w-9 h-9 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 flex items-center justify-center transition-all"
            title={isPlaying ? 'Пауза' : 'Пуск'}
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
          </button>

          <button
            onClick={() => loadPreset(activePreset)}
            className="p-2 rounded-lg hover:bg-slate-800 text-slate-300"
            title="Перезагрузить текущий пресет"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <button
            onClick={handleClearDebris}
            className="p-2 rounded-lg hover:bg-slate-800 text-rose-400"
            title="Очистить запущенные зонды"
          >
            <Trash2 className="w-4 h-4" />
          </button>

          <div className="border-l border-slate-700 pl-3 flex items-center gap-2">
            <label className="flex items-center gap-1.5 text-xs text-slate-300 cursor-pointer">
              <input
                type="checkbox"
                checked={showVectors}
                onChange={(e) => setShowVectors(e.target.checked)}
                className="accent-cyan-400 rounded"
              />
              <span>Векторы</span>
            </label>
            <label className="flex items-center gap-1.5 text-xs text-slate-300 cursor-pointer">
              <input
                type="checkbox"
                checked={showTrails}
                onChange={(e) => setShowTrails(e.target.checked)}
                className="accent-cyan-400 rounded"
              />
              <span>Шлейфы</span>
            </label>
          </div>
        </div>

      </div>
    </div>
  );
}
