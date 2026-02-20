import { Canvas } from '@react-three/fiber';
import { Environment, ContactShadows } from '@react-three/drei';
import { EffectComposer, Bloom, Noise } from '@react-three/postprocessing';
import * as THREE from 'three';
import { CameraController } from './components/scene/CameraController';
import { SceneManager } from './components/scene/SceneManager';
import { useGameStore } from './store/useGameStore';
import type { MaterialType } from './store/useGameStore';
import { PeriodicTable } from './components/ui/PeriodicTable';
import { calculateElectronShells } from './utils/atomic';

function GameUI() {
  const { scaleLevel, currentScale, materialType, selectedElement, hoveredElement } = useGameStore();
  const { setTargetScale, setMaterialType } = useGameStore.getState().actions;

  // Determine which element to display (Preview vs Selected)
  const displayElement = hoveredElement || selectedElement;
  const isPreview = !!hoveredElement && hoveredElement.symbol !== selectedElement.symbol;

  return (
    <div className="absolute top-0 left-0 w-full h-full pointer-events-none select-none text-slate-800 overflow-hidden">

      {/* Top Left: Header and Controls */}
      <div className="absolute top-4 left-4 z-10 font-mono">
        <h1 className="text-4xl font-bold tracking-tighter text-slate-900 border-b-2 border-slate-900 pb-1">
          QUANTUM LAB
        </h1>
        <div className="mt-2 flex flex-col gap-1">
          <p className="text-lg font-bold text-slate-600 uppercase tracking-widest">
            LEVEL: {scaleLevel}
          </p>
          <p className="text-xs text-slate-500">
            Scale Factor: {currentScale.toFixed(2)}x
          </p>
          <div className="w-32 h-1 bg-gray-300 mt-2 rounded overflow-hidden">
            <div
              className="h-full bg-blue-600 transition-all duration-75"
              style={{ width: `${(currentScale / 3.5) * 100}%` }}
            />
          </div>
        </div>

        {/* Scale Navigation */}
        <div className="mt-4 flex gap-2 pointer-events-auto">
          <button
            onClick={() => setTargetScale(12.0)}
            className={`px-4 py-2 border border-slate-800 text-xs font-bold uppercase hover:bg-slate-800 hover:text-white transition-colors ${scaleLevel === 'molecular' ? 'bg-slate-800 text-white' : 'text-slate-800'}`}
          >
            Molecular
          </button>
          <button
            onClick={() => setTargetScale(2.0)}
            className={`px-4 py-2 border border-slate-800 text-xs font-bold uppercase hover:bg-slate-800 hover:text-white transition-colors ${scaleLevel === 'atomic' ? 'bg-slate-800 text-white' : 'text-slate-800'}`}
          >
            Atomic
          </button>
          <button
            onClick={() => setTargetScale(0.5)}
            className={`px-4 py-2 border border-slate-800 text-xs font-bold uppercase hover:bg-slate-800 hover:text-white transition-colors ${scaleLevel === 'subatomic' ? 'bg-slate-800 text-white' : 'text-slate-800'}`}
          >
            Subatomic
          </button>
        </div>

        {/* Material Selection - Only visible in Molecular View */}
        {scaleLevel === 'molecular' && (
          <div className="mt-4 pointer-events-auto">
            <p className="text-xs text-slate-500 mb-1 font-bold">MATERIAL STATE</p>
            <div className="flex gap-2">
              {['solid', 'liquid', 'gas'].map((type) => (
                <button
                  key={type}
                  onClick={() => setMaterialType(type as MaterialType)}
                  className={`px-3 py-1 border border-blue-600 text-[10px] font-bold uppercase hover:bg-blue-600 hover:text-white transition-colors 
                        ${materialType === type ? 'bg-blue-600 text-white' : 'text-blue-600'}`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>


      {/* Right Middle: Atom Info Card - Only visible in Atomic View */}
      {scaleLevel === 'atomic' && displayElement && (
        <div className={`absolute top-1/2 right-8 -translate-y-1/2 bg-white/90 backdrop-blur-sm p-5 rounded-lg shadow-xl border-l-4 w-80 pointer-events-auto z-10 transition-colors duration-200
            ${isPreview ? 'border-amber-500 bg-amber-50/90' : 'border-blue-600'}
        `}>
          {isPreview && (
            <div className="absolute -top-3 left-4 bg-amber-500 text-white text-[10px] uppercase font-bold px-2 py-0.5 rounded shadow-sm">
              Preview
            </div>
          )}

          <div className="flex justify-between items-start mb-2">
            <div>
              <h2 className="text-3xl font-bold text-slate-800 leading-none">{displayElement.name}</h2>
              <div className={`text-sm font-bold ${isPreview ? 'text-amber-600' : 'text-blue-600'}`}>
                {displayElement.description}
              </div>
            </div>
            <div className="text-4xl font-bold text-slate-200 select-none block-shadow">{displayElement.symbol}</div>
          </div>

          <div className="h-px bg-slate-200 my-3" />

          <div className="space-y-2 text-sm text-slate-700">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-[10px] uppercase text-slate-400 font-bold">Atomic Number</div>
                <div className="font-mono font-bold text-lg">{displayElement.atomicNumber}</div>
              </div>
              <div>
                <div className="text-[10px] uppercase text-slate-400 font-bold">Atomic Mass</div>
                <div className="font-mono font-bold text-lg">{displayElement.atomicMass}</div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 mt-2">
              <div className="bg-red-50 p-2 rounded text-center border border-red-100">
                <div className="text-[10px] uppercase text-red-400 font-bold">Protons</div>
                <div className="font-bold text-red-700">{displayElement.atomicNumber}</div>
              </div>
              <div className="bg-slate-50 p-2 rounded text-center border border-slate-200">
                <div className="text-[10px] uppercase text-slate-400 font-bold">Neutrons</div>
                <div className="font-bold text-slate-700">{displayElement.neutrons}</div>
              </div>
              <div className="bg-blue-50 p-2 rounded text-center border border-blue-100">
                <div className="text-[10px] uppercase text-blue-400 font-bold">Electrons</div>
                <div className="font-bold text-blue-700">{displayElement.atomicNumber}</div>
              </div>
            </div>

            <div className="mt-3 pt-2 border-t border-slate-100">
              <div className="text-[10px] uppercase text-slate-400 font-bold mb-1">Electron Shells</div>
              <div className="flex flex-wrap gap-1">
                {calculateElectronShells(displayElement.atomicNumber).map((count, i) => (
                  <div key={i} className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-xs font-mono font-bold border border-slate-200">
                    {count}
                  </div>
                ))}
              </div>
            </div>

            {/* Extended Data */}
            {displayElement.discoveryYear && (
              <div className="mt-3 pt-2 border-t border-slate-100 grid grid-cols-2 gap-2 text-xs">
                <div>
                  <div className="text-[10px] uppercase text-slate-400 font-bold">Discovered</div>
                  <div className="font-semibold text-slate-700">{displayElement.discoveryYear}</div>
                  <div className="text-[10px] text-slate-500">{displayElement.discoverer}</div>
                </div>
                <div>
                  <div className="text-[10px] uppercase text-slate-400 font-bold">Abundance</div>
                  <div className="font-semibold text-slate-700 leading-tight">{displayElement.abundance || 'Rare'}</div>
                </div>
              </div>
            )}

            {displayElement.funFact && (
              <div className="mt-3 pt-2 border-t border-amber-100 bg-amber-50/50 p-2 rounded -mx-2">
                <div className="text-[10px] uppercase text-amber-500 font-bold mb-0.5">Did You Know?</div>
                <div className="text-xs text-slate-700 italic leading-relaxed">"{displayElement.funFact}"</div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Bottom Center: Periodic Table - Only visible in Atomic View */}
      {scaleLevel === 'atomic' && (
        <PeriodicTable />
      )}

    </div>
  );
}

function App() {
  const scaleLevel = useGameStore((state) => state.scaleLevel);
  return (
    <div className="w-full h-screen bg-gray-100 relative">
      <GameUI />

      <Canvas
        dpr={[1, 2]}
        gl={{ antialias: false, toneMapping: THREE.ACESFilmicToneMapping }}
        camera={{ position: [0, 0, 10], fov: 35 }}
        shadows
      >
        <color attach="background" args={['#e8eaec']} /> {/* Soft Lab Grey */}

        {/* Realistic Studio Lighting */}
        <Environment preset="studio" blur={1} />
        <ambientLight intensity={0.4} />
        <directionalLight
          position={[5, 10, 5]}
          intensity={1.5}
          castShadow
          shadow-mapSize={[1024, 1024]}
        />

        <CameraController />
        <SceneManager />

        {/* Ground Shadows for realism */}
        {scaleLevel === 'molecular' && (
          <ContactShadows
            resolution={1024}
            scale={20}
            blur={2}
            opacity={0.5}
            far={10}
            color="#000000"
          />
        )}

        {/* Cinematic Post Processing */}
        <EffectComposer>
          <Bloom
            luminanceThreshold={0.9}
            intensity={0.6}
            levels={9}
            mipmapBlur
          />
          <Noise opacity={0.025} />
        </EffectComposer>
      </Canvas>
    </div>
  );
}

export default App;
