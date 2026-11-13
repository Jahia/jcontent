import React from 'react';
import PropTypes from 'prop-types';
import {EmptyData} from '@jahia/moonstone';
import {useTranslation} from 'react-i18next';

export const NoView = ({title, message}) => {
    const {t} = useTranslation('jcontent');
    return (
        <EmptyData
            data-sel-role="preview-container"
            data-preview-type="no-view"
            title={title ?? t('jcontent:label.contentManager.contentPreview.noViewAvailable')}
            message={message}
        />
    );
};

NoView.propTypes = {
    title: PropTypes.string,
    message: PropTypes.string.isRequired
};
