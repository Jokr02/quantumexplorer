import { useGameStore } from '../../store/useGameStore';
import { ELEMENTS } from '../../data/elements';
import { useAudio } from '../../hooks/useAudio';

const ROW_Col_MAP: Record<number, [number, number]> = {
    // Period 1
    1: [1, 1], 2: [1, 18],
    // Period 2
    3: [2, 1], 4: [2, 2], 5: [2, 13], 6: [2, 14], 7: [2, 15], 8: [2, 16], 9: [2, 17], 10: [2, 18],
    // Period 3
    11: [3, 1], 12: [3, 2], 13: [3, 13], 14: [3, 14], 15: [3, 15], 16: [3, 16], 17: [3, 17], 18: [3, 18],
    // Period 4
    19: [4, 1], 20: [4, 2], 21: [4, 3], 22: [4, 4], 23: [4, 5], 24: [4, 6], 25: [4, 7], 26: [4, 8], 27: [4, 9], 28: [4, 10], 29: [4, 11], 30: [4, 12], 31: [4, 13], 32: [4, 14], 33: [4, 15], 34: [4, 16], 35: [4, 17], 36: [4, 18],
    // Period 5
    37: [5, 1], 38: [5, 2], 39: [5, 3], 40: [5, 4], 41: [5, 5], 42: [5, 6], 43: [5, 7], 44: [5, 8], 45: [5, 9], 46: [5, 10], 47: [5, 11], 48: [5, 12], 49: [5, 13], 50: [5, 14], 51: [5, 15], 52: [5, 16], 53: [5, 17], 54: [5, 18],
    // Period 6
    55: [6, 1], 56: [6, 2],
    /* 57-71 Lanthanides below */
    72: [6, 4], 73: [6, 5], 74: [6, 6], 75: [6, 7], 76: [6, 8], 77: [6, 9], 78: [6, 10], 79: [6, 11], 80: [6, 12], 81: [6, 13], 82: [6, 14], 83: [6, 15], 84: [6, 16], 85: [6, 17], 86: [6, 18],
    // Period 7
    87: [7, 1], 88: [7, 2],
    /* 89-103 Actinides below */
    104: [7, 4], 105: [7, 5], 106: [7, 6], 107: [7, 7], 108: [7, 8], 109: [7, 9], 110: [7, 10], 111: [7, 11], 112: [7, 12], 113: [7, 13], 114: [7, 14], 115: [7, 15], 116: [7, 16], 117: [7, 17], 118: [7, 18],

    // Lanthanides (Row 8 offset)
    57: [9, 4], 58: [9, 5], 59: [9, 6], 60: [9, 7], 61: [9, 8], 62: [9, 9], 63: [9, 10], 64: [9, 11], 65: [9, 12], 66: [9, 13], 67: [9, 14], 68: [9, 15], 69: [9, 16], 70: [9, 17], 71: [9, 18],
    // Actinides (Row 9 offset)
    89: [10, 4], 90: [10, 5], 91: [10, 6], 92: [10, 7], 93: [10, 8], 94: [10, 9], 95: [10, 10], 96: [10, 11], 97: [10, 12], 98: [10, 13], 99: [10, 14], 100: [10, 15], 101: [10, 16], 102: [10, 17], 103: [10, 18]
};

