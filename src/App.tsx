/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { Header } from './components/Header';
import { OrrerySimulator } from './components/OrrerySimulator';
import { ConstellationMap } from './components/ConstellationMap';
import { GravitySandbox } from './components/GravitySandbox';
import { CosmicAudioStudio } from './components/CosmicAudioStudio';
import { UniverseScaleExplorer } from './components/UniverseScaleExplorer';
import { SkyAlmanac } from './components/SkyAlmanac';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('orrery');
  const [audioPlayingCount, setAudioPlayingCount] = useState<number>(0);

  return (
    <div className="min-h-screen flex flex-col bg-[#0B0F19] text-slate-100 selection:bg-cyan-500/30 selection:text-cyan-200">
      
      {/* Universal Observatory Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        audioPlayingCount={audioPlayingCount}
      />

      {/* Main Content Area */}
      <main className="flex-1 w-full">
        {activeTab === 'orrery' && <OrrerySimulator />}
        {activeTab === 'constellations' && <ConstellationMap />}
        {activeTab === 'gravity' && <GravitySandbox />}
        {activeTab === 'audio' && (
          <CosmicAudioStudio onAudioStateChange={setAudioPlayingCount} />
        )}
        {activeTab === 'scale' && <UniverseScaleExplorer />}
        {activeTab === 'almanac' && <SkyAlmanac />}
      </main>

    </div>
  );
}
