import React, {useEffect, useRef, useState} from 'react';
import PropTypes from 'prop-types';
import {Paper} from '@material-ui/core';
import styles from './IframeViewer.scss';
import {zoom} from '~/JContent/preview/Preview.utils';
import {useTranslation} from 'react-i18next';
import {LoaderOverlay} from '~/ContentEditor/DesignSystem/LoaderOverlay';

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
 * @returns {string} - content between <head> and </head>, or empty string
 */
function extractPageHead(pageHtml) {
    if (!pageHtml) {
        return '';
    }

    const match = /<head>([\s\S]*?)<\/head>/i.exec(pageHtml);
    return match ? match[1] : '';
}

export const IframeViewer = ({previewContext, data, onContentNotFound, nodeData = null, pageCssHtml = ''}) => {
    const [loading, setLoading] = useState(true);
    const {t} = useTranslation('jcontent');
    const iframeRef = useRef(null);
    const onLoadTimeoutRef = useRef(null);

    const rawOutput = data?.nodeByPath?.renderedContent?.output ?? '';
    const isHybrid = Boolean(pageCssHtml);
    const {cleanHtml, assets: inlineAssets} = extractInlineResourceTags(rawOutput, !isHybrid);

    let displayValue;
    if (!cleanHtml) {
        displayValue = t('label.contentManager.contentPreview.noViewAvailable');
    } else if (isHybrid) {
        // In hybrid rendering, the page CSS is injected into the iframe via <link> elements.
        const pageHead = extractPageHead(pageCssHtml);
        displayValue = `<html><head>${pageHead}</head><body>${cleanHtml}</body></html>`;
    } else {
        displayValue = cleanHtml;
    }

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
    }, [displayValue]);

    const onLoad = () => {
        try {
            console.debug('Preview loaded, adding assets and removing loader');
            const element = iframeRef.current;
            const iframeWindow = element?.contentWindow || element;
            iframeWindow?.document?.body?.setAttribute('style', 'pointer-events: none');

            if (!isHybrid && previewContext.contextConfiguration !== 'page') {
                const staticAssets = data?.nodeByPath?.renderedContent?.staticAssets ?? [];
                const seen = new Set();
                const mergedAssets = [...staticAssets, ...inlineAssets]
                    .filter(a => !seen.has(a.key) && seen.add(a.key));
                loadAssets(mergedAssets, iframeWindow.document);
            }

            if (previewContext.requestAttributes && nodeData) {
                zoom(iframeWindow.document, onContentNotFound, nodeData);
            }
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
                    className={`${styles.iframe} ${loading ? styles.iframeLoading : ''}`}
                    srcDoc={displayValue}
                    sandbox="allow-same-origin allow-scripts"
                    onLoad={onLoad}
            />
        </Paper>
    );
};

IframeViewer.propTypes = {
    previewContext: PropTypes.shape({
        workspace: PropTypes.string.isRequired,
        requestAttributes: PropTypes.array,
        contextConfiguration: PropTypes.string
    }).isRequired,
    onContentNotFound: PropTypes.func.isRequired,
    data: PropTypes.object.isRequired,
    pageCssHtml: PropTypes.string,
    nodeData: PropTypes.shape({
        isPage: PropTypes.bool,
        path: PropTypes.string,
        displayableNode: PropTypes.shape({
            path: PropTypes.string
        })
    })
};
