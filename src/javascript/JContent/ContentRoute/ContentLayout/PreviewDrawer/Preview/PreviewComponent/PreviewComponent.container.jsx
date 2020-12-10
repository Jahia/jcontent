import React, {useEffect} from 'react';
import {useContentPreview} from '@jahia/data-helper';
import {ProgressOverlay} from '@jahia/react-material';
import {CM_DRAWER_STATES} from '~/JContent/JContent.redux';
import PreviewComponent from './PreviewComponent';
import PropTypes from 'prop-types';
import {useTranslation} from 'react-i18next';
import {useSelector} from 'react-redux';

export const PreviewComponentContainer = ({previewMode, previewSelection, previewState, notificationContext}) => {
    const {t} = useTranslation();
    const language = useSelector(state => state.language);
    const {data, loading, error, refetch} = useContentPreview({
        path: previewSelection && previewSelection.path,
        templateType: 'html',
        view: 'cm',
        contextConfiguration: 'preview',
        language,
        workspace: previewMode
    });

    // Trigger manual refetch only on language change
    useEffect(() => {
        if (!loading && !error) {
            refetch();
        }
    }, [language]);

    if (!loading && Object.keys(data || {}).length === 0) {
        refetch();
    }

    if (error) {
        console.error('Error when fetching data: ', error);
        const message = t('jcontent:label.contentManager.error.queryingContent', {details: (error.message ? error.message : '')});
        notificationContext.notify(message, ['closeButton', 'noAutomaticClose']);
        return null;
    }

    if (loading || Object.keys(data || {}).length === 0) {
        return <ProgressOverlay/>;
    }

    return (
        <PreviewComponent data={data.jcr ? data.jcr : {}}
                          workspace={previewMode}
                          fullScreen={(previewState === CM_DRAWER_STATES.FULL_SCREEN)}
        />
    );
};

PreviewComponentContainer.propTypes = {
    previewMode: PropTypes.string.isRequired,
    previewState: PropTypes.number.isRequired,
    notificationContext: PropTypes.object.isRequired,
    previewSelection: PropTypes.object
};

export default PreviewComponentContainer;
