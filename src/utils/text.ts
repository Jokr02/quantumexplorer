const SUBSCRIPT_TO_ASCII: Record<string, string> = {
    '₀': '0', '₁': '1', '₂': '2', '₃': '3', '₄': '4',
    '₅': '5', '₆': '6', '₇': '7', '₈': '8', '₉': '9',
};

/**
 * The 3D `Text` component (drei/troika) renders glyphs from a limited SDF font atlas
 * that doesn't include unicode subscript digits, so chemical formulas like "H₂O" show
 * as tofu boxes in the scene. HTML elements render these fine — only use this for
 * text drawn inside the WebGL canvas.
 */
export function toSceneSafeText(text: string): string {
    return text.replace(/[₀-₉]/g, (char) => SUBSCRIPT_TO_ASCII[char] ?? char);
}
