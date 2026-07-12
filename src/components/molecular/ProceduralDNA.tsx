import { useMemo } from 'react';
import type { MoleculePreset, MoleculeAtom, MoleculeBond } from '../../data/molecules';
import { ComplexMolecule } from './ComplexMolecule';

interface ProceduralDNAProps {
    preset: MoleculePreset;
}

export function ProceduralDNA({ preset }: ProceduralDNAProps) {
    const { atoms, bonds } = useMemo(() => {
        const generatedAtoms: MoleculeAtom[] = [];
        const generatedBonds: MoleculeBond[] = [];

        const numPairs = 24; // Number of base pairs
        const radius = 2.0;
        const heightStep = 0.5;
        const twistAngle = Math.PI / 6; // 30 degrees per step

        for (let i = 0; i < numPairs; i++) {
            const h = (i - numPairs / 2) * heightStep;
            const angle1 = i * twistAngle;
            const angle2 = angle1 + Math.PI; // Opposite side

            // Strand 1 (Phosphorus backbone approx)
            const p1: [number, number, number] = [Math.cos(angle1) * radius, h, Math.sin(angle1) * radius];
            generatedAtoms.push({ position: p1, type: 'P', scale: 0.6 });

            // Strand 2
            const p2: [number, number, number] = [Math.cos(angle2) * radius, h, Math.sin(angle2) * radius];
            generatedAtoms.push({ position: p2, type: 'P', scale: 0.6 });

            // Connect backbone vertically
            if (i > 0) {
                const prevH = (i - 1 - numPairs / 2) * heightStep;
                const prevA1 = (i - 1) * twistAngle;
                const prevA2 = prevA1 + Math.PI;
                generatedBonds.push({
                    start: p1,
                    end: [Math.cos(prevA1) * radius, prevH, Math.sin(prevA1) * radius],
                    type: 'covalent'
                });
                generatedBonds.push({
                    start: p2,
                    end: [Math.cos(prevA2) * radius, prevH, Math.sin(prevA2) * radius],
                    type: 'covalent'
                });
            }

            // Base pair (Rung)
            // Left base
            const b1: [number, number, number] = [Math.cos(angle1) * (radius * 0.4), h, Math.sin(angle1) * (radius * 0.4)];
            // Right base
            const b2: [number, number, number] = [Math.cos(angle2) * (radius * 0.4), h, Math.sin(angle2) * (radius * 0.4)];

            // Determine base types (A-T or C-G) pseudo-randomly based on index
            const isAT = i % 3 === 0;
            generatedAtoms.push({ position: b1, type: isAT ? 'N' : 'C', scale: 0.4 });
            generatedAtoms.push({ position: b2, type: isAT ? 'O' : 'N', scale: 0.4 });

            // Bonds backbone to base
            generatedBonds.push({ start: p1, end: b1, type: 'covalent' });
            generatedBonds.push({ start: p2, end: b2, type: 'covalent' });

            // Hydrogen bond between bases
            generatedBonds.push({ start: b1, end: b2, type: 'hydrogen' });
        }

        return { atoms: generatedAtoms, bonds: generatedBonds };
    }, []);

    const dynamicPreset: MoleculePreset = {
        ...preset,
        atoms,
        bonds
    };

    return <ComplexMolecule preset={dynamicPreset} />;
}
