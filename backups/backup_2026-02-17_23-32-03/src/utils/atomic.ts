export function calculateElectronShells(atomicNumber: number): number[] {
    const maxElectronsPerShell = [2, 8, 18, 32, 50, 72, 98];
    const shells: number[] = [];
    let remaining = atomicNumber;

    for (const max of maxElectronsPerShell) {
        if (remaining <= 0) break;
        const inShell = Math.min(remaining, max);
        shells.push(inShell);
        remaining -= inShell;
    }
    return shells;
}
