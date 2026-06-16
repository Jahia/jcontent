import React from 'react';
import PropTypes from 'prop-types';
import {compose} from '~/utils';
import {withNotifications} from '@jahia/react-material';
import NoPreviewComponent from './NoPreviewComponent';
import MultipleSelection from './MultipleSelection/MultipleSelection';
import {CM_DRAWER_STATES} from '~/JContent/redux/JContent.redux';
import {refetchTypes, setRefetcher, unsetRefetcher} from '~/JContent/JContent.refetches';
import {Preview} from '~/JContent/preview';
import {buildPreviewContextFromNode} from '~/JContent/preview/previewContext.utils';
import {useSelector} from 'react-redux';

export const JContentPreview = props => {
    const {
        previewSelection,
        previewState,
        selection
    } = props;

    const language = useSelector(state => state.language);
    const mode = useSelector(state => state.jcontent.mode);

    if (selection.length > 0) {
        return <MultipleSelection {...props}/>;
    }

    if (!previewSelection || previewSelection.length === 0) {
        return <NoPreviewComponent {...props}/>;
    }

    const previewContext = buildPreviewContextFromNode(previewSelection, language, mode);

    return (
        <Preview
            isFullScreen={previewState === CM_DRAWER_STATES.FULL_SCREEN}
            nodeData={previewSelection}
            previewContext={previewContext}
            onRefetchInvalidated={() => unsetRefetcher(refetchTypes.PREVIEW_COMPONENT)}
            onRefetchReady={refetch => setRefetcher(refetchTypes.PREVIEW_COMPONENT, {refetch})}
        />
    );
};

JContentPreview.propTypes = {
    previewState: PropTypes.number.isRequired,
    previewSelection: PropTypes.object,
    selection: PropTypes.array.isRequired
};

export default compose(
    withNotifications()
)(JContentPreview);
