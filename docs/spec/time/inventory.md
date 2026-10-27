# Stage 5 — Inventory: transits, panchanga, Varshaphala and Muhurta

Date: 2026-10-16. Sources: PL9's screens and menus (captures in the VM), the page list of
the print model editor, the PL9 manual and the executable (only the dispatch and the
entry points; the rules are left to each sub-project). The names below are those of the interface.

## 1. How PL9 prints what matters

The model editor (Print → Print Model → Edit) accepts three kinds of page: the reports
(those of the Reports menu), the worksheets (the screens of the Charts menu, printed as they are) and
other models. That is why almost everything in this stage has a printable form: the screens the
manual calls "screen only" (animated transits, timelines, Muhurta) go into the
model as a worksheet. Screen capture is kept only for what does not come out legible in the PDF.

Two ways of choosing the second instant coexist (written before the test printout;
what the printout showed, which takes precedence over this section and over the "Instant / place" columns of
section 2, is in section 5: the transit and Varshaphala worksheets follow the clock, not
the "Today" event):

- **Worksheets and transit tables:** take the "Today" event (event 1 of Edit →
  Events, the same as Edit → "Native's current location"). The events are stored in the data of
  each chart (the Events tab of the Data Entry dialog: "Today", "Muhurta" and any added ones);
  when a chart is opened, "Today" and "Muhurta" receive the date and time of the clock and the default
  place (Jaipur, 26N55, 75E49'40, time zone −05:30 in PL9's convention). The job saves both
  events after opening each chart and before printing. Opening the tab first shows the atlas
  warning ("Cannot open … _st.txt"), which is closed with OK.
- **Varshaphala reports** (Reports → Varshaphala, except the "Varshaphala Charts"):
  on opening, they ask for the age ("Please enter the age…"); the proposed value is the completed age
  today (31 for REF 0010 in October 2026). The report shows "Varshaphala for
  2026-2027, Passed year 31, Running year 32" and the true solar return, at the **place
  of birth**.
- **"Varshaphala Charts #1" to "#6":** six pages with the first 72 solar returns
  (12 per page), each with the date and time, the chart, the positions to the arc minute,
  the year lord and the Muntha. They depend on no date at all.
- **Muhurta:** event 2 of Edit → Events ("Muhurta"), or the instant at which the
  worksheet is opened; the place is the astrologer's (Edit → "Astrologer's location").

## 2. By sub-project

For each page: what it shows, whether it is a report (R) or a worksheet (W), the instant and the place.

### 5A — Transits

| Page | Type | Shows | Instant / place |
|---|---|---|---|
| 101. Animated transits I | W | birth chart and transit chart; positions, nakshatra and Shadbala of both; Kaksha (lord and bindu), bindus of the planet and of the Sarva in the transit sign; Ishta/Kashta of the transits; Tarabala, Chandrabala, tithi, karana, yoga and four dashas at the instant | "Today" |
| 102. Animated transits II | W | to be seen in the test printout | "Today" |
| 103. Animated Transits - Vargas | W | the transits in the vargas | "Today" |
| 113. Kaksha and dasha calendar | W | monthly bars of the kakshas (bindu yes/no, bindus of the sign, R/D) with the dashas | window starting at "Today" |
| 108. Dasha and Transit timelines | W | dasha timeline (3 levels) and graph of transits by sign, chart and Gochara tables | window around "Today" |
| 105. Graphical Ephemeris | W | graphical ephemeris with the dasha alongside | window of the Change Time Tool |
| 106. Graphical ephemeris - 3 month overview | W | three months of transits | "Today" |
| 107. Yearly transit overview (South Indian) | W | sign ingresses in the year | year of "Today"; natal chart only |
| 114. Kota Chakra, 115. Sanghatta Chakra, 116. Sarvatobhadra Chakra | W | the transit chakras (Sarvatobhadra with the score and the vedhas) | "Today" |
| 120. Events 1-10 | W | the events, 1 being "Today" | events |

Outside the model: Research → "Time of transits" (dialog: transiting planet, natal point,
event type, "For dates after"; returns the first event) and Print → "Transit/dasha
Report" (its own dialog, month window "from"–"to", transit and
dasha preferences). Both are left to the 5A plan (its last task: a fixed set of queries). "Transit Interpretations" is interpretive text: outside the stage.

Options: ayanamsha, true/mean nodes and sunrise (already covered in stages 2–4);
the Ashtakavarga bindu table (Parashara or Brihat Jataka, Options → Calculation);
the window of the timelines (centre or fix).

### 5B — Panchanga

