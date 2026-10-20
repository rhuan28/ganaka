# The vargas

## Conventions

- Input: sidereal longitude. Output: the sign (0 = Aries … 11 = Pisces) that the
  point occupies in the varga.
- "Odd sign" and "even sign" count the signs from Aries = 1: Aries,
  Gemini, Leo… are odd.
- Each sign is divided into `N` equal parts of `30°/N`, numbered from 0 to
  `N − 1`, except in D30, whose parts are unequal.
- On a boundary between equal parts, the point belongs to the part that begins.

## Rules of the sixteen classical vargas

| Varga | Parts | Sign of part `p` (from 0 to N − 1) in sign `s` (from 0 to 11) |
|---|---|---|
| D1 | 1 | `s` |
| D2 | 2 | Odd sign: first half Leo, second Cancer. Even sign: first Cancer, second Leo. |
| D3 | 3 | `s + 4p`: the sign itself, the fifth and the ninth |
| D4 | 4 | `s + 3p`: the sign itself, the fourth, the seventh and the tenth |
| D7 | 7 | continuous count: `7s + p` |
| D9 | 9 | continuous count: `9s + p` |
| D10 | 10 | Odd sign: `s + p`. Even sign: `s + 8 + p` (from the ninth sign). |
| D12 | 12 | `s + p` |
| D16 | 16 | continuous count: `16s + p` |
| D20 | 20 | continuous count: `20s + p` |
| D24 | 24 | Odd sign: from Leo (`4 + p`). Even sign: from Cancer (`3 + p`). |
| D27 | 27 | continuous count: `27s + p` |
| D30 | — | see below |
| D40 | 40 | Odd sign: from Aries (`p`). Even sign: from Libra (`6 + p`). |
| D45 | 45 | Movable sign: from Aries (`p`). Fixed: from Leo (`4 + p`). Dual: from Sagittarius (`8 + p`). |
| D60 | 60 | `s + p` |

All results are taken modulo 12.

"Continuous count" means that the varga is the longitude multiplied by
`N`: the parts follow the order of the signs without restarting at each sign. For
D7, D9, D16, D20 and D27 this coincides with the usual rules ("even signs
start from the seventh", "movable from Aries, fixed from Leo, dual from Sagittarius" and
so on).

### D30

| Sign | Degrees within the sign | Sign in D30 |
|---|---|---|
| Odd | up to 5° | Aries |
| | from 5° to 10° | Aquarius |
| | from 10° to 18° | Sagittarius |
| | from 18° to 25° | Gemini |
| | from 25° to 30° | Libra |
| Even | up to 5° | Taurus |
| | from 5° to 12° | Virgo |
| | from 12° to 20° | Pisces |
| | from 20° to 25° | Capricorn |
| | from 25° to 30° | Scorpio |

In D30 the boundary belongs to the part that **ends**: exactly 5° of an odd
sign is still Aries. This is how PL9 does it.

## D2 at exactly 15° of an odd sign

PL9 treats exactly 15° of an odd sign as the end of the first half, and the
computation it performs at that single point yields Virgo, which is not a
hora sign. The `pl9` mode reproduces this. The `corrected` mode gives Cancer, treating
exactly 15° as the start of the second half, as in the other vargas. The
difference only exists for a longitude exactly equal to 15° of an odd
sign. See `corrections.md`.

## Examples

| Longitude | D2 | D3 | D4 | D7 | D9 | D10 | D12 | D16 | D20 | D24 | D27 | D30 | D40 | D45 | D60 |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 15° Aries (15°), `pl9` mode | Vir | Leo | Lib | Can | Leo | Vir | Lib | Sag | Aqu | Leo | Tau | Sag | Sag | Aqu | Lib |
| 25° Taurus (55°) | Leo | Cap | Aqu | Ari | Leo | Vir | Pis | Vir | Ari | Pis | Tau | Cap | Can | Vir | Can |
| 29°30' Pisces (359.5°) | Leo | Sco | Sag | Pis | Pis | Leo | Aqu | Pis | Pis | Gem | Pis | Sco | Cap | Leo | Aqu |

