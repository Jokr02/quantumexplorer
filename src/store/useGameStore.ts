import { create } from 'zustand';
import { DEFAULT_ELEMENT } from '../data/elements';
import type { ElementData } from '../data/elements';

export type ScaleLevel = 'molecular' | 'atomic' | 'subatomic';

export type MaterialType = 'solid' | 'liquid' | 'gas';

export type AtomicViewMode = 'bohr' | 'orbital';

export interface InfoPopup {
    title: string;
    content: string[];
    category?: string;
    action?: { label: string; callback: () => void };
}

interface GameState {
    scaleLevel: ScaleLevel;
    currentScale: number;
    targetScale: number;
    materialType: MaterialType;
    selectedElement: ElementData;
    hoveredElement: ElementData | null;
    isTableExpanded: boolean;
    temperature: number;
    electronsAnimated: boolean;
    atomicViewMode: AtomicViewMode;
    infoPopup: InfoPopup | null;
    hoveredObject: string | null;
    showSpecialMolecule: boolean;
    activeMoleculeId: string | null;
    triggerCollision: number;
    triggerThermalPulse: number;
    isDecaying: boolean;

    actions: {
        setScaleLevel: (level: ScaleLevel) => void;
        setTargetScale: (scale: number) => void;
        setCurrentScale: (scale: number) => void;
        setMaterialType: (type: MaterialType) => void;
        setSelectedElement: (element: ElementData) => void;
        setNeutronCount: (count: number) => void;
        setHoveredElement: (element: ElementData | null) => void;
        setTableExpanded: (expanded: boolean) => void;
        setTemperature: (temp: number) => void;
        setElectronsAnimated: (animated: boolean) => void;
        setAtomicViewMode: (mode: AtomicViewMode) => void;
        showInfoPopup: (popup: InfoPopup) => void;
        hideInfoPopup: () => void;
        setHoveredObject: (name: string | null) => void;
        toggleSpecialMolecule: () => void;
        setShowSpecialMolecule: (show: boolean) => void;
        setActiveMolecule: (id: string | null) => void;
        fireCollision: () => void;
        fireThermalPulse: () => void;
        setDecaying: (decaying: boolean) => void;
    };
}

export const useGameStore = create<GameState>((set) => ({
    scaleLevel: 'molecular',
    currentScale: 12.0,
    targetScale: 12.0,
    materialType: 'solid',
    selectedElement: DEFAULT_ELEMENT,
    hoveredElement: null,
    isTableExpanded: false,
    temperature: 300,
    electronsAnimated: false,
    atomicViewMode: 'bohr',
    infoPopup: null,
    hoveredObject: null,
    showSpecialMolecule: false,
    activeMoleculeId: null,
    triggerCollision: 0,
    triggerThermalPulse: 0,
    isDecaying: false,

    actions: {
        setScaleLevel: (level) => set({ scaleLevel: level }),
        setTargetScale: (scale) => {
            const clamped = Math.max(0.5, Math.min(14.0, scale));
            set({ targetScale: clamped });

            let newLevel: ScaleLevel = 'atomic';
            if (clamped > 2.5) newLevel = 'molecular';
            else if (clamped < 1.5) newLevel = 'subatomic';

            set({ scaleLevel: newLevel });
        },
        setCurrentScale: (scale) => set({ currentScale: scale }),
        setMaterialType: (type) => set({ materialType: type }),
        setSelectedElement: (element) => set({ selectedElement: element }),
        setNeutronCount: (count) => set((state) => ({
            selectedElement: {
                ...state.selectedElement,
                neutrons: Math.max(0, count),
                atomicMass: state.selectedElement.atomicNumber + Math.max(0, count)
            }
        })),
        setHoveredElement: (element) => set({ hoveredElement: element }),
        setTableExpanded: (expanded) => set({ isTableExpanded: expanded }),
        setTemperature: (temp) => set({ temperature: Math.max(0, Math.min(1000, temp)) }),
        setElectronsAnimated: (animated) => set({ electronsAnimated: animated }),
        setAtomicViewMode: (mode) => set({ atomicViewMode: mode }),
        showInfoPopup: (popup) => set({ infoPopup: popup }),
        hideInfoPopup: () => set({ infoPopup: null }),
        setHoveredObject: (name) => set({ hoveredObject: name }),
        toggleSpecialMolecule: () => set((state) => ({ showSpecialMolecule: !state.showSpecialMolecule })),
        setShowSpecialMolecule: (show) => set({ showSpecialMolecule: show }),
        setActiveMolecule: (id) => set({ activeMoleculeId: id }),
        fireCollision: () => set((state) => ({ triggerCollision: state.triggerCollision + 1 })),
        fireThermalPulse: () => set((state) => ({ triggerThermalPulse: state.triggerThermalPulse + 1 })),
        setDecaying: (decaying) => set({ isDecaying: decaying }),
    }
}));

export const useGameActions = () => useGameStore((state) => state.actions);

