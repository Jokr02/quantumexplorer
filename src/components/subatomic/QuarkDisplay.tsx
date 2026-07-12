import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text, Billboard } from '@react-three/drei';
import * as THREE from 'three';
import { useGameStore } from '../../store/useGameStore';
import { seededRandom } from '../../utils/random';

/**
 * Quark visualization that shows individual quarks orbiting inside a highlighted nucleon.
 * Protons: 2 Up quarks + 1 Down quark (uud)
 * Neutrons: 1 Up quark + 2 Down quarks (udd)
 * Also renders "flux tubes" (force lines) connecting the quarks.
 */

interface QuarkProps {
    position: THREE.Vector3;
    type: 'up' | 'down';
    colorCharge: string; // RGB color charge
    orbitRadius: number;
    orbitSpeed: number;
    orbitOffset: number;
}

function Quark({ position, type, colorCharge, orbitRadius, orbitSpeed, orbitOffset }: QuarkProps) {
    const ref = useRef<THREE.Group>(null);

    useFrame((state) => {
        if (ref.current) {
            const t = state.clock.getElapsedTime() * orbitSpeed + orbitOffset;
            ref.current.position.x = position.x + Math.cos(t) * orbitRadius;
            ref.current.position.y = position.y + Math.sin(t * 0.7) * orbitRadius * 0.8;
            ref.current.position.z = position.z + Math.sin(t) * orbitRadius;
        }
    });

    return (
        <group ref={ref}>
            {/* Quark sphere */}
            <mesh>
                <sphereGeometry args={[0.06, 16, 16]} />
                <meshStandardMaterial
                    color={colorCharge}
                    emissive={colorCharge}
                    emissiveIntensity={0.8}
                />
            </mesh>

            {/* Quark glow */}
            <mesh>
                <sphereGeometry args={[0.1, 12, 12]} />
                <meshBasicMaterial
                    color={colorCharge}
                    transparent
                    opacity={0.2}
                    blending={THREE.AdditiveBlending}
                    depthWrite={false}
                />
            </mesh>

            {/* Quark label */}
            <Billboard position={[0, 0.15, 0]}>
                <Text
                    fontSize={0.08}
                    color="#ffffff"
                    outlineWidth={0.01}
                    outlineColor="#000000"
                    font={undefined}
                >
                    {type === 'up' ? 'u' : 'd'}
                </Text>
            </Billboard>
        </group>
    );
}


// Color charges for the quarks (RGB): Red, Green, Blue
const quarkColors = ['#ff3333', '#33ff33', '#3333ff'];

export function QuarkDisplay() {
    const selectedElement = useGameStore((state) => state.selectedElement);

    // Generate quark positions for a sample of nucleons
    const nucleonQuarks = useMemo(() => {
        const protons = selectedElement.atomicNumber;
        const neutrons = selectedElement.neutrons;
        const total = protons + neutrons;
        const quarks: {
            nucleonPos: THREE.Vector3;
            type: 'proton' | 'neutron';
            quarks: { type: 'up' | 'down'; color: string; offset: number }[];
        }[] = [];

        // Only show quarks for up to 8 nucleons to keep it readable
        const showCount = Math.min(total, 8);

        for (let i = 0; i < showCount; i++) {
            const phi = Math.acos(1 - 2 * (i + 0.5) / total);
            const theta = Math.PI * (1 + Math.sqrt(5)) * i;
            const radius = 0.5 * Math.pow(total, 1 / 3) * 0.6;

            const r = radius * 0.8 + seededRandom(i * 12.9898) * 0.2;
            const x = r * Math.sin(phi) * Math.cos(theta);
            const y = r * Math.sin(phi) * Math.sin(theta);
            const z = r * Math.cos(phi);

            const isProton = i < protons;
            const nucleonType = isProton ? 'proton' : 'neutron';

            // Proton: uud, Neutron: udd
            const quarkTypes: ('up' | 'down')[] = isProton
                ? ['up', 'up', 'down']
                : ['up', 'down', 'down'];

            quarks.push({
                nucleonPos: new THREE.Vector3(x, y, z),
                type: nucleonType,
                quarks: quarkTypes.map((qt, qi) => ({
                    type: qt,
                    color: quarkColors[qi],
                    offset: (qi / 3) * Math.PI * 2
                }))
            });
        }

        return quarks;
    }, [selectedElement.atomicNumber, selectedElement.neutrons]);

    return (
        <group>
            {nucleonQuarks.map((nucleon, ni) => (
                <group key={ni}>
                    {nucleon.quarks.map((quark, qi) => (
                        <Quark
                            key={`${ni}-${qi}`}
                            position={nucleon.nucleonPos}
                            type={quark.type}
                            colorCharge={quark.color}
                            orbitRadius={0.12}
                            orbitSpeed={2 + qi * 0.5}
                            orbitOffset={quark.offset}
                        />
                    ))}

                    {/* Nucleon type label */}
                    <Billboard position={[nucleon.nucleonPos.x, nucleon.nucleonPos.y + 0.3, nucleon.nucleonPos.z]}>
                        <Text
                            fontSize={0.06}
                            color={nucleon.type === 'proton' ? '#ff6666' : '#ffaa44'}
                            outlineWidth={0.01}
                            outlineColor="#000000"
                        >
                            {nucleon.type === 'proton' ? 'p+ (uud)' : 'n0 (udd)'}
                        </Text>
                    </Billboard>
                </group>
            ))}
        </group>
    );
}
