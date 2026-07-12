import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useGameStore } from '../../store/useGameStore';

export function GraphiteLattice() {
    const { temperature } = useGameStore();
    const meshRef = useRef<THREE.InstancedMesh>(null);
    const groupRef = useRef<THREE.Group>(null);
    const vanDerWaalsRef = useRef<THREE.Group>(null);

    const sheets = 3;
    const radius = 3; // Rings around center
    const bondLength = 1.4; // Intra-layer (strong)
    const layerSpacing = 3.35; // Inter-layer (weak)

    const { atoms, covalentBonds, vanDerWaalsBonds } = useMemo(() => {
        const atomPositions: THREE.Vector3[] = [];
        const covBonds: { start: THREE.Vector3; end: THREE.Vector3 }[] = [];
        const vdwBonds: { start: THREE.Vector3; end: THREE.Vector3 }[] = [];

        const layerArrays: THREE.Vector3[][] = [];

        // 1. Generate Hexagonal Sheets
        for (let layer = 0; layer < sheets; layer++) {
            const currentLayerAtoms: THREE.Vector3[] = [];
            const yOffset = (layer - (sheets - 1) / 2) * layerSpacing;

            // Hexagonal grid generation (axial coordinates)
            for (let q = -radius; q <= radius; q++) {
                for (let r = -radius; r <= radius; r++) {
                    if (Math.abs(q + r) <= radius) {
                        // Two atoms per unit cell in graphene
                        const x1 = bondLength * Math.sqrt(3) * (q + r / 2);
                        const z1 = bondLength * 3 / 2 * r;

                        const x2 = bondLength * Math.sqrt(3) * (q + r / 2) + bondLength * Math.sqrt(3) / 2;
                        const z2 = bondLength * 3 / 2 * r + bondLength / 2;

                        currentLayerAtoms.push(new THREE.Vector3(x1, yOffset, z1));

                        // Don't add the second atom if it pushes too far out radially to keep a circular sheet shape
                        if (x2 * x2 + z2 * z2 < (radius * bondLength * 2) ** 2) {
                            currentLayerAtoms.push(new THREE.Vector3(x2, yOffset, z2));
                        }
                    }
                }
            }

            // Offset every other layer for AB resting pattern 
            if (layer % 2 !== 0) {
                const shift = new THREE.Vector3(0, 0, bondLength);
                currentLayerAtoms.forEach(pos => pos.add(shift));
            }

            atomPositions.push(...currentLayerAtoms);
            layerArrays.push(currentLayerAtoms);
        }

        // 2. Generate Intra-layer Covalent Bonds
        const tolerance = 0.1;
        layerArrays.forEach(layerAtoms => {
            for (let i = 0; i < layerAtoms.length; i++) {
                for (let j = i + 1; j < layerAtoms.length; j++) {
                    const dist = layerAtoms[i].distanceTo(layerAtoms[j]);
                    if (Math.abs(dist - bondLength) < tolerance) {
                        covBonds.push({ start: layerAtoms[i], end: layerAtoms[j] });
                    }
                }
            }
        });

        // 3. Generate Inter-layer Van der Waals Bonds (verticalish)
        for (let l = 0; l < layerArrays.length - 1; l++) {
            const top = layerArrays[l];
            const bottom = layerArrays[l + 1];

            // Just connect atoms that are directly above/below each other within a radius
            top.forEach(tAtom => {
                bottom.forEach(bAtom => {
                    const dist = tAtom.distanceTo(bAtom);
                    if (Math.abs(dist - layerSpacing) < 0.5) {
                        vdwBonds.push({ start: tAtom, end: bAtom });
                    }
                });
            });
        }

        return { atoms: atomPositions, covalentBonds: covBonds, vanDerWaalsBonds: vdwBonds };
    }, []);

    useFrame((state) => {
        const t = state.clock.getElapsedTime();
        const tempPulse = (temperature / 1000) * 0.08;

        if (meshRef.current) {
            const dummy = new THREE.Object3D();
            atoms.forEach((pos, i) => {
                // Different vibration profiles: stiff in XZ (sheets), loose in Y (between sheets)
                const vibrationX = Math.sin(t * 15 + pos.x * 5) * tempPulse * 0.3;
                const vibrationZ = Math.cos(t * 15 + pos.z * 5) * tempPulse * 0.3;

                // Exaggerated vertical thermal motion due to weak interlayer bonds
                const vibrationY = Math.sin(t * 10 + pos.x) * tempPulse * 2.0;

                dummy.position.set(pos.x + vibrationX, pos.y + vibrationY, pos.z + vibrationZ);
                dummy.updateMatrix();
                meshRef.current!.setMatrixAt(i, dummy.matrix);
            });
            meshRef.current.instanceMatrix.needsUpdate = true;
        }

        if (vanDerWaalsRef.current) {
            // Pulse the weak bonds
            const flicker = Math.sin(t * 4.0) * 0.2 + 0.4;
            vanDerWaalsRef.current.children.forEach((child) => {
                if (child instanceof THREE.Mesh) {
                    (child.material as THREE.Material).opacity = flicker;
                }
            });
        }

        if (groupRef.current) {
            groupRef.current.rotation.y = t * 0.05;
        }
    });

    return (
        <group ref={groupRef}>
            {/* Carbon Atoms (Graphite style - darker, metallic) */}
            <instancedMesh ref={meshRef} args={[undefined, undefined, atoms.length]}>
                <sphereGeometry args={[0.3, 16, 16]} />
                <meshStandardMaterial
                    color="#1a1a1a"
                    metalness={0.9}
                    roughness={0.4}
                    emissive="#000000"
                />
            </instancedMesh>

            {/* Covalent Bonds (Intra-layer) */}
            <group>
                {covalentBonds.map((line, idx) => {
                    const dir = line.end.clone().sub(line.start);
                    const len = dir.length();
                    const mid = line.start.clone().add(dir.clone().multiplyScalar(0.5));
                    return (
                        <mesh key={idx} position={mid} quaternion={new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.clone().normalize())}>
                            <cylinderGeometry args={[0.08, 0.08, len, 8]} />
                            <meshStandardMaterial color="#333333" metalness={0.8} roughness={0.5} />
                        </mesh>
                    );
                })}
            </group>

            {/* Van der Waals Bonds (Inter-layer, weak & pulsing) */}
            <group ref={vanDerWaalsRef}>
                {vanDerWaalsBonds.map((line, idx) => {
                    const dir = line.end.clone().sub(line.start);
                    const len = dir.length();
                    const mid = line.start.clone().add(dir.clone().multiplyScalar(0.5));
                    return (
                        <mesh key={idx} position={mid} quaternion={new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.clone().normalize())}>
                            <cylinderGeometry args={[0.02, 0.02, len, 8]} />
                            <meshBasicMaterial color="#a0c0ff" transparent opacity={0.3} depthWrite={false} blending={THREE.AdditiveBlending} />
                        </mesh>
                    );
                })}
            </group>
        </group>
    );
}
