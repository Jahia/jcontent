import React, {useEffect} from 'react';
import {useContentPreview} from '@jahia/data-helper';
import {PreviewComponent, ProgressOverlay} from '@jahia/react-material';
import {CM_DRAWER_STATES} from '~/JContent/JContent.redux';
import PropTypes from 'prop-types';

export const PreviewContainer = ({previewMode, previewSelection, language, previewState, notificationContext, t}) => {
    const {data, loading, error, refetch} = useContentPreview({
        path: previewSelection && previewSelection.path,
        templateType: 'html',
        view: 'cm',
        contextConfiguration: 'preview',
        language,
        workspace: previewMode
    });

    useEffect(() => {
        if (!loading && !error) {
            refetch();
        }
    });

    if (error) {
        console.error('Error when fetching data: ', error);
        const message = t('jcontent:label.contentManager.error.queryingContent', {details: (error.message ? error.message : '')});
        notificationContext.notify(message, ['closeButton', 'noAutomaticClose']);
        return null;
    }

    if (loading || Object.keys(data).length === 0) {
        return <ProgressOverlay/>;
    }

    return (
        <PreviewComponent data={data.jcr ? data.jcr : {}}
                          workspace={previewMode}
                          fullScreen={(previewState === CM_DRAWER_STATES.FULL_SCREEN)}
        />
    );
};

PreviewContainer.propTypes = {
    language: PropTypes.string.isRequired,
    previewMode: PropTypes.string.isRequired,
    previewState: PropTypes.number.isRequired,
    notificationContext: PropTypes.object.isRequired,
    t: PropTypes.func.isRequired,
    previewSelection: PropTypes.object
};

export default PreviewContainer;
