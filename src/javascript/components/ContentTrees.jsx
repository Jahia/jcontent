import React from "react";
import {Picker} from "@jahia/react-apollo";
import {PickerViewMaterial} from '@jahia/react-material';
import {List, ListItem, Button} from "@material-ui/core";
import CmRouter from "./CmRouter";
import gql from "graphql-tag";
import {translate} from 'react-i18next';
import * as _ from 'lodash';

class ContentTree extends React.Component {
    constructor(props) {
        super(props);
        this.picker = React.createRef();
    }

    render() {
        let {rootPath, path, handleSelect, lang, openableTypes, selectableTypes, rootLabel, filterTypes, recurTypes} = this.props;
        return (
            <Picker fragments={["displayName", {
                applyFor: "node",
                gql: gql`fragment PrimaryNodeTypeName on JCRNode { primaryNodeType { name } }`
            }]}
                    ref={this.picker}
                    rootPaths={[rootPath]}
                    defaultOpenPaths={[path]}
                    openableTypes={openableTypes}
                    selectableTypes={selectableTypes}
                    queryVariables={{lang: lang}}
                    selectedPaths={[path]}
                    openSelection={false}
                    onSelectItem={(path) => handleSelect(path)}>
                {({handleSelect, ...others}) => <PickerViewMaterial {...others} textRenderer={(entry) => {
                    return entry.depth > 0 ? entry.node.displayName : rootLabel;
                }}/>}
            </Picker>
        )
    }
}

class ContentTrees extends React.Component {
    constructor(props) {
        super(props);
        this.contentTree = React.createRef();
        this.pageTree= React.createRef();
    }

    openTrees(path) {
        this.contentTree.current.picker.current.openPaths(path);
        this.pageTree.current.picker.current.openPaths(path);
    }

    render() {
        const {lang, rootPath, path, t} = this.props;
        return (<CmRouter render={({goto}) => (
                <List>
                    <ListItem>
                        <Button onClick={() => this.openTrees(path)}>{t("label.contentManager.showCurrentPath")}</Button>
                    </ListItem>
                    <ListItem>
                        <ContentTree
                            ref={this.contentTree}
                            path={path}
                            rootPath={rootPath + "/contents"}
                            selectableTypes={['jmix:list']}
                            lang={lang}
                            handleSelect={path => goto(path, {type: "contents"})}
                            openableTypes={['jmix:list', 'jnt:contentFolder']}
                            rootLabel={t("label.contentManager.browseFolders")}
                        />
                    </ListItem>
                    <ListItem>
                        <ContentTree
                            ref={this.pageTree}
                            path={path}
                            rootPath={rootPath}
                            selectableTypes={['jnt:page']}
                            lang={lang}
                            handleSelect={path => goto(path, {type: "pages"})}
                            openableTypes={['jnt:page', 'jnt:virtualsite', 'jnt:navMenuText']}
                            rootLabel={t("label.contentManager.browsePages")}
                        />
                    </ListItem>
                </List>
            )}/>
        )
    }
}

export default translate()(ContentTrees);