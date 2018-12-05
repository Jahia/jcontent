import React from 'react';
import {Picker} from '@jahia/react-apollo';
import CmPickerViewMaterial from './picker/CmPickerViewMaterial';
import {IconButton, Toolbar, Typography, withStyles} from '@material-ui/core';
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
    toolbar: {
        color: theme.palette.text.secondary,
        height: theme.contentManager.toolbarHeight + 'px',
        maxHeight: theme.contentManager.toolbarHeight + 'px',
        boxShadow: '0px 1px 2px rgba(54, 63, 69, 0.1), 0px 2px 2px rgba(54, 63, 69, 0.08)'
    },
    toolbarTitle: {
        marginLeft: theme.spacing.unit * 3,
        flexGrow: 1
    },
    itemAndRowSelected: {
        backgroundColor: '#E1E0E0'
    },
    listContainer: {
        overflow: 'scroll',
        height: 'calc( 100% - ' + theme.contentManager.toolbarHeight + 'px )',
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
        let {rootPath, path, openPaths, handleOpen,
            handleSelect, lang, openableTypes,
            selectableTypes, rootLabel,
            setRefetch, itemAndRowSelected} = this.props;
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
                    <CmPickerViewMaterial {...others} rootLabel={rootLabel} customSelectedClass={itemAndRowSelected}/>
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
        this.componentsRefs = [];
    }

    render() {
        const {lang, siteKey, path, openPaths, t, user, setPath, openPath,
            closePath, classes, setRefetch, onContextualMenu, mode, isOpen, closeTree, selection} = this.props;
        const rootPath = '/sites/' + siteKey;
        const usedPath = path.startsWith(rootPath) ? path : rootPath;

        let contentTreeConfigs = mode === 'browse' ? [Constants.contentTreeConfigs.contents, Constants.contentTreeConfigs.pages] : [Constants.contentTreeConfigs.files];

        return (
            <React.Fragment>
                <Toolbar disableGutters classes={{root: classes.toolbar}}>
                    <Typography variant="subtitle2" color="inherit" className={classes.toolbarTitle}>
                        {t('label.contentManager.tree.title')}
                    </Typography>
                    <IconButton color="inherit" onClick={closeTree}>
                        <ChevronLeft fontSize="small"/>
                    </IconButton>
                </Toolbar>
                <div className={classes.listContainer}>
                    <div className={classes.list}>
                        {isOpen ?
                            _.map(contentTreeConfigs, contentTreeConfig => {
                                let componentRef = React.createRef();
                                this.componentsRefs.push(componentRef);
                                return (
                                    <ContentTree key={contentTreeConfig.key}
                                        ref={componentRef}
                                        mode={mode}
                                        siteKey={siteKey}
                                        path={usedPath}
                                        rootPath={rootPath + contentTreeConfig.rootPath}
                                        openPaths={openPaths}
                                        selectableTypes={contentTreeConfig.selectableTypes}
                                        lang={lang}
                                        user={user}
                                        handleOpen={(path, open) => (open ? openPath(path) : closePath(path))}
                                        handleSelect={path => setPath(path)}
                                        openableTypes={contentTreeConfig.openableTypes}
                                        rootLabel={t(contentTreeConfig.rootLabel)}
                                        setRefetch={setRefetch(contentTreeConfig.key)}
                                        itemAndRowSelected={!_.isEmpty(selection) ? classes.itemAndRowSelected : null}
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
