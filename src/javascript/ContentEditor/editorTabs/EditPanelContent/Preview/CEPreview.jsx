import React, {useCallback, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {Badge} from '@jahia/design-system-kit';
import {useContentEditorContext} from '~/ContentEditor/contexts/ContentEditor';
import {usePublicationInfoContext} from '~/ContentEditor/contexts/PublicationInfo';
import {invalidateRefetch, setPreviewRefetcher} from '~/ContentEditor/ContentEditor/EditPanel/EditPanel.refetches';
import {Preview} from '~/JContent/preview/Preview';
import {UpdateOnSaveBadge} from '~/ContentEditor/editorTabs/EditPanelContent/Preview/UpdateOnSaveBadge';
import {getPreviewContext} from './Preview.utils';
import JContentConstants from '~/JContent/JContent.constants';

export const CEPreview = () => {
    const {t} = useTranslation('jcontent');
    const editorContext = useContentEditorContext();
    const {publicationStatus} = usePublicationInfoContext();
    const [isFullScreen, setIsFullScreen] = useState(false);

    const previewContext = getPreviewContext(editorContext);

    const isLiveDisabled = [
        JContentConstants.availablePublicationStatuses.NOT_PUBLISHED,
        JContentConstants.availablePublicationStatuses.UNPUBLISHED,
        JContentConstants.availablePublicationStatuses.MANDATORY_LANGUAGE_UNPUBLISHABLE
    ].includes(publicationStatus);

    const onRefetchReady = useCallback(refetch => {
        setPreviewRefetcher({
            queryParams: {language: editorContext.lang, path: previewContext.path},
            refetch
        });
    }, [editorContext.lang, previewContext.path]);

    const onRefetchInvalidated = useCallback(() => {
        invalidateRefetch({language: editorContext.lang, path: previewContext.path});
    }, [editorContext.lang, previewContext.path]);

    const header = (
        <>
            <UpdateOnSaveBadge/>
            {editorContext.nodeData.isFolder && (
                <div>
                    <Badge
                        badgeContent={t('jcontent:label.contentEditor.preview.noPreview')}
                        color="warning"
                        variant="normal"
                    />
                </div>
            )}
        </>
    );

    if (editorContext.nodeData.isFolder) {
        return (
            <Preview
                header={header}
                isFullScreen={isFullScreen}
                isLiveDisabled={isLiveDisabled}
                nodeData={editorContext.nodeData}
                previewContext={previewContext}
                onFullScreenToggle={() => setIsFullScreen(prev => !prev)}
                onRefetchInvalidated={onRefetchInvalidated}
                onRefetchReady={onRefetchReady}
            />
        );
    }

    return (
        <Preview
            header={header}
            isFullScreen={isFullScreen}
            isLiveDisabled={isLiveDisabled}
            nodeData={editorContext.nodeData}
            previewContext={previewContext}
            onFullScreenToggle={() => setIsFullScreen(prev => !prev)}
            onRefetchInvalidated={onRefetchInvalidated}
            onRefetchReady={onRefetchReady}
        />
    );
};
