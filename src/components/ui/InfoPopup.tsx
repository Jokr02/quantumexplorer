import React from 'react';
import { useGameStore } from '../../store/useGameStore';
import { X, ArrowRight } from 'lucide-react';
import { useAudio } from '../../hooks/useAudio';

export const InfoPopup: React.FC = () => {
    const infoPopup = useGameStore((state) => state.infoPopup);
    const { hideInfoPopup } = useGameStore.getState().actions;
    const { playSound } = useAudio();

    if (!infoPopup) return null;

    return (
        <div
            className="absolute inset-0 z-[150] flex items-center justify-center pointer-events-auto"
            onClick={(e) => { if (e.target === e.currentTarget) { playSound('ui_click', { volume: 0.2 }); hideInfoPopup(); } }}
        >
            <div
                className="bg-[#0f1029]/95 border border-indigo-500/30 rounded-2xl shadow-[0_0_40px_rgba(79,70,229,0.15)] max-w-md w-full mx-4 overflow-hidden"
                style={{ animation: 'slideUp 0.3s ease-out' }}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-5 border-b border-white/10">
                    <div>
                        {infoPopup.category && (
                            <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-indigo-400/60 block mb-1">
                                {infoPopup.category}
                            </span>
                        )}
                        <h3 className="text-xl font-black text-white tracking-tight">{infoPopup.title}</h3>
                    </div>
                    <button
                        onClick={() => { playSound('ui_click', { volume: 0.2 }); hideInfoPopup(); }}
                        className="p-2 text-gray-400 hover:text-white transition-colors rounded-full hover:bg-white/10 cursor-pointer"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-5 space-y-3 max-h-[50vh] overflow-y-auto" style={{ scrollbarWidth: 'thin', scrollbarColor: '#4f46e5 transparent' }}>
                    {infoPopup.content.map((paragraph, idx) => (
                        <p key={idx} className="text-gray-300 text-sm leading-relaxed">
                            {paragraph}
                        </p>
                    ))}
                </div>

                {/* Action Button */}
                {infoPopup.action && (
                    <div className="p-4 border-t border-white/10 bg-white/[0.02]">
                        <button
                            onClick={() => {
                                playSound('ui_click', { volume: 0.3 });
                                infoPopup.action!.callback();
                                hideInfoPopup();
                            }}
                            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer group"
                        >
                            {infoPopup.action.label}
                            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};
