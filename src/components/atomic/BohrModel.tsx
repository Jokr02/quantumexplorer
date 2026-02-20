import { useRef, useMemo, useLayoutEffect, useCallback, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text, Torus, Billboard } from '@react-three/drei';
import * as THREE from 'three';
import { useGameStore } from '../../store/useGameStore';
import { calculateElectronShells } from '../../utils/atomic';

const SHELL_NAMES = ['K', 'L', 'M', 'N', 'O', 'P', 'Q'];
const ORBITAL_TYPES = ['1s', '2s,2p', '3s,3p', '3d,4s', '4p,4d', '4f,5s,5p', '5d,6s'];

// --- Sub-components ---
function OrbitRing({ radius, shellIndex, electronCount }: { radius: number, shellIndex: number, electronCount: number }) {
    const { showInfoPopup, setHoveredObject } = useGameStore.getState().actions;
    const scaleLevel = useGameStore((state) => state.scaleLevel);

    const handleClick = useCallback((e: { stopPropagation: () => void }) => {
        e.stopPropagation();
        showInfoPopup({
            title: `${SHELL_NAMES[shellIndex] || `Shell ${shellIndex + 1}`} Shell`,
            category: 'Electron Shell',
            content: [
                `Shell ${shellIndex + 1} (${SHELL_NAMES[shellIndex] || '?'}) contains ${electronCount} electron${electronCount !== 1 ? 's' : ''}.`,
                `Orbital types: ${ORBITAL_TYPES[shellIndex] || 'higher orbitals'}`,
                `Maximum capacity: ${2 * Math.pow(shellIndex + 1, 2)} electrons`,
                `Distance from nucleus: ~${(radius * 0.53).toFixed(1)} Å (Bohr radius units)`,
                shellIndex === 0 ? 'The innermost shell is always filled first. It can hold at most 2 electrons in the 1s orbital.' :
                    `Electrons in outer shells have higher energy and are easier to remove. ${SHELL_NAMES[shellIndex]} shell electrons determine this element's chemical reactivity.`
            ],
        });
    }, [shellIndex, electronCount, radius, showInfoPopup]);

    return (
        <group rotation={[Math.PI / 2, 0, 0]}>
            {/* Extremely thin Torus to look like a precise vector line. Using RingGeometry causes sorting issues when rotated. */}
            <Torus
                args={[radius, 0.015, 8, 128]}
                onClick={scaleLevel === 'atomic' ? handleClick : undefined}
                onPointerOver={scaleLevel === 'atomic' ? (e) => { e.stopPropagation(); setHoveredObject(`${SHELL_NAMES[shellIndex] || `Shell ${shellIndex + 1}`} Shell — ${electronCount}e⁻`); document.body.style.cursor = 'pointer'; } : undefined}
                onPointerOut={scaleLevel === 'atomic' ? () => { setHoveredObject(null); document.body.style.cursor = 'auto'; } : undefined}
            >
                <meshBasicMaterial color="#00ffff" transparent opacity={0.3} blending={THREE.AdditiveBlending} depthWrite={false} />
            </Torus>
            {/* Subtle invisible hit area for easier clicking */}
            <Torus
                args={[radius, 0.2, 8, 32]}
                onClick={scaleLevel === 'atomic' ? handleClick : undefined}
                onPointerOver={scaleLevel === 'atomic' ? (e) => { e.stopPropagation(); setHoveredObject(`${SHELL_NAMES[shellIndex] || `Shell ${shellIndex + 1}`} Shell — ${electronCount}e⁻`); document.body.style.cursor = 'pointer'; } : undefined}
                onPointerOut={scaleLevel === 'atomic' ? () => { setHoveredObject(null); document.body.style.cursor = 'auto'; } : undefined}
                visible={false}
            />
        </group>
    );
}

