import React from 'react';
import NoPreviewComponent from './NoPreviewComponent/NoPreviewComponent';
import MultipleSelection from './MultipleSelection/MultipleSelection';
import {refetchTypes, setRefetcher, unsetRefetcher} from '~/JContent/JContent.refetches';
import {Preview} from '~/JContent/preview';
import {buildPreviewContextFromNode} from '~/JContent/preview/previewContext.utils';
import {useSidePanelContext} from '~/ContentEditor/editorTabs/EditPanelContent/SidePanel';

export const JContentPreview = () => {
    const {previewSelection, selection, lang, mode, isFullScreen, onFullScreenToggle} = useSidePanelContext();

    if (selection.length > 0) {
        return <MultipleSelection/>;
    }

    if (!previewSelection) {
        return <NoPreviewComponent/>;
    }

    const previewContext = buildPreviewContextFromNode(previewSelection, lang, mode);

    return (
        <Preview
            isFullScreen={isFullScreen}
            nodeData={previewSelection}
            previewContext={previewContext}
            onFullScreenToggle={onFullScreenToggle}
            onRefetchInvalidated={() => unsetRefetcher(refetchTypes.PREVIEW_COMPONENT)}
            onRefetchReady={refetch => setRefetcher(refetchTypes.PREVIEW_COMPONENT, {refetch})}
        />
    );
};

export default JContentPreview;
