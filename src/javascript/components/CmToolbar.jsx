import React from 'react';
import {AppBar, IconButton, Toolbar, withStyles} from '@material-ui/core';
import {ChevronRight, Refresh} from '@material-ui/icons';
import {CM_DRAWER_STATES, cmSetTreeState} from './redux/actions';
import {connect} from 'react-redux';
import {compose} from 'react-apollo';
import Constants from './constants';
import {refetchContentTreeAndListData, setContentListDataRefetcher, setRefetcher} from './refetches';
import CmSearchControlBar from './searchBar/CmSearchControlBar';
import CmBrowseControlBar from './CmBrowseControlBar';

const styles = () => ({
    appBarElevation: {
        zIndex: 10
    }
});

class CmToolbar extends React.Component {
    setContentRefetcher(refetchingData) {
        setContentListDataRefetcher(refetchingData);
    }

    setTreeRefetcher(type) {
        return refetchingData => setRefetcher(type, refetchingData);
    }

    refreshContentsAndTree(contentTreeConfigs) {
        refetchContentTreeAndListData(contentTreeConfigs);
    }

    render() {
        const {contentTreeConfigs, classes, mode, treeState, setTreeState} = this.props;

        return (
            <AppBar position="relative" color="default" classes={{root: classes.appBarElevation}}>
                <Toolbar variant="dense">
                    {(mode === Constants.mode.SEARCH || mode === Constants.mode.SQL2SEARCH) ?
                        <CmSearchControlBar/> :
                        <React.Fragment>
                            {treeState !== CM_DRAWER_STATES.SHOW &&
                            <IconButton color="inherit"
                                        variant="text"
                                        onClick={() => setTreeState(CM_DRAWER_STATES.SHOW)}
                            >
                                <ChevronRight/>
                            </IconButton>
                            }
                            <CmBrowseControlBar/>
                        </React.Fragment>
                    }
                    <IconButton color="inherit" data-cm-role="content-list-refresh-button" onClick={() => this.refreshContentsAndTree(contentTreeConfigs)}>
                        <Refresh/>
                    </IconButton>
                </Toolbar>
            </AppBar>
        );
    }
}

const mapStateToProps = state => ({
    mode: state.mode,
    treeState: state.treeState
});

const mapDispatchToProps = dispatch => ({
    setTreeState: state => dispatch(cmSetTreeState(state))
});

export default compose(
    withStyles(styles),
    connect(mapStateToProps, mapDispatchToProps)
)(CmToolbar);
