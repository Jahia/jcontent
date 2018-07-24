import React from "react";
import PropTypes from "prop-types";
import * as _ from 'lodash';
import Breadcrumb from "./Breadcrumb";
import gql from "graphql-tag";
import {Picker} from "@jahia/react-apollo";
import {translate} from "react-i18next";


class ContentBreadcrumbs extends React.Component {

    constructor(props) {
        super(props);
        this.picker = React.createRef();
    }

    generatePathParts(path) {
        let {dxContext} = this.props;
        let pathParts = path.replace("/sites/" + dxContext.siteKey, "").split("/");
        let newPaths = [];
        for (let i in pathParts) {
            if (i > 0) {
                newPaths.push(newPaths[i - 1] + "/" + pathParts[i]);
            } else {
                newPaths.push("/sites/" + dxContext.siteKey);
            }
        }
        return newPaths;
    }

    getPickerConfiguration() {
        let {params, t, rootPath} = this.props;
        let pickerConfiguration = {
            type: params.type
        };
        switch (params.type) {
            case "contents" :
                pickerConfiguration.selectableTypes = ['jmix:list'];
                pickerConfiguration.openableTypes = ['jmix:list', 'jnt:contentFolder'];
                pickerConfiguration.rootLabel = t("label.contentManager.browseFolders");
                pickerConfiguration.rootPath = rootPath + "/contents";
                break;
            case "files":
                pickerConfiguration.selectableTypes = ['jnt:folder'];
                pickerConfiguration.openableTypes = ['jnt:folder'];
                pickerConfiguration.rootLabel = t("label.contentManager.browseFiles");
                pickerConfiguration.rootPath = rootPath + "/files";
                break;
            case "pages":
            default:
                pickerConfiguration.selectableTypes = ["jnt:pages"];
                pickerConfiguration.openableTypes = ['jnt:page', 'jnt:virtualsite', 'jnt:navMenuText'];
                pickerConfiguration.rootLabel = t("label.contentManager.browsePages");
                pickerConfiguration.rootPath = rootPath
        }
        return pickerConfiguration;
    }

    render() {
        let {lang, dxContext, goto, path, params} = this.props;
        let paths = this.generatePathParts(path);
        let pickerConfiguration = this.getPickerConfiguration();
        return <Picker fragments={["displayName", {
            applyFor: "node",
            gql: gql`fragment PrimaryNodeTypeName on JCRNode { primaryNodeType { name } }`
        }]}
                ref={this.picker}
                rootPaths={[pickerConfiguration.rootPath]}
                openPaths={paths}
                selectedPaths={paths}
                openableTypes={pickerConfiguration.openableTypes}
                selectableTypes={pickerConfiguration.selectableTypes}
                queryVariables={{lang: lang}}
                openSelection={false}
                onSelectItem={path => { this.picker.current.openPaths(path); goto(path, {type: pickerConfiguration.type})}} >
            {({...others}) => {
                return <Breadcrumb {...others}
                                   path={path}
                                   rootLabel={pickerConfiguration.rootLabel}
                                   dxContext={dxContext}
                                   handleSelect={others.onSelectItem}
                                   type={params.type}/>
            }}
        </Picker>
        }
}
ContentBreadcrumbs.propTypes = {
    dxContext: PropTypes.object.isRequired,
    lang: PropTypes.string.isRequired,
    path: PropTypes.string.isRequired,
    rootPath: PropTypes.string.isRequired,
    goto: PropTypes.func.isRequired,
    params: PropTypes.object.isRequired,
};
export default translate()(ContentBreadcrumbs);