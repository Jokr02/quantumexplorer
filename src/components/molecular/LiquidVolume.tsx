/* eslint-disable react-hooks/purity */
import { useRef, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useGameStore } from '../../store/useGameStore';

export function LiquidVolume() {
    const selectedElement = useGameStore((state) => state.selectedElement);
    const temperature = useGameStore((state) => state.temperature);
    const triggerThermalPulse = useGameStore((state) => state.triggerThermalPulse);
    const meshRef = useRef<THREE.InstancedMesh>(null);
    const pulseTimeRef = useRef<number | null>(null);
    const count = 150;

    useEffect(() => {
        if (triggerThermalPulse > 0) {
            pulseTimeRef.current = performance.now() / 1000;
        }
    }, [triggerThermalPulse]);

    const positions = useMemo(() => {
        const posArray = new Float32Array(count * 3);
        const range = 11;
        for (let i = 0; i < count; i++) {
            posArray[i * 3] = (Math.random() - 0.5) * range;
            posArray[i * 3 + 1] = (Math.random() - 0.5) * range;
            posArray[i * 3 + 2] = (Math.random() - 0.5) * range;
        }
        return posArray;
    }, []);

    const dummy = useMemo(() => new THREE.Object3D(), []);

    useFrame((state) => {
        if (!meshRef.current) return;

        const time = state.clock.getElapsedTime();

        let effectiveTemp = temperature;
        if (pulseTimeRef.current !== null) {
            const t = time - pulseTimeRef.current;
            const duration = 2.0;
            if (t > duration) {
                pulseTimeRef.current = null;
            } else {
                const decay = 1.0 - (t / duration);
                effectiveTemp = Math.min(1000, temperature + 1000 * Math.pow(decay, 3));
            }
        }

        // Temperature scales flow speed: 0K = barely moving, 1000K = rapid
        const tempFactor = 0.2 + (effectiveTemp / 1000) * 1.8 * (pulseTimeRef.current !== null ? 2.5 : 1.0);
        const amplitude = 0.1 + (effectiveTemp / 1000) * 0.6 * (pulseTimeRef.current !== null ? 1.5 : 1.0);

        for (let i = 0; i < count; i++) {
            const ix = i * 3;
            const x = positions[ix] + Math.sin(time * 0.5 * tempFactor + positions[ix + 1] * 0.1) * amplitude;
            const y = positions[ix + 1] + Math.cos(time * 0.3 * tempFactor + positions[ix] * 0.1) * amplitude;
            const z = positions[ix + 2] + Math.sin(time * 0.4 * tempFactor + positions[ix + 2] * 0.1) * amplitude;

            const limit = 5.8;
            dummy.position.set(
                THREE.MathUtils.clamp(x, -limit, limit),
                THREE.MathUtils.clamp(y, -limit, limit),
                THREE.MathUtils.clamp(z, -limit, limit)
            );

            const scale = 0.8 + Math.sin(time + i) * 0.1 * (pulseTimeRef.current !== null ? 2.0 : 1.0);
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
            <sphereGeometry args={[0.2, 16, 16]} />
            <meshStandardMaterial
                color={selectedElement.color}
                emissive={selectedElement.color}
                emissiveIntensity={0.8}
                roughness={0.2}
                metalness={0.5}
            />
        </instancedMesh>
    );
}