function Electron({ radius, speed, offset, showLabel, shellIndex, maxShells, setJumpingPhoton, elementColor }: { radius: number, speed: number, offset: number, showLabel: boolean, shellIndex: number, maxShells: number, setJumpingPhoton: (p: any) => void, elementColor: string }) {
    const ref = useRef<THREE.Group>(null);
    const trailRef = useRef<THREE.Mesh>(null);
    const prevPos = useRef(new THREE.Vector3());

    // Jump state
    const jumpState = useRef({
        isJumping: false,
        startTime: 0,
        startRadius: radius,
        targetRadius: radius,
        startShell: shellIndex,
        targetShell: shellIndex,
        nextJumpTime: Math.random() * 10 + 5 // Random initial wait 5-15s
    });

    useFrame((state) => {
        if (!ref.current) return;
        const time = state.clock.getElapsedTime();

        // Handle Quantum Jumps
        if (speed > 0 && !jumpState.current.isJumping && time > jumpState.current.nextJumpTime) {
            // Initiate jump
            // Prefer jumping to adjacent shells if possible
            const possibleShells = [];
            if (shellIndex > 0) possibleShells.push(shellIndex - 1); // Jump down (emit)
            if (shellIndex < maxShells - 1) possibleShells.push(shellIndex + 1); // Jump up (absorb)

            if (possibleShells.length > 0) {
                const targetShell = possibleShells[Math.floor(Math.random() * possibleShells.length)];
                const isEmission = targetShell < shellIndex;

                jumpState.current.isJumping = true;
                jumpState.current.startTime = time;
                jumpState.current.startRadius = radius; // Assuming current radius is base radius
                // Approximate target radius (base + TargetShell * 1.5)
                // This is a slight hack as we don't pass the exact formulas down, but works for visuals
                const nucleusRadius = Math.max(2.0, 0.45 + (1 * 0.005) + 0.3 + 0.5); // Rough guess for visual target
                const targetR = Math.max(2.0, nucleusRadius + 0.5) + (targetShell * 1.5);
                jumpState.current.targetRadius = targetR;
                jumpState.current.startShell = shellIndex;
                jumpState.current.targetShell = targetShell;

                // Trigger Photon visual immediately
                // Compute current world-ish position for photon start/end
                const angle = (time * speed) + offset;
                const startPos = new THREE.Vector3(Math.cos(angle) * jumpState.current.startRadius, 0, Math.sin(angle) * jumpState.current.startRadius);

                setJumpingPhoton({
                    active: true,
                    isEmission,
                    startPos: startPos,
                    startTime: time,
                    color: isEmission ? elementColor : '#ffffff' // Emit element color, absorb white light
                });
            } else {
                jumpState.current.nextJumpTime = time + Math.random() * 10 + 5;
            }
        }

        let currentRadius = radius;
        if (jumpState.current.isJumping) {
            const t = time - jumpState.current.startTime;
            const duration = 0.3; // Very fast jump
            if (t >= duration) {
                jumpState.current.isJumping = false;
                // After jump, wait a long time or reset
                // For true Bohr model, they wouldn't stay in wrong shell, so we force them back soon
                jumpState.current.nextJumpTime = time + Math.random() * 5 + 2;
                // If we just finished a jump, snap back to original shell for now to avoid state complexity
                // The visual shows the jump, then we seamlessly 'reset' so the shell counts don't break
            } else {
                // Lerp radius
                // Ease in out quad
                const p = t / duration;
                const ease = p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2;
                currentRadius = THREE.MathUtils.lerp(jumpState.current.startRadius, jumpState.current.targetRadius, ease);
            }
        }

        const angle = (time * speed) + offset;
        ref.current.position.x = Math.cos(angle) * currentRadius;
        ref.current.position.z = Math.sin(angle) * currentRadius;

        // Trail effect: position slightly behind the electron
        if (trailRef.current && speed > 0) {
            const lagAngle = angle - 0.15;
            trailRef.current.position.x = Math.cos(lagAngle) * currentRadius;
            trailRef.current.position.z = Math.sin(lagAngle) * currentRadius;
        }

        prevPos.current.copy(ref.current.position);
    });

    return (
        <>
            {/* Glow trail when moving */}
            {speed > 0 && (
                <mesh ref={trailRef}>
                    <sphereGeometry args={[0.3, 12, 12]} />
                    <meshBasicMaterial
                        color="#00ffff"
                        transparent
                        opacity={0.15}
                        blending={THREE.AdditiveBlending}
                        depthWrite={false}
                    />
                </mesh>
            )}
            <group ref={ref}>
                {/* HUD style electron: sharp flat circle looking at camera */}
                <Billboard>
                    <mesh>
                        <circleGeometry args={[0.2, 32]} />
                        <meshBasicMaterial color="#ffffff" />
                    </mesh>
                    <mesh position={[0, 0, -0.01]}>
                        <circleGeometry args={[0.35, 32]} />
                        <meshBasicMaterial color="#00ffff" transparent opacity={0.6} blending={THREE.AdditiveBlending} depthWrite={false} />
                    </mesh>
                </Billboard>

                {showLabel && !jumpState.current.isJumping && (
                    <Billboard position={[0, 0.55, 0]}>
                        <Text fontSize={0.25} color="#00ffff" outlineWidth={0.015} outlineColor="#003344" letterSpacing={0.1}>
                            e-
                        </Text>
                    </Billboard>
                )}
            </group>
        </>
    );
}

