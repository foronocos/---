import { useState, useEffect } from 'react';
import { 
  Orbit, 
  Sparkles, 
  Compass, 
  Volume2, 
  VolumeX, 
  Sliders, 
  CalendarDays,
  Radio
} from 'lucide-react';
import { audioEngine } from '../utils/audioEngine';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  audioPlayingCount: number;
}

export function Header({ activeTab, setActiveTab, audioPlayingCount }: HeaderProps) {
  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  const [isMuted, setIsMuted] = useState<boolean>(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const toggleMasterMute = () => {
    const muted = audioEngine.toggleMute();
    setIsMuted(muted);
  };

  // Calculate approximate Julian Date
  const calculateJulianDate = (date: Date) => {
    const time = date.getTime();
    return (time / 86400000 + 2440587.5).toFixed(2);
  };

  const navItems = [
    { id: 'orrery', label: 'Солнечная система', icon: Orbit },
    { id: 'constellations', label: 'Звездное небо', icon: Sparkles },
    { id: 'gravity', label: 'Гравитационный тир', icon: Compass },
    { id: 'audio', label: 'Звуки космоса', icon: Radio },
    { id: 'scale', label: 'Масштабы Вселенной', icon: Sliders },
    { id: 'almanac', label: 'Астрокалендарь', icon: CalendarDays },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-slate-800 bg-[#0B0F19]/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          
          {/* Brand Logo & Observatory Stats */}
          <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-start">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                <Orbit className="w-5 h-5 animate-[spin_20s_linear_infinite]" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-display font-bold text-lg tracking-tight text-white">
                    CosmoChronicle
                  </span>
                  <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded-full bg-cyan-950/80 text-cyan-400 border border-cyan-800/40">
                    Обсерватория v2.4
                  </span>
                </div>
                <p className="text-xs text-slate-400 font-mono hidden sm:block">
                  UTC: {currentTime.toUTCString().slice(17, 25)} | JD: {calculateJulianDate(currentTime)}
                </p>
              </div>
            </div>

            {/* Ambient Sound Status Indicator & Mute Button */}
            <div className="flex items-center gap-2">
              <button
                id="header-audio-toggle"
                onClick={toggleMasterMute}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                  audioPlayingCount > 0 && !isMuted
                    ? 'bg-cyan-500/15 border border-cyan-500/40 text-cyan-300 shadow-[0_0_12px_rgba(6,182,212,0.15)]'
                    : 'bg-slate-800/60 border border-slate-700/60 text-slate-400 hover:text-slate-200'
                }`}
                title={isMuted ? 'Включить звук' : 'Выключить звук'}
              >
                {isMuted ? <VolumeX className="w-3.5 h-3.5 text-rose-400" /> : <Volume2 className="w-3.5 h-3.5 text-cyan-400" />}
                <span className="font-mono">
                  {isMuted ? 'MUTE' : audioPlayingCount > 0 ? `${audioPlayingCount} поток(а)` : 'Звук'}
                </span>
                {audioPlayingCount > 0 && !isMuted && (
                  <span className="flex gap-0.5 items-end h-3 ml-1">
                    <span className="w-0.5 h-2 bg-cyan-400 animate-pulse"></span>
                    <span className="w-0.5 h-3 bg-cyan-400 animate-pulse delay-75"></span>
                    <span className="w-0.5 h-1.5 bg-cyan-400 animate-pulse delay-150"></span>
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Navigation Bar */}
          <nav className="flex items-center overflow-x-auto max-w-full pb-1 md:pb-0 gap-1 sm:gap-1.5 no-scrollbar">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  id={`nav-tab-${item.id}`}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium whitespace-nowrap transition-all ${
                    isActive
                      ? 'bg-slate-800 text-cyan-300 border border-slate-700 shadow-sm'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40 border border-transparent'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

        </div>
      </div>
    </header>
  );
}
