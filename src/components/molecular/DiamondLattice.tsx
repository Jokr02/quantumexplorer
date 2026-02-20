import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useGameStore } from '../../store/useGameStore';

export function DiamondLattice() {
    const { temperature } = useGameStore();
    const meshRef = useRef<THREE.InstancedMesh>(null);
    const groupRef = useRef<THREE.Group>(null);

    const gridSize = 3; // 3x3x3 unit cells
    const a = 2.0; // Lattice constant

    // Diamond cubic structure coordinates (fractional)
    const basis = [
        [0, 0, 0],
        [0, 0.5, 0.5],
        [0.5, 0, 0.5],
        [0.5, 0.5, 0],
        [0.25, 0.25, 0.25],
        [0.25, 0.75, 0.75],
        [0.75, 0.25, 0.75],
        [0.75, 0.75, 0.25]
    ];

    const { atoms, bonds } = useMemo(() => {
        const atomPositions: THREE.Vector3[] = [];
        const bondLines: { start: THREE.Vector3; end: THREE.Vector3 }[] = [];

        const offset = (gridSize * a) / 2;

        // 1. Generate all atom positions
        for (let x = 0; x < gridSize; x++) {
            for (let y = 0; y < gridSize; y++) {
                for (let z = 0; z < gridSize; z++) {
                    basis.forEach(b => {
                        atomPositions.push(new THREE.Vector3(
                            (x + b[0]) * a - offset,
                            (y + b[1]) * a - offset,
                            (z + b[2]) * a - offset
                        ));
                    });
                }
            }
        }

        // 2. Generate bonds (Distance based)
        // In a perfect diamond lattice, nearest neighbors are at distance a * sqrt(3)/4
        const bondLength = a * Math.sqrt(3) / 4;
        const tolerance = 0.1;

        for (let i = 0; i < atomPositions.length; i++) {
            for (let j = i + 1; j < atomPositions.length; j++) {
                const dist = atomPositions[i].distanceTo(atomPositions[j]);
                if (Math.abs(dist - bondLength) < tolerance) {
                    bondLines.push({ start: atomPositions[i], end: atomPositions[j] });
                }
            }
        }

        return { atoms: atomPositions, bonds: bondLines };
    }, [a, gridSize]);

    useFrame((state) => {
        const t = state.clock.getElapsedTime();
        const tempPulse = (temperature / 1000) * 0.03; // Harder material, less vibration than salt

        if (meshRef.current) {
            const dummy = new THREE.Object3D();
            atoms.forEach((pos, i) => {
                // High frequency, low amplitude vibration typical of stiff lattice
                const vibrationX = Math.sin(t * 20 + pos.x * 10) * tempPulse;
                const vibrationY = Math.cos(t * 20 + pos.y * 10) * tempPulse;
                const vibrationZ = Math.sin(t * 20 + pos.z * 10) * tempPulse;

                dummy.position.set(pos.x + vibrationX, pos.y + vibrationY, pos.z + vibrationZ);
                dummy.updateMatrix();
                meshRef.current!.setMatrixAt(i, dummy.matrix);
            });
            meshRef.current.instanceMatrix.needsUpdate = true;
        }

        if (groupRef.current) {
            groupRef.current.rotation.y = t * 0.05;
        }
    });

    return (
        <group ref={groupRef}>
            {/* Carbon Atoms */}
            <instancedMesh ref={meshRef} args={[null as any, null as any, atoms.length]}>
                <sphereGeometry args={[0.3, 16, 16]} />
                <meshPhysicalMaterial
                    color="#444444"
                    metalness={0.8}
                    roughness={0.1}
                    emissive="#ffffff"
                    emissiveIntensity={0.1}
                    envMapIntensity={2.0}
                    clearcoat={1.0}
                    clearcoatRoughness={0.1}
                />
            </instancedMesh>

            {/* Covalent Bonds (Extremely Strong) */}
            <group>
                {bonds.map((line, idx) => {
                    const dir = line.end.clone().sub(line.start);
                    const len = dir.length();
                    const mid = line.start.clone().add(dir.clone().multiplyScalar(0.5));
                    return (
                        <mesh key={idx} position={mid} quaternion={new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.clone().normalize())}>
                            <cylinderGeometry args={[0.08, 0.08, len, 8]} />
                            <meshStandardMaterial
                                color="#aaaaaa"
                                metalness={0.9}
                                roughness={0.1}
                                transparent
                                opacity={0.6}
                            />
                        </mesh>
                    );
                })}
            </group>
        </group>
    );
}
