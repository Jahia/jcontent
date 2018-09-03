import React from "react";
import * as _ from "lodash";
import { withRouter } from "react-router";
import { DxContext } from "./DxContext";

const SITE_ROOT = ":siteRoot";
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
        if (!search || search == '') {
            return {};
        }
        return JSON.parse(decodeURIComponent(search.substring(PARAMS_KEY.length).replace(/\+/g, '%20')));
    };

    // This method push to the browser url the provided location
    mapQueryToUrl = (match, history, location, dxContext) => {
        return {
            goto: (path, params) => {
                let queryString = params ? PARAMS_KEY + encodeURIComponent(JSON.stringify(params)) : '';
                path = _.replace(path, `/sites/${dxContext.siteKey}`, '');
                if (path.startsWith(SITE_ROOT)) {
                    path = `/${dxContext.siteKey}${path.substring(SITE_ROOT.length)}`;
                } else {
                    path = match.url + path;
                }
                history.push(path + queryString);
            },
            switchto: (url, params) => {
                //Update history with provided path (This is primarily used for changing the current selected site)
                let queryString = params ? PARAMS_KEY + encodeURIComponent(JSON.stringify(params)) : '';
                history.push(url + queryString);
            },
            switchToMode : (mode, pathParams, params) => {
                const url = "/" + dxContext.siteKey + "/" + dxContext.lang + "/" + mode + pathParams;
                let queryString = params ? PARAMS_KEY + encodeURIComponent(JSON.stringify(params)) : '';
                history.push(url + queryString);
            }
        }
    };

    render() {
        const { match, location, history, render } = this.props;
        return <DxContext.Consumer>{dxContext => render({...this.mapUrlToQuery(match, location, dxContext), ...this.mapQueryToUrl(match, history, location, dxContext)})}</DxContext.Consumer>
    }
};

export default withRouter(CmRouter);
export {SITE_ROOT};