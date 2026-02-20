/* eslint-disable react-hooks/purity */
/* eslint-disable react-hooks/immutability */
import { useRef, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useGameStore } from '../../store/useGameStore';

// Trail point for each particle
const trailVertexShader = `
uniform float uTime;
attribute float opacity;
varying float vOpacity;
varying vec3 vTrailColor;

void main() {
    vOpacity = opacity;
    vTrailColor = vec3(0.3, 0.5, 1.0);

    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    gl_PointSize = 3.0 * (200.0 / -mvPosition.z);
    gl_Position = projectionMatrix * mvPosition;
}
`;

const trailFragmentShader = `
varying float vOpacity;
varying vec3 vTrailColor;

void main() {
    float dist = length(gl_PointCoord - vec2(0.5));
    if (dist > 0.5) discard;
    float alpha = (1.0 - dist * 2.0) * vOpacity;
    gl_FragColor = vec4(vTrailColor, alpha * 0.4);
}
`;

export function GasVolume() {
    const selectedElement = useGameStore((state) => state.selectedElement);
    const temperature = useGameStore((state) => state.temperature);
    const triggerThermalPulse = useGameStore((state) => state.triggerThermalPulse);
    const meshRef = useRef<THREE.InstancedMesh>(null);
    const trailRef = useRef<THREE.Points>(null);
    const pulseTimeRef = useRef<number | null>(null);
    const count = 60;
    const bounds = 5.8;
    const trailLength = 6;

    useEffect(() => {
        if (triggerThermalPulse > 0) {
            pulseTimeRef.current = performance.now() / 1000;
        }
    }, [triggerThermalPulse]);

    const { positions, velocities } = useMemo(() => {
        const posArray = new Float32Array(count * 3);
        const velArray = new Float32Array(count * 3);

        for (let i = 0; i < count; i++) {
            posArray[i * 3] = (Math.random() - 0.5) * (bounds * 2);
            posArray[i * 3 + 1] = (Math.random() - 0.5) * (bounds * 2);
            posArray[i * 3 + 2] = (Math.random() - 0.5) * (bounds * 2);

            const speed = 0.15;
            velArray[i * 3] = (Math.random() - 0.5) * speed;
            velArray[i * 3 + 1] = (Math.random() - 0.5) * speed;
            velArray[i * 3 + 2] = (Math.random() - 0.5) * speed;
        }
        return { positions: posArray, velocities: velArray };
    }, []);

    // Trail geometry data
    const trailData = useMemo(() => {
        const totalPoints = count * trailLength;
        const trailPositions = new Float32Array(totalPoints * 3);
        const trailOpacities = new Float32Array(totalPoints);

        // Initialize opacities (fade out older trail points)
        for (let p = 0; p < count; p++) {
            for (let t = 0; t < trailLength; t++) {
                trailOpacities[p * trailLength + t] = 1.0 - (t / trailLength);
            }
        }

        return { positions: trailPositions, opacities: trailOpacities, totalPoints };
    }, [count, trailLength]);

    // Track historical positions for trails
    const trailHistory = useRef<Float32Array[]>([]);

    const dummy = useMemo(() => new THREE.Object3D(), []);
    const color = useMemo(() => new THREE.Color(selectedElement.color), [selectedElement.color]);

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
                // Massive spike for gas to cause a visible "explosion" of activity
                effectiveTemp = Math.min(2000, temperature + 1500 * Math.pow(decay, 3));
            }
        }

        // Map effective temp (0-2000) to a reasonable speed (0.01 - 0.25)
        const targetSpeed = 0.01 + (effectiveTemp / 1000) * 0.12;

        for (let i = 0; i < count; i++) {
            const ix = i * 3;

            // Apply velocities directly
            positions[ix] += velocities[ix];
            positions[ix + 1] += velocities[ix + 1];
            positions[ix + 2] += velocities[ix + 2];

            // Wall Bouncing with flash
            for (let axis = 0; axis < 3; axis++) {
                if (positions[ix + axis] > bounds) {
                    positions[ix + axis] = bounds;
                    velocities[ix + axis] *= -1;
                } else if (positions[ix + axis] < -bounds) {
                    positions[ix + axis] = -bounds;
                    velocities[ix + axis] *= -1;
                }
            }

            // Brownian motion perturbation
            velocities[ix] += (Math.random() - 0.5) * 0.01;
            velocities[ix + 1] += (Math.random() - 0.5) * 0.01;
            velocities[ix + 2] += (Math.random() - 0.5) * 0.01;

            // Constrain velocity tightly to target speed
            const currentSpeed = Math.sqrt(
                velocities[ix] ** 2 + velocities[ix + 1] ** 2 + velocities[ix + 2] ** 2
            );

            if (currentSpeed > 0) {
                // Smoothly pull current velocity towards target speed based on temperature
                const speedAdjust = currentSpeed + (targetSpeed - currentSpeed) * 0.2;
                velocities[ix] = (velocities[ix] / currentSpeed) * speedAdjust;
                velocities[ix + 1] = (velocities[ix + 1] / currentSpeed) * speedAdjust;
                velocities[ix + 2] = (velocities[ix + 2] / currentSpeed) * speedAdjust;
            }

            dummy.position.set(positions[ix], positions[ix + 1], positions[ix + 2]);

            // Size pulses based on speed
            const speed = Math.sqrt(
                velocities[ix] ** 2 + velocities[ix + 1] ** 2 + velocities[ix + 2] ** 2
            );
            const sizePulse = 0.6 + speed * 3;
            dummy.scale.setScalar(sizePulse);

            dummy.updateMatrix();
            meshRef.current.setMatrixAt(i, dummy.matrix);

            // Set up instanced colors with temperature-based hue shift
            const tempHue = temperature / 2000; // subtle shift
            const particleColor = color.clone();
            particleColor.offsetHSL(tempHue * 0.1, 0, tempHue * 0.2);
            meshRef.current.setColorAt(i, particleColor);
        }
        meshRef.current.instanceMatrix.needsUpdate = true;
        if (meshRef.current.instanceColor) meshRef.current.instanceColor.needsUpdate = true;

        // Update trail positions
        if (trailRef.current) {
            // Shift history
            if (trailHistory.current.length >= trailLength) {
                trailHistory.current.pop();
            }
            trailHistory.current.unshift(new Float32Array(positions));

            // Build trail geometry
            const trailGeo = trailRef.current.geometry;
            const posAttr = trailGeo.getAttribute('position') as THREE.BufferAttribute;

            for (let p = 0; p < count; p++) {
                for (let t = 0; t < trailLength; t++) {
                    const idx = (p * trailLength + t) * 3;
                    if (t < trailHistory.current.length) {
                        const hist = trailHistory.current[t];
                        posAttr.array[idx] = hist[p * 3];
                        posAttr.array[idx + 1] = hist[p * 3 + 1];
                        posAttr.array[idx + 2] = hist[p * 3 + 2];
                    }
                }
            }
            posAttr.needsUpdate = true;

            // Update trail shader time
            const mat = trailRef.current.material as THREE.ShaderMaterial;
            if (mat.uniforms?.uTime) mat.uniforms.uTime.value = state.clock.getElapsedTime();
        }
    });

    return (
        <>
            {/* Main particles */}
            <instancedMesh
                ref={meshRef}
                args={[undefined, undefined, count]}
            >
                <sphereGeometry args={[0.25, 16, 16]} />
                <meshStandardMaterial
                    color={selectedElement.color}
                    emissive={selectedElement.color}
                    emissiveIntensity={0.6}
                    roughness={0.2}
                    metalness={0.3}
                    vertexColors
                />
            </instancedMesh>

            {/* Particle trails */}
            <points ref={trailRef}>
                <bufferGeometry>
                    <bufferAttribute
                        attach="attributes-position"
                        args={[trailData.positions, 3]}
                        count={trailData.totalPoints}
                    />
                    <bufferAttribute
                        attach="attributes-opacity"
                        args={[trailData.opacities, 1]}
                        count={trailData.totalPoints}
                    />
                </bufferGeometry>
                <shaderMaterial
                    vertexShader={trailVertexShader}
                    fragmentShader={trailFragmentShader}
                    uniforms={{
                        uTime: { value: 0 },
                    }}
                    transparent
                    depthWrite={false}
                    blending={THREE.AdditiveBlending}
                />
            </points>
        </>
    );
}
