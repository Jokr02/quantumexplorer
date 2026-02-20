import React, { useState } from 'react';
import { QUANTUM_TOPICS } from '../../data/quantumTopics';
import type { QuantumTopic } from '../../data/quantumTopics';
import { useGameStore } from '../../store/useGameStore';
import { ELEMENTS } from '../../data/elements';
import { X, BookOpen, Atom, FlaskConical, Zap, Radiation, ChevronRight, Info, Orbit } from 'lucide-react';
import 'katex/dist/katex.min.css';
import { BlockMath, InlineMath } from 'react-katex';

interface QuantumAcademyProps {
    onClose: () => void;
    startCategory?: 'Atomic' | 'Molecular' | 'Subatomic' | 'Nuclear' | 'Quantum';
}

const FormattedText: React.FC<{ text: string }> = ({ text }) => {
    const parts = text.split(/(\$.*?\$)/g);

    return (
        <>
            {parts.map((part, i) => {
                if (part.startsWith('$') && part.endsWith('$')) {
                    const math = part.slice(1, -1);
                    return <InlineMath key={i} math={math} />;
                }
                return <span key={i}>{part}</span>;
            })}
        </>
    );
};

export const QuantumAcademy: React.FC<QuantumAcademyProps> = ({ onClose, startCategory }) => {
    // Determine initial topic based on startCategory, fallback to first overall topic
    const initialTopic = startCategory
        ? QUANTUM_TOPICS.find(t => t.category === startCategory)
        : QUANTUM_TOPICS[0];

    const [selectedTopicId, setSelectedTopicId] = useState<string>(initialTopic?.id || QUANTUM_TOPICS[0].id);

    const selectedTopic: QuantumTopic = QUANTUM_TOPICS.find(t => t.id === selectedTopicId) || QUANTUM_TOPICS[0];

    const getIcon = (category: string) => {
        switch (category) {
            case 'Atomic': return <Atom className="w-5 h-5" />;
            case 'Molecular': return <FlaskConical className="w-5 h-5" />;
            case 'Subatomic': return <Orbit className="w-5 h-5" />;
            case 'Nuclear': return <Radiation className="w-5 h-5" />;
            case 'Quantum': return <Zap className="w-5 h-5" />;
            default: return <BookOpen className="w-5 h-5" />;
        }
    };

    const getCategoryColor = (category: string) => {
        switch (category) {
            case 'Atomic': return 'text-cyan-400 border-cyan-500/30 bg-cyan-600/20';
            case 'Molecular': return 'text-emerald-400 border-emerald-500/30 bg-emerald-600/20';
            case 'Subatomic': return 'text-red-400 border-red-500/30 bg-red-600/20';
            case 'Nuclear': return 'text-orange-400 border-orange-500/30 bg-orange-600/20';
            case 'Quantum': return 'text-violet-400 border-violet-500/30 bg-violet-600/20';
            default: return 'text-blue-400 border-blue-500/30 bg-blue-600/20';
        }
    };

    const categories = ['Atomic', 'Molecular', 'Subatomic', 'Nuclear', 'Quantum'] as const;

    return (
        <div className="absolute inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-md"
            style={{ animation: 'fadeIn 0.3s ease-out' }}>
            <div className="bg-[#0a0a1a]/95 border border-indigo-500/30 w-[90%] h-[85%] max-w-6xl rounded-2xl flex overflow-hidden shadow-[0_0_60px_rgba(79,70,229,0.2)]"
                style={{ animation: 'slideUp 0.4s ease-out' }}>

                {/* Sidebar */}
                <div className="w-72 border-r border-indigo-500/20 bg-indigo-900/10 flex flex-col shrink-0">
                    <div className="p-6 border-b border-indigo-500/20">
                        <div className="flex items-center gap-2 text-indigo-400 mb-1">
                            <BookOpen className="w-5 h-5" />
                            <span className="text-[10px] font-bold uppercase tracking-[0.2em]">Learning Hub</span>
                        </div>
                        <h2 className="text-xl font-black text-white tracking-tight">Quantum Academy</h2>
                    </div>

                    <div className="flex-1 overflow-y-auto p-3 space-y-4" style={{ scrollbarWidth: 'thin', scrollbarColor: '#4f46e5 transparent' }}>
                        {categories.map((cat) => {
                            const topicsInCat = QUANTUM_TOPICS.filter(t => t.category === cat);
                            if (topicsInCat.length === 0) return null;

                            return (
                                <div key={cat} className="space-y-1">
                                    <h3 className="px-3 text-[10px] font-bold text-indigo-500/60 uppercase tracking-[0.15em] mb-1">{cat}</h3>
                                    {topicsInCat.map((topic) => (
                                        <button
                                            key={topic.id}
                                            onClick={() => setSelectedTopicId(topic.id)}
                                            className={`w-full flex items-center gap-3 p-2.5 rounded-lg transition-all duration-200 group cursor-pointer
                                                ${selectedTopicId === topic.id
                                                    ? 'bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 shadow-lg shadow-indigo-900/30'
                                                    : 'text-gray-400 hover:bg-white/5 hover:text-gray-200 border border-transparent'}`}
                                        >
                                            <div className={`${selectedTopicId === topic.id ? 'text-indigo-400' : 'text-gray-500 group-hover:text-indigo-400'} transition-colors`}>
                                                {getIcon(topic.category)}
                                            </div>
                                            <span className="font-medium text-xs tracking-wide truncate text-left">{topic.title}</span>
                                            {selectedTopicId === topic.id && <ChevronRight className="w-3 h-3 ml-auto shrink-0" />}
                                        </button>
                                    ))}
                                </div>
                            );
                        })}
                    </div>

                    <div className="p-4 bg-black/30 border-t border-white/5">
                        <p className="text-[10px] text-gray-500 uppercase tracking-[0.15em] text-center">Quantum Explorer v1.0</p>
                    </div>
                </div>

                {/* Main Content */}
                <div className="flex-1 flex flex-col bg-gradient-to-br from-transparent to-indigo-900/10 overflow-hidden">
                    <div className="p-4 flex justify-end shrink-0">
                        <button
                            onClick={onClose}
                            className="p-2 text-gray-400 hover:text-white transition-colors rounded-full hover:bg-white/10 cursor-pointer"
                        >
                            <X className="w-6 h-6" />
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto px-12 pb-12" style={{ scrollbarWidth: 'thin', scrollbarColor: '#4f46e5 transparent' }}>
                        <div key={selectedTopicId} style={{ animation: 'fadeIn 0.3s ease-out' }}>
                            <div className="flex items-center gap-2 mb-3">
                                <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-[0.15em] border ${getCategoryColor(selectedTopic.category)}`}>
                                    {selectedTopic.category}
                                </span>
                            </div>

                            <h1 className="text-5xl font-black text-white mb-6 tracking-tighter leading-tight">
                                {selectedTopic.title}
                            </h1>

                            <div className="p-6 bg-indigo-400/5 border-l-4 border-indigo-500 rounded-r-xl mb-10">
                                <p className="text-xl text-indigo-100 font-medium leading-relaxed italic">
                                    "<FormattedText text={selectedTopic.description} />"
                                </p>
                            </div>

                            <div className="space-y-5">
                                {selectedTopic.details.map((paragraph, idx) => (
                                    <p key={idx} className="text-gray-300 leading-relaxed text-[17px] font-light">
                                        <FormattedText text={paragraph} />
                                    </p>
                                ))}
                            </div>

                            {/* Formulas Section */}
                            {selectedTopic.formulas && selectedTopic.formulas.length > 0 && (
                                <div className="mt-12 space-y-4">
                                    <h3 className="text-xs font-bold text-indigo-400 uppercase tracking-[0.2em] mb-4">Key Equations</h3>
                                    <div className="space-y-3">
                                        {selectedTopic.formulas.map((formula, idx) => (
                                            <div key={idx} className="p-4 bg-white/[0.03] border border-white/10 rounded-xl group hover:border-indigo-400/40 transition-colors">
                                                <div className="text-[10px] font-bold text-indigo-400/60 uppercase tracking-[0.15em] mb-2">{formula.label}</div>
                                                <div className="overflow-x-auto pb-1 text-white">
                                                    <BlockMath math={formula.latex} />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Fun Fact */}
                            <div className="mt-12 p-8 bg-gradient-to-r from-indigo-600/20 to-purple-600/20 border border-white/10 rounded-2xl relative overflow-hidden group">
                                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                    <Info className="w-24 h-24" />
                                </div>
                                <h4 className="text-indigo-400 font-bold uppercase tracking-tighter text-sm mb-3 flex items-center gap-2">
                                    <Zap className="w-4 h-4" />
                                    Did You Know?
                                </h4>
                                <p className="text-white text-lg font-medium relative z-10 leading-snug">
                                    <FormattedText text={selectedTopic.funFact} />
                                </p>
                            </div>

                            {/* Interactive Exhibits */}
                            {selectedTopic.exhibits && selectedTopic.exhibits.length > 0 && (
                                <div className="mt-12 space-y-4">
                                    <h3 className="text-xs font-bold text-emerald-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                                        <FlaskConical className="w-4 h-4" />
                                        Interactive Exhibits
                                    </h3>
                                    <div className="grid gap-3">
                                        {selectedTopic.exhibits.map((exhibit, idx) => (
                                            <button
                                                key={idx}
                                                onClick={() => {
                                                    const actions = useGameStore.getState().actions;
                                                    if (exhibit.actionType === 'load_molecule') {
                                                        actions.setTargetScale(12.0);
                                                        actions.setActiveMolecule(exhibit.payload);
                                                        actions.setShowSpecialMolecule(true);
                                                    } else if (exhibit.actionType === 'set_material') {
                                                        actions.setTargetScale(12.0);
                                                        actions.setShowSpecialMolecule(false);
                                                        actions.setActiveMolecule(null);
                                                        actions.setMaterialType(exhibit.payload.material);
                                                        const elData = Object.values(ELEMENTS).find((e: any) => e.symbol === exhibit.payload.elementRef);
                                                        if (elData) {
                                                            actions.setSelectedElement(elData as any);
                                                        }
                                                    }
                                                    onClose();
                                                }}
                                                className="w-full relative overflow-hidden group p-4 rounded-xl bg-emerald-950/30 border border-emerald-500/30 hover:bg-emerald-900/40 hover:border-emerald-400/50 transition-all duration-300 text-left flex items-center justify-between"
                                            >
                                                <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 to-transparent translate-x-[-100%] group-hover:translate-x-[0%] transition-transform duration-500" />
                                                <span className="font-bold text-emerald-100 relative z-10 group-hover:text-white transition-colors">{exhibit.label}</span>
                                                <ChevronRight className="w-5 h-5 text-emerald-500/50 group-hover:text-emerald-400 group-hover:translate-x-1 transition-all relative z-10" />
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
