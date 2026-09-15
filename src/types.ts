/**
 * Core types for CosmoChronicle Astronomical Observatory
 */

export interface PlanetData {
  id: string;
  name: string;
  russianName: string;
  category: 'star' | 'terrestrial' | 'gas_giant' | 'ice_giant' | 'dwarf';
  diameterKm: number;
  massKg: string; // e.g. "5.972 × 10^24"
  massEarthRelative: number;
  distanceFromSunMillionKm: number;
  distanceFromSunAU: number;
  orbitalPeriodDays: number;
  orbitalSpeedKmS: number;
  rotationalPeriodHours: number;
  axialTiltDeg: number;
  surfaceTempC: {
    min: number;
    avg: number;
    max: number;
  };
  gravityMs2: number;
  gravityEarthRelative: number;
  moonsCount: number;
  notableMoons: string[];
  atmosphere: { gas: string; percentage: number }[];
  color: string;
  glowColor: string;
  ringSystem?: {
    innerRadius: number;
    outerRadius: number;
    color: string;
  };
  summary: string;
  features: string[];
  famousMissions: {
    name: string;
    agency: string;
    year: string;
    achievement: string;
  }[];
}

export interface Star {
  id: string;
  name: string;
  russianName: string;
  bayer: string;
  magnitude: number;
  spectralType: string;
  color: string;
  x: number; // canvas projection coordinates
  y: number;
  distanceLy: number;
  description: string;
}

export interface Constellation {
  id: string;
  name: string;
  latinName: string;
  season: 'Весна' | 'Лето' | 'Осень' | 'Зима' | 'Всесезонное';
  stars: Star[];
  lines: [number, number][]; // pairs of star indices
  lore: string;
  centerX: number;
  centerY: number;
  deepSkyObjects?: {
    name: string;
    type: string;
    magnitude: number;
    description: string;
  }[];
}

export interface CelestialEvent {
  id: string;
  title: string;
  date: string;
  type: 'meteor_shower' | 'eclipse' | 'conjunction' | 'opposition' | 'solstice_equinox' | 'supermoon';
  peakDetails: string;
  description: string;
  bestTime: string;
  visibilityRating: number; // 1 to 5 stars
  equipment: 'Невооруженный глаз' | 'Бинокль' | 'Любительский телескоп' | 'Мощный телескоп';
}

export interface ScaleItem {
  id: string;
  exponent: number; // 10^x meters
  name: string;
  category: 'Субатомный' | 'Микромир' | 'Человеческий' | 'Планетарный' | 'Межзвездный' | 'Галактический' | 'Космологический';
  sizeText: string;
  description: string;
  comparison: string;
  funFact: string;
  visualColor: string;
}

export interface GravityBody {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  mass: number;
  radius: number;
  color: string;
  isStatic?: boolean;
  name?: string;
  trail: { x: number; y: number }[];
}

export interface CosmicAudioPreset {
  id: string;
  name: string;
  titleRu: string;
  category: string;
  description: string;
  baseFreq: number;
  type: 'pulsar' | 'schumann' | 'solar_wind' | 'saturn' | 'cmb';
  defaultVolume: number;
}
