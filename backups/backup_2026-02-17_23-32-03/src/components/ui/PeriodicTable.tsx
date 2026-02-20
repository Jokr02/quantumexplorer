import { useState } from 'react';
import { useGameStore } from '../../store/useGameStore';
import { ELEMENTS } from '../../data/elements';

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

    if (!isTableExpanded) {
        return (
            <button
                onClick={() => setTableExpanded(true)}
                className="absolute bottom-6 left-6 z-50 bg-white/90 backdrop-blur-md p-4 rounded-full shadow-2xl border-2 border-slate-200 pointer-events-auto hover:bg-blue-50 hover:scale-105 transition-all group"
                title="Open Periodic Table"
            >
                <div className="flex items-center gap-2">
                    <span className="text-2xl group-hover:rotate-12 transition-transform">⚛️</span>
                    <span className="font-bold text-sm text-slate-800 uppercase tracking-wider hidden group-hover:block transition-all">Select Element</span>
                </div>
            </button>
        );
    }

    return (
        <div className="absolute bottom-6 left-6 z-50 bg-white/95 backdrop-blur-md p-4 rounded-xl shadow-2xl border border-slate-300 pointer-events-auto max-w-[90vw] overflow-auto origin-bottom-left transition-all max-h-[70vh] flex flex-col">
            <div className="flex justify-between items-center mb-3 sticky top-0 left-0 bg-white/95 z-30 pb-2 border-b border-slate-100 w-full">
                <h3 className="text-sm font-black text-slate-700 uppercase tracking-widest flex items-center gap-2">
                    <span className="text-blue-600">●</span> Periodic Table
                </h3>
                <button
                    onClick={() => setTableExpanded(false)}
                    className="text-xs font-bold text-slate-400 hover:text-slate-800 uppercase tracking-wider px-2 py-1 rounded hover:bg-slate-100 transition-colors"
                >
                    _ Minimize
                </button>
            </div>

            <div className="grid gap-1 min-w-[800px] select-none" style={{
                gridTemplateColumns: 'repeat(18, minmax(2.4rem, 1fr))',
                gridTemplateRows: 'repeat(10, minmax(2.4rem, 1fr))'
            }}>
                {Object.values(ELEMENTS).map((elem) => {
                    const pos = ROW_Col_MAP[elem.atomicNumber];
                    if (!pos) return null;
                    const [row, col] = pos;

                    const isSelected = selectedElement.symbol === elem.symbol;
                    const isHovered = hoveredElement?.symbol === elem.symbol;

                    return (
                        <button
                            key={elem.symbol}
                            onClick={() => setSelectedElement(elem)}
                            onMouseEnter={() => setHoveredElement(elem)}
                            onMouseLeave={() => setHoveredElement(null)}
                            className={`
                                relative flex flex-col items-center justify-center p-0.5 rounded border transition-all duration-150
                                ${isSelected ? 'ring-2 ring-blue-600 z-20 scale-125 shadow-lg' : ''}
                                ${isHovered && !isSelected ? 'z-20 scale-150 shadow-xl ring-2 ring-slate-400' : ''}
                                ${!isSelected && !isHovered ? 'border-transparent opacity-80 hover:opacity-100' : ''}
                            `}
                            style={{
                                gridRow: row,
                                gridColumn: col,
                                backgroundColor: isSelected || isHovered ? '#ffffff' : elem.cpkColor,
                                color: isSelected || isHovered ? '#000' : '#111',
                                boxShadow: isSelected ? '0 0 10px rgba(0,0,0,0.2)' : 'none'
                            }}
                            title={elem.name}
                        >
                            <span className="text-[7px] absolute top-0.5 left-1 opacity-70 leading-none">{elem.atomicNumber}</span>
                            <span className="text-xs font-bold leading-none mt-1">{elem.symbol}</span>
                        </button>
                    );
                })}

                {/* Labels/Placeholders for Lanthanides/Actinides logic visualized if needed */}
                <div className="col-start-3 row-start-6 text-xs text-center opacity-50 font-bold pt-2">*</div>
                <div className="col-start-3 row-start-7 text-xs text-center opacity-50 font-bold pt-2">**</div>
                <div className="col-start-2 row-start-9 text-xs text-right opacity-50 font-bold pr-2 pt-2">*</div>
                <div className="col-start-2 row-start-10 text-xs text-right opacity-50 font-bold pr-2 pt-2">**</div>

            </div>
        </div>
    );
}
