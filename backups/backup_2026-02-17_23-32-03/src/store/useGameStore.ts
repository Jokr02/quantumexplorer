import { create } from 'zustand';
import { DEFAULT_ELEMENT } from '../data/elements';
import type { ElementData } from '../data/elements';

export type ScaleLevel = 'molecular' | 'atomic' | 'subatomic';

export type MaterialType = 'solid' | 'liquid' | 'gas';

interface GameState {
    scaleLevel: ScaleLevel;
    // Normalized zoom progress within the current level (0 to 1)
    // or a global zoom value. Let's use a global intuitive scale factor.
    // 3 = Molecular, 2 = Atomic, 1 = Subatomic
    currentScale: number;
    targetScale: number;

    // Material State for Molecular View
    materialType: MaterialType;

    // Selected Element for Atomic View
    selectedElement: ElementData;
    hoveredElement: ElementData | null;
    isTableExpanded: boolean;

    actions: {
        setScaleLevel: (level: ScaleLevel) => void;
        setTargetScale: (scale: number) => void;
        setCurrentScale: (scale: number) => void;
        setMaterialType: (type: MaterialType) => void;
        setSelectedElement: (element: ElementData) => void;
        setHoveredElement: (element: ElementData | null) => void;
        setTableExpanded: (expanded: boolean) => void;
    };
}

export const useGameStore = create<GameState>((set) => ({
    scaleLevel: 'molecular',
    currentScale: 12.0, // Start at Molecular
    targetScale: 12.0,
    materialType: 'solid',
    selectedElement: DEFAULT_ELEMENT,
    hoveredElement: null,
    isTableExpanded: true,

    actions: {
        setScaleLevel: (level) => set({ scaleLevel: level }),
        setTargetScale: (scale) => {
            // Clamp scale between 0.5 (deep subatomic) and 14.0 (balanced overview)
            const clamped = Math.max(0.5, Math.min(14.0, scale));
            set({ targetScale: clamped });

            // Update Scale Level based on thresholds
            let newLevel: ScaleLevel = 'atomic';
            if (clamped > 2.5) newLevel = 'molecular';
            else if (clamped < 1.5) newLevel = 'subatomic';

            set({ scaleLevel: newLevel });
        },
        setCurrentScale: (scale) => set({ currentScale: scale }),
        setMaterialType: (type) => set({ materialType: type }),
        setSelectedElement: (element) => set({ selectedElement: element }),
        setHoveredElement: (element) => set({ hoveredElement: element }),
        setTableExpanded: (expanded) => set({ isTableExpanded: expanded }),
    },
}));

export const useGameActions = () => useGameStore((state) => state.actions);
