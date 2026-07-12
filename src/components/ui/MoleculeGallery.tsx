import { useGameStore } from '../../store/useGameStore';
import { MOLECULE_PRESETS } from '../../data/molecules';
import { useAudio } from '../../hooks/useAudio';
import { FlaskConical } from 'lucide-react';

export function MoleculeGallery() {
    const { isMoleculeGalleryOpen, showSpecialMolecule, activeMoleculeId, materialType } = useGameStore();
    const { setMoleculeGalleryOpen, setActiveMolecule, setShowSpecialMolecule, setTargetScale } = useGameStore.getState().actions;
    const { playSound } = useAudio();

    if (!isMoleculeGalleryOpen) {
        return (
            <button
                onClick={() => { playSound('ui_click', { volume: 0.3 }); setMoleculeGalleryOpen(true); }}
                className="absolute bottom-6 left-6 z-50 bg-slate-900/80 backdrop-blur-md p-4 rounded-full shadow-[0_0_15px_rgba(16,185,129,0.3)] border border-emerald-500/30 pointer-events-auto hover:bg-slate-800 hover:scale-105 hover:border-emerald-400 transition-all group"
                title="Browse Molecules"
            >
                <div className="flex items-center gap-2">
                    <FlaskConical className="w-6 h-6 text-emerald-300 group-hover:rotate-12 transition-transform drop-shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
                    <span className="font-bold text-sm text-emerald-100 uppercase tracking-widest hidden group-hover:block transition-all">Browse Molecules</span>
                </div>
            </button>
        );
    }

    const molecules = Object.values(MOLECULE_PRESETS);

    return (
        <div className="absolute inset-x-0 bottom-8 mx-auto z-50 bg-slate-950/70 backdrop-blur-xl p-6 rounded-2xl shadow-[0_0_40px_rgba(0,0,0,0.8)] border border-white/10 pointer-events-auto w-max max-w-[95vw] origin-bottom transition-all flex flex-col items-center">
            <div className="flex justify-between items-center mb-5 w-full px-2 gap-8">
                <h3 className="text-lg font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-blue-400 uppercase tracking-widest flex items-center gap-3 drop-shadow-sm">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span> Molecule Gallery
                </h3>
                <button
                    onClick={() => { playSound('ui_click', { volume: 0.3 }); setMoleculeGalleryOpen(false); }}
                    className="text-xs font-bold text-slate-400 hover:text-white uppercase tracking-widest px-3 py-1.5 rounded bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/20 transition-all flex items-center gap-2"
                >
                    <span className="text-lg leading-none">&times;</span> Close
                </button>
            </div>

            <div className="grid grid-cols-4 gap-3 w-[820px] max-w-[90vw] max-h-[50vh] overflow-y-auto p-1" style={{ scrollbarWidth: 'thin', scrollbarColor: '#10b981 transparent' }}>
                {/* Plain element card — turns compound mode off, shows raw crystal/liquid/gas of selected element */}
                <button
                    onClick={() => {
                        playSound('ui_click', { volume: 0.3 });
                        setShowSpecialMolecule(false);
                        setActiveMolecule(null);
                        setTargetScale(12.0);
                        setMoleculeGalleryOpen(false);
                    }}
                    className={`text-left p-3 rounded-xl border transition-all duration-200 ${!showSpecialMolecule
                        ? 'bg-blue-600/20 border-blue-400/60 shadow-[0_0_15px_rgba(59,130,246,0.2)]'
                        : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20'
                        }`}
                >
                    <div className="text-[9px] uppercase tracking-widest text-blue-300 font-bold mb-1">Element ({materialType})</div>
                    <div className="text-sm font-bold text-white mb-1">Plain Element</div>
                    <div className="text-[10px] text-slate-400 leading-snug">View the selected element's own crystal, liquid, or gas structure.</div>
                </button>

                {molecules.map((mol) => {
                    const isActive = showSpecialMolecule && activeMoleculeId === mol.id;
                    return (
                        <button
                            key={mol.id}
                            onClick={() => {
                                playSound('ui_click', { volume: 0.3 });
                                setTargetScale(12.0);
                                setActiveMolecule(mol.id);
                                setShowSpecialMolecule(true);
                                setMoleculeGalleryOpen(false);
                            }}
                            className={`text-left p-3 rounded-xl border transition-all duration-200 ${isActive
                                ? 'bg-emerald-600/20 border-emerald-400/60 shadow-[0_0_15px_rgba(16,185,129,0.2)]'
                                : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20'
                                }`}
                        >
                            <div className="text-[9px] uppercase tracking-widest text-emerald-300 font-bold mb-1">{mol.formula}</div>
                            <div className="text-sm font-bold text-white mb-1">{mol.name}</div>
                            <div className="text-[10px] text-slate-400 leading-snug line-clamp-3">{mol.description}</div>
                        </button>
                    );
                })}
            </div>

            <p className="mt-4 text-[9px] text-slate-500 uppercase tracking-widest text-center">
                Pick any molecule to load it instantly, regardless of the currently selected element
            </p>
        </div>
    );
}
