import React from 'react';
import {Picker} from '@jahia/react-apollo';
import CmPickerViewMaterial from './picker/CmPickerViewMaterial';
import {AppBar, Grid, IconButton, Toolbar, Typography, withStyles} from '@material-ui/core';
import {translate} from 'react-i18next';
import {ChevronLeft} from '@material-ui/icons';
import {lodash as _} from 'lodash';
import {connect} from 'react-redux';
import {CM_DRAWER_STATES, cmClosePaths, cmGoto, cmOpenPaths, cmSetTreeState} from './redux/actions';
import {PickerItemsFragment} from './gqlQueries';
import {PredefinedFragments} from '@jahia/apollo-dx';
import {compose} from 'react-apollo';
import Constants from './constants';

const styles = theme => ({
    listContainer: {
        overflow: 'auto',
        width: theme.contentManager.treeDrawerWidth + 'px'
    },
    list: {
        width: 'fit-content',
        minWidth: '100%'
    }
});

class ContentTree extends React.Component {
    constructor(props) {
        super(props);
        this.picker = React.createRef();
    }

    render() {
        let {rootPath, path, openPaths, handleOpen, handleSelect, lang, openableTypes, selectableTypes, rootLabel, setRefetch, dataCmRole, container} = this.props;
        return (
            <Picker
                ref={this.picker}
                rootPaths={[rootPath]}
                openPaths={openPaths}
                openableTypes={openableTypes}
                selectableTypes={selectableTypes}
                queryVariables={{lang: lang}}
                selectedPaths={[path]}
                openSelection={false}
                setRefetch={setRefetch}
                fragments={[PickerItemsFragment.mixinTypes, PickerItemsFragment.primaryNodeType, PickerItemsFragment.isPublished, PredefinedFragments.displayName]}
                onOpenItem={(path, open) => handleOpen(path, open)}
                onSelectItem={path => handleSelect(path)}
            >
                {({handleSelect, ...others}) => (
                    <CmPickerViewMaterial {...others} dataCmRole={dataCmRole} rootLabel={rootLabel} container={container}/>
                )}
            </Picker>
        );
    }

    resolveMenu(path) {
        let {mode, siteKey} = this.props;
        switch (mode) {
            case 'browse-files':
                return 'contextualMenuFiles';
            default:
                return path.indexOf(`/sites/${siteKey}/contents`) !== -1 ? 'contextualMenuFolders' : 'contextualMenuPages';
        }
    }
}

class ContentTrees extends React.Component {
    constructor(props) {
        super(props);
        this.container = React.createRef();
    }

    render() {
        const {lang, siteKey, path, openPaths, t, user, setPath, openPath,
            closePath, classes, setRefetch, onContextualMenu, mode, isOpen, closeTree} = this.props;
        const rootPath = '/sites/' + siteKey;
        const usedPath = path.startsWith(rootPath) ? path : rootPath;

        let contentTreeConfigs = mode === 'browse' ? [Constants.contentTreeConfigs.contents, Constants.contentTreeConfigs.pages] : [Constants.contentTreeConfigs.files];
        let setContainer = r => {
            if (r) {
                this.container.current = r;
            }
        };
        return (
            <React.Fragment>
                <AppBar position="relative" color="default">
                    <Toolbar variant="dense">
                        <Grid container alignItems="center" spacing={8} justify="space-between">
                            <Grid item>
                                <Typography variant="subtitle2" color="inherit">
                                    {t('label.contentManager.tree.title')}
                                </Typography>
                            </Grid>
                            <Grid item>
                                <IconButton color="inherit" data-cm-role="hide-tree" onClick={closeTree}>
                                    <ChevronLeft fontSize="small"/>
                                </IconButton>
                            </Grid>
                        </Grid>
                    </Toolbar>
                </AppBar>
                <div ref={setContainer} className={classes.listContainer}>
                    <div className={classes.list}>
                        {isOpen ?
                            _.map(contentTreeConfigs, contentTreeConfig => {
                                return (
                                    <ContentTree key={contentTreeConfig.key}
                                                 container={this.container}
                                                 mode={mode}
                                                 siteKey={siteKey}
                                                 path={usedPath}
                                                 rootPath={rootPath + contentTreeConfig.rootPath}
                                                 openPaths={openPaths}
                                                 selectableTypes={contentTreeConfig.selectableTypes}
                                                 lang={lang}
                                                 user={user}
                                                 dataCmRole={contentTreeConfig.key}
                                                 handleOpen={(path, open) => (open ? openPath(path) : closePath(path))}
                                                 handleSelect={path => setPath(path)}
                                                 openableTypes={contentTreeConfig.openableTypes}
                                                 rootLabel={t(contentTreeConfig.rootLabel)}
                                                 setRefetch={setRefetch(contentTreeConfig.key)}
                                                 onContextualMenu={onContextualMenu}
                                    />
                                );
                            }) : null
                        }
                    </div>
                </div>
            </React.Fragment>
        );
    }
}

const mapStateToProps = state => ({
    siteKey: state.site,
    lang: state.language,
    path: state.path,
    mode: state.mode,
    openPaths: state.openPaths,
    selection: state.selection
});

const mapDispatchToProps = dispatch => ({
    setPath: (path, params) => dispatch(cmGoto({path, params})),
    openPath: path => dispatch(cmOpenPaths([path])),
    closePath: path => dispatch(cmClosePaths([path])),
    closeTree: () => dispatch(cmSetTreeState(CM_DRAWER_STATES.HIDE))
});

export default compose(
    translate(),
    withStyles(styles, {withTheme: true}),
    connect(mapStateToProps, mapDispatchToProps)
)(ContentTrees);
