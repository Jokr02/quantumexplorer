/* eslint-disable react-hooks/purity */
import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const gluonVertexShader = `
uniform float uTime;
attribute float size;
attribute float speed;
attribute vec3 randomDir;
attribute vec3 gluonColor;
attribute float orbitPhase;

varying vec3 vGluonColor;

void main() {
  vGluonColor = gluonColor;
  vec3 pos = position;
  
  float t = uTime * speed;
  
  // Orbital rotation with varied axes
  float angle = t + orbitPhase;
  float cz = cos(angle);
  float sz = sin(angle);
  
  // Rotate in a plane determined by orbitPhase
  float cx = cos(orbitPhase * 2.0);
  float sx = sin(orbitPhase * 2.0);
  
  // Combined rotation
  vec3 rotated = pos;
  rotated.xy = mat2(cz, -sz, sz, cz) * rotated.xy;
  rotated.yz = mat2(cx, -sx, sx, cx) * rotated.yz;
  
  // Turbulence
  rotated += randomDir * sin(t * 3.0 + pos.x * 4.0) * 0.2;
  
  // Breathing expansion/contraction
  float breathe = 1.0 + sin(uTime * 0.8) * 0.08;
  rotated *= breathe;

  vec4 mvPosition = modelViewMatrix * vec4(rotated, 1.0);
  gl_PointSize = size * (14.0 / -mvPosition.z);
  gl_Position = projectionMatrix * mvPosition;
}
`;

const gluonFragmentShader = `
uniform float uTime;
varying vec3 vGluonColor;

void main() {
  float r = distance(gl_PointCoord, vec2(0.5));
  if (r > 0.5) discard;
  
  // Multi-layer glow
  float innerGlow = pow(1.0 - r * 2.0, 2.0);
  float outerGlow = pow(1.0 - r * 2.0, 0.4);
  
  // Pulsing intensity
  float pulse = sin(uTime * 4.0 + r * 10.0) * 0.1 + 0.9;
  
  float alpha = mix(outerGlow, innerGlow, 0.5) * pulse;
  
  // Color saturation boost
  vec3 boostedColor = vGluonColor * 1.2;
  
  gl_FragColor = vec4(boostedColor, alpha * 0.85);
}
`;

// Flux tube shader - connecting lines between quarks
const tubeVertexShader = `
uniform float uTime;
attribute float tubeProgress;
attribute vec3 tubeColor;
varying vec3 vTubeColor;
varying float vProgress;

void main() {
    vTubeColor = tubeColor;
    vProgress = tubeProgress;

    vec3 pos = position;

    // Wavy distortion along tube
    float wave = sin(tubeProgress * 6.28 + uTime * 3.0) * 0.04;
    pos.x += wave;
    pos.y += sin(tubeProgress * 9.42 + uTime * 2.5) * 0.03;

    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
    gl_PointSize = 4.0 * (10.0 / -mvPosition.z);
    gl_Position = projectionMatrix * mvPosition;
}
`;

const tubeFragmentShader = `
uniform float uTime;
varying vec3 vTubeColor;
varying float vProgress;

void main() {
    float r = distance(gl_PointCoord, vec2(0.5));
    if (r > 0.5) discard;

    // Energy pulse along tube
    float pulse = sin(vProgress * 12.56 - uTime * 5.0) * 0.5 + 0.5;
    pulse = pow(pulse, 3.0);

    float alpha = (1.0 - r * 2.0) * (0.3 + pulse * 0.5);
    vec3 color = vTubeColor * (1.0 + pulse * 0.5);

    gl_FragColor = vec4(color, alpha);
}
`;

