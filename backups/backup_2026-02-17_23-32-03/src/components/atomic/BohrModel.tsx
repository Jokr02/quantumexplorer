import { useRef, useMemo, useLayoutEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text, Sphere, Torus, Billboard } from '@react-three/drei';
import * as THREE from 'three';
import { useGameStore } from '../../store/useGameStore';
import { calculateElectronShells } from '../../utils/atomic';

// --- Sub-components ---

function OrbitRing({ radius }: { radius: number }) {
    return (
        <group rotation={[Math.PI / 2, 0, 0]}>
            <Torus args={[radius, 0.03, 32, 100]}>
                <meshBasicMaterial color="#44aaff" transparent opacity={0.35} />
            </Torus>
        </group>
    );
}

function Electron({ radius, speed, offset, showLabel }: { radius: number, speed: number, offset: number, showLabel: boolean }) {
    const ref = useRef<THREE.Group>(null);
    const labelRef = useRef<THREE.Group>(null);

    useFrame((state) => {
        if (ref.current) {
            const time = state.clock.getElapsedTime();
            const angle = time * speed + offset;
            ref.current.position.x = Math.cos(angle) * radius;
            ref.current.position.z = Math.sin(angle) * radius;

            // Visibility Logic: Hide label if "behind" the nucleus
            // Camera is at positive Z. So Z > 0 is front hemisphere.
            // Using a small threshold (0.2) to ensure it disappears just as it goes behind the visible bulk.
            if (labelRef.current && showLabel) {
                labelRef.current.visible = ref.current.position.z > 0.2;
            }
        }
    });

    return (
        <group ref={ref}>
            {/* Increased Electron Size */}
            <Sphere args={[0.2, 16, 16]}>
                <meshStandardMaterial
                    color="#0088ff"
                    emissive="#0088ff"
                    emissiveIntensity={3}
                    toneMapped={false}
                />
            </Sphere>
            {/* Conditional Label to reduce clutter */}
            {showLabel && (
                <group ref={labelRef}>
                    <Billboard position={[0, 0.5, 0]}>
                        <Text fontSize={0.6} color="#88ccff" outlineWidth={0.04} outlineColor="#000000">
                            e-
                        </Text>
                    </Billboard>
                </group>
            )}
        </group>
    );
}

// --- Main Component ---

