import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGameStore } from '../../store/useGameStore';
import { BohrModel } from '../atomic/BohrModel';
import { CrystalLattice } from '../molecular/CrystalLattice';
import { CrystalBonds } from '../molecular/CrystalBonds';
import { LiquidVolume } from '../molecular/LiquidVolume';
import { GasVolume } from '../molecular/GasVolume';
import { Nucleus } from '../subatomic/Nucleus';
import { GluonField } from '../subatomic/GluonField';
import { LaboratoryBox } from './LaboratoryBox';
import { Text } from '@react-three/drei';
import * as THREE from 'three';

export function SceneManager() {
    const { currentScale, materialType } = useGameStore();

    // Refs for groups to handle opacity fading
    const molecularRef = useRef<THREE.Group>(null);
    const atomicRef = useRef<THREE.Group>(null);
    const subatomicRef = useRef<THREE.Group>(null);

    useFrame(() => {
        // Opacity Logic
        // Molecular: Visible 2.5 to 3.5
        // Atomic: Visible 1.5 to 2.5
        // Subatomic: Visible 0.5 to 1.5

        // Simple fade based on distance from "ideal center" of the scale
        // Molecular Ideal: 3.0
        // Atomic Ideal: 2.0
        // Subatomic Ideal: 1.0 (or 0.5 in our mapping)

        if (molecularRef.current) {
            // Fade out Lattice as we approach Atomic (Scale 2.0)
            // Visible from 3.0 down to 2.5
            // At 3.0 -> Opacity 1
            // At 2.5 -> Opacity 0
            let opacity = 0;
            if (currentScale >= 2.5) {
                opacity = (currentScale - 2.5) * 2; // Map 2.5->3.0 to 0->1
            }
            // Also fade out if we go higher than 14.5
            if (currentScale > 14.5) opacity = 1 - (currentScale - 14.5);

            molecularRef.current.visible = opacity > 0;
        }

        if (atomicRef.current) {
            // Atomic acts as the "bridge". It should be fully visible at 2.
            // Fade out as we go to 3 or 1.
            let opacity = 1;
            if (currentScale > 2.5) {
                // Fade out rapidly as we approach 3
                opacity = 0;
            } else if (currentScale > 2.0) {
                opacity = 1 - (currentScale - 2.0) * 2;
            } else if (currentScale < 1.5) {
                opacity = 1 - (1.5 - currentScale) * 2; // Fade out by 1
            }

            atomicRef.current.visible = opacity > 0;
            // Scale down slightly as we zoom out to molecular to help the transition
            if (currentScale > 2.5) atomicRef.current.visible = false;
        }

        if (subatomicRef.current) {
            let opacity = 1;
            // Subatomic visible < 1.5
            // Fade out as we go from 1.0 to 1.5
            if (currentScale > 1.0) {
                opacity = 1 - (currentScale - 1.0) * 2;
            }
            subatomicRef.current.visible = opacity > 0;
        }
    });

    return (
        <>
            {/* Molecular Layer */}
            <group ref={molecularRef}>
                <LaboratoryBox />

                {materialType === 'solid' && (
                    <>
                        <CrystalLattice />
                        <CrystalBonds />
                    </>
                )}
                {materialType === 'liquid' && <LiquidVolume />}
                {materialType === 'gas' && <GasVolume />}

                <Text position={[0, 8, 0]} fontSize={0.5} color="#333333">
                    {materialType === 'solid' && "Molecular Structure (Solid Crystal)"}
                    {materialType === 'liquid' && "Molecular Structure (Liquid State)"}
                    {materialType === 'gas' && "Molecular Structure (Gas State)"}
                </Text>
            </group>

            {/* Atomic Layer */}
            <group ref={atomicRef}>
                <BohrModel />
            </group>

            {/* Subatomic Layer */}
            <group ref={subatomicRef}>
                <Nucleus />
                <GluonField />
                <Text position={[0, -2, 0]} fontSize={0.2} color="red">
                    Nucleus (Protons + Neutrons)
                </Text>
            </group>
        </>
    );
}