export function GluonField() {
    const meshRef = useRef<THREE.Points>(null);
    const tubeRef = useRef<THREE.Points>(null);

    const particleCount = 400;
    const geometry = useMemo(() => {
        const geo = new THREE.BufferGeometry();
        const positions = new Float32Array(particleCount * 3);
        const sizes = new Float32Array(particleCount);
        const speeds = new Float32Array(particleCount);
        const randomDirs = new Float32Array(particleCount * 3);
        const colors = new Float32Array(particleCount * 3);
        const phases = new Float32Array(particleCount);

        // Gluon "color charges" - enhanced palette
        const gluonColors = [
            [1.0, 0.15, 0.15],  // Red
            [0.15, 0.9, 0.25],  // Green
            [0.2, 0.35, 1.0],   // Blue
            [1.0, 0.7, 0.1],    // Anti-red (golden)
            [0.8, 0.15, 0.9],   // Anti-green (magenta)
            [0.1, 0.85, 0.85],  // Anti-blue (cyan)
            [1.0, 0.4, 0.6],    // Anti-red variant
            [0.5, 1.0, 0.3],    // Green variant
        ];

        for (let i = 0; i < particleCount; i++) {
            // More concentrated near center (nucleus region)
            const r = 0.4 + Math.pow(Math.random(), 1.5) * 0.8;
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.acos(2 * Math.random() - 1);

            positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
            positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
            positions[i * 3 + 2] = r * Math.cos(phi);

            sizes[i] = Math.random() * 3.5 + 1.5;
            speeds[i] = Math.random() * 1.0 + 0.3;
            phases[i] = Math.random() * Math.PI * 2;

            randomDirs[i * 3] = (Math.random() - 0.5);
            randomDirs[i * 3 + 1] = (Math.random() - 0.5);
            randomDirs[i * 3 + 2] = (Math.random() - 0.5);

            const c = gluonColors[Math.floor(Math.random() * gluonColors.length)];
            colors[i * 3] = c[0];
            colors[i * 3 + 1] = c[1];
            colors[i * 3 + 2] = c[2];
        }

        geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geo.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
        geo.setAttribute('speed', new THREE.BufferAttribute(speeds, 1));
        geo.setAttribute('randomDir', new THREE.BufferAttribute(randomDirs, 3));
        geo.setAttribute('gluonColor', new THREE.BufferAttribute(colors, 3));
        geo.setAttribute('orbitPhase', new THREE.BufferAttribute(phases, 1));

        return geo;
    }, []);

    // Flux tubes connecting random pairs of "quarks"
    const tubeGeometry = useMemo(() => {
        const geo = new THREE.BufferGeometry();
        const tubeCount = 12; // number of flux tubes
        const pointsPerTube = 20;
        const totalPoints = tubeCount * pointsPerTube;

        const positions = new Float32Array(totalPoints * 3);
        const progress = new Float32Array(totalPoints);
        const colors = new Float32Array(totalPoints * 3);

        const tubeColors = [
            [1.0, 0.2, 0.2], [0.2, 0.9, 0.3], [0.3, 0.4, 1.0],
            [1.0, 0.6, 0.1], [0.7, 0.2, 0.8], [0.2, 0.8, 0.8],
        ];

        for (let t = 0; t < tubeCount; t++) {
            // Random start/end points within nucleus region
            const start = new THREE.Vector3(
                (Math.random() - 0.5) * 0.8,
                (Math.random() - 0.5) * 0.8,
                (Math.random() - 0.5) * 0.8
            );
            const end = new THREE.Vector3(
                (Math.random() - 0.5) * 0.8,
                (Math.random() - 0.5) * 0.8,
                (Math.random() - 0.5) * 0.8
            );

            const color = tubeColors[t % tubeColors.length];

            for (let p = 0; p < pointsPerTube; p++) {
                const idx = (t * pointsPerTube + p);
                const frac = p / (pointsPerTube - 1);

                // Interpolate with slight curve
                const pos = new THREE.Vector3().lerpVectors(start, end, frac);
                // Add arc
                pos.y += Math.sin(frac * Math.PI) * 0.15;

                positions[idx * 3] = pos.x;
                positions[idx * 3 + 1] = pos.y;
                positions[idx * 3 + 2] = pos.z;
                progress[idx] = frac;
                colors[idx * 3] = color[0];
                colors[idx * 3 + 1] = color[1];
                colors[idx * 3 + 2] = color[2];
            }
        }

        geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geo.setAttribute('tubeProgress', new THREE.BufferAttribute(progress, 1));
        geo.setAttribute('tubeColor', new THREE.BufferAttribute(colors, 3));

        return geo;
    }, []);

    useFrame((state) => {
        const time = state.clock.getElapsedTime();
        if (meshRef.current) {
            (meshRef.current.material as THREE.ShaderMaterial).uniforms.uTime.value = time;
        }
        if (tubeRef.current) {
            (tubeRef.current.material as THREE.ShaderMaterial).uniforms.uTime.value = time;
        }
    });

    return (
        <group>
            {/* Main gluon particles */}
            <points ref={meshRef} geometry={geometry}>
                <shaderMaterial
                    transparent
                    depthWrite={false}
                    blending={THREE.AdditiveBlending}
                    vertexShader={gluonVertexShader}
                    fragmentShader={gluonFragmentShader}
                    uniforms={{
                        uTime: { value: 0 }
                    }}
                />
            </points>

            {/* Flux tubes */}
            <points ref={tubeRef} geometry={tubeGeometry}>
                <shaderMaterial
                    transparent
                    depthWrite={false}
                    blending={THREE.AdditiveBlending}
                    vertexShader={tubeVertexShader}
                    fragmentShader={tubeFragmentShader}
                    uniforms={{
                        uTime: { value: 0 }
                    }}
                />
            </points>
        </group>
    );
}
