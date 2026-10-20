/**
 * 'pl9' reproduces the program, including where it is known to be wrong; it is what the reference values check.
 * 'corrected' is the same calculation with the proven defects repaired. See docs/spec/correcoes.md.
 */
export const FIDELITIES = ['pl9', 'corrected'] as const;
export type Fidelity = (typeof FIDELITIES)[number];
