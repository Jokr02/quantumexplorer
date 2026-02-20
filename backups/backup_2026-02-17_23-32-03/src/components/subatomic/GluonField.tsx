/* eslint-disable react-hooks/purity */
import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const gluonVertexShader = `
uniform float uTime;
attribute float size;
attribute float speed;
attribute vec3 randomDir;

void main() {
  vec3 pos = position;
  
  // Chaotic movement
  // Orbit + Jitter
  float t = uTime * speed;
  
  // Simple orbital rotation
  float cz = cos(t);
  float sz = sin(t);
  mat2 rot = mat2(cz, -sz, sz, cz);
  pos.xy = rot * pos.xy;
  
  // Jitter
  pos += randomDir * sin(t * 5.0) * 0.1;

  vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
  gl_PointSize = size * (10.0 / -mvPosition.z);
  gl_Position = projectionMatrix * mvPosition;
}
`;

const gluonFragmentShader = `
void main() {
  // Circular particle
  float r = distance(gl_PointCoord, vec2(0.5));
  if (r > 0.5) discard;
  
  // Dark center, fading out slightly
  float alpha = 1.0 - (r * 2.0);
  alpha = pow(alpha, 0.5); // Harder edge
  
  // Dark Grey / Black particles
  vec3 color = vec3(0.2, 0.2, 0.2); 

  gl_FragColor = vec4(color, alpha * 0.8);
}
`;

export function GluonField() {
    const meshRef = useRef<THREE.Points>(null);

    const particleCount = 200;
    const geometry = useMemo(() => {
        const geo = new THREE.BufferGeometry();
        const positions = new Float32Array(particleCount * 3);
        const sizes = new Float32Array(particleCount);
        const speeds = new Float32Array(particleCount);
        const randomDirs = new Float32Array(particleCount * 3);

        for (let i = 0; i < particleCount; i++) {
            // Sphere shell distribution
            const r = 0.6 + Math.random() * 0.5; // Just outside the nucleus
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.acos(2 * Math.random() - 1);

            positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
            positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
            positions[i * 3 + 2] = r * Math.cos(phi);

            sizes[i] = Math.random() * 2.0 + 0.5;
            speeds[i] = Math.random() * 0.5 + 0.2;

            randomDirs[i * 3] = (Math.random() - 0.5);
            randomDirs[i * 3 + 1] = (Math.random() - 0.5);
            randomDirs[i * 3 + 2] = (Math.random() - 0.5);
        }

        geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geo.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
        geo.setAttribute('speed', new THREE.BufferAttribute(speeds, 1));
        geo.setAttribute('randomDir', new THREE.BufferAttribute(randomDirs, 3));

        return geo;
    }, []);

    useFrame((state) => {
        if (meshRef.current) {
            (meshRef.current.material as THREE.ShaderMaterial).uniforms.uTime.value = state.clock.getElapsedTime();
        }
    });

    return (
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
    );
}
