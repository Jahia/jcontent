import React, {useCallback, useLayoutEffect, useRef, useState} from 'react';
import PropTypes from 'prop-types';
import {useTranslation} from 'react-i18next';
import {useSelector} from 'react-redux';
import {Dropdown, Typography} from '@jahia/moonstone';
import {LoaderOverlay} from '~/ContentEditor/DesignSystem/LoaderOverlay';
import {PreviewFetcher} from '~/JContent/preview/PreviewFetcher';
import {buildSamplePreviewContext} from '~/JContent/preview/previewContext.utils';
import styles from './SamplePreview.scss';

// Widths the sample is rendered at, then scaled down to fit the pane.
//
// Scaling alone would not help: the pane is only a few hundred pixels wide, so a responsive template
// collapses to its narrow layout and two variants that differ in how they place an image side by
// side end up looking identical. Rendering at a real desktop width and shrinking the result is what
// makes that difference visible.
const VIEWPORT_WIDTHS = [1280, 1024, 768, 375];
const DEFAULT_VIEWPORT_WIDTH = 1280;

/**
 * Right-hand pane of the content-type picker: what an instance of the selected type actually looks
 * like, rendered from a real sample held by the site.
 *
 * The modal owns the query and which sample is selected, so the buttons beneath can act on the same
 * sample this shows.
 */
export const SamplePreview = ({samples, selectedSample, previewPagePath, isLoading, hasSelectedType, onSelectSample}) => {
    const {t} = useTranslation('jcontent');
    const language = useSelector(state => state.language);
    const [viewportWidth, setViewportWidth] = useState(DEFAULT_VIEWPORT_WIDTH);
    const [frameSize, setFrameSize] = useState(null);
    const frameRef = useRef(null);

    // The scale depends on how much room the pane actually has, which changes with the window, so it
    // has to be measured rather than assumed.
    const measure = useCallback(element => {
        if (element) {
            setFrameSize({width: element.clientWidth, height: element.clientHeight});
        }
    }, []);

    useLayoutEffect(() => {
        const element = frameRef.current;
        if (!element || typeof ResizeObserver === 'undefined') {
            return;
        }

        const observer = new ResizeObserver(() => measure(element));
        observer.observe(element);
        measure(element);
        return () => observer.disconnect();
    }, [measure, selectedSample]);

    if (!hasSelectedType) {
        return (
            <div className={styles.placeholder} data-sel-role="sample-preview-placeholder">
                <Typography variant="body">{t('jcontent:label.contentEditor.samples.selectType')}</Typography>
            </div>
        );
    }

    if (isLoading) {
        return <LoaderOverlay/>;
    }

    if (samples.length === 0) {
        return (
            <div className={styles.placeholder} data-sel-role="sample-preview-empty">
                <Typography variant="body">{t('jcontent:label.contentEditor.samples.noSample')}</Typography>
            </div>
        );
    }

    // Null when the site has no page to borrow a stylesheet from.
    const previewContext = buildSamplePreviewContext(selectedSample, language, previewPagePath);

    // Never scale up: a narrow viewport in a wide pane should sit at its own size, not be blown up.
    const scaleFor = width => (frameSize ? Math.min(1, frameSize.width / width) : 1);
    const scale = scaleFor(viewportWidth);

    return (
        <div className={styles.preview}>
            <div className={styles.toolbar}>
                {samples.length > 1 && (
                    <Dropdown
                        data-sel-role="sample-preview-selector"
                        variant="outlined"
                        size="small"
                        value={selectedSample.path}
                        data={samples.map(sample => ({label: sample.displayName, value: sample.path}))}
                        onChange={(e, item) => onSelectSample(item.value)}
                    />
                )}
                <Dropdown
                    data-sel-role="sample-preview-viewport"
                    variant="outlined"
                    size="small"
                    value={viewportWidth}
                    data={VIEWPORT_WIDTHS.map(width => ({
                        label: t('jcontent:label.contentEditor.samples.viewport', {width, percent: Math.round(scaleFor(width) * 100)}),
                        value: width
                    }))}
                    onChange={(e, item) => setViewportWidth(item.value)}
                />
            </div>
            <div ref={frameRef} className={styles.frame}>
                {previewContext ? (
                    <div
                        className={styles.viewport}
                        style={{
                            width: `${viewportWidth}px`,
                            // Undo the scale so the shrunken result still fills the pane vertically.
                            height: frameSize ? `${frameSize.height / scale}px` : '100%',
                            transform: `scale(${scale})`
                        }}
                    >
                        <PreviewFetcher
                            previewContext={previewContext}
                            nodeData={selectedSample}
                            // The sample renders as a module, so there is no page surround to zoom
                            // into and no anchor that could go missing.
                            onContentNotFound={() => {}}
                        />
                    </div>
                ) : (
                    <Typography variant="body">{t('jcontent:label.contentEditor.samples.cannotRender')}</Typography>
                )}
            </div>
        </div>
    );
};

SamplePreview.propTypes = {
    samples: PropTypes.array.isRequired,
    previewPagePath: PropTypes.string,
    selectedSample: PropTypes.object,
    isLoading: PropTypes.bool.isRequired,
    hasSelectedType: PropTypes.bool.isRequired,
    onSelectSample: PropTypes.func.isRequired
};
