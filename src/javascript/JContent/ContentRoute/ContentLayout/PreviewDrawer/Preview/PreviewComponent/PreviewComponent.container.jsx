import React from 'react';
import {useContentPreview} from '@jahia/data-helper';
import {CM_DRAWER_STATES} from '~/JContent/JContent.redux';
import PreviewComponent from './PreviewComponent';
import PropTypes from 'prop-types';
import {useTranslation} from 'react-i18next';
import {useSelector} from 'react-redux';
import {LoaderOverlay, LoaderSuspense} from '@jahia/jahia-ui-root';

export const PreviewComponentContainer = ({previewMode, previewSelection, previewState, notificationContext}) => {
    const {t} = useTranslation('jcontent');
    const language = useSelector(state => state.language);
    const {data, loading, error, refetch} = useContentPreview({
        path: previewSelection && previewSelection.path,
        templateType: 'html',
        view: 'cm',
        contextConfiguration: 'preview',
        language,
        workspace: previewMode
    });

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
        return <LoaderOverlay/>;
    }

    return (
        <LoaderSuspense>
            <PreviewComponent data={data.jcr ? data.jcr : {}}
                              workspace={previewMode}
                              fullScreen={(previewState === CM_DRAWER_STATES.FULL_SCREEN)}
            />
        </LoaderSuspense>
    );
};

PreviewComponentContainer.propTypes = {
    previewMode: PropTypes.string.isRequired,
    previewState: PropTypes.number.isRequired,
    notificationContext: PropTypes.object.isRequired,
    previewSelection: PropTypes.object
};

export default PreviewComponentContainer;
