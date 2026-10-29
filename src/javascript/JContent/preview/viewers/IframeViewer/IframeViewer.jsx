import React, {useEffect, useMemo, useRef, useState} from 'react';
import PropTypes from 'prop-types';
import {Paper} from '@material-ui/core';
import styles from './IframeViewer.scss';
import {zoom} from '~/JContent/preview/Preview.utils';
import {useTranslation} from 'react-i18next';
import {LoaderOverlay} from '~/ContentEditor/DesignSystem/LoaderOverlay';

/**
 * Sandbox flags for the preview frame.
 *
 * The preview is a *static layout* rendering of a node: only CSS assets are collected
 * (`staticAssets(type: "css")`) and the frame body is made non-interactive on load
 * (`pointer-events: none`), so the framed document never needs to run scripts of its own.
 *
 * `allow-same-origin` IS required and must stay — `loadAssets`, `zoom` and the in-place patching
 * below reach into the frame's `document` from this component, which is only possible while the
 * frame keeps our origin.
 */
const PREVIEW_SANDBOX = 'allow-same-origin';

/** The element the server wraps the previewed node in; both zoom and patching key off it. */
const ZOOM_ANCHOR_ID = 'ce_preview_content';

function loadAsset(asset, iframeHeadEl) {
    return new Promise(resolve => {
        const linkEl = document.createElement('link');
        linkEl.rel = 'stylesheet';
        linkEl.type = 'text/css';
        linkEl.href = asset.key;
        linkEl.onload = resolve;

        iframeHeadEl.appendChild(linkEl);
    });
}

function loadAssets(assets, iframeDocument) {
    if (!assets || assets.length === 0) {
        return Promise.resolve();
    }

    let iframeHeadEl = iframeDocument.getElementsByTagName('head')[0];
    if (!iframeHeadEl) {
        iframeDocument.getElementsByTagName('html')[0].insertBefore(
            iframeDocument.createElement('head'),
            iframeDocument.body
        );
        iframeHeadEl = iframeDocument.getElementsByTagName('head')[0];
    }

    return Promise.all(assets.map(asset => loadAsset(asset, iframeHeadEl)));
}

/**
 * Extracts unprocessed <jahia:resource> tags from rendered HTML output and strips them.
 * This occurs when contextConfiguration="module" is used with mainResourcePath —
 * the aggregation pipeline has no page-level context to resolve them.
 * In the hybrid path, CSS comes from the page head so assets are not collected.
 * In the standalone module path, assets are collected for injection via loadAssets.
 *
 * @param {string} html - raw renderedContent output
 * @param {boolean} collectAssets - whether to collect CSS assets (false in hybrid path)
 * @returns {{ cleanHtml: string, assets: Array<{key: string}> }}
 */
function extractInlineResourceTags(html, collectAssets = true) {
    const assets = [];
    const tagPattern = /<jahia:resource[^>]+type="css"[^>]+path="([^"]+)"[^>]*\/>/g;
    const seen = new Set();
    const cleanHtml = html.replaceAll(tagPattern, (match, encodedPath) => {
        if (collectAssets) {
            const key = decodeURIComponent(encodedPath);
            if (!seen.has(key)) {
                seen.add(key);
                assets.push({key});
            }
        }

        return '';
    });
    return {cleanHtml, assets};
}

/**
 * Extracts the <head> content from a fully rendered page HTML output.
 * Used in hybrid in-context rendering to splice the page's full template CSS
 * (Bootstrap, fonts, site theme) with the module-rendered component body.
 *
 * @param {string} pageHtml - full page renderedContent output
 * @returns {string} - the full <head>...</head> element including opening tag attributes, or empty string
 */
function extractPageHead(pageHtml) {
    if (!pageHtml) {
        return '';
    }

    const match = /(<head[^>]*>[\s\S]*?<\/head>)/i.exec(pageHtml);
    return match ? match[1] : '';
}

/**
 * The part of a freshly rendered output that replaces what the frame already shows: the zoom
 * anchor's own content when the render carries one, the body otherwise. Parsing happens in a
 * detached document, so nothing in the markup runs.
 */
function extractFragment(html) {
    const parsed = new DOMParser().parseFromString(html, 'text/html');
    const anchor = parsed.getElementById(ZOOM_ANCHOR_ID);
    if (anchor) {
        return anchor.innerHTML;
    }

    return parsed.body ? parsed.body.innerHTML : html;
}

/**
 * Replaces the previewed content inside the LIVE frame document instead of reloading it, which
 * is what keeps scroll position, already-injected stylesheets and the result of zoom across an
 * update. Returns false when the frame cannot be reached, so the caller falls back to a reload.
 */
function patchFrameContent(iframeEl, html) {
    const iframeWindow = iframeEl?.contentWindow || iframeEl;
    const doc = iframeWindow?.document;
    if (!doc?.body) {
        return false;
    }

    const target = doc.getElementById(ZOOM_ANCHOR_ID) || doc.body;
    const scroller = doc.scrollingElement || doc.documentElement;
    const {scrollTop, scrollLeft} = scroller;

    target.innerHTML = extractFragment(html);

    scroller.scrollTop = scrollTop;
    scroller.scrollLeft = scrollLeft;
    return true;
}