// Visual Photon Particle
function PhotonWave({ active, isEmission, startPos, startTime, color }: any) {
    const ref = useRef<THREE.Group>(null);

    useFrame((state) => {
        if (!ref.current || !active) return;
        const time = state.clock.getElapsedTime();
        const t = time - startTime;
        const duration = 0.6; // Photon travel time

        if (t > duration) {
            ref.current.visible = false;
            return;
        }

        ref.current.visible = true;

        // Emission: start at electron, fly out
        // Absorption: start outside, fly in to electron
        const progress = t / duration; // 0 to 1

        const outerOrbitDistance = 25.0; // Far away relative to atom
        const escapeDir = startPos.clone().normalize();

        let currentPos = new THREE.Vector3();
        if (isEmission) {
            // Fly Out
            const targetPos = startPos.clone().add(escapeDir.multiplyScalar(outerOrbitDistance));
            currentPos.lerpVectors(startPos, targetPos, progress);
        } else {
            // Fly In
            const spawnPos = startPos.clone().add(escapeDir.multiplyScalar(outerOrbitDistance));
            currentPos.lerpVectors(spawnPos, startPos, progress);
        }

        ref.current.position.copy(currentPos);

        // Optional: Animate a sine wave for the photon line geometry if desired
        // For now, it's a fast moving glowing streak in the direction of travel
        if (ref.current) {
            ref.current.lookAt(new THREE.Vector3(0, 0, 0)); // Point towards center
        }
    });

    if (!active) return null;

    return (
        <group ref={ref}>
            <Billboard>
                <mesh>
                    {/* Wavy photon symbol approximation */}
                    <planeGeometry args={[1.5, 0.5]} />
                    <meshBasicMaterial color={color} transparent opacity={0.8} blending={THREE.AdditiveBlending} depthWrite={false} side={THREE.DoubleSide}>
                        {/* Inject simple sine wave shader if wanted, or use a texture. For MVP, just a glowing block/streak */}
                    </meshBasicMaterial>
                </mesh>
            </Billboard>
        </group>
    );
}

