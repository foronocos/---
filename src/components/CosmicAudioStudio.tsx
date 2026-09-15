import { useState, useEffect, useRef } from 'react';
import { 
  Play, 
  Square, 
  Volume2, 
  VolumeX, 
  Radio, 
  Activity, 
  Sliders, 
  Sparkles,
  Info,
  Waves
} from 'lucide-react';
import { cosmicAudioPresets } from '../data/celestialEventsData';
import { audioEngine } from '../utils/audioEngine';
import { CosmicAudioPreset } from '../types';

interface CosmicAudioStudioProps {
  onAudioStateChange: (activeCount: number) => void;
}

export function CosmicAudioStudio({ onAudioStateChange }: CosmicAudioStudioProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  
  // Playing state for each preset
  const [playingStates, setPlayingStates] = useState<{ [key: string]: boolean }>({});
  const [volumes, setVolumes] = useState<{ [key: string]: number }>({
    pulsar: 0.65,
    schumann: 0.6,
    solar_wind: 0.5,
    saturn: 0.55,
    cmb: 0.45
  });
  const [activePresetDetails, setActivePresetDetails] = useState<CosmicAudioPreset>(cosmicAudioPresets[0]);
  const [masterVolume, setMasterVolume] = useState<number>(0.5);

  // Sync count of currently playing streams
  useEffect(() => {
    const count = Object.values(playingStates).filter(Boolean).length;
    onAudioStateChange(count);
  }, [playingStates, onAudioStateChange]);

  // Real-time Oscilloscope / Spectrum Visualizer Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;

    const render = () => {
      canvas.width = canvas.parentElement?.clientWidth || 600;
      canvas.height = 140;

      const width = canvas.width;
      const height = canvas.height;

      // Dark oscilloscope canvas
      ctx.fillStyle = '#090D1A';
      ctx.fillRect(0, 0, width, height);

      // Subtle oscilloscope grid
      ctx.strokeStyle = 'rgba(30, 41, 59, 0.4)';
      ctx.lineWidth = 1;
      for (let x = 0; x < width; x += 40) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      ctx.beginPath();
      ctx.moveTo(0, height / 2);
      ctx.lineTo(width, height / 2);
      ctx.stroke();

      const analyser = audioEngine.getAnalyser();
      const isAnyPlaying = Object.values(playingStates).some(Boolean);

      if (analyser && isAnyPlaying) {
        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        analyser.getByteTimeDomainData(dataArray);

        ctx.lineWidth = 2;
        ctx.strokeStyle = '#38BDF8';
        ctx.shadowColor = '#38BDF8';
        ctx.shadowBlur = 8;
        ctx.beginPath();

        const sliceWidth = width / bufferLength;
        let x = 0;

        for (let i = 0; i < bufferLength; i++) {
          const v = dataArray[i] / 128.0;
          const y = (v * height) / 2;

          if (i === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }

          x += sliceWidth;
        }

        ctx.lineTo(width, height / 2);
        ctx.stroke();
        ctx.shadowBlur = 0;
      } else {
        // Idle flatline with subtle quantum noise
        ctx.lineWidth = 1.5;
        ctx.strokeStyle = '#334155';
        ctx.beginPath();
        ctx.moveTo(0, height / 2);
        ctx.lineTo(width, height / 2);
        ctx.stroke();
      }

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
    };
  }, [playingStates]);

  const toggleTrack = (preset: CosmicAudioPreset) => {
    const isPlaying = !!playingStates[preset.id];
    if (isPlaying) {
      audioEngine.stopSound(preset.id);
      setPlayingStates(prev => ({ ...prev, [preset.id]: false }));
    } else {
      const vol = volumes[preset.id] ?? preset.defaultVolume;
      audioEngine.startSound(preset.id, preset.baseFreq, preset.type, vol);
      setPlayingStates(prev => ({ ...prev, [preset.id]: true }));
    }
  };

  const handleVolumeChange = (id: string, vol: number) => {
    setVolumes(prev => ({ ...prev, [id]: vol }));
    if (playingStates[id]) {
      const preset = cosmicAudioPresets.find(p => p.id === id);
      if (preset) {
        audioEngine.startSound(id, preset.baseFreq, preset.type, vol);
      }
    }
  };

  const stopAllTracks = () => {
    audioEngine.stopAll();
    setPlayingStates({});
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      
      {/* Studio Header Card */}
      <div className="bg-[#0F172A] border border-slate-800 rounded-2xl p-5 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-cyan-400 mb-1">
              <Radio className="w-5 h-5 animate-pulse" />
              <span className="text-xs font-semibold uppercase tracking-wider font-mono">
                Акустическая Радиоастрономия
              </span>
            </div>
            <h2 className="text-2xl font-bold font-display text-white">
              Генератор Звуков и Волн Вселенной
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl">
              Синтез реальных электромагнитных колебаний, радиоволн планетных магнитосфер и реликтового излучения раннего космоса с помощью Web Audio API.
            </p>
          </div>

          {/* Master Actions */}
          <div className="flex items-center gap-3 self-start md:self-auto">
            <button
              onClick={stopAllTracks}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-medium text-slate-300 flex items-center gap-1.5 transition-colors"
            >
              <Square className="w-3.5 h-3.5 text-rose-400" />
              <span>Остановить всё</span>
            </button>
          </div>
        </div>

        {/* Real-time Oscilloscope Canvas Container */}
        <div className="mt-5 rounded-xl overflow-hidden border border-slate-800 relative bg-[#090D1A]">
          <canvas ref={canvasRef} className="w-full block" />
          <div className="absolute top-2.5 left-3 flex items-center gap-2">
            <Activity className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-[10px] font-mono uppercase text-slate-400 tracking-wider">
              Осциллограф реального времени (44.1 kHz)
            </span>
          </div>
        </div>
      </div>

      {/* Preset Tracks Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {cosmicAudioPresets.map((preset) => {
          const isPlaying = !!playingStates[preset.id];
          const currentVol = volumes[preset.id] ?? preset.defaultVolume;

          return (
            <div
              key={preset.id}
              className={`p-4 rounded-2xl border transition-all ${
                isPlaying 
                  ? 'bg-slate-800/80 border-cyan-500/40 shadow-lg shadow-cyan-500/5' 
                  : 'bg-[#0F172A]/70 border-slate-800/80 hover:border-slate-700'
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-mono uppercase text-cyan-400 px-2 py-0.5 rounded bg-cyan-950/60 border border-cyan-800/40 inline-block mb-1.5">
                    {preset.category}
                  </span>
                  <h3 className="font-display font-semibold text-base text-white">
                    {preset.titleRu}
                  </h3>
                  <span className="text-xs text-slate-400 font-mono block">
                    {preset.name}
                  </span>
                </div>

                {/* Play / Stop Button */}
                <button
                  onClick={() => toggleTrack(preset)}
                  className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                    isPlaying
                      ? 'bg-cyan-500 text-slate-950 font-bold shadow-md shadow-cyan-500/20'
                      : 'bg-slate-800 text-cyan-400 hover:bg-slate-700 border border-slate-700'
                  }`}
                  title={isPlaying ? 'Остановить' : 'Воспроизвести'}
                >
                  {isPlaying ? <Square className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 ml-0.5 fill-current" />}
                </button>
              </div>

              <p className="text-xs text-slate-300 mt-3 leading-relaxed line-clamp-3">
                {preset.description}
              </p>

              {/* Volume Slider */}
              <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 flex-1">
                  <Volume2 className="w-3.5 h-3.5 text-slate-400" />
                  <input
                    type="range"
                    min="0.05"
                    max="1.0"
                    step="0.05"
                    value={currentVol}
                    onChange={(e) => handleVolumeChange(preset.id, parseFloat(e.target.value))}
                    className="w-full accent-cyan-400 cursor-pointer"
                  />
                </div>
                <span className="text-xs font-mono text-cyan-400 w-8 text-right">
                  {Math.round(currentVol * 100)}%
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Deep Scientific Explanation of Space Sound */}
      <div className="bg-[#0F172A]/40 border border-slate-800/80 rounded-2xl p-5 text-xs text-slate-400 leading-relaxed space-y-2">
        <h4 className="text-sm font-semibold text-white flex items-center gap-1.5">
          <Info className="w-4 h-4 text-cyan-400" />
          Как звучит космос, если в вакууме нет звуковых волн?
        </h4>
        <p>
          В космическом вакууме механические звуковые волны действительно не распространяются. Однако Вселенная наполнена электромагнитным излучением: радиоволнами, колебаниями плазмы и гравитационными волнами.
        </p>
        <p>
          Астрофизики преобразуют зарегистрированные радиосигналы космических аппаратов (таких как «Вояджер», «Кассини» и наземных радиотелескопов) в звуковой диапазон частот методом сонификации данных, позволяя нам буквально слышать дыхание далеких планет и звезд.
        </p>
      </div>

    </div>
  );
}
