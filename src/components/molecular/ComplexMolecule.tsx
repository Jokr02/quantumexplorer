import { useRef, useMemo } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { Line } from '@react-three/drei';
import { useGameStore } from '../../store/useGameStore';
import type { MoleculePreset } from '../../data/molecules';
import { ELEMENTS } from '../../data/elements';

const _dummy = new THREE.Object3D();

interface ComplexMoleculeProps {
    preset: MoleculePreset;
}

export function ComplexMolecule({ preset }: ComplexMoleculeProps) {
    const temperature = useGameStore((state) => state.temperature);
    // Thermal vibration strength
    const vibrationStrength = useMemo(() => Math.max(0, (temperature - 100) / 1000) * 0.1, [temperature]);

    const atomGroups = useMemo(() => {
        // Group atoms by elementType to render with different instanced meshes
        const groups: Record<string, { positions: THREE.Vector3[], scales: number[], color: string }> = {};

        preset.atoms.forEach(atom => {
            if (!groups[atom.type]) {
                const elemData = Object.values(ELEMENTS).find(e => e.symbol === atom.type);
                groups[atom.type] = {
                    positions: [],
                    scales: [],
                    color: elemData?.cpkColor || '#ffffff'
                };
            }
            groups[atom.type].positions.push(new THREE.Vector3(...atom.position));
            groups[atom.type].scales.push(atom.scale || 0.4);
        });
        return groups;
    }, [preset]);

    // Refs for animating atoms
    const meshRefs = useRef<Record<string, THREE.InstancedMesh | null>>({});

    useFrame((state) => {
        const time = state.clock.getElapsedTime();

        Object.entries(atomGroups).forEach(([type, group]) => {
            const mesh = meshRefs.current[type];
            if (!mesh) return;

            group.positions.forEach((pos, i) => {
                const scale = group.scales[i];

                // Add thermal vibration
                _dummy.position.copy(pos);
                _dummy.position.x += Math.sin(time * 10 + pos.y * 10) * vibrationStrength;
                _dummy.position.y += Math.cos(time * 12 + pos.z * 10) * vibrationStrength;
                _dummy.position.z += Math.sin(time * 14 + pos.x * 10) * vibrationStrength;

                _dummy.scale.set(scale, scale, scale);
                _dummy.updateMatrix();
                mesh.setMatrixAt(i, _dummy.matrix);
            });
            mesh.instanceMatrix.needsUpdate = true;
        });
    });

    return (
        <group>
            {/* Render Atoms */}
            {Object.entries(atomGroups).map(([type, group]) => (
                <instancedMesh
                    key={type}
                    ref={(el) => { meshRefs.current[type] = el; }}
                    args={[undefined, undefined, group.positions.length]}
                >
                    <sphereGeometry args={[1, 32, 32]} />
                    <meshStandardMaterial
                        color={group.color}
                        roughness={0.2}
                        metalness={0.1}
                        emissive={group.color}
                        emissiveIntensity={0.1}
                    />
                </instancedMesh>
            ))}

            {/* Render Bonds as Lines */}
            {preset.bonds.map((bond, idx) => {
                const start = new THREE.Vector3(...bond.start);
                const end = new THREE.Vector3(...bond.end);

                // Covalent bonds are solid lines, Hydrogen bonds are dashed
                const isHydrogen = bond.type === 'hydrogen';

                return (
                    <Line
                        key={idx}
                        points={[start, end]}
                        color={isHydrogen ? "#60a5fa" : "#slate-500"}
                        lineWidth={isHydrogen ? 1 : 2}
                        dashed={isHydrogen}
                        dashScale={5}
                        dashSize={0.2}
                        dashOffset={0}
                        transparent
                        opacity={isHydrogen ? 0.6 : 0.8}
                    />
                );
            })}
        </group>
    );
}
