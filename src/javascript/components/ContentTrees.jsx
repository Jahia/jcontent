import React from "react";
import {Picker} from "@jahia/react-apollo";
import {CmPickerViewMaterial} from "./picker/CmPickerViewMaterial";
import {List, ListItem, Button, Table, TableCell, TableBody, TableRow, TableHead, withStyles} from "@material-ui/core";
import {translate} from 'react-i18next';
import Actions from "./Actions";
import CmIconButton from "./renderAction/CmIconButton";
import {lodash as _} from "lodash";
import connect from "react-redux/es/connect/connect";
import {cmGoto, cmOpenPaths, cmClosePaths } from "./redux/actions";
import { invokeContextualMenu } from "./contextualMenu/redux/actions";

const styles = theme => ({
    trees: {
        overflowY: 'scroll',
        overflowX: 'scroll',
        maxWidth: '260px',
        width: '260px',
        height: 'calc(100vh - 140px)',
        maxHeight:  'calc(100vh - 140px)'
    },
    list: {
        maxWidth: '260px',
        width: '260px'
    },
    tableHeight: {
        height: '28px',
        maxHeight: '28px',
        minHeight: '28px'
    },
    tableCellHeight: {
        padding: '0px 0px 0px 10px',
        color: '#5E6565',
        '&:hover': {
            height: '28px',
            padding: '0px 0px 0px 10px',
            maxHeight: '28px',
            minHeight: '28px',
            color: '#d1d1d1'
        },
    },
    disablePad: {
        padding: '0!important'
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
            filterTypes, recurTypes, user, setRefetch, onContextualMenu} = this.props;

        return <Picker
            ref={this.picker}
            rootPaths={[rootPath]}
            openPaths={openPaths}
            openableTypes={openableTypes}
            selectableTypes={selectableTypes}
            queryVariables={{lang: lang}}
            selectedPaths={[path]}
            openSelection={false}
            onOpenItem={(path, open) => handleOpen(path, open)}
            onSelectItem={(path) => handleSelect(path)}
            setRefetch={ setRefetch }
        >
            {({handleSelect, ...others}) =>
                <CmPickerViewMaterial
                    {...others}
                    textRenderer={(entry) => {
                        return <span onContextMenu={(event) => {onContextualMenu({isOpen: true, event:event, menuId: this.resolveMenuId(entry.node.path), primaryNodeType: entry.node.primaryNodeType.name, path: entry.node.path, uuid: entry.node.uuid, displayName: entry.node.displayName, nodeName: entry.node.nodeName})}}>
                            {entry.depth > 0 ? entry.node.displayName : rootLabel}
                        </span>
                        }
                    }
                    actionsRenderer={(entry) =>

                        entry.depth > 0

                        ? <Actions menuId={"contentTreeActions"} context={{
                            uuid: entry.node.uuid,
                            path: entry.node.path,
                            displayName: entry.node.displayName,
                            primaryNodeType: entry.node.primaryNodeType.name,
                            lang: lang,
                            user: user,
                            nodeName: entry.node.nodeName
                        }}>
                            {(props) => <CmIconButton {...props} cmRole={'picker-item-menu'}/>}
                        </Actions>

                        : null
                    }
                />
            }
        </Picker>;
    }

    resolveMenuId(path) {
        let {mode, siteKey} = this.props;
        switch (mode) {
            case 'browse-files':
                return "contextualMenuFilesAction";
            case 'browse':
                return path.indexOf(`/sites/${siteKey}/contents`) !== -1  ? "contextualMenuFoldersAction" : "contextualMenuPagesAction";
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
            closePath, classes, setRefetch, onContextualMenu, mode} = this.props;
        const rootPath = "/sites/" + siteKey;
        const usedPath = path.startsWith(rootPath) ? path : rootPath;

        return (
            <div className={classes.trees}>
                <Table>
                    <TableHead>
                        <TableRow className={classes.tableHeight}>
                            <TableCell className={classes.tableCellHeight}>
                                {t("label.contentManager.tree.title")}
                            </TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        <TableRow>
                            <TableCell>
                                <List disablePadding>
                                    {
                                        _.map(contentTreeConfigs, (contentTreeConfig) => {

                                            let componentRef = React.createRef();
                                            this.componentsRefs.push(componentRef);
                                            return <ListItem
                                                data-cm-role={contentTreeConfig.key}
                                                disableGutters
                                                className={classes.disablePad}
                                                key={contentTreeConfig.key}
                                            >
                                                <ContentTree
                                                    mode={mode}
                                                    siteKey={siteKey}
                                                    onContextualMenu={onContextualMenu}
                                                    ref={componentRef}
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
                                                    setRefetch={ setRefetch(contentTreeConfig.key) }
                                                />
                                            </ListItem>;
                                        })
                                    }
                                </List>
                            </TableCell>
                        </TableRow>
                    </TableBody>
                </Table>
            </div>
        )
    }
}

const mapStateToProps = (state, ownProps) => ({
    siteKey: state.site,
    lang: state.language,
    path: state.path,
    mode: state.mode,
    openPaths: state.openPaths
});

const mapDispatchToProps = (dispatch, ownProps) => ({
    setPath: (path, params) => dispatch(cmGoto({path, params})),
    openPath: (path) => dispatch(cmOpenPaths([path])),
    closePath: (path) => dispatch(cmClosePaths([path])),
    onContextualMenu: (params) => {
        dispatch(invokeContextualMenu(params));
    }
});

ContentTrees = _.flowRight(
    translate(),
    withStyles(styles, {withTheme: true}),
    connect(mapStateToProps, mapDispatchToProps)
)(ContentTrees);

export default ContentTrees;