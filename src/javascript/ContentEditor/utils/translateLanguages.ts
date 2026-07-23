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