| Page | Type | Shows | Instant / place |
|---|---|---|---|
| (201) Panchanga Details | R | tithi, vara, nakshatra, yoga, karana with their ends; Rahu Kaala; Ghat chakra | birth |
| (314) Basic Calculations | R | Avakhada chakra, Hindu and Tamil calendars | birth |
| 72. Tithi Pravesh | W | the Tithi Pravesh chart of the year, D9 and Vimshottari | year of "Today"; birth |
| 73. Tithi Pravesh (L) | W | the same at the current place | year of "Today"; "Today" |
| 8. Sunrise chart | W | the sunrise chart | day of "Today" |
| 39. Panch Pakshi | W | the bird and the periods of the day | "Today" |
| 104. Calendar | W | calendar with transits and dashas | month of "Today" |

The panchanga of the two reference instants comes from the tables of the transit worksheets
(Animated transits I) and of the Muhurta; that of birth, from (201) and (314).

Outside the model: Print → Panchang (about two weeks per page; period chosen on the
screen itself; place "Native's current location"). It is left to the 5B plan, as a fixed
set of printouts (the month of each reference date).

Options: Options → Panchang: the columns of the Panchang printout; "Indian Calendar" with
Krishnadi (P.Anta) (the default), Shukladi (Amanta) and Krishnadi (P.Anta) 1/2 (changes the names of the
lunar month and year); "Display seconds" (off; on gives the ends to the second, useful for
the check); the chart style (presentation only). Options → Calculation → Miscellaneous:
"Sunrise" and "Gulik method".

### 5C — Varshaphala

| Page | Type | Shows | Instant / place |
|---|---|---|---|
| (339)–(344) Varshaphala Charts #1–#6 | R | 72 solar returns: date, time, chart, positions, year lord, Muntha | none; birth |
| (401) Basic Calculations | R | data of the true solar return, ayanamsha, Lagna | age asked; birth |
| (402) Natal Chart, (403) Chart and Planetary Details | R | charts and positions | age asked |
| (404) Planetary Strength, etc. | R | Panchadhikaris, year lord, Tajika strengths | age asked |
| (405) Tajika Yogas (Summary), (415) Tajika Yogas (Detailed) | R | the Tajika yogas | age asked |
| (406) Tripataki Chakra | R | the chakra and the vedhas | age asked |
| (407) Sahams | R | the Sahams | age asked |
| (408) Mudda Dasha, (409) Mudda Dasha (Kalidasa), (410) Mudda Dasha (without dasha balance), (411) Patyayini Dasha | R | the annual dashas | age asked |
| (417), (418) Consolidated Report #1, #2 | R | summary, Harsha and Panchavargeeya bala | age asked |
| (425) Varshaphala Monthly Charts | R | the 12 monthly charts | age asked |
| 64–66. Varshaphala I, II, III | W | annual chart, "Varsh. year lord" and "Varsh. strength" tables, dashas | year of "Today"; birth |
| 67. Varshaphala I (L) | W | the same at the current place | year of "Today"; "Today" |
| 70. Varshaphala 8 years overview | W | eight years | from the year of "Today" |
| 75. Monthly Solar Ret. I, 81. Daily Solar Return I | W | monthly and daily returns | "Today" |
| 89. Varshaphala Dashas | W | the four annual dashas | year of "Today" |
| 74. Sahams, 91. Tajika Yogas Summary, 92. Tripataki Chakra | W | the same things on screen | year of "Today" |

Worksheets II and III of the returns and the remaining (L) variants (68, 69, 71, 76–80,
82–88) were left out of the TEMPO model: they repeat, at another instant or place, what the pages
of the model already show; 5C adds them if it needs any.

Options: Options → Dashas, "Varshaphala dasha interpretation method": Mudda dasha (the
default), Mudda dasha (Kalidasa), Mudda dasha (without dasha balance), Patyayini dasha (changes
the dasha of the worksheets; the reports carry all four on their own pages). Options →
Calculation → Miscellaneous, "Varshaphala": "True solar return" (the default) or "Mean solar
return". Display → "Varshaphala headers" (presentation only).

### 5D — Muhurta

| Page | Type | Shows | Instant / place |
|---|---|---|---|
| 127. Muhurta | W | Muhurta chart and D9; positions, dignity, Shadbala, Vimshopaka, Ashtakavarga (kaksha, bindus); "qualities of the day"; panchang thermometer (Tarabala, Chandrabala, tithi, nakshatra, yoga, karana); activities of the nakshatra and of the tithi | "Muhurta" event; astrologer's place |
| 128. Muhurta - dashas and balas | W | dashas of the native and of the Muhurta; balas | same |
| 129. Muhurta vargas | W | the vargas of the Muhurta | same |

