import React from 'react';
import { useGameStore } from '../../store/useGameStore';

export const HoverTooltip: React.FC = () => {
    const hoveredObject = useGameStore((state) => state.hoveredObject);

    if (!hoveredObject) return null;

    return (
        <div className="absolute bottom-20 left-1/2 -translate-x-1/2 z-[100] pointer-events-none">
            <div
                className="bg-black/80 backdrop-blur-sm text-white px-4 py-2 rounded-lg shadow-lg border border-white/10 whitespace-nowrap"
                style={{ animation: 'fadeIn 0.15s ease-out' }}
            >
                <p className="text-xs font-bold tracking-wide">{hoveredObject}</p>
                <p className="text-[10px] text-gray-400 mt-0.5">Click to learn more</p>
            </div>
        </div>
    );
};
