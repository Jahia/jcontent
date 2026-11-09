/**
 * Whether a node is previewed as rendered content, which is what a viewport width is meant for.
 * A file is shown by its own viewer (image, PDF, document) and a folder has nothing to render, so
 * neither has a layout to see at another width.
 *
 * @param {object} nodeData - the previewed node, with isFile and isFolder when the query asked for them
 * @returns {boolean} - true when the viewport selector applies
 */
export const supportsViewport = nodeData => Boolean(nodeData) && !nodeData.isFile && !nodeData.isFolder;
