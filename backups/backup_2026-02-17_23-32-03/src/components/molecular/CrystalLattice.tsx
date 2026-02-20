import { useRef, useMemo, useEffect } from 'react';
import * as THREE from 'three';
import { generateCrystalGrid } from '../../utils/lattice';


export function CrystalLattice() {
    const meshRef = useRef<THREE.InstancedMesh>(null);
    // Generate 10x10x10 grid with spacing of 1.5 units
    // Generate 15x15x15 grid for wider coverage
    // Generate 3x3x3 grid (27 atoms) for a simpler, clearer view
    const count = 27;
    const positions = useMemo(() => generateCrystalGrid(3, 3, 3, 4.0), []);

    // Reuse dummy object for matrix calculations
    const dummy = useMemo(() => new THREE.Object3D(), []);

    useEffect(() => {
        if (meshRef.current) {
            positions.forEach((pos, i) => {
                dummy.position.copy(pos);
                dummy.updateMatrix();
                meshRef.current!.setMatrixAt(i, dummy.matrix);
            });
            meshRef.current.instanceMatrix.needsUpdate = true;
        }
    }, [positions, dummy]);



    return (
        <instancedMesh
            ref={meshRef}
            args={[undefined, undefined, count]}
        >
            {/* High-quality PBR Sphere */}
            <sphereGeometry args={[0.35, 32, 32]} />
            <meshPhysicalMaterial
                color="#2a4cdb"
                emissive="#1a2c8b"
                emissiveIntensity={0.2}
                roughness={0.1}
                metalness={0.1}
                clearcoat={1.0}
                clearcoatRoughness={0.1}
                transmission={0.2} // Slight transparency/subsurface feel
                thickness={2.0}
            />
        </instancedMesh>
    );
}
