import React from "react";
import * as _ from "lodash";
import { withRouter } from "react-router";

class CmRouter extends React.Component {

    mapUrlToQuery = (match, location) => {
        return {
            path: match.url,
            filter: this.deserializeQueryString(location)
        }
    };

    deserializeQueryString = location => {
        const search = location.search.substring(1); // removes ? from the query string
        return search && search !== "" && JSON.parse('{"' + decodeURI(search).replace(/"/g, '\\"').replace(/&/g, '","').replace(/=/g,'":"') + '"}');
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
        const { match, location, history, ...rest } = this.props;
        
        return <span>{this.props.render(_.merge({...rest},{...this.mapUrlToQuery(match, location)},{...this.mapQueryToUrl(history)}))}</span>
    }

};

export default withRouter(CmRouter);