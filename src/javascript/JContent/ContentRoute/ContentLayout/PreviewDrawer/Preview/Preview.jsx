import React from 'react';
import PropTypes from 'prop-types';
import {compose} from '~/utils';
import {withNotifications} from '@jahia/react-material';
import NoPreviewComponent from './NoPreviewComponent';
import PreviewComponent from './PreviewComponent';
import MultipleSelection from './MultipleSelection/MultipleSelection';
import {withStyles} from '@material-ui/core';

const styles = theme => ({
    root: {
        flex: '1 1 0%',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        minHeight: 0
    },
    previewContainer: {
        flex: '1 1 0%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: 0,
        backgroundColor: theme.palette.background.default
    },
    noPreviewContainer: {
        flex: '1 1 0%',
        backgroundColor: theme.palette.background.default,
        display: 'flex'
    },
    center: {
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        textAlign: 'center',
        color: theme.palette.text.disabled
    },
    centerIcon: {
        margin: '8 auto'
    },
    mediaContainer: {
        backgroundColor: theme.palette.background.dark
    },
    contentContainer: {
        padding: (theme.spacing.unit * 3) + 'px'
    },
    contentPaper: {
        width: '100%',
        height: '100%',
        display: 'flex'
    },
    contentIframe: {
        border: 'none',
        width: '100%'
    }
});

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
    withStyles(styles),
    withNotifications()
)(Preview);
