import { Canvas } from '@react-three/fiber';
import { Environment, ContactShadows } from '@react-three/drei';
import { EffectComposer, Bloom, Noise, DepthOfField, SSAO, ChromaticAberration } from '@react-three/postprocessing';
import * as THREE from 'three';
import { CameraController } from './components/scene/CameraController';
import { SceneManager } from './components/scene/SceneManager';
import { useGameStore } from './store/useGameStore';
import type { MaterialType } from './store/useGameStore';
import { PeriodicTable } from './components/ui/PeriodicTable';
import { MoleculeGallery } from './components/ui/MoleculeGallery';
import { QuantumAcademy } from './components/ui/QuantumAcademy';
import { InfoPopup } from './components/ui/InfoPopup';
import { HoverTooltip } from './components/ui/HoverTooltip';
import { FirstTimeTour } from './components/ui/FirstTimeTour';
import { calculateElectronShells } from './utils/atomic';
import { formatElectronConfig, EMISSION_SPECTRA, wavelengthToColor } from './utils/electronConfig';
import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { BookOpen, Keyboard, Camera, Sparkles } from 'lucide-react';
import { getMoleculeForElement } from './data/molecules';
import { useAudio } from './hooks/useAudio';

function GameUI() {
  const { scaleLevel, currentScale, materialType, selectedElement, hoveredElement, temperature, electronsAnimated, atomicViewMode, showSpecialMolecule, activeMoleculeId, showQuarks } = useGameStore();
  const { setTargetScale, setMaterialType, setTemperature, setElectronsAnimated, setAtomicViewMode, toggleSpecialMolecule: toggleSpecialMoleculeStore, setActiveMolecule, setShowQuarks } = useGameStore.getState().actions;

  const { playSound, stopSound } = useAudio();
  const prevScaleLevelRef = useRef(scaleLevel);

  // Manage Ambient Sounds
  useEffect(() => {
    // Only play ambient sounds if there has been some interaction (to respect browser auto-play policies)
    // We'll assume the user has interacted by the time they change scales or click a button
    if (scaleLevel === 'molecular') {
      stopSound('ambient_space');
      playSound('ambient_lab', { volume: 0.1, loop: true });
    } else {
      stopSound('ambient_lab');
      playSound('ambient_space', { volume: 0.2, loop: true });
    }

    return () => {
      stopSound('ambient_space');
      stopSound('ambient_lab');
    }
  }, [scaleLevel, playSound, stopSound]);

  // Trigger zoom sounds when scale level changes
  useEffect(() => {
    if (prevScaleLevelRef.current !== scaleLevel) {
      if (scaleLevel === 'subatomic') {
        playSound('zoom_in', { volume: 0.5 });
      } else if (scaleLevel === 'molecular') {
        playSound('zoom_out', { volume: 0.5 });
      } else {
        // Moving to atomic
        if (prevScaleLevelRef.current === 'molecular') {
          playSound('zoom_in', { volume: 0.5 });
        } else {
          playSound('zoom_out', { volume: 0.5 });
        }
      }
      prevScaleLevelRef.current = scaleLevel;
    }
  }, [scaleLevel, playSound]);

  // Determine which element to display (Preview vs Selected)
  const displayElement = hoveredElement || selectedElement;
  const isPreview = !!hoveredElement && hoveredElement.symbol !== selectedElement.symbol;

  const toggleSpecialMolecule = () => {
    playSound('ui_click', { volume: 0.3 });
    if (!showSpecialMolecule) {
      toggleSpecialMoleculeStore();
      // If they are turning it on, make sure activeMoleculeId matches the default for the element
      const defaultMol = getMoleculeForElement(displayElement.symbol);
      if (defaultMol) {
        setActiveMolecule(defaultMol.id);
      }
    } else {
      // If already on, check if there are alternatives (like Carbon allotropes)
      if (displayElement.symbol === 'C') {
        if (activeMoleculeId === 'diamond') {
          setActiveMolecule('graphite');
        } else if (activeMoleculeId === 'graphite') {
          // Cycle back to false (off)
          toggleSpecialMoleculeStore();
          setActiveMolecule(null);
        } else {
          setActiveMolecule('diamond');
        }
      } else {
        // For single compounds (Water/Salt), just turn off
        toggleSpecialMoleculeStore();
        setActiveMolecule(null);
      }
    }
  };

  // Determine what to show on the button
  let buttonText = 'SWITCH TO COMPOUND';
  if (showSpecialMolecule) {
    if (displayElement.symbol === 'C') {
      buttonText = activeMoleculeId === 'diamond' ? '✓ DIAMOND (CLICK FOR GRAPHITE)' : '✓ GRAPHITE (CLICK TO EXIT)';
    } else {
      buttonText = '✓ COMPOUND ACTIVE';
    }
  }
  const canShowMolecule = displayElement.symbol === 'H' || displayElement.symbol === 'O' || displayElement.symbol === 'Na' || displayElement.symbol === 'Cl' || displayElement.symbol === 'C';
  // const isDark = scaleLevel !== 'molecular'; // Removed since UI is always dark glassmorphism now

  return (
    <div className="absolute top-0 left-0 w-full h-full pointer-events-none select-none overflow-hidden text-slate-200">

      {/* Top Left: Header and Controls - Glassmorphism Container */}
      <div className="absolute top-4 left-4 z-10 font-mono bg-slate-900/60 backdrop-blur-md border border-white/10 p-5 rounded-2xl shadow-[0_0_30px_rgba(0,0,0,0.5)]">
        <h1 className="text-3xl font-black tracking-tighter pb-2 border-b-2 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400 border-white/10 drop-shadow-sm">
          QUANTUM LAB
        </h1>
        <div className="mt-3 flex flex-col gap-1">
          <p className="text-sm font-bold uppercase tracking-widest text-slate-300">
            LEVEL: <span className="text-white">{scaleLevel}</span>
          </p>
          <p className="text-[10px] text-slate-400 uppercase tracking-widest gap-2 flex justify-between">
            <span>Scale Factor</span> <span>{currentScale.toFixed(2)}x</span>
          </p>
          <div className="w-full h-1 mt-1 rounded overflow-hidden bg-white/5 border border-white/5">
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-emerald-400 transition-all duration-75 shadow-[0_0_10px_rgba(0,150,255,0.8)]"
              style={{ width: `${(currentScale / 12.0) * 100}%` }}
            />
          </div>
        </div>

        {/* Scale Navigation */}
        <div className="mt-5 flex gap-2 pointer-events-auto">
          <button
            onClick={() => { playSound('ui_click', { volume: 0.3 }); setTargetScale(12.0); }}
            className={`px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest transition-all duration-300 rounded ${scaleLevel === 'molecular' ? 'bg-blue-600/80 text-white shadow-[0_0_15px_rgba(37,99,235,0.5)] border border-blue-400' : 'bg-white/5 text-slate-300 border border-white/10 hover:bg-white/10 hover:text-white'}`}
          >
            Molecular
          </button>
          <button
            onClick={() => { playSound('ui_click', { volume: 0.3 }); setTargetScale(2.0); }}
            className={`px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest transition-all duration-300 rounded ${scaleLevel === 'atomic' ? 'bg-indigo-600/80 text-white shadow-[0_0_15px_rgba(79,70,229,0.5)] border border-indigo-400' : 'bg-white/5 text-slate-300 border border-white/10 hover:bg-white/10 hover:text-white'}`}
          >
            Atomic
          </button>
          <button
            onClick={() => { playSound('ui_click', { volume: 0.3 }); setTargetScale(0.5); }}
            className={`px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest transition-all duration-300 rounded ${scaleLevel === 'subatomic' ? 'bg-rose-600/80 text-white shadow-[0_0_15px_rgba(225,29,72,0.5)] border border-rose-400' : 'bg-white/5 text-slate-300 border border-white/10 hover:bg-white/10 hover:text-white'}`}
          >
            Subatomic
          </button>
        </div>

        {/* Material Selection - Only visible in Molecular View */}
        {scaleLevel === 'molecular' && (
          <div className="mt-6 pt-4 border-t border-white/10 pointer-events-auto space-y-4">
            <div>
              <p className="text-[10px] text-slate-400 mb-2 font-bold uppercase tracking-widest">Material State</p>
              <div className="flex gap-2">
                {['solid', 'liquid', 'gas'].map((type) => (
                  <button
                    key={type}
                    onClick={() => { playSound('ui_click', { volume: 0.3 }); setMaterialType(type as MaterialType); }}
                    className={`px-3 py-1 border text-[10px] font-bold uppercase tracking-wider transition-all duration-300 rounded 
                          ${materialType === type ? 'bg-blue-500/30 text-blue-200 border-blue-400 shadow-[0_0_10px_rgba(59,130,246,0.3)]' : 'bg-white/5 text-slate-400 border-white/10 hover:bg-white/10 hover:text-white'}`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            {canShowMolecule && (
              <div>
                <p className="text-[10px] text-slate-400 mb-2 font-bold uppercase tracking-widest">Compound Mode</p>
                <button
                  onClick={toggleSpecialMolecule}
                  className={`px-3 py-1.5 border text-[10px] font-bold uppercase tracking-wider transition-all duration-300 rounded w-full text-center ${showSpecialMolecule ? 'bg-emerald-500/30 text-emerald-200 border-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.3)]' : 'bg-white/5 text-slate-400 border-white/10 hover:bg-white/10 hover:text-white text-left flex justify-between items-center'}`}
                >
                  {buttonText} {showSpecialMolecule ? '' : <span className="text-[8px] opacity-70">Optional</span>}
                </button>
              </div>
            )}
          </div>
        )}

        {/* Temperature Slider - Only visible in Molecular View */}
        {scaleLevel === 'molecular' && (
          <div className="mt-6 pt-4 border-t border-white/10 pointer-events-auto">
            <p className="text-[10px] text-slate-400 mb-3 font-bold uppercase tracking-widest flex justify-between">
              <span>Temperature</span> <span style={{ color: `hsl(${40 - (temperature / 1000) * 40}, 90%, 60%)` }}>{temperature}K {temperature < 100 ? '❄️' : temperature < 500 ? '🌡️' : '🔥'}</span>
            </p>
            <div className="flex items-center gap-3">
              <span className="text-[9px] font-mono text-blue-400">0K</span>
              <input
                type="range"
                min={0}
                max={1000}
                value={temperature}
                onChange={(e) => setTemperature(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-700 rounded-full appearance-none cursor-pointer outline-none slider-thumb-glow"
                style={{
                  background: `linear-gradient(to right, #3b82f6 ${temperature / 10}%, #1e293b ${temperature / 10}%)`
                }}
              />
              <span className="text-[9px] font-mono text-orange-500">1000K</span>
            </div>

            <button
              onClick={() => {
                const { fireThermalPulse } = useGameStore.getState().actions;
                playSound('thermal_pulse', { volume: 0.6 });
                fireThermalPulse();
              }}
              className="mt-4 px-3 py-2 bg-orange-500/20 text-orange-300 rounded-lg font-bold hover:bg-orange-500/40 hover:shadow-[0_0_15px_rgba(249,115,22,0.4)] transition-all border border-orange-500/30 text-[10px] uppercase tracking-widest w-full flex items-center justify-center gap-2"
            >
              <span>🔥</span> Thermal Pulse
            </button>
          </div>
        )}
        {/* Electron Animation Toggle - Only visible in Atomic View */}
        {scaleLevel === 'atomic' && (
          <div className="mt-6 pt-4 border-t border-white/10 pointer-events-auto flex flex-col gap-2">
            <button
              onClick={() => {
                playSound('ui_click', { volume: 0.4 });
                setElectronsAnimated(!electronsAnimated);
              }}
              className={`px-3 py-2 border text-[10px] font-bold uppercase transition-all duration-300 w-full rounded
                      ${electronsAnimated
                  ? 'bg-emerald-500/30 text-emerald-200 border-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.3)]'
                  : 'bg-white/5 text-slate-400 border-white/10 hover:bg-white/10 hover:text-white'}`}
            >
              {electronsAnimated ? '⚡ Electrons Orbiting' : '⏸️ Electrons Frozen'}
            </button>

            {/* View Mode Toggle */}
            <button
              onClick={() => setAtomicViewMode(atomicViewMode === 'bohr' ? 'orbital' : 'bohr')}
              className={`px-3 py-2 border text-[10px] font-bold uppercase transition-all duration-300 w-full rounded
                      ${atomicViewMode === 'orbital'
                  ? 'bg-purple-500/30 text-purple-200 border-purple-400 shadow-[0_0_10px_rgba(168,85,247,0.3)]'
                  : 'bg-white/5 text-slate-400 border-white/10 hover:bg-white/10 hover:text-white'}`}
            >
              {atomicViewMode === 'orbital' ? '☁️ Orbital Clouds' : '⚛️ Bohr Model'}
            </button>
          </div>
        )}
      </div>

      {/* Right Middle: Atom Info Card - Only visible in Atomic View */}
      {scaleLevel === 'atomic' && displayElement && (
        <div
          className={`absolute top-1/2 right-8 -translate-y-1/2 bg-slate-900/60 backdrop-blur-xl p-5 rounded-2xl shadow-[0_0_30px_rgba(0,0,0,0.5)] border border-white/10 w-80 pointer-events-auto z-10 transition-all duration-300
              ${isPreview ? 'border-amber-400/50 shadow-[0_0_20px_rgba(251,191,36,0.2)]' : 'border-blue-400/50 shadow-[0_0_20px_rgba(59,130,246,0.2)]'}
            `}
          onWheel={(e) => e.stopPropagation()}
        >
          {isPreview && (
            <div className="absolute -top-3 left-4 bg-amber-500/80 backdrop-blur-sm text-white border border-amber-300 text-[10px] uppercase font-bold px-3 py-0.5 rounded shadow-lg">
              Preview
            </div>
          )}

          <div className="flex justify-between items-start mb-2">
            <div>
              <h2 className="text-3xl font-black text-white leading-none tracking-tight">{displayElement.name}</h2>
              <div className={`text-xs font-bold uppercase tracking-widest mt-1 ${isPreview ? 'text-amber-400' : 'text-blue-400'}`}>
                {displayElement.description}
              </div>
            </div>
            <div className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-br from-white to-slate-400 select-none drop-shadow-lg">{displayElement.symbol}</div>
          </div>

          <div className="h-px bg-white/10 my-4" />

          <div className="space-y-3 text-sm">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/5 p-2 rounded border border-white/5">
                <div className="text-[9px] uppercase tracking-widest text-slate-400 font-bold">Atomic Number</div>
                <div className="font-mono font-bold text-lg text-white">{displayElement.atomicNumber}</div>
              </div>
              <div className="bg-white/5 p-2 rounded border border-white/5">
                <div className="text-[9px] uppercase tracking-widest text-slate-400 font-bold">Atomic Mass</div>
                <div className="font-mono font-bold text-lg text-white">{displayElement.atomicMass}</div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 mt-2">
              <div className="bg-rose-500/10 p-2 rounded text-center border border-rose-500/20">
                <div className="text-[9px] uppercase tracking-widest text-rose-400 font-bold">Protons</div>
                <div className="font-bold text-rose-300">{displayElement.atomicNumber}</div>
              </div>
              <div className="bg-slate-500/10 p-2 rounded text-center border border-slate-500/20">
                <div className="text-[9px] uppercase tracking-widest text-slate-400 font-bold">Neutrons</div>
                <div className="font-bold text-slate-300">{displayElement.neutrons}</div>
              </div>
              <div className="bg-blue-500/10 p-2 rounded text-center border border-blue-500/20">
                <div className="text-[9px] uppercase tracking-widest text-blue-400 font-bold">Electrons</div>
                <div className="font-bold text-blue-300">{displayElement.atomicNumber}</div>
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

            {/* Electron Configuration */}
            <div className="mt-3 pt-2 border-t border-slate-100">
              <div className="text-[10px] uppercase text-slate-400 font-bold mb-1">Electron Configuration</div>
              <div className="font-mono text-xs text-indigo-700 bg-indigo-50 px-2 py-1.5 rounded border border-indigo-100 leading-relaxed">
                {formatElectronConfig(displayElement.atomicNumber)}
              </div>
            </div>

            {/* Emission Spectrum */}
            {EMISSION_SPECTRA[displayElement.symbol] && (
              <div className="mt-3 pt-2 border-t border-slate-100">
                <div className="text-[10px] uppercase text-slate-400 font-bold mb-1">Emission Spectrum</div>
                <div className="relative bg-gray-900 h-5 rounded overflow-hidden border border-slate-300">
                  {/* Visible range label */}
                  <div className="absolute -top-0 left-0 right-0 h-full bg-gradient-to-r from-violet-900/30 via-green-900/10 to-red-900/30" />
                  {EMISSION_SPECTRA[displayElement.symbol].filter(w => w >= 380 && w <= 700).map((wavelength, i) => {
                    const pct = ((wavelength - 380) / (700 - 380)) * 100;
                    return (
                      <div
                        key={i}
                        className="absolute top-0 h-full w-[2px]"
                        style={{
                          left: `${pct}%`,
                          backgroundColor: wavelengthToColor(wavelength),
                          boxShadow: `0 0 4px ${wavelengthToColor(wavelength)}`,
                        }}
                      />
                    );
                  })}
                </div>
                <div className="flex justify-between text-[8px] text-slate-400 mt-0.5 font-mono">
                  <span>380nm (UV)</span>
                  <span>700nm (IR)</span>
                </div>
              </div>
            )}

            {/* Periodic Trends */}
            {(displayElement.electronegativity !== undefined || displayElement.atomicRadius !== undefined || displayElement.ionizationEnergy !== undefined) && (
              <div className="mt-3 pt-2 border-t border-slate-100">
                <div className="text-[10px] uppercase text-slate-400 font-bold mb-1">Periodic Trends</div>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="bg-white/5 p-1.5 rounded border border-white/5">
                    <div className="text-[8px] uppercase tracking-widest text-slate-400 font-bold">Electroneg.</div>
                    <div className="font-mono font-bold text-white">{displayElement.electronegativity ?? '—'}</div>
                  </div>
                  <div className="bg-white/5 p-1.5 rounded border border-white/5">
                    <div className="text-[8px] uppercase tracking-widest text-slate-400 font-bold">Radius</div>
                    <div className="font-mono font-bold text-white">{displayElement.atomicRadius ? `${displayElement.atomicRadius}pm` : '—'}</div>
                  </div>
                  <div className="bg-white/5 p-1.5 rounded border border-white/5">
                    <div className="text-[8px] uppercase tracking-widest text-slate-400 font-bold">Ioniz. E.</div>
                    <div className="font-mono font-bold text-white">{displayElement.ionizationEnergy ? `${displayElement.ionizationEnergy}` : '—'}</div>
                  </div>
                </div>
              </div>
            )}

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
      )
      }

      {/* Bottom Center: Periodic Table - Only visible in Atomic View */}
      {
        scaleLevel === 'atomic' && (
          <PeriodicTable />
        )
      }

      {/* Bottom Left: Molecule Gallery - Only visible in Molecular View */}
      {
        scaleLevel === 'molecular' && (
          <MoleculeGallery />
        )
      }

      {/* Molecular State Info Card */}
      {
        scaleLevel === 'molecular' && (
          <div className="absolute top-1/2 right-8 -translate-y-1/2 bg-slate-900/60 backdrop-blur-xl p-5 rounded-2xl shadow-[0_0_30px_rgba(0,0,0,0.5)] border border-emerald-400/50 w-80 pointer-events-auto z-10 transition-all duration-300">
            <h2 className="text-2xl font-black text-white leading-none tracking-tight mb-1 mt-1">
              {showSpecialMolecule ? (getMoleculeForElement(displayElement.symbol)?.name || "Molecular Compound") : (
                materialType === 'solid' ? '🧊 Crystal Lattice' :
                  materialType === 'liquid' ? '💧 Liquid State' : '💨 Gas State'
              )}
            </h2>
            <div className="text-[11px] font-bold uppercase tracking-widest text-emerald-400 mb-4">
              {showSpecialMolecule ?
                `Formula: ${getMoleculeForElement(displayElement.symbol)?.formula}` :
                `${selectedElement.name} • ${temperature}K`}
            </div>

            <div className="h-px bg-white/10 mb-4" />

            <div className="space-y-3 text-sm text-slate-300">
              {showSpecialMolecule && (
                <div className="bg-emerald-500/10 p-3 rounded-lg border border-emerald-500/20 italic text-[11px] leading-relaxed text-emerald-100">
                  {getMoleculeForElement(displayElement.symbol)?.description}
                </div>
              )}

              {!showSpecialMolecule && materialType === 'solid' && (
                <>
                  <div className="bg-white/5 p-2.5 rounded border border-white/5">
                    <div className="text-[9px] uppercase tracking-widest text-emerald-400 font-bold mb-1">Arrangement</div>
                    <div className="font-semibold text-white text-[11px]">Fixed crystalline lattice, 27 atoms</div>
                  </div>
                  <div className="bg-white/5 p-2.5 rounded border border-white/5">
                    <div className="text-[9px] uppercase tracking-widest text-slate-400 font-bold mb-1">Motion</div>
                    <div className="text-[11px]">Vibrational only — atoms oscillate in place</div>
                  </div>
                  <div className="bg-white/5 p-2.5 rounded border border-white/5">
                    <div className="text-[9px] uppercase tracking-widest text-blue-400 font-bold mb-1">Bonds</div>
                    <div className="text-[11px] text-blue-200">Strong ionic/covalent bonds with pulsing energy</div>
                  </div>
                </>
              )}
              {materialType === 'liquid' && (
                <>
                  <div className="bg-white/5 p-2.5 rounded border border-white/5">
                    <div className="text-[9px] uppercase tracking-widest text-cyan-400 font-bold mb-1">Arrangement</div>
                    <div className="font-semibold text-white text-[11px]">Loosely packed, 150 particles</div>
                  </div>
                  <div className="bg-white/5 p-2.5 rounded border border-white/5">
                    <div className="text-[9px] uppercase tracking-widest text-slate-400 font-bold mb-1">Motion</div>
                    <div className="text-[11px]">Flowing — particles slide past each other</div>
                  </div>
                  <div className="bg-white/5 p-2.5 rounded border border-white/5">
                    <div className="text-[9px] uppercase tracking-widest text-blue-400 font-bold mb-1">Bonds</div>
                    <div className="text-[11px] text-blue-200">Weak intermolecular forces (Van der Waals)</div>
                  </div>
                </>
              )}
              {materialType === 'gas' && (
                <>
                  <div className="bg-white/5 p-2.5 rounded border border-white/5">
                    <div className="text-[9px] uppercase tracking-widest text-violet-400 font-bold mb-1">Arrangement</div>
                    <div className="font-semibold text-white text-[11px]">Random, 60 free particles</div>
                  </div>
                  <div className="bg-white/5 p-2.5 rounded border border-white/5">
                    <div className="text-[9px] uppercase tracking-widest text-slate-400 font-bold mb-1">Motion</div>
                    <div className="text-[11px]">Rapid Brownian motion with elastic collisions</div>
                  </div>
                  <div className="bg-white/5 p-2.5 rounded border border-white/5">
                    <div className="text-[9px] uppercase tracking-widest text-orange-400 font-bold mb-1">Kinetic Energy</div>
                    <div className="text-[11px] text-orange-200">Eₖ ∝ T — proportional to temperature ({temperature}K)</div>
                  </div>
                </>
              )}
            </div>

            <div className="mt-4 pt-3 border-t border-white/10 text-[9px] uppercase tracking-wider text-slate-500 font-bold text-center">
              Adjust temperature to see effects
            </div>
          </div>
        )
      }

      {/* Subatomic Info Panel */}
      {
        scaleLevel === 'subatomic' && (() => {
          const protons = selectedElement.atomicNumber;
          const neutrons = selectedElement.neutrons;
          const massNumber = protons + neutrons;
          const nzRatio = protons > 0 ? neutrons / protons : 0;
          const isStable = nzRatio >= 0.9 && nzRatio <= 1.6 && protons <= 83;
          const nuclearRadius = (1.2 * Math.pow(massNumber, 1 / 3)).toFixed(2);
          const bindingEnergy = (massNumber * 7.5).toFixed(0); // Approximate
          const bePerNucleon = massNumber > 0 ? (7.5).toFixed(2) : '0';

          return (
            <div className="absolute top-1/2 right-8 -translate-y-1/2 bg-slate-900/60 backdrop-blur-xl p-5 rounded-2xl shadow-[0_0_30px_rgba(0,0,0,0.5)] border border-red-500/50 w-80 pointer-events-auto z-10 transition-all duration-300">
              <h2 className="text-2xl font-black text-white leading-none tracking-tight mb-1 mt-1">
                {selectedElement.name}-{massNumber} Nucleus
              </h2>
              <div className="text-[11px] uppercase tracking-widest text-red-400 font-bold mb-3">
                <sup>{massNumber}</sup><sub>{protons}</sub>{selectedElement.symbol}
              </div>

              <div className="h-px bg-white/10 my-3" />

              {/* Composition */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="bg-red-500/10 p-2.5 rounded border border-red-500/20 text-center relative overflow-hidden">
                  <div className="text-[9px] uppercase tracking-widest text-red-400 font-bold mb-0.5">Protons (p+)</div>
                  <div className="text-xl font-bold text-red-300 relative z-10">{protons}</div>
                  <div className="absolute -bottom-2 -right-2 w-10 h-10 rounded-full bg-red-500/20 blur-md pointer-events-none" />
                </div>
                <div className="bg-blue-500/10 p-2.5 rounded border border-blue-500/20 text-center relative overflow-hidden">
                  <div className="text-[9px] uppercase tracking-widest text-blue-400 font-bold mb-0.5">Neutrons (n0)</div>
                  <div className="text-xl font-bold text-blue-300 relative z-10">{neutrons}</div>
                  <div className="absolute -bottom-2 -left-2 w-10 h-10 rounded-full bg-blue-500/20 blur-md pointer-events-none" />
                </div>
              </div>

              {/* Nuclear Properties */}
              <div className="space-y-2 text-[11px] text-slate-300">
                <div className="flex justify-between items-center bg-white/5 px-2 py-1 rounded">
                  <span className="text-[9px] uppercase tracking-widest text-slate-400 font-bold">Mass Number (A)</span>
                  <span className="font-bold text-white">{massNumber}</span>
                </div>
                <div className="flex justify-between items-center bg-white/5 px-2 py-1 rounded">
                  <span className="text-[9px] uppercase tracking-widest text-slate-400 font-bold">Nuclear Radius</span>
                  <span className="font-bold text-white">{nuclearRadius} fm</span>
                </div>
                <div className="flex justify-between items-center bg-white/5 px-2 py-1 rounded">
                  <span className="text-[9px] uppercase tracking-widest text-slate-400 font-bold">N/Z Ratio</span>
                  <span className="font-bold text-white">{nzRatio.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center bg-white/5 px-2 py-1 rounded">
                  <span className="text-[9px] uppercase tracking-widest text-slate-400 font-bold">Binding Energy</span>
                  <span className="font-bold text-blue-200">~{bindingEnergy} MeV</span>
                </div>
                <div className="flex justify-between items-center bg-white/5 px-2 py-1 rounded">
                  <span className="text-[9px] uppercase tracking-widest text-slate-400 font-bold">BE p/Nucleon</span>
                  <span className="font-bold text-emerald-300">~{bePerNucleon} MeV</span>
                </div>
              </div>

              {/* Stability Indicator */}
              <div className={`mt-4 p-2 rounded border text-[10px] uppercase tracking-widest font-bold text-center shadow-inner ${isStable
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                : 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                }`}>
                {isStable ? '✅ Stable Isotope' : '⚠️ Unstable Decay'}
                {!isStable && nzRatio < 0.9 && ' (low N)'}
                {!isStable && nzRatio > 1.6 && ' (high N)'}
                {!isStable && protons > 83 && ' (Z > 83)'}
              </div>

              {/* Interactive Controls */}
              <div className="mt-4 pt-4 border-t border-white/10">
                <div className="text-[9px] uppercase tracking-widest text-slate-400 font-bold mb-2 text-center">Interactive Controls</div>
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between gap-3 bg-white/5 p-1 rounded-lg border border-white/5">
                    <button
                      onClick={() => {
                        playSound('ui_click', { volume: 0.3 });
                        const { setNeutronCount } = useGameStore.getState().actions;
                        if (neutrons > 0) setNeutronCount(neutrons - 1);
                      }}
                      className="px-4 py-1.5 bg-rose-500/20 text-rose-300 rounded font-bold hover:bg-rose-500/40 transition-colors disabled:opacity-30 border border-rose-500/30 text-xs"
                      disabled={neutrons <= 0}
                    >
                      -
                    </button>
                    <span className="text-sm font-mono font-bold text-white tracking-widest">{neutrons}n</span>
                    <button
                      onClick={() => {
                        playSound('ui_click', { volume: 0.3 });
                        const { setNeutronCount } = useGameStore.getState().actions;
                        setNeutronCount(neutrons + 1);
                      }}
                      className="px-4 py-1.5 bg-blue-500/20 text-blue-300 rounded font-bold hover:bg-blue-500/40 transition-colors border border-blue-500/30 text-xs"
                    >
                      +
                    </button>
                  </div>

                  <button
                    onClick={() => {
                      playSound('ui_click', { volume: 0.3 });
                      setShowQuarks(!showQuarks);
                    }}
                    className={`px-4 py-2 rounded-lg font-bold transition-all border text-[10px] uppercase tracking-widest w-full flex items-center justify-center gap-2 ${showQuarks
                      ? 'bg-violet-500/30 text-violet-200 border-violet-400 shadow-[0_0_10px_rgba(139,92,246,0.3)]'
                      : 'bg-white/5 text-slate-400 border-white/10 hover:bg-white/10 hover:text-white'
                      }`}
                  >
                    <span>{showQuarks ? '🔬' : '⚛️'}</span> {showQuarks ? 'Hide Quarks' : 'Show Quarks (uud/udd)'}
                  </button>

                  {!isStable && (
                    <button
                      onClick={() => {
                        const { setDecaying } = useGameStore.getState().actions;
                        playSound('ui_click', { volume: 0.4 });
                        setDecaying(true);
                      }}
                      className="px-4 py-2 bg-amber-500/20 text-amber-300 rounded-lg font-bold hover:bg-amber-500/40 hover:shadow-[0_0_15px_rgba(245,158,11,0.4)] transition-all border border-amber-500/30 text-[10px] uppercase tracking-widest w-full flex items-center justify-center gap-2 animate-pulse"
                    >
                      <span>☢️</span> Trigger Decay
                    </button>
                  )}

                  <button
                    onClick={() => {
                      const { fireCollision } = useGameStore.getState().actions;
                      // Sound is handled in Nucleus.tsx
                      fireCollision();
                    }}
                    className="px-4 py-2 bg-purple-500/20 text-purple-300 rounded-lg font-bold hover:bg-purple-500/40 hover:shadow-[0_0_15px_rgba(168,85,247,0.4)] transition-all border border-purple-500/30 text-[10px] uppercase tracking-widest w-full flex items-center justify-center gap-2"
                  >
                    <span>💥</span> Trigger Collider
                  </button>
                </div>
              </div>

              {/* Forces Info */}
              <div className="mt-4 pt-3 border-t border-white/10 text-[9px] text-slate-400 uppercase tracking-widest text-center leading-relaxed">
                <div className="flex items-center justify-center gap-1.5 mb-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-400 inline-block shadow-[0_0_5px_rgba(248,113,113,0.8)]" />
                  <span className="w-1.5 h-1.5 rounded-full bg-green-400 inline-block shadow-[0_0_5px_rgba(74,222,128,0.8)]" />
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-400 inline-block shadow-[0_0_5px_rgba(96,165,250,0.8)]" />
                  <span className="font-bold ml-1 text-slate-300">Strong Force</span>
                </div>
                Gluons carry force between quarks <br /> <span className="text-white/50 lowercase mt-1 inline-block">ctrl+click nucleus for physics details</span>
              </div>
            </div>
          );
        })()
      }

      {/* Contextual Info Tips */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 max-w-lg text-center pointer-events-none z-10 transition-all duration-500">
        {scaleLevel === 'molecular' && (
          <div className="bg-slate-900/60 backdrop-blur-md px-5 py-2.5 rounded-full shadow-[0_0_20px_rgba(0,0,0,0.5)] border border-white/10">
            <p className="text-[10px] uppercase tracking-widest text-slate-300 font-bold whitespace-nowrap">
              <span className="text-emerald-400 mr-2">🔬 Molecular</span>
              Switch states and <span className="text-orange-400">adjust temperature</span> to interact
            </p>
          </div>
        )}
        {scaleLevel === 'atomic' && (
          <div className="bg-slate-900/60 backdrop-blur-md px-5 py-2.5 rounded-full shadow-[0_0_20px_rgba(0,0,0,0.5)] border border-white/10">
            <p className="text-[10px] uppercase tracking-widest text-slate-300 font-bold whitespace-nowrap">
              <span className="text-blue-400 mr-2">⚛️ Atomic</span>
              Pick elements from <span className="text-indigo-400">Periodic Table</span> &amp; toggle <span className="text-purple-400">View Modes</span>
            </p>
          </div>
        )}
        {scaleLevel === 'subatomic' && (
          <div className="bg-slate-900/60 backdrop-blur-md px-5 py-2.5 rounded-full shadow-[0_0_20px_rgba(0,0,0,0.5)] border border-white/10">
            <p className="text-[10px] uppercase tracking-widest text-slate-300 font-bold whitespace-nowrap">
              <span className="text-rose-400 mr-2">🔴🔵 Subatomic</span>
              Modify neutrons to build <span className="text-emerald-400">Isotopes</span>. Ctrl+Click for physics insights
            </p>
          </div>
        )}
      </div>

    </div >
  );
}

function App() {
  const scaleLevel = useGameStore((state) => state.scaleLevel);
  const currentScale = useGameStore((state) => state.currentScale);
  const cinematicMode = useGameStore((state) => state.cinematicMode);
  const setCinematicMode = useGameStore.getState().actions.setCinematicMode;
  const [showAcademy, setShowAcademy] = useState(false);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const { playSound } = useAudio();

  // Scale-responsive background color
  const bgColor = useMemo(() => {
    if (currentScale > 5) return '#e4e8ec'; // Lab grey for molecular
    if (currentScale > 2) {
      // Transition from grey to dark
      const t = (currentScale - 2) / 3;
      const r = Math.round(10 + t * (228 - 10));
      const g = Math.round(10 + t * (232 - 10));
      const b = Math.round(30 + t * (236 - 30));
      return `rgb(${r},${g},${b})`;
    }
    return '#0a0a1e'; // Deep space for atomic/subatomic
  }, [currentScale]);

  // Scale-responsive bloom intensity
  const bloomIntensity = useMemo(() => {
    if (currentScale < 1.5) return 0.8; // Stronger bloom for subatomic glow
    if (currentScale < 2.5) return 0.5; // Medium for atomic
    return 0.3; // Subtle for molecular
  }, [currentScale]);

  // Scroll-to-zoom navigation
  const handleWheel = useCallback((e: WheelEvent) => {
    const target = e.target as HTMLElement;
    if (target.tagName !== 'CANVAS') {
      return;
    }
    e.preventDefault();

    // Ignore tiny micro-scrolls from trackpads when just resting fingers
    if (Math.abs(e.deltaY) < 2) return;

    const { targetScale } = useGameStore.getState();
    const { setTargetScale } = useGameStore.getState().actions;

    // Proportional zooming based on the delta amount, smoother for trackpads
    const delta = (e.deltaY * 0.01);
    setTargetScale(targetScale + delta);
  }, []);

  // Keyboard shortcuts
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    // Don't trigger if typing in an input
    if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
    const { setTargetScale } = useGameStore.getState().actions;
    switch (e.key) {
      case '1': setTargetScale(12.0); break; // Molecular
      case '2': setTargetScale(2.0); break;  // Atomic
      case '3': setTargetScale(0.5); break;  // Subatomic
    }
  }, []);

  useEffect(() => {
    window.addEventListener('wheel', handleWheel, { passive: false });
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('wheel', handleWheel);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleWheel, handleKeyDown]);

  return (
    <div className="w-full h-screen relative" style={{ background: bgColor, transition: 'background 0.8s ease' }}>
      <div className="ui-layer">
        <GameUI />
      </div>

      {/* Dark Backdrop for Periodic Table */}
      <div
        className={`absolute inset-0 bg-slate-900/40 backdrop-blur-sm z-40 transition-opacity duration-500 pointer-events-none ${useGameStore((state) => state.isTableExpanded) ? 'opacity-100' : 'opacity-0'}`}
      />

      {/* Top Right Controls Group */}
      <div className="absolute top-4 right-4 z-50 flex items-center gap-3">
        {/* Keyboard Shortcuts Hint */}
        <div className="relative">
          <button
            onClick={() => setShowShortcuts(!showShortcuts)}
            className="ui-layer h-10 px-4 flex items-center gap-2 bg-slate-800/80 hover:bg-slate-700 backdrop-blur-md text-white rounded-xl shadow-lg transition-all duration-200 font-bold text-xs uppercase tracking-wider border border-white/10 group"
          >
            <Keyboard className="w-4 h-4 group-hover:scale-110 transition-transform" />
            Keys
          </button>

          {showShortcuts && (
            <div className="ui-layer absolute top-full mt-3 right-0 z-50 bg-slate-800/95 backdrop-blur-xl text-white p-4 rounded-xl shadow-2xl text-xs font-mono border border-white/10 min-w-[220px]">
              <div className="font-bold text-slate-300 mb-3 uppercase tracking-wider text-[10px]">Keyboard Shortcuts</div>
              <div className="space-y-2">
                <div className="flex justify-between items-center gap-6"><span className="text-slate-400">Molecular view</span><kbd className="bg-slate-900 px-2 py-1 rounded-md text-[10px] border border-white/5 shadow-inner font-bold text-slate-300">1</kbd></div>
                <div className="flex justify-between items-center gap-6"><span className="text-slate-400">Atomic view</span><kbd className="bg-slate-900 px-2 py-1 rounded-md text-[10px] border border-white/5 shadow-inner font-bold text-slate-300">2</kbd></div>
                <div className="flex justify-between items-center gap-6"><span className="text-slate-400">Subatomic view</span><kbd className="bg-slate-900 px-2 py-1 rounded-md text-[10px] border border-white/5 shadow-inner font-bold text-slate-300">3</kbd></div>
                <div className="flex justify-between items-center gap-6"><span className="text-slate-400">Zoom in/out</span><kbd className="bg-slate-900 px-2 py-1 rounded-md text-[10px] border border-white/5 shadow-inner font-bold text-slate-300">Scroll</kbd></div>
              </div>
            </div>
          )}
        </div>

        {/* Cinematic Mode Button */}
        <button
          onClick={() => {
            playSound('ui_click', { volume: 0.5 });
            setCinematicMode(!cinematicMode);
          }}
          className={`ui-layer h-10 w-12 flex items-center justify-center backdrop-blur-md rounded-xl shadow-lg transition-all duration-200 border group ${cinematicMode ? 'bg-amber-500/80 hover:bg-amber-400 border-amber-300 text-white shadow-[0_0_15px_rgba(245,158,11,0.5)]' : 'bg-slate-800/80 hover:bg-slate-700 border-white/10 text-slate-200 hover:text-white'}`}
          title={cinematicMode ? "Disable Cinematic Mode" : "Enable Cinematic Mode"}
        >
          <Sparkles className={`w-4 h-4 transition-all ${cinematicMode ? 'scale-110 text-white' : 'group-hover:scale-110 group-hover:text-amber-300'}`} />
        </button>

        {/* Photo Mode Button */}
        <button
          onClick={() => {
            playSound('ui_click', { volume: 0.5 });
            const flash = document.createElement('div');
            flash.className = 'absolute inset-0 bg-white z-[9999] pointer-events-none transition-opacity duration-300';
            document.body.appendChild(flash);
            const uiElements = document.querySelectorAll('.ui-layer');
            uiElements.forEach(el => (el as HTMLElement).style.display = 'none');
            const overlays = document.querySelectorAll('.fixed.inset-0.z-50');
            overlays.forEach(el => (el as HTMLElement).style.display = 'none');

            setTimeout(() => {
              const canvas = document.querySelector('canvas');
              if (canvas) {
                try {
                  const dataUrl = canvas.toDataURL('image/png');
                  const link = document.createElement('a');
                  link.download = `quantum_explorer_${scaleLevel}_${Date.now()}.png`;
                  link.href = dataUrl;
                  link.click();
                } catch (e) {
                  console.error("Screenshot failed. Is preserveDrawingBuffer set?", e);
                }
              }

              uiElements.forEach(el => (el as HTMLElement).style.display = '');
              overlays.forEach(el => (el as HTMLElement).style.display = '');
              flash.style.opacity = '0';
              setTimeout(() => document.body.removeChild(flash), 300);
            }, 100);
          }}
          className="ui-layer h-10 w-12 flex items-center justify-center bg-slate-800/80 hover:bg-slate-700 backdrop-blur-md text-white rounded-xl shadow-lg transition-all duration-200 border border-white/10 group"
          title="Take Screenshot"
        >
          <Camera className="w-4 h-4 text-slate-200 group-hover:scale-110 group-hover:text-white transition-all" />
        </button>

        {/* Academy Open Button */}
        <button
          onClick={() => setShowAcademy(true)}
          className="ui-layer h-10 px-4 flex items-center gap-2 bg-indigo-600/90 hover:bg-indigo-600 backdrop-blur-md text-white rounded-xl shadow-lg hover:shadow-[0_0_15px_rgba(79,70,229,0.5)] transition-all duration-200 font-bold text-xs uppercase tracking-wider border border-white/10 group"
        >
          <BookOpen className="w-4 h-4 group-hover:scale-110 transition-transform" />
          Learn
        </button>
      </div>

      {/* Academy Modal */}
      {showAcademy && (
        <QuantumAcademy
          onClose={() => setShowAcademy(false)}
          startCategory={
            scaleLevel === 'molecular' ? 'Molecular' :
              scaleLevel === 'atomic' ? 'Atomic' : 'Subatomic'
          }
        />
      )}

      {/* Info Popup & Hover Tooltip */}
      <InfoPopup />
      <HoverTooltip />

      {/* First-time onboarding tour */}
      <FirstTimeTour />

      <Canvas
        dpr={[1, 2]}
        gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping }}
        camera={{ position: [0, 0, 10], fov: 35 }}
        shadows
      >
        <color attach="background" args={[bgColor]} />

        {/* Realistic Studio Lighting */}
        {scaleLevel === 'molecular' && <Environment preset="studio" blur={1} />}
        <ambientLight intensity={scaleLevel === 'molecular' ? 0.5 : scaleLevel === 'atomic' ? 0.4 : 0.25} />
        <directionalLight
          position={[5, 10, 7]}
          intensity={scaleLevel === 'molecular' ? 1.2 : 0.6}
          castShadow
          shadow-mapSize={[1024, 1024]}
        />
        {/* Warm Fill Light */}
        <directionalLight
          position={[-4, -3, 3]}
          intensity={scaleLevel === 'molecular' ? 0.4 : 0.2}
          color={scaleLevel === 'molecular' ? '#ffeedd' : '#aaccff'}
        />
        {/* Point light for subatomic dramatic glow */}
        {scaleLevel === 'subatomic' && (
          <pointLight position={[0, 0, 3]} intensity={1.5} color="#ff6644" distance={15} />
        )}

        <CameraController />
        <SceneManager />

        {/* Ground Shadows for realism */}
        {scaleLevel === 'molecular' && (
          <ContactShadows
            position={[0, -6, 0]} // Move to floor
            resolution={1024}
            scale={20}
            blur={3}
            opacity={0.4}
            far={10}
            color="#000000"
          />
        )}

        {/* Cinematic Post Processing */}
        {cinematicMode ? (
          <EffectComposer>
            <DepthOfField focusDistance={0.01} focalLength={0.05} bokehScale={2} height={480} />
            <SSAO samples={31} radius={0.2} intensity={20} luminanceInfluence={0.6} color={new THREE.Color(0x000000)} />
            <ChromaticAberration offset={new THREE.Vector2(0.002, 0.002)} />
            <Bloom
              luminanceThreshold={scaleLevel === 'subatomic' ? 0.6 : 1}
              intensity={bloomIntensity * 1.5}
              levels={9}
              mipmapBlur
            />
            <Noise opacity={0.025} />
          </EffectComposer>
        ) : (
          <EffectComposer>
            <Bloom
              luminanceThreshold={scaleLevel === 'subatomic' ? 0.6 : 1}
              intensity={bloomIntensity}
              levels={9}
              mipmapBlur
            />
            <Noise opacity={0.025} />
          </EffectComposer>
        )}
      </Canvas>
    </div>
  );
}

export default App;
