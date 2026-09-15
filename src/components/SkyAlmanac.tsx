import { useState, useEffect, useRef } from 'react';
import { 
  Moon, 
  Calendar, 
  Sparkles, 
  Eye, 
  Star, 
  Compass, 
  Info,
  CalendarDays,
  CheckCircle2
} from 'lucide-react';
import { celestialEventsData } from '../data/celestialEventsData';
import { CelestialEvent } from '../types';

export function SkyAlmanac() {
  const moonCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const [selectedEventType, setSelectedEventType] = useState<string>('all');
  const [selectedEvent, setSelectedEvent] = useState<CelestialEvent>(celestialEventsData[0]);

  // Current Moon Phase Calculation
  const now = new Date();
  // Known reference new moon: Jan 11, 2024 (Julian day base calculation)
  const synodicMonth = 29.53058867;
  const refNewMoon = new Date('2024-01-11T11:57:00Z').getTime();
  const diffDays = (now.getTime() - refNewMoon) / (1000 * 60 * 60 * 24);
  const moonAgeDays = (diffDays % synodicMonth + synodicMonth) % synodicMonth;
  const moonPhaseFraction = moonAgeDays / synodicMonth; // 0 to 1

  // Illumination percentage
  const illumination = Math.round((0.5 - 0.5 * Math.cos(moonPhaseFraction * 2 * Math.PI)) * 100);

  // Phase Title
  let phaseName = 'Новолуние';
  if (moonAgeDays < 1.84) phaseName = 'Новолуние';
  else if (moonAgeDays < 5.53) phaseName = 'Молодая растущая Луна';
  else if (moonAgeDays < 9.22) phaseName = 'Первая четверть';
  else if (moonAgeDays < 12.92) phaseName = 'Растущая Луна';
  else if (moonAgeDays < 16.61) phaseName = 'Полнолуние';
  else if (moonAgeDays < 20.3) phaseName = 'Убывающая Луна';
  else if (moonAgeDays < 23.99) phaseName = 'Последняя четверть';
  else if (moonAgeDays < 27.68) phaseName = 'Старая Луна (бальзамическая)';
  else phaseName = 'Новолуние';

  // Render Moon Sphere with terminator shading on Canvas
  useEffect(() => {
    const canvas = moonCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = 180;
    canvas.height = 180;
    const cx = 90;
    const cy = 90;
    const r = 70;

    // Clear
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Subtle space background circle
    ctx.fillStyle = '#0F172A';
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fill();

    // Dark side of the moon (ash light)
    ctx.fillStyle = '#1E293B';
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fill();

    // Illuminated phase hemisphere using arc
    ctx.fillStyle = '#F1F5F9';
    const phase = moonPhaseFraction;

    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.clip();

    if (phase <= 0.5) {
      // Waxing (Right side illuminated)
      ctx.beginPath();
      ctx.arc(cx, cy, r, -Math.PI / 2, Math.PI / 2, false);
      const k = Math.cos(phase * 2 * Math.PI);
      ctx.ellipse(cx, cy, Math.abs(k) * r, r, 0, Math.PI / 2, -Math.PI / 2, k > 0);
      ctx.fill();
    } else {
      // Waning (Left side illuminated)
      ctx.beginPath();
      ctx.arc(cx, cy, r, Math.PI / 2, (3 * Math.PI) / 2, false);
      const k = Math.cos(phase * 2 * Math.PI);
      ctx.ellipse(cx, cy, Math.abs(k) * r, r, 0, -Math.PI / 2, Math.PI / 2, k > 0);
      ctx.fill();
    }

    // Lunar Maria (Dark basaltic seas) faint details
    ctx.fillStyle = 'rgba(100, 116, 139, 0.25)';
    ctx.beginPath();
    ctx.arc(cx - 15, cy - 10, 20, 0, Math.PI * 2); // Oceanus Procellarum
    ctx.arc(cx + 18, cy - 15, 14, 0, Math.PI * 2); // Mare Tranquillitatis
    ctx.arc(cx + 12, cy + 18, 16, 0, Math.PI * 2); // Mare Fecunditatis
    ctx.fill();

    ctx.restore();

    // Moon limb outline
    ctx.strokeStyle = 'rgba(148, 163, 184, 0.4)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.stroke();
  }, [moonPhaseFraction]);

  const filteredEvents = selectedEventType === 'all'
    ? celestialEventsData
    : celestialEventsData.filter(e => e.type === selectedEventType);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      
      {/* Top Banner: Real-time Moon Status */}
      <div className="bg-[#0F172A] border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          
          <div className="flex flex-col sm:flex-row items-center gap-6">
            {/* Moon Canvas */}
            <div className="relative flex-shrink-0">
              <canvas ref={moonCanvasRef} className="w-[150px] h-[150px] sm:w-[180px] sm:h-[180px] block" />
              <div className="absolute inset-0 rounded-full shadow-[inset_0_0_20px_rgba(255,255,255,0.15)] pointer-events-none"></div>
            </div>

            <div className="space-y-2 text-center sm:text-left">
              <div className="flex items-center justify-center sm:justify-start gap-2">
                <Moon className="w-4 h-4 text-cyan-400" />
                <span className="text-xs font-mono uppercase text-cyan-400 tracking-wider">
                  Текущее состояние спутника Земли
                </span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold font-display text-white">
                {phaseName}
              </h2>
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 text-xs font-mono text-slate-300">
                <span className="px-2.5 py-1 rounded-md bg-slate-800 border border-slate-700">
                  Освещенность: <strong className="text-cyan-400">{illumination}%</strong>
                </span>
                <span className="px-2.5 py-1 rounded-md bg-slate-800 border border-slate-700">
                  Возраст Луны: <strong>{moonAgeDays.toFixed(1)} дн.</strong>
                </span>
                <span className="px-2.5 py-1 rounded-md bg-slate-800 border border-slate-700 hidden lg:inline">
                  Дистанция: ~384 400 км
                </span>
              </div>
              <p className="text-xs text-slate-400 max-w-md pt-1">
                {illumination > 70 
                  ? 'Яркий свет Луны затрудняет наблюдения слабых туманностей и метеоров. Идеальное время для осмотра лунных кратеров в бинокль.'
                  : 'Темное небо создает великолепные условия для наблюдения объектов глубокого космоса и Млечного Пути.'}
              </p>
            </div>
          </div>

          {/* Quick Astrophotography condition rating */}
          <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/60 text-xs space-y-2 w-full md:w-64">
            <span className="text-[10px] font-mono text-slate-400 uppercase block font-semibold">
              Условия для астрономических наблюдений:
            </span>
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold font-display text-cyan-400">
                {illumination < 40 ? 'Отличные' : illumination < 75 ? 'Умеренные' : 'Засвеченные'}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 leading-snug">
              Шкала Бортля: Рекомендуется выезд за пределы городской засветки на 20–30 км.
            </p>
          </div>

        </div>
      </div>

      {/* Events Section */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-xl font-bold font-display text-white flex items-center gap-2">
              <CalendarDays className="w-5 h-5 text-cyan-400" />
              Календарь главных астрономических событий
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Метеорные дожди, противостояния гигантов и затмения
            </p>
          </div>

          {/* Filter Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            {[
              { id: 'all', label: 'Все события' },
              { id: 'meteor_shower', label: 'Звездопады' },
              { id: 'opposition', label: 'Противостояния' },
              { id: 'supermoon', label: 'Суперлуния' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setSelectedEventType(tab.id)}
                className={`px-3 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                  selectedEventType === tab.id
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                    : 'bg-slate-800/40 text-slate-400 hover:text-slate-200 border border-slate-700/40'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Events Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredEvents.map(event => (
            <div
              key={event.id}
              onClick={() => setSelectedEvent(event)}
              className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                selectedEvent.id === event.id
                  ? 'bg-slate-800 border-cyan-500/50 shadow-md'
                  : 'bg-[#0F172A]/70 border-slate-800/80 hover:border-slate-700'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950/60 text-cyan-400 border border-cyan-800/40">
                  {event.date}
                </span>

                {/* Rating Stars */}
                <div className="flex items-center gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`w-3 h-3 ${
                        i < event.visibilityRating ? 'text-amber-400 fill-amber-400' : 'text-slate-700'
                      }`}
                    />
                  ))}
                </div>
              </div>

              <h4 className="text-base font-bold font-display text-white mt-2">
                {event.title}
              </h4>
              <span className="text-xs text-cyan-300 font-mono block mt-0.5">
                {event.peakDetails}
              </span>

              <p className="text-xs text-slate-300 mt-2 line-clamp-3 leading-relaxed">
                {event.description}
              </p>

              <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400 font-mono">
                <span>Оптика:</span>
                <span className="text-slate-200">{event.equipment}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Observation Best Practices Guide Card */}
      <div className="bg-[#0F172A]/50 border border-slate-800 rounded-2xl p-5">
        <h4 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-cyan-400" />
          Памятка наблюдателя ночного неба
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-slate-300">
          <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-800">
            <span className="font-semibold text-white block mb-1">1. Темновая адаптация</span>
            Человеческому глазу требуется от 20 до 30 минут в полной темноте для выработки зрительного родопсина. Не смотрите в яркий экран смартфона; используйте красный светофильтр.
          </div>
          <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-800">
            <span className="font-semibold text-white block mb-1">2. Боковое зрение</span>
            Слабые туманности и галактики лучше видны, если смотреть не прямо в центр объекта, а чуть в сторону (на 10-15 градусов), задействуя светочувствительные палочки сетчатки.
          </div>
          <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-800">
            <span className="font-semibold text-white block mb-1">3. Термостабилизация</span>
            Перед началом наблюдений дайте оптической трубе телескопа или биноклю остыть до уличной температуры 30–45 минут, чтобы устранить внутренние конвекционные потоки воздуха.
          </div>
        </div>
      </div>

    </div>
  );
}
