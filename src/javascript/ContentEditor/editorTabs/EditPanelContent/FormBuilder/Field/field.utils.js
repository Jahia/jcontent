// eslint-disable-next-line no-warning-comments
// TODO: BACKLOG-13219 adapt this when fetching the data, not here, it's too late.
export const buildFlatFieldObject = field => {
    if (!field.selectorOptions) {
        return field;
    }

    const selectorOptions = field.selectorOptions ?
        field.selectorOptions.reduce((acc, option) => {
            return {
                ...acc,
                [option.name]: option.value
            };
        }, {}) :
        {};

    return {
        ...field,
        selectorOptions
    };
};

/**
 * The options an error message is translated with.
 *
 * Escaping is off because the result is rendered as a React text node, which escapes it again.
 * Several of these messages carry text this UI did not write: constraintViolation is literally
 * "{{0}}", the untouched constraint.error.message from the definition, and invalidLink
 * interpolates a link. i18next escapes interpolated values by default, which turns an apostrophe
 * into &#39; and a slash into &#x2F; -- and React then prints those as written. Nothing is
 * injectable through this, since React never treats the result as markup.
 *
 * Exported so the behavioural test can translate through the real locale bundle with the very
 * options the component passes, rather than restating them and drifting from it.
 */
export const errorTranslationOptions = (field, errorArgs) => ({
    ...buildFlatFieldObject(field),
    ...errorArgs,
    interpolation: {escapeValue: false}
});
