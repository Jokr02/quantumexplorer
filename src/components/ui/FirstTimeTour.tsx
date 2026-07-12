import { useState } from 'react';
import { Sparkles, ChevronRight, ChevronLeft } from 'lucide-react';

const TOUR_SEEN_KEY = 'quantum-lab-tour-seen';

interface TourStep {
    title: string;
    body: string;
    emoji: string;
}

const STEPS: TourStep[] = [
    {
        emoji: '🔬',
        title: 'Welcome to Quantum Lab',
        body: "This is an interactive explorer of the microcosmos — zoom continuously from molecules, down through atoms, all the way to quarks inside the nucleus. Everything you see responds to real physics."
    },
    {
        emoji: '📏',
        title: 'Switch Scale Anytime',
        body: "Use the Molecular / Atomic / Subatomic buttons (top-left), press 1 / 2 / 3 on your keyboard, or just scroll to zoom continuously between scales."
    },
    {
        emoji: '⚛️',
        title: 'Pick Any Element',
        body: "In Atomic view, open the Periodic Table (bottom-left) to explore all 118 elements — including color overlays for electronegativity, atomic radius, and ionization energy trends."
    },
    {
        emoji: '🧪',
        title: 'Explore Molecules',
        body: "In Molecular view, open the Molecule Gallery (bottom-left) to load water, DNA, caffeine, benzene, and more — independent of whichever element is selected."
    },
    {
        emoji: '📖',
        title: 'Learn the Physics',
        body: "The Learn button (top-right) opens the Quantum Academy — 28 in-depth topics with real equations, and a short quiz at the end of each one to test what you've picked up."
    },
];

export function FirstTimeTour() {
    const [dismissed, setDismissed] = useState(() => {
        try {
            return localStorage.getItem(TOUR_SEEN_KEY) === 'true';
        } catch {
            return false;
        }
    });
    const [stepIndex, setStepIndex] = useState(0);

    if (dismissed) return null;

    const finish = () => {
        try {
            localStorage.setItem(TOUR_SEEN_KEY, 'true');
        } catch {
            // localStorage unavailable — tour will just show again next visit
        }
        setDismissed(true);
    };

    const step = STEPS[stepIndex];
    const isLast = stepIndex === STEPS.length - 1;

    return (
        <div className="absolute inset-0 z-[300] flex items-center justify-center bg-black/70 backdrop-blur-md pointer-events-auto">
            <div className="bg-[#0a0a1a]/95 border border-indigo-500/30 w-[90%] max-w-md rounded-2xl p-8 shadow-[0_0_60px_rgba(79,70,229,0.3)] text-center">
                <div className="text-5xl mb-4">{step.emoji}</div>
                <h2 className="text-2xl font-black text-white tracking-tight mb-3">{step.title}</h2>
                <p className="text-slate-300 leading-relaxed text-sm mb-8">{step.body}</p>

                <div className="flex items-center justify-center gap-1.5 mb-6">
                    {STEPS.map((_, i) => (
                        <span
                            key={i}
                            className={`h-1.5 rounded-full transition-all ${i === stepIndex ? 'w-6 bg-indigo-400' : 'w-1.5 bg-white/20'}`}
                        />
                    ))}
                </div>

                <div className="flex items-center justify-between gap-3">
                    <button
                        onClick={() => setStepIndex((i) => Math.max(0, i - 1))}
                        disabled={stepIndex === 0}
                        className="px-3 py-2 text-xs font-bold uppercase tracking-widest text-slate-400 hover:text-white disabled:opacity-0 transition-all flex items-center gap-1"
                    >
                        <ChevronLeft className="w-4 h-4" /> Back
                    </button>

                    <button onClick={finish} className="text-[10px] font-bold uppercase tracking-widest text-slate-500 hover:text-slate-300 transition-colors">
                        Skip Tour
                    </button>

                    {isLast ? (
                        <button
                            onClick={finish}
                            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-bold text-xs uppercase tracking-widest transition-all flex items-center gap-2 shadow-[0_0_15px_rgba(79,70,229,0.4)]"
                        >
                            <Sparkles className="w-4 h-4" /> Start Exploring
                        </button>
                    ) : (
                        <button
                            onClick={() => setStepIndex((i) => Math.min(STEPS.length - 1, i + 1))}
                            className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg font-bold text-xs uppercase tracking-widest transition-all flex items-center gap-1"
                        >
                            Next <ChevronRight className="w-4 h-4" />
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
