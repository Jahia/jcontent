import React from 'react';
import {compose, Query} from 'react-apollo';
import {translate} from 'react-i18next';
import {connect} from 'react-redux';
import {lodash as _} from 'lodash';
import {withStyles} from '@material-ui/core';
import {previewQuery} from '../gqlQueries';
import {CM_PREVIEW_MODES, cmSetPreviewMode, cmSetPreviewState} from '../redux/actions';
import constants from '../constants';
import {DxContext} from '../DxContext';
import {NoPreviewComponent} from './NoPreviewComponent';
import {PreviewComponent} from './PreviewComponent';

const styles = theme => ({
    root: {
        flex: 1,
        position: 'relative'
    },
    previewContainer: {
        backgroundColor: theme.palette.background.default,
        overflow: 'auto',
        position: 'absolute',
        width: '100%',
        height: '100%'
    },
    noPreviewContainer: {
        backgroundColor: theme.palette.background.default,
        overflow: 'auto',
        width: '100%',
        height: '100%'
    },
    mediaContainer: {
        backgroundColor: theme.palette.background.dark
    },
    contentContainer: {
        padding: (theme.spacing.unit * 3) + 'px'
    },
    contentPaper: {
        width: '100%',
        height: '100%'
    },
    contentIframe: {
        border: 'none',
        width: '100%',
        height: '100%'
    }
});

class ContentPreview extends React.Component {
    constructor(props) {
        super(props);
        this.refetchPreview = () => {
        };
    }

    componentDidUpdate(prevProps) {
        if (this.props.selection && prevProps.selection && prevProps.selection.lastPublished !== this.props.selection.lastPublished) {
            this.refetchPreview();
        }
    }

    render() {
        const {selection, classes, previewMode} = this.props;

        if (_.isEmpty(selection)) {
            return <NoPreviewComponent {...this.props}/>;
        }

        const path = selection.path;
        const livePreviewAvailable = selection.publicationStatus !== constants.availablePublicationStatuses.UNPUBLISHED && selection.publicationStatus !== constants.availablePublicationStatuses.NOT_PUBLISHED;
        const queryVariables = {
            path: path,
            templateType: 'html',
            view: 'cm',
            contextConfiguration: 'preview',
            language: this.props.language,
            isPublished: livePreviewAvailable
        };

        return (
            <DxContext.Consumer>
                {dxContext => (
                    <div className={classes.root}>
                        <Query query={previewQuery}
                               errorPolicy="all"
                               variables={queryVariables}
                        >
                            {({loading, data, refetch}) => {
                                this.refetchPreview = refetch;

                                if (!loading) {
                                    if (!_.isEmpty(data)) {
                                        let modes = [CM_PREVIEW_MODES.EDIT];
                                        // Check if the node is published in live.
                                        if (livePreviewAvailable) {
                                            modes.push(CM_PREVIEW_MODES.LIVE);
                                        }
                                        let selectedMode = _.find(modes, mode => {
                                            return previewMode === mode;
                                        }) === undefined ? CM_PREVIEW_MODES.EDIT : previewMode;
                                        return (
                                            <PreviewComponent data={data[selectedMode]}
                                                              dxContext={dxContext}
                                                              {...this.props}/>
                                        );
                                    }
                                }
                                return null;
                            }}
                        </Query>
                    </div>
                )}
            </DxContext.Consumer>
        );
    }
}

const mapStateToProps = state => {
    return {
        previewMode: state.previewMode,
        previewState: state.previewState,
        language: state.language
    };
};

const mapDispatchToProps = dispatch => ({
    setPreviewMode: mode => {
        dispatch(cmSetPreviewMode(mode));
    },
    setPreviewState: state => {
        dispatch(cmSetPreviewState(state));
    }
});

export default compose(
    translate(),
    withStyles(styles),
    connect(mapStateToProps, mapDispatchToProps)
)(ContentPreview);
