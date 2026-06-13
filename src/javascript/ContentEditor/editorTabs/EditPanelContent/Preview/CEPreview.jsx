import React, {useCallback, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {Badge} from '@jahia/design-system-kit';
import {useContentEditorContext} from '~/ContentEditor/contexts/ContentEditor';
import {invalidateRefetch, setPreviewRefetcher} from '~/ContentEditor/ContentEditor/EditPanel/EditPanel.refetches';
import {Preview} from '~/JContent/preview/Preview';
import {UpdateOnSaveBadge} from '~/ContentEditor/editorTabs/EditPanelContent/Preview/UpdateOnSaveBadge';
import {useSelector} from 'react-redux';
import {buildCEPreviewContext} from '~/JContent/preview';

const usePreviewContext = (nodeData, language) => {
    // Get information from legacy page composer to display the preview.
    const pageComposerCurrentPage = useSelector(state => state.pagecomposer?.currentPage);
    const pageComposerActive = useSelector(state => state.pagecomposer?.active);

    // Don't use full page rendering for folders.
    const isFullPage = nodeData.displayableNode && !nodeData.displayableNode.isFolder;
    // Set main resource path, currently used by preview:
    //  - path: path to display
    //  - template: view or template to use
    //  - templatetype: extension to use
    //  - config: page if content can be displayed as full page or module
    const currentPage = pageComposerActive ? pageComposerCurrentPage :
        {
            path: (isFullPage && nodeData.displayableNode.path) || nodeData.path,
            template: nodeData.displayableNode ? 'default' : 'cm',
            templateType: '.html'
        };
    currentPage.config = isFullPage ? 'page' : 'module';
    return buildCEPreviewContext(currentPage, nodeData, language);
};

export const CEPreview = () => {
    const {t} = useTranslation('jcontent');
    const {nodeData, lang} = useContentEditorContext();
    const [isFullScreen, setIsFullScreen] = useState(false);

    const previewContext = usePreviewContext(nodeData || {}, lang);

    const onRefetchReady = useCallback(refetch => {
        setPreviewRefetcher({
            queryParams: {language: lang, path: previewContext.path},
            refetch
        });
    }, [lang, previewContext.path]);

    const onRefetchInvalidated = useCallback(() => {
        invalidateRefetch({language: lang, path: previewContext.path});
    }, [lang, previewContext.path]);

    const header = (
        <>
            <UpdateOnSaveBadge/>
            {nodeData.isFolder && (
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

    return (
        <Preview
            header={header}
            isFullScreen={isFullScreen}
            nodeData={nodeData}
            previewContext={previewContext}
            onFullScreenToggle={() => setIsFullScreen(prev => !prev)}
            onRefetchInvalidated={onRefetchInvalidated}
            onRefetchReady={onRefetchReady}
        />
    );
};
