/* eslint-disable react-hooks/purity */
import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export function LiquidVolume() {
    const meshRef = useRef<THREE.InstancedMesh>(null);
    const count = 40; // Simpler count

    // Generate random positions within a volume
    const positions = useMemo(() => {
        const posArray = new Float32Array(count * 3);
        const range = 6; // Compact volume
        for (let i = 0; i < count; i++) {
            posArray[i * 3] = (Math.random() - 0.5) * range;
            posArray[i * 3 + 1] = (Math.random() - 0.5) * range;
            posArray[i * 3 + 2] = (Math.random() - 0.5) * range;
        }
        return posArray;
    }, []);

    // Store initial positions to apply noise/flow relative to them
    const dummy = useMemo(() => new THREE.Object3D(), []);

    useFrame((state) => {
        if (!meshRef.current) return;

        const time = state.clock.getElapsedTime();
        // Removed unused range

        for (let i = 0; i < count; i++) {
            const ix = i * 3;
            // Base oscillation
            const x = positions[ix] + Math.sin(time * 0.5 + positions[ix + 1] * 0.1) * 0.5;
            const y = positions[ix + 1] + Math.cos(time * 0.3 + positions[ix] * 0.1) * 0.5;
            const z = positions[ix + 2] + Math.sin(time * 0.4 + positions[ix + 2] * 0.1) * 0.5;

            dummy.position.set(x, y, z);

            // Particles are slightly larger and softer looking
            const scale = 0.8 + Math.sin(time + i) * 0.1;
            dummy.scale.setScalar(scale);

            dummy.updateMatrix();
            meshRef.current.setMatrixAt(i, dummy.matrix);
        }
        meshRef.current.instanceMatrix.needsUpdate = true;
    });

    return (
        <instancedMesh
            ref={meshRef}
            args={[undefined, undefined, count]}
        >
            <sphereGeometry args={[0.15, 8, 8]} />
            <meshStandardMaterial
                color="#0088ff"
                emissive="#0044aa"
                emissiveIntensity={0.5}
                roughness={0.2}
                metalness={0.8}
                transparent
                opacity={0.8}
            />
        </instancedMesh>
    );
}
