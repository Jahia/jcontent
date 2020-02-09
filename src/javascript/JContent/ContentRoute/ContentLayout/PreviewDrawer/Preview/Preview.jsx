import React from 'react';
import PropTypes from 'prop-types';
import {compose} from 'react-apollo';
import {withTranslation} from 'react-i18next';
import {connect} from 'react-redux';
import {lodash as _} from 'lodash';
import {ContentPreview} from '@jahia/react-apollo';
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

export class Preview extends React.Component {
    constructor(props) {
        super(props);
        this.refetchPreview = () => {
        };
    }

    componentDidUpdate() {
        this.refetchPreview();
    }

    render() {
        const {previewSelection, previewMode, previewState, selection, language} = this.props;

        if (selection.length > 0) {
            return <MultipleSelection {...this.props}/>;
        }

        if (_.isEmpty(previewSelection)) {
            return <NoPreviewComponent {...this.props}/>;
        }

        return (
            <ContentPreview path={previewSelection.path}
                            templateType="html"
                            view="cm"
                            contextConfiguration="preview"
                            language={language}
                            workspace={previewMode}
                            setRefetch={refetchingData => {
                                this.refetchPreview = refetchingData.refetch;
                                return null;
                            }}
            >
                {
                    data => (
                        <PreviewComponent data={data.jcr ? data.jcr : {}}
                                          workspace={previewMode}
                                          fullScreen={(previewState === CM_DRAWER_STATES.FULL_SCREEN)}/>
                    )
                }
            </ContentPreview>
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

Preview.propTypes = {
    language: PropTypes.string.isRequired,
    previewMode: PropTypes.string.isRequired,
    previewState: PropTypes.number.isRequired,
    previewSelection: PropTypes.object,
    selection: PropTypes.array.isRequired
};

export default compose(
    withTranslation(),
    withStyles(styles),
    connect(mapStateToProps, mapDispatchToProps)
)(Preview);
