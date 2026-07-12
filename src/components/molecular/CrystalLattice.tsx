import { useRef, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { generateCrystalGrid } from '../../utils/lattice';
import { useGameStore } from '../../store/useGameStore';
import { seededRandom } from '../../utils/random';

const atomVertexShader = `
uniform float uTime;
uniform float uTemperature;
varying vec3 vNormal;
varying vec3 vWorldPosition;

void main() {
    vNormal = normalize(normalMatrix * normal);
    vec4 worldPos = modelMatrix * instanceMatrix * vec4(position, 1.0);
    vWorldPosition = worldPos.xyz;
    gl_Position = projectionMatrix * viewMatrix * worldPos;
}
`;

const atomFragmentShader = `
uniform float uTime;
uniform vec3 uColor;
uniform float uTemperature;
varying vec3 vNormal;
varying vec3 vWorldPosition;

void main() {
    // Fresnel rim glow
    vec3 viewDir = normalize(cameraPosition - vWorldPosition);
    float fresnel = pow(1.0 - max(dot(vNormal, viewDir), 0.0), 3.0);

    // Base color with subsurface scattering effect
    vec3 baseColor = uColor;
    vec3 glowColor = uColor * 1.5 + vec3(0.2);

    // Temperature-driven inner glow
    float tempGlow = uTemperature * 0.001;
    vec3 heatColor = mix(vec3(0.0), vec3(1.0, 0.4, 0.1), tempGlow);

    vec3 finalColor = baseColor;
    finalColor += fresnel * glowColor * 0.4;
    finalColor += heatColor * 0.3;

    // Subtle pulse
    float pulse = sin(uTime * 2.0 + length(vWorldPosition) * 0.5) * 0.05 + 0.95;
    finalColor *= pulse;

    gl_FragColor = vec4(finalColor, 0.92);
}
`;

export function CrystalLattice() {
    const selectedElement = useGameStore((state) => state.selectedElement);
    const temperature = useGameStore((state) => state.temperature);
    const triggerThermalPulse = useGameStore((state) => state.triggerThermalPulse);
    const meshRef = useRef<THREE.InstancedMesh>(null);
    const materialRef = useRef<THREE.ShaderMaterial>(null);
    const pulseTimeRef = useRef<number | null>(null);
    const count = 27;
    const positions = useMemo(() => generateCrystalGrid(3, 3, 3, 4.0), []);

    const dummy = useMemo(() => new THREE.Object3D(), []);

    useEffect(() => {
        if (triggerThermalPulse > 0) {
            pulseTimeRef.current = performance.now() / 1000;
        }
    }, [triggerThermalPulse]);

    // Store random phase offsets per atom for varied vibration
    const phaseOffsets = useMemo(() => {
        return positions.map((_, i) => ({
            x: seededRandom(i * 12.9898) * Math.PI * 2,
            y: seededRandom(i * 78.233) * Math.PI * 2,
            z: seededRandom(i * 37.719) * Math.PI * 2,
        }));
    }, [positions]);

    useFrame((state) => {
        if (!meshRef.current) return;

        const time = state.clock.getElapsedTime();
        let effectiveTemp = temperature;
        if (pulseTimeRef.current !== null) {
            const t = time - pulseTimeRef.current;
            const duration = 2.0;
            if (t > duration) {
                pulseTimeRef.current = null;
            } else {
                const decay = 1.0 - (t / duration);
                effectiveTemp = Math.min(1000, temperature + 1000 * Math.pow(decay, 3));
            }
        }

        const vibrationStrength = (effectiveTemp / 1000) * 0.4 * (pulseTimeRef.current !== null ? 2.5 : 1.0);

        positions.forEach((pos, i) => {
            const phase = phaseOffsets[i];
            dummy.position.set(
                pos.x + Math.sin(time * 8 + phase.x) * vibrationStrength,
                pos.y + Math.sin(time * 10 + phase.y) * vibrationStrength,
                pos.z + Math.sin(time * 9 + phase.z) * vibrationStrength
            );
            // Subtle size breathing
            const sizeBreath = 1.0 + Math.sin(time * 3 + i) * 0.05;
            dummy.scale.setScalar(sizeBreath);
            dummy.updateMatrix();
            meshRef.current!.setMatrixAt(i, dummy.matrix);
        });
        meshRef.current.instanceMatrix.needsUpdate = true;

        // Update shader uniforms
        if (materialRef.current) {
            materialRef.current.uniforms.uTime.value = time;
            materialRef.current.uniforms.uTemperature.value = temperature;
        }
    });

    const color = useMemo(() => new THREE.Color(selectedElement.color), [selectedElement.color]);

    return (
        <instancedMesh
            ref={meshRef}
            args={[undefined, undefined, count]}
        >
            <sphereGeometry args={[0.35, 32, 32]} />
            <shaderMaterial
                ref={materialRef}
                vertexShader={atomVertexShader}
                fragmentShader={atomFragmentShader}
                uniforms={{
                    uTime: { value: 0 },
                    uColor: { value: color },
                    uTemperature: { value: temperature },
                }}
                transparent
            />
        </instancedMesh>
    );
}
