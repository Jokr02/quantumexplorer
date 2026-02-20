import { Edges } from '@react-three/drei';

export function LaboratoryBox() {
    // A simple wireframe box to represent the sample container
    // Molecular view is roughly 10-14 units wide at max zoom
    const size = 12;

    return (
        <group>
            {/* Glass Container */}
            <mesh>
                <boxGeometry args={[size, size, size]} />
                <meshPhysicalMaterial
                    color="#ffffff"
                    metalness={0.1}
                    roughness={0.05}
                    transmission={0.9} // Glass
                    thickness={1.5}
                    transparent
                    opacity={0.3}
                    side={2} // DoubleSide
                />
            </mesh>

            {/* Tech Edges */}
            <mesh>
                <boxGeometry args={[size, size, size]} />
                <Edges
                    scale={1}
                    threshold={15}
                    color="#000000"

                />
                <meshBasicMaterial transparent opacity={0.0} />
            </mesh>

            {/* Floor Grid for depth */}
            <gridHelper
                args={[size * 2, 20, 0xcccccc, 0xe5e5e5]}
                position={[0, -size / 2 - 0.1, 0]}
            />
        </group>
    );
}
