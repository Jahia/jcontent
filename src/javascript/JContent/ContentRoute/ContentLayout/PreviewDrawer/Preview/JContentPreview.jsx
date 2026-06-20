import React from 'react';
import PropTypes from 'prop-types';
import NoPreviewComponent from './NoPreviewComponent/NoPreviewComponent';
import {useEmptyListComponent} from './EmptyListComponent/EmptyListComponent';
import MultipleSelection from './MultipleSelection/MultipleSelection';
import {refetchTypes, setRefetcher, unsetRefetcher} from '~/JContent/JContent.refetches';
import {Preview} from '~/JContent/preview';
import {buildFallbackPreviewContextFromNode, buildPreviewContextFromNode} from '~/JContent/preview/previewContext.utils';
import {useSidePanelContext} from '~/JContent/SidePanel';
import {Card, CardContent} from '@material-ui/core';
import {Typography} from '@jahia/moonstone';
import PreviewSize from '~/JContent/ContentRoute/ContentLayout/PreviewDrawer/PreviewSize';

const PreviewCard = ({node}) => (
    <Card>
        <CardContent data-cm-role="preview-name">
            <Typography isNowrap variant="subheading">
                {node.displayName ? node.displayName : node.name}
            </Typography>
            <Typography isNowrap variant="body">
                <PreviewSize node={node}/>
            </Typography>
        </CardContent>
    </Card>
);

PreviewCard.propTypes = {
    node: PropTypes.shape({
        displayName: PropTypes.string,
        name: PropTypes.string.isRequired
    }).isRequired
};

export const JContentPreview = () => {
    const {previewSelection, selection, lang, mode, isFullScreen, onFullScreenToggle} = useSidePanelContext();
    const {loading: emptyListLoading, component: EmptyListComponent} = useEmptyListComponent(previewSelection, mode);

    if (selection.length > 0) {
        return <MultipleSelection/>;
    }

    if (!previewSelection) {
        return <NoPreviewComponent/>;
    }

    if (emptyListLoading) {
        return null;
    }

    if (EmptyListComponent) {
        return EmptyListComponent;
    }

    const previewContext = buildPreviewContextFromNode(previewSelection, lang, mode);
    const fallbackPreviewContext = buildFallbackPreviewContextFromNode(previewSelection, lang, mode, previewContext);

    return (
        <Preview
            footer={<PreviewCard node={previewSelection}/>}
            isFullScreen={isFullScreen}
            nodeData={previewSelection}
            previewContext={previewContext}
            fallbackPreviewContext={fallbackPreviewContext}
            onFullScreenToggle={onFullScreenToggle}
            onRefetchInvalidated={() => unsetRefetcher(refetchTypes.PREVIEW_COMPONENT)}
            onRefetchReady={refetch => setRefetcher(refetchTypes.PREVIEW_COMPONENT, {refetch})}
        />
    );
};

export default JContentPreview;
