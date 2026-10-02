import React from 'react';
import PropTypes from 'prop-types';
import {useTranslation} from 'react-i18next';
import {useSelector} from 'react-redux';
import {Dropdown, Typography} from '@jahia/moonstone';
import {LoaderOverlay} from '~/ContentEditor/DesignSystem/LoaderOverlay';
import {PreviewFetcher} from '~/JContent/preview/PreviewFetcher';
import {buildSamplePreviewContext} from '~/JContent/preview/previewContext.utils';
import {useViewportScale, ViewportFrame, ViewportSelector} from '~/JContent/preview/viewport';
import styles from './SamplePreview.scss';

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
    const {viewportWidth, setViewportWidth, frameRef, frameSize, scale, scaleFor} = useViewportScale();

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
                <ViewportSelector
                    scaleFor={scaleFor}
                    viewportWidth={viewportWidth}
                    onChange={setViewportWidth}
                />
            </div>
            {previewContext ? (
                <ViewportFrame
                    frameRef={frameRef}
                    frameSize={frameSize}
                    scale={scale}
                    viewportWidth={viewportWidth}
                >
                    <PreviewFetcher
                        previewContext={previewContext}
                        nodeData={selectedSample}
                        // The sample renders as a module, so there is no page surround to zoom
                        // into and no anchor that could go missing.
                        onContentNotFound={() => {}}
                    />
                </ViewportFrame>
            ) : (
                <div className={styles.placeholder}>
                    <Typography variant="body">{t('jcontent:label.contentEditor.samples.cannotRender')}</Typography>
                </div>
            )}
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
