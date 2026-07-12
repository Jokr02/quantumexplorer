import { useMemo } from 'react';
import type { MoleculePreset, MoleculeAtom, MoleculeBond } from '../../data/molecules';
import { ComplexMolecule } from './ComplexMolecule';

interface ProceduralPenicillinProps {
    preset: MoleculePreset;
}

export function ProceduralPenicillin({ preset }: ProceduralPenicillinProps) {
    const { atoms, bonds } = useMemo(() => {
        const generatedAtoms: MoleculeAtom[] = [];
        const generatedBonds: MoleculeBond[] = [];

        // Fused Core Coordinates
        // Beta-lactam ring (4-membered): N1, C2, C3, C4
        // Thiazolidine ring (5-membered): N1, C2, S5, C6, C7

        // Let's build a representative geometric approximation
        const n1: [number, number, number] = [0, 0, 0];
        const c2: [number, number, number] = [1.2, 0, 0];
        const c3: [number, number, number] = [1.2, 1.2, 0.2];
        const c4: [number, number, number] = [0, 1.2, 0];

        // Thiazolidine extension
        const s5: [number, number, number] = [2.2, -1.0, -0.5];
        const c6: [number, number, number] = [1.5, -2.2, -0.2];
        const c7: [number, number, number] = [0.2, -1.5, 0.5];

        // Add them to atoms
        generatedAtoms.push(
            { position: n1, type: 'N', scale: 0.5 },
            { position: c2, type: 'C', scale: 0.5 },
            { position: c3, type: 'C', scale: 0.5 },
            { position: c4, type: 'C', scale: 0.5 }, // Beta-lactam Carbonyl
            { position: s5, type: 'S', scale: 0.6 },
            { position: c6, type: 'C', scale: 0.5 },
            { position: c7, type: 'C', scale: 0.5 }
        );

        // Core Bonds
        generatedBonds.push(
            // Beta-lactam
            { start: n1, end: c2, type: 'covalent' },
            { start: c2, end: c3, type: 'covalent' },
            { start: c3, end: c4, type: 'covalent' },
            { start: c4, end: n1, type: 'covalent' },
            // Thiazolidine
            { start: c2, end: s5, type: 'covalent' },
            { start: s5, end: c6, type: 'covalent' },
            { start: c6, end: c7, type: 'covalent' },
            { start: c7, end: n1, type: 'covalent' }
        );

        // Add Oxygen to Beta-lactam (C4)
        const o8: [number, number, number] = [-0.5, 2.2, 0.1];
        generatedAtoms.push({ position: o8, type: 'O', scale: 0.45 });
        generatedBonds.push({ start: c4, end: o8, type: 'covalent' });

        // Add Carboxyl group to C6 (approximate)
        const c9: [number, number, number] = [2.0, -3.5, 0];
        const o10: [number, number, number] = [3.2, -3.5, 0.2];
        const o11: [number, number, number] = [1.5, -4.5, -0.2];
        generatedAtoms.push(
            { position: c9, type: 'C', scale: 0.5 },
            { position: o10, type: 'O', scale: 0.45 },
            { position: o11, type: 'O', scale: 0.45 }
        );
        generatedBonds.push(
            { start: c6, end: c9, type: 'covalent' },
            { start: c9, end: o10, type: 'covalent' },
            { start: c9, end: o11, type: 'covalent' }
        );

        // Add Dimethyl groups to C7
        const c12: [number, number, number] = [-0.5, -2.0, 1.5];
        const c13: [number, number, number] = [-0.5, -1.8, -0.8];
        generatedAtoms.push(
            { position: c12, type: 'C', scale: 0.5 },
            { position: c13, type: 'C', scale: 0.5 }
        );
        generatedBonds.push(
            { start: c7, end: c12, type: 'covalent' },
            { start: c7, end: c13, type: 'covalent' }
        );

        // Side chain off C3 (simplified Benzyl group)
        const n14: [number, number, number] = [2.0, 2.0, 0.5];
        const c15: [number, number, number] = [3.2, 2.5, 0];
        const o16: [number, number, number] = [3.5, 3.6, 0.2];
        const c17: [number, number, number] = [4.2, 1.5, -0.5];
        generatedAtoms.push(
            { position: n14, type: 'N', scale: 0.5 },
            { position: c15, type: 'C', scale: 0.5 },
            { position: o16, type: 'O', scale: 0.45 },
            { position: c17, type: 'C', scale: 0.5 }
        );
        generatedBonds.push(
            { start: c3, end: n14, type: 'covalent' },
            { start: n14, end: c15, type: 'covalent' },
            { start: c15, end: o16, type: 'covalent' },
            { start: c15, end: c17, type: 'covalent' }
        );

        // Benzene ring placeholder (cluster of 6 carbons)
        const bx = 5.5, by = 1.0, bz = -1.0;
        const ringH: [number, number, number][] = [
            [bx, by, bz], [bx + 1.2, by + 0.5, bz], [bx + 2.4, by, bz],
            [bx + 2.4, by - 1.2, bz], [bx + 1.2, by - 1.7, bz], [bx, by - 1.2, bz]
        ];
        ringH.forEach((pos, i) => {
            generatedAtoms.push({ position: pos, type: 'C', scale: 0.5 });
            generatedBonds.push({ start: pos, end: ringH[(i + 1) % 6], type: 'covalent' });
        });
        generatedBonds.push({ start: c17, end: ringH[0], type: 'covalent' });

        return { atoms: generatedAtoms, bonds: generatedBonds };
    }, []);

    const dynamicPreset: MoleculePreset = {
        ...preset,
        atoms,
        bonds
    };

    return <ComplexMolecule preset={dynamicPreset} />;
}