export function BohrModel() {
    const selectedElement = useGameStore((state) => state.selectedElement);

    // Dynamic Nucleus Calculation (Positions & Colors)
    const nucleusData = useMemo(() => {
        const particles = [];
        const protons = selectedElement.atomicNumber;
        const neutrons = selectedElement.neutrons;
        const count = protons + neutrons;

        for (let i = 0; i < count; i++) {
            // Spiral distribution
            const phi = Math.acos(-1 + (2 * i) / count);
            const theta = Math.sqrt(count * Math.PI) * phi;

            // Radius grows slightly with more particles
            const spread = 0.45 + (count * 0.005);
            const x = spread * Math.sin(phi) * Math.cos(theta);
            const y = spread * Math.sin(phi) * Math.sin(theta);
            const z = spread * Math.cos(phi);

            let color = '#aaaaaa'; // Grey Neutron
            if (i % 2 === 0) {
                color = selectedElement.color; // Element Theme Color
            }

            particles.push({
                pos: new THREE.Vector3(x, y, z),
                color: new THREE.Color(color).multiplyScalar(0.4) // Darken to prevent excessive bloom
            });
        }
        return particles;
    }, [selectedElement]);

    const shells = useMemo(() => calculateElectronShells(selectedElement.atomicNumber), [selectedElement.atomicNumber]);

    // Instanced Mesh Ref
    const meshRef = useRef<THREE.InstancedMesh>(null);
    const modelRef = useRef<THREE.Group>(null);

    // Update Instances on Data Change
    useLayoutEffect(() => {
        if (!meshRef.current) return;

        const dummy = new THREE.Object3D();

        nucleusData.forEach((particle, i) => {
            dummy.position.copy(particle.pos);
            dummy.updateMatrix();
            meshRef.current!.setMatrixAt(i, dummy.matrix);
            meshRef.current!.setColorAt(i, particle.color);
        });

        meshRef.current.instanceMatrix.needsUpdate = true;
        if (meshRef.current.instanceColor) meshRef.current.instanceColor.needsUpdate = true;

    }, [nucleusData]);


    // Calculate Base Radius for Nucleus to ensure first shell doesn't clip
    const nucleusRadius = useMemo(() => {
        const count = selectedElement.atomicNumber + selectedElement.neutrons;
        return 0.45 + (count * 0.005) + 0.3; // Spread + Particle Radius
    }, [selectedElement]);

    // Dynamic Scaling Calculation
    const groupScale = useMemo(() => {
        // Calculate the radius of the outermost shell
        const shellCount = shells.length;

        let outerRadius = 2.0;
        if (shellCount > 0) {
            const baseRadius = Math.max(2.0, nucleusRadius + 0.5);
            outerRadius = baseRadius + ((shellCount - 1) * 1.5);
        }

        // Map radius to scale:
        // Small radius (Hydrogen ~2.0) -> Scale ~0.8
        // Large radius (Oganesson ~12.0) -> Scale ~0.35
        const minRadius = 2.0;    // Hydrogen
        const maxRadius = 14.0;   // Oganesson + margin
        const maxScale = 0.85;    // Boost for small atoms
        const minScale = 0.35;    // Valid for large atoms (fits screen)

        return THREE.MathUtils.mapLinear(
            THREE.MathUtils.clamp(outerRadius, minRadius, maxRadius),
            minRadius, maxRadius,
            maxScale, minScale
        );
    }, [shells, nucleusRadius]);

    return (
        <group ref={modelRef} scale={groupScale}>
            {/* Optimized Nucleus using InstancedMesh */}
            <instancedMesh ref={meshRef} args={[undefined, undefined, nucleusData.length]}>
                <sphereGeometry args={[0.3, 12, 12]} /> {/* Reduced geometry detail */}
                <meshPhysicalMaterial roughness={0.7} metalness={0.0} />
            </instancedMesh>

            {/* Electron Shells */}
            {shells.map((electronCount, shellIndex) => {
                // Ensure first shell starts outside nucleus
                const baseRadius = Math.max(2.0, nucleusRadius + 0.5);
                const radius = baseRadius + (shellIndex * 1.5);
                const speed = 0; // Frozen as requested

                // Render Orbit Ring ONCE per shell
                const orbit = <OrbitRing key={`ring-${shellIndex}`} radius={radius} />;

                // Distribute electrons
                const electrons = [];
                for (let i = 0; i < electronCount; i++) {
                    const offset = (Math.PI * 2 * i) / electronCount; // Evenly spacing

                    // Show label for:
                    // - First electron (i===0) ALWAYS
                    // - Every 6th electron thereafter to reduce clutter on large shells
                    const showLabel = (i === 0) || (i > 0 && i % 6 === 0);

                    electrons.push(
                        <Electron
                            key={`shell-${shellIndex}-e-${i}`}
                            radius={radius}
                            speed={speed} // Actually 0
                            offset={offset}
                            showLabel={showLabel}
                        />
                    );
                }

                // Smooth Rotation: Less extreme tilt for outer shells
                // Start at 0, slowly tilt up to ~30 degrees (0.5 rad)
                const xTilt = 0.1 + (shellIndex * 0.05);
                const yTilt = 0.2 * (shellIndex % 2 ? 1 : -1);

                return (
                    // Rotate shells slightly for 3D depth, alternating
                    <group key={`shell-${shellIndex}`} rotation={[xTilt, yTilt, 0]}>
                        {orbit}
                        {electrons}
                    </group>
                );
            })}

            {/* Polarity Indicator - Moved Forward (Positive Z) to avoid occlusion */}
            {/* Position: [Offset X, Offset Y, Front Z] */}
            <Billboard position={[nucleusRadius * 0.4, nucleusRadius * 0.4, nucleusRadius + 0.5]}>
                <Text
                    fontSize={Math.max(0.5, nucleusRadius * 0.4)}
                    color="#ffffff"
                    outlineWidth={0.04}
                    outlineColor="#000000"
                    depthTest={false} // Always render on top of nucleus
                    renderOrder={999}
                >
                    p+
                </Text>
            </Billboard>
        </group>
    );
}
