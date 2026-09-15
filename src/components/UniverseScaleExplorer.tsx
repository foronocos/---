import { useState } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Sparkles, 
  Maximize, 
  Minimize, 
  Info,
  Layers,
  Atom
} from 'lucide-react';
import { scaleData } from '../data/scaleData';
import { ScaleItem } from '../types';

export function UniverseScaleExplorer() {
  const [currentIndex, setCurrentIndex] = useState<number>(6); // Default on "Человек (Наблюдатель)" at index 6

  const activeItem: ScaleItem = scaleData[currentIndex];

  const handlePrev = () => {
    if (currentIndex > 0) setCurrentIndex(currentIndex - 1);
  };

  const handleNext = () => {
    if (currentIndex < scaleData.length - 1) setCurrentIndex(currentIndex + 1);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      
      {/* Title & Introduction */}
      <div className="bg-[#0F172A] border border-slate-800 rounded-2xl p-5 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 text-cyan-400 mb-1">
              <Atom className="w-5 h-5" />
              <span className="text-xs font-semibold uppercase tracking-wider font-mono">
                Логарифмический Атлас Пространства
              </span>
            </div>
            <h2 className="text-2xl font-bold font-display text-white">
              Масштабы Вселенной: от Кванта до Космоса
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Путешествие сквозь 61 порядок величины — от планковской длины ($10^{-35}$ м) до горизонта наблюдаемой Вселенной ($10^{26}$ м).
            </p>
          </div>

          {/* Quick Step Indicators */}
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrev}
              disabled={currentIndex === 0}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-30 disabled:pointer-events-none text-white border border-slate-700 transition-colors"
              title="Уменьшить масштаб (к микромиру)"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <span className="text-xs font-mono text-cyan-400 px-2 py-1 rounded bg-slate-800 border border-slate-700">
              {currentIndex + 1} / {scaleData.length}
            </span>
            <button
              onClick={handleNext}
              disabled={currentIndex === scaleData.length - 1}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-30 disabled:pointer-events-none text-white border border-slate-700 transition-colors"
              title="Увеличить масштаб (к макромиру)"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Interactive Logarithmic Track Bar */}
        <div className="mt-6 pt-4 border-t border-slate-800">
          <div className="flex justify-between text-[11px] font-mono text-slate-400 mb-2">
            <span>Планковский квант (10⁻³⁵ м)</span>
            <span className="text-cyan-400 font-semibold">Человек (10⁰ м)</span>
            <span>Наблюдаемая Вселенная (10²⁶ м)</span>
          </div>

          <div className="relative w-full h-3 bg-slate-800 rounded-full cursor-pointer flex items-center">
            {scaleData.map((item, idx) => {
              const leftPercent = (idx / (scaleData.length - 1)) * 100;
              const isSelected = idx === currentIndex;
              return (
                <button
                  key={item.id}
                  onClick={() => setCurrentIndex(idx)}
                  className={`absolute -translate-x-1/2 w-4 h-4 rounded-full transition-all ${
                    isSelected
                      ? 'w-6 h-6 bg-cyan-400 border-4 border-slate-900 shadow-lg shadow-cyan-400/50 z-10'
                      : 'bg-slate-600 hover:bg-slate-400'
                  }`}
                  style={{ left: `${leftPercent}%` }}
                  title={`${item.name} (${item.sizeText})`}
                />
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Focus Scale Card */}
      <div className="bg-[#0F172A] border border-slate-800 rounded-2xl p-6 shadow-2xl relative overflow-hidden">
        
        {/* Visual Ambient Sphere Background */}
        <div 
          className="absolute -right-20 -top-20 w-80 h-80 rounded-full blur-3xl opacity-20 pointer-events-none"
          style={{ backgroundColor: activeItem.visualColor }}
        ></div>

        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 relative z-10">
          
          <div className="flex-1 space-y-4">
            <div className="flex flex-wrap items-center gap-2.5">
              <span 
                className="px-2.5 py-1 text-xs font-semibold rounded-full border"
                style={{ 
                  backgroundColor: `${activeItem.visualColor}20`,
                  color: activeItem.visualColor,
                  borderColor: `${activeItem.visualColor}50`
                }}
              >
                {activeItem.category}
              </span>
              <span className="text-xs font-mono text-slate-400 px-2 py-0.5 rounded bg-slate-800/80 border border-slate-700">
                10^{activeItem.exponent} метров
              </span>
            </div>

            <div>
              <h3 className="text-3xl font-display font-bold text-white tracking-tight">
                {activeItem.name}
              </h3>
              <p className="text-xl font-mono text-cyan-300 mt-1 font-semibold">
                {activeItem.sizeText}
              </p>
            </div>

            <p className="text-sm leading-relaxed text-slate-300">
              {activeItem.description}
            </p>

            {/* Comparison Box */}
            <div className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/60 text-xs text-slate-300 space-y-1">
              <span className="font-semibold text-white uppercase font-mono block text-[10px] text-cyan-400">
                Сравнение масштабов:
              </span>
              <p>{activeItem.comparison}</p>
            </div>

            {/* Fun Fact Box */}
            <div className="p-3.5 rounded-xl bg-cyan-950/20 border border-cyan-900/40 text-xs text-cyan-200">
              <span className="font-semibold uppercase font-mono block text-[10px] text-cyan-400 mb-0.5">
                Астрофизический факт:
              </span>
              <p>{activeItem.funFact}</p>
            </div>
          </div>

          {/* Graphic Scale Token */}
          <div className="w-full md:w-64 flex flex-col items-center justify-center p-6 rounded-2xl bg-slate-900/80 border border-slate-800 text-center">
            <div 
              className="w-28 h-28 rounded-2xl flex items-center justify-center border shadow-inner transition-all"
              style={{ 
                backgroundColor: `${activeItem.visualColor}15`,
                borderColor: `${activeItem.visualColor}44`,
                boxShadow: `0 0 30px ${activeItem.visualColor}20`
              }}
            >
              <div 
                className="w-16 h-16 rounded-full flex items-center justify-center font-display font-bold text-xl"
                style={{ backgroundColor: activeItem.visualColor, color: '#090D1A' }}
              >
                10^{activeItem.exponent}
              </div>
            </div>

            <span className="text-xs font-mono text-slate-400 mt-4 block">
              Порядок величины:
            </span>
            <span className="text-sm font-semibold text-white">
              {activeItem.exponent === 0 ? '1 метр' : activeItem.sizeText}
            </span>
          </div>

        </div>

      </div>

      {/* Grid of All Scales for Fast Quick Jump */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-2.5">
        {scaleData.map((item, idx) => {
          const isSelected = idx === currentIndex;
          return (
            <button
              key={item.id}
              onClick={() => setCurrentIndex(idx)}
              className={`p-3 rounded-xl text-left border transition-all ${
                isSelected
                  ? 'bg-slate-800 border-cyan-500/50 shadow-md text-cyan-300'
                  : 'bg-[#0F172A]/70 border-slate-800/80 hover:bg-slate-800/40 text-slate-400 hover:text-slate-200'
              }`}
            >
              <span className="text-[10px] font-mono text-slate-500 block">10^{item.exponent} м</span>
              <span className="text-xs font-semibold text-white block mt-0.5 truncate">{item.name}</span>
            </button>
          );
        })}
      </div>

    </div>
  );
}
