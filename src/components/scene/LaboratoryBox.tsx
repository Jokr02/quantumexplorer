import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export function LaboratoryBox() {
    const size = 12;
    const edgeRef = useRef<THREE.LineSegments>(null);

    // Animate edge opacity for a subtle pulse
    useFrame((state) => {
        if (edgeRef.current) {
            const mat = edgeRef.current.material as THREE.LineBasicMaterial;
            mat.opacity = 0.4 + Math.sin(state.clock.getElapsedTime() * 0.5) * 0.1;
        }
    });

    // Create edge geometry from box
    const edgeGeometry = new THREE.EdgesGeometry(new THREE.BoxGeometry(size, size, size));

    return (
        <group>
            {/* Transparent Fill - Very subtle, no glare */}
            <mesh>
                <boxGeometry args={[size, size, size]} />
                <meshBasicMaterial
                    color="#a8c8e8"
                    transparent
                    opacity={0.06}
                    side={THREE.DoubleSide}
                    depthWrite={false}
                />
            </mesh>

            {/* Clean Glowing Edges */}
            <lineSegments ref={edgeRef} geometry={edgeGeometry}>
                <lineBasicMaterial
                    color="#4488cc"
                    transparent
                    opacity={0.5}
                    linewidth={1}
                />
            </lineSegments>

            {/* Floor Grid for depth */}
            <gridHelper
                args={[size * 1.5, 15, 0xbbbbbb, 0xdddddd]}
                position={[0, -size / 2 - 0.1, 0]}
            />
        </group>
    );
}