export const IframeViewer = ({previewContext, data, onContentNotFound, nodeData = null, pageCssHtml = '', isRefreshing = false}) => {
    const [loading, setLoading] = useState(true);
    const {t} = useTranslation('jcontent');
    const iframeRef = useRef(null);
    const onLoadTimeoutRef = useRef(null);
    // Stylesheets already injected into the live document — a patch must not add them twice.
    const loadedAssetsRef = useRef(new Set());

    const rawOutput = data?.nodeByPath?.renderedContent?.output ?? '';
    const isHybrid = Boolean(pageCssHtml);
    const {cleanHtml, assets: inlineAssets} = useMemo(
        () => extractInlineResourceTags(rawOutput, !isHybrid),
        [rawOutput, isHybrid]
    );

    const displayValue = useMemo(() => {
        if (!cleanHtml) {
            return t('label.contentManager.contentPreview.noViewAvailable');
        }

        if (isHybrid) {
            // In hybrid rendering, the page CSS is injected into the iframe via <link> elements.
            return `<html>${extractPageHead(pageCssHtml)}<body>${cleanHtml}</body></html>`;
        }

        return cleanHtml;
    }, [cleanHtml, isHybrid, pageCssHtml, t]);

    // The frame RELOADS only when the shape of the preview changes — another node, language or
    // workspace. New HTML for the same shape, which is what every keystroke of a live preview
    // produces, is patched into the live document instead. Keying on the node rather than on
    // previewContext.path matters: switching from a page render to a module render of the same
    // node is an update, not a new document.
    const docKey = `${nodeData?.path ?? previewContext.path}|${previewContext.language}|${previewContext.workspace}`;

    const [bootHtml, setBootHtml] = useState(displayValue);
    const bootKeyRef = useRef(docKey);
    const appliedHtmlRef = useRef(displayValue);

    const applyContentEffects = () => {
        const element = iframeRef.current;
        const iframeWindow = element?.contentWindow || element;
        const iframeDocument = iframeWindow?.document;
        if (!iframeDocument) {
            return;
        }

        iframeDocument.body?.setAttribute('style', 'pointer-events: none');

        if (!isHybrid && previewContext.contextConfiguration !== 'page') {
            const staticAssets = data?.nodeByPath?.renderedContent?.staticAssets ?? [];
            const pending = [...staticAssets, ...inlineAssets]
                .filter(asset => !loadedAssetsRef.current.has(asset.key));
            pending.forEach(asset => loadedAssetsRef.current.add(asset.key));
            loadAssets(pending, iframeDocument);
        }

        if (previewContext.requestAttributes && nodeData) {
            zoom(iframeDocument, onContentNotFound, nodeData);
        }
    };

    useEffect(() => {
        setLoading(true);
        // Fallback: always remove the loader and disable click events after 5 seconds
        // in case onLoad does not fire (e.g. cross-origin restrictions)
        onLoadTimeoutRef.current = setTimeout(() => {
            console.debug('iframe onLoad did not trigger, removing loader and disabling click events');
            const element = iframeRef.current;
            const iframeWindow = element?.contentWindow || element;
            iframeWindow?.document?.body?.setAttribute('style', 'pointer-events: none');
            setLoading(false);
        }, 5000);
        return () => clearTimeout(onLoadTimeoutRef.current);
    }, [bootHtml]);

    useEffect(() => {
        if (bootKeyRef.current !== docKey) {
            bootKeyRef.current = docKey;
            appliedHtmlRef.current = displayValue;
            loadedAssetsRef.current = new Set();
            setBootHtml(displayValue);
            return;
        }

        if (appliedHtmlRef.current === displayValue) {
            return;
        }

        appliedHtmlRef.current = displayValue;
        if (patchFrameContent(iframeRef.current, displayValue)) {
            applyContentEffects();
        } else {
            // No reachable document yet — let the frame load this one the ordinary way.
            setBootHtml(displayValue);
        }
        // ApplyContentEffects reads the current render's data; re-running this effect when only
        // that identity changes would re-patch an unchanged document.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [docKey, displayValue]);

    const onLoad = () => {
        try {
            console.debug('Preview loaded, adding assets and removing loader');
            loadedAssetsRef.current = new Set();
            applyContentEffects();
        } catch (e) {
            console.error('Error while processing preview', e);
        }

        setLoading(false);
        clearTimeout(onLoadTimeoutRef.current);
    };

    return (
        <Paper elevation={1} classes={{root: styles.contentPaper}}>
            {loading && <LoaderOverlay/>}
            <iframe ref={iframeRef}
                    title="Content preview viewer"
                    aria-labelledby="preview-tab"
                    data-sel-role={previewContext.workspace + '-preview-frame'}
                    className={`${styles.iframe} ${loading ? styles.iframeLoading : ''} ${isRefreshing && !loading ? styles.iframeRefreshing : ''}`}
                    srcDoc={bootHtml}
                    sandbox={PREVIEW_SANDBOX}
                    onLoad={onLoad}
            />
        </Paper>
    );
};

IframeViewer.propTypes = {
    previewContext: PropTypes.shape({
        workspace: PropTypes.string.isRequired,
        language: PropTypes.string,
        path: PropTypes.string,
        requestAttributes: PropTypes.array,
        contextConfiguration: PropTypes.string
    }).isRequired,
    onContentNotFound: PropTypes.func.isRequired,
    data: PropTypes.object.isRequired,
    pageCssHtml: PropTypes.string,
    isRefreshing: PropTypes.bool,
    nodeData: PropTypes.shape({
        isPage: PropTypes.bool,
        path: PropTypes.string,
        displayableNode: PropTypes.shape({
            path: PropTypes.string
        })
    })
};
