// Tables of the birth panchanga as PL9 prints them, taken from its printouts of the 135 reference charts (the names
// are encrypted text in the program; the tables they index were read there). null: no reference chart falls there.

/** The nakshatras as the birth pages print them. */
export const BIRTH_NAKSHATRAS: readonly string[] = ["Ashwini", "Bharani", "Krittika", "Rohini", "Mrigasira", "Ardra", "Punarvasu", "Pushya", "Ashlesha", "Magha", "Poorva Phalg.", "Uttara Phalg.", "Hasta", "Chitra", "Swati", "Vishakha", "Anuradha", "Jyeshtha", "Moola", "Poorvashadha", "Uttarashadha", "Shravana", "Dhanishta", "Shatabhishak", "Poorvabhadra", "Uttarabhadra", "Revati"];

/** By the Moon's nakshatra (0 = Ashwini): yoni. */
export const BY_NAKSHATRA_YONI: readonly (string | null)[] = ["Ashwa", "Gaja", "Mesha", "Sarpa", "Sarpa", "Shwana", "Marjara", "Mesha", "Marjara", "Mushaka", "Mushaka", "Gau", "Mahisha", "Vyaghra", "Mahisha", "Vyaghra", "Mriga", "Mriga", "Shwana", "Vanara", "Nakula", "Vanara", "Simha", "Ashwa", "Simha", "Gau", "Gaja"];

/** By the Moon's nakshatra (0 = Ashwini): gana. */
export const BY_NAKSHATRA_GANA: readonly (string | null)[] = ["Deva", "Manushya", "Rakshasa", "Manushya", "Deva", "Manushya", "Deva", "Deva", "Rakshasa", "Rakshasa", "Manushya", "Manushya", "Deva", "Rakshasa", "Deva", "Rakshasa", "Deva", "Rakshasa", "Rakshasa", "Manushya", "Manushya", "Deva", "Rakshasa", "Rakshasa", "Manushya", "Manushya", "Deva"];

/** By the Moon's nakshatra (0 = Ashwini): nadi. */
export const BY_NAKSHATRA_NADI: readonly (string | null)[] = ["Adya", "Madhya", "Antya", "Antya", "Madhya", "Adya", "Adya", "Madhya", "Antya", "Antya", "Madhya", "Adya", "Adya", "Madhya", "Antya", "Antya", "Madhya", "Adya", "Adya", "Madhya", "Antya", "Antya", "Madhya", "Adya", "Adya", "Madhya", "Antya"];

/** By the Moon's nakshatra (0 = Ashwini): yunja. */
export const BY_NAKSHATRA_YUNJA: readonly (string | null)[] = ["Poorva", "Poorva", "Poorva", "Poorva", "Poorva", "Madya", "Madya", "Madya", "Madya", "Madya", "Madya", "Madya", "Madya", "Madya", "Madya", "Madya", "Madya", "Antya", "Antya", "Antya", "Antya", "Antya", "Antya", "Antya", "Antya", "Antya", "Poorva"];

/** By the Moon's nakshatra (0 = Ashwini): nakshatraPaya. */
export const BY_NAKSHATRA_NAKSHATRAPAYA: readonly (string | null)[] = ["Gold", "Gold", "Iron", "Iron", "Iron", "Silver", "Silver", "Silver", "Silver", "Silver", "Silver", "Silver", "Silver", "Silver", "Silver", "Silver", "Silver", "Copper", "Copper", "Copper", "Copper", "Copper", "Copper", "Copper", "Copper", "Copper", "Gold"];

/** By the Moon's sign (0 = Aries): varna. */
export const BY_SIGN_VARNA: readonly (string | null)[] = ["Kshatriya", "Vaishya", "Shudra", "Brahmin", "Kshatriya", "Vaishya", "Shudra", "Brahmin", "Kshatriya", "Vaishya", "Shudra", "Brahmin"];

/** By the Moon's sign (0 = Aries): tatva. */
export const BY_SIGN_TATVA: readonly (string | null)[] = ["Agni", "Bhoomi", "Vaayu", "Jala", "Agni", "Bhoomi", "Vaayu", "Jala", "Agni", "Bhoomi", "Vaayu", "Jala"];

/** By the Moon's sign (0 = Aries): rashish. */
export const BY_SIGN_RASHISH: readonly (string | null)[] = ["Mars", "Venus", "Mercury", "Moon", "Sun", "Mercury", "Venus", "Mars", "Jupiter", "Saturn", "Saturn", "Jupiter"];

/** The Ghat Chakra by the Moon's sign (0 = Aries): ghatMonth. */
export const GHAT_MONTH: readonly (string | null)[] = ["Karttika", "Margashirsha", "Ashadha", "Pausha", "Jyeshtha", "Bhadrapada", "Magha", "Ashvina", "Shravana", "Vaishakha", "Chaitra", "Phalguna"];

/** The Ghat Chakra by the Moon's sign (0 = Aries): ghatTithi. */
export const GHAT_TITHI: readonly (string | null)[] = ["1/6/11", "5/10/15", "2/7/12", "2/7/12", "3/8/13", "5/10/15", "4/9/14", "1/6/11", "3/8/13", "4/9/14", "3/8/12", "5/10/15"];

