import React from 'react';
import PropTypes from 'prop-types';
import NoPreviewComponent from './NoPreviewComponent/NoPreviewComponent';
import MultipleSelection from './MultipleSelection/MultipleSelection';
import {refetchTypes, setRefetcher, unsetRefetcher} from '~/JContent/JContent.refetches';
import {Preview} from '~/JContent/preview';
import {buildPreviewContextFromNode} from '~/JContent/preview/previewContext.utils';
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

    if (selection.length > 0) {
        return <MultipleSelection/>;
    }

    if (!previewSelection) {
        return <NoPreviewComponent/>;
    }

    const previewContext = buildPreviewContextFromNode(previewSelection, lang, mode);

    return (
        <Preview
            footer={<PreviewCard node={previewSelection}/>}
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
