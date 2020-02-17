import React, {useEffect} from 'react';
import PropTypes from 'prop-types';
import {compose} from '~/utils';
import {connect} from 'react-redux';
import {useTranslation} from 'react-i18next';
import {useContentPreview} from '@jahia/data-helper';
import {ProgressOverlay, withNotifications} from '@jahia/react-material';
import {PreviewComponent} from '@jahia/react-material';
import NoPreviewComponent from './NoPreviewComponent';
import {cmSetPreviewMode, cmSetPreviewState} from '../../../../preview.redux';
import MultipleSelection from './MultipleSelection/MultipleSelection';
import {cmClearSelection} from '../../contentSelection.redux';
import {CM_DRAWER_STATES} from '../../../../JContent.redux';
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
        language,
        notificationContext
    } = props;
    const {t} = useTranslation();

    const {data, loading, error, refetch} = useContentPreview({
        path: previewSelection && previewSelection.path,
        templateType: 'html',
        view: 'cm',
        contextConfiguration: 'preview',
        language,
        workspace: previewMode
    });

    useEffect(() => {
        if (!loading && !error) {
            refetch();
        }
    });

    if (selection.length > 0) {
        return <MultipleSelection {...props}/>;
    }

    if (Object.keys(previewSelection).length === 0) {
        return <NoPreviewComponent {...props}/>;
    }

    if (error) {
        console.error('Error when fetching data: ', error);
        const message = t('jcontent:label.contentManager.error.queryingContent', {details: (error.message ? error.message : '')});
        notificationContext.notify(message, ['closeButton', 'noAutomaticClose']);
        return null;
    }

    if (loading || Object.keys(data).length === 0) {
        return <ProgressOverlay/>;
    }

    return (
        <PreviewComponent data={data.jcr ? data.jcr : {}}
                          workspace={previewMode}
                          fullScreen={(previewState === CM_DRAWER_STATES.FULL_SCREEN)}
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
