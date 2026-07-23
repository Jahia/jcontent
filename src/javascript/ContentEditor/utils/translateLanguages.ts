/**
 * Language defaulting for the Content Editor "translate" mode (issue #2484).
 *
 * In translate mode the editable/target language is always the language the editor is
 * currently on; only the source (read-only) language has to be picked. These helpers
 * compute that source language for the two entry points into translate mode.
 */

interface TranslateSourceLanguageParams {
    /** active-in-edit language codes */
    languages?: string[];
    /** language codes the node is translated into */
    translationLanguages?: string[];
    /** the site default language code */
    defaultLanguage?: string;
    /** the editable (target) language code */
    targetLanguage: string;
}

interface FirstOtherLanguageParams {
    /** active-in-edit language codes */
    languages?: string[];
    /** the language to exclude (the editable/target language) */
    currentLanguage: string;
}

interface FirstUntranslatedLanguageParams {
    /** active-in-edit language codes */
    languages?: string[];
    /** language codes the node is already translated into */
    translationLanguages?: string[];
    /** the source language to exclude (the language being translated from) */
    currentLanguage: string;
}

/**
 * Source language when entering translate mode by switching the header tab from edit to
 * translate (scenario 1). Among the languages that are active in edit AND already have a
 * translation, excluding the target language, prefer the site default language, then the
 * first one alphabetically. Falls back to the target language when nothing else matches.
 *
 * @param params the languages, translations, default and target language
 * @returns the source language code
 */
export const getTranslateSourceLanguage = ({languages = [], translationLanguages = [], defaultLanguage, targetLanguage}: TranslateSourceLanguageParams): string => {
    const candidates = languages.filter(language =>
        language !== targetLanguage && translationLanguages.includes(language)
    );

    if (candidates.length === 0) {
        return targetLanguage;
    }

    if (defaultLanguage && candidates.includes(defaultLanguage)) {
        return defaultLanguage;
    }

    return [...candidates].sort((a, b) => a.localeCompare(b))[0];
};

/**
 * The first active-in-edit language, alphabetically, that differs from the given language.
 * Used to default the source (read-only) language of the right-click "Translate" action
 * (scenario 2). Falls back to the given language when it is the only active language.
 *
 * @param params the active languages and the language to exclude
 * @returns the source language code
 */
export const getFirstOtherLanguage = ({languages = [], currentLanguage}: FirstOtherLanguageParams): string => {
    const candidates = languages
        .filter(language => language !== currentLanguage)
        .sort((a, b) => a.localeCompare(b));

    return candidates[0] ?? currentLanguage;
};

/**
 * Target (editable) language for the right-click "Translate to" action (scenario 2): translate
 * *from* the current language *to* another one. Among the active-in-edit languages, excluding the
 * current (source) language, pick the first one alphabetically that does not yet have a translation.
 * When every other language is already translated there is nothing left to translate to, so fall
 * back to the first other language alphabetically (and to the current language if it is the only one).
 *
 * @param params the active languages, existing translations and the current (source) language
 * @returns the target language code
 */
export const getFirstUntranslatedLanguage = ({languages = [], translationLanguages = [], currentLanguage}: FirstUntranslatedLanguageParams): string => {
    const untranslated = languages
        .filter(language => language !== currentLanguage && !translationLanguages.includes(language))
        .sort((a, b) => a.localeCompare(b));

    return untranslated[0] ?? getFirstOtherLanguage({languages, currentLanguage});
};
