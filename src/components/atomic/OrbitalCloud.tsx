/* eslint-disable react-hooks/purity */
import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useGameStore } from '../../store/useGameStore';
import { getElectronConfiguration } from '../../utils/electronConfig';

/**
 * Orbital probability cloud visualization.
 * Renders electron orbitals as point clouds with shapes based on orbital type:
 * - s orbitals: spherical clouds
 * - p orbitals: dumbbell shapes (3 orientations)
 * - d orbitals: cloverleaf shapes
 */

const orbitalVertexShader = `
uniform float uTime;
attribute float size;
attribute vec3 aColor;
attribute float aOpacity;
varying vec3 vColor;
varying float vOpacity;

void main() {
    vColor = aColor;
    vOpacity = aOpacity;

    // Gentle breathing animation
    vec3 pos = position;
    float breathe = sin(uTime * 0.5 + length(pos) * 2.0) * 0.03;
    pos *= 1.0 + breathe;

    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
    gl_PointSize = size * (300.0 / -mvPosition.z);
    gl_Position = projectionMatrix * mvPosition;
}
`;

const orbitalFragmentShader = `
varying vec3 vColor;
varying float vOpacity;

void main() {
    float dist = length(gl_PointCoord - vec2(0.5));
    if (dist > 0.5) discard;

    // Soft gaussian falloff
    float alpha = exp(-dist * dist * 8.0) * vOpacity;
    gl_FragColor = vec4(vColor, alpha * 0.6);
}
`;

// Orbital shape generators
function generateSOrbital(n: number, count: number, radius: number): THREE.Vector3[] {
    const points: THREE.Vector3[] = [];
    // s orbital: spherical probability cloud
    // Radius scales with principal quantum number
    const r = radius * (0.8 + n * 0.3);
    for (let i = 0; i < count; i++) {
        // Random point in sphere with radial probability weighting
        const u = Math.random();
        const v = Math.random();
        const theta = u * 2 * Math.PI;
        const phi = Math.acos(2 * v - 1);
        // Radial distribution: peak at r, gaussian falloff
        const rDist = r * (0.3 + Math.random() * 0.7);
        points.push(new THREE.Vector3(
            rDist * Math.sin(phi) * Math.cos(theta),
            rDist * Math.sin(phi) * Math.sin(theta),
            rDist * Math.cos(phi)
        ));
    }
    return points;
}

function generatePOrbital(n: number, count: number, radius: number, axis: 'x' | 'y' | 'z'): THREE.Vector3[] {
    const points: THREE.Vector3[] = [];
    // p orbital: dumbbell shape along axis
    const r = radius * (1.0 + n * 0.3);
    for (let i = 0; i < count; i++) {
        const t = Math.random() * Math.PI; // angle along the lobe
        const lobeSign = Math.random() > 0.5 ? 1 : -1; // which lobe
        const rr = r * Math.sin(t) * (0.3 + Math.random() * 0.5);
        const axialDist = r * Math.cos(t) * lobeSign * 0.8;
        const perpAngle = Math.random() * 2 * Math.PI;

        let x = rr * Math.cos(perpAngle);
        let y = rr * Math.sin(perpAngle);
        let z = axialDist;

        // Rotate based on axis
        if (axis === 'x') {
            [x, z] = [z, x];
        } else if (axis === 'y') {
            [y, z] = [z, y];
        }
        points.push(new THREE.Vector3(x, y, z));
    }
    return points;
}

function generateDOrbital(n: number, count: number, radius: number, variant: number): THREE.Vector3[] {
    const points: THREE.Vector3[] = [];
    const r = radius * (1.2 + n * 0.3);
    for (let i = 0; i < count; i++) {
        const theta = Math.random() * 2 * Math.PI;
        const phi = Math.random() * Math.PI;
        const rDist = r * (0.3 + Math.random() * 0.6);

        let x = rDist * Math.sin(phi) * Math.cos(theta);
        let y = rDist * Math.sin(phi) * Math.sin(theta);
        let z = rDist * Math.cos(phi);

        // d orbital shape modulation (cloverleaf)
        let angularFactor = 0;
        switch (variant % 5) {
            case 0: angularFactor = Math.abs(x * y); break;        // dxy
            case 1: angularFactor = Math.abs(x * z); break;        // dxz
            case 2: angularFactor = Math.abs(y * z); break;        // dyz
            case 3: angularFactor = Math.abs(x * x - y * y); break; // dx²-y²
            case 4: angularFactor = Math.abs(2 * z * z - x * x - y * y); break; // dz²
        }

        // Only keep points where angular factor is significant
        if (angularFactor / (rDist * rDist + 0.01) > 0.1 * Math.random()) {
            points.push(new THREE.Vector3(x, y, z));
        }
    }
    return points;
}

// Orbital colors
const ORBITAL_COLORS: Record<string, THREE.Color> = {
    s: new THREE.Color('#4fc3f7'), // Light blue
    p: new THREE.Color('#e57373'), // Red
    d: new THREE.Color('#81c784'), // Green
    f: new THREE.Color('#ffd54f'), // Gold
};

