import { useRef, useMemo, useEffect } from 'react';
import * as THREE from 'three';

export function CrystalBonds() {
    const meshRef = useRef<THREE.InstancedMesh>(null);

    // Reuse the same grid logic or pass it down. 
    // For simplicity, re-generating for now, but in a real app would pass props.
    // We need to generate connections.
    // 10x10x10 grid.
    // Horizontal bonds (X axis), Vertical (Y axis), Depth (Z axis).

    const { positions, orientations, scales } = useMemo(() => {
        const spacing = 4.0; // Match Lattice spacing
        const rows = 3;
        const cols = 3;
        const depths = 3;

        // We need to calculate bond positions.
        // A bond connects two nodes.
        // Length of bond = spacing.
        // Thickness = thinner.

        const bondPositions: THREE.Vector3[] = [];
        const bondQuaternions: THREE.Quaternion[] = [];

        const centerOffset = new THREE.Vector3(
            (rows - 1) * spacing * 0.5,
            (cols - 1) * spacing * 0.5,
            (depths - 1) * spacing * 0.5
        );

        // Helper to add a bond
        const addBond = (p1: THREE.Vector3, p2: THREE.Vector3) => {
            const midpoint = new THREE.Vector3().addVectors(p1, p2).multiplyScalar(0.5);
            bondPositions.push(midpoint);

            const direction = new THREE.Vector3().subVectors(p2, p1).normalize();
            const quaternion = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction);
            bondQuaternions.push(quaternion);
        };

        // Iterate and create connections
        // Naively: For each node, connect to neighbors in +X, +Y, +Z to avoid duplicates
        for (let x = 0; x < rows; x++) {
            for (let y = 0; y < cols; y++) {
                for (let z = 0; z < depths; z++) {
                    const currentPos = new THREE.Vector3(x * spacing, y * spacing, z * spacing).sub(centerOffset);

                    if (x < rows - 1) {
                        const nextX = new THREE.Vector3((x + 1) * spacing, y * spacing, z * spacing).sub(centerOffset);
                        addBond(currentPos, nextX);
                    }
                    if (y < cols - 1) {
                        const nextY = new THREE.Vector3(x * spacing, (y + 1) * spacing, z * spacing).sub(centerOffset);
                        addBond(currentPos, nextY);
                    }
                    if (z < depths - 1) {
                        const nextZ = new THREE.Vector3(x * spacing, y * spacing, (z + 1) * spacing).sub(centerOffset);
                        addBond(currentPos, nextZ);
                    }
                }
            }
        }

        return { positions: bondPositions, orientations: bondQuaternions, scales: new THREE.Vector3(0.02, spacing, 0.02) };
    }, []);

    const dummy = useMemo(() => new THREE.Object3D(), []);

    useEffect(() => {
        if (meshRef.current) {
            positions.forEach((pos, i) => {
                dummy.position.copy(pos);
                dummy.quaternion.copy(orientations[i]);
                dummy.scale.copy(scales); // Cylinder height is 1 by default, so scale Y by length
                dummy.updateMatrix();
                meshRef.current!.setMatrixAt(i, dummy.matrix);
            });
            meshRef.current.instanceMatrix.needsUpdate = true;
        }
    }, [positions, orientations, scales, dummy]);

    return (
        <instancedMesh ref={meshRef} args={[undefined, undefined, positions.length]}>
            <cylinderGeometry args={[1, 1, 1, 16]} />
            <meshStandardMaterial
                color="#a0a0a0"
                metalness={0.9}
                roughness={0.2}
                transparent
                opacity={0.8}
            />
        </instancedMesh>
    );
}
