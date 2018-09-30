import React from "react";
import {Picker} from "@jahia/react-apollo";
import {CmPickerViewMaterial} from "./picker/CmPickerViewMaterial";
import {List, ListItem, Button, Table, TableCell, TableBody, TableRow, TableHead, withStyles} from "@material-ui/core";
import {translate} from 'react-i18next';
import Actions from "./Actions";
import CmIconButton from "./renderAction/CmIconButton";
import {lodash as _} from "lodash";
import connect from "react-redux/es/connect/connect";
import {cmGoto, cmOpenPaths, cmClosePaths} from "./redux/actions";

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
        width: '260px',
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
        let {rootPath, path, openPaths, handleOpen, handleSelect, lang, openableTypes, selectableTypes, rootLabel, filterTypes, recurTypes, user} = this.props;
        console.log("open tree", rootPath, path);
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
                onOpenItem={(path, open) => handleOpen(path, open)}
                onSelectItem={(path) => handleSelect(path)}
            >
                {({handleSelect, ...others}) =>
                    <CmPickerViewMaterial {...others}
                                          textRenderer={(entry) => {
                                              return entry.depth > 0 ? entry.node.displayName : rootLabel;
                                          }}
                                          action={(entry) =>
                                              entry.depth > 0 ? <Actions menuId={"contentTreeActions"} context={{
                                                  uuid: entry.node.uuid,
                                                  path: entry.node.path,
                                                  displayName: entry.node.displayName,
                                                  lang: lang,
                                                  user: user,
                                                  nodeName: entry.node.nodeName
                                              }}>
                                                  {(props) => <CmIconButton {...props}
                                                                            cmRole={'picker-item-menu'}/>}
                                              </Actions> : null
                                          }/>}
            </Picker>
        )
    }
}

class ContentTrees extends React.Component {

    constructor(props) {
        super(props);
        this.componentsRefs = [];
    }

    render() {

        const {lang, siteKey, path, openPaths, t, user, contentTreeConfigs, setPath, openPath, closePath, classes} = this.props;
        const rootPath = "/sites/" + siteKey;
        const usedPath = path.startsWith(rootPath) ? path : rootPath;
        return (
            <div className={classes.trees}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>
                                {t("label.contentManager.tree.title")}
                            </TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        <TableRow>
                            <TableCell>
                                <List>
                                    {
                                        _.map(contentTreeConfigs, (contentTreeConfig) => {

                                            let componentRef = React.createRef();
                                            this.componentsRefs.push(componentRef);
                                            return <ListItem data-cm-role={contentTreeConfig.key} disableGutters
                                                             key={contentTreeConfig.key}>
                                                <ContentTree
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
                                                />
                                            </ListItem>
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
    openPaths: state.openPaths
});

const mapDispatchToProps = (dispatch, ownProps) => ({
    setPath: (path, params) => dispatch(cmGoto({path, params})),
    openPath: (path) => dispatch(cmOpenPaths([path])),
    closePath: (path) => dispatch(cmClosePaths([path]))
});

ContentTrees = _.flowRight(
    translate(),
    withStyles(styles, {withTheme: true}),
    connect(mapStateToProps, mapDispatchToProps)
)(ContentTrees);

export default ContentTrees;