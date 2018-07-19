import React from "react";
import * as _ from 'lodash';
import Breadcrumb from "./Breadcrumb";
import gql from "graphql-tag";
import {Picker} from "@jahia/react-apollo";
import {defaultIconRenderer} from "@jahia/react-material";


class ContentBreadcrumbs extends React.Component {

    constructor(props) {
        super(props);
        let {dxContext} = props;
        this.picker = React.createRef();
        this.rootPath = '/sites/' + dxContext.siteKey;
        this.updatePickerSelectedPath = this.updatePickerSelectedPath.bind(this);
    }

    updatePickerSelectedPath(path, type) {
        let {goto} = this.props;
        goto(path, {type: type});
    }

    render() {
        let {path, rootPath, lang, dxContext, params} = this.props;
        return (
            <Picker fragments={["displayName", {
                applyFor: "node",
                gql: gql`fragment PrimaryNodeTypeName on JCRNode { primaryNodeType { name } }`
            }]}
                    ref={this.picker}
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

export default ContentBreadcrumbs;