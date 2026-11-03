/**
 * Puts a string on the system clipboard.
 *
 * `navigator.clipboard` is only exposed in a secure context, and a Jahia server is
 * routinely reached over plain HTTP on a host name, where the object is simply absent.
 * The deprecated `document.execCommand('copy')` carries no such restriction, so it is
 * kept as the fallback for those deployments.
 *
 * @param {string} text - The text to put on the clipboard
 * @returns {Promise} Resolved once the text is on the clipboard, rejected if the browser refused
 */
export const copyToClipboard = text => {
    if (navigator.clipboard) {
        return navigator.clipboard.writeText(text);
    }

    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.setAttribute('readonly', '');
    // Placed off-screen rather than hidden: execCommand copies the current selection,
    // and an element the browser does not render cannot carry one.
    textarea.style.position = 'fixed';
    textarea.style.top = '-1000px';
    textarea.style.opacity = '0';
    document.body.append(textarea);
    textarea.select();

    try {
        if (!document.execCommand('copy')) {
            return Promise.reject(new Error('The browser refused the copy'));
        }
    } catch (error) {
        return Promise.reject(error);
    } finally {
        textarea.remove();
    }

    return Promise.resolve();
};
