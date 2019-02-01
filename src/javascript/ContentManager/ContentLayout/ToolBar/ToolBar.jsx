import React from 'react';
import {AppBar, IconButton, Toolbar, Typography, withStyles} from '@material-ui/core';
import {ChevronRight} from '@material-ui/icons';
import {CM_DRAWER_STATES, cmSetTreeState} from '../../ContentManager.redux-actions';
import {connect} from 'react-redux';
import {compose} from 'react-apollo';
import ContentManagerConstants from '../../ContentManager.constants';
import SearchControlBar from './SearchControlBar';
import BrowseControlBar from './BrowseControlBar';
import {DisplayActions, iconButtonRenderer} from '@jahia/react-material';
import {translate} from 'react-i18next';

const styles = theme => ({
    appBarElevation: {
        zIndex: 10
    },
    spacer: {
        width: theme.spacing.unit * 2
    }
});

export class ToolBar extends React.Component {
    render() {
        const {classes, mode, treeState, setTreeState, selection, t} = this.props;

        return (
            <AppBar position="relative" color="default" classes={{root: classes.appBarElevation}}>
                <Toolbar variant="dense">
                    {(mode === ContentManagerConstants.mode.SEARCH || mode === ContentManagerConstants.mode.SQL2SEARCH) ?
                        <SearchControlBar showActions={selection.length === 0}/> :
                        <React.Fragment>
                            {treeState !== CM_DRAWER_STATES.SHOW &&
                                <IconButton color="inherit" variant="text" onClick={() => setTreeState(CM_DRAWER_STATES.SHOW)}>
                                    <ChevronRight/>
                                </IconButton>
                            }
                            <BrowseControlBar showActions={selection.length === 0}/>
                        </React.Fragment>
                    }
                    {selection.length > 0 &&
                        <React.Fragment>
                            <Typography variant="caption" color="textSecondary" data-cm-role="selection-infos" data-cm-selection-size={selection.length}>
                                {t('label.contentManager.selection.itemsSelected', {count: selection.length})}
                            </Typography>
                            <div className={classes.spacer}/>
                            <DisplayActions
                                target="selectedContentActions"
                                context={{paths: selection}}
                                render={iconButtonRenderer({color: 'secondary', size: 'small'})}
                            />
                        </React.Fragment>
                    }
                </Toolbar>
            </AppBar>
        );
    }
}

const mapStateToProps = state => ({
    mode: state.mode,
    treeState: state.treeState,
    selection: state.selection
});

const mapDispatchToProps = dispatch => ({
    setTreeState: state => dispatch(cmSetTreeState(state))
});

export default compose(
    translate(),
    withStyles(styles),
    connect(mapStateToProps, mapDispatchToProps)
)(ToolBar);
