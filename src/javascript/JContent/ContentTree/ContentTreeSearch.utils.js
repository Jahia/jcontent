// Minimum token length that gets wrapped in `*`. A leading wildcard makes Lucene read the term
// dictionary, so very short tokens are sent unwrapped.
//
// The value is a deliberate trade-off and not an oversight: a one or two character term keeps the
// analyzed and the raw clauses, but loses accent-insensitive substring matching - searching `ce`
// no longer finds a page titled "Décès", since the raw `like` clause cannot fold the accent and
// the analyzed clause needs a whole index token. Lowering it buys those terms back at the price of
// a term-dictionary scan for the shortest, least selective terms of all.
const MIN_WILDCARD_TOKEN_LENGTH = 3;

/**
 * Accent folding. U+0300-U+036F is the block of combining diacritical marks NFD decomposition
 * produces (e.g. "e" + combining acute for an accented e). The final NFC recompose is not
 * cosmetic: NFD also decomposes a Hangul syllable into jamo, which sit outside that range and
 * therefore survive the strip - without the recompose the term no longer matches anything, and
 * character offsets no longer line up with the unfolded string.
 * @param {string} value the string to fold
 * @returns {string} the same string with its diacritics removed, recomposed
 */
export const fold = value => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').normalize('NFC');

/**
 * Escapes the three characters Jackrabbit treats specially inside a `like` pattern. Without this a
 * user who types a single `%` matches every node in the tree.
 * @param {string} value the raw pattern body
 * @returns {string} the body with `\`, `%` and `_` backslash-escaped
 */
export const escapeLike = value => value.replace(/[\\%_]/g, match => `\\${match}`);

/**
 * The single normalisation of the raw input, used both to build the query and to highlight the
 * match in the tree. Runs of whitespace collapse to one space, because the `like` pattern is a
 * contiguous comparison against the stored title: a term typed as `about   us` has to be sent as
 * `about us` to match a title "About us", and the highlighter has to be given the same text or the
 * row it was told to mark carries no visible highlight.
 * @param {string} input the raw value typed in the search box
 * @returns {string} the trimmed input with every run of whitespace collapsed to one space
 */
export const normalizeSearchTerm = input => input.trim().replace(/\s+/g, ' ');

/**
 * Builds the three scalars the search query needs (see ContentTreeSearch.gql-queries.js for how
 * each one is used).
 *
 * The tokenizer uses Unicode property escapes rather than `\w`: `\w` stays ASCII even under the
 * `u` flag, so `/[^\w\s]/gu` erases Cyrillic, CJK, Greek, Arabic and Hebrew entirely, and mangles
 * letters NFD leaves undecomposed such as the German sharp s and the Nordic o-slash.
 *
 * Returns null when nothing usable is left - the caller must then skip the query rather than send
 * an empty one: a `contains` clause built from an empty expression throws, and a `%%` pattern
 * matches every node.
 * @param {string} input the raw value typed in the search box
 * @returns {?{searchTerm: string, wildcardTerm: string, likePattern: string}} the query variables,
 *   or null when the input holds no usable token
 */
export const buildSearchTerms = input => {
    // `like` reads the raw stored value, so the pattern is lowercased (LOWER_CASE lowercases the
    // property, not the pattern) but NOT folded - and it keeps the punctuation the tokenizer drops.
    const lowercased = normalizeSearchTerm(input).toLowerCase();
    if (!lowercased) {
        return null;
    }

    // `contains` reads the analyzed index, and a wildcard term skips the analyzer - so fold and
    // lowercase here, before wrapping anything in `*`.
    const tokens = fold(lowercased)
        .replace(/[^\p{L}\p{N}_\s]/gu, ' ')
        .split(/\s+/)
        .filter(Boolean);
    if (tokens.length === 0) {
        return null;
    }

    return {
        // Several tokens inside one contains expression are ANDed by the repository, so one
        // expression carries them all - no per-token clause list is needed.
        searchTerm: tokens.join(' '),
        wildcardTerm: tokens
            .map(token => (token.length >= MIN_WILDCARD_TOKEN_LENGTH ? `*${token}*` : token))
            .join(' '),
        likePattern: `%${escapeLike(lowercased)}%`
    };
};
