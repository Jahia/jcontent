import React from "react";
import * as _ from "lodash";
import { withRouter } from "react-router";
import { DxContext } from "./DxContext";

class CmRouter extends React.Component {

    mapUrlToQuery = (match, location, dxContext) => {
        return {
            path: '/sites/' + dxContext.siteKey + _.replace(location.pathname, match.path, ''),
            params: this.deserializeQueryString(location)
        }
    };

    deserializeQueryString = location => {
        const s = location.search;
        const search = (s && s !== "" && s.substring(1)); // removes ? from the query string
        return search && JSON.parse('{"' + decodeURIComponent(search).replace(/"/g, '\\"').replace(/&/g, '","').replace(/=/g,'":"') + '"}');
    };

    // This method push to the browser url the provided location
    mapQueryToUrl = (match, history, location, dxContext) => {
        return {
            goto: ( path, filter) => {
                let queryString;
                if (filter) {
                    queryString = '?' + Object.keys(filter).map(key => {
                        return (encodeURIComponent(key) + '=' + encodeURIComponent(filter[key]));
                    }).join('&');
                } else {
                    queryString = '';
                }
                path = _.replace(path, '/sites/' + dxContext.siteKey, '');
                history.push( match.url + path + queryString);
            }
        }
    };

    render() {
        const { match, location, history, render } = this.props;
        return <DxContext.Consumer>{dxContext => render({...this.mapUrlToQuery(match, location, dxContext), ...this.mapQueryToUrl(match, history, location, dxContext)})}</DxContext.Consumer>
    }
};

export default withRouter(CmRouter);