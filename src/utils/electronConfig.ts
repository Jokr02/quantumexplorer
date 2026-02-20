/**
 * Electron configuration and emission spectrum utilities for the atomic view.
 */

const SUBSHELL_ORDER = [
    '1s', '2s', '2p', '3s', '3p', '4s', '3d', '4p', '5s', '4d',
    '5p', '6s', '4f', '5d', '6p', '7s', '5f', '6d', '7p'
];

const SUBSHELL_MAX: Record<string, number> = {
    s: 2, p: 6, d: 10, f: 14
};

/**
 * Calculate the electron configuration for a given atomic number.
 * Returns an array of { subshell: string, count: number } objects.
 * e.g. Carbon (6): [{ subshell: '1s', count: 2 }, { subshell: '2s', count: 2 }, { subshell: '2p', count: 2 }]
 */
export function getElectronConfiguration(atomicNumber: number): { subshell: string; count: number }[] {
    const config: { subshell: string; count: number }[] = [];
    let remaining = atomicNumber;

    for (const subshell of SUBSHELL_ORDER) {
        if (remaining <= 0) break;
        const type = subshell.slice(-1); // s, p, d, or f
        const max = SUBSHELL_MAX[type] || 2;
        const count = Math.min(remaining, max);
        config.push({ subshell, count });
        remaining -= count;
    }

    return config;
}

/**
 * Format electron configuration as a display string.
 * e.g. "1s² 2s² 2p²"
 */
export function formatElectronConfig(atomicNumber: number): string {
    const superscripts: Record<string, string> = {
        '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴',
        '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹'
    };

    return getElectronConfiguration(atomicNumber)
        .map(({ subshell, count }) => {
            const sup = String(count).split('').map(d => superscripts[d] || d).join('');
            return `${subshell}${sup}`;
        })
        .join(' ');
}

/**
 * Emission spectrum data for common elements.
 * Wavelengths in nm (visible range: 380-700nm).
 * These are the strongest visible spectral lines for each element.
 */
export const EMISSION_SPECTRA: Record<string, number[]> = {
    H: [410, 434, 486, 656],             // Balmer series
    He: [388, 447, 471, 492, 501, 587, 668],
    Li: [391, 413, 460, 497, 610, 670],
    Be: [457, 467, 527],
    B: [412, 433, 497, 518],
    C: [426, 477, 505, 515, 538, 601, 658],
    N: [463, 500, 567, 575, 648],
    O: [394, 436, 533, 544, 616, 645],
    F: [440, 490, 624, 685],
    Ne: [540, 585, 588, 603, 607, 616, 621, 626, 633, 638, 640, 650, 660],
    Na: [466, 498, 515, 569, 589, 590],    // Famous sodium doublet
    Mg: [383, 457, 470, 518, 552],
    Al: [396, 394, 466, 560],
    Si: [390, 413, 505, 566, 634],
    P: [417, 441, 521, 545, 602],
    S: [392, 469, 500, 545, 564],
    Cl: [438, 479, 507, 521, 542, 614],
    Ar: [394, 415, 420, 426, 434, 470, 697],
    K: [404, 460, 536, 580, 691, 694, 766, 769],
    Ca: [393, 397, 423, 443, 445, 487, 527, 558, 612, 616, 643, 646],
    Ti: [399, 424, 430, 444, 453, 468, 498, 521, 548],
    V: [410, 438, 444, 459, 489],
    Cr: [397, 425, 427, 429, 436, 462, 520, 540],
    Mn: [403, 404, 405, 476, 482, 540, 602],
    Fe: [382, 385, 388, 392, 396, 404, 414, 423, 432, 438, 441, 466, 495, 527],
    Co: [389, 399, 412, 435, 445, 491, 535],
    Ni: [385, 394, 416, 448, 471, 503],
    Cu: [402, 406, 427, 465, 510, 515, 522, 570, 578],
    Zn: [389, 468, 472, 481, 492, 518, 530, 589, 636],
    Ga: [403, 417, 441, 639],
    Ge: [422, 474, 589],
    As: [404, 416, 508, 545],
    Se: [474, 492, 508, 530],
    Br: [461, 478, 514, 531, 604],
    Kr: [427, 432, 436, 440, 450, 557, 587],
    Rb: [421, 572, 780],
    Sr: [407, 421, 460, 483, 496, 525, 548, 689, 707],
    Ag: [405, 421, 466, 520, 547],
    Au: [406, 427, 460, 523, 583, 628],
    Hg: [405, 436, 492, 546, 577, 579, 615, 623, 690],
    U: [385, 400, 415, 425, 437, 502, 550, 591],
};

/**
 * Convert wavelength (nm) to approximate RGB color for rendering.
 */
export function wavelengthToColor(wavelength: number): string {
    let r = 0, g = 0, b = 0;

    if (wavelength >= 380 && wavelength < 440) {
        r = -(wavelength - 440) / (440 - 380);
        g = 0;
        b = 1;
    } else if (wavelength >= 440 && wavelength < 490) {
        r = 0;
        g = (wavelength - 440) / (490 - 440);
        b = 1;
    } else if (wavelength >= 490 && wavelength < 510) {
        r = 0;
        g = 1;
        b = -(wavelength - 510) / (510 - 490);
    } else if (wavelength >= 510 && wavelength < 580) {
        r = (wavelength - 510) / (580 - 510);
        g = 1;
        b = 0;
    } else if (wavelength >= 580 && wavelength < 645) {
        r = 1;
        g = -(wavelength - 645) / (645 - 580);
        b = 0;
    } else if (wavelength >= 645 && wavelength <= 780) {
        r = 1;
        g = 0;
        b = 0;
    }

    // Intensity factor for edges of visible spectrum
    let factor = 0;
    if (wavelength >= 380 && wavelength < 420) {
        factor = 0.3 + 0.7 * (wavelength - 380) / (420 - 380);
    } else if (wavelength >= 420 && wavelength <= 700) {
        factor = 1.0;
    } else if (wavelength > 700 && wavelength <= 780) {
        factor = 0.3 + 0.7 * (780 - wavelength) / (780 - 700);
    }

    r = Math.round(255 * Math.pow(r * factor, 0.8));
    g = Math.round(255 * Math.pow(g * factor, 0.8));
    b = Math.round(255 * Math.pow(b * factor, 0.8));

    return `rgb(${r},${g},${b})`;
}
