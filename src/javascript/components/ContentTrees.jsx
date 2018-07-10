import React from "react";
import {Picker} from "@jahia/react-apollo";
import {PickerViewMaterial} from '@jahia/react-material';
import {List, ListItem} from "@material-ui/core";
import CmRouter from "./CmRouter";
import gql from "graphql-tag";

class ContentTree extends React.Component {

    render() {
        let {rootPath, path, handleSelect, lang, openableTypes, selectableTypes} = this.props;
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
                    onSelectItem={(path) => handleSelect(path)}>
                {({handleSelect, ...others}) => <PickerViewMaterial {...others} textRenderer={(entry) => entry.node.displayName}/>}
            </Picker>
        )
    }
}

let ContentTrees = (props) => {
    const {lang, rootPath, path} = props;
    return (<CmRouter render={({goto}) => (
            <List>
                <ListItem>
                    <ContentTree
                        path={rootPath}
                        rootPath={rootPath}
                        selectableTypes={['jnt:page']}
                        lang={lang}
                        handleSelect={ path => goto(path) }
                        openableTypes={['jnt:page', 'jnt:virtualsite', 'jnt:navMenuText']}
                    />
                </ListItem>
                <ListItem>
                    <ContentTree
                        path={rootPath+ "/contents"}
                        rootPath={rootPath + "/contents"}
                        selectableTypes={['jmix:list']}
                        lang={lang}
                        handleSelect={ path => goto(path) }
                        openableTypes={['jmix:list', 'jnt:contentFolder']}
                    />
                </ListItem>
            </List>
        )} />
    )
}

export default ContentTrees;