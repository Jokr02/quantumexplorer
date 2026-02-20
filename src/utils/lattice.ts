import * as THREE from 'three';

export function generateCrystalGrid(rows: number, cols: number, depth: number, spacing: number): THREE.Vector3[] {
    const positions: THREE.Vector3[] = [];
    const centerOffset = new THREE.Vector3(
        (rows - 1) * spacing * 0.5,
        (cols - 1) * spacing * 0.5,
        (depth - 1) * spacing * 0.5
    );

    for (let x = 0; x < rows; x++) {
        for (let y = 0; y < cols; y++) {
            for (let z = 0; z < depth; z++) {
                const position = new THREE.Vector3(
                    x * spacing,
                    y * spacing,
                    z * spacing
                ).sub(centerOffset);
                positions.push(position);
            }
        }
    }

    return positions;
}
