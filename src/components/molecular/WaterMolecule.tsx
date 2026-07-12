import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useGameStore } from '../../store/useGameStore';
import { MOLECULE_PRESETS } from '../../data/molecules';
import { seededRandom } from '../../utils/random';

const hydrogenBondShader = {
    uniforms: {
        uTime: { value: 0 },
        uOpacity: { value: 0.3 },
        uColor: { value: new THREE.Color('#aaccff') }
    },
    vertexShader: `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
    fragmentShader: `
    uniform float uTime;
    uniform float uOpacity;
    uniform vec3 uColor;
    varying vec2 vUv;
    void main() {
      // Animated dashed effect
      float dash = sin(vUv.y * 30.0 - uTime * 5.0) * 0.5 + 0.5;
      float alpha = uOpacity * step(0.5, dash);
      
      // Edge fade
      alpha *= smoothstep(0.0, 0.2, vUv.y) * smoothstep(1.0, 0.8, vUv.y);
      
      // Glow pulse
      float glow = sin(uTime * 3.0) * 0.1 + 0.9;
      
      gl_FragColor = vec4(uColor * glow, alpha);
    }
  `
};

export function WaterMolecule() {
    const { temperature } = useGameStore();
    const groupRef = useRef<THREE.Group>(null);
    const hBondRef = useRef<THREE.Group>(null);
    const shaderRef = useRef<THREE.ShaderMaterial>(null);

    const preset = MOLECULE_PRESETS.water;

    // Generate a small cluster of water molecules to show hydrogen bonding
    const cluster = useMemo(() => {
        const molecules: { position: [number, number, number]; rotation: [number, number, number] }[] = [];
        const count = 5;
        for (let i = 0; i < count; i++) {
            const angle = (i / count) * Math.PI * 2;
            const radius = 2.5;
            molecules.push({
                position: [
                    Math.cos(angle) * radius + (seededRandom(i * 12.9898) - 0.5) * 0.5,
                    Math.sin(angle) * radius + (seededRandom(i * 78.233) - 0.5) * 0.5,
                    (seededRandom(i * 37.719) - 0.5) * 1.5
                ],
                rotation: [
                    seededRandom(i * 93.989) * Math.PI,
                    seededRandom(i * 15.73) * Math.PI,
                    seededRandom(i * 51.91) * Math.PI
                ]
            });
        }
        return molecules;
    }, []);

    useFrame((state) => {
        const t = state.clock.getElapsedTime();
        if (groupRef.current) {
            // Gentle floating motion
            groupRef.current.position.y = Math.sin(t * 0.5) * 0.1;
            groupRef.current.rotation.y = t * 0.1;
        }

        if (shaderRef.current) {
            shaderRef.current.uniforms.uTime.value = t;
            const flicker = Math.sin(t * 8.0) * 0.1 + 0.9;
            const tempEffect = Math.max(0.1, 1.0 - temperature / 1000);
            shaderRef.current.uniforms.uOpacity.value = 0.4 * flicker * tempEffect;
        }
    });

    return (
        <group ref={groupRef}>
            {cluster.map((mol, idx) => (
                <group key={idx} position={mol.position} rotation={mol.rotation}>
                    {/* Render atoms of each water molecule */}
                    {preset.atoms.map((atom, aIdx) => (
                        <mesh key={aIdx} position={atom.position}>
                            <sphereGeometry args={[atom.scale || 0.3, 32, 32]} />
                            <meshStandardMaterial
                                color={atom.type === 'O' ? '#ff0d0d' : '#ffffff'}
                                roughness={0.3}
                                metalness={0.2}
                                emissive={atom.type === 'O' ? '#440000' : '#444444'}
                                emissiveIntensity={0.2}
                            />
                        </mesh>
                    ))}

                    {/* Render covalent bonds */}
                    {preset.bonds.map((bond, bIdx) => {
                        const start = new THREE.Vector3(...bond.start);
                        const end = new THREE.Vector3(...bond.end);
                        const dir = end.clone().sub(start);
                        const len = dir.length();
                        const mid = start.clone().add(dir.clone().multiplyScalar(0.5));

                        return (
                            <mesh key={bIdx} position={mid} quaternion={new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.clone().normalize())}>
                                <cylinderGeometry args={[0.05, 0.05, len, 8]} />
                                <meshStandardMaterial color="#888888" opacity={0.6} transparent />
                            </mesh>
                        );
                    })}
                </group>
            ))}

            {/* Simulated Hydrogen Bonds between molecules */}
            <group ref={hBondRef}>
                {/* Simplified: just a few dashed lines between nearby H and O atoms */}
                {[
                    { from: cluster[0].position, to: cluster[1].position },
                    { from: cluster[1].position, to: cluster[2].position },
                    { from: cluster[2].position, to: cluster[3].position },
                    { from: cluster[3].position, to: cluster[4].position },
                    { from: cluster[4].position, to: cluster[0].position },
                ].map((bond, bIdx) => {
                    const from = new THREE.Vector3(...bond.from);
                    const to = new THREE.Vector3(...bond.to);
                    const dir = to.clone().sub(from);
                    const len = dir.length();
                    const mid = from.clone().add(dir.clone().multiplyScalar(0.5));

                    return (
                        <mesh key={bIdx} position={mid} quaternion={new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.clone().normalize())}>
                            <cylinderGeometry args={[0.015, 0.015, len, 8, 1]} />
                            <shaderMaterial
                                ref={shaderRef}
                                args={[hydrogenBondShader]}
                                transparent
                                depthWrite={false}
                                blending={THREE.AdditiveBlending}
                            />
                        </mesh>
                    );
                })}
            </group>
        </group>
    );
}
