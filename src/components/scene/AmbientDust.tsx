import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useGameStore } from '../../store/useGameStore';

const dustVertexShader = `
attribute float aSize;
attribute float aSpeed;
varying float vAlpha;

uniform float uTime;

void main() {
  vec3 pos = position;
  
  // Gentle drift
  pos.x += sin(uTime * aSpeed * 0.3 + position.y * 2.0) * 0.5;
  pos.y += cos(uTime * aSpeed * 0.2 + position.x * 2.0) * 0.3;
  pos.z += sin(uTime * aSpeed * 0.25 + position.z * 1.5) * 0.4;
  
  vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
  
  // Distance-based alpha
  float dist = length(mvPosition.xyz);
  vAlpha = smoothstep(30.0, 5.0, dist) * 0.4;
  
  gl_PointSize = aSize * (8.0 / -mvPosition.z);
  gl_Position = projectionMatrix * mvPosition;
}
`;

const dustFragmentShader = `
varying float vAlpha;

void main() {
  // Soft circle
  float d = length(gl_PointCoord - 0.5) * 2.0;
  if (d > 1.0) discard;
  float alpha = (1.0 - d * d) * vAlpha;
  
  gl_FragColor = vec4(0.6, 0.7, 1.0, alpha);
}
`;

export function AmbientDust() {
    const scaleLevel = useGameStore((state) => state.scaleLevel);
    const materialRef = useRef<THREE.ShaderMaterial>(null);

    const { positions, sizes, speeds } = useMemo(() => {
        const count = 200;
        const positions = new Float32Array(count * 3);
        const sizes = new Float32Array(count);
        const speeds = new Float32Array(count);

        for (let i = 0; i < count; i++) {
            positions[i * 3] = (Math.random() - 0.5) * 30;
            positions[i * 3 + 1] = (Math.random() - 0.5) * 30;
            positions[i * 3 + 2] = (Math.random() - 0.5) * 20;
            sizes[i] = Math.random() * 3 + 1;
            speeds[i] = Math.random() * 0.5 + 0.3;
        }

        return { positions, sizes, speeds };
    }, []);

    useFrame((state) => {
        if (materialRef.current) {
            materialRef.current.uniforms.uTime.value = state.clock.getElapsedTime();
        }
    });

    // Only show in atomic and subatomic views
    if (scaleLevel === 'molecular') return null;

    return (
        <points>
            <bufferGeometry>
                <bufferAttribute
                    attach="attributes-position"
                    args={[positions, 3]}
                />
                <bufferAttribute
                    attach="attributes-aSize"
                    args={[sizes, 1]}
                />
                <bufferAttribute
                    attach="attributes-aSpeed"
                    args={[speeds, 1]}
                />
            </bufferGeometry>
            <shaderMaterial
                ref={materialRef}
                vertexShader={dustVertexShader}
                fragmentShader={dustFragmentShader}
                uniforms={{ uTime: { value: 0 } }}
                transparent
                depthWrite={false}
                blending={THREE.AdditiveBlending}
            />
        </points>
    );
}
