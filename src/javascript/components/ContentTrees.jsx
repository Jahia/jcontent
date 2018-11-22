import React from 'react';
import {Picker} from '@jahia/react-apollo';
import CmPickerViewMaterial from './picker/CmPickerViewMaterial';
import {List, ListItem, Table, TableBody, Typography, TableCell, Toolbar, TableHead, TableRow, withStyles, IconButton} from '@material-ui/core';
import {translate} from 'react-i18next';
import { ChevronLeft} from '@material-ui/icons';
import { ChevronRight} from '@material-ui/icons';
import {lodash as _} from 'lodash';
import {connect} from 'react-redux';
import {cmClosePaths, cmGoto, cmOpenPaths} from './redux/actions';
import {ContextualMenu, DisplayActions, iconButtonRenderer} from '@jahia/react-material';
import {PickerItemsFragment} from './gqlQueries';
import {PredefinedFragments} from '@jahia/apollo-dx';
import {compose} from 'react-apollo';

const styles = (theme) => ({
    trees: {
        background: theme.palette.background.paper,
        overflowY: 'scroll',
        overflowX: 'scroll',
        maxWidth: '260px',
        width: '260px',
        height: 'calc(100vh - 140px)',
        maxHeight: 'calc(100vh - 140px)'
    },
    list: {
        maxWidth: '260px',
        width: '260px'
    },
    tableCellHeight: {
        // Top: 0,
        // position: 'sticky',
        padding: '0px 0px 0px 10px',
        color: theme.palette.text.secondary,
        transitionDuration: '.3s',
        '&:hover': {
            color: theme.palette.text.primary,
        },
    },
    disablePad: {
        padding: '0!important'
    },
    buttonMenu: {
        display: 'flex',
        flexDirection: 'column',
        flex: 1,
        transition: 'left 0.5s ease 0s',
        padding: 0
    },
    toolbarGrow: {
        color: theme.palette.text.secondary,
        flexGrow: 1,
    },
    overrideToolbar: {
        paddingLeft: theme.spacing.unit * 3 + ['!important'],
        paddingRight: theme.spacing.unit * 3 + ['!important'],
    },
    iconColor: {
        color: theme.palette.text.secondary,
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
            selectableTypes, rootLabel, buttonClass,
            setRefetch} = this.props;

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
                    <CmPickerViewMaterial
                        {...others}
                        textRenderer={entry => {
                        let contextualMenu = React.createRef();
                        return (
                            <React.Fragment>
                                <ContextualMenu ref={contextualMenu} actionKey="contentTreeActions" context={{path: entry.node.path}}/>
                                <span onContextMenu={event => contextualMenu.current.open(event)}>
                                    {entry.depth > 0 ? entry.node.displayName : rootLabel}
                                </span>
                            </React.Fragment>
);
}
                    }
                        actionsRenderer={entry =>
                        entry.depth > 0 ?
                            <DisplayActions target="contentTreeActions" context={{path: entry.node.path}} render={iconButtonRenderer({
                                color: 'inherit',
                                className: buttonClass,
                                'data-cm-role': 'picker-item-menu'
                            })}/> :
                            null
                    }
                />
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
        const {lang, siteKey, path, openPaths, t, user, contentTreeConfigs, setPath, openPath,
            closePath, classes, setRefetch, onContextualMenu, mode, isOpen, openDrawer} = this.props;
        const rootPath = '/sites/' + siteKey;
        const usedPath = path.startsWith(rootPath) ? path : rootPath;

        return (
            <div className={classes.trees}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell className={classes.tableCellHeight}>
                                {isOpen ?
                                    <Toolbar classes={{gutters: classes.overrideToolbar}}>
                                        <Typography variant='subtitle2' className={classes.toolbarGrow}>
                                            {t('label.contentManager.tree.title')}
                                        </Typography>
                                        <IconButton className={classes.iconColor}>
                                            <ChevronLeft onClick={openDrawer}/>
                                        </IconButton>
                                    </Toolbar>
						            :
                                    <div>
                                        <IconButton className={classes.iconColor}>
                                            <ChevronRight onClick={openDrawer}/>
                                        </IconButton>
                                    </div>
					            }
                            </TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        <TableRow>
                            <TableCell>
                                {isOpen ?

                                    <List disablePadding>
                                        {
				                            _.map(contentTreeConfigs, (contentTreeConfig) => {

					                            let componentRef = React.createRef();
					                            this.componentsRefs.push(componentRef);
					                            return <ListItem key={contentTreeConfig.key}
					                                             disableGutters
					                                             className={classes.disablePad}
					                                             data-cm-role={contentTreeConfig.key}>
                                                    <ContentTree ref={componentRef}
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
						                                         buttonClass={classes.buttonMenu}
						                                         onContextualMenu={onContextualMenu}
						                            />
					                            </ListItem>;
				                            })
			                            }
                                    </List>
		                            :
                                    <List />
	                            }
                            </TableCell>
                        </TableRow>
                    </TableBody>
                </Table>
            </div>
        );
    }
}

const mapStateToProps = state => ({
    siteKey: state.site,
    lang: state.language,
    path: state.path,
    mode: state.mode,
    openPaths: state.openPaths
});

const mapDispatchToProps = dispatch => ({
    setPath: (path, params) => dispatch(cmGoto({path, params})),
    openPath: path => dispatch(cmOpenPaths([path])),
    closePath: path => dispatch(cmClosePaths([path]))
});

export default compose(
    translate(),
    withStyles(styles, {withTheme: true}),
    connect(mapStateToProps, mapDispatchToProps)
)(ContentTrees);
