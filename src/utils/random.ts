// Deterministic pseudo-random hash in [0, 1), used in place of Math.random()
// for one-time layout generation inside useMemo. Math.random() is impure and
// is disallowed during render by the react-hooks/purity rule.
export function seededRandom(seed: number): number {
    const x = Math.sin(seed) * 43758.5453123;
    return x - Math.floor(x);
}
