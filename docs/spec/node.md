# Rahu and Ketu

## Rule

With the true node option, which is that of the installation examined:

1. Evaluate the Moon's true (osculating) node in the Swiss Ephemeris, referred
   to the mean equinox of date (without nutation), at the PL9 instant (see
   `delta-t.md`). Let `Ω` be that longitude.
2. Refer `Ω` to the J2000 equinox, subtracting the general precession in
   longitude accumulated since J2000:
   `p = (5028.796195 T + 1.1054348 T²) / 3600` degrees, with `T` in Julian
   centuries since J2000. Let `Ω₀ = Ω − p`.
3. Add to `Ω` the term `0.4653" × sin(Ω₀)`.
4. Subtract the ayanamsha.

Ketu is Rahu plus 180°.

The speed returned is the library's true node speed; Ketu has the
same.

## Origin

- Steps 1 and 4: same construction as the planetary positions.
- Step 3: **measured**. The difference between the Rahu exported by PL9 and the
  Swiss Ephemeris 2.10 true node, in the 290 reference charts, was
  fitted to sines and cosines of combinations of the lunar arguments; a
  single combination explains 99.9% of it, and that combination is equivalent to the
  longitude of the node itself.
- Ketu opposite Rahu: confirmed in the 290 charts, with error below 0.001".

## Candidates compared

Difference against PL9's Rahu, in the 290 charts:

| Candidate | Maximum | Median |
|---|---|---|
| True node, PL9 instant, without nutation | 0.479" | 0.317" |
| True node, original instant, without nutation | 0.596" | 0.317" |
| True node, PL9 instant, with nutation | 19.2" | 12.5" |
| Mean node | 6787" | 4008" |

Fit of the residual of the first candidate to `a sin(x) + b cos(x)`:

| Argument `x` | a | b | Maximum residual |
|---|---|---|---|
| True node, equinox of date | 0.4645 | 0.0069 | 0.020" |
| **True node, J2000 equinox** | **0.4653** | **−0.0001** | **0.015"** |
| Mean node, J2000 equinox | 0.4647 | −0.0004 | 0.016" |

The cosine term is null in the J2000 frame, and that is why the rule uses only
the sine. No quantization was found in PL9's values.

## Interpretation (hypothesis)

A term proportional to the sine of the node's longitude in the J2000 frame is
what results from computing the node on an ecliptic tilted by a small
angle about the line of the equinoxes. The corresponding tilt is
`0.4653" × tan(5.145°) ≈ 0.042"`, which is the difference between the J2000
obliquity in the old precession model (84381.448") and in the current one (84381.406"). The
hypothesis is that the Swiss Ephemeris version used by PL9 computed the osculating
node with the old obliquity. It was not verified in the code.

The residual of 0.015" is compatible with the variation of the inclination of the lunar
orbit, which the rule treats as constant.

## Conformance

Rahu and Ketu are at most 0.015" from PL9 in the 290 charts.

## What was not verified

- The node's speed: PL9's export does not include it.
- The mean node option, which `core` does not implement.

## Retrogression

PL9 does not mark the nodes as retrograde on any screen, although the true
node moves backward almost always. `core` returns `retrograde: false`
for Rahu and Ketu, in both modes; the speed remains in the result.
