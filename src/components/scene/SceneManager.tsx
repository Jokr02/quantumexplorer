import { useRef, useCallback, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGameStore } from '../../store/useGameStore';
import { BohrModel } from '../atomic/BohrModel';
import { OrbitalCloud } from '../atomic/OrbitalCloud';
import { CrystalLattice } from '../molecular/CrystalLattice';
import { CrystalBonds } from '../molecular/CrystalBonds';
import { LiquidVolume } from '../molecular/LiquidVolume';
import { GasVolume } from '../molecular/GasVolume';
import { Nucleus } from '../subatomic/Nucleus';
import { GluonField } from '../subatomic/GluonField';
import { QuarkDisplay } from '../subatomic/QuarkDisplay';
import { AmbientDust } from './AmbientDust';
import { LaboratoryBox } from './LaboratoryBox';
import { WaterMolecule } from '../molecular/WaterMolecule';
import { NaClLattice } from '../molecular/NaClLattice';
import { DiamondLattice } from '../molecular/DiamondLattice';
import { GraphiteLattice } from '../molecular/GraphiteLattice';
import { ComplexMolecule } from '../molecular/ComplexMolecule';
import { getMoleculeForElement } from '../../data/molecules';
import { toSceneSafeText } from '../../utils/text';
import { Text } from '@react-three/drei';
import * as THREE from 'three';

