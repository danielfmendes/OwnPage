// Católica Lisbon master programs surfaced in the demographics form when
// the participant identifies as a Católica master student.
export const CATOLICA_PROGRAMS = [
    "Master in Business Analytics",
    "Master Degree in Management",
    "Master Degree in Management (International)",
    "Master Degree in Business",
    "Master Degree in Finance",
    "Master Degree in Finance (International)",
    "Master Degree in Economics",
];

// Common nationalities surfaced first; "Other" is the catch-all so we still
// get clean categorical data for analysis even for less frequent answers.
export const NATIONALITY_OPTIONS = [
    "Portuguese",
    "Brazilian",
    "Spanish",
    "French",
    "German",
    "Italian",
    "British",
    "Irish",
    "Dutch",
    "Belgian",
    "Swiss",
    "Austrian",
    "Polish",
    "Romanian",
    "Ukrainian",
    "American",
    "Canadian",
    "Indian",
    "Chinese",
    "Other",
];

export const PROFESSION_OPTIONS = [
    "Student",
    "Employed (full-time)",
    "Employed (part-time)",
    "Self-employed",
    "Unemployed",
    "Retired",
    "Other",
];

/**
 * Mock clothing catalogue used as the "returning visitor" host site inside
 * each CBC option card. The clothing context plausibly benefits from cookies
 * remembering sizes, preferences and a cart between visits.
 *
 * Photos are stable Unsplash URLs (sized + cropped via the imgix params on
 * the URL itself, so no client-side processing is needed).
 */
export const CLOTHING_PRODUCTS = [
    {
        id: "cloth_linen_shirt",
        name: "Linen Shirt",
        price: "€59",
        size: "M",
        image:
            "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=400&h=400&fit=crop&q=80",
    },
    {
        id: "cloth_crew_sweat",
        name: "Crew Sweatshirt",
        price: "€79",
        size: "M",
        image:
            "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=400&h=400&fit=crop&q=80",
    },
    {
        id: "cloth_slim_jeans",
        name: "Slim Jeans",
        price: "€89",
        size: "32",
        image:
            "https://images.unsplash.com/photo-1542272604-787c3835535d?w=400&h=400&fit=crop&q=80",
    },
];

/**
 * Personalisation hint shown in the clothing shop header — operationalises
 * the "cookies remember preferences" framing that motivates the within-
 * subjects environment factor. The participant should read this and
 * understand that this site has *something to remember* about them.
 */
export const CLOTHING_RETURNING_USER = {
    greeting: "Welcome back, Alex",
    savedSize: "M",
    cartCount: 2,
};

/**
 * Reference rate table for the mock currency converter. The visit is a
 * one-shot utility — there is nothing useful for cookies to remember
 * between sessions, which is the whole point of contrasting it with the
 * clothing environment.
 */
export const CURRENCY_PAIR = {
    from: {code: "EUR", flag: "🇪🇺", name: "Euro", amount: "100.00"},
    to: {code: "USD", flag: "🇺🇸", name: "US Dollar", amount: "109.45"},
    rate: "1.0945",
    inverseRate: "0.9137",
    asOf: "Today · 14:32 UTC",
    delta: "+0.12%",
};

/**
 * Strip of "popular pairs" rendered under the converter — pure visual
 * chrome that reinforces the one-shot-utility framing (you came here for
 * a number, you leave with a number).
 */
export const CURRENCY_POPULAR_PAIRS = [
    {label: "EUR → GBP", value: "0.85"},
    {label: "EUR → JPY", value: "163.4"},
    {label: "EUR → CHF", value: "0.94"},
];
