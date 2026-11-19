// Trimmed to the accents most common in Western European Latin languages (French especially) -
// extend if a language you care about needs more (e.g. tilde-n, tilde-a, tilde-o).
const ACCENT_VARIANTS = {
    a: ['a', 'à', 'â'],
    c: ['c', 'ç'],
    e: ['e', 'é', 'è', 'ê', 'ë'],
    i: ['i', 'î', 'ï'],
    o: ['o', 'ô'],
    u: ['u', 'ù', 'û', 'ü']
};

// Caps the cartesian product below - a handful of accentable letters in a short word is fine, but
// combinations grow multiplicatively with word length, so long words fall back to a plain search
// instead of sending an enormous constraint list.
const MAX_ACCENT_VARIANTS = 64;

// U+0300-U+036F is the block of combining diacritical marks NFD decomposition produces (e.g.
// "e" + combining acute for an accented e) - stripping them is how we detect/normalize accents
// without a third-party dependency.
export const stripAccents = value => value.normalize('NFD').replace(/[̀-ͯ]/g, '');

/**
 * Whether the term already contains an accented character - if so, it should match only its exact
 * accented spelling rather than being expanded.
 */
export const hasAccentedCharacters = term => stripAccents(term) !== term;

/**
 * Every plausible accented spelling of an unaccented term, so a search for e.g. "cafe" also matches
 * a title spelled with an accented e. Returns just the (lowercased) term itself when it has no
 * accentable letters, or when expanding it would exceed MAX_ACCENT_VARIANTS.
 */
export const buildAccentVariants = term => {
    const lower = term.toLowerCase();
    const letterOptions = [...lower].map(character => ACCENT_VARIANTS[character] || [character]);
    const totalCombinations = letterOptions.reduce((total, options) => total * options.length, 1);

    if (totalCombinations > MAX_ACCENT_VARIANTS) {
        return [lower];
    }

    return letterOptions.reduce(
        (variants, options) => variants.flatMap(prefix => options.map(option => prefix + option)),
        ['']
    );
};

/**
 * Builds the nodeConstraint value for the search query: an exact (case-insensitive) match when the
 * term already has an accent, otherwise an `any` list matching every accented variant of it.
 * @param {string} term the trimmed search term
 * @returns {object} an InputGqlJcrNodeConstraintInput value
 */
export const buildTitleSearchConstraint = term => {
    const variants = hasAccentedCharacters(term) ? [term.toLowerCase()] : buildAccentVariants(term);

    return {
        any: variants.map(variant => ({
            like: `%${variant}%`,
            property: 'jcr:title',
            function: 'LOWER_CASE'
        }))
    };
};
