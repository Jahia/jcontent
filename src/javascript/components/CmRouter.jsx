import React from "react";
import * as _ from "lodash";
import { withRouter } from "react-router";
import { DxContextConsumer } from "./DxContext";

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
            goto: ( path, params, transformation) => {
                let queryString = params ? PARAMS_KEY + encodeURIComponent(JSON.stringify(params)) : '';
                path = _.replace(path, '/sites/' + dxContext.siteKey, '');

                //Since we can be in a situation when we have n number of trees with n number of possible urls
                //match.url will need to be adapted.
                //Transform url as needed if transformation function is defined
                if (transformation) {
                    history.push(transformation(match.url + path + queryString));
                } else {
                    history.push(match.url + path + queryString);
                }
            },
            switchto: (url, params) => {
                //Update history with provided path (This is primarily used for changing the current selected site)
                let queryString = params ? PARAMS_KEY + encodeURIComponent(JSON.stringify(params)) : '';
                history.push(url + queryString);
            }
        }
    };

    render() {
        const { match, location, history, render } = this.props;
        return <DxContextConsumer>{dxContext => render({...this.mapUrlToQuery(match, location, dxContext), ...this.mapQueryToUrl(match, history, location, dxContext)})}</DxContextConsumer>
    }
};

export default withRouter(CmRouter);