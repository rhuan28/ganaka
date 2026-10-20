import { InvalidOptionError } from './errors';
import { FIDELITIES, type Fidelity } from './fidelity';

export const AYANAMSHA_NAMES = [
  'lahiri', 'sayana', 'yukteshwar', 'raman', 'bhasin', 'fagan', 'krishnamurti', 'krishnamurtiNew', 'trueChitra',
] as const;
export type AyanamshaName = (typeof AYANAMSHA_NAMES)[number];

export function assertAyanamsha(name: unknown, offsetDegrees: unknown): void {
  if (!AYANAMSHA_NAMES.includes(name as AyanamshaName)) throw new InvalidOptionError('ayanamsha', `unknown ayanamsha "${String(name)}"`);
  if (typeof offsetDegrees !== 'number' || !Number.isFinite(offsetDegrees)) throw new InvalidOptionError('ayanamshaOffsetDegrees', 'must be a finite number');
}

export interface CoreOptions {
  ayanamsha: AyanamshaName;
  /** Subtracted from the ayanamsha, degrees: +1 raises every sidereal longitude by 1°. PL9: "Specify offset". */
  ayanamshaOffsetDegrees: number;
  node: 'true' | 'mean';
  sunrise: 'centre' | 'edge';
  gulika: 'end' | 'beginning';
  /** PL9's "Karakas": 'seven' is "No Rahu", 'eight' is "Rahu too". */
  karakas: 'seven' | 'eight';
  /** PL9's "Bhavapada calculation". */
  bhavapada: 'parashara' | 'knrao';
  /** 'corrected' repairs PL9's proven defects; 'pl9' reproduces them. See docs/spec/correcoes.md. */
  fidelity: Fidelity;
}

/** The configuration observed in the PL9 installation examined (its options screens), computed in the corrected mode. */
export const DEFAULT_OPTIONS: CoreOptions = Object.freeze({
  ayanamsha: 'lahiri',
  ayanamshaOffsetDegrees: 0,
  node: 'true',
  sunrise: 'centre',
  gulika: 'end',
  karakas: 'seven',
  bhavapada: 'parashara',
  fidelity: 'corrected',
}) as CoreOptions;

export class NotImplementedOptionError extends Error {
  readonly option: string;
  readonly value: string;
  constructor(option: string, value: string) {
    super(`option ${option}="${value}" is declared but not implemented`);
    this.name = 'NotImplementedOptionError';
    this.option = option;
    this.value = value;
  }
}

export function resolveOptions(partial: Partial<CoreOptions> = {}): CoreOptions {
  // An explicit undefined means "use the default".
  const given = Object.fromEntries(Object.entries(partial).filter(([, v]) => v !== undefined));
  const o: CoreOptions = { ...DEFAULT_OPTIONS, ...given };
  assertAyanamsha(o.ayanamsha, o.ayanamshaOffsetDegrees);
  if (!FIDELITIES.includes(o.fidelity)) throw new InvalidOptionError('fidelity', `unknown mode "${String(o.fidelity)}"`);
  if (o.node !== 'true') throw new NotImplementedOptionError('node', o.node);
  if (o.sunrise !== 'centre') throw new NotImplementedOptionError('sunrise', o.sunrise);
  if (o.karakas !== 'seven' && o.karakas !== 'eight') throw new InvalidOptionError('karakas', `unknown value "${String(o.karakas)}"`);
  if (o.bhavapada !== 'parashara' && o.bhavapada !== 'knrao') throw new InvalidOptionError('bhavapada', `unknown value "${String(o.bhavapada)}"`);
  if (o.gulika !== 'end' && o.gulika !== 'beginning') throw new InvalidOptionError('gulika', `unknown method "${String(o.gulika)}"`);
  return o;
}
