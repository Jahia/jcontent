import {setLanguage, setMode, setParams, setPath, setSite, setUrl} from "./actions";

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
    } else {
        path = "";
    }
    let queryString = _.isEmpty(params) ? "" : PARAMS_KEY + encodeURIComponent(encodeURIComponent(JSON.stringify(params)));
    return "/" + [site, language, mode].join("/") + path + queryString;
};

let extractParamsFromUrl = (pathname, search) => {
    let [, site, language, mode, ...pathElements] = pathname.split('/');
    const path = "/sites/" + site + (_.isEmpty(pathElements) ? "" : ("/" + pathElements.join("/")));
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
                    store.dispatch(setUrl(currentValueFromUrl.site !== previousValue.site ? currentValueFromUrl.site : null,
                        currentValueFromUrl.language !== previousValue.language ? currentValueFromUrl.language : null,
                        currentValueFromUrl.mode !== previousValue.mode ? currentValueFromUrl.mode : null,
                        currentValueFromUrl.path !== previousValue.path ? currentValueFromUrl.path : null,
                        !_.isEqual(currentValueFromUrl.params, previousValue.params) ? currentValueFromUrl.params : null));
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