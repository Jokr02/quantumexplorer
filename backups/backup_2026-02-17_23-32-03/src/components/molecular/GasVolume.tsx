/* eslint-disable react-hooks/purity */
/* eslint-disable react-hooks/immutability */
import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export function GasVolume() {
    const meshRef = useRef<THREE.InstancedMesh>(null);
    const count = 30; // Very sparse

    // Initial random positions and velocities
    const { positions, velocities } = useMemo(() => {
        const posArray = new Float32Array(count * 3);
        const velArray = new Float32Array(count * 3);
        const range = 10;

        for (let i = 0; i < count; i++) {
            posArray[i * 3] = (Math.random() - 0.5) * range;
            posArray[i * 3 + 1] = (Math.random() - 0.5) * range;
            posArray[i * 3 + 2] = (Math.random() - 0.5) * range;

            // Random fast velocities
            velArray[i * 3] = (Math.random() - 0.5) * 0.2;
            velArray[i * 3 + 1] = (Math.random() - 0.5) * 0.2;
            velArray[i * 3 + 2] = (Math.random() - 0.5) * 0.2;
        }
        return { positions: posArray, velocities: velArray };
    }, []);

    const dummy = useMemo(() => new THREE.Object3D(), []);

    useFrame(() => {
        if (!meshRef.current) return;

        const range = 15; // Boundary to wrap around

        for (let i = 0; i < count; i++) {
            const ix = i * 3;

            // Apply velocity
            positions[ix] += velocities[ix];
            positions[ix + 1] += velocities[ix + 1];
            positions[ix + 2] += velocities[ix + 2];

            // Wrap around (Toroidal boundary)
            if (positions[ix] > range) positions[ix] -= range * 2;
            if (positions[ix] < -range) positions[ix] += range * 2;
            if (positions[ix + 1] > range) positions[ix + 1] -= range * 2;
            if (positions[ix + 1] < -range) positions[ix + 1] += range * 2;
            if (positions[ix + 2] > range) positions[ix + 2] -= range * 2;
            if (positions[ix + 2] < -range) positions[ix + 2] += range * 2;

            dummy.position.set(positions[ix], positions[ix + 1], positions[ix + 2]);
            dummy.scale.setScalar(0.7); // Smaller particles

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
            <sphereGeometry args={[0.1, 8, 8]} />
            <meshStandardMaterial
                color="#00ffa3"
                emissive="#00ffa3"
                emissiveIntensity={1}
                transparent
                opacity={0.4}
                blending={THREE.AdditiveBlending}
            />
        </instancedMesh>
    );
}
