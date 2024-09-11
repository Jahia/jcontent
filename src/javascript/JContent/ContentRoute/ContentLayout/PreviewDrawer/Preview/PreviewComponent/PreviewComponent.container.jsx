import React from 'react';
import {useContentPreview, useNodeInfo} from '@jahia/data-helper';
import {CM_DRAWER_STATES} from '~/JContent/redux/JContent.redux';
import PreviewComponent from './PreviewComponent';
import PropTypes from 'prop-types';
import {useTranslation} from 'react-i18next';
import {useSelector} from 'react-redux';
import {LoaderOverlay, LoaderSuspense} from '@jahia/jahia-ui-root';

const getViewProperty = properties => {
    return properties && properties.length && properties.find(p => p.name === 'j:view')?.value;
};

export const PreviewComponentContainer = ({previewMode, previewSelection, previewState, notificationContext}) => {
    const {t} = useTranslation('jcontent');
    const language = useSelector(state => state.language);
    const {loading: nodeInfoLoading, error: nodeInfoError, node} = useNodeInfo({
        path: previewSelection && previewSelection.path,
        language
    }, {
        getProperties: ['j:view']
    });

    const {data, loading, error, refetch} = useContentPreview({
        path: previewSelection && previewSelection.path,
        templateType: 'html',
        view: getViewProperty(node?.properties) ?? 'cm',
        contextConfiguration: 'preview',
        language,
        workspace: previewMode
    });

    if (!loading && Object.keys(data || {}).length === 0) {
        refetch();
    }

    if (error || nodeInfoError) {
        const realError = error || nodeInfoError;
        console.error('Error when fetching data: ', realError);
        const message = t('jcontent:label.contentManager.error.queryingContent', {details: (realError.message ? realError.message : '')});
        notificationContext.notify(message, ['closeButton', 'noAutomaticClose']);
        return null;
    }

    if (loading || nodeInfoLoading || Object.keys(data || {}).length === 0) {
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
