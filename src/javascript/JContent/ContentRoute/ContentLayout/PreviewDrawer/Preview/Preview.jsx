import React from 'react';
import PropTypes from 'prop-types';
import {compose} from '~/utils';
import {connect} from 'react-redux';
import {useTranslation} from 'react-i18next';
import {withNotifications} from '@jahia/react-material';
import NoPreviewComponent from './NoPreviewComponent';
import {cmSetPreviewMode, cmSetPreviewState} from '../../../../preview.redux';
import MultipleSelection from './MultipleSelection/MultipleSelection';
import {cmClearSelection} from '../../contentSelection.redux';
import {withStyles} from '@material-ui/core';
import PreviewContainer from './Preview.container';

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
        language,
        notificationContext
    } = props;
    const {t} = useTranslation();

    if (selection.length > 0) {
        return <MultipleSelection {...props} t={t}/>;
    }

    if (!previewSelection || previewSelection.length === 0) {
        return <NoPreviewComponent {...props} t={t}/>;
    }

    return (
        <PreviewContainer previewMode={previewMode}
                          t={t}
                          previewState={previewState}
                          previewSelection={previewSelection}
                          language={language}
                          notificationContext={notificationContext}
        />
    );
};

const mapStateToProps = state => {
    return {
        previewMode: state.jcontent.previewMode,
        previewState: state.jcontent.previewState,
        language: state.language,
        selection: state.jcontent.selection
    };
};

const mapDispatchToProps = dispatch => ({
    setPreviewMode: mode => {
        dispatch(cmSetPreviewMode(mode));
    },
    setPreviewState: state => {
        dispatch(cmSetPreviewState(state));
    },
    clearSelection: () => dispatch(cmClearSelection())
});

Preview.propTypes = {
    language: PropTypes.string.isRequired,
    previewMode: PropTypes.string.isRequired,
    previewState: PropTypes.number.isRequired,
    previewSelection: PropTypes.object,
    selection: PropTypes.array.isRequired,
    notificationContext: PropTypes.object.isRequired
};

export default compose(
    withStyles(styles),
    withNotifications(),
    connect(mapStateToProps, mapDispatchToProps)
)(Preview);
