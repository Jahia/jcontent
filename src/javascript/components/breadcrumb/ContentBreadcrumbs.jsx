import React from "react";
import PropTypes from "prop-types";
import * as _ from 'lodash';
import Breadcrumb from "./Breadcrumb";
import gql from "graphql-tag";
import {Picker} from "@jahia/react-apollo";
import {translate} from "react-i18next";
import connect from "react-redux/es/connect/connect";
import {cmGoto} from "../redux/actions";
import {extractPaths} from "../utils.js";

class ContentBreadcrumbs extends React.Component {

    constructor(props) {
        super(props);
        this.picker = React.createRef();
    }

    generatePathParts(path) {
        let {siteKey} = this.props;
        const sitePath = "/sites/" + siteKey;
        if (path.startsWith(sitePath + "/")) {
            path = path.substring(("/sites/" + siteKey).length);
        } else {
            path = sitePath;
        }
        return extractPaths(siteKey, path);
    }

    getPickerConfiguration(path) {
        let {t, siteKey} = this.props;
        let rootPath = "/sites/" + siteKey;
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

        let {lang, siteKey, path, params, setUrl} = this.props;
        let rootPath = "/sites/" + siteKey;
        let pickerConfiguration = this.getPickerConfiguration(path);
        let paths = this.generatePathParts(path);

        return (
            <Picker
                fragments={["displayName", {
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
                onSelectItem={(mode, path) => setUrl(mode, path)}
            >
                {({...others}) => {
                    return <Breadcrumb
                        {...others}
                        path={path}
                        rootPath={rootPath}
                        rootLabel={pickerConfiguration.rootLabel}
                        handleSelect={others.onSelectItem}
                    />
                }}
            </Picker>
        );
    }
}

const mapStateToProps = (state, ownProps) => ({
    siteKey: state.site,
    lang: state.language,
    path: state.path,
    params: state.params
})

const mapDispatchToProps = (dispatch, ownProps) => ({
    setUrl: (mode, path) => dispatch(cmGoto({mode, path}))
})

ContentBreadcrumbs = _.flowRight(
    translate(),
    connect(mapStateToProps, mapDispatchToProps)
)(ContentBreadcrumbs);

export default ContentBreadcrumbs;