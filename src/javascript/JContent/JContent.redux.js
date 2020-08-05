import * as _ from 'lodash';
import {extractPaths} from './JContent.utils';
import {createActions, handleActions} from 'redux-actions';
import {registry} from '@jahia/ui-extender';
import rison from 'rison';
import queryString from 'query-string';
import {push} from 'connected-react-router';
import {combineReducers} from 'redux';

export const CM_DRAWER_STATES = {HIDE: 0, TEMP: 1, SHOW: 2, FULL_SCREEN: 3};
export const CM_PREVIEW_MODES = {EDIT: 'edit', LIVE: 'live'};

const PARAMS_KEY = '?params=';
const ROUTER_REDUX_ACTION = '@@router/LOCATION_CHANGE';

const extractParamsFromUrl = (pathname, search) => {
    if (pathname.startsWith('/jcontent')) {
        let [, , site, language, mode, ...pathElements] = pathname.split('/');
        let registryItem = registry.get('accordionItem', mode);

        let path = (registryItem && registryItem.getPath && registryItem.getPath(site, pathElements, registryItem)) || ('/' + pathElements.join('/'));

        path = decodeURIComponent(path);
        let params = deserializeQueryString(search);
        return {site, language, mode, path, params};
    }

    return {site: '', language: '', mode: '', path: '', params: {}};
};

const deserializeQueryString = search => {
    if (search) {
        let params = queryString.parse(search).params;
        if (params) {
            try {
                return rison.decode(params);
                // eslint-disable-next-line no-unused-vars
            } catch (e) {
                return {};
            }
        }
    }

    return {};
};

export const buildUrl = (site, language, mode, path, params) => {
    let registryItem = registry.get('accordionItem', mode);
    if (registryItem && registryItem.getUrlPathPart) {
        path = registryItem.getUrlPathPart(site, path, registryItem);
    }

    // Special chars in folder naming
    path = path.replace(/[^/]/g, encodeURIComponent);

    let queryString = _.isEmpty(params) ? '' : PARAMS_KEY + rison.encode_uri(params);
    return '/jcontent/' + [site, language, mode].join('/') + path + queryString;
};

export const {cmOpenPaths, cmClosePaths, cmPreSearchModeMemo, cmReplaceOpenedPaths} =
    createActions('CM_OPEN_PATHS', 'CM_CLOSE_PATHS', 'CM_PRE_SEARCH_MODE_MEMO', 'CM_REPLACE_OPENED_PATHS');

export const cmGoto = data => (
    (dispatch, getStore) => {
        const {site, language, jcontent: {mode, path, params}} = getStore();

        dispatch(push(buildUrl(data.site || site,
            data.language || language,
            data.mode || mode,
            data.path || path,
            data.params || params)));
    }
);

export const replaceOpenedPath = data => (
    dispatch => {
        dispatch(cmReplaceOpenedPaths(data));
    }
);

export const jContentRedux = registry => {
    const jahiaCtx = window.contextJsParameters;
    const pathName = window.location.pathname.substring((jahiaCtx.contextPath + jahiaCtx.urlbase).length);
    const currentValueFromUrl = extractParamsFromUrl(pathName, window.location.search);

    const preSearchModeMemoReducer = handleActions({
        [cmPreSearchModeMemo]: (state, action) => action.payload
    }, '');
    const modeReducer = handleActions({
        [ROUTER_REDUX_ACTION]: (state, action) => action.payload.location.pathname.startsWith('/jcontent/') ? extractParamsFromUrl(action.payload.location.pathname, action.payload.location.search).mode : state
    }, currentValueFromUrl.mode);
    const pathReducer = handleActions({
        [ROUTER_REDUX_ACTION]: (state, action) => action.payload.location.pathname.startsWith('/jcontent/') ? extractParamsFromUrl(action.payload.location.pathname, action.payload.location.search).path : state
    }, currentValueFromUrl.path);
    const paramsReducer = handleActions({
        [ROUTER_REDUX_ACTION]: (state, action) => action.payload.location.pathname.startsWith('/jcontent/') ? extractParamsFromUrl(action.payload.location.pathname, action.payload.location.search).params : state
    }, currentValueFromUrl.params);
    let siteReducer = handleActions({
        [ROUTER_REDUX_ACTION]: (state, action) => action.payload.location.pathname.startsWith('/jcontent/') ? extractParamsFromUrl(action.payload.location.pathname, action.payload.location.search).site : state
    }, '');
    let languageReducer = handleActions({
        [ROUTER_REDUX_ACTION]: (state, action) => action.payload.location.pathname.startsWith('/jcontent/') ? extractParamsFromUrl(action.payload.location.pathname, action.payload.location.search).language : state
    }, '');

    const openPathsReducer = handleActions({
        [cmOpenPaths]: (state, action) => _.union(state, action.payload),
        [cmReplaceOpenedPaths]: (state, action) => action.payload,
        [cmClosePaths]: (state, action) => _.difference(state, action.payload)
    }, _.dropRight(extractPaths(currentValueFromUrl.site, currentValueFromUrl.path, currentValueFromUrl.mode), 1));

    registry.add('redux-reducer', 'mode', {targets: ['jcontent'], reducer: modeReducer});
    registry.add('redux-reducer', 'preSearchModeMemo', {targets: ['jcontent'], reducer: preSearchModeMemoReducer});
    registry.add('redux-reducer', 'path', {targets: ['jcontent'], reducer: pathReducer});
    registry.add('redux-reducer', 'params', {targets: ['jcontent'], reducer: paramsReducer});
    registry.add('redux-reducer', 'openPaths', {targets: ['jcontent'], reducer: openPathsReducer});
    registry.add('redux-reducer', 'jContentSite', {targets: ['site:2'], reducer: siteReducer});
    registry.add('redux-reducer', 'jContentLanguage', {targets: ['language:2'], reducer: languageReducer});

    const reducersArray = registry.find({type: 'redux-reducer', target: 'jcontent'});
    const reducerObj = {};
    reducersArray.forEach(r => {
        reducerObj[r.key] = r.reducer;
    });

    const jcontentReducer = combineReducers(reducerObj);

    registry.add('redux-reducer', 'jcontent', {targets: ['root'], reducer: jcontentReducer});
    registry.add('redux-action', 'jcontentGoto', {action: cmGoto});
    registry.add('redux-action', 'jcontentReplaceOpenedPath', {action: replaceOpenedPath});
    registry.add('jcontent', 'utils', {
        extractParamsFromUrl: extractParamsFromUrl,
        buildUrl: buildUrl
    });
};
