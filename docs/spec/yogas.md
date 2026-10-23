# Natal yogas

The yogas the engine detects in a birth chart, as PL9 detects them. Code: `packages/core/src/yogas/`
(`computeYogas`; one module per family in `families/`). Rules read in PL9's executable; each family is checked against PL9's printed
yoga report for the reference charts before it counts as done.

## Scope

PL9 numbers 1001 natal yogas. This engine covers the classical families, PL9's numbers 1 to 348:
Nabhasa, Pancha Mahapurusha, the Moon and Sun yogas, the named yogas of the classical texts, Neecha
Bhanga, Raja, Viparita and Dhana. Numbers 349 to 1001 are out of scope: yogas by topic (profession,
body, family, children, illness, longevity, poverty) and the combinations of two to seven planets in
one sign.

Several numbers can share a name. Those are variants, each with its own condition. A weakened form of a
yoga is one example, and a yoga that one text defines from the Lagna and another from the Moon is another.
Each variant is a separate yoga, present or not.

The engine names each yoga with its own stable id (`ruchaka`, `gajaKesari`…). The link to PL9's number and
name exists only in the bench.

## The vocabulary

These are the rules that every family is built from, as PL9 applies them.

**Houses** are whole signs. The house of a sign, counted from a reference sign, is the distance between
them plus one. The reference is the Lagna unless the yoga says otherwise ("from the Moon", "from the Sun",
"from the lord of the 9th"). A yoga counted from a planet takes that planet's sign as the first house.

**Groups of houses:**

| Group | Houses |
|---|---|
| Kendra (angle) | 1, 4, 7, 10 |
| Trikona (trine) | 5, 9 |
| Panaphara (succedent) | 2, 5, 8, 11 |
| Apoklima (cadent) | 3, 6, 9, 12 |
| Dusthana | 6, 8, 12 |
| Upachaya | 3, 6, 10, 11 |

In these conditions, PL9's trine group leaves out the 1st house. The 1st house counts as an angle.

**Lord of a house:** the lord of its sign, with the traditional rulers (Mars rules Aries and Scorpio, Saturn
Capricorn and Aquarius). Rahu and Ketu rule no house. The lords of a group are the lords of its houses. The
group's houses are counted from the yoga's reference, and the lords are taken among the seven planets.

**Dispositor:** the lord of the sign a planet occupies, in the birth chart or in the navamsa.

**Conjunction:** two different planets in the same sign. Degrees do not matter.

**Aspect** (graha drishti), by sign. Every planet aspects the 7th sign from its own. Mars also aspects the
4th and the 8th, Jupiter the 5th and the 9th, and Saturn the 3rd and the 10th. Rahu and Ketu aspect like
Jupiter. Only these full aspects count in a yoga. The partial quarter aspects of the other houses do not.
"A is aspected by B" means B casts a full aspect on A's sign. A **mutual aspect** is a full aspect each way.

**Exchange** (parivartana): each of two planets occupies a sign of the other.

**Association** depends on the family. Each yoga names one of three forms:
- conjunction or full aspect;
- conjunction, a full aspect, or one occupying a sign of the other;
- conjunction, exchange, or a strong aspect, more than 50 virupas by the [graded aspect](strengths/aspects.md).

**Dignity** has nine levels, per planet: exalted, moolatrikona, own sign, great friend, friend, neutral,
enemy, great enemy, debilitated (see [the nine-level dignity](dashas/sign-strength.md)). "In own sign" in a
yoga means own sign or moolatrikona. Deep debilitation means within one degree of the debilitation point.

**Benefics and malefics:** by default, the natural nature of each planet. With the option "Use functional
mal/ben", the functional nature for the chart's ascendant replaces it everywhere in the yogas. Both are read in PL9's
executable with its default options. Code: `packages/core/src/yogas/natures.ts`.

