
export const ELLIPSIS = '...';

export const truncate = (string, num) => {
    if (string.length <= num) {
        return string;
    }

    return string.slice(0, num) + ELLIPSIS;
};

/**
 * Truncates a string in the middle with ellipsis, prioritizing back characters.
 * Attempts to preserve context by truncating after the first separator when possible.
 *
 * @param {string} str - The string to truncate
 * @param {number} maxLength - The maximum length of the resulting string (including ellipsis)
 * @param {string[]} [separators=['/', '.']] - Array of separator characters to consider for context-aware truncation
 * @returns {string} The truncated string with ellipsis in the middle
 */
export const truncateMiddle = (str, maxLength, separators = ['/', '.']) => {
    if (str.length <= maxLength) {
        return str;
    }

    // Always add ellipsis, keep at least 3 chars when possible, minimum 2 chars
    const minCharsToKeep = Math.max(2, Math.min(3, maxLength));

    // For very small maxLength, just take chars and add ellipsis
    if (maxLength <= ELLIPSIS.length) {
        return str.slice(0, minCharsToKeep) + ELLIPSIS;
    }

    // Calculate front and back chars
    const charsAvailable = maxLength - ELLIPSIS.length;
    const separatorIndex = Math.min(
        ...separators.map(sep => str.indexOf(sep))
    );
    const hasContext = separatorIndex > -1;

    // Default 40/60 split
    let backChars = Math.ceil(charsAvailable * 0.6);
    let frontChars = charsAvailable - backChars;

    if (hasContext) {
        const lastSeparatorIndex = Math.max(
            ...separators.map(sep => str.lastIndexOf(sep))
        );
        const frontContext = separatorIndex + 1;
        const backContext = (str.length - 1) - lastSeparatorIndex;
        const remainingBackChars = charsAvailable - frontContext;

        // Keep front context if we have enough space between default split (backChars) and back context
        // otherwise we use default 40/60 split
        if (remainingBackChars > backChars || remainingBackChars > backContext) {
            frontChars = frontContext;
            backChars = remainingBackChars;
        }
    }

    return str.slice(0, frontChars) + ELLIPSIS + str.slice(-backChars);
};
