import React from "react";
import {Picker} from "@jahia/react-apollo";
import {PickerViewMaterial} from '@jahia/react-material';
import {List, ListItem, Button, withStyles} from "@material-ui/core";
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
        height: '100vh',
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
                {({handleSelect, ...others}) => <PickerViewMaterial {...others} textRenderer={(entry) => {
                    return entry.depth > 0
                        ? <React.Fragment>
                            {entry.node.displayName}
                            <Actions menuId={"contentTreeActions"} context={{uuid: entry.node.uuid, path: path, displayName: entry.node.displayName, lang: lang, user:user, nodeName:entry.node.nodeName}}>
                                {(props) => <CmIconButton {...props} cmRole={'picker-item-menu'}/>}
                            </Actions>
                        </React.Fragment>
                        : rootLabel;
                }}/>}
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
        return <List className={classes.trees}>
            {contentTreeConfigs.showAllContents
                ? <ListItem>
                    <Button onClick={() => openPath(usedPath)}>{t("label.contentManager.showCurrentPath")}</Button>
                </ListItem>
                : ""
            }
            {
                _.map(contentTreeConfigs, (contentTreeConfig) => {

                    let componentRef = React.createRef();
                    this.componentsRefs.push(componentRef);

                    return <ListItem data-cm-role={contentTreeConfig.key}  key={contentTreeConfig.key}>
                        <ContentTree
                            ref={componentRef}
                            path={usedPath}
                            rootPath={rootPath + contentTreeConfig.rootPath}
                            openPaths={openPaths}
                            selectableTypes= {contentTreeConfig.selectableTypes}
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
        </List>;
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