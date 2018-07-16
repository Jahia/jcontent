import React from "react";
import {Picker} from "@jahia/react-apollo";
import {PickerViewMaterial} from '@jahia/react-material';
import {List, ListItem} from "@material-ui/core";
import CmRouter from "./CmRouter";
import gql from "graphql-tag";
import {translate} from 'react-i18next';
import * as _ from 'lodash';

class ContentTree extends React.Component {

    render() {
        let {rootPath, path, handleSelect, lang, openableTypes, selectableTypes, rootLabel, filterTypes, recurTypes} = this.props;
        return (
            <Picker fragments={["displayName", {
                applyFor: "node",
                gql: gql`fragment PrimaryNodeTypeName on JCRNode { primaryNodeType { name } }`
            }]}
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

let ContentTrees = (props) => {
    const {lang, rootPath, path, t} = props;
    return (<CmRouter render={({goto}) => (
            <List>
                <ListItem>
                    <ContentTree
                        path={path}
                        rootPath={rootPath + "/contents"}
                        selectableTypes={['jmix:list']}
                        lang={lang}
                        handleSelect={ path => goto( path, {type: "contents"}) }
                        openableTypes={['jmix:list', 'jnt:contentFolder']}
                        rootLabel={t("label.contentManager.browseFolders")}
                    />
                </ListItem>
                <ListItem>
                    <ContentTree
                        path={path}
                        rootPath={rootPath}
                        selectableTypes={['jnt:page']}
                        lang={lang}
                        handleSelect={ path => goto( path, {type: "pages"} ) }
                        openableTypes={['jnt:page', 'jnt:virtualsite', 'jnt:navMenuText']}
                        rootLabel={t("label.contentManager.browsePages")}
                    />
                </ListItem>
            </List>
        )} />
    )
};

export default translate()(ContentTrees);