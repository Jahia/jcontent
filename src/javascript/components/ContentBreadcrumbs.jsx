import React from "react";
import {Link} from 'react-router-dom';
import * as _ from 'lodash';


class ContentBreadcrumbs extends React.Component {
    render() {
        let {path} = this.props;
        let pathElements = _.reduce(_.split(path.substring(1), '/'), (result, value) => _.concat(result, result[result.length - 1] + '/' + value), ['']);

        return (
            <span>{_.range(pathElements.length).map(i => {
                const link = i > 0 ? _.replace(pathElements[i], pathElements[i - 1], '') : "/";
                return (
                    <span key={i}>
                        {i < pathElements.length - 1 ? <span><Link to={pathElements[i]}>{link}</Link> - </span> : <span>{link}</span>}
                    </span>
            )})}
            </span>
        )
    }
}

export default ContentBreadcrumbs;