// --- Main Component ---
export function BohrModel() {
    const selectedElement = useGameStore((state) => state.selectedElement);
    const electronsAnimated = useGameStore((state) => state.electronsAnimated);
    const scaleLevel = useGameStore((state) => state.scaleLevel);
    const { showInfoPopup, setHoveredObject, setTargetScale } = useGameStore.getState().actions;

    const nucleusData = useMemo(() => {
        const particles = [];
        const protons = selectedElement.atomicNumber;
        const neutrons = selectedElement.neutrons;
        const count = protons + neutrons;

        for (let i = 0; i < count; i++) {
            const phi = Math.acos(-1 + (2 * i) / count);
            const theta = Math.sqrt(count * Math.PI) * phi;

            const spread = 0.45 + (count * 0.005);
            const x = spread * Math.sin(phi) * Math.cos(theta);
            const y = spread * Math.sin(phi) * Math.sin(theta);
            const z = spread * Math.cos(phi);

            // Protons use element base color, neutrons use a darker/desaturated variant
            let color: string;
            const baseColor = new THREE.Color(selectedElement.color);
            if (i < protons) {
                color = '#' + baseColor.getHexString();
            } else {
                // Dimmer, less saturated color for neutrons
                const hsl = { h: 0, s: 0, l: 0 };
                baseColor.getHSL(hsl);
                color = '#' + new THREE.Color().setHSL(hsl.h, hsl.s * 0.3, hsl.l * 0.4).getHexString();
            }

            particles.push({
                pos: new THREE.Vector3(x, y, z),
                color: new THREE.Color(color)
            });
        }
        return particles;
    }, [selectedElement]);

    const shells = useMemo(() => calculateElectronShells(selectedElement.atomicNumber), [selectedElement.atomicNumber]);

    const meshRef = useRef<THREE.InstancedMesh>(null);
    const modelRef = useRef<THREE.Group>(null);

    useLayoutEffect(() => {
        if (!meshRef.current) return;

        const dummy = new THREE.Object3D();

        nucleusData.forEach((particle, i) => {
            dummy.position.copy(particle.pos);
            dummy.updateMatrix();
            meshRef.current!.setMatrixAt(i, dummy.matrix);
            meshRef.current!.setColorAt(i, particle.color);
        });

        meshRef.current.instanceMatrix.needsUpdate = true;
        if (meshRef.current.instanceColor) meshRef.current.instanceColor.needsUpdate = true;
    }, [nucleusData]);

    const nucleusRadius = useMemo(() => {
        const count = selectedElement.atomicNumber + selectedElement.neutrons;
        return 0.45 + (count * 0.005) + 0.3;
    }, [selectedElement]);

    const groupScale = useMemo(() => {
        const shellCount = shells.length;

        let outerRadius = 2.0;
        if (shellCount > 0) {
            const baseRadius = Math.max(2.0, nucleusRadius + 0.5);
            outerRadius = baseRadius + ((shellCount - 1) * 1.5);
        }

        const minRadius = 2.0;
        const maxRadius = 14.0;
        const maxScale = 0.85;
        const minScale = 0.35;

        return THREE.MathUtils.mapLinear(
            THREE.MathUtils.clamp(outerRadius, minRadius, maxRadius),
            minRadius, maxRadius,
            maxScale, minScale
        );
    }, [shells, nucleusRadius]);

    const handleNucleusClick = useCallback((e: { stopPropagation: () => void }) => {
        e.stopPropagation();
        const protons = selectedElement.atomicNumber;
        const neutrons = selectedElement.neutrons;
        showInfoPopup({
            title: `${selectedElement.name} Nucleus`,
            category: 'Nucleus',
            content: [
                `Contains ${protons} proton${protons !== 1 ? 's' : ''} and ${neutrons} neutron${neutrons !== 1 ? 's' : ''} (${protons + neutrons} nucleons total).`,
                `Each proton contains 2 Up quarks and 1 Down quark (uud). Each neutron has 1 Up and 2 Down quarks (udd).`,
                `The nucleus is held together by the Strong Nuclear Force, mediated by gluons. Despite the electromagnetic repulsion between protons, the Strong Force is ~137x stronger at nuclear distances.`,
                `Mass: ~${selectedElement.atomicMass.toFixed(3)} amu. But only ~1% of this mass comes from the quarks — the rest is binding energy (E=mc²)!`,
            ],
            action: {
                label: 'Dive into the Nucleus →',
                callback: () => setTargetScale(0.5)
            }
        });
    }, [selectedElement, showInfoPopup, setTargetScale]);

    const [jumpingPhoton, setJumpingPhoton] = useState({
        active: false,
        isEmission: true,
        startPos: new THREE.Vector3(),
        startTime: 0,
        color: '#ffffff'
    });

    return (
        <group ref={modelRef} scale={groupScale}>
            {/* Invisible Hitbox for easier clicking when scaled down */}
            {/* The hitbox is slightly larger than the innermost electron shell to guarantee intercepting clicks on the core */}
            <mesh
                onClick={scaleLevel === 'atomic' ? handleNucleusClick : undefined}
                onPointerOver={scaleLevel === 'atomic' ? (e) => { e.stopPropagation(); setHoveredObject(`${selectedElement.name} Nucleus — ${selectedElement.atomicNumber}p⁺ ${selectedElement.neutrons}n⁰`); document.body.style.cursor = 'pointer'; } : undefined}
                onPointerOut={scaleLevel === 'atomic' ? () => { setHoveredObject(null); document.body.style.cursor = 'auto'; } : undefined}
                renderOrder={999} // Render last so it registers hits over glass
            >
                <sphereGeometry args={[Math.max(2.5, nucleusRadius + 1.5), 16, 16]} />
                <meshBasicMaterial transparent opacity={0.0} depthWrite={false} colorWrite={false} />
            </mesh>

            {/* Nucleus Core Glass Shell */}
            <mesh>
                <sphereGeometry args={[nucleusRadius + 0.1, 32, 32]} />
                <meshPhysicalMaterial
                    color={selectedElement.color}
                    transmission={0.9} // Glass-like transparency
                    opacity={0.8}
                    transparent
                    roughness={0.1}
                    metalness={0.1}
                    ior={1.5}
                    thickness={1.5}
                    clearcoat={1}
                    clearcoatRoughness={0.1}
                />
            </mesh>
            {/* Inner Core Glow */}
            <mesh>
                <sphereGeometry args={[nucleusRadius, 32, 32]} />
                <meshBasicMaterial color={selectedElement.color} transparent opacity={0.3} blending={THREE.AdditiveBlending} depthWrite={false} />
            </mesh>

            {/* Nucleons (Instanced) inside the glass shell */}
            <instancedMesh
                ref={meshRef}
                args={[undefined, undefined, nucleusData.length]}
                renderOrder={-1} // Render before the glass shell
            >
                <sphereGeometry args={[0.25, 16, 16]} />
                <meshPhysicalMaterial roughness={0.3} metalness={0.5} emissiveIntensity={0.5} />
            </instancedMesh>

            {/* Electron Shells - Clickable */}
            {shells.map((electronCount, shellIndex) => {
                const baseRadius = Math.max(2.0, nucleusRadius + 0.5);
                const radius = baseRadius + (shellIndex * 1.5);
                const speed = electronsAnimated ? (0.8 + shellIndex * 0.3) : 0;

                const orbit = <OrbitRing key={`ring-${shellIndex}`} radius={radius} shellIndex={shellIndex} electronCount={electronCount} />;

                const electrons = [];
                for (let i = 0; i < electronCount; i++) {
                    const offset = (Math.PI * 2 * i) / electronCount;
                    const showLabel = (i === 0) || (i > 0 && i % 6 === 0);

                    electrons.push(
                        <Electron
                            key={`shell-${shellIndex}-e-${i}`}
                            radius={radius}
                            speed={speed}
                            offset={offset}
                            showLabel={showLabel}
                            shellIndex={shellIndex}
                            maxShells={shells.length}
                            setJumpingPhoton={setJumpingPhoton}
                            elementColor={selectedElement.color}
                        />
                    );
                }

                const xTilt = 0.1 + (shellIndex * 0.05);
                const yTilt = 0.2 * (shellIndex % 2 ? 1 : -1);

                return (
                    <group key={`shell-${shellIndex}`} rotation={[xTilt, yTilt, 0]}>
                        {orbit}
                        {electrons}
                    </group>
                );
            })}

            <PhotonWave {...jumpingPhoton} />

            {/* Polarity Indicator */}
            <Billboard position={[0, 0, nucleusRadius * 0.6]}>
                <Text
                    fontSize={Math.max(0.5, nucleusRadius * 0.4)}
                    color="#ffffff"
                    outlineWidth={0.04}
                    outlineColor="#000000"
                >
                    p+
                </Text>
            </Billboard>
        </group>
    );
}
