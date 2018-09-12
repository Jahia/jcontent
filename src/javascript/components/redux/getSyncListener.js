import {setLanguage, setSite} from "./actions";

let currentValue;

let select = (state) => {
    let {router:{location:{pathname, search}}, site, language} = state;
    return  {
        pathname,
        search,
        site,
        language
    }
};

let buildUrl = (site, language, extractedParams) => {
    return "/" + [currentValue.site,language, extractedParams.mode, ... extractedParams.pathElements].join("/") + extractedParams.search;
};

let extractParamsFromUrl= (pathname, search) => {
    let [ , site, language, mode, ...pathElements ] = pathname.split('/');

    return {site, language, mode, pathElements, search}
};

let getSyncListener = (store, history) => () => {
    let previousValue = currentValue;
    currentValue = select(store.getState());
    if (previousValue) {
        let extractedParams = extractParamsFromUrl(currentValue.pathname, currentValue.search);

        if (previousValue.pathname !== currentValue.pathname) {
            console.log("Path changed");
            if (extractedParams.site !== previousValue.site) {
                store.dispatch(setSite(extractedParams.site))
            }
            if (extractedParams.language !== previousValue.language) {
                store.dispatch(setLanguage(extractedParams.language))
            }
        } else {
            if ((previousValue.site !== currentValue.site && extractedParams.site !== currentValue.site) ||
                (previousValue.language !== currentValue.language && extractedParams.language !== currentValue.language)){
                console.log("Param changed");
                history.push(buildUrl(currentValue.site, currentValue.language, extractedParams));
            }
        }
    }
};

export default getSyncListener;