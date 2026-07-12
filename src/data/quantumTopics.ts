export interface Formula {
    label: string;
    latex: string;
}

export type ExhibitShortcut =
    | { label: string; actionType: 'load_molecule'; payload: string }
    | { label: string; actionType: 'set_material'; payload: { elementRef: string; material: 'solid' | 'liquid' | 'gas' } };

export interface QuantumTopic {
    id: string;
    title: string;
    description: string;
    details: string[];
    formulas?: Formula[];
    funFact: string;
    category: 'Atomic' | 'Molecular' | 'Subatomic' | 'Quantum' | 'Nuclear';
    exhibits?: ExhibitShortcut[];
}

export interface QuizQuestion {
    question: string;
    options: string[];
    correctIndex: number;
    explanation: string;
}

export const QUANTUM_TOPICS: QuantumTopic[] = [
    // ── ATOMIC ──────────────────────────────────────────────
    {
        id: 'atomic-structure',
        title: 'Atomic Structure',
        category: 'Atomic',
        description: 'Atoms are the basic building blocks of matter, consisting of a dense nucleus surrounded by a cloud of electrons.',
        details: [
            'An atom consists of three fundamental particles: protons (positive charge), neutrons (no charge), and electrons (negative charge). Protons and neutrons are packed tightly into the nucleus, while electrons orbit at relatively enormous distances.',
            'If the nucleus of a hydrogen atom were the size of a basketball, the electron would be orbiting about 3 kilometers away. The atom is overwhelmingly empty space.',
            'The number of protons defines the element (its "Atomic Number"). Carbon always has 6 protons, gold always has 79. Changing the number of protons transforms one element into another — this is the dream of the ancient alchemists, and it actually happens naturally in radioactive decay.',
            'Electrons are arranged in discrete energy levels called "shells." The innermost shell holds up to 2 electrons, the second holds up to 8, the third up to 18, and so on. The arrangement of electrons in the outermost shell determines an element\'s chemical behavior.'
        ],
        formulas: [
            { label: 'Bohr Radius (Hydrogen)', latex: 'a_0 = \\frac{4\\pi\\epsilon_0 \\hbar^2}{m_e e^2} \\approx 0.529 \\text{ Å}' },
            { label: 'Electron Shell Capacity', latex: '\\text{Max electrons} = 2n^2' }
        ],
        funFact: 'If you removed all the empty space from every atom in every person on Earth, the entire human race would fit into a sugar cube!'
    },
    {
        id: 'electron-orbitals',
        title: 'Electron Orbitals',
        category: 'Atomic',
        description: 'Electrons don\'t orbit the nucleus like planets — they exist in probabilistic "clouds" called orbitals.',
        details: [
            'The Bohr model (shown in this app) depicts electrons in neat circular orbits, but quantum mechanics reveals a stranger truth: electrons exist as probability distributions called "orbitals." An orbital is a 3D region where there is a high probability (typically 90%) of finding the electron.',
            'Orbitals come in distinct shapes labeled by letters: $s$ orbitals are spherical, $p$ orbitals are dumbbell-shaped, $d$ orbitals are clover-shaped, and $f$ orbitals are even more complex. Each shape corresponds to a solution of the Schrödinger equation.',
            'The Pauli Exclusion Principle states that no two electrons in an atom can have the same set of quantum numbers. This is why electrons fill orbitals in a specific order and why each orbital can hold at most 2 electrons (with opposite spins).',
            'The Aufbau Principle describes the order in which orbitals are filled: $1s \\rightarrow 2s \\rightarrow 2p \\rightarrow 3s \\rightarrow 3p \\rightarrow 4s \\rightarrow 3d \\rightarrow 4p$, and so on. This order explains the structure of the Periodic Table itself.'
        ],
        formulas: [
            { label: 'Schrödinger Equation', latex: 'i\\hbar \\frac{\\partial}{\\partial t} |\\Psi\\rangle = \\hat{H} |\\Psi\\rangle' },
            { label: 'Quantum Numbers', latex: 'n, l, m_l, m_s' }
        ],
        funFact: 'The electron in a hydrogen atom doesn\'t have a definite position — it\'s literally everywhere in the orbital at once until you measure it!'
    },
    {
        id: 'periodic-table',
        title: 'The Periodic Table',
        category: 'Atomic',
        description: 'A systematic arrangement of elements based on atomic number and recurring chemical properties.',
        details: [
            'Dmitri Mendeleev published the first widely recognized Periodic Table in 1869, arranging elements by atomic mass and predicting the existence of undiscovered elements based on gaps in the pattern.',
            'Elements in the same column (group) have similar chemical properties because they have the same number of electrons in their outermost shell. For example, the Noble Gases (He, Ne, Ar, Kr, Xe, Rn) all have full outer shells, making them extremely unreactive.',
            'The rows (periods) correspond to the principal energy level ($n$) being filled. Period 1 fills the $1s$ orbital (2 elements), Period 2 fills $2s$ and $2p$ (8 elements), and so on.',
            'Electronegativity — the tendency of an atom to attract electrons — generally increases from left to right and from bottom to top. Fluorine is the most electronegative element, which is why it\'s so reactive that it can even make Noble Gases form compounds.'
        ],
        formulas: [
            { label: 'Ionization Energy Trend', latex: 'IE \\propto \\frac{Z_{eff}}{r^2}' }
        ],
        funFact: 'Mendeleev left gaps in his table and predicted three undiscovered elements — Gallium, Scandium, and Germanium — all found within 15 years with properties matching his predictions!'
    },
    {
        id: 'isotopes',
        title: 'Isotopes & Radioactivity',
        category: 'Nuclear',
        description: 'Atoms of the same element can have different numbers of neutrons, creating isotopes — some stable, some radioactive.',
        details: [
            'Isotopes are variants of an element that have the same number of protons but different numbers of neutrons. For example, Carbon-12 has 6 neutrons, Carbon-13 has 7, and Carbon-14 has 8. They are chemically identical but differ in mass and nuclear stability.',
            'Unstable isotopes undergo radioactive decay, transforming into other elements by emitting particles. Alpha decay ($\\alpha$) ejects a helium nucleus, Beta decay ($\\beta$) converts a neutron to a proton (or vice versa), and Gamma decay ($\\gamma$) releases pure energy.',
            'Carbon-14 dating works because living organisms continuously absorb Carbon-14 from the atmosphere. When they die, the $^{14}C$ begins to decay with a half-life of 5,730 years. By measuring the remaining $^{14}C$, scientists can determine when the organism died.',
            'Try clicking on the nucleus in the Subatomic View! You can add and remove neutrons to create different isotopes of the selected element.'
        ],
        formulas: [
            { label: 'Radioactive Decay Law', latex: 'N(t) = N_0 e^{-\\lambda t}' },
            { label: 'Half-Life Relation', latex: 't_{1/2} = \\frac{\\ln 2}{\\lambda}' }
        ],
        funFact: 'Bananas are slightly radioactive due to their Potassium-40 content — you\'d need to eat about 10 million bananas at once for the radiation to be lethal!'
    },

    // ── MOLECULAR ───────────────────────────────────────────
    {
        id: 'chemical-bonding',
        title: 'Chemical Bonding',
        category: 'Molecular',
        description: 'Atoms bond together by sharing or transferring electrons to achieve stable electron configurations.',
        details: [
            'Covalent bonds form when two atoms share one or more pairs of electrons. This typically occurs between non-metals. The shared electrons create a region of high electron density between the nuclei, holding the atoms together.',
            'Ionic bonds form when one atom transfers electrons to another, creating oppositely charged ions that attract each other. Sodium (Na) gives its outer electron to Chlorine (Cl), forming Na⁺ and Cl⁻ — table salt (NaCl).',
            'Metallic bonds occur when atoms share a "sea" of delocalized electrons. This explains why metals conduct electricity (electrons flow freely), are malleable (atom layers can slide), and are lustrous (free electrons reflect light).',
            'The crystal lattice you see in the Molecular View represents the ordered arrangement of atoms in a solid. The bonds shown between atoms are the forces holding the structure together.'
        ],
        formulas: [
            { label: 'Coulomb\'s Law (Ionic)', latex: 'F = k \\frac{q_1 q_2}{r^2}' },
            { label: 'Bond Energy', latex: '\\Delta H = \\sum E_{\\text{bonds broken}} - \\sum E_{\\text{bonds formed}}' }
        ],
        funFact: 'Diamond and graphite are both made entirely of carbon atoms — the only difference is how the atoms are bonded. Diamond has each carbon bonded to 4 others in a rigid 3D lattice, while graphite has layers of hexagonal sheets that slide easily!'
    },
    {
        id: 'states-of-matter',
        title: 'States of Matter',
        category: 'Molecular',
        description: 'The physical state of matter depends on the balance between particle kinetic energy and intermolecular forces.',
        details: [
            'In a solid, molecules are locked in fixed positions in a crystal lattice, vibrating but not moving freely. The intermolecular forces are strong enough to hold the structure rigid. Try setting the temperature to near 0K in the Molecular View to see the atoms almost freeze in place!',
            'In a liquid, molecules have enough kinetic energy to overcome some intermolecular forces, allowing them to flow and take the shape of their container. They are still close together but not locked in position.',
            'In a gas, molecules have enough energy to completely overcome intermolecular forces. They move freely, bouncing off walls and each other. Crank the temperature slider to 1000K to see this chaotic motion!',
            'At the quantum level, matter can also exist as a Bose-Einstein Condensate (near absolute zero) where atoms merge into a single quantum state, or as Plasma (extremely high temperatures) where electrons are stripped from atoms.'
        ],
        formulas: [
            { label: 'Ideal Gas Law', latex: 'PV = nRT' },
            { label: 'Kinetic Energy', latex: 'KE = \\frac{3}{2} k_B T' }
        ],
        funFact: 'At absolute zero (0K = -273.15°C), all molecular motion would theoretically stop — but quantum mechanics says particles always have a tiny "zero-point energy" and can never be perfectly still!',
        exhibits: [
            { label: 'View Liquid Mercury (Quicksilver)', actionType: 'set_material', payload: { elementRef: 'Hg', material: 'liquid' } }
        ]
    },
    {
        id: 'molecular-geometry',
        title: 'Molecular Geometry',
        category: 'Molecular',
        description: 'The 3D shape of molecules determines their physical and chemical properties.',
        details: [
            'VSEPR Theory (Valence Shell Electron Pair Repulsion) predicts molecular shapes. Electron pairs around a central atom repel each other and arrange themselves as far apart as possible.',
            'Water ($H_2O$) is bent at 104.5° because oxygen has two lone pairs that push the hydrogen atoms closer together. This bent shape makes water polar — one end is slightly positive, the other slightly negative.',
            'The polarity of water explains nearly everything about life: it\'s why ice floats, why water is such a good solvent, why proteins fold, and why cells have membranes.',
            'Carbon can form 4 bonds in a tetrahedral arrangement (109.5° apart), which is the basis of all organic chemistry and the incredible diversity of life on Earth.'
        ],
        formulas: [
            { label: 'Dipole Moment', latex: '\\mu = q \\times d' }
        ],
        funFact: 'If water were linear instead of bent, it would be nonpolar, would not dissolve most substances, and life as we know it could not exist!',
        exhibits: [
            { label: 'Load Water (H₂O) Molecule', actionType: 'load_molecule', payload: 'water' }
        ]
    },

    // ── SUBATOMIC ───────────────────────────────────────────
    {
        id: 'quarks',
        title: 'Quarks',
        category: 'Subatomic',
        description: 'Protons and neutrons are not fundamental — they are made of three quarks bound together by the strong force.',
        details: [
            'There are six types ("flavors") of quarks: Up ($u$), Down ($d$), Charm ($c$), Strange ($s$), Top ($t$), and Bottom ($b$). Ordinary matter is made only of Up and Down quarks.',
            'A proton consists of two Up quarks and one Down quark ($uud$), giving it a charge of $+1$. A neutron consists of one Up and two Down quarks ($udd$), giving it a charge of $0$. The Up quark has charge $+\\frac{2}{3}$ and the Down quark has charge $-\\frac{1}{3}$.',
            'Quarks can never be observed in isolation — this is called "Color Confinement." If you try to pull a quark out of a proton, the energy stored in the gluon field creates a new quark-antiquark pair before the original quark can escape. It\'s like trying to isolate one end of a magnet.',
            'The colorful particles orbiting the nucleus in the Subatomic View represent gluons, which carry the strong force between quarks. The colors (Red, Green, Blue) represent "color charge" — the quantum version of electric charge for the strong force.'
        ],
        formulas: [
            { label: 'Proton Composition', latex: 'p = uud \\quad (+\\frac{2}{3} +\\frac{2}{3} -\\frac{1}{3} = +1)' },
            { label: 'Neutron Composition', latex: 'n = udd \\quad (+\\frac{2}{3} -\\frac{1}{3} -\\frac{1}{3} = 0)' }
        ],
        funFact: 'Only about 1% of a proton\'s mass comes from the quarks themselves — the other 99% comes from the kinetic energy of the quarks and the energy of the gluon field, via $E = mc^2$!'
    },
    {
        id: 'strong-force',
        title: 'The Strong Nuclear Force',
        category: 'Subatomic',
        description: 'The most powerful force in nature, binding quarks into protons and neutrons, and holding the nucleus together.',
        details: [
            'The Strong Force is about 137 times stronger than electromagnetism and $10^{38}$ times stronger than gravity. It is carried by massless particles called gluons, analogous to how photons carry the electromagnetic force.',
            'Unlike electromagnetism (which has positive and negative charge), the strong force has three types of "color charge": Red, Green, and Blue. Every visible particle (hadron) must be "color-neutral" — either containing all three colors (baryons like protons) or a color-anticolor pair (mesons).',
            'The strong force has a unique property called "Asymptotic Freedom": at very short distances (inside a proton), quarks interact weakly and move almost freely. But as the distance increases, the force grows stronger — like a rubber band that gets harder to stretch.',
            'Gluons themselves carry color charge (unlike photons, which are electrically neutral). This means gluons interact with each other, creating an incredibly complex web of force lines inside every proton and neutron. This is what the Gluon Field in the Subatomic View represents.'
        ],
        formulas: [
            { label: 'QCD Coupling (Running)', latex: '\\alpha_s(Q^2) = \\frac{12\\pi}{(33 - 2n_f)\\ln(Q^2/\\Lambda^2_{QCD})}' },
            { label: 'Color Neutrality', latex: 'R + G + B = \\text{white (neutral)}' }
        ],
        funFact: 'The energy stored in the gluon field of a single proton is equivalent to about 0.938 GeV — which is almost a billion electron-volts of pure binding energy!'
    },
    {
        id: 'weak-force',
        title: 'The Weak Nuclear Force',
        category: 'Subatomic',
        description: 'The force responsible for radioactive decay and the transformation of one type of quark into another.',
        details: [
            'The Weak Force is the only force that can change the "flavor" of quarks. In beta decay, a Down quark transforms into an Up quark (or vice versa), changing a neutron into a proton and emitting an electron and antineutrino.',
            'The Weak Force is carried by three massive particles: the $W^+$, $W^-$, and $Z^0$ bosons. Their large mass ($\\sim$80-91 GeV/$c^2$) is why the weak force has such a short range ($\\sim 10^{-18}$ m) — about 0.1% the size of a proton.',
            'The Weak Force violates parity symmetry (P) — meaning the laws of physics are NOT the same when viewed in a mirror! This was proven in 1957 by Chien-Shiung Wu, and it shook the foundations of physics.',
            'The Weak Force is unified with Electromagnetism at very high energies ($\\sim$100 GeV), forming the "Electroweak Force." This unification was predicted by Glashow, Weinberg, and Salam (Nobel Prize, 1979) and confirmed at CERN in 1983.'
        ],
        formulas: [
            { label: 'Beta Decay', latex: 'n \\rightarrow p + e^- + \\bar{\\nu}_e' },
            { label: 'W Boson Mass', latex: 'm_W \\approx 80.4 \\text{ GeV}/c^2' }
        ],
        funFact: 'Without the Weak Force, the Sun would not shine! The proton-proton chain that powers the Sun requires a Weak Force interaction in its very first step.'
    },
    {
        id: 'standard-model',
        title: 'The Standard Model',
        category: 'Subatomic',
        description: 'The most successful theory in physics, describing all known fundamental particles and three of the four fundamental forces.',
        details: [
            'The Standard Model organizes all known particles into two families: Fermions (matter particles) and Bosons (force carriers). Fermions include 6 quarks and 6 leptons (electron, muon, tau, and their neutrinos). Bosons include the photon, gluons, $W^\\pm$, $Z^0$, and the Higgs boson.',
            'Matter is arranged in three "generations." The first generation (Up, Down, Electron, Electron-neutrino) makes up all ordinary matter. The second and third generations are heavier, unstable copies that exist only briefly in high-energy collisions.',
            'The Higgs boson, discovered at CERN in 2012, is responsible for giving mass to the $W$ and $Z$ bosons (and indirectly to fermions) through the Higgs mechanism. Without it, all particles would travel at the speed of light and atoms could not form.',
            'The Standard Model does NOT include gravity, which remains described by General Relativity. Reconciling quantum mechanics with gravity is the greatest unsolved problem in physics — the quest for a "Theory of Everything."'
        ],
        formulas: [
            { label: 'Standard Model Lagrangian', latex: '\\mathcal{L} = \\mathcal{L}_{gauge} + \\mathcal{L}_{Higgs} + \\mathcal{L}_{fermion} + \\mathcal{L}_{Yukawa}' }
        ],
        funFact: 'The Higgs boson was predicted in 1964 but not discovered until 2012 — a 48-year gap that required the construction of the Large Hadron Collider, the most complex machine ever built!'
    },
    {
        id: 'antimatter',
        title: 'Antimatter',
        category: 'Subatomic',
        description: 'Every particle has a corresponding antiparticle with the same mass but opposite charge. When they meet, they annihilate into pure energy.',
        details: [
            'Paul Dirac predicted antimatter in 1928 by combining quantum mechanics with special relativity. His equation had two solutions: one for ordinary electrons and one for a mysterious particle with positive charge — the positron, discovered in 1932.',
            'When a particle meets its antiparticle, they annihilate completely, converting all their mass into energy via $E = mc^2$. One gram of antimatter annihilating with one gram of matter would release about 180 terajoules — equivalent to a 43-kiloton nuclear bomb.',
            'The Big Bang should have created equal amounts of matter and antimatter, which should have annihilated each other, leaving only photons. The fact that we exist means there was a tiny asymmetry — about 1 extra matter particle for every billion matter-antimatter pairs. This "Baryon Asymmetry" is one of the biggest unsolved mysteries.',
            'Antimatter is real — PET scanners in hospitals use positrons (anti-electrons) daily. CERN has even created anti-hydrogen atoms and trapped them for over 16 minutes.'
        ],
        formulas: [
            { label: 'Pair Annihilation', latex: 'e^- + e^+ \\rightarrow 2\\gamma' },
            { label: 'Matter-Antimatter Energy', latex: 'E = 2mc^2' }
        ],
        funFact: 'Antimatter is the most expensive substance in the world — producing just 1 gram would cost approximately $62.5 trillion at current production rates!'
    },
    {
        id: 'nuclear-forces',
        title: 'Nuclear Binding Energy',
        category: 'Nuclear',
        description: 'The energy that holds the nucleus together, and the source of power in both nuclear fission and fusion.',
        details: [
            'The mass of an atomic nucleus is always less than the sum of its individual protons and neutrons. This "mass defect" represents the binding energy — the energy released when the nucleus was assembled, and the energy required to tear it apart.',
            'Iron-56 has the highest binding energy per nucleon of any element. Elements lighter than iron can release energy through fusion (combining nuclei), while elements heavier than iron release energy through fission (splitting nuclei). This is why stars fuse hydrogen into helium and why nuclear reactors split uranium.',
            'The Semi-Empirical Mass Formula models the nucleus as a "liquid drop," accounting for volume energy, surface tension, Coulomb repulsion, symmetry energy, and pairing effects. It accurately predicts nuclear masses across the entire Periodic Table.',
            'Nuclear fission of Uranium-235 releases about 200 MeV per reaction — roughly 80 million times more energy per reaction than burning coal!'
        ],
        formulas: [
            { label: 'Mass-Energy Equivalence', latex: 'E = mc^2' },
            { label: 'Binding Energy per Nucleon', latex: 'B/A = a_v - a_s A^{-1/3} - a_c \\frac{Z(Z-1)}{A^{4/3}} - a_a \\frac{(A-2Z)^2}{A^2}' }
        ],
        funFact: 'When heavy stars die in supernovae, the explosion is so powerful that it fuses elements heavier than iron — every gold atom on Earth was forged in a dying star or neutron star collision!'
    },

    // ── QUANTUM ─────────────────────────────────────────────
    {
        id: 'wave-particle-duality',
        title: 'Wave-Particle Duality',
        category: 'Quantum',
        description: 'All particles exhibit both wave-like and particle-like behavior, depending on how they are observed.',
        details: [
            'In the famous Double-Slit Experiment, electrons fired one at a time at a wall with two slits create an interference pattern — as if each electron passes through both slits simultaneously as a wave. But if you place a detector at one slit to "watch" which slit the electron passes through, the interference pattern vanishes and they behave like particles.',
            'Louis de Broglie proposed in 1924 that all matter has a wavelength inversely proportional to its momentum. For everyday objects, this wavelength is negligibly small. But for electrons, it\'s comparable to atomic spacing — which is why electron microscopes can see individual atoms.',
            'This duality is not just an electron quirk — it has been demonstrated with neutrons, atoms, and even large molecules with over 800 atoms (C₆₀ fullerene experiments).',
            'Wave-particle duality is not about the particle "deciding" what to be. The particle is fundamentally a quantum object described by a wave function — our classical concepts of "wave" and "particle" are just approximations that each capture part of the truth.'
        ],
        formulas: [
            { label: 'de Broglie Wavelength', latex: '\\lambda = \\frac{h}{p} = \\frac{h}{mv}' },
            { label: 'Planck-Einstein Relation', latex: 'E = hf = \\frac{hc}{\\lambda}' }
        ],
        funFact: 'You have a de Broglie wavelength too! But for a 70 kg person walking at 1 m/s, it\'s about $10^{-35}$ meters — far smaller than any measurable length!'
    },
    {
        id: 'uncertainty-principle',
        title: 'Heisenberg Uncertainty Principle',
        category: 'Quantum',
        description: 'It is fundamentally impossible to simultaneously know both the exact position and exact momentum of a particle.',
        details: [
            'The Uncertainty Principle is NOT about measurement limitations — it is a fundamental property of the universe. A particle literally does not have a precise position and momentum simultaneously. The more precisely one is defined, the less precise the other becomes.',
            'This arises because position and momentum are "conjugate variables" — they are related by a Fourier transform. A wave with a well-defined frequency (momentum) must be spread out in space (uncertain position), and a wave localized to a point (definite position) must contain many frequencies (uncertain momentum).',
            'There is also an energy-time uncertainty relation: $\\Delta E \\cdot \\Delta t \\geq \\frac{\\hbar}{2}$. This allows "virtual particles" to pop into existence for incredibly brief moments, borrowing energy from the vacuum.',
            'The Uncertainty Principle makes the very concept of a nucleus slightly fuzzy — protons and neutrons are always jiggling around, never perfectly still, even at absolute zero. The morphing shapes you see in the Subatomic View represent this quantum uncertainty!'
        ],
        formulas: [
            { label: 'Position-Momentum', latex: '\\Delta x \\cdot \\Delta p \\geq \\frac{\\hbar}{2}' },
            { label: 'Energy-Time', latex: '\\Delta E \\cdot \\Delta t \\geq \\frac{\\hbar}{2}' }
        ],
        funFact: 'The Uncertainty Principle explains why atoms don\'t collapse — if the electron were at the exact center, its momentum uncertainty would be infinite, giving it enough energy to escape!'
    },
    {
        id: 'quantum-tunneling',
        title: 'Quantum Tunneling',
        category: 'Quantum',
        description: 'Particles can pass through energy barriers that they classically shouldn\'t be able to, as if tunneling through a wall.',
        details: [
            'In classical physics, a ball can\'t pass through a wall — it doesn\'t have enough energy. But in quantum mechanics, the wave function of a particle extends slightly beyond energy barriers. If the barrier is thin enough, there\'s a nonzero probability of the particle appearing on the other side.',
            'Quantum tunneling is essential for life. Nuclear fusion in the Sun requires protons to overcome their electrical repulsion (the Coulomb Barrier). At the Sun\'s core temperature (~15 million K), protons don\'t have enough energy to do this classically — they tunnel through the barrier.',
            'Modern technology relies on tunneling. Flash memory (in your phone and USB drives) works by trapping electrons behind an energy barrier via tunneling. Tunnel diodes, scanning tunneling microscopes, and even some chemical reactions depend on this effect.',
            'The tunneling probability decreases exponentially with barrier width and height. This is why macroscopic objects don\'t tunnel through walls — a baseball would need to wait longer than the age of the universe for it to happen!'
        ],
        formulas: [
            { label: 'Tunneling Probability', latex: 'T \\approx e^{-2\\kappa L}' },
            { label: 'Decay Constant', latex: '\\kappa = \\frac{\\sqrt{2m(V_0 - E)}}{\\hbar}' }
        ],
        funFact: 'Alpha decay — where a helium nucleus escapes the nucleus — is entirely caused by quantum tunneling. The alpha particle bounces around inside the nucleus billions of times per second until it tunnels through the energy barrier!'
    },
    {
        id: 'spin',
        title: 'Quantum Spin',
        category: 'Quantum',
        description: 'An intrinsic form of angular momentum carried by elementary particles — but it\'s not actually spinning.',
        details: [
            'Quantum spin is an intrinsic property of particles, like mass or charge. Despite the name, particles aren\'t physically rotating — spin is a purely quantum property with no classical analogue. If an electron were actually spinning, its surface would need to move faster than light.',
            'Particles come in two types based on spin: Fermions (half-integer spin: $\\frac{1}{2}, \\frac{3}{2}, ...$) and Bosons (integer spin: $0, 1, 2, ...$). Fermions obey the Pauli Exclusion Principle (no two in the same state), while Bosons can pile up in the same state (enabling lasers and superfluids).',
            'Electron spin creates magnetic moments, making every electron a tiny magnet. The spin can be "up" ($+\\frac{1}{2}$) or "down" ($-\\frac{1}{2}$), and it\'s this binary nature that makes electrons perfect for representing the 1s and 0s of computing.',
            'Quantum spin is the basis of MRI (Magnetic Resonance Imaging). When hydrogen nuclei in your body are placed in a magnetic field, their spins align or anti-align. Radio pulses flip the spins, and the energy released as they relax back produces the medical image.'
        ],
        formulas: [
            { label: 'Spin Magnitude', latex: 'S = \\hbar \\sqrt{s(s+1)}' },
            { label: 'Magnetic Moment', latex: '\\mu = -g_s \\frac{e}{2m_e} S' }
        ],
        funFact: 'A full 360° rotation does NOT return a fermion to its original state — you have to rotate it 720° to get back to where you started. This is completely alien to everyday experience!'
    },

    // ── PARTICLE ACCELERATORS & COLLIDERS ───────────────────
    {
        id: 'hadron-colliders',
        title: 'Particle Accelerators & the LHC',
        category: 'Subatomic',
        description: 'The Large Hadron Collider is the most powerful microscope ever built, smashing protons together at near light-speed to reveal the fundamental building blocks of the universe.',
        details: [
            'The Large Hadron Collider (LHC) at CERN sits 100 meters underground beneath the Swiss-French border. Its 27-kilometer ring accelerates protons to 99.9999991% the speed of light — at this speed, a proton laps the ring 11,245 times per second.',
            'Inside the LHC, two beams of protons travel in opposite directions and collide head-on at four detector sites: ATLAS, CMS, ALICE, and LHCb. Each beam contains 2,808 bunches of 115 billion protons. At collision points, about 600 million proton-proton collisions happen every second.',
            'The collisions recreate conditions that existed just a trillionth of a second after the Big Bang. The total collision energy of 13.6 TeV (tera-electron-volts) is concentrated into a space smaller than a proton, creating temperatures 100,000 times hotter than the Sun\'s core.',
            'The LHC uses 1,232 superconducting dipole magnets cooled to -271.3°C (colder than outer space!) to bend the proton beams around the ring. The entire machine consumes about 200 megawatts of electricity — enough to power a small city.',
            'Before the LHC, earlier colliders made fundamental discoveries: the J/psi particle (1974), W and Z bosons at CERN\'s SPS (1983), and the top quark at Fermilab\'s Tevatron (1995). Each generation of colliders pushed deeper into matter\'s structure.'
        ],
        formulas: [
            { label: 'Relativistic Energy', latex: 'E = \\gamma mc^2 = \\frac{mc^2}{\\sqrt{1 - v^2/c^2}}' },
            { label: 'LHC Proton Energy', latex: 'E_{\\text{beam}} = 6.8 \\text{ TeV}' },
            { label: 'Luminosity', latex: 'L = \\frac{N_1 N_2 f n_b}{4\\pi \\sigma_x \\sigma_y}' }
        ],
        funFact: 'At full energy, each proton in the LHC has roughly the same kinetic energy as a flying mosquito — but compressed into a particle a trillion times smaller than a grain of sand!'
    },
    {
        id: 'higgs-field',
        title: 'The Higgs Boson & Higgs Field',
        category: 'Subatomic',
        description: 'The Higgs field pervades all of space, and particles that interact with it acquire mass. Its discovery in 2012 was the crowning achievement of particle physics.',
        details: [
            'The Higgs field is not like other fields — it has a nonzero value even in completely empty space. Imagine wading through an invisible syrup that fills the entire universe. Particles that interact strongly with this "syrup" (like the top quark) are heavy; particles that don\'t interact with it (like photons) are massless.',
            'The Higgs boson is a ripple in the Higgs field, just as a photon is a ripple in the electromagnetic field. It was discovered on July 4, 2012, by the ATLAS and CMS experiments at the LHC, after a 48-year search costing over $13 billion.',
            'The Higgs boson has a mass of about 125 GeV/c² — roughly 133 times heavier than a proton. It lives for only about 10⁻²² seconds before decaying into other particles (pairs of photons, W bosons, Z bosons, bottom quarks, or tau leptons).',
            'Peter Higgs and François Englert shared the 2013 Nobel Prize in Physics for predicting the mechanism. Higgs famously said he never expected it to be found in his lifetime. The discovery confirmed the last missing piece of the Standard Model.',
            'Without the Higgs field, the universe would be radically different: W and Z bosons would be massless, the weak force would have infinite range like electromagnetism, atoms could not form, and there would be no chemistry, no biology, no stars, and no you.'
        ],
        formulas: [
            { label: 'Higgs Mass', latex: 'm_H \\approx 125.1 \\text{ GeV}/c^2' },
            { label: 'Higgs Potential', latex: 'V(\\phi) = -\\mu^2 |\\phi|^2 + \\lambda |\\phi|^4' },
            { label: 'Vacuum Expectation Value', latex: 'v = \\frac{\\mu}{\\sqrt{\\lambda}} \\approx 246 \\text{ GeV}' }
        ],
        funFact: 'The Higgs boson is sometimes called the "God Particle" — but the original name proposed by physicist Leon Lederman was "The Goddamn Particle" because it was so hard to find. His publisher shortened it!'
    },
    {
        id: 'quark-gluon-plasma',
        title: 'Quark-Gluon Plasma',
        category: 'Subatomic',
        description: 'At extreme temperatures, protons and neutrons melt into a "soup" of free quarks and gluons — the state of matter that existed microseconds after the Big Bang.',
        details: [
            'Normally, quarks are permanently confined inside protons and neutrons by the strong force. But at temperatures above ~2 trillion degrees Celsius (about 150,000 times the Sun\'s core), the quarks break free and form a Quark-Gluon Plasma (QGP) — a completely new state of matter.',
            'QGP was first created on Earth at the Relativistic Heavy Ion Collider (RHIC) at Brookhaven in 2005, and later studied at the LHC\'s ALICE experiment by colliding lead nuclei at near light-speed. The resulting fireball, though microscopic, reached the hottest temperatures ever produced in a laboratory.',
            'Surprisingly, QGP behaves as a nearly "perfect liquid" with almost zero viscosity — it flows more freely than any known substance. This was unexpected because physicists predicted it would be a gas. It has the lowest ratio of viscosity to entropy density of any fluid ever observed.',
            'The entire universe was in a Quark-Gluon Plasma state for about the first 10 microseconds after the Big Bang. As the universe cooled, quarks and gluons condensed into protons and neutrons in a process called "hadronization." Understanding QGP helps us understand the birth of all matter.'
        ],
        formulas: [
            { label: 'Critical Temperature', latex: 'T_c \\approx 1.7 \\times 10^{12} \\text{ K} \\approx 170 \\text{ MeV}' },
            { label: 'Energy Density', latex: '\\epsilon_c \\approx 1 \\text{ GeV/fm}^3' }
        ],
        funFact: 'A teaspoon of Quark-Gluon Plasma would weigh about 40 billion tons — the same as a small mountain!'
    },
    {
        id: 'neutrinos',
        title: 'Neutrinos — Ghost Particles',
        category: 'Subatomic',
        description: 'Trillions of these nearly massless, almost invisible particles pass through your body every second without you noticing.',
        details: [
            'Neutrinos are the most elusive particles in nature. They interact only via the weak force and gravity, with no electric charge and nearly zero mass. About 65 billion neutrinos from the Sun pass through every square centimeter of your skin every second — day and night (they go straight through the Earth at night).',
            'Neutrinos come in three "flavors": electron, muon, and tau — one paired with each type of charged lepton. In one of the most surprising discoveries in particle physics, neutrinos spontaneously change between these flavors as they travel — a phenomenon called "neutrino oscillation."',
            'Neutrino oscillation proved that neutrinos have mass, which the original Standard Model said shouldn\'t happen. This discovery by the Super-Kamiokande (Japan) and SNO (Canada) experiments earned Takaaki Kajita and Arthur McDonald the 2015 Nobel Prize.',
            'To detect neutrinos, you need extraordinary detectors. IceCube at the South Pole uses a cubic kilometer of Antarctic ice instrumented with 5,160 optical sensors. Super-Kamiokande in Japan uses 50,000 tons of ultra-pure water lined with 11,146 photomultiplier tubes.',
            'Neutrinos may hold the key to why the universe is made of matter instead of antimatter. If neutrinos and antineutrinos oscillate differently (called "CP violation in the lepton sector"), it could explain the matter-antimatter asymmetry of the universe.'
        ],
        formulas: [
            { label: 'Oscillation Probability', latex: 'P(\\nu_\\alpha \\to \\nu_\\beta) = \\sin^2(2\\theta) \\sin^2\\left(\\frac{\\Delta m^2 L}{4E}\\right)' },
            { label: 'Mass Upper Bound', latex: 'm_\\nu < 0.8 \\text{ eV}/c^2' }
        ],
        funFact: 'A neutrino produced at CERN could pass through a wall of lead stretching from Earth to the nearest star (4.2 light-years of solid lead!) and still have a 50% chance of making it through without interacting!'
    },
    {
        id: 'nuclear-reactions',
        title: 'Nuclear Fusion & Fission',
        category: 'Nuclear',
        description: 'The two types of nuclear reactions that power stars and nuclear reactors — splitting heavy atoms and combining light ones.',
        details: [
            'Nuclear fission splits heavy nuclei (like Uranium-235 or Plutonium-239) into lighter fragments, releasing enormous energy. When a neutron strikes U-235, the nucleus splits into two smaller nuclei plus 2-3 additional neutrons, which can trigger more fissions — a chain reaction.',
            'Nuclear fusion combines light nuclei (usually hydrogen isotopes) into heavier ones. The Sun fuses 600 million tons of hydrogen into helium every second, converting 4 million tons of mass into energy via E=mc². This process has been running for 4.6 billion years and will continue for another 5 billion.',
            'The pp-chain (proton-proton chain) powers our Sun: four protons are fused step-by-step into one helium-4 nucleus, two positrons, two neutrinos, and gamma rays. The first step requires quantum tunneling and the weak force — making it incredibly slow (a proton waits an average of 9 billion years to fuse!).',
            'Controlled fusion on Earth (like ITER in France, or NIF\'s laser approach) aims to replicate the Sun\'s process. In December 2022, the National Ignition Facility achieved "fusion ignition" — producing more energy from fusion than the laser energy used to trigger it — a historic first.',
            'Heavier stars can fuse elements up to Iron (Fe-56) in their cores. Elements heavier than iron are forged only in the extreme environments of supernovae and neutron star mergers — every gold and platinum atom on Earth was created in one of these cataclysmic events.'
        ],
        formulas: [
            { label: 'Fission Reaction (U-235)', latex: '^{235}_{92}U + ^1_0n \\to ^{141}_{56}Ba + ^{92}_{36}Kr + 3^1_0n + 200 \\text{ MeV}' },
            { label: 'Fusion (pp-chain net)', latex: '4^1_1H \\to ^4_2He + 2e^+ + 2\\nu_e + 26.7 \\text{ MeV}' },
            { label: 'Lawson Criterion', latex: 'n T \\tau_E > 3 \\times 10^{21} \\text{ keV s m}^{-3}' }
        ],
        funFact: 'The energy released by fusing just 1 kg of deuterium (extractable from 30 liters of seawater) equals the energy from burning 10,000 tons of coal!',
        exhibits: [
            { label: 'Simulate Stellar Core (Iron Gas)', actionType: 'set_material', payload: { elementRef: 'Fe', material: 'gas' } }
        ]
    },
    {
        id: 'quantum-entanglement',
        title: 'Quantum Entanglement',
        category: 'Quantum',
        description: 'Two entangled particles share a connection so deep that measuring one instantly determines the state of the other, regardless of the distance between them.',
        details: [
            'When two particles become entangled, their quantum states are linked: they must be described as a single system, not two independent particles. Measuring the spin of one entangled electron immediately tells you the spin of the other — even if it\'s on the other side of the universe.',
            'Einstein called entanglement "spooky action at a distance" and argued it proved quantum mechanics was incomplete (the EPR paradox, 1935). He believed there must be hidden variables predetermining the outcomes. But in 1964, John Bell showed that no hidden variable theory could reproduce all quantum predictions.',
            'Alain Aspect\'s experiments (1981-1982) confirmed Bell\'s prediction: entanglement is real, and no local hidden variables exist. This work, along with John Clauser and Anton Zeilinger\'s contributions, earned them the 2022 Nobel Prize in Physics.',
            'Entanglement does NOT allow faster-than-light communication. While the correlation is instantaneous, you cannot control which outcome you get — the results look random until you compare notes with the other observer (which requires classical communication).',
            'Quantum entanglement is the foundation of quantum computing, quantum cryptography, and quantum teleportation. China\'s Micius satellite demonstrated entanglement over 1,200 km in 2017, and quantum-encrypted communication networks are already in use.'
        ],
        formulas: [
            { label: 'Bell State (Entangled Pair)', latex: '|\\Psi^-\\rangle = \\frac{1}{\\sqrt{2}}(|\\uparrow\\downarrow\\rangle - |\\downarrow\\uparrow\\rangle)' },
            { label: 'Bell Inequality', latex: 'S = |E(a,b) - E(a,b\')| + |E(a\',b) + E(a\',b\')| \\leq 2' }
        ],
        funFact: 'Entangled photons have been used to "teleport" quantum states across 1,400 km from ground to satellite — though no actual matter moves, only quantum information!'
    },
    {
        id: 'quantum-field-theory',
        title: 'Quantum Field Theory',
        category: 'Quantum',
        description: 'In our deepest understanding of nature, particles are not tiny balls — they are excitations (ripples) in underlying quantum fields that fill all of space.',
        details: [
            'Quantum Field Theory (QFT) is the framework that combines quantum mechanics with special relativity. In QFT, the fundamental entities are fields — the electron field, the photon field, the quark field, etc. — and what we call "particles" are localized vibrations in these fields, like waves on an ocean.',
            'Every point in space contains all quantum fields simultaneously. An electron is a ripple in the electron field; a photon is a ripple in the electromagnetic field. Particle creation and destruction (as in collider experiments) is simply energy flowing between fields.',
            'Virtual particles are temporary fluctuations in quantum fields, permitted by the energy-time uncertainty relation. The vacuum is not truly empty — it seethes with virtual particle-antiparticle pairs constantly popping in and out of existence. This "quantum foam" gives rise to measurable effects like the Casimir force and the Lamb shift.',
            'Renormalization was the key breakthrough that made QFT workable. Early calculations gave infinite results, but Feynman, Schwinger, and Tomonaga showed how to systematically absorb these infinities into redefinitions of mass and charge. The resulting theory — Quantum Electrodynamics (QED) — agrees with experiment to 12 decimal places, making it the most precise theory ever created.'
        ],
        formulas: [
            { label: 'QED Anomalous Magnetic Moment', latex: 'g_e/2 = 1.001\\,159\\,652\\,180\\,73(28)' },
            { label: 'Casimir Force', latex: 'F = -\\frac{\\pi^2 \\hbar c}{240 d^4} A' }
        ],
        funFact: 'QED predicts the electron\'s magnetic moment to over 10 significant figures — and experiments agree perfectly. No other theory in all of science has been tested to such extraordinary precision!'
    },
    {
        id: 'neutron-stars',
        title: 'Neutron Stars & Exotic Matter',
        category: 'Nuclear',
        description: 'When massive stars die, gravity crushes their cores into objects so dense that a teaspoon would weigh a billion tons — and the physics inside pushes the limits of our understanding.',
        details: [
            'A neutron star forms when a star 10-25 times the mass of the Sun exhausts its nuclear fuel and collapses. The protons and electrons in the core are squeezed together so tightly that they fuse into neutrons (via the weak force: $p + e^- \\\\to n + \\\\nu_e$). The result is essentially a giant atomic nucleus, 20 km across.',
            'Neutron stars are incredibly extreme: their density is about 10¹⁷ kg/m³ (a sugar cube weighs 1 billion tons), their surface gravity is 2 × 10¹¹ times Earth\'s, and some spin up to 716 times per second (pulsars). Their magnetic fields can be a trillion times stronger than Earth\'s.',
            'The interior of a neutron star may contain exotic states of matter never seen on Earth: superfluid neutrons, superconducting protons, a "nuclear pasta" layer of exotic shapes (gnocchi, spaghetti, lasagna — yes, really!), and possibly a core of free quarks — a Quark Star.',
            'In 2017, LIGO and Virgo detected gravitational waves from two neutron stars colliding (GW170817). The merger was also observed across the electromagnetic spectrum, confirming that neutron star mergers create heavy elements like gold and platinum, and produce short gamma-ray bursts.',
            'If a neutron star is massive enough (above ~2.1 solar masses), it collapses into a black hole. The exact boundary is one of the most active research topics in nuclear and gravitational physics.'
        ],
        formulas: [
            { label: 'Neutron Star Mass Limit', latex: 'M_{\\text{TOV}} \\approx 2.1 M_\\odot' },
            { label: 'Electron Capture', latex: 'p + e^- \\to n + \\nu_e' }
        ],
        funFact: 'A neutron star\'s surface is so smooth that the tallest "mountains" are only about 5 mm high — any taller and the immense gravity would crush them flat!'
    },

    // ── CLASSIC EXPERIMENTS ──────────────────────────────────
    {
        id: 'gold-foil-experiment',
        title: 'Rutherford Gold Foil Experiment',
        category: 'Atomic',
        description: 'The beautiful 1909 experiment that proved the atom is mostly empty space and discovered the atomic nucleus.',
        details: [
            'Before 1909, scientists believed the "Plum Pudding" model: atoms were a soup of positive charge with negative electrons seemingly scattered throughout.',
            'Ernest Rutherford, along with Geiger and Marsden, fired high-speed alpha particles (helium nuclei) at a remarkably thin sheet of solid gold.',
            'They expected the heavy alpha particles to punch right through the "plum pudding". Most did. But incredibly, a few bounced almost straight back! Rutherford famously said: "It was as if you fired a 15-inch shell at a piece of tissue paper and it came back and hit you."',
            'This led to a paradigm shift: all the positive charge and almost all the mass of an atom is concentrated in a tiny central nucleus, 100,000 times smaller than the atom itself. The rest is completely empty space.'
        ],
        formulas: [
            { label: 'Alpha Scattering Angle', latex: '\\Delta \\theta \\approx \\frac{z Z e^2}{4\\pi\\epsilon_0 K b}' }
        ],
        funFact: 'Gold was used because it is immensely malleable. The foil was pounded so thin it was barely a few hundred atoms thick!',
        exhibits: [
            { label: 'Load Solid Gold (Au) Exhibit', actionType: 'load_molecule', payload: 'gold' }
        ]
    },
    {
        id: 'double-slit-experiment',
        title: 'Young\'s Double-Slit Experiment',
        category: 'Quantum',
        description: 'The single most famous experiment in quantum physics, demonstrating the bizarre wave-particle duality of matter and light.',
        details: [
            'Thomas Young first performed this with light in 1801, proving light is a wave because the two slits create an interference pattern on the screen (stripes of light and dark).',
            'In the 20th century, physicists fired individual electrons through the slits ONE AT A TIME. Astonishingly, over time, the single electrons built up the exact same wave interference pattern! Each electron was somehow passing through BOTH slits simultaneously and interfering with itself.',
            'However, if you place a detector at the slits to see *which* slit the electron goes through, the wave function collapses! The electron acts like a normal particle, and the interference pattern vanishes. The act of observation literally changes physical reality.',
            'This experiment forces us to accept that reality at the quantum scale behaves fundamentally as probability waves until a measurement is made.'
        ],
        formulas: [
            { label: 'Interference Fringes', latex: 'y = \\frac{\\lambda L}{d}' },
            { label: 'De Broglie Wavelength', latex: '\\lambda = \\frac{h}{p}' }
        ],
        funFact: 'Richard Feynman said that the double-slit experiment contains the ONLY mystery of quantum mechanics.'
    },
    {
        id: 'schrodingers-cat',
        title: 'Schrödinger\'s Cat',
        category: 'Quantum',
        description: 'A famous thought experiment illustrating the paradox of quantum superposition applied to everyday objects.',
        details: [
            'Erwin Schrödinger proposed this in 1935 to highlight how bizarre quantum mechanics is. A cat is placed in a sealed steel box with a radioactive atom, a Geiger counter, and a vial of poison gas.',
            'If the atom decays, the counter triggers a hammer that smashes the vial, killing the cat. If it doesn\'t decay, the cat lives.',
            'According to quantum mechanics, until the box is opened and an observation is made, the radioactive atom exists in a "superposition" — it is simultaneously decayed AND not decayed.',
            'Therefore, the entire system is in superposition. The cat is both dead AND alive at the same time until the box is opened! The act of looking forces reality to pick one state.'
        ],
        formulas: [
            { label: 'Superposition State', latex: '|\\psi\\rangle = \\frac{1}{\\sqrt{2}} |\\text{Alive}\\rangle + \\frac{1}{\\sqrt{2}} |\\text{Dead}\\rangle' }
        ],
        funFact: 'Schrödinger didn\'t propose the cat experiment to support quantum mechanics — he proposed it to show how absurd the theory seemed when scaled up to everyday life!'
    }
];