export function SceneManager() {
    const { currentScale, materialType, scaleLevel, atomicViewMode, showSpecialMolecule, activeMoleculeId, showQuarks } = useGameStore();
    const { showInfoPopup, setHoveredObject, setTargetScale } = useGameStore.getState().actions;
    const selectedElement = useGameStore((state) => state.selectedElement);

    const specialMolecule = useMemo(() => {
        if (!showSpecialMolecule) return null;
        return getMoleculeForElement(selectedElement.symbol, activeMoleculeId);
    }, [selectedElement.symbol, showSpecialMolecule, activeMoleculeId]);

    const molecularRef = useRef<THREE.Group>(null);
    const atomicRef = useRef<THREE.Group>(null);
    const subatomicRef = useRef<THREE.Group>(null);

    // Molecular click handler
    const handleMolecularClick = useCallback((e: { stopPropagation: () => void }) => {
        e.stopPropagation();
        const stateInfo: Record<string, { title: string; content: string[] }> = {
            solid: {
                title: `${selectedElement.name} — Crystal Lattice`,
                content: [
                    `In the solid state, ${selectedElement.name} atoms are arranged in a regular, repeating 3D pattern called a crystal lattice.`,
                    `The atoms vibrate around fixed positions but don't move freely. The bonds between them (shown as connecting lines) represent the forces holding the structure rigid.`,
                    `At higher temperatures, the vibration amplitude increases. Near the melting point, vibrations become large enough to break the lattice structure, transitioning to a liquid.`,
                    `Try increasing the temperature slider to see the atoms vibrate more intensely!`
                ]
            },
            liquid: {
                title: `${selectedElement.name} — Liquid State`,
                content: [
                    `In the liquid state, ${selectedElement.name} atoms have enough kinetic energy to overcome some intermolecular forces, allowing them to flow and change position.`,
                    `They remain close together (nearly as dense as a solid) but are free to move around each other, which is why liquids take the shape of their container.`,
                    `The flowing, swirling motion you see represents the random thermal motion of particles. Higher temperatures mean faster, more chaotic movement.`,
                    `Try adjusting the temperature to see how it affects the flow speed!`
                ]
            },
            gas: {
                title: `${selectedElement.name} — Gas State`,
                content: [
                    `In the gas state, ${selectedElement.name} atoms have enough energy to completely overcome intermolecular forces. They move freely in all directions.`,
                    `Gas particles travel in straight lines until they collide with each other or the container walls. These collisions create gas pressure.`,
                    `At room temperature (300K), gas molecules move at hundreds of meters per second. At 1000K, they move even faster — notice how particles bounce off the walls more vigorously!`,
                    `The Ideal Gas Law (PV = nRT) describes how temperature, pressure, and volume are related.`
                ]
            }
        };
        const info = stateInfo[materialType] || stateInfo.solid;
        showInfoPopup({
            title: info.title,
            category: `Material State — ${materialType.charAt(0).toUpperCase() + materialType.slice(1)}`,
            content: info.content,
            action: {
                label: 'Zoom to Atomic Structure →',
                callback: () => setTargetScale(2.0)
            }
        });
    }, [materialType, selectedElement, showInfoPopup, setTargetScale]);

    // Subatomic click handler
    const handleSubatomicClick = useCallback((e: { stopPropagation: () => void }) => {
        e.stopPropagation();
        showInfoPopup({
            title: 'The Gluon Field',
            category: 'Quantum Chromodynamics',
            content: [
                'The colorful particles swirling around the nucleus are gluons — the force carriers of the Strong Nuclear Force.',
                'Gluons come in 8 types, each carrying a combination of "color charge" (Red, Green, Blue and their anti-colors). Unlike photons (which are electrically neutral), gluons carry the charge they mediate.',
                'This makes the Strong Force incredibly complex: gluons interact with each other, creating a seething "flux tube" of energy between quarks. This self-interaction is why quarks can never be isolated.',
                'You can click on the nucleus to add or remove neutrons (Shift+Click to remove). Watch how the nucleus structure changes!'
            ],
        });
    }, [showInfoPopup]);

    useFrame(() => {
        // Continuous zoom scaling concept (Infinite Zoom / Powers of Ten):
        // As currentScale decreases, we are zooming IN.
        // Meshes should get LARGER as we zoom IN, giving the illusion of diving deep.

        if (molecularRef.current) {
            let opacity = 0;
            if (currentScale >= 2.5) opacity = 1;
            molecularRef.current.visible = opacity > 0;

            // Base scale is 1 at currentScale = 14
            // As we zoom in (currentScale goes from 14 down to 2), scale explodes exponentially 
            const scaleMult = Math.pow(14 / Math.max(0.1, currentScale), 2.0);
            molecularRef.current.scale.setScalar(scaleMult);
        }

        if (atomicRef.current) {
            let opacity = 0;
            if (currentScale <= 2.8 && currentScale >= 0.8) opacity = 1;
            atomicRef.current.visible = opacity > 0;

            // Base scale is 1 at currentScale = 2
            const scaleMult = Math.pow(2 / Math.max(0.1, currentScale), 2.0);
            atomicRef.current.scale.setScalar(scaleMult);
        }

        if (subatomicRef.current) {
            let opacity = 0;
            if (currentScale <= 1.2) opacity = 1;
            subatomicRef.current.visible = opacity > 0;

            // Base scale is 1 at currentScale = 0.5
            const scaleMult = Math.pow(0.5 / Math.max(0.01, currentScale), 2.0);
            subatomicRef.current.scale.setScalar(scaleMult);
        }
    });

    const renderSpecialMolecule = () => {
        if (!specialMolecule) return null;
        switch (specialMolecule.id) {
            case 'water': return <WaterMolecule />;
            case 'nacl': return <NaClLattice />;
            case 'diamond': return <DiamondLattice />;
            case 'graphite': return <GraphiteLattice />;
            case 'gold': return <CrystalLattice />;
            case 'caffeine':
            case 'buckyball':
            case 'methane':
            case 'ammonia':
            case 'carbon_dioxide':
            case 'benzene':
                return <ComplexMolecule preset={specialMolecule} />;
            default: return null;
        }
    };

    return (
        <>
            {/* Molecular Layer - Clickable only in molecular view */}
            <group ref={molecularRef} rotation={[0.3, 0.5, 0]}>
                <LaboratoryBox />

                {scaleLevel === 'molecular' ? (
                    <group
                        onClick={handleMolecularClick}
                        onPointerOver={(e) => { e.stopPropagation(); setHoveredObject(specialMolecule ? `${specialMolecule.name} (${specialMolecule.formula})` : `${selectedElement.name} — ${materialType.charAt(0).toUpperCase() + materialType.slice(1)} Structure`); document.body.style.cursor = 'pointer'; }}
                        onPointerOut={() => { setHoveredObject(null); document.body.style.cursor = 'auto'; }}
                    >
                        {specialMolecule ? renderSpecialMolecule() : (
                            <>
                                {materialType === 'solid' && (
                                    <>
                                        <CrystalLattice />
                                        <CrystalBonds />
                                    </>
                                )}
                                {materialType === 'liquid' && <LiquidVolume />}
                                {materialType === 'gas' && <GasVolume />}
                            </>
                        )}
                    </group>
                ) : (
                    <>
                        {specialMolecule ? renderSpecialMolecule() : (
                            <>
                                {materialType === 'solid' && (
                                    <>
                                        <CrystalLattice />
                                        <CrystalBonds />
                                    </>
                                )}
                                {materialType === 'liquid' && <LiquidVolume />}
                                {materialType === 'gas' && <GasVolume />}
                            </>
                        )}
                    </>
                )}

                <Text position={[0, 7.5, 0]} fontSize={0.5} color="#333333" anchorX="center" anchorY="middle">
                    {specialMolecule ?
                        `Compound View: ${specialMolecule.name} (${toSceneSafeText(specialMolecule.formula)})` :
                        (materialType === 'solid' ? "Molecular Structure (Solid Crystal)" :
                            materialType === 'liquid' ? "Molecular Structure (Liquid State)" :
                                "Molecular Structure (Gas State)")
                    }
                </Text>
            </group>

            {/* Atomic Layer */}
            <group ref={atomicRef}>
                {atomicViewMode === 'orbital' ? <OrbitalCloud /> : <BohrModel />}
            </group>

            {/* Subatomic Layer - Clickable gluon field only in subatomic view */}
            <group ref={subatomicRef}>
                <Nucleus />
                {scaleLevel === 'subatomic' && showQuarks && <QuarkDisplay />}
                {scaleLevel === 'subatomic' ? (
                    <group
                        onClick={handleSubatomicClick}
                        onPointerOver={(e) => { e.stopPropagation(); setHoveredObject('Gluon Field — Strong Force Carriers'); document.body.style.cursor = 'pointer'; }}
                        onPointerOut={() => { setHoveredObject(null); document.body.style.cursor = 'auto'; }}
                    >
                        <GluonField />
                    </group>
                ) : (
                    <GluonField />
                )}
            </group>

            {/* Ambient dust particles for atmosphere */}
            <AmbientDust />
        </>
    );
}

