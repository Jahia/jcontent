import React from 'react';
import {AppBar, IconButton, Toolbar, withStyles} from '@material-ui/core';
import {ChevronRight} from '@material-ui/icons';
import {CM_DRAWER_STATES, cmSetTreeState} from './redux/actions';
import {connect} from 'react-redux';
import {compose} from 'react-apollo';
import Constants from './constants';
import CmSearchControlBar from './searchBar/CmSearchControlBar';
import CmBrowseControlBar from './CmBrowseControlBar';

const styles = () => ({
    appBarElevation: {
        zIndex: 10
    }
});

class CmToolbar extends React.Component {
    render() {
        const {classes, mode, treeState, setTreeState} = this.props;

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
