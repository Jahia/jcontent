import {cmGoto} from "./actions";

const PARAMS_KEY = "?params=";
let currentValue;

let select = (state) => {
    let {router: {location: {pathname, search}}, site, language, mode, path, params} = state;
    return {
        pathname,
        search,
        site,
        language,
        mode,
        path,
        params
    }
};

let buildUrl = (site, language, mode, path, params) => {
    let sitePath = "/sites/" + site;
    if (path.startsWith(sitePath + "/")) {
        path = path.substring(("/sites/" + site).length);
    } else if (mode === "apps") {
        // path is an action Key
        path = path.startsWith("/") ? path : "/" + path;
    } else {
        path = "";
    }
    let queryString = _.isEmpty(params) ? "" : PARAMS_KEY + encodeURIComponent(encodeURIComponent(JSON.stringify(params)));
    return "/" + [site, language, mode].join("/") + path + queryString;
};

let extractParamsFromUrl = (pathname, search) => {
    let [, site, language, mode, ...pathElements] = pathname.split('/');
    // if mode is apps, get action key value from pathElements
    const path = mode === "apps" ? (pathElements.join("/")) : "/sites/" + site + (_.isEmpty(pathElements) ? "" : ("/" + pathElements.join("/")));
    let params = deserializeQueryString(search);
    return {site, language, mode, path, params}
};

let deserializeQueryString = search => {
    if (!!search) {
        return JSON.parse(decodeURIComponent(decodeURIComponent(search.substring(PARAMS_KEY.length).replace(/\+/g, '%20'))));
    } else {
        return {};
    }
};

let getSyncListener = (store, history) => () => {
        let previousValue = currentValue;
        currentValue = select(store.getState());
        if (previousValue) {
            let currentValueFromUrl = extractParamsFromUrl(currentValue.pathname, currentValue.search)
            if (previousValue.pathname !== currentValue.pathname || previousValue.search !== currentValue.search) {
                console.log("Path or query string changed");
                if (currentValueFromUrl.site !== previousValue.site ||
                    currentValueFromUrl.language !== previousValue.language ||
                    currentValueFromUrl.mode !== previousValue.mode ||
                    currentValueFromUrl.path !== previousValue.path ||
                    !_.isEqual(currentValueFromUrl.params, previousValue.params)
                ) {
                    let data = {};
                    Object.assign(data, 
                            currentValueFromUrl.site !== previousValue.site ? {'site': currentValueFromUrl.site} : {},
                            currentValueFromUrl.language !== previousValue.language ? {'language': currentValueFromUrl.language} : {},
                            currentValueFromUrl.mode !== previousValue.mode ? {'mode': currentValueFromUrl.mode} : {},
                            currentValueFromUrl.path !== previousValue.path ? {'path': currentValueFromUrl.path} : {},
                            !_.isEqual(currentValueFromUrl.params, previousValue.params) ? {'params': currentValueFromUrl.params} : {});
                    store.dispatch(cmGoto(data));
                }
            } else {
                if ((previousValue.site !== currentValue.site && currentValueFromUrl.site !== currentValue.site) ||
                    (previousValue.language !== currentValue.language && currentValueFromUrl.language !== currentValue.language) ||
                    (previousValue.mode !== currentValue.mode && currentValueFromUrl.mode !== currentValue.mode) ||
                    (previousValue.path !== currentValue.path && currentValueFromUrl.path !== currentValue.path) ||
                    (!_.isEqual(currentValueFromUrl.params, currentValue.params))
                ) {
                    console.log("Application Params changed");
                    history.push(buildUrl(currentValue.site, currentValue.language, currentValue.mode, currentValue.path, currentValue.params));
                }
            }
        }
    }
;
export {extractParamsFromUrl}
export default getSyncListener;