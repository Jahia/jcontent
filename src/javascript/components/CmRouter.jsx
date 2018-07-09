import React from "react";
import * as _ from "lodash";
import { withRouter } from "react-router";

const QUESTION_MARK_SEPARATOR_INDEX = 1;

class CmRouter extends React.Component {

    mapUrlToQuery = (match, location) => {
        return {
            path: match.url,
            filter: this.deserializeQueryString(location)
        }
    };

    deserializeQueryString = location => {
        const search = location.search !== "" && location.search.substring(QUESTION_MARK_SEPARATOR_INDEX); // removes ? from the query string
        return search && JSON.parse('{"' + decodeURI(search).replace(/"/g, '\\"').replace(/&/g, '","').replace(/=/g,'":"') + '"}');
    };

    // This method push to the browser url the provided location
    mapQueryToUrl = history => {
        return {
            goto: (path, filter) => history.push(path + (filter ? "?" + Object.keys(filter).map(key => {
                return encodeURIComponent(key) + '=' + encodeURIComponent(filter[key]);
            }).join('&') : ''))
        }
    };

    render() {
        const { match, location, history } = this.props;
        return <span>{this.props.render({...this.mapUrlToQuery(match, location), ...this.mapQueryToUrl(history)})}</span>
    }
};

export default withRouter(CmRouter);