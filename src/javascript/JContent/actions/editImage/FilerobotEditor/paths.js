/*
 * Small helpers for the JCR file path the image editor works with.
 */

/**
 * The last path segment (the file name). The JCR path is NOT URI-encoded, so the name is
 * used verbatim — decoding it would throw on legal names containing '%'.
 *
 * @param {string} path JCR path, e.g. /sites/mysite/files/my image.jpg
 * @returns {string} the file name, e.g. "my image.jpg"
 */
export const getNodeName = path => path.substring(path.lastIndexOf('/') + 1);

/**
 * Percent-encodes each path segment while keeping the '/' separators, so the /files URL is
 * valid for names containing spaces or special characters.
 *
 * @param {string} path JCR path
 * @returns {string} the path with each segment URI-encoded
 */
export const encodeJcrPath = path => path.split('/').map(encodeURIComponent).join('/');
