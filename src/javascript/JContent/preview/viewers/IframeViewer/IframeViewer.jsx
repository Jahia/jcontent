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

export const IframeViewer = ({previewContext, data, onContentNotFound, nodeData = null}) => {
    const [loading, setLoading] = useState(true);
    const {t} = useTranslation('jcontent');
    const iframeRef = useRef(null);
    const onLoadTimeoutRef = useRef(null);

    let displayValue = data?.nodeByPath?.renderedContent?.output ?? '';
    if (displayValue === '') {
        displayValue = t('label.contentManager.contentPreview.noViewAvailable');
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

            if (previewContext.contextConfiguration !== 'page') {
                const assets = data?.nodeByPath?.renderedContent?.staticAssets ?? [];
                loadAssets(assets, iframeWindow.document);
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
    nodeData: PropTypes.shape({
        isPage: PropTypes.bool,
        path: PropTypes.string,
        displayableNode: PropTypes.shape({
            path: PropTypes.string
        })
    })
};
