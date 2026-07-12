import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useGameStore } from '../../store/useGameStore';

export function NaClLattice() {
    const { temperature } = useGameStore();
    const meshNaRef = useRef<THREE.InstancedMesh>(null);
    const meshClRef = useRef<THREE.InstancedMesh>(null);
    const groupRef = useRef<THREE.Group>(null);

    const gridSize = 4; // 4x4x4 cube
    const spacing = 1.2;

    const { naPositions, clPositions } = useMemo(() => {
        const naPos: THREE.Vector3[] = [];
        const clPos: THREE.Vector3[] = [];
        const offset = (gridSize - 1) * spacing * 0.5;

        for (let x = 0; x < gridSize; x++) {
            for (let y = 0; y < gridSize; y++) {
                for (let z = 0; z < gridSize; z++) {
                    const pos = new THREE.Vector3(
                        x * spacing - offset,
                        y * spacing - offset,
                        z * spacing - offset
                    );

                    // Alternating types in all 3 dimensions
                    if ((x + y + z) % 2 === 0) {
                        naPos.push(pos);
                    } else {
                        clPos.push(pos);
                    }
                }
            }
        }
        return { naPositions: naPos, clPositions: clPos };
    }, []);

    useFrame((state) => {
        const t = state.clock.getElapsedTime();
        const tempPulse = (temperature / 1000) * 0.05;

        if (meshNaRef.current) {
            const dummy = new THREE.Object3D();
            naPositions.forEach((pos, i) => {
                // Subtle thermal vibration
                const vibrationX = Math.sin(t * 10 + pos.x) * tempPulse;
                const vibrationY = Math.cos(t * 10 + pos.y) * tempPulse;
                const vibrationZ = Math.sin(t * 10 + pos.z) * tempPulse;

                dummy.position.set(pos.x + vibrationX, pos.y + vibrationY, pos.z + vibrationZ);
                dummy.updateMatrix();
                meshNaRef.current!.setMatrixAt(i, dummy.matrix);
            });
            meshNaRef.current.instanceMatrix.needsUpdate = true;
        }

        if (meshClRef.current) {
            const dummy = new THREE.Object3D();
            clPositions.forEach((pos, i) => {
                const vibrationX = Math.cos(t * 10 + pos.x) * tempPulse;
                const vibrationY = Math.sin(t * 10 + pos.y) * tempPulse;
                const vibrationZ = Math.cos(t * 10 + pos.z) * tempPulse;

                dummy.position.set(pos.x + vibrationX, pos.y + vibrationY, pos.z + vibrationZ);
                dummy.updateMatrix();
                meshClRef.current!.setMatrixAt(i, dummy.matrix);
            });
            meshClRef.current.instanceMatrix.needsUpdate = true;
        }

        if (groupRef.current) {
            groupRef.current.rotation.y = t * 0.05;
        }
    });

    const bondLines = useMemo(() => {
        const lines: { start: THREE.Vector3; end: THREE.Vector3 }[] = [];
        const offset = (gridSize - 1) * spacing * 0.5;

        for (let x = 0; x < gridSize; x++) {
            for (let y = 0; y < gridSize; y++) {
                for (let z = 0; z < gridSize; z++) {
                    const pos = new THREE.Vector3(
                        x * spacing - offset,
                        y * spacing - offset,
                        z * spacing - offset
                    );

                    // Add lines in 3 directions if not at the edge
                    if (x < gridSize - 1) {
                        lines.push({ start: pos.clone(), end: pos.clone().add(new THREE.Vector3(spacing, 0, 0)) });
                    }
                    if (y < gridSize - 1) {
                        lines.push({ start: pos.clone(), end: pos.clone().add(new THREE.Vector3(0, spacing, 0)) });
                    }
                    if (z < gridSize - 1) {
                        lines.push({ start: pos.clone(), end: pos.clone().add(new THREE.Vector3(0, 0, spacing)) });
                    }
                }
            }
        }
        return lines;
    }, []);

    return (
        <group ref={groupRef}>
            {/* Sodium (Na+) - Smaller, purple/blue */}
            <instancedMesh ref={meshNaRef} args={[undefined, undefined, naPositions.length]}>
                <sphereGeometry args={[0.3, 16, 16]} />
                <meshStandardMaterial color="#ab5cf2" metalness={0.5} roughness={0.2} emissive="#220044" emissiveIntensity={0.5} />
            </instancedMesh>

            {/* Chlorine (Cl-) - Larger, green */}
            <instancedMesh ref={meshClRef} args={[undefined, undefined, clPositions.length]}>
                <sphereGeometry args={[0.45, 16, 16]} />
                <meshStandardMaterial color="#1ff01f" metalness={0.5} roughness={0.2} emissive="#004400" emissiveIntensity={0.5} />
            </instancedMesh>

            {/* Ionic Bonds (Lattice Grid Lines) */}
            <group>
                {bondLines.map((line, idx) => {
                    const dir = line.end.clone().sub(line.start);
                    const len = dir.length();
                    const mid = line.start.clone().add(dir.clone().multiplyScalar(0.5));
                    return (
                        <mesh key={idx} position={mid} quaternion={new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.clone().normalize())}>
                            <cylinderGeometry args={[0.015, 0.015, len, 8]} />
                            <meshBasicMaterial color="#ffffff" transparent opacity={0.15} />
                        </mesh>
                    );
                })}
            </group>
        </group>
    );
}
