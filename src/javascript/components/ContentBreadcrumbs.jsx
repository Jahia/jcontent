import React from "react";
import * as _ from 'lodash';
import CmLink from "./CmLink";

class ContentBreadcrumbs extends React.Component {

    render() {
        let {path} = this.props;
        // create a list of path from the current path to the root path
        let pathElements = _.reduce(_.split(path.substring(1), '/'), (result, value) => _.concat(result, result[result.length - 1] + '/' + value), ['']);

        return (
            <span>
                {
                    _.range(pathElements.length).map(i => {
                        // compute the current folder name by removing the parent path (the previous one in the pathElements list) from the current path
                        const link = i > 0 ? _.replace(pathElements[i], pathElements[i - 1], '') : "/";
                        return (
                            <span key={i}>
                                {i < pathElements.length - 1 ? <span><CmLink to={pathElements[i]}>{link}</CmLink> - </span> : <span>{link}</span>}
                            </span>
                        );
                    })
                }
            </span>
        );
    }
}

export default ContentBreadcrumbs;