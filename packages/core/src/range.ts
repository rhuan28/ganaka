import { julianDayUt } from '@reverse/ephemeris/time';

/** Dates for which results have been checked against PL9. */
export const VERIFIED_RANGE = {
  minJdUt: julianDayUt(1801, 1, 1),
  maxJdUt: julianDayUt(2048, 12, 31, 24),
};

/** Highest latitude, north or south, of the charts checked against PL9. Matters for the Lagna. */
export const VERIFIED_MAX_ABS_LATITUDE = 65;
