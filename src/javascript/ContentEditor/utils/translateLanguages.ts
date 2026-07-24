/**
 * Implemented rules of https://github.com/Jahia/jcontent/issues/2484
 * @module
 */

/** When switching from advanced to translate, find the most relevant source language. */
export function getBestSourceLanguage(
    targetLanguage: string,
    availableTranslations: string[],
    defaultLanguage: string | undefined
) {
    // Only happens on incomplete data, return the language we're sure exists
    if (!defaultLanguage) {
        return targetLanguage;
    }

    // If the default language has a translation, use it
    if (
        targetLanguage !== defaultLanguage &&
        availableTranslations.includes(defaultLanguage)
    ) {
        return defaultLanguage;
    }

    // Return the first available translation that is not the target language, fallback to current language if none is found
    return (
        availableTranslations.find(lang => lang !== targetLanguage) ??
        targetLanguage
    );
}

/** When opening the translation panel from `Right click > Translate to`, find the most relevant target language. */
export function getBestTargetLanguage(
    sourceLanguage: string,
    availableTranslations: string[],
    activeLanguages: string[]
) {
    const set = new Set(availableTranslations);

    const nonSourceLanguages = activeLanguages.filter(
        lang => lang !== sourceLanguage
    );

    // Return the first non-source active language that does not have a translation yet.
    // If the node is fully translated, return the first non-source active language alphabetically.
    // Fall back to the source language.
    return nonSourceLanguages.find(lang => !set.has(lang)) ?? nonSourceLanguages[0] ?? sourceLanguage;
}