- *Natural.* The Sun, Mars, Saturn, Rahu and Ketu are malefic; Jupiter and Venus benefic. The Moon is benefic
  when it is more than 0° and up to 180° ahead of the Sun (waxing), malefic otherwise. Mercury is benefic unless a
  malefic shares its sign. When the planets just before and just after it in longitude (the nine, round the zodiac)
  both share its sign, they decide instead: both benefic make it benefic, both malefic make it malefic, and one of
  each makes it neutral, or benefic when the one after it is the Moon. When only the one after it shares its sign,
  PL9 looks at the one before it, which does not share its sign, and Mercury is malefic if that planet is.
- *Functional.* For the seven, Parashara's list for the ascendant's sign, the same one PL9 prints in its varga
  tables. A node alone in its sign is benefic in the 1st, 5th or 9th house from the Lagna, malefic in the 6th, 8th
  or 12th and neutral elsewhere. With planets in its sign, it takes the nature of the nearest of them in longitude.
  This rule also gives the nodes' column of PL9's transit varga tables, which the bench checks.
- A neutral planet is neither benefic nor malefic in any yoga.

**Hemmed** (kartari): the planets just before and just after the given planet, among the nine in order of
longitude, are both malefic (hemmed by malefics) or both benefic (hemmed by benefics). These neighbours come
from PL9's ordered list of the planets, not from the neighbouring signs. That the list is ordered by longitude
is still to be confirmed on the bench. The Kartari yogas of the Lagna (below) count signs instead.

**Strong and weak:** Shadbala at least equal to the required minimum (ratio 1 or more), or below it
([Shadbala](strengths/shadbala.md)).

**Groups of planets:**
- "the seven" are the Sun to Saturn;
- "planets other than the luminaries" are Mars to Saturn (the Sunapha, Anapha and Vesi families);
- benefics and malefics are taken among the nine, unless a yoga names a smaller group.

A condition on a group holds when at least one member meets it, and a negated one when no member does.
"A benefic in the 10th" needs one benefic there. "No planet in the 12th from the Moon" needs none.

**Rahu and Ketu** enter a yoga only when it names them, or through the benefic and malefic groups.

