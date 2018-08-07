import React from 'react';
import {checkPermissionQuery} from "./gqlQueries";
import {Query} from "react-apollo";

class Action extends React.Component {

    render() {
        const {call, children, path, requiredPermission, ...rest} = this.props;
        // check permission
        const permission = requiredPermission === undefined || requiredPermission === "" ? "jcr:write" : requiredPermission;
        // todo: check nodeType or any other constraint

        return (
            <Query query={ checkPermissionQuery } variables={{path: path, permission: permission}}>
                {({loading, error, data}) => {
                    if (loading || !data || !data.jcr) {
                        return null;
                    }

                    return !loading && data.jcr && data.jcr.nodeByPath.perm && children({...rest, onClick: () => call(path)})
                } }
            </Query>
        )
    }
}


export default Action;