## The other 29 vargas of PL9

PL9 offers 45 vargas. Besides the sixteen classical ones, the `core` computes
the 29 below, with these names:

| Name in `core` | Name in PL9 | Parts |
|---|---|---|
| `D5` | Panchamsha 1/5 | 5 |
| `D6` | Shashtamsha 1/6 | 6 |
| `D8` | Ashtamsha 1/8 | 8 |
| `D11` | Ekadashamsha 1/11 | 11 |
| `D150` | Nadiamsha 1/150 | 150 |
| `D2-parivritti` | Parivriti dvaya Hora | 2 |
| `D2-samasaptaka` | Samasaptaka Hora | 2 |
| `D3-parivritti` | Parivriti Traya Dreshkana | 3 |
| `D4-parivritti` | Chaturthamsha 123 | 4 |
| `D10-parivritti` | Dashamasha 123 | 10 |
| `D12-parivritti` | Dvadashamsha 123 | 12 |
| `D30-parivritti` | Trimshamsha 123 | 30 |
| `D5-parivritti` | Panchamamsha | 5 |
| `D16-iyer` | Shodashamsha Iyer | 16 |
| `D11-iyer` | Ekadashamsha 1/11 Iyer | 11 |
| `D108-nd` | Astottaramsa ND | 108 |
| `D108-dn` | Astottaramsa DN | 108 |
| `D2-kashinatha` | Kashinatha Hora | 2 |
| `D2-somanatha` | Somanatha Hora | 2 |
| `D3-jagannatha` | Jagannatha Drekkana | 3 |
| `D3-somanatha` | Somanatha Drekkana | 3 |
| `D4-vedamsha` | Vedamsha | 4 |
| `D6-kaulaka` | Kaulaka | 6 |
| `D9-pada` | Pada Navamsha | 9 |
| `D9-nadi` | Nadi Navamsha | 9 |
| `D9-somanatha` | Somanatha Navamsha | 9 |
| `D24-parasiddhamsha` | Para Siddhamsha | 24 |
| `D24-siddhamsha` | Siddhamsha (alt) | 24 |
| `D30-venkatesha` | Venkatesha Trimshamsha | 30 |

PL9 calls "Iyer", in its chart screens, the vargas named here
`-parivritti`.

### Rules

`s` = sign from 0 to 11; `d` = degrees within the sign; `p` = part from 0 to N − 1 (`p = ⌊d·N/30⌋`); `f = d·N/30` without truncation; "odd" = Aries, Gemini… (`s` even). Everything modulo 12.

- **Continuous count** (the longitude multiplied by N): `D150`, `D2-parivritti`, `D3-parivritti`, `D4-parivritti`, `D10-parivritti`, `D12-parivritti`, `D30-parivritti`, `D5-parivritti`, `D6-kaulaka`. Sign = `(N·s + p) mod 12`.
- **D5:** odd sign: Aries, Aquarius, Sagittarius, Gemini, Libra; even sign: Taurus, Virgo, Pisces, Capricorn, Scorpio (the parts, in order).
- **D6:** odd: from Aries (`p`); even: from Libra (`6 + p`).
- **D8:** movable: from Aries (`p`); fixed: from Sagittarius (`8 + p`); dual: from Leo (`4 + p`).
- **D11:** `p − s`.
- **D2-samasaptaka:** the two halves of a sign go to the two signs of
  its axis (the sign and the seventh), and the first half goes, for both signs
  of the axis, always to the same one: Libra on the Aries–Libra axis, Taurus on the
  Taurus–Scorpio axis, Sagittarius on Gemini–Sagittarius, Capricorn on
  Cancer–Capricorn, Leo on Leo–Aquarius and Pisces on Virgo–Pisces.
