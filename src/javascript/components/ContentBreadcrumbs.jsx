import React from "react";
import * as _ from 'lodash';
import CmLink from "./CmLink";

class ContentBreadcrumbs extends React.Component {

    render() {

        let {path, params} = this.props;
        let pathElements = _.split(path.substring(1), '/');
        let names = _.concat(['/'], pathElements);
        let paths = _.concat(['/'], _.reduce(pathElements, (result, pathElement) => {
            let parentPath = (result.length == 0 ? '' : result[result.length - 1]);
            return _.concat(result, (parentPath + '/' + pathElement));
        }, []));

        return (
            <span>
                {
                    _.range(paths.length).map(i => {
                        const link = names[i];
                        return (
                            <span key={i}>
                                {i < paths.length - 1 ? <span><CmLink to={paths[i]} params={ params }>{link}</CmLink> - </span> : <span>{link}</span>}
                            </span>
                        );
                    })
                }
            </span>
        );
    }
}

export default ContentBreadcrumbs;