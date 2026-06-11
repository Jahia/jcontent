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
        previewMode,
        previewState,
        selection,
        isLiveDisabled = false,
        isEditDisabled = false
    } = props;

    const language = useSelector(state => state.language);

    if (selection.length > 0) {
        return <MultipleSelection {...props}/>;
    }

    if (!previewSelection || previewSelection.length === 0) {
        return <NoPreviewComponent {...props}/>;
    }

    const previewContext = buildPreviewContextFromNode(previewSelection, language, previewMode);

    return (
        <Preview
            isEditDisabled={isEditDisabled}
            isFullScreen={previewState === CM_DRAWER_STATES.FULL_SCREEN}
            isLiveDisabled={isLiveDisabled}
            nodeData={previewSelection}
            previewContext={previewContext}
            onRefetchInvalidated={() => unsetRefetcher(refetchTypes.PREVIEW_COMPONENT)}
            onRefetchReady={refetch => setRefetcher(refetchTypes.PREVIEW_COMPONENT, {refetch})}
        />
    );
};

JContentPreview.propTypes = {
    previewMode: PropTypes.string.isRequired,
    previewState: PropTypes.number.isRequired,
    previewSelection: PropTypes.object,
    selection: PropTypes.array.isRequired,
    isLiveDisabled: PropTypes.bool,
    isEditDisabled: PropTypes.bool
};

export default compose(
    withNotifications()
)(JContentPreview);