- **D2-kashinatha:** the two halves go to the two signs of the sign's lord. In the signs of Mars, Mercury and Jupiter: first half in the lord's other sign, second in the sign itself. In those of Venus and Saturn, and in Cancer and Leo (which pair with each other): first in the sign itself, second in the other.
- **D2-somanatha:** odd: the sign itself, then the next; even: the sign itself, then the previous.
- **D3-jagannatha:** the three signs of the sign's element, starting with the movable one: fire from Aries, earth from Capricorn, air from Libra, water from Cancer; step of four signs.
- **D3-somanatha:** `k = ⌊s/2⌋`. Odd: `3k + p`. Even: `11 − 3k − p`.
- **D4-vedamsha:** movable: from Aries; fixed: from Leo; dual: from Sagittarius; step of three signs (`start + 3p`).
- **D9-pada:** start as in the Navamsha (fire from Aries, earth from Capricorn, air from Libra, water from Cancer). Forward in the signs from Aries to Gemini and from Libra to Sagittarius; backward in the others.
- **D9-nadi:** same start; forward in odd signs, backward in even ones.
- **D9-somanatha:** `k = ⌊s/2⌋`. Odd: `9k + p`. Even: `2 − 3k − p`.
- **D16-iyer:** odd: `s + p`. Even: `⌊s + 4 − f⌋`.
- **D11-iyer:** `⌊1 − f⌋`.
- **D24-parasiddhamsha:** odd: `4 + p`. Even: `⌊4 − f⌋`.
- **D24-siddhamsha:** odd: `⌊5 − f⌋`. Even: `⌊4 − f⌋`.
- **D30-venkatesha:** `s + p` (each degree, one sign, starting from the sign itself).
- **D108-nd:** take the longitude in the Navamsha (`9·L mod 360`) and apply D12 to it.
- **D108-dn:** take the longitude in D12 (`(s + d/2.5)·30`) and apply the Navamsha to it.

In the reversed counts (`⌊base − f⌋`), an exact boundary **within** the
sign belongs to the part that ends; this is what the formula gives and what PL9 does.
At the start of the sign (`f = 0`) the formula gives the value that would come before the
first part. In D11-iyer that value is Taurus, which this varga gives at
no other point: the `pl9` mode reproduces it, and the `corrected` mode gives Aries,
the first part (correction 7 of `corrections.md`). The `core` does these computations
in double precision, without treating as exact the boundaries that are not
representable; within one billionth of a degree of one of these boundaries, the
result may be that of the neighbouring part.

Seven of these vargas (Samasaptaka Hora, Kashinatha Hora, Somanatha Hora,
Somanatha Drekkana, Pada Navamsha, Nadi Navamsha and Somanatha Navamsha) are
described here by the starting sign and the direction of the count in each
sign, or in each axis, which is the form
in which the rule is stated; the result is the same as the program's.

## Origin

**Read in PL9.** The rules above describe what the program computes for
each of the sixteen vargas of Parashara, and were obtained by reading its
routines. All coincide with the published classical rules.

The rules of the other 29 vargas were also read in the program's varga
routine, and checked against the charts that PL9 prints (see
`docs/reports/conformance.md`). They are school rules: the `core`
reproduces them as PL9 applies them, in both modes.

## Check against PL9

In 72 charts, the sign of the Lagna and of the nine grahas in each varga was read from the
program's "Shodashvarga Summary" report: 10,800 cells from D2 to D60,
all equal to those of the `core`. None of these cells is within 0.5" of a
division boundary, so the boundary rules (in particular that of
D30 and that of D2 at 15°) come only from reading the routines.

## What was not verified

- In some of the 29 vargas PL9 does the computation in single precision. The `core`
  uses double precision; the difference only appears within 0.1" of a part
  boundary.
- The exact behaviour at a part boundary of the 29 vargas comes only from
  reading the routines.