**Navamsa** conditions use the D9 sign of the planet or of the Lagna. A few named yogas also use another varga
(the Chaturthamsha, D4, with longitudes as sign × 30° + degrees in it) or the Karakamsha (the navamsa sign of the
Atmakaraka, by seven chara karakas, PL9's default); each is stated with its yoga.

**Combust:** as PL9's planet tables mark it ([Tajika](time/varshaphala.md)): Mars within 17° of the Sun, Mercury
14° (12° retrograde), Jupiter 11°, Venus 10° (8° retrograde), Saturn 15°, the Moon 12°.

**Day and night:** a birth is by day when the Sun is 180° or more ahead of the Lagna (above the horizon), by
night otherwise.

**The native's sex** decides between the two forms of the few yogas PL9 writes for men and for women. It is an
option, male by default, as in PL9's chart files. The reference charts are all male, so the bench checks that the
female forms stay absent there.

**A chart without a Lagna** (beyond the polar circle): a yoga that needs houses, lords or the Lagna sign is
reported missing, not absent. One that needs none of these is still computed, except under the functional natures:
they are those of the ascendant, so without a Lagna a yoga that reads the benefics or the malefics is missing too.

## The families, in the order of the work

Each family is implemented, tested and checked on the bench before the next. A yoga whose checks do not
close stays listed as pending, with no rule guessed from the data.

| # | Family | PL9 numbers | Classical sources |
|---|---|---|---|
| 1 | Pancha Mahapurusha | 50–64 | Phaladeepika 6; Brihat Parashara Hora Shastra |
| 2 | Chandra (Moon) yogas | 65–114, 118–123, 142–143 | Brihat Jataka 13; Phaladeepika 6; Saravali |
| 3 | Surya (Sun) yogas | 115–117, 124–141 | Phaladeepika 6; Saravali |
| 4 | Kartari | 144–146 | Phaladeepika 6 |
| 5 | Raja | 257–274, 278–310 | Brihat Parashara Hora Shastra; Phaladeepika 7; Jaimini Sutras |
| 6 | Dhana | 311–348 | Brihat Parashara Hora Shastra; Phaladeepika 6 |
| 7 | Viparita Raja | 275–277 | Uttara Kalamrita; Phaladeepika 6 |
| 8 | Neecha Bhanga Raja | 202–209 | Phaladeepika 7 |
| 9 | Nabhasa and the distributions of planets | 1–49, 187–199 | Brihat Jataka 12; Saravali; Brihat Parashara Hora Shastra |
| 10 | The other named yogas | 147–186, 200–201, 210–256 | Brihat Parashara Hora Shastra; Phaladeepika; Saravali; Sarvartha Chintamani |

**1. Pancha Mahapurusha.** *Checked: the 15 yogas in the 135 reference charts.* Mars, Mercury, Jupiter,
Venus or Saturn in an angle from the Lagna, in its own sign or exaltation (Ruchaka, Bhadra, Hamsa, Malavya,
Shasha). Each has two weakened forms that PL9 lists apart: the planet conjunct the Sun or the Moon, and the Sun
and the Moon both weak. The weak form needs the Shadbala.

**2. Chandra.** *Checked: the 60 yogas in the 135 reference charts.* Gaja-Kesari: Jupiter in an angle from the Moon, a conjunction included, with PL9's variants
of the Moon's house. Sunapha, Anapha and Durudhara: planets other than the luminaries in the 2nd, the 12th
or both from the Moon. The general form and one form per planet or pair are each a separate yoga.
Kemadruma: none in either house. Its cancellations are separate yogas, each on top of the seven (the Sun included)
being absent from both houses. Chandra Adhi: benefics in the 6th,
7th and 8th from the Moon. Vasumati: benefics in upachayas. Shakata: Jupiter in the 6th, 8th or 12th from
the Moon and not in an angle from the Lagna, with its cancellation. Amala: a benefic in the 10th, from the
Lagna and from the Moon.

**3. Surya.** *Checked: the 24 yogas in the 135 reference charts.* Vesi, Vasi and Ubhayachari: planets other than the luminaries in the 2nd, the 12th or both
from the Sun, in general, by benefics, by malefics and per planet (Vasi by Saturn in a male and a female
form). Uttamadi: the Moon in an angle, succedent or cadent house from the
Sun.

**4. Kartari.** *Checked: the 3 yogas in the 135 reference charts.* Subha and Papa Kartari: benefics, or malefics, in both the 2nd and the 12th from the Lagna.
Lagna Adhi: benefics in the 6th, 7th and 8th from the Lagna, and no malefic in those houses or casting a full
aspect on them.

**5. Raja.** *Checked: the 51 yogas in the 135 reference charts.* Association between the lords of angles and of trines, by pairs. The other Raja yogas of the
texts, PL9's Jaimini Raja yogas and the Raja-Bhanga are each stated with their conditions as the family is
written.

**6. Dhana.** *Checked: 31 of the 38 yogas in the 135 reference charts.* Association between the lords of the 1st, 2nd, 5th, 9th and 11th, and the planet-specific
combinations of the 1st, 5th and 11th houses, and the named Dhana yogas. Seven of them test a planetary state
(an avastha in twelve steps) that PL9 computes and the engine does not yet. Until that state is read, they are
reported missing, not absent. None of them appears in the reference charts.

**7. Viparita.** *Checked: the 3 yogas in the 135 reference charts.* The lord of the 6th (Harsha), the 8th (Sarala) or the 12th (Vimala) in a dusthana.

**8. Neecha Bhanga.** *Checked: the 8 yogas in the 135 reference charts.* A debilitated planet whose
debilitation is cancelled, by each of the classical cancellations PL9 lists apart:
- the lord of its sign of exaltation in an angle from the Lagna, or from the Moon;
- the lord of its sign of debilitation, or of exaltation, joined with it or aspecting it in full, or exchanging
  signs with the lord of debilitation;
- two planets each in the other's sign of debilitation;
- a debilitated planet joined by an exalted one.

PL9 writes each of these for a list of planets that is not always the seven. The engine follows its lists.

**9. Nabhasa and distributions.** *Checked: the 62 yogas in the 135 reference charts.* The Ashraya, Dala, Akriti and Sankhya groups by the occupation of signs
and houses by the seven, the Malika chains of seven consecutive houses, and Chatussagara. The Ashraya forms by
sign and Sankhya need no Lagna; the others are missing without it. Chatussagara is present without a Lagna when its
sign form holds, and missing otherwise, since its angle form needs the houses.

**10. The other named yogas.** *Checked: the 89 yogas in the 135 reference charts.* Each is a yoga of its own:
Parvata, Kahala, Chamara and the yogas of each house's lord in a dusthana (Ava to Daridra), Shankha, Bheri, Khadga,
Lakshmi, Maha-Bhagya (by the native's sex, day or night and odd or even signs), Matsya, Kurma, Kusuma, Kalanidhi,
Hari-Hara-Brahma, Pushkala, Indra, Simhasana, Dhvaja, Amara, Vanchana Chora Bhithi (one of them by Gulika's house),
Gauri, Madana Gopala, Bharathi, Maha Raja (with the karaka of rank six, the Gnatikaraka with seven karakas) and
the others PL9 lists between 147 and 256.

## Where PL9's own definitions decide

A few of PL9's entries cannot form, or form in a way the classical text does not describe, because of how
PL9 itself defines them. The bench decides what PL9 does with each of them. The engine follows PL9, and
this section lists each case with what PL9 does.

- **Dhanadhana by day** (the Moon in the navamsa of its own sign or of a great friend, aspected by Jupiter): PL9's
  definition of the day form cannot be read by its own evaluator, so the yoga never forms. The engine reports it
  absent. The night form forms as PL9 defines it.
- **Raja yogas whose PL9 definition does not read as written.** One (the lord of the 10th in the navamsa) never
  forms, because PL9's evaluator cannot read its definition. Two others form only by their first alternative
  (Libra rising with the Sun and the Moon together, and the navamsa dispositor of a debilitated planet), because
  the second cannot be read.
- **Lords counted from a planet.** When a condition counts houses from a planet ("the lord of the 11th in an angle
  from the Moon"), PL9 counts the lord's house from that planet too. In the Raja yoga of the lords of the 11th, 9th
  and 2nd, all three are counted from the Moon. In Akhanda Samrajya, PL9 writes the same yoga with one parenthesis
  missing, so its third lord, that of the 2nd, counts from the Lagna and must be in an angle from the Lagna.
- **Named yogas PL9's evaluator cannot read**, which never form: the twelve house yogas from Chamara (by the 1st)
  to Musala (by the 12th), whose definition joins a planet to a house the wrong way; Chamara by the benefics'
  count; Saraswati; Vanchana Chora Bhithi by Gulika and the lords; and Amshavatara.
- **Neecha Bhanga, PL9's first definition** (a debilitated planet in an angle) never forms. PL9's evaluator
  cannot read it.
- **Sankhya Kedara, Dama and Vina** (the seven in four, six or seven signs) never form. In the reference charts, 59
  charts have such a distribution and none shows the yoga. Gola, Yuga, Shula and Pasha form as defined.
- **Akriti Danda:** PL9's definition has its own description written into it. As PL9 evaluates it, the yoga needs
  the 10th, 11th, 12th and 1st occupied and nothing in the 3rd or the 5th to the 9th. The 2nd and the 4th stay
  free.
- **Lagna Adhi** never forms with the natural natures. Rahu and Ketu are then malefic, and between them they aspect
  every sign of one parity, so one of the 6th, 7th and 8th houses is always under a malefic. With the functional
  natures it can form. The reference charts never show it.
