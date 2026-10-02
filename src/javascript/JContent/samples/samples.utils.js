export const SAMPLES_FOLDER_NAME = 'samples';
export const SAMPLES_FOLDER_TYPE = 'jnt:samplesFolder';
export const SAMPLES_CATEGORY_TYPE = 'jnt:samplesCategory';

export const SAMPLES_PAGES_NAME = 'pages';
export const SAMPLES_COMPONENTS_NAME = 'components';

/**
 * Path of a site's samples branch, where every content sample of that site lives.
 *
 * @param {string} sitePath - path of the site, e.g. /sites/digitall
 * @returns {string} - path of the samples branch
 */
export const getSamplesPath = sitePath => `${sitePath}/${SAMPLES_FOLDER_NAME}`;

/**
 * Which of the two categories a sample belongs to.
 *
 * The node type decides, so saving a sample never asks the author where to put it - that question
 * was the whole complaint about the first version of this flow.
 *
 * @param {boolean} isPage - whether the node being saved is a page
 * @returns {string} - name of the category node
 */
export const getSampleCategoryName = isPage => (isPage ? SAMPLES_PAGES_NAME : SAMPLES_COMPONENTS_NAME);

/**
 * Path of the category a sample of this kind is stored in.
 *
 * @param {string} sitePath - path of the site
 * @param {boolean} isPage - whether the node being saved is a page
 * @returns {string} - path of the category node
 */
export const getSampleCategoryPath = (sitePath, isPage) =>
    `${getSamplesPath(sitePath)}/${getSampleCategoryName(isPage)}`;

/**
 * The site a path belongs to, which is what scopes the samples branch: samples are per-site,
 * because the same content type is laid out differently from one site's template set to the next.
 *
 * @param {string} path - any JCR path
 * @returns {string|null} - the site path, or null when the path is not inside a site
 */
export const getSitePath = path => /^(\/sites\/[^/]+)(\/.*)?$/.exec(path)?.[1] ?? null;

/**
 * The page whose rendering supplies the CSS a sample preview is dressed in.
 *
 * A sample renders on its own as a module, which returns its markup but collects no stylesheet, so
 * the preview fetches a page alongside it purely for the <link> tags in its head. Any page of the
 * site will do; integrators wanting a neutral frame can point this at a dedicated showcase template.
 *
 * @param {string} [homePagePath] - the site's home page, used when nothing is configured
 * @returns {string|undefined} - the page to take CSS from
 */
export const getSamplesPreviewPagePath = homePagePath => {
    const configured = contextJsParameters.config.jcontent?.['samples.previewPagePath'];
    return configured?.trim() ? configured.trim() : homePagePath;
};
