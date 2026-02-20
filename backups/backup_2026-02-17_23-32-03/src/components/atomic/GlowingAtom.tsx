import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';


// Custom Shader Material for the glowing atom
// This simulates a volumetric probability cloud with a pulsating core
const atomVertexShader = `
varying vec3 vNormal;
varying vec3 vPosition;

void main() {
  vNormal = normalize(normalMatrix * normal);
  vPosition = position;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

// Dark/Lab version of the atom shader
const atomFragmentShader = `
uniform float uTime;
uniform vec3 uColor;

varying vec3 vNormal;
varying vec3 vPosition;

void main() {
  vec3 viewDir = normalize(cameraPosition - vPosition);
  float viewDotNormal = max(0.0, dot(vNormal, viewDir)); 
  
  // Edge detection
  // We want the center to be dense (dark) and edges to be transparent
  float alpha = pow(viewDotNormal, 2.0); // 1.0 at center, 0.0 at edge

  // Pulsating effect
  float pulse = sin(uTime * 2.0) * 0.1 + 0.9;
  
  // Noise texture (simplified)
  float noise = sin(vPosition.x * 10.0 + uTime) * sin(vPosition.y * 10.0 + uTime) * sin(vPosition.z * 10.0 + uTime);
  
  // Combine: Dark color, alpha based on viewing angle + noise
  float finalAlpha = alpha * 0.6 + noise * 0.1; 
  
  gl_FragColor = vec4(uColor, finalAlpha * pulse);
}
`;

interface GlowingAtomProps {
    position?: [number, number, number];
    color?: string;
    scale?: number;
}

export function GlowingAtom({ position = [0, 0, 0], scale = 1 }: GlowingAtomProps) {
    const materialRef = useRef<THREE.ShaderMaterial>(null);
    useFrame((state) => {
        if (materialRef.current) {
            materialRef.current.uniforms.uTime.value = state.clock.getElapsedTime();
        }
    });

    return (
        <mesh
            position={position}
            scale={scale}
        >
            <sphereGeometry args={[1, 64, 64]} />
            <shaderMaterial
                ref={materialRef}
                vertexShader={atomVertexShader}
                fragmentShader={atomFragmentShader}
                uniforms={{
                    uTime: { value: 0 },
                    uColor: { value: new THREE.Color('#000044') }, // Dark Blue Core
                }}
                transparent
                // blending={THREE.AdditiveBlending} // Remove additive
                depthWrite={false}
                side={THREE.FrontSide}
            />
        </mesh>
    );
}
