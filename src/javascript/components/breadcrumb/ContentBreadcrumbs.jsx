import React from "react";
import PropTypes from "prop-types";
import * as _ from 'lodash';
import Breadcrumb from "./Breadcrumb";
import gql from "graphql-tag";
import {Picker} from "@jahia/react-apollo";


class ContentBreadcrumbs extends React.Component {

    constructor(props) {
        super(props);
        let {path, dxContext} = props;
        this.rootPath = '/sites/' + dxContext.siteKey;
        this.updatePickerSelectedPath = this.updatePickerSelectedPath.bind(this);
        this.state = {
            currentPath: path,
            picker: React.createRef()
        }
    }

    updatePickerSelectedPath(path, type) {
        let {goto} = this.props;
        goto(path, {type: type});
    }

    render() {
        let {currentPath, picker} = this.state;
        let {path, rootPath, lang, dxContext, params} = this.props;
        if (currentPath !== path) {
            setTimeout(() => {
                //Update picker query since selected path has changed!
                this.setState({
                    currentPath: path,
                    picker: React.createRef()
                });
            });
        }
        return (
            <Picker fragments={["displayName", {
                applyFor: "node",
                gql: gql`fragment PrimaryNodeTypeName on JCRNode { primaryNodeType { name } }`
            }]}
                    ref={picker}
                    rootPaths={[rootPath]}
                    defaultOpenPaths={[path]}
                    defaultSelectedPaths={[path]}
                    openableTypes={['jnt:page', 'jnt:virtualsite', 'jnt:navMenuText']}
                    selectableTypes={['jnt:page']}
                    queryVariables={{lang: lang}}
                    openSelection={false}>
                {({...others}) => (<Breadcrumb {...others}   updatePickerSelectedPath={this.updatePickerSelectedPath}
                                                             path={path}
                                                             dxContext={dxContext}
                                                             params={params} />)}
            </Picker>
        );
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
export default ContentBreadcrumbs;