import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useGameStore } from '../../store/useGameStore';

const bondVertexShader = `
uniform float uTime;
uniform float uTemperature;
varying float vProgress;
varying vec3 vWorldPos;

void main() {
    vProgress = position.y + 0.5; // 0 to 1 along bond length
    vec4 worldPos = modelMatrix * instanceMatrix * vec4(position, 1.0);
    vWorldPos = worldPos.xyz;
    gl_Position = projectionMatrix * viewMatrix * worldPos;
}
`;

const bondFragmentShader = `
uniform float uTime;
uniform vec3 uColor;
uniform float uTemperature;
varying float vProgress;
varying vec3 vWorldPos;

void main() {
    // Pulsing energy flow along bond
    float pulse = sin(vProgress * 12.56 - uTime * 3.0) * 0.5 + 0.5;
    pulse = pow(pulse, 4.0); // Sharper pulse

    // Base bond color (slightly transparent)
    vec3 baseColor = uColor * 0.6;
    vec3 energyColor = uColor * 1.8 + vec3(0.3);

    // Temperature-driven brightness
    float tempFactor = uTemperature * 0.001;
    vec3 heatGlow = mix(vec3(0.0), vec3(1.0, 0.5, 0.1), tempFactor * 0.5);

    vec3 finalColor = mix(baseColor, energyColor, pulse * 0.4);
    finalColor += heatGlow * pulse * 0.3;

    // Fade edges of bond
    float edgeFade = smoothstep(0.0, 0.1, vProgress) * smoothstep(1.0, 0.9, vProgress);

    gl_FragColor = vec4(finalColor, edgeFade * 0.7);
}
`;

export function CrystalBonds() {
    const selectedElement = useGameStore((state) => state.selectedElement);
    const temperature = useGameStore((state) => state.temperature);
    const meshRef = useRef<THREE.InstancedMesh>(null);
    const materialRef = useRef<THREE.ShaderMaterial>(null);

    const { positions, orientations, scales } = useMemo(() => {
        const spacing = 4.0;
        const rows = 3;
        const cols = 3;
        const depths = 3;

        const bondPositions: THREE.Vector3[] = [];
        const bondQuaternions: THREE.Quaternion[] = [];

        const centerOffset = new THREE.Vector3(
            (rows - 1) * spacing * 0.5,
            (cols - 1) * spacing * 0.5,
            (depths - 1) * spacing * 0.5
        );

        const addBond = (p1: THREE.Vector3, p2: THREE.Vector3) => {
            const midpoint = new THREE.Vector3().addVectors(p1, p2).multiplyScalar(0.5);
            bondPositions.push(midpoint);

            const direction = new THREE.Vector3().subVectors(p2, p1).normalize();
            const quaternion = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction);
            bondQuaternions.push(quaternion);
        };

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

        return { positions: bondPositions, orientations: bondQuaternions, scales: new THREE.Vector3(0.04, spacing, 0.04) };
    }, []);

    const dummy = useMemo(() => new THREE.Object3D(), []);
    const color = useMemo(() => new THREE.Color(selectedElement.color), [selectedElement.color]);

    // Set instance matrices (only once)
    useFrame((state) => {
        if (!meshRef.current) return;

        // Set instances
        positions.forEach((pos, i) => {
            dummy.position.copy(pos);
            dummy.quaternion.copy(orientations[i]);
            dummy.scale.copy(scales);
            dummy.updateMatrix();
            meshRef.current!.setMatrixAt(i, dummy.matrix);
        });
        meshRef.current.instanceMatrix.needsUpdate = true;

        // Update uniforms
        if (materialRef.current) {
            materialRef.current.uniforms.uTime.value = state.clock.getElapsedTime();
            materialRef.current.uniforms.uTemperature.value = temperature;
        }
    });

    return (
        <instancedMesh ref={meshRef} args={[undefined, undefined, positions.length]}>
            <cylinderGeometry args={[1, 1, 1, 8]} />
            <shaderMaterial
                ref={materialRef}
                vertexShader={bondVertexShader}
                fragmentShader={bondFragmentShader}
                uniforms={{
                    uTime: { value: 0 },
                    uColor: { value: color },
                    uTemperature: { value: temperature },
                }}
                transparent
                depthWrite={false}
                side={THREE.DoubleSide}
            />
        </instancedMesh>
    );
}
