import React from "react";
import * as _ from "lodash";
import { withRouter } from "react-router";

class CmRouter extends React.Component {

    mapUrlToQuery = (match, location) => {
        return {
            path: _.replace(location.pathname, match.path, ''),
            filter: this.deserializeQueryString(location)
        }
    };

    deserializeQueryString = location => {
        const s = location.search;
        const search = (s && s !== "" && s.substring(1)); // removes ? from the query string
        return search && JSON.parse('{"' + decodeURI(search).replace(/"/g, '\\"').replace(/&/g, '","').replace(/=/g,'":"') + '"}');
    };

    // This method push to the browser url the provided location
    mapQueryToUrl = (match, history, location) => {
        return {
            goto: (path, filter) => {
                let queryString;
                if (filter) {
                    queryString = '?' + Object.keys(filter).map(key => {
                        return (encodeURIComponent(key) + '=' + encodeURIComponent(filter[key]));
                    }).join('&');
                } else {
                    queryString = '';
                }
                history.push( match.path + path  + queryString);
            }
        }
    };

    render() {
        const { match, location, history } = this.props;
        return <span>{this.props.render({...this.mapUrlToQuery(match, location), ...this.mapQueryToUrl(match, history, location)})}</span>
    }
};

export default withRouter(CmRouter);