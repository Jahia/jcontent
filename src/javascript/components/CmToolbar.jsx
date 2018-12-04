import React from 'react';
import {Button, Grid, Toolbar, withStyles} from '@material-ui/core';
import {Close, Refresh} from '@material-ui/icons';
import {FileTree} from 'mdi-material-ui';
import {DisplayActions} from '@jahia/react-material';
import FilesGridModeSelector from './filesGrid/FilesGridModeSelector';
import FilesGridSizeSelector from './filesGrid/FilesGridSizeSelector';
import ContentBreadcrumbs from './breadcrumb/ContentBreadcrumbs';
import * as _ from 'lodash';
import {translate} from 'react-i18next';
import {CM_DRAWER_STATES, cmGoto, cmSetSelection, cmSetTreeState} from './redux/actions';
import {connect} from 'react-redux';
import {compose} from 'react-apollo';
import Constants from './constants';
import {buttonRenderer} from '@jahia/react-material/index';
import {refetchContentTreeAndListData, setContentListDataRefetcher, setRefetcher} from './refetches';
import CmSearchControlBar from './searchBar/CmSearchControlBar';

const styles = theme => ({
    gridDirection: {
        textAlign: 'right!important'
    },
    colorToolbar: {
        minHeight: theme.contentManager.toolbarHeight + 'px!important',
        maxHeight: theme.contentManager.toolbarHeight + 'px',
        background: theme.palette.background.paper,
        position: 'sticky',
        top: 0
    },
    guttersToolbar: {
        paddingLeft: (theme.spacing.unit * 3) + '!important',
        paddingRight: (theme.spacing.unit * 3) + '!important'
    },
    buttonCreate: {
        backgroundColor: theme.palette.primary.main,
        color: theme.palette.common.white,
        padding: '8px 24px',
        margin: theme.spacing.unit,
        borderRadius: '2px',
        marginLeft: (theme.spacing.unit * 3),
        marginRight: (theme.spacing.unit * 3),
        '&:hover': {
            backgroundColor: theme.palette.background.default,
            color: theme.palette.primary.main
        }
    }
});

const GRID_SIZE = 12;
const GRID_PANEL_BUTTONS_SIZE = 5;
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

    isBrowsing() {
        let {mode} = this.props;
        return (mode === Constants.mode.BROWSE || mode === Constants.mode.FILES);
    }

    isSearching() {
        let {mode} = this.props;
        return (mode === Constants.mode.SEARCH || mode === Constants.mode.SQL2SEARCH);
    }

    isRootNode() {
        let {path, siteKey} = this.props;
        return (path === ('/sites/' + siteKey));
    }

    render() {
        const {contentTreeConfigs, t, classes,
            searchContentType, sql2SearchFrom, sql2SearchWhere, searchTerms,
            mode, path, clearSearch, treeState, setTreeState} = this.props;

        const params = {
            searchContentType: searchContentType,
            searchTerms: searchTerms,
            sql2SearchFrom: sql2SearchFrom,
            sql2SearchWhere: sql2SearchWhere
        };
        return (
            <Toolbar className={classes.colorToolbar} classes={{gutters: classes.guttersToolbar}}>
                <Grid container item xs={GRID_SIZE} direction="row" alignItems="center">
                    {treeState !== CM_DRAWER_STATES.SHOW &&
                    <Grid item xs={1}>
                        <Button variant="text" onClick={() => setTreeState(CM_DRAWER_STATES.SHOW)}>
                            <FileTree color="primary"/>
                        </Button>
                    </Grid>
                    }
                    <Grid item xs={GRID_SIZE - GRID_PANEL_BUTTONS_SIZE - 1}>
                        <div>
                            {this.isSearching() ?
                                <CmSearchControlBar/> :
                                <ContentBreadcrumbs mode={this.props.mode}/>
                            }
                        </div>
                    </Grid>
                    <Grid item xs={GRID_PANEL_BUTTONS_SIZE} className={classes.gridDirection}>
                        {mode === Constants.mode.FILES &&
                        <React.Fragment>
                            <FilesGridSizeSelector/>
                            <FilesGridModeSelector/>
                        </React.Fragment>
                        }
                        {this.isBrowsing() && !this.isRootNode() &&
                        <DisplayActions target="tableHeaderActions" context={{path: path}} render={buttonRenderer({variant: 'contained', classes: {root: classes.buttonCreate}}, true)}/>
                        }
                        <Button variant="text" className={classes.refreshButton} onClick={() => this.refreshContentsAndTree(contentTreeConfigs)}>
                            <Refresh color="primary"/>
                        </Button>
                        {this.isSearching() &&
                        <Button data-cm-role="search-clear" variant="text"
                            className={classes.searchClearButton}
                            classes={{sizeSmall: classes.searchClear}} onClick={() => clearSearch(params)}
                                                                       >
                            <Close className={classes.searchClearIcon}/>
                            {t('label.contentManager.search.clear')}
                        </Button>
                        }
                    </Grid>
                </Grid>

            </Toolbar>
        );
    }
}

const mapStateToProps = state => ({
    mode: state.mode,
    selection: state.selection,
    uiLang: state.uiLang,
    siteKey: state.site,
    path: state.path,
    lang: state.language,
    params: state.params,
    treeState: state.treeState,
    searchTerms: state.params.searchTerms,
    searchContentType: state.params.searchContentType,
    sql2SearchFrom: state.params.sql2SearchFrom,
    sql2SearchWhere: state.params.sql2SearchWhere
});

const mapDispatchToProps = dispatch => ({
    onRowSelected: selection => dispatch(cmSetSelection(selection)),
    setPath: (path, params) => dispatch(cmGoto({path, params})),
    setTreeState: state => dispatch(cmSetTreeState(state)),
    clearSearch: params => {
        params = _.clone(params);
        _.unset(params, 'searchContentType');
        _.unset(params, 'searchTerms');
        _.unset(params, 'sql2SearchFrom');
        _.unset(params, 'sql2SearchWhere');
        dispatch(cmGoto({mode: 'browse', params: params}));
    }
});

export default compose(
    withStyles(styles),
    translate(),
    connect(mapStateToProps, mapDispatchToProps)
)(CmToolbar);
