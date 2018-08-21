import React from "react";
import PropTypes from "prop-types";
import * as _ from 'lodash';
import Breadcrumb from "./Breadcrumb";
import gql from "graphql-tag";
import {Picker} from "@jahia/react-apollo";
import {translate} from "react-i18next";
import CmRouter from "../CmRouter";
import {SITE_ROOT} from "../CmRouter";

class ContentBreadcrumbs extends React.Component {

    constructor(props) {
        super(props);
        this.picker = React.createRef();
        this.getBasePath = this.getBasePath.bind(this);
    }

    getBasePath(type) {
        switch(type) {
            case 'contents': return 'browse';
            case 'files': return 'browse-files';
            case 'pages': return 'browse';
        }
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

    getPickerConfiguration(path) {
        let {t, rootPath} = this.props;
        let pickerConfiguration = {};
        if (path.indexOf(rootPath + "/contents") !== -1) {
            pickerConfiguration.selectableTypes = ['jmix:list'];
            pickerConfiguration.openableTypes = ['jmix:list', 'jnt:contentFolder'];
            pickerConfiguration.rootLabel = t("label.contentManager.browseFolders");
            pickerConfiguration.rootPath = rootPath + "/contents";
        } else if (path.indexOf(rootPath + "/files") !== -1) {
            pickerConfiguration.selectableTypes = ['jnt:folder'];
            pickerConfiguration.openableTypes = ['jnt:folder'];
            pickerConfiguration.rootLabel = t("label.contentManager.browseFiles");
            pickerConfiguration.rootPath = rootPath + "/files";
        } else {
            pickerConfiguration.selectableTypes = ["jnt:page"];
            pickerConfiguration.openableTypes = ['jnt:page', 'jnt:virtualsite', 'jnt:navMenuText'];
            pickerConfiguration.rootLabel = t("label.contentManager.browsePages");
            pickerConfiguration.rootPath = rootPath
        }
        return pickerConfiguration;
    }

    render() {

        let {lang, dxContext, rootPath} = this.props;

        return (
            <CmRouter render={({path, params, goto}) => {
                let pickerConfiguration = this.getPickerConfiguration(path);
                let paths = this.generatePathParts(path);
                return (
                    <Picker
                        fragments={["displayName", {applyFor: "node", gql: gql`fragment PrimaryNodeTypeName on JCRNode { primaryNodeType { name } }`}]}
                        ref={this.picker}
                        rootPaths={[pickerConfiguration.rootPath]}
                        openPaths={paths}
                        selectedPaths={paths}
                        openableTypes={pickerConfiguration.openableTypes}
                        selectableTypes={pickerConfiguration.selectableTypes}
                        queryVariables={{lang: lang}}
                        openSelection={false}
                        onSelectItem={(path, newParams) => {goto(SITE_ROOT + '/' + this.getBasePath(newParams.type) + path, newParams)}}
                    >
                        {({...others}) => {
                            return <Breadcrumb
                                {...others}
                                path={path}
                                rootPath={rootPath}
                                rootLabel={pickerConfiguration.rootLabel}
                                dxContext={dxContext}
                                handleSelect={others.onSelectItem}
                            />
                        }}
                    </Picker>
                );
            }}/>
        );
    }
}

ContentBreadcrumbs.propTypes = {
    dxContext: PropTypes.object.isRequired,
    lang: PropTypes.string.isRequired,
    rootPath: PropTypes.string.isRequired
};

export default translate()(ContentBreadcrumbs);