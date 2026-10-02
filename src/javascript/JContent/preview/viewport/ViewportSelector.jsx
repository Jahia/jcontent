import React from 'react';
import PropTypes from 'prop-types';
import {Dropdown} from '@jahia/moonstone';
import {useTranslation} from 'react-i18next';
import {VIEWPORT_WIDTHS} from './viewport.constants';

/**
 * Picks the width a preview is rendered at. Each entry carries the scale it would be shown at, which
 * is per-width rather than per-selection - every option showing the selected option's percentage was
 * the bug this spells out.
 */
export const ViewportSelector = ({viewportWidth, scaleFor, onChange}) => {
    const {t} = useTranslation('jcontent');

    return (
        <Dropdown
            data-sel-role="preview-viewport"
            variant="outlined"
            size="small"
            value={viewportWidth}
            data={VIEWPORT_WIDTHS.map(width => ({
                label: t('jcontent:label.contentManager.preview.viewport', {
                    width,
                    percent: Math.round(scaleFor(width) * 100)
                }),
                value: width
            }))}
            onChange={(e, item) => onChange(item.value)}
        />
    );
};

ViewportSelector.propTypes = {
    viewportWidth: PropTypes.number.isRequired,
    scaleFor: PropTypes.func.isRequired,
    onChange: PropTypes.func.isRequired
};
