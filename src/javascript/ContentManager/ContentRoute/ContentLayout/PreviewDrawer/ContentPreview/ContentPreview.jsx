import React from 'react';
import PropTypes from 'prop-types';
import {compose, Query} from 'react-apollo';
import {translate} from 'react-i18next';
import {connect} from 'react-redux';
import {lodash as _} from 'lodash';
import {withStyles} from '@material-ui/core';
import {previewQuery} from './ContentPreview.gql-queries';
import {CM_PREVIEW_MODES} from '../../../../ContentManager.redux-actions';
import ContentManagerConstants from '../../../../ContentManager.constants';
import DxContext from '../../../../DxContext';
import NoPreviewComponent from './NoPreviewComponent';
import PreviewComponent from './PreviewComponent';
import {cmSetPreviewMode, cmSetPreviewState} from '../../../../preview.redux-actions';
import MultipleSelection from './MultipleSelection/MultipleSelection';
import {cmClearSelection} from '../../contentSelection.redux-actions';

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

export class ContentPreview extends React.Component {
    constructor(props) {
        super(props);
        this.refetchPreview = () => {
        };
    }

    componentDidUpdate(prevProps) {
        if (this.props.previewSelection && prevProps.previewSelection && prevProps.previewSelection.lastPublished !== this.props.previewSelection.lastPublished) {
            this.refetchPreview();
        }
    }

    render() {
        const {previewSelection, classes, previewMode, selection} = this.props;

        if (selection.length > 0) {
            return <MultipleSelection {...this.props}/>;
        }
        if (_.isEmpty(previewSelection)) {
            return <NoPreviewComponent {...this.props}/>;
        }

        const path = previewSelection.path;
        const livePreviewAvailable = previewSelection.publicationStatus !== ContentManagerConstants.availablePublicationStatuses.UNPUBLISHED && previewSelection.publicationStatus !== ContentManagerConstants.availablePublicationStatuses.NOT_PUBLISHED;
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
        language: state.language,
        selection: state.selection
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

ContentPreview.propTypes = {
    classes: PropTypes.object.isRequired,
    language: PropTypes.string.isRequired,
    previewMode: PropTypes.string.isRequired,
    previewSelection: PropTypes.object,
    selection: PropTypes.array.isRequired
};

export default compose(
    translate(),
    withStyles(styles),
    connect(mapStateToProps, mapDispatchToProps)
)(ContentPreview);
