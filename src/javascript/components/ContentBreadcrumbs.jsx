import React from "react";
import {Link} from 'react-router-dom';
import * as _ from 'lodash';

class ContentBreadcrumbs extends React.Component {
    render() {
        let {path} = this.props;
        let pathElements = _.reduce(_.split(path.substring(1), '/'), (result, value) => _.concat(result, result[result.length - 1] + '/' + value), ['']);

        return (
            <span>{_.range(pathElements.length).map(i => (<span key={i}><Link to={`${pathElements[i]}`}>{pathElements[i]}/</Link>   -    </span>))}</span>
        )
    }
}

export default ContentBreadcrumbs;