/** The Ghat Chakra by the Moon's sign (0 = Aries): ghatDay. */
export const GHAT_DAY: readonly (string | null)[] = ["Sunday", "Saturday", "Monday", "Wednesday", "Saturday", "Saturday", "Thursday", "Friday", "Friday", "Tuesday", "Thursday", "Friday"];

/** The Ghat Chakra by the Moon's sign (0 = Aries): ghatNakshatra. */
export const GHAT_NAKSHATRA: readonly (string | null)[] = ["Magha", "Hasta", "Swati", "Anuradha", "Mula", "Shravana", "Shatabhisha", "Revati", "Bharni", "Rohini", "Ardra", "Ashlesha"];

/** The Ghat Chakra by the Moon's sign (0 = Aries): ghatYoga. */
export const GHAT_YOGA: readonly (string | null)[] = ["Vishkambha", "Shukla", "Parigha", "Vyaghata", "Dhriti", "Shukla", "Shukla", "Vyatipata", "Vajra", "Vaidhriti", "Ganda", "Vajra"];

/** The Ghat Chakra by the Moon's sign (0 = Aries): ghatKarana. */
export const GHAT_KARANA: readonly (string | null)[] = ["Bava", "Shakuni", "Kaulava", "Naga", "Bava", "Kaulava", "Taitila", "Gara", "Taitila", "Shakuni", "Kinstughna", "Chatushpada"];

/** The Ghat Chakra by the Moon's sign (0 = Aries): ghatPrahar. */
export const GHAT_PRAHAR: readonly (string | null)[] = ["1", "4", "3", "1", "1", "1", "4", "1", "1", "4", "3", "4"];

/** The Ghat Chakra by the Moon's sign (0 = Aries): ghatChandra. */
export const GHAT_CHANDRA: readonly (string | null)[] = ["Mesha", "Kanya", "Kumbha", "Simha", "Makar", "Mithuna", "Dhanu", "Vrishabh", "Meen", "Simha", "Dhanu", "Kumbha"];

/** By the Moon's nakshatra pada (0 = Ashwini 1 … 107 = Revati 4): naamakshar. */
export const BY_PADA_NAAMAKSHAR: readonly (string | null)[] = ["Chu", "Chay", "Cho", "Lah", "Lee", "Loo", "Lay", "Loh", "Ah", null, "Oo", "Ay", "Oh", "Vah", "Vee", "Voo", "Vay", "Vo", "Kah", "Kee", "Koo", "Gha", "Nga", "Cha", "Kay", "Koh", "Hah", "Hee", "Hoo", "Hay", "Hoh", "Dah", "Dee", "Doo", "Day", "Doh", "Mah", "Mee", "Moo", "May", "Moh", "Tah", "Tee", "Too", "Tay", "Toh", "Pah", "Pee", "Poo", "Shah", "Nuh", "Tuh", "Pay", null, "Rah", "Ree", "Roo", "Ray", "Roh", "Tah", "Tee", "Too", "Tay", "Toh", "Nah", "Nee", null, "Nay", "Noh", "Yah", "Yee", "Yoo", "Yay", "Yoh", "Bha", "Bhe", "Bho", "Dah", "Pah", "Dah", "Bay", "Boh", "Jah", "Jee", "Khi", "Khu", "Khe", "Kho", "Gah", "Gee", "Goo", "Gay", "Goh", "Sah", "See", "Soo", null, "Soh", "Dah", "Dee", "Doo", "Th", "Jha", "Jya", "Day", "Doh", null, "Chee"];

/** By the Moon's nakshatra pada (0 = Ashwini 1 … 107 = Revati 4): varga. */
export const BY_PADA_VARGA: readonly (string | null)[] = ["Simha", "Simha", "Simha", "Mriga", "Mriga", "Mriga", "Mriga", "Mriga", "Garuda", null, "Garuda", "Garuda", "Garuda", "Mriga", "Mriga", "Mriga", "Mriga", "Mriga", "Marjara", "Marjara", "Marjara", "Marjara", "Marjara", "Simha", "Marjara", "Marjara", "Mesha", "Mesha", "Mesha", "Mesha", "Mesha", "Shwana", "Shwana", "Shwana", "Shwana", "Shwana", "Udara", "Udara", "Udara", "Udara", "Udara", "Shwana", "Shwana", "Shwana", "Shwana", "Shwana", "Udara", "Udara", "Udara", "Mesha", "Shwana", "Shwana", "Udara", null, "Mriga", "Mriga", "Mriga", "Mriga", "Mriga", "Sarp", "Sarp", "Sarp", "Sarp", "Sarp", "Sarp", "Sarp", null, "Sarp", "Sarp", "Mriga", "Mriga", "Mriga", "Mriga", "Mriga", "Udara", "Udara", "Udara", "Sarp", "Udara", "Shwana", "Udara", "Udara", "Simha", "Simha", "Marjara", "Marjara", "Marjara", "Marjara", "Marjara", "Marjara", "Marjara", "Marjara", "Marjara", "Mesha", "Mesha", "Mesha", null, "Mesha", "Sarp", "Sarp", "Sarp", "Simha", "Simha", "Sarp", "Sarp", "Sarp", null, "Simha"];
