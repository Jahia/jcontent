import * as _ from 'lodash';
import {extractPaths} from '../JContent.utils';
import {createActions, handleActions} from 'redux-actions';
import {registry} from '@jahia/ui-extender';
import rison from 'rison';
import queryString from 'query-string';
import {push} from 'connected-react-router';
import {combineReducers} from 'redux';
import JContentConstants from "~/JContent/JContent.constants";

export const CM_DRAWER_STATES = {HIDE: 0, TEMP: 1, SHOW: 2, FULL_SCREEN: 3};
export const CM_PREVIEW_MODES = {EDIT: 'edit', LIVE: 'live'};

const PARAMS_KEY = '?params=';
const ROUTER_REDUX_ACTION = '@@router/LOCATION_CHANGE';

const extractParamsFromUrl = (pathname, search) => {
    if (pathname.startsWith('/jcontent')) {
        let [, , site, language, mode, ...pathElements] = pathname.split('/');
        let registryItem = registry.get('accordionItem', mode);

        let path = (registryItem && registryItem.getPath && registryItem.getPath(site, pathElements)) || ('/' + pathElements.join('/'));

        path = decodeURIComponent(path);
        let params = deserializeQueryString(search);
        return {site, language, mode, path, params};
    }

    if (pathname.startsWith('/catMan')) {
        let [, , language, mode, ...pathElements] = pathname.split('/');
        let registryItem = registry.get('accordionItem', 'category');
        pathElements.splice(0, 0, 'categories');
        let path = ((registryItem && registryItem.getPath && registryItem.getPath('systemsite', pathElements)) || ('/' + pathElements.join('/')));

        path = decodeURIComponent(path);
        let params = deserializeQueryString(search);
        return {site: 'systemsite', language, mode: mode, path, params};
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

export const buildUrl = ({site, language, mode, path, params}) => {
    let registryItem = registry.get('accordionItem', mode);
    if (registryItem && registryItem.getUrlPathPart) {
        path = registryItem.getUrlPathPart(site, path, registryItem);
    }

    // Special chars in folder naming
    path = path.replace(/[^/]/g, encodeURIComponent);

    let queryString = _.isEmpty(params) ? '' : PARAMS_KEY + rison.encode_uri(params);
    return '/jcontent/' + [site, language, mode].join('/') + path + queryString;
};

export const {cmOpenPaths, cmClosePaths, cmPreSearchModeMemo, cmReplaceOpenedPaths, cmOpenTablePaths, cmCloseTablePaths} =
    createActions('CM_OPEN_PATHS', 'CM_CLOSE_PATHS', 'CM_PRE_SEARCH_MODE_MEMO', 'CM_REPLACE_OPENED_PATHS', 'CM_OPEN_TABLE_PATHS', 'CM_CLOSE_TABLE_PATHS');

export const cmGoto = data => (
    (dispatch, getStore) => {
        const {site, language, jcontent: {mode, path, params}} = getStore();

        dispatch(push(buildUrl({
            site: data.site || site,
            language: data.language || language,
            mode: data.mode || mode,
            path: data.path || path,
            params: data.params || params
        })));
    }
);

export const cmGotoCatMan = data => (
    (dispatch, getStore) => {
        const {language, jcontent: {catManPath, params}} = getStore();
        let registryItem = registry.get('accordionItem', 'category');
        let path = data.path || catManPath;
        let lang = data.language || language;
        if (registryItem && registryItem.getUrlPathPart) {
            path = registryItem.getUrlPathPart('systemsite', path, registryItem);
        }
        let dataMode = data.mode === JContentConstants.mode.SEARCH ? 'search':'category'
        // Special chars in folder naming
        path = path.replace(/[^/]/g, encodeURIComponent);
        let paramsData = data.params || params
        let queryString = _.isEmpty(paramsData) ? '' : PARAMS_KEY + rison.encode_uri(paramsData);
        dispatch(push(`/catMan/${lang}/${dataMode}${path}${queryString}`));
    }
);

export const replaceOpenedPath = data => (
    dispatch => {
        dispatch(cmReplaceOpenedPaths(data));
    }
);

export const jContentRedux = registry => {
    const jahiaCtx = window.contextJsParameters;
    const pathName = window.location.pathname.substring(jahiaCtx.urlbase.length);
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
        [ROUTER_REDUX_ACTION]: (state, action) => action.payload.location.pathname.startsWith('/jcontent/') || action.payload.location.pathname.startsWith('/catMan/') ? extractParamsFromUrl(action.payload.location.pathname, action.payload.location.search).params : state
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

    const tableOpenPathsReducer = handleActions({
        [cmOpenTablePaths]: (state, action) => _.union(state, action.payload),
        [cmCloseTablePaths]: (state, action) => _.difference(state, action.payload)
    }, []);

    const catManPathReducer = handleActions({
        [ROUTER_REDUX_ACTION]: (state, action) => action.payload.location.pathname.startsWith('/catMan/') ? extractParamsFromUrl(action.payload.location.pathname, action.payload.location.search).path : state
    }, '/');
    const catManModeReducer = handleActions({
        [ROUTER_REDUX_ACTION]: (state, action) => action.payload.location.pathname.startsWith('/catMan/') ? extractParamsFromUrl(action.payload.location.pathname, action.payload.location.search).mode : state
    }, currentValueFromUrl.mode);
    let siteReducerCatMan = handleActions({
        [ROUTER_REDUX_ACTION]: (state, action) => action.payload.location.pathname.startsWith('/catMan/') ? extractParamsFromUrl(action.payload.location.pathname, action.payload.location.search).site : state
    }, '');
    let languageReducerCatMan = handleActions({
        [ROUTER_REDUX_ACTION]: (state, action) => action.payload.location.pathname.startsWith('/catMan/') ? extractParamsFromUrl(action.payload.location.pathname, action.payload.location.search).language : state
    }, '');

    registry.add('redux-reducer', 'mode', {targets: ['jcontent'], reducer: modeReducer});
    registry.add('redux-reducer', 'preSearchModeMemo', {targets: ['jcontent'], reducer: preSearchModeMemoReducer});
    registry.add('redux-reducer', 'path', {targets: ['jcontent'], reducer: pathReducer});
    registry.add('redux-reducer', 'params', {targets: ['jcontent'], reducer: paramsReducer});
    registry.add('redux-reducer', 'openPaths', {targets: ['jcontent'], reducer: openPathsReducer});
    registry.add('redux-reducer', 'tableOpenPaths', {targets: ['jcontent'], reducer: tableOpenPathsReducer});
    registry.add('redux-reducer', 'jContentSite', {targets: ['site:2'], reducer: siteReducer});
    registry.add('redux-reducer', 'jContentLanguage', {targets: ['language:2'], reducer: languageReducer});

    registry.add('redux-reducer', 'catManPath', {targets: ['jcontent'], reducer: catManPathReducer});
    registry.add('redux-reducer', 'catManMode', {targets: ['jcontent'], reducer: catManModeReducer});
    registry.add('redux-reducer', 'catManSite', {targets: ['site:2'], reducer: siteReducerCatMan});
    registry.add('redux-reducer', 'catManLanguage', {targets: ['language:2'], reducer: languageReducerCatMan});

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
        extractParamsFromUrl,
        buildUrl
    });
};
