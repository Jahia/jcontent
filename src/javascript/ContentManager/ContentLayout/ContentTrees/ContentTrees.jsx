import React from 'react';
import {AppBar, Grid, Toolbar, withStyles} from '@material-ui/core';
import {Typography, IconButton} from '@jahia/ds-mui-theme';
import {translate} from 'react-i18next';
import {ChevronLeft} from '@material-ui/icons';
import {lodash as _} from 'lodash';
import {connect} from 'react-redux';
import {CM_DRAWER_STATES, cmClosePaths, cmGoto, cmOpenPaths, cmSetTreeState} from '../../ContentManager.redux-actions';
import {compose} from 'react-apollo';
import ContentManagerConstants from '../../ContentManager.constants';
import ContentTree from './ContentTree';

const styles = theme => ({
    listContainer: {
        flex: '1 0 0%',
        overflow: 'auto',
        width: theme.contentManager.treeDrawerWidth + 'px'
    },
    list: {
        width: 'fit-content',
        minWidth: '100%'
    }
});

export class ContentTrees extends React.Component {
    constructor(props) {
        super(props);
        this.container = React.createRef();
    }

    render() {
        const {
            lang, siteKey, path, openPaths, t, user, setPath, openPath,
            closePath, classes, setRefetch, mode, isOpen, closeTree
        } = this.props;
        const rootPath = '/sites/' + siteKey;
        const usedPath = path.startsWith(rootPath) ? path : rootPath;

        let contentTreeConfigs = mode === 'browse' ? [ContentManagerConstants.contentTreeConfigs.contents, ContentManagerConstants.contentTreeConfigs.pages] : [ContentManagerConstants.contentTreeConfigs.files];
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
                                <Typography variant="zeta" color="inherit">
                                    {t('label.contentManager.tree.title')}
                                </Typography>
                            </Grid>
                            <Grid item>
                                <IconButton icon={<ChevronLeft fontSize="small"/>} color="inherit" data-cm-role="hide-tree" onClick={closeTree}/>
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
                                                 handleSelect={path => setPath(path, {sub: false})}
                                                 openableTypes={contentTreeConfig.openableTypes}
                                                 rootLabel={t(contentTreeConfig.rootLabel)}
                                                 setRefetch={setRefetch(contentTreeConfig.key)}
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
    previewSelection: state.previewSelection
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
