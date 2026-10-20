# Graded aspects

Code: `packages/core/src/strengths/aspects.ts`. Tests:
`packages/core/test/aspects.test.ts`.

The value, from 0 to 60 virupas, that a planet casts on a point, used by PL9
in Drik Bala (and in Bhava Bala). The angle is counted from the planet to the point, in
the direction of the signs. Rules read in PL9's executable and checked against the
aspect reports and the printed Drik Bala.

## The common curve

All planets cast, by the angle `k`:

| `k` | value |
|---|---|
| up to 30° | 0 |
| 30° to 60° | rises half a virupa per degree, up to 15 |
| 60° to 90° | rises one per degree, up to 45 |
| 90° to 120° | falls half per degree, down to 30 |
| 120° to 150° | falls one per degree, down to 0 |
| 150° to 180° | rises two per degree, up to 60 |
| 180° to 300° | falls half per degree, down to 0 |
| from 300° on | 0 |

## The special aspects

Mars, Jupiter, Saturn, Rahu and Ketu have peaks of 60 of their own; the value is the
greater of the common curve and the peaks. Around each peak, for thirty degrees on
each side, the value rises up to it and falls after it at the given rate, per degree:

| Planet | Peak | Before | After |
|---|---|---|---|
| Mars | 90° | 1.5 | 1 |
| Mars | 210° | plateau of 60 from 180° | 1 |
| Jupiter, Rahu, Ketu | 120° and 240° | 0.5 | 1 |
| Saturn | 60° | 2 | 0.5 |
| Saturn | 270° | 1 | 2 |

The value never goes below zero.
