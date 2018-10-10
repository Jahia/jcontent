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
import Constants from '../constants';

class ContentBreadcrumbs extends React.Component {

    constructor(props) {
        super(props);
        this.picker = React.createRef();
    }

    generatePathParts(path) {
        let {siteKey, mode} = this.props;
        const sitePath = "/sites/" + siteKey + (mode === 'browse-files' ? '/files' : '');
        if (path.startsWith(sitePath + "/")) {
            path = path.substring(sitePath.length);
        } else {
            path = sitePath;
        }
        return extractPaths(siteKey, path, mode);
    }

    getPickerConfiguration(path) {
        let {t, siteKey, mode} = this.props;
        let rootPath = "/sites/" + siteKey;
        let pickerConfiguration = {};

        if (mode === Constants.mode.FILES) {
            pickerConfiguration.selectableTypes = ['jnt:folder'];
            pickerConfiguration.openableTypes = ['jnt:folder'];
            pickerConfiguration.rootLabel = t("label.contentManager.browseFiles");
            pickerConfiguration.rootPath = rootPath + "/files";
        }
        else if (path.indexOf(rootPath + "/contents") !== -1) {
            pickerConfiguration.selectableTypes = ['jmix:list'];
            pickerConfiguration.openableTypes = ['jmix:list', 'jnt:contentFolder'];
            pickerConfiguration.rootLabel = t("label.contentManager.browseFolders");
            pickerConfiguration.rootPath = rootPath + "/contents";
        }
        else {
            pickerConfiguration.selectableTypes = ["jnt:page"];
            pickerConfiguration.openableTypes = ['jnt:page', 'jnt:virtualsite', 'jnt:navMenuText'];
            pickerConfiguration.rootLabel = t("label.contentManager.browsePages");
            pickerConfiguration.rootPath = rootPath
        }

        return pickerConfiguration;
    }

    render() {

        let {lang, siteKey, path, setUrl, mode} = this.props;
        let rootPath =  "/sites/" + siteKey  + (mode === 'browse-files' ? '/files' : '');
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
                onSelectItem={(mode, path) => setUrl(mode, path)}
            >
                {({error, ...others}) => {
                    if (error) {
                        return null;
                    }
                    return <Breadcrumb
                        {...others}
                        path={path}
                        rootPath={rootPath}
                        rootLabel={pickerConfiguration.rootLabel}
                        mode={ mode }
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
});

const mapDispatchToProps = (dispatch, ownProps) => ({
    setUrl: (mode, path) => dispatch(cmGoto({mode, path}))
});

ContentBreadcrumbs = _.flowRight(
    translate(),
    connect(mapStateToProps, mapDispatchToProps)
)(ContentBreadcrumbs);

export default ContentBreadcrumbs;