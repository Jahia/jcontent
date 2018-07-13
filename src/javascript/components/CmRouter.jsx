import React from "react";
import * as _ from "lodash";
import { withRouter } from "react-router";
import { DxContext } from "./DxContext";

const PARAMS_KEY = "?params=";

class CmRouter extends React.Component {

    mapUrlToQuery = (match, location, dxContext) => {
        return {
            path: '/sites/' + dxContext.siteKey + _.replace(location.pathname, match.path, ''),
            params: this.deserializeQueryString(location)
        }
    };

    deserializeQueryString = location => {
        const search = location.search;
        return search && JSON.parse(decodeURIComponent(_.replace(search, PARAMS_KEY, '')));
    };

    // This method push to the browser url the provided location
    mapQueryToUrl = (match, history, location, dxContext) => {
        return {
            goto: ( path, params) => {
                let queryString = params ? PARAMS_KEY + encodeURIComponent(JSON.stringify(params)) : '';
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