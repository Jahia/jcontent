import React from "react";
import PropTypes from "prop-types";
import * as _ from 'lodash';
import Breadcrumb from "./Breadcrumb";
import gql from "graphql-tag";
import {Picker} from "@jahia/react-apollo";


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

    render() {
        let {rootPath, lang, dxContext, goto, path, params} = this.props;
        let paths = this.generatePathParts(path);
        return <Picker fragments={["displayName", {
            applyFor: "node",
            gql: gql`fragment PrimaryNodeTypeName on JCRNode { primaryNodeType { name } }`
        }]}
                ref={this.picker}
                rootPaths={[rootPath]}
                openPaths={paths}
                selectedPaths={paths}
                openableTypes={['jnt:page', 'jnt:virtualsite', 'jnt:navMenuText']}
                selectableTypes={['jnt:page']}
                queryVariables={{lang: lang}}
                openSelection={false}
                onSelectItem={path => { this.picker.current.openPaths(path); goto(path, {type: "pages"})}} >
            {({...others}) => {
                return <Breadcrumb {...others}
                                   path={path}
                                   dxContext={dxContext}
                                   handleSelect={others.onSelectItem}
                                   params={params}/>
            }}
        </Picker>
        }
}
ContentBreadcrumbs.propTypes = {
    dxContext: PropTypes.object.isRequired,
    lang: PropTypes.string.isRequired,
    path: PropTypes.string.isRequired,
    rootPath: PropTypes.string.isRequired,
    goto: PropTypes.func.isRequired
};
export default ContentBreadcrumbs;