export function PeriodicTable() {
    const { selectedElement, hoveredElement, isTableExpanded } = useGameStore();
    const { setSelectedElement, setHoveredElement, setTableExpanded } = useGameStore.getState().actions;
    const { playSound } = useAudio();

    if (!isTableExpanded) {
        return (
            <button
                onClick={() => { playSound('ui_click', { volume: 0.3 }); setTableExpanded(true); }}
                className="absolute bottom-6 left-6 z-50 bg-slate-900/80 backdrop-blur-md p-4 rounded-full shadow-[0_0_15px_rgba(0,150,255,0.3)] border border-blue-500/30 pointer-events-auto hover:bg-slate-800 hover:scale-105 hover:border-blue-400 transition-all group"
                title="Open Periodic Table"
            >
                <div className="flex items-center gap-2">
                    <span className="text-2xl group-hover:rotate-12 transition-transform drop-shadow-[0_0_8px_rgba(255,255,255,0.8)]">⚛️</span>
                    <span className="font-bold text-sm text-blue-100 uppercase tracking-widest hidden group-hover:block transition-all">Select Element</span>
                </div>
            </button>
        );
    }

    return (
        <div className="absolute inset-x-0 bottom-8 mx-auto z-50 bg-slate-950/70 backdrop-blur-xl p-6 rounded-2xl shadow-[0_0_40px_rgba(0,0,0,0.8)] border border-white/10 pointer-events-auto w-max max-w-[95vw] origin-bottom transition-all flex flex-col items-center">

            <div className="flex justify-between items-center mb-6 w-full px-2">
                <h3 className="text-lg font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400 uppercase tracking-widest flex items-center gap-3 drop-shadow-sm">
                    <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span> Periodic Table
                </h3>
                <button
                    onClick={() => { playSound('ui_click', { volume: 0.3 }); setTableExpanded(false); }}
                    className="text-xs font-bold text-slate-400 hover:text-white uppercase tracking-widest px-3 py-1.5 rounded bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/20 transition-all flex items-center gap-2"
                >
                    <span className="text-lg leading-none">&times;</span> Close
                </button>
            </div>

            <div className="grid gap-1.5 min-w-[900px] select-none p-2" style={{
                gridTemplateColumns: 'repeat(18, minmax(2.8rem, 1fr))',
                gridTemplateRows: 'repeat(10, minmax(2.8rem, 1fr))'
            }}>
                {Object.values(ELEMENTS).map((elem) => {
                    const pos = ROW_Col_MAP[elem.atomicNumber];
                    if (!pos) return null;
                    const [row, col] = pos;

                    const isSelected = selectedElement.symbol === elem.symbol;
                    const isHovered = hoveredElement?.symbol === elem.symbol;

                    // Robust color parsing (some elements might have empty or non-hex cpkColor)
                    let r = 100, g = 116, b = 139; // Default slate-500 fallback

                    if (elem.cpkColor && elem.cpkColor.startsWith('#') && elem.cpkColor.length === 7) {
                        const baseRgb = elem.cpkColor.substring(1);
                        r = parseInt(baseRgb.substring(0, 2), 16) || r;
                        g = parseInt(baseRgb.substring(2, 4), 16) || g;
                        b = parseInt(baseRgb.substring(4, 6), 16) || b;
                    } else if (elem.cpkColor === 'white' || elem.cpkColor === '#fff') {
                        r = 255; g = 255; b = 255;
                    } else if (elem.cpkColor === 'gray') {
                        r = 128; g = 128; b = 128;
                    } else if (elem.cpkColor === 'darkgray') {
                        r = 169; g = 169; b = 169;
                    }

                    const defaultBg = `rgba(${r}, ${g}, ${b}, 0.15)`;
                    const hoverBg = `rgba(${r}, ${g}, ${b}, 0.4)`;
                    const selectedBg = elem.cpkColor || `rgb(${r}, ${g}, ${b})`;

                    const borderColor = `rgba(${r}, ${g}, ${b}, 0.4)`;
                    const hoverBorderColor = `rgba(${r}, ${g}, ${b}, 1)`;

                    return (
                        <button
                            key={elem.symbol}
                            onClick={() => { playSound('ui_click', { volume: 0.3 }); setSelectedElement(elem); setTableExpanded(false); }}
                            onMouseEnter={() => setHoveredElement(elem)}
                            onMouseLeave={() => setHoveredElement(null)}
                            className={`
                                relative flex flex-col items-center justify-center p-1 rounded-sm border backdrop-blur-sm transition-all duration-200
                                ${isSelected ? 'z-20 scale-110 shadow-[0_0_15px_rgba(255,255,255,0.4)]' : ''}
                                ${isHovered && !isSelected ? 'z-20 scale-110 shadow-lg' : ''}
                                ${!isSelected && !isHovered ? 'hover:brightness-125' : ''}
                            `}
                            style={{
                                gridRow: row,
                                gridColumn: col,
                                backgroundColor: isSelected ? selectedBg : (isHovered ? hoverBg : defaultBg),
                                borderColor: isSelected ? '#ffffff' : (isHovered ? hoverBorderColor : borderColor),
                                color: isSelected ? '#000000' : '#ffffff',
                                textShadow: isSelected ? 'none' : '0 1px 2px rgba(0,0,0,0.8)'
                            }}
                            title={elem.name}
                        >
                            <span className="text-[8px] absolute top-1 left-1.5 opacity-80 font-mono">{elem.atomicNumber}</span>
                            <span className="text-sm font-bold mt-1 tracking-wide">{elem.symbol}</span>
                        </button>
                    );
                })}

                {/* Labels/Placeholders for Lanthanides/Actinides logic visualized if needed */}
                <div className="col-start-3 row-start-6 text-xs text-center text-slate-500 font-mono pt-3">*</div>
                <div className="col-start-3 row-start-7 text-xs text-center text-slate-500 font-mono pt-3">**</div>
                <div className="col-start-2 row-start-9 text-xs text-right text-slate-500 font-mono pr-2 pt-3">*</div>
                <div className="col-start-2 row-start-10 text-xs text-right text-slate-500 font-mono pr-2 pt-3">**</div>

            </div>
        </div>
    );
}
