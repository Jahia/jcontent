import * as _ from 'lodash';
import {buildUrl, extractPaths} from '../JContent.utils';
import {createActions, handleActions} from 'redux-actions';
import {registry} from '@jahia/ui-extender';
import rison from 'rison';
import queryString from 'query-string';
import {push} from 'connected-react-router';
import {combineReducers} from 'redux';
import JContentConstants from '~/JContent/JContent.constants';

export const CM_DRAWER_STATES = {HIDE: 0, TEMP: 1, SHOW: 2, FULL_SCREEN: 3};
export const CM_PREVIEW_MODES = {EDIT: 'edit', LIVE: 'live'};

const ROUTER_REDUX_ACTION = '@@router/LOCATION_CHANGE';

const extractParamsFromUrl = (pathname, search) => {
    const defaultState = {site: '', language: '', mode: '', path: '', params: {}, catManMode: '', catManPath: '', catManParams: {}};

    if (pathname.startsWith('/jcontent')) {
        const [, , site, language, mode, ...pathElements] = pathname.split('/');
        const registryItem = registry.get('accordionItem', mode);
        const path = decodeURIComponent((registryItem && registryItem.getPath && registryItem.getPath(site, pathElements)) || ('/' + pathElements.join('/')));
        const params = deserializeQueryString(search);
        return {...defaultState, site, language, mode, path, params};
    }

    if (pathname.startsWith('/catMan')) {
        const [, , language, catManMode, ...pathElements] = pathname.split('/');
        const registryItem = registry.get('accordionItem', 'category');
        pathElements.splice(0, 0, 'categories');
        const catManPath = decodeURIComponent(((registryItem && registryItem.getPath && registryItem.getPath('systemsite', pathElements)) || ('/' + pathElements.join('/'))));
        const catManParams = deserializeQueryString(search);
        return {...defaultState, language, catManMode, catManPath, catManParams};
    }

    return defaultState;
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
        const registryItem = registry.get('accordionItem', 'category');
        let path = data.path || catManPath;
        const lang = data.language || language;
        if (registryItem && registryItem.getUrlPathPart) {
            path = registryItem.getUrlPathPart('systemsite', path, registryItem);
        }

        const dataMode = data.mode === JContentConstants.mode.SEARCH ? 'search' : 'category';
        // Special chars in folder naming
        path = path.replace(/[^/]/g, encodeURIComponent);
        const paramsData = data.params || params;
        const queryString = _.isEmpty(paramsData) ? '' : '?params=' + rison.encode_uri(paramsData);
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
        [ROUTER_REDUX_ACTION]: (state, action) => action.payload.location.pathname.startsWith('/jcontent/') ? extractParamsFromUrl(action.payload.location.pathname, action.payload.location.search).params : state
    }, currentValueFromUrl.params);
    const siteReducer = handleActions({
        [ROUTER_REDUX_ACTION]: (state, action) => action.payload.location.pathname.startsWith('/jcontent/') ? extractParamsFromUrl(action.payload.location.pathname, action.payload.location.search).site : state
    }, '');
    const catManPathReducer = handleActions({
        [ROUTER_REDUX_ACTION]: (state, action) => action.payload.location.pathname.startsWith('/catMan/') ? extractParamsFromUrl(action.payload.location.pathname, action.payload.location.search).catManPath : state
    }, currentValueFromUrl.catManPath);
    const catManModeReducer = handleActions({
        [ROUTER_REDUX_ACTION]: (state, action) => action.payload.location.pathname.startsWith('/catMan/') ? extractParamsFromUrl(action.payload.location.pathname, action.payload.location.search).catManMode : state
    }, currentValueFromUrl.catManMode);
    const catManParamsReducer = handleActions({
        [ROUTER_REDUX_ACTION]: (state, action) => action.payload.location.pathname.startsWith('/catMan/') ? extractParamsFromUrl(action.payload.location.pathname, action.payload.location.search).catManParams : state
    }, currentValueFromUrl.catManParams);
    const languageReducer = handleActions({
        [ROUTER_REDUX_ACTION]: (state, action) => action.payload.location.pathname.startsWith('/jcontent/') || action.payload.location.pathname.startsWith('/catMan/') ? extractParamsFromUrl(action.payload.location.pathname, action.payload.location.search).language : state
    }, '');

    const openPathsReducer = handleActions({
        [cmOpenPaths]: (state, action) => _.union(state, action.payload),
        [cmReplaceOpenedPaths]: (state, action) => action.payload,
        [cmClosePaths]: (state, action) => _.difference(state, action.payload)
    }, [
        ...extractPaths(currentValueFromUrl.site, currentValueFromUrl.path, currentValueFromUrl.mode).slice(0, -1),
        ...extractPaths('systemsite', currentValueFromUrl.catManPath, currentValueFromUrl.catManMode).slice(0, -1)
    ]);

    const tableOpenPathsReducer = handleActions({
        [cmOpenTablePaths]: (state, action) => _.union(state, action.payload),
        [cmCloseTablePaths]: (state, action) => _.difference(state, action.payload)
    }, []);

    registry.add('redux-reducer', 'mode', {targets: ['jcontent'], reducer: modeReducer});
    registry.add('redux-reducer', 'preSearchModeMemo', {targets: ['jcontent'], reducer: preSearchModeMemoReducer});
    registry.add('redux-reducer', 'path', {targets: ['jcontent'], reducer: pathReducer});
    registry.add('redux-reducer', 'params', {targets: ['jcontent'], reducer: paramsReducer});
    registry.add('redux-reducer', 'catManPath', {targets: ['jcontent'], reducer: catManPathReducer});
    registry.add('redux-reducer', 'catManMode', {targets: ['jcontent'], reducer: catManModeReducer});
    registry.add('redux-reducer', 'catManParams', {targets: ['jcontent'], reducer: catManParamsReducer});
    registry.add('redux-reducer', 'openPaths', {targets: ['jcontent'], reducer: openPathsReducer});
    registry.add('redux-reducer', 'tableOpenPaths', {targets: ['jcontent'], reducer: tableOpenPathsReducer});
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
        extractParamsFromUrl,
        buildUrl
    });
};
