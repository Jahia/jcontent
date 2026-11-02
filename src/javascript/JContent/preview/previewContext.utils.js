import {isMarkedForDeletion} from '~/JContent/JContent.utils';

/**
 * Asks the render chain to render content that is marked for deletion rather than replace it.
 *
 * Marking content for deletion does not delete it - it stays, and stays readable, until the
 * deletion is published or undone - but Jahia's MarkedForDeletionFilter answers every such node in
 * preview mode, and for anything smaller than a page it answers with NOTHING. In this panel that
 * is a blank pane where the content should be, which reads as the preview being broken rather than
 * as a decision having been taken.
 *
 * The filter takes this attribute as "render it anyway", which is opt-in: it grants no access of
 * its own, the node having already been read and its permissions checked before the chain runs.
 * It is the name the filter publishes, as a string because that is what the render API carries.
 */
const PREVIEW_MARKED_FOR_DELETION = 'previewMarkedForDeletion';

/**
 * Shared helper for in-context module render with page CSS injection.
 * Used for both the main-resource in-context strategy and as the sub-component fallback.
 */
const buildInContextModuleContext = (node, closestPage, jView, base) => ({
    ...base,
    path: node.path,
    view: jView?.value || 'default',
    contextConfiguration: 'module',
    mainResourcePath: closestPage.path,
    cssSourcePath: closestPage.path
});

/**
 * Core preview context builder. Returns { primary, fallback }.
 *
 * Rendering strategies:
 *
 * A. In-context (closestPage provided):
 *    - isDisplayableNode: module render of node + page CSS. No zoom (avoids pagination problem).
 *    - !isDisplayableNode: full page render at closestPage + zoom requestAttributes.
 *      fallback = module+CSS strategy (used if zoom fails).
 *
 * B. Out-of-context (no closestPage):
 *    - isDisplayableNode: full 'page' render of the node itself. `displayableNode === node`
 *      means core resolved a template for it — a page template for a page, a content template
 *      for content carrying jmix:mainResource. That template is only applied under the 'page'
 *      configuration (templateNodeFilter applies on wrappedcontent,page,gwt), so any other
 *      configuration renders the bare view instead of the content template. The template
 *      output is a full document, so it carries its own CSS.
 *    - !isDisplayableNode: module render of the view. CSS injected via cssSourcePath, taken
 *      from the displayable ancestor when it is a non-folder page.
 *
 * @param {object} node                 - JCR node with { path, uuid, isPage, displayableNode, jView }
 * @param {string} language
 * @param {object} options
 * @param {object} [options.closestPage]        - { path, view? } — the hosting page context.
 *   JContent: pageAncestors.at(-1), whatever accordion is open. CE: pageComposerCurrentPage or
 *   displayableNode ancestor.
 * @param {boolean} [options.isCEPreview]  - Attach ce_preview requestAttribute to signal CE preview mode
 *   to other modules. true for CE, false for JContent.
 * @param {Array}   [options.requestParameters] - CE page composer query string params.
 */
export const buildPreviewContexts = (node, language, {closestPage = null, isCEPreview = false, requestParameters = []} = {}) => {
    const {displayableNode, jView} = node;
    const isDisplayableNode = displayableNode?.path === node.path;
    // A folder resolves no template and renders nothing, so it is neither a template holder
    // nor usable as a CSS donor. Both uses below build on this.
    const isDisplayablePage = Boolean(displayableNode) && !displayableNode.isFolder;
    const base = {workspace: 'edit', templateType: 'html', language};
    const extraParams = requestParameters.length > 0 ? {requestParameters} : {};
    const cePreviewAttr = isCEPreview ? [{name: 'ce_preview', value: node.uuid}] : undefined;
    // Carried by every strategy below, because which one is chosen says nothing about whether the
    // node is marked for deletion. See PREVIEW_MARKED_FOR_DELETION.
    const commonAttributes = [
        ...(cePreviewAttr || []),
        ...(isMarkedForDeletion(node) ? [{name: PREVIEW_MARKED_FOR_DELETION, value: 'true'}] : [])
    ];
    const commonAttributesEntry = commonAttributes.length > 0 ? {requestAttributes: commonAttributes} : {};
    // Folded into the base the in-context strategies are built from, so the FALLBACK carries them
    // too: a fallback that comes back blank is the same empty pane by another route.
    const inContextBase = {...base, ...commonAttributesEntry};

    // ClosestPage signals in-context rendering: the node is rendered within a known hosting page.
    // Absent closestPage → out-of-context: the node renders standalone, without a page surround.
    if (closestPage) {
        if (isDisplayableNode) {
            // Main-resource in page context: module render with page CSS.
            return {
                primary: {
                    ...buildInContextModuleContext(node, closestPage, jView, inContextBase),
                    ...extraParams
                },
                fallback: null
            };
        }

        // Sub-component/list in page context: full page render + zoom.
        // fallback: module+CSS if zoom fails (#ce_preview_content not found).
        return {
            primary: {
                ...base,
                path: closestPage.path,
                view: closestPage.view || 'default',
                contextConfiguration: 'page',
                requestAttributes: [
                    ...commonAttributes,
                    {name: 'preview_wrapper', value: node.path}
                ],
                ...extraParams
            },
            fallback: buildInContextModuleContext(node, closestPage, jView, inContextBase)
        };
    }

    // The node has a template of its own — page template, or content template for content
    // holding jmix:mainResource. Render it as a full page so that template is applied; its
    // output already includes the CSS, so no cssSourcePath is needed.
    const hasOwnTemplate = isDisplayableNode && isDisplayablePage;
    if (node.isPage || hasOwnTemplate) {
        return {
            primary: {
                ...base,
                path: node.path,
                // Under the page configuration this argument is the *template* name, not a view
                // name - JCRTemplateResolver nulls it when it equals "default" and otherwise matches
                // it against template node names. The node's own j:view is a view name and would
                // fail resolution, so pass "default" and let core honour j:templateName instead.
                view: 'default',
                contextConfiguration: 'page',
                ...commonAttributesEntry,
                ...extraParams
            },
            fallback: null
        };
    }

    // No template of its own: render the view standalone and inject CSS by fetching the
    // nearest displayable ancestor as a page, when that ancestor is a non-folder page.
    const cssSourcePath = isDisplayablePage ? displayableNode.path : undefined;

    return {
        primary: {
            ...base,
            path: node.path,
            view: null,
            contextConfiguration: 'module',
            ...(cssSourcePath && {cssSourcePath}),
            ...commonAttributesEntry,
            ...extraParams
        },
        fallback: null
    };
};

/**
 * JContent: builds { primary, fallback } from a content table node.
 *
 * Derives closestPage from the node's own page ancestors. Whether a node renders in the context of
 * a page is a fact about the NODE - it is nested in one, or it is not - so it is read from the node
 * rather than from the accordion the reader happens to be browsing in.
 *
 * This used to additionally require the 'pages' accordion. That excluded every accordion a module
 * contributes: a record nested in a page, listed from somewhere other than the page tree, was
 * rendered standalone, which for content that cannot stand alone means markup with no page around
 * it and none of its CSS. It made no difference to jcontent's own accordions, whose nodes - content
 * folders, media, categories - have no page ancestor to find.
 */
export const buildPreviewContextsFromNode = (node, language) => {
    const pageAncestor = node.pageAncestors?.at(-1);
    const closestPage = pageAncestor && !node.isPage ? {path: pageAncestor.path} : null;
    return buildPreviewContexts(node, language, {closestPage});
};
