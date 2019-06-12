import React from 'react';
import PropTypes from 'prop-types';
import {AppBar, Toolbar, withStyles} from '@material-ui/core';
import {IconButton, Typography} from '@jahia/design-system-kit';
import {ChevronRight} from '@material-ui/icons';
import {CM_DRAWER_STATES, cmSetTreeState} from '../../../ContentManager.redux-actions';
import {connect} from 'react-redux';
import {compose} from 'react-apollo';
import ContentManagerConstants from '../../../ContentManager.constants';
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
                                <IconButton icon={<ChevronRight/>} color="inherit" data-sel-role="show-tree" onClick={() => setTreeState(CM_DRAWER_STATES.SHOW)}/>
                            }
                            <BrowseControlBar showActions={selection.length === 0}/>
                        </React.Fragment>
                    }
                    {selection.length > 0 &&
                        <React.Fragment>
                            <Typography variant="caption" data-cm-role="selection-infos" data-cm-selection-size={selection.length}>
                                {t('label.contentManager.selection.itemsSelected', {count: selection.length})}
                            </Typography>
                            <div className={classes.spacer}/>
                            <DisplayActions
                                target="selectedContentActions"
                                context={{paths: selection}}
                                render={iconButtonRenderer({color: 'inherit', size: 'compact'})}
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

ToolBar.propTypes = {
    t: PropTypes.func.isRequired,
    classes: PropTypes.object.isRequired,
    mode: PropTypes.string.isRequired,
    selection: PropTypes.array.isRequired,
    setTreeState: PropTypes.func.isRequired,
    treeState: PropTypes.number.isRequired
};

export default compose(
    translate(),
    withStyles(styles),
    connect(mapStateToProps, mapDispatchToProps)
)(ToolBar);
