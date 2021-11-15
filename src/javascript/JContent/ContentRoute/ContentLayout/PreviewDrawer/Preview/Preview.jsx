import React from 'react';
import PropTypes from 'prop-types';
import {compose} from '~/utils';
import {withNotifications} from '@jahia/react-material';
import NoPreviewComponent from './NoPreviewComponent';
import PreviewComponent from './PreviewComponent';
import MultipleSelection from './MultipleSelection/MultipleSelection';

export const Preview = props => {
    const {
        previewSelection,
        previewMode,
        previewState,
        selection,
        notificationContext
    } = props;

    if (selection.length > 0) {
        return <MultipleSelection {...props}/>;
    }

    if (!previewSelection || previewSelection.length === 0) {
        return <NoPreviewComponent {...props}/>;
    }

    return (
        <PreviewComponent previewMode={previewMode}
                          previewState={previewState}
                          previewSelection={previewSelection}
                          notificationContext={notificationContext}
        />
    );
};

Preview.propTypes = {
    previewMode: PropTypes.string.isRequired,
    previewState: PropTypes.number.isRequired,
    previewSelection: PropTypes.object,
    selection: PropTypes.array.isRequired,
    notificationContext: PropTypes.object.isRequired
};

export default compose(
    withNotifications()
)(Preview);
