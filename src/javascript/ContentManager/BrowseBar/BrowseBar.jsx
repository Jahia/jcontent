import React from 'react';
import {AppBar, IconButton, Toolbar, withStyles} from '@material-ui/core';
import {ChevronRight} from '@material-ui/icons';
import {CM_DRAWER_STATES, cmSetTreeState} from '../ContentManager.redux-actions';
import {connect} from 'react-redux';
import {compose} from 'react-apollo';
import ContentManagerConstants from '../ContentManager.constants';
import SearchControlBar from './SearchControlBar';
import BrowseControlBar from '../BrowseControlBar';

const styles = () => ({
    appBarElevation: {
        zIndex: 10
    }
});

export class BrowseBar extends React.Component {
    render() {
        const {classes, mode, treeState, setTreeState} = this.props;

        return (
            <AppBar position="relative" color="default" classes={{root: classes.appBarElevation}}>
                <Toolbar variant="dense">
                    {(mode === ContentManagerConstants.mode.SEARCH || mode === ContentManagerConstants.mode.SQL2SEARCH) ?
                        <SearchControlBar/> :
                        <React.Fragment>
                            {treeState !== CM_DRAWER_STATES.SHOW &&
                            <IconButton color="inherit"
                                        variant="text"
                                        onClick={() => setTreeState(CM_DRAWER_STATES.SHOW)}
                            >
                                <ChevronRight/>
                            </IconButton>
                            }
                            <BrowseControlBar/>
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
)(BrowseBar);
