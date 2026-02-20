import { useRef, useMemo, useLayoutEffect, useEffect } from 'react';
import { useFrame, type ThreeEvent } from '@react-three/fiber';
import * as THREE from 'three';
import { useGameStore, useGameActions } from '../../store/useGameStore';
import { useAudio } from '../../hooks/useAudio';
import { ELEMENTS } from '../../data/elements';

// Vertex Shader for individual Nucleons (Morphing/Displacement)
const nucleonVertexShader = `
uniform float uTime;
varying vec3 vNormal;
varying float vNoise;
varying vec3 vColor;

// Simplex 3D Noise 
vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 permute(vec4 x) { return mod289(((x*34.0)+1.0)*x); }
vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }
float snoise(vec3 v) {
  const vec2  C = vec2(1.0/6.0, 1.0/3.0) ;
  const vec4  D = vec4(0.0, 0.5, 1.0, 2.0);
  vec3 i  = floor(v + dot(v, C.yyy) );
  vec3 x0 = v - i + dot(i, C.xxx) ;
  vec3 g = step(x0.yzx, x0.xyz);
  vec3 l = 1.0 - g;
  vec3 i1 = min( g.xyz, l.zxy );
  vec3 i2 = max( g.xyz, l.zxy );
  vec3 x1 = x0 - i1 + C.xxx;
  vec3 x2 = x0 - i2 + C.yyy;
  vec3 x3 = x0 - D.yyy;
  i = mod289(i);
  vec4 p = permute( permute( permute(
             i.z + vec4(0.0, i1.z, i2.z, 1.0 ))
           + i.y + vec4(0.0, i1.y, i2.y, 1.0 ))
           + i.x + vec4(0.0, i1.x, i2.x, 1.0 ));
  float n_ = 0.142857142857;
  vec3  ns = n_ * D.wyz - D.xzx;
  vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
  vec4 x_ = floor(j * ns.z);
  vec4 y_ = floor(j - 7.0 * x_ );
  vec4 x = x_ *ns.x + ns.yyyy;
  vec4 y = y_ *ns.x + ns.yyyy;
  vec4 h = 1.0 - abs(x) - abs(y);
  vec4 b0 = vec4( x.xy, y.xy );
  vec4 b1 = vec4( x.zw, y.zw );
  vec4 s0 = floor(b0)*2.0 + 1.0;
  vec4 s1 = floor(b1)*2.0 + 1.0;
  vec4 sh = -step(h, vec4(0.0));
  vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy ;
  vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww ;
  vec3 p0 = vec3(a0.xy,h.x);
  vec3 p1 = vec3(a0.zw,h.y);
  vec3 p2 = vec3(a1.xy,h.z);
  vec3 p3 = vec3(a1.zw,h.w);
  vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));
  p0 *= norm.x;
  p1 *= norm.y;
  p2 *= norm.z;
  p3 *= norm.w;
  vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
  m = m * m;
  return 42.0 * dot( m*m, vec4( dot(p0,x0), dot(p1,x1),
                                dot(p2,x2), dot(p3,x3) ) );
}

void main() {
  vNormal = normalize(normalMatrix * normal);
  
  // Displacement
  float noise = snoise(position * 2.0 + uTime * 0.5);
  vNoise = noise;
  
  // Pass instance color (Three.js automatically provides 'instanceColor' attribute for InstancedMesh)
  #ifdef USE_INSTANCING
    vColor = instanceColor;
  #else
    vColor = vec3(1.0, 0.0, 1.0); // Fallback debug
  #endif

  vec3 newPosition = position + normal * noise * 0.1;
  
  // Standard Instancing Logic
  gl_Position = projectionMatrix * modelViewMatrix * instanceMatrix * vec4(newPosition, 1.0);
}
`;

const nucleonFragmentShader = `
uniform float uTime;
varying vec3 vNormal;
varying float vNoise;
varying vec3 vColor;

void main() {
  // Fresnel
  vec3 viewDir = normalize(cameraPosition - vNormal); // Approximation
  float fresnel = pow(1.0 - dot(vNormal, vec3(0,0,1)), 3.0);
  
  // Mix color based on noise
  vec3 hotColor = vec3(0.9, 0.7, 0.5); // Warm highlight, not white
  
  // Dynamic pulse - reduced intensity
  vec3 finalColor = mix(vColor, hotColor, vNoise * 0.15 + 0.05);
  finalColor += fresnel * 0.15;
  
  gl_FragColor = vec4(finalColor, 1.0);
}
`;