export function OrbitalCloud() {
    const selectedElement = useGameStore((state) => state.selectedElement);
    const pointsRef = useRef<THREE.Points>(null);
    const materialRef = useRef<THREE.ShaderMaterial>(null);

    const { positions, colors, sizes, opacities, totalPoints } = useMemo(() => {
        const config = getElectronConfiguration(selectedElement.atomicNumber);
        const allPositions: number[] = [];
        const allColors: number[] = [];
        const allSizes: number[] = [];
        const allOpacities: number[] = [];

        const baseRadius = 1.5;
        const pointsPerElectron = 50;

        config.forEach(({ subshell, count }) => {
            const n = parseInt(subshell[0]); // principal quantum number
            const type = subshell[1]; // s, p, d, f
            const color = ORBITAL_COLORS[type] || ORBITAL_COLORS.s;

            // Generate points based on orbital type
            let points: THREE.Vector3[] = [];

            if (type === 's') {
                points = generateSOrbital(n, count * pointsPerElectron, baseRadius);
            } else if (type === 'p') {
                // Distribute among px, py, pz
                const axes: ('x' | 'y' | 'z')[] = ['x', 'y', 'z'];
                const pointsPerAxis = Math.ceil(count * pointsPerElectron / 3);
                axes.forEach(axis => {
                    points.push(...generatePOrbital(n, pointsPerAxis, baseRadius, axis));
                });
            } else if (type === 'd') {
                const pointsPerVariant = Math.ceil(count * pointsPerElectron / 5);
                for (let v = 0; v < 5; v++) {
                    points.push(...generateDOrbital(n, pointsPerVariant, baseRadius, v));
                }
            } else {
                // f orbitals: approximate with complex spherical shapes
                points = generateSOrbital(n, count * pointsPerElectron, baseRadius * 1.3);
            }

            points.forEach(p => {
                allPositions.push(p.x, p.y, p.z);
                allColors.push(color.r, color.g, color.b);
                allSizes.push(2.5 + Math.random() * 1.5);
                // Outer points are more transparent
                const dist = p.length();
                allOpacities.push(Math.max(0.2, 1.0 - dist / (baseRadius * n * 0.8)));
            });
        });

        return {
            positions: new Float32Array(allPositions),
            colors: new Float32Array(allColors),
            sizes: new Float32Array(allSizes),
            opacities: new Float32Array(allOpacities),
            totalPoints: allPositions.length / 3
        };
    }, [selectedElement]);

    // Scale to fit like the Bohr model
    const groupScale = useMemo(() => {
        const config = getElectronConfiguration(selectedElement.atomicNumber);
        const maxN = config.length > 0 ? parseInt(config[config.length - 1].subshell[0]) : 1;
        // Map number of shells to scale, similar to BohrModel logic
        const minN = 1;
        const maxNMax = 7;
        const maxScale = 1.2;
        const minScale = 0.4;
        return THREE.MathUtils.mapLinear(
            THREE.MathUtils.clamp(maxN, minN, maxNMax),
            minN, maxNMax,
            maxScale, minScale
        );
    }, [selectedElement]);

    useFrame((state) => {
        if (materialRef.current) {
            materialRef.current.uniforms.uTime.value = state.clock.getElapsedTime();
        }
    });

    if (totalPoints === 0) return null;

    return (
        <group scale={groupScale}>
            <points ref={pointsRef}>
                <bufferGeometry>
                    <bufferAttribute
                        attach="attributes-position"
                        args={[positions, 3]}
                        count={totalPoints}
                    />
                    <bufferAttribute
                        attach="attributes-aColor"
                        args={[colors, 3]}
                        count={totalPoints}
                    />
                    <bufferAttribute
                        attach="attributes-size"
                        args={[sizes, 1]}
                        count={totalPoints}
                    />
                    <bufferAttribute
                        attach="attributes-aOpacity"
                        args={[opacities, 1]}
                        count={totalPoints}
                    />
                </bufferGeometry>
                <shaderMaterial
                    ref={materialRef}
                    vertexShader={orbitalVertexShader}
                    fragmentShader={orbitalFragmentShader}
                    uniforms={{
                        uTime: { value: 0 },
                    }}
                    transparent
                    depthWrite={false}
                    blending={THREE.AdditiveBlending}
                />
            </points>

            {/* Nucleus indicator in center - Glass HUD style */}
            <mesh>
                <sphereGeometry args={[0.2, 32, 32]} />
                <meshPhysicalMaterial
                    color={selectedElement.color}
                    transmission={0.9}
                    opacity={0.8}
                    transparent
                    roughness={0.1}
                    metalness={0.1}
                    ior={1.5}
                    thickness={1.5}
                    clearcoat={1}
                />
            </mesh>
            <mesh>
                <sphereGeometry args={[0.15, 32, 32]} />
                <meshBasicMaterial color={selectedElement.color} transparent opacity={0.5} blending={THREE.AdditiveBlending} depthWrite={false} />
            </mesh>
        </group>
    );
}
