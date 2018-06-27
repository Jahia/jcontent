import React from "react";
import {Link} from 'react-router-dom';
import * as _ from 'lodash';
import {Typography} from "@material-ui/core";


class ContentBreadcrumbs extends React.Component {
    render() {
        let {path} = this.props;
        let pathElements = _.reduce(_.split(path.substring(1), '/'), (result, value) => _.concat(result, result[result.length - 1] + '/' + value), ['']);

        return (
            <span>{_.range(pathElements.length).map(i => (<span key={i}><Link to={pathElements[i]}>{i > 0 ? _.replace(pathElements[i], pathElements[i - 1], '') : '/'}</Link>   -    </span>))}</span>
        )
    }
}

export default ContentBreadcrumbs;