PL9 does not search for moments by itself: the Muhurta is the evaluation of a given instant (the manual
refers the search to another product). The 5D answer keys are therefore evaluations at fixed
instants: the two reference dates (the "Muhurta" event saved like the "Today") in the 135
charts (printed in stage 5.0), plus the three thermometer activities ("General
Auspicious Events", "Marriage", "Traveling"), which are switched by clicking the cell: left to the
5D plan.

Options: the thermometer activity (in the cell title); Options → Calculation →
Miscellaneous, "Muhurta dates": "Use current date" (the default) or "Use last used date" (where
the worksheet starts from; does not change the rules).

## 3. The second instant in the executable

Read in the dispatch (the rules of each area are left to its sub-project):

- **Events.** Each event stores the local date and time, the longitude, the latitude, the time zone
  and the daylight saving time; the instant in UT is the local date plus (time zone − DST)/24 in
  PL9's convention. Event 1 is "Today" (the same one that Edit → "Native's current
  location" edits); event 2 is "Muhurta".
- **"Now".** "Today" in "now" mode reads the machine clock and converts it with the time zone of the
  default place. The "now" transit charts (without an event) take the clock and the **installation's
  default place**, not the place of birth nor that of event 1; the
  event transit charts take the date and place of the event. The test printout (task 3)
  checks which of the two each worksheet uses: a worksheet that follows the clock instead of
  event 1 would have to be removed from the model or printed by another path.
- **The Varshaphala year.** The completed years are the integer part of (date − birth)
  / 365.25636 days (the mean sidereal year), also in true-return mode; the monthly
  and daily returns take the months and days from the fraction. With the true return (the default), the
  instant is searched starting from birth + 365.2422 × years, with exactly three
  Newton steps (one day per degree) on the Sun's longitude, without a tolerance test;
  with the mean one, it is birth + 365.25636 × years (+ 30.43803 per month, + 1.01460 per day).
- **The places.** Varshaphala, monthly return, daily return and Tithi Pravesh use the place
  of birth; the (L) variants use the place of event 1. The Tithi Pravesh first searches
  for the Sun's return and then for the birth Moon − Sun angle.
- **The year lord** is chosen among the five Panchadhikaris (Muntha Pati, lords of the
  natal and annual Lagna, Trirashi Pati, Dina-Ratri Pati) by strength and by Ithasala with the
  Moon: the rule is left to 5C.
- **What was not found by text:** the names of the annual dashas (Mudda, Patyayini) and of the
  Tajika strengths (Panchavargiya, Dwadashavargiya) do not appear as text in the executable;
  the routines will be found in 5C through the page that prints them. Where the options
  of the Panchang tab are stored was also left open.
- **Confirmed options:** the true or mean return; the Varshaphala header; the
  annual dasha method (four values); "Muhurta dates"; the transit cache and the
  animation speed (performance and presentation only).

## 4. The TEMPO model

Pages, in this order (the number in parentheses is the report's; the worksheets by name
and number from the "Available printouts" list):

1. (201) Panchanga Details
2. (314) Basic Calculations
3. (339)–(344) Varshaphala Charts #1 to #6
4. (401) to (411), (415), (417), (418), (425) — the Varshaphala pages of section 5C
5. 101. Animated transits I; 102. Animated transits II; 103. Animated Transits - Vargas
6. 113. Kaksha and dasha calendar; 108. Dasha and Transit timelines; 105. Graphical
   Ephemeris; 106. Graphical ephemeris - 3 month overview; 107. Yearly transit overview
   (South Indian)
7. 114. Kota Chakra; 115. Sanghatta Chakra; 116. Sarvatobhadra Chakra
8. 120. Events 1-10; 8. Sunrise chart; 39. Panch Pakshi; 104. Calendar
9. 72. Tithi Pravesh; 73. Tithi Pravesh (L)
10. 64. Varshaphala I; 65. Varshaphala II; 66. Varshaphala III; 67. Varshaphala I (L);
    70. Varshaphala 8 years overview; 75. Monthly Solar Ret. I; 81. Daily Solar Return I;
    89. Varshaphala Dashas; 74. Sahams; 91. Tajika Yogas Summary; 92. Tripataki Chakra
11. 127. Muhurta; 128. Muhurta - dashas and balas; 129. Muhurta vargas

The test printout (task 3) tells whether the Varshaphala report pages ask for the
age also inside the model; if they do, the job answers with the age at the reference
date, checked by capture like the date.

## 5. What the test printout showed (REF 0010, 2026-10-17)

The TEMPO model prints the 60 pages with legible text. What fixes the date of each part:

| Part | Date used | How the job fixes it |
|---|---|---|
| Muhurta (127, 128, 129), with the panchanga, the thermometer, Tarabala, Chandrabala, positions, kakshas and bindus | the "Muhurta" event | saves the event at the reference date |
| Varshaphala reports (401 to 425) | the age asked (three questions per chart) | answers the age at the reference date: the integer part of (date − birth) / 365.25636; a chart born after the date gets age 0 (the one PL9 proposes is negative and refused for a chart born after today) |
| Varshaphala Charts #1 to #6 | none | — |
| Transits (101, 102, 103, 105, 106, 107, 113, 108), chakras, Events, Sunrise, Panch Pakshi, Calendar, Tithi Pravesh, Varshaphala worksheets (64 to 89) | the machine clock ("now"), not the "Today" event | none: each page carries printed the instant used, which the reader takes as input |

Decisions this brought (by the builder):

- The two reference dates apply to the Muhurta and to the Varshaphala ages; the
  parts tied to the clock are checked at the instant printed on each page.
- Saving an event through the dialog also re-saves the birth from the fields on the
  screen, the time to the whole second and the coordinates to the arc second. The stage 5 answer keys therefore use
  copies of the 135 charts with the birth already rounded this way and the place in manual mode
  (`refset/xml-tempo`, outside the repository); in them the natal chart does not change on saving (the
  chart screen stays identical pixel for pixel). For REF 0010 the natal Ascendant goes from
  16:30:55 to 16:30:50. The job closes the chart without saving.
- Without "Manual" in the event's place, changing the date makes PL9 query the atlas and close.

## 6. Where each page is checked (closing, stage 5G)

The bench (`pnpm --filter @reverse/oracle verify`) checks in the 135 charts, at the two reference
dates, what each page prints as text; the drawings are left to stage 6.

| Page | Checked | Where the rule is |
|---|---|---|
| (201) Panchanga Details, (314) Basic Calculations | elements, ends, Avakhada, calendars (with 42 pending) | panchanga.md |
| (339)–(344) Varshaphala Charts #1–#6 | the 72 returns of each chart | varshaphala.md |
| (401)–(425) Varshaphala reports | return, chart, strengths, year lord, yogas, Tripataki, Sahams, the four dashas, the months (Kutta and Tambira not) | varshaphala.md |
| 101, 102. Animated transits I, II | positions, R, kakshas, Shadbala, Tarabala, Chandrabala, Gochara data, the instant and the place | transits.md |
| 103. Animated Transits - Vargas | the D9 and D10 tables | transits.md |
| 104. Calendar | the events of the month | transits.md |
| 105. Graphical Ephemeris, 108. Dasha and Transit timelines | no: graphs and timelines without dates in text; the table of 108 repeats that of 106 | — |
| 106. Graphical ephemeris - 3 month overview | the KP lords, the SB# and the VB of the transits (the VB of the nodes pending where it differs); the graph not | transits.md |
| 107. Yearly transit overview | the sign ingresses with a legible day | transits.md |
| 113. Kaksha and dasha calendar | the month's labels and the numbers under them | transits.md |
| 114. Kota Chakra | the positions, and the score (`check-chakras`) | transits.md |
| 115. Sanghatta, 116. Sarvatobhadra | the vedhas: the Sanghatta's chords, the Sarvatobhadra's pierced cells (`check-chakras`) | transits.md |
| 120. Events 1-10 | the dates and the four dashas of the two events | transits.md |
| 8. Sunrise chart | the positions and the 15 Vimshottari lines | panchanga.md |
| 39. Panch Pakshi | the header, the ten yamas and the 50 parts | panchanga.md |
| 72, 73. Tithi Pravesh | the instant, in both variants | panchanga.md |
| 64–66, 74. Varshaphala I–III, Sahams | return, annual chart table, kakshas, strengths, offices, Muntha, Sahams; the dasha lists of 64 and 65 | varshaphala.md |
| 75, 81, 89 | the monthly and daily returns and the dasha lists (the Patyayini of eight charts pending) | varshaphala.md |
| 67. Varshaphala I (L), 70. Varshaphala 8 years overview, 91, 92 | no: 67 repeats 64 at another place; 70, 91 and 92 are drawn charts (the returns of 70 are those already checked in the Varshaphala Charts) | varshaphala.md |
| 127–129. Muhurta | positions, strengths, panchanga, thermometer, dashas, balas, vargas (the VB of the nodes pending) | muhurta.md |
