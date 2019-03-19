import {cmGoto} from './ContentManager.redux-actions';
import _ from 'lodash';

const PARAMS_KEY = '?params=';
const DEFAULT_MODE_PATHS = {browse: '/contents', 'browse-files': '/files'};
let currentValue;

let select = state => {
    let {router: {location: {pathname, search}}, site, language, mode, path, params} = state;
    return {
        pathname,
        search,
        site,
        language,
        mode,
        path,
        params
    };
};

let buildUrl = (site, language, mode, path, params) => {
    let sitePath = '/sites/' + site;
    if (path.startsWith(sitePath + '/')) {
        path = path.substring(('/sites/' + site).length);
    } else if (mode === 'apps') {
        // Path is an action key
        path = path.startsWith('/') ? path : '/' + path;
    } else {
        path = '';
    }
    let queryString = _.isEmpty(params) ? '' : PARAMS_KEY + encodeURIComponent(encodeURIComponent(JSON.stringify(params)));
    return '/' + [site, language, mode].join('/') + path + queryString;
};

let extractParamsFromUrl = (pathname, search) => {
    let [, site, language, mode, ...pathElements] = pathname.split('/');

    let path;
    if (mode === 'apps') {
        path = pathElements.join('/');
    } else {
        path = '/sites/' + site;
        if (_.isEmpty(pathElements)) {
            if (mode === 'browse-files') {
                path += '/files';
            }
        } else {
            path += ('/' + pathElements.join('/'));
        }
    }

    let params = deserializeQueryString(search);
    return {site, language, mode, path, params};
};

let deserializeQueryString = search => {
    if (search) {
        return JSON.parse(decodeURIComponent(decodeURIComponent(search.substring(PARAMS_KEY.length).replace(/\+/g, '%20'))));
    }
    return {};
};

let pathResolver = (currentValue, currentValueFromUrl) => {
    if (currentValue.site !== currentValueFromUrl.site && currentValue.mode !== 'apps') {
        // Switched sites, we have to set default path based on mode: browse -> /contents | browse-files -> /files
        return currentValueFromUrl.path.substr(0, currentValueFromUrl.path.indexOf(currentValueFromUrl.site)) + currentValue.site + DEFAULT_MODE_PATHS[currentValue.mode];
    }
    return currentValue.path;
};

let getSyncListener = (store, history) => () => {
    let previousValue = currentValue;
    currentValue = select(store.getState());
    if (previousValue) {
        let currentValueFromUrl = extractParamsFromUrl(currentValue.pathname, currentValue.search);
        if (previousValue.pathname !== currentValue.pathname || previousValue.search !== currentValue.search) {
            if (currentValueFromUrl.site !== previousValue.site ||
                currentValueFromUrl.language !== previousValue.language ||
                currentValueFromUrl.mode !== previousValue.mode ||
                currentValueFromUrl.path !== previousValue.path ||
                !_.isEqual(currentValueFromUrl.params, previousValue.params)
            ) {
                let data = {};
                Object.assign(data,
                    currentValueFromUrl.site === previousValue.site ? {} : {site: currentValueFromUrl.site},
                    currentValueFromUrl.language === previousValue.language ? {} : {language: currentValueFromUrl.language},
                    currentValueFromUrl.mode === previousValue.mode ? {} : {mode: currentValueFromUrl.mode},
                    currentValueFromUrl.path === previousValue.path ? {} : {path: currentValueFromUrl.path},
                    _.isEqual(currentValueFromUrl.params, previousValue.params) ? {} : {params: currentValueFromUrl.params}
                );
                store.dispatch(cmGoto(data));
            }
        } else if ((previousValue.site !== currentValue.site && currentValueFromUrl.site !== currentValue.site) ||
                (previousValue.language !== currentValue.language && currentValueFromUrl.language !== currentValue.language) ||
                (previousValue.mode !== currentValue.mode && currentValueFromUrl.mode !== currentValue.mode) ||
                (previousValue.path !== currentValue.path && currentValueFromUrl.path !== currentValue.path) ||
                (!_.isEqual(currentValueFromUrl.params, currentValue.params))
        ) {
            history.push(buildUrl(currentValue.site, currentValue.language, currentValue.mode, encodeURI(pathResolver(currentValue, currentValueFromUrl)), currentValue.params));
        }
    }
};

export {getSyncListener, extractParamsFromUrl};
