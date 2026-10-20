# Ephemeris source

Verified on 2026-10-12.

## Decision

The `ephemeris` package uses the npm package `swisseph-wasm` at version 0.1.0, which
embeds Swiss Ephemeris 2.10.03 compiled to WebAssembly.

## Licence

`swisseph-wasm` is GPL-3.0-or-later. GPL version 3 allows combining the code
with a work under AGPL version 3, which is this project's licence. The Swiss
Ephemeris itself is offered under the AGPL or a commercial licence; this project uses
the former.

## Embedded data and date range

The package ships the files `sepl_18`, `semo_18` and `seas_18` (planets, Moon and
main asteroids), which cover 1800 to 2400. The range guaranteed by
this project, 1801 to 2048, lies entirely within them.

## Behaviour outside the range

When asked for a date outside the embedded files, the library returns values from the
lower-precision analytical model without signalling it. Observed for the years 1700
and 2500: the computation returns normally. For this reason the `ephemeris` package rejects,
with a typed error, any date outside 10 January 1800 to 20
December 2399.

## Sidereal mode and nutation

The longitude in the library's sidereal mode is not equal to the tropical longitude
minus the ayanamsha: the sidereal mode leaves nutation out. On 1 July
2000 the difference between the two computations is about 15 arcseconds. The
positions exported by PL9 agree with the sidereal mode, to within one
arcsecond, and not with the simple subtraction. The package exposes the two
quantities separately.

## Node and browser

The tropical longitude of the Moon on 1 July 1801, 2000 and 2048, at noon
universal time, was computed in Node 24 and in a
Chromium-based browser. The three values are identical, digit for digit, in both
environments.

For the browser to load the module with Vite, the package must be kept out
of dependency pre-bundling (`optimizeDeps.exclude`); otherwise the
WebAssembly file is not found.

## What was not verified

- Other browsers (Firefox, Safari).
- Other bodies and other functions besides the Moon's longitude, in the comparison
  between Node and browser.
- Whether version 2.10.03 and the version embedded in PL9 differ in any result
  within the range.