// Two knowledge-check questions per topic, keyed by topic id. Turns passive reading into active recall.
export const QUIZ_BANK: Record<string, QuizQuestion[]> = {
    'atomic-structure': [
        {
            question: 'What determines which element an atom is?',
            options: ['Number of neutrons', 'Number of protons', 'Number of electrons', 'Atomic mass'],
            correctIndex: 1,
            explanation: 'The atomic number — the count of protons — defines the element. Change it, and you get a different element entirely.'
        },
        {
            question: "Roughly how much of an atom's volume is occupied by mass versus empty space?",
            options: ['Mostly solid, like a pool ball', 'Overwhelmingly empty space', 'Exactly half and half', 'It depends on temperature'],
            correctIndex: 1,
            explanation: "If a hydrogen nucleus were a basketball, its electron would orbit about 3 km away — atoms are almost entirely empty space."
        }
    ],
    'electron-orbitals': [
        {
            question: 'What shape is an s orbital?',
            options: ['Dumbbell-shaped', 'Spherical', 'Cloverleaf-shaped', 'Donut-shaped'],
            correctIndex: 1,
            explanation: 's orbitals are spherical probability clouds; p orbitals are dumbbell-shaped and d orbitals are cloverleaf-shaped.'
        },
        {
            question: 'Per the Pauli Exclusion Principle, how many electrons can occupy one orbital?',
            options: ['1', '2 (opposite spins)', '4', '8'],
            correctIndex: 1,
            explanation: 'No two electrons in an atom can share the same set of quantum numbers, capping each orbital at 2 electrons with opposite spin.'
        }
    ],
    'periodic-table': [
        {
            question: 'Why do elements in the same column (group) share similar chemical properties?',
            options: ['They have the same atomic mass', 'They have the same number of outer-shell electrons', 'They were discovered the same year', 'They have the same number of neutrons'],
            correctIndex: 1,
            explanation: 'Outer-shell ("valence") electron count drives chemical behavior, and elements in a group share that count.'
        },
        {
            question: 'How does electronegativity generally trend across the periodic table?',
            options: ['Increases left→right and bottom→top', 'Increases left→right, decreases bottom→top', 'Decreases left→right, increases bottom→top', 'It has no consistent pattern'],
            correctIndex: 0,
            explanation: 'Electronegativity rises toward the top-right of the table — fluorine, in the top-right corner, is the most electronegative element.'
        }
    ],
    isotopes: [
        {
            question: 'What differs between isotopes of the same element?',
            options: ['Number of protons', 'Number of neutrons', 'Number of electrons in a neutral atom', 'Nuclear charge'],
            correctIndex: 1,
            explanation: 'Isotopes share the same proton count (same element) but differ in neutron count, giving different masses.'
        },
        {
            question: "What does Carbon-14 dating actually measure?",
            options: ['The ratio of remaining Carbon-14 to Carbon-12', "The fossil's color", 'The number of protons lost', "The rock layer's depth"],
            correctIndex: 0,
            explanation: 'Carbon-14 decays at a known rate (half-life 5,730 years), so the remaining ratio reveals time since death.'
        }
    ],
    'chemical-bonding': [
        {
            question: 'In an ionic bond like NaCl, what happens to electrons?',
            options: ['They are shared equally', 'They transfer from one atom to another', 'They are removed from both atoms', 'Nothing happens to them'],
            correctIndex: 1,
            explanation: 'Sodium donates its outer electron to chlorine, creating Na⁺ and Cl⁻ ions that attract each other.'
        },
        {
            question: 'Why do metals conduct electricity so well?',
            options: ['A rigid lattice with no free electrons', 'A "sea" of delocalized electrons that flow freely', 'Ionic bonds between metal atoms', 'Covalent sharing of protons'],
            correctIndex: 1,
            explanation: 'Metallic bonding shares a sea of delocalized electrons across the whole structure, letting current flow easily.'
        }
    ],
    'states-of-matter': [
        {
            question: 'What primarily determines whether a substance is solid, liquid, or gas?',
            options: ['Its color', 'The balance between kinetic energy and intermolecular forces', 'Its atomic number', 'Its electric charge'],
            correctIndex: 1,
            explanation: 'When kinetic energy overcomes intermolecular forces, particles break free of fixed positions — solid → liquid → gas.'
        },
        {
            question: 'What state forms when atoms merge into a single quantum state near absolute zero?',
            options: ['Plasma', 'Bose-Einstein Condensate', 'Supercritical fluid', 'Amorphous solid'],
            correctIndex: 1,
            explanation: 'A Bose-Einstein Condensate forms when atoms lose enough energy to collapse into one shared quantum ground state.'
        }
    ],
    'molecular-geometry': [
        {
            question: 'Why is a water molecule bent rather than linear?',
            options: [
                "Oxygen's two lone electron pairs push the hydrogens closer together",
                'Hydrogen atoms repel each other strongly',
                'It formed under high pressure',
                'Water has no fixed shape'
            ],
            correctIndex: 0,
            explanation: "Oxygen's lone pairs take up space around the central atom, bending the H-O-H angle to about 104.5°."
        },
        {
            question: 'What theory predicts molecular shapes from electron-pair repulsion?',
            options: ['Quantum Field Theory', 'VSEPR Theory', 'The Standard Model', 'Bohr Theory'],
            correctIndex: 1,
            explanation: 'VSEPR (Valence Shell Electron Pair Repulsion) says electron pairs arrange to be as far apart as possible.'
        }
    ],
    quarks: [
        {
            question: 'What quarks make up a proton?',
            options: ['uud', 'udd', 'uuu', 'ddd'],
            correctIndex: 0,
            explanation: 'Two Up quarks (+2/3 each) and one Down quark (−1/3) sum to a charge of +1 — a proton.'
        },
        {
            question: "What is 'Color Confinement'?",
            options: [
                'Quarks change color when heated',
                'Quarks can never be observed in isolation',
                'Only red quarks exist in nature',
                'Quarks lose charge over time'
            ],
            correctIndex: 1,
            explanation: 'Pulling a quark away creates enough energy to spawn a new quark-antiquark pair before it can escape alone.'
        }
    ],
    'strong-force': [
        {
            question: 'What particle carries the Strong Nuclear Force?',
            options: ['Photon', 'Gluon', 'W boson', 'Graviton'],
            correctIndex: 1,
            explanation: 'Gluons mediate the strong force between quarks, similar to how photons mediate electromagnetism.'
        },
        {
            question: "What is 'Asymptotic Freedom'?",
            options: [
                'Quarks move almost freely at short range but are bound tightly at long range',
                'Quarks are always completely free',
                'The strong force weakens with mass',
                'Gluons are massless at every distance'
            ],
            correctIndex: 0,
            explanation: 'Unlike gravity or electromagnetism, the strong force gets stronger with distance — like stretching a rubber band.'
        }
    ],
    'weak-force': [
        {
            question: 'What can the Weak Force uniquely do that other forces cannot?',
            options: ['Change the flavor of quarks', 'Attract opposite electric charges', 'Hold the nucleus together', 'Create gravity'],
            correctIndex: 0,
            explanation: 'In beta decay, the Weak Force converts a down quark into an up quark (or vice versa), transmuting the nucleus.'
        },
        {
            question: 'What did the 1957 Wu experiment reveal about the Weak Force?',
            options: ['It has infinite range', 'It violates parity (mirror) symmetry', "It doesn't actually exist", "It's stronger than the strong force"],
            correctIndex: 1,
            explanation: 'Chien-Shiung Wu showed the Weak Force behaves differently in a mirror-reflected universe — a huge surprise in 1957.'
        }
    ],
    'standard-model': [
        {
            question: 'Which particle gives mass to the W and Z bosons?',
            options: ['The photon', 'The Higgs boson', 'The gluon', 'The graviton'],
            correctIndex: 1,
            explanation: 'The Higgs mechanism, via the Higgs field, is what gives the W and Z bosons (and other particles) their mass.'
        },
        {
            question: 'Which fundamental force is NOT included in the Standard Model?',
            options: ['Electromagnetism', 'Strong force', 'Weak force', 'Gravity'],
            correctIndex: 3,
            explanation: 'Gravity is described separately by General Relativity — unifying it with quantum mechanics remains unsolved.'
        }
    ],
    antimatter: [
        {
            question: 'Who first predicted the existence of antimatter?',
            options: ['Albert Einstein', 'Paul Dirac', 'Niels Bohr', 'Werner Heisenberg'],
            correctIndex: 1,
            explanation: "Dirac's 1928 equation had a second solution — a positively charged electron — leading to the discovery of the positron in 1932."
        },
        {
            question: 'What happens when a particle meets its antiparticle?',
            options: ['They merge into a heavier particle', 'They annihilate into energy', 'They pass through each other', 'They form a black hole'],
            correctIndex: 1,
            explanation: 'All their mass converts to energy via E=mc² — a small amount of antimatter releases an enormous amount of energy.'
        }
    ],
    'nuclear-forces': [
        {
            question: 'Which nucleus has the highest binding energy per nucleon?',
            options: ['Hydrogen-1', 'Iron-56', 'Uranium-235', 'Helium-4'],
            correctIndex: 1,
            explanation: 'Iron-56 sits at the peak of the binding-energy curve — fusing lighter elements or splitting heavier ones both release energy relative to it.'
        },
        {
            question: 'Elements lighter than iron release energy through which process?',
            options: ['Fission', 'Fusion', 'Radioactive decay only', 'Electron capture'],
            correctIndex: 1,
            explanation: 'Fusing light nuclei together (as stars do with hydrogen) releases energy because the products sit lower on the binding-energy curve.'
        }
    ],
    'wave-particle-duality': [
        {
            question: 'What happens in the double-slit experiment when you detect which slit an electron used?',
            options: ['Nothing changes', 'The interference pattern disappears', 'The electron disappears', 'The electron speeds up'],
            correctIndex: 1,
            explanation: 'Measuring which path collapses the wave function — the electron then behaves like a classical particle, and the interference vanishes.'
        },
        {
            question: 'Who proposed that all matter has an associated wavelength?',
            options: ['Louis de Broglie', 'Max Planck', 'Erwin Schrödinger', 'Niels Bohr'],
            correctIndex: 0,
            explanation: "De Broglie's 1924 hypothesis — that matter has wave properties — was later confirmed for electrons, atoms, and even large molecules."
        }
    ],
    'uncertainty-principle': [
        {
            question: "What does Heisenberg's Uncertainty Principle say about position and momentum?",
            options: [
                'Both can be measured precisely with a good enough instrument',
                'The more precisely one is known, the less precisely the other can be known',
                'They are unrelated quantities',
                'It only applies to large objects'
            ],
            correctIndex: 1,
            explanation: "This isn't a measurement limitation — it's a fundamental property of quantum systems, not a flaw in our instruments."
        },
        {
            question: "What lets 'virtual particles' briefly pop into existence, borrowing energy from the vacuum?",
            options: ['The Pauli Exclusion Principle', 'The Energy-Time Uncertainty Relation', "Newton's Third Law", 'Conservation of charge'],
            correctIndex: 1,
            explanation: 'ΔE·Δt ≥ ħ/2 permits brief energy "loans" from the vacuum, long enough for virtual particles to flicker into being.'
        }
    ],
    'quantum-tunneling': [
        {
            question: 'What natural process critically depends on quantum tunneling?',
            options: ['Photosynthesis alone', "Nuclear fusion in the Sun's core", 'Radio wave transmission', 'Gravity'],
            correctIndex: 1,
            explanation: "Protons in the Sun's core don't have enough classical energy to fuse — they tunnel through the Coulomb barrier instead."
        },
        {
            question: 'How does tunneling probability change as a barrier gets wider?',
            options: ['It increases', 'It decreases exponentially', "It's unaffected by width", 'It only depends on temperature'],
            correctIndex: 1,
            explanation: 'Tunneling probability falls off exponentially with barrier width — why macroscopic objects never tunnel through walls.'
        }
    ],
    spin: [
        {
            question: 'Is an electron literally spinning like a tiny top?',
            options: ['Yes, it physically rotates', 'No — spin is a quantum property with no classical analogue', 'Only at high energies', 'Only inside strong magnetic fields'],
            correctIndex: 1,
            explanation: "If an electron were truly spinning at its size, its surface would need to move faster than light — spin is purely quantum."
        },
        {
            question: 'Which medical imaging technique relies directly on quantum spin?',
            options: ['X-ray', 'MRI', 'Ultrasound', 'CT scan'],
            correctIndex: 1,
            explanation: "MRI flips the spins of hydrogen nuclei with radio pulses and images the energy released as they relax back."
        }
    ],
    'hadron-colliders': [
        {
            question: 'Approximately how fast do protons travel inside the LHC?',
            options: ['Half the speed of light', '99.9999991% the speed of light', 'The speed of sound', '10% the speed of light'],
            correctIndex: 1,
            explanation: 'At that speed, a proton laps the 27 km ring over 11,000 times per second.'
        },
        {
            question: 'What conditions do LHC collisions recreate?',
            options: ['Conditions deep inside the Earth', 'Conditions just after the Big Bang', 'Ordinary room-temperature chemistry', 'Standard combustion'],
            correctIndex: 1,
            explanation: 'The concentrated collision energy briefly recreates temperatures and densities last seen a trillionth of a second after the Big Bang.'
        }
    ],
    'higgs-field': [
        {
            question: 'What gives particles like the top quark their mass, per the Higgs mechanism?',
            options: ['Interaction with the Higgs field', 'Their electric charge', 'Their spin', 'Gravity alone'],
            correctIndex: 0,
            explanation: 'Particles that interact strongly with the ever-present Higgs field are heavy; those that barely interact (like photons) stay massless.'
        },
        {
            question: 'In what year was the Higgs boson experimentally discovered?',
            options: ['1964', '1983', '2012', '1998'],
            correctIndex: 2,
            explanation: 'Predicted in 1964, it took until 2012 and the construction of the LHC to finally confirm the Higgs boson.'
        }
    ],
    'quark-gluon-plasma': [
        {
            question: "What happens to quarks at temperatures around 2 trillion °C?",
            options: ['They freeze in place', 'They break free of confinement, forming a plasma', 'They turn into photons', 'They vanish entirely'],
            correctIndex: 1,
            explanation: 'Above this critical temperature, quarks and gluons are no longer confined inside protons and neutrons.'
        },
        {
            question: 'How does Quark-Gluon Plasma behave, surprisingly?',
            options: ['Like a high-viscosity gas', 'Like a nearly perfect liquid with almost zero viscosity', 'Like a rigid solid', "It doesn't flow at all"],
            correctIndex: 1,
            explanation: 'Physicists expected a gas-like state, but QGP flows almost frictionlessly — among the least viscous fluids ever observed.'
        }
    ],
    neutrinos: [
        {
            question: 'What surprising behavior do neutrinos exhibit as they travel?',
            options: ['They change speed randomly', 'They oscillate between different flavors', 'They split into two neutrinos', 'They emit visible light'],
            correctIndex: 1,
            explanation: "Neutrino oscillation proved neutrinos have mass — something the original Standard Model didn't predict."
        },
        {
            question: 'Roughly how many solar neutrinos pass through one square centimeter of your skin every second?',
            options: ['A few hundred', 'About 65 billion', 'Essentially zero', 'Around 1 million'],
            correctIndex: 1,
            explanation: "Neutrinos interact so weakly that ~65 billion pass through you every second, day and night, without you noticing."
        }
    ],
    'nuclear-reactions': [
        {
            question: 'How does the Sun primarily produce its energy?',
            options: ['Fission of uranium', 'Fusion of hydrogen into helium', 'Burning hydrogen gas chemically', 'Radioactive decay of iron'],
            correctIndex: 1,
            explanation: 'The pp-chain fuses four protons into helium-4, converting mass to energy via E=mc² at a staggering rate.'
        },
        {
            question: 'What happens when a neutron strikes a Uranium-235 nucleus?',
            options: ['It fuses with the uranium atom', 'The nucleus splits into smaller nuclei plus extra neutrons', 'It captures an electron', 'It emits only light'],
            correctIndex: 1,
            explanation: 'The released neutrons can strike other U-235 nuclei, triggering a self-sustaining chain reaction.'
        }
    ],
    'quantum-entanglement': [
        {
            question: 'What did Einstein famously call quantum entanglement?',
            options: ['A beautiful mystery', 'Spooky action at a distance', 'Impossible physics', 'A mathematical error'],
            correctIndex: 1,
            explanation: 'Einstein argued entanglement implied hidden variables; Bell\'s theorem later showed no such local hidden-variable theory can work.'
        },
        {
            question: 'Does entanglement allow faster-than-light communication?',
            options: ['Yes, information travels instantly', 'No — you still need classical communication to compare results', 'Only over short distances', 'Only with photons'],
            correctIndex: 1,
            explanation: "The correlation is instant, but the outcomes look random until compared via an ordinary (light-speed-limited) channel."
        }
    ],
    'quantum-field-theory': [
        {
            question: "In Quantum Field Theory, what is a 'particle' fundamentally?",
            options: ['A tiny solid ball', 'A localized excitation (ripple) in a quantum field', 'An empty point in space', 'A wave in the air'],
            correctIndex: 1,
            explanation: 'An electron is a ripple in the electron field; a photon is a ripple in the electromagnetic field — fields are what\'s truly fundamental.'
        },
        {
            question: 'What breakthrough tamed the infinite results in early QFT calculations?',
            options: ['Renormalization', 'Quantization', 'Superposition', 'Entanglement'],
            correctIndex: 0,
            explanation: 'Feynman, Schwinger, and Tomonaga showed how to systematically absorb infinities into redefinitions of mass and charge.'
        }
    ],
    'neutron-stars': [
        {
            question: 'What do protons and electrons get squeezed into when a neutron star forms?',
            options: ['Quarks', 'Neutrons', 'Photons', 'Gluons'],
            correctIndex: 1,
            explanation: 'Under extreme gravity, protons and electrons fuse via the weak force (p + e⁻ → n + ν) into a giant ball of neutrons.'
        },
        {
            question: 'What 2017 event (GW170817) confirmed neutron star mergers forge heavy elements like gold?',
            options: ['The Higgs boson discovery', 'A gravitational wave detection from a neutron star merger', 'The discovery of the top quark', 'The first exoplanet detection'],
            correctIndex: 1,
            explanation: 'LIGO/Virgo detected gravitational waves from the merger, later confirmed across the electromagnetic spectrum too.'
        }
    ],
    'gold-foil-experiment': [
        {
            question: "What surprising result did Rutherford's team observe firing alpha particles at gold foil?",
            options: ['All particles passed straight through', 'A few particles bounced almost straight back', 'All particles were absorbed', 'The foil melted instantly'],
            correctIndex: 1,
            explanation: 'Rutherford compared it to firing a shell at tissue paper and having it bounce back — utterly unexpected under the old "plum pudding" model.'
        },
        {
            question: "What did the gold foil experiment reveal about atomic structure?",
            options: ['Atoms are solid all the way through', 'Atoms have a tiny, dense, positively charged nucleus', 'Electrons are heavier than protons', 'Atoms carry no charge at all'],
            correctIndex: 1,
            explanation: 'The rare sharp deflections meant nearly all the mass and positive charge is concentrated in a nucleus 100,000× smaller than the atom.'
        }
    ],
    'double-slit-experiment': [
        {
            question: 'What pattern do unobserved electrons build up when fired one at a time through two slits?',
            options: ['A single line', 'An interference pattern, as if each passed through both slits', 'A random splatter', 'No pattern at all'],
            correctIndex: 1,
            explanation: 'Each electron interferes with itself as a wave — until you try to observe which slit it took.'
        },
        {
            question: 'According to Feynman, the double-slit experiment contains the only mystery of what field?',
            options: ['Chemistry', 'Quantum mechanics', 'Classical mechanics', 'Thermodynamics'],
            correctIndex: 1,
            explanation: 'Feynman considered it the essential puzzle that captures everything strange about quantum behavior.'
        }
    ],
    'schrodingers-cat': [
        {
            question: "What is the cat's state, per quantum mechanics, before the box is opened?",
            options: ['Definitely alive', 'Definitely dead', 'Simultaneously alive and dead (superposition)', 'The cat is not in the box'],
            correctIndex: 2,
            explanation: 'Since the triggering atom is in superposition, the entire system — including the cat — is described as being in superposition too.'
        },
        {
            question: 'Why did Schrödinger propose this thought experiment?',
            options: ['To prove quantum mechanics was correct', 'To show how absurd quantum mechanics seemed when scaled up to everyday objects', 'To design a real, practical experiment', 'To study cat behavior'],
            correctIndex: 1,
            explanation: 'It was meant as a critique — highlighting how strange superposition sounds once applied beyond the subatomic scale.'
        }
    ]
};
