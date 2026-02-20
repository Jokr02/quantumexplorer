

import { useEffect } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useGameStore } from '../../store/useGameStore';

export function CameraController() {
    const { camera } = useThree();
    const { targetScale, currentScale, actions } = useGameStore();

    // Ref to track accumulated scroll for smoothing

    useEffect(() => {
        // Scroll zoom removed as per user request.
        // Navigation is now button-driven.
    }, []);

    useFrame((_, delta) => {
        // Smoothly interpolate currentScale towards targetScale
        const damping = 4.0 * delta;
        const newScale = THREE.MathUtils.lerp(currentScale, targetScale, damping);

        // Update store with new interpolated value (for UI and other components)
        // Avoid too many updates if difference is negligible
        if (Math.abs(newScale - currentScale) > 0.001) {
            actions.setCurrentScale(newScale);
        }

        // Map Scale to Camera Z position
        // Scale 3 (Molecular) -> Z = 15
        // Scale 2 (Atomic) -> Z = 5
        // Scale 0.5 (Subatomic) -> Z = 1

        // Simple linear mapping for now, or piece-wise
        let targetZ = 5;
        if (newScale > 2) {
            // Atomic(2) to Molecular(14) -> 15 to 140
            targetZ = THREE.MathUtils.mapLinear(newScale, 2, 14, 15, 140);
        } else {
            // Atomic(2) to Subatomic(0.5) -> 15 to 2.5
            // Increased min Z from 0.5 to 2.5 to prevent clipping into the Nucleus
            targetZ = THREE.MathUtils.mapLinear(newScale, 0.5, 2, 2.5, 15);
        }

        camera.position.setZ(targetZ); // eslint-disable-line react-hooks/immutability
        camera.lookAt(0, 0, 0);
    });

    return null;
}