export function Nucleus() {
    const selectedElement = useGameStore((state) => state.selectedElement);
    const triggerCollision = useGameStore((state) => state.triggerCollision);
    const { setNeutronCount, showInfoPopup } = useGameActions();
    const { playSound } = useAudio();

    const meshRef = useRef<THREE.InstancedMesh>(null);
    const materialRef = useRef<THREE.ShaderMaterial>(null);
    const groupRef = useRef<THREE.Group>(null);
    const baseMatricesRef = useRef<THREE.Matrix4[]>([]);
    const collisionTimeRef = useRef<number | null>(null);

    // Watch for collision triggers
    useEffect(() => {
        if (triggerCollision > 0) {
            // Initiate collision scattering
            collisionTimeRef.current = performance.now() / 1000;
            playSound('collision', { volume: 0.8 });
        }
    }, [triggerCollision, playSound]);

    // Generate Nucleon Data
    const nucleonData = useMemo(() => {
        const protons = selectedElement.atomicNumber;
        const neutrons = selectedElement.neutrons;
        const total = protons + neutrons;

        // Create array of types then shuffle, THEN map to spiral positions
        const types = Array(protons).fill('proton').concat(Array(neutrons).fill('neutron'));

        // Fisher-Yates shuffle for the types array
        for (let i = types.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [types[i], types[j]] = [types[j], types[i]];
        }

        // Map to Golden Spiral positions
        return types.map((type, i) => {
            const phi = Math.acos(1 - 2 * (i + 0.5) / total);
            const theta = Math.PI * (1 + 5 ** 0.5) * i;

            // Radius approx cbrt(n) for volumetric uniformity
            const radius = 0.5 * Math.pow(total, 1 / 3);

            // Jitter for natural look
            const r = radius * 0.8 + (Math.random() * 0.2);

            const x = r * Math.sin(phi) * Math.cos(theta);
            const y = r * Math.sin(phi) * Math.sin(theta);
            const z = r * Math.cos(phi);

            // Spread out slightly
            const spread = 0.6; // Spacing factor

            return {
                pos: new THREE.Vector3(x * spread, y * spread, z * spread),
                type: type,
                // Red protons, blue-grey neutrons for clear visual distinction
                color: type === 'proton' ? '#ef4444' : '#60a5fa'
            };
        });

    }, [selectedElement.atomicNumber, selectedElement.neutrons]);

    // Update Instances
    useLayoutEffect(() => {
        if (!meshRef.current) return;

        const dummy = new THREE.Object3D();
        const color = new THREE.Color();
        baseMatricesRef.current = [];

        nucleonData.forEach((data, i) => {
            dummy.position.copy(data.pos);
            // Random rotation for variety
            dummy.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, 0);
            dummy.updateMatrix();
            meshRef.current!.setMatrixAt(i, dummy.matrix);
            // Save original base matrix for collision animation recovery
            baseMatricesRef.current.push(dummy.matrix.clone());

            color.set(data.color);
            meshRef.current!.setColorAt(i, color);
        });

        meshRef.current.instanceMatrix.needsUpdate = true;
        if (meshRef.current.instanceColor) meshRef.current.instanceColor.needsUpdate = true;
    }, [nucleonData]);

    useFrame((state) => {
        if (materialRef.current) {
            materialRef.current.uniforms.uTime.value = state.clock.getElapsedTime();
        }
        if (groupRef.current) {
            // Slow tumble
            groupRef.current.rotation.y += 0.002;
            groupRef.current.rotation.z += 0.001;
        }

        // Handle Radioactive Decay Animation
        if (meshRef.current) {
            const isDecaying = useGameStore.getState().isDecaying;
            if (isDecaying) {
                if (collisionTimeRef.current === null) {
                    collisionTimeRef.current = state.clock.getElapsedTime();

                    // Determine decay type. Simple logic:
                    // If atomic number > 82 or mass is very high and N/Z is low, Alpha.
                    // If N/Z is too high (too many neutrons), Beta-.
                    const protons = selectedElement.atomicNumber;
                    const neutrons = selectedElement.neutrons;
                    const nzRatio = protons > 0 ? neutrons / protons : 0;

                    let decayType = 'alpha';
                    if (protons <= 82 && nzRatio > 1.4) {
                        decayType = 'beta-';
                    } else if (protons > 82) {
                        decayType = 'alpha';
                    } else if (nzRatio < 1.0 && protons > 10) {
                        // Beta+ or electron capture technically, but we'll use alpha for visual drama if it's generally unstable
                        decayType = 'alpha';
                    }

                    (meshRef.current as any).decayType = decayType;

                    if (decayType === 'alpha') {
                        // Identify the 'Alpha Particle' (2 protons, 2 neutrons) to eject
                        let pCount = 0, nCount = 0;
                        const decayIndices: number[] = [];
                        for (let i = 0; i < nucleonData.length; i++) {
                            if (nucleonData[i].type === 'proton' && pCount < 2) {
                                decayIndices.push(i);
                                pCount++;
                            } else if (nucleonData[i].type === 'neutron' && nCount < 2) {
                                decayIndices.push(i);
                                nCount++;
                            }
                            if (pCount === 2 && nCount === 2) break;
                        }
                        (meshRef.current as any).decayIndices = decayIndices;
                    } else if (decayType === 'beta-') {
                        // Identify one neutron to turn into a proton and eject an electron
                        let nIndex = -1;
                        for (let i = 0; i < nucleonData.length; i++) {
                            if (nucleonData[i].type === 'neutron') {
                                nIndex = i;
                                break;
                            }
                        }
                        (meshRef.current as any).decayIndices = [nIndex];
                    }
                }

                const t = state.clock.getElapsedTime() - collisionTimeRef.current;
                const duration = 2.0;
                const decayType = (meshRef.current as any).decayType;

                if (t > duration) {
                    // Decay finished, mutate the element
                    collisionTimeRef.current = null;
                    const { setDecaying, setSelectedElement } = useGameStore.getState().actions;
                    setDecaying(false);

                    if (decayType === 'alpha') {
                        // Alpha decay: Z - 2, N - 2
                        const newZ = selectedElement.atomicNumber - 2;
                        const newN = selectedElement.neutrons - 2;

                        if (newZ >= 1) {
                            const newElementData = Object.values(ELEMENTS).find((e: any) => e.atomicNumber === newZ);
                            if (newElementData) {
                                setSelectedElement({
                                    ...newElementData,
                                    neutrons: Math.max(0, newN)
                                } as any);
                                playSound('zoom_in', { volume: 0.5 });
                            }
                        }
                    } else if (decayType === 'beta-') {
                        // Beta- decay: Z + 1, N - 1
                        const newZ = selectedElement.atomicNumber + 1;
                        const newN = selectedElement.neutrons - 1;

                        const newElementData = Object.values(ELEMENTS).find((e: any) => e.atomicNumber === newZ);
                        if (newElementData) {
                            setSelectedElement({
                                ...newElementData,
                                neutrons: Math.max(0, newN)
                            } as any);
                            playSound('zoom_in', { volume: 0.5 });
                        }
                    }

                } else {
                    // Animate the decay
                    const decayIndices = (meshRef.current as any).decayIndices as number[];
                    if (decayIndices && decayIndices.length > 0) {
                        const dummy = new THREE.Object3D();
                        const scratchVec = new THREE.Vector3();
                        const colorVec = new THREE.Color();

                        // T ease in quad
                        const ease = t * t;

                        if (decayType === 'alpha') {
                            const ejectDir = new THREE.Vector3(1, 1, 0).normalize();

                            decayIndices.forEach((idx) => {
                                const matrix = baseMatricesRef.current[idx];
                                if (matrix) {
                                    scratchVec.setFromMatrixPosition(matrix);
                                    scratchVec.add(ejectDir.clone().multiplyScalar(ease * 15.0));

                                    dummy.matrix.copy(matrix);
                                    dummy.matrix.setPosition(scratchVec);
                                    meshRef.current!.setMatrixAt(idx, dummy.matrix);
                                }
                            });
                        } else if (decayType === 'beta-') {
                            const idx = decayIndices[0];
                            const matrix = baseMatricesRef.current[idx];
                            if (matrix) {
                                // Change color from neutron (blue) to proton (red) over time
                                // Neutron color: #60a5fa (96, 165, 250) -> Proton: #ef4444 (239, 68, 68)
                                const pColor = new THREE.Color('#ef4444');
                                const nColor = new THREE.Color('#60a5fa');

                                // Lerp color
                                const lerpFactor = Math.min(1.0, t * 2.0); // complete color change halfway through
                                colorVec.copy(nColor).lerp(pColor, lerpFactor);
                                meshRef.current!.setColorAt(idx, colorVec);
                                if (meshRef.current!.instanceColor) meshRef.current!.instanceColor.needsUpdate = true;

                                // We'll also just jitter it to show it's "reacting"
                                scratchVec.setFromMatrixPosition(matrix);
                                scratchVec.add(new THREE.Vector3((Math.random() - 0.5) * 0.1, (Math.random() - 0.5) * 0.1, (Math.random() - 0.5) * 0.1));
                                dummy.matrix.copy(matrix);
                                dummy.matrix.setPosition(scratchVec);
                                meshRef.current!.setMatrixAt(idx, dummy.matrix);
                            }
                        }

                        meshRef.current!.instanceMatrix.needsUpdate = true;
                    }
                }
            } else if (collisionTimeRef.current !== null && !useGameStore.getState().isDecaying) {
                // Handle standard Collision Scattering Animation
                const t = state.clock.getElapsedTime() - collisionTimeRef.current;
                const duration = 2.0;

                if (t > duration) {
                    // Animation complete, snap exactly back
                    collisionTimeRef.current = null;
                    baseMatricesRef.current.forEach((matrix, i) => {
                        meshRef.current!.setMatrixAt(i, matrix);
                    });
                    meshRef.current.instanceMatrix.needsUpdate = true;
                } else {
                    // Animate scattering
                    let expandFactor = 0;
                    if (t < 0.1) {
                        expandFactor = (t / 0.1) * 6.0;
                    } else {
                        const decayTime = t - 0.1;
                        const decayDuration = duration - 0.1;
                        const p = decayTime / decayDuration;
                        expandFactor = 6.0 * (1 - p) * (1 - p);
                    }

                    const dummy = new THREE.Object3D();
                    const scratchVec = new THREE.Vector3();

                    baseMatricesRef.current.forEach((matrix, i) => {
                        scratchVec.setFromMatrixPosition(matrix);
                        const noiseDir = new THREE.Vector3(
                            Math.sin(i * 13.5),
                            Math.cos(i * 21.1),
                            Math.sin(i * 7.3)
                        ).normalize().multiplyScalar(0.5);

                        const dir = scratchVec.clone().normalize().add(noiseDir).normalize();
                        scratchVec.add(dir.multiplyScalar(expandFactor));

                        dummy.matrix.copy(matrix);
                        dummy.matrix.setPosition(scratchVec);

                        dummy.matrix.multiply(new THREE.Matrix4().makeRotationX(expandFactor * Math.sin(i)));
                        dummy.matrix.multiply(new THREE.Matrix4().makeRotationY(expandFactor * Math.cos(i)));

                        meshRef.current!.setMatrixAt(i, dummy.matrix);
                    });
                    meshRef.current.instanceMatrix.needsUpdate = true;
                }
            }
        }
    });

    const handleNucleusClick = (e: ThreeEvent<PointerEvent>) => {
        e.stopPropagation();

        // Only allow neutron editing in subatomic view
        const currentScale = useGameStore.getState().scaleLevel;
        if (currentScale !== 'subatomic') return;

        if (e.shiftKey) {
            if (selectedElement.neutrons > 0) {
                setNeutronCount(selectedElement.neutrons - 1);
            }
        } else if (e.ctrlKey || e.metaKey) {
            // Ctrl+Click: show nucleus info popup
            const protons = selectedElement.atomicNumber;
            const neutrons = selectedElement.neutrons;
            const massNumber = protons + neutrons;
            const nzRatio = protons > 0 ? neutrons / protons : 0;
            const isStable = nzRatio >= 0.9 && nzRatio <= 1.6 && protons <= 83;

            showInfoPopup({
                title: `${selectedElement.name}-${massNumber} Nucleus`,
                category: 'Nuclear Physics',
                content: [
                    `This nucleus contains ${protons} protons and ${neutrons} neutrons (mass number A = ${massNumber}).`,
                    `The nuclear radius is approximately ${(1.2 * Math.pow(massNumber, 1 / 3)).toFixed(2)} femtometers (10^-15 m).`,
                    `Approximate binding energy: ~${(massNumber * 7.5).toFixed(0)} MeV (~7.5 MeV per nucleon).`,
                    isStable
                        ? `This isotope is within the band of stability (N/Z ratio = ${nzRatio.toFixed(2)}).`
                        : `This isotope is likely unstable (N/Z ratio = ${nzRatio.toFixed(2)}). It would undergo radioactive decay.`,
                    'Click to add neutrons. Shift+Click to remove. Ctrl+Click for this info.'
                ]
            });
        } else {
            setNeutronCount(selectedElement.neutrons + 1);
        }
    };

    return (
        <group ref={groupRef} onClick={handleNucleusClick}>
            {/* Main Nucleons */}
            <instancedMesh ref={meshRef} args={[undefined, undefined, nucleonData.length]}>
                <sphereGeometry args={[0.3, 24, 24]} />
                <shaderMaterial
                    ref={materialRef}
                    vertexShader={nucleonVertexShader}
                    fragmentShader={nucleonFragmentShader}
                    uniforms={{
                        uTime: { value: 0 }
                    }}
                    vertexColors // Essential for setColorAt to work
                />
            </instancedMesh>

            {/* Hover/Guide interaction mesh could go here */}
        </group>
    );
}
