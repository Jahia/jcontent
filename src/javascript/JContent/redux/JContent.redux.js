import * as _ from 'lodash';
import {extractPaths} from '../JContent.utils';
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

const defaultState = {app: 'jcontent', site: '', language: '', mode: '', path: '', params: {}};

const apps = {
    jcontent: {
        extractParamsFromUrl: (pathname, search) => {
            const [, , site, language, mode, ...pathElements] = pathname.split('/');
            const registryItem = registry.get('accordionItem', mode);
            const path = decodeURIComponent((registryItem && registryItem.getPath && registryItem.getPath(site, pathElements)) || ('/' + pathElements.join('/')));
            const params = deserializeQueryString(search);

            const accordion = registry.get('accordionItem', mode);
            const viewMode = localStorage.getItem('jcontent-previous-tableView-viewMode-' + site + '-' + mode) || accordion?.tableConfig?.defaultViewMode || 'flatList';
            return {...defaultState, site, language, mode, path, viewMode, params};
        },
        buildUrl: ({site, language, mode, path, params}) => {
            let registryItem = registry.get('accordionItem', mode);
            if (registryItem && registryItem.getUrlPathPart) {
                path = registryItem.getUrlPathPart(site, path, registryItem);
            }

            // Special chars in folder naming
            path = path.replace(/[^/]/g, encodeURIComponent);

            let queryString = _.isEmpty(params) ? '' : '?params=' + rison.encode_uri(params);
            return `/jcontent/${site}/${language}/${mode}${path}${queryString}`;
        }
    },
    'category-manager': {
        extractParamsFromUrl: (pathname, search) => {
            const [, , language, mode, ...pathElements] = pathname.split('/');
            const registryItem = registry.get('accordionItem', mode);
            pathElements.splice(0, 0, 'categories');
            const path = decodeURIComponent(((registryItem && registryItem.getPath && registryItem.getPath('systemsite', pathElements)) || ('/' + pathElements.join('/'))));
            const params = deserializeQueryString(search);
            return {...defaultState, app: 'category-manager', language, mode, path, viewMode: 'flatList', params};
        },
        buildUrl: ({language, mode, path, params}) => {
            const queryString = _.isEmpty(params) ? '' : '?params=' + rison.encode_uri(params);
            path = path.startsWith('/sites/systemsite/categories') ? path.substring('/sites/systemsite/categories'.length) : '';
            return `/category-manager/${language}/${mode}${path}${queryString}`;
        }
    }
};

const buildUrl = ({app, site, language, mode, path, params}) => {
    const newApp = app || 'jcontent';
    if (apps[newApp]) {
        return apps[newApp].buildUrl({app: newApp, site, language, mode, path, params});
    }
};

export const extractParamsFromUrl = (pathname, search) => {
    const app = pathname.split('/')[1];
    if (apps[app]) {
        return apps[app].extractParamsFromUrl(pathname, search);
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

export const {cmOpenPaths, cmClosePaths, cmPreSearchModeMemo, cmReplaceOpenedPaths, cmOpenTablePaths, cmCloseTablePaths, setTableViewMode, setTableViewType} =
    createActions('CM_OPEN_PATHS', 'CM_CLOSE_PATHS', 'CM_PRE_SEARCH_MODE_MEMO', 'CM_REPLACE_OPENED_PATHS', 'CM_OPEN_TABLE_PATHS', 'CM_CLOSE_TABLE_PATHS', 'SET_TABLE_VIEW_MODE', 'SET_TABLE_VIEW_TYPE');

export const cmGoto = data => (
    (dispatch, getStore) => {
        const {site, language, jcontent: {app, mode, path, params}} = getStore();

        dispatch(push(buildUrl({
            app: data.app || app || 'jcontent',
            site: data.site || site,
            language: data.language || language,
            mode: data.mode || mode,
            path: data.path || path,
            params: data.params || params
        })));
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
    const appReducer = handleActions({
        [ROUTER_REDUX_ACTION]: (state, action) => apps[action.payload.location.pathname.split('/')[1]] ? action.payload.location.pathname.split('/')[1] : state
    }, currentValueFromUrl.app);
    const modeReducer = handleActions({
        [ROUTER_REDUX_ACTION]: (state, action) => apps[action.payload.location.pathname.split('/')[1]]?.extractParamsFromUrl(action.payload.location.pathname, action.payload.location.search).mode || state
    }, currentValueFromUrl.mode);
    const pathReducer = handleActions({
        [ROUTER_REDUX_ACTION]: (state, action) => apps[action.payload.location.pathname.split('/')[1]]?.extractParamsFromUrl(action.payload.location.pathname, action.payload.location.search).path || state
    }, currentValueFromUrl.path);
    const paramsReducer = handleActions({
        [ROUTER_REDUX_ACTION]: (state, action) => apps[action.payload.location.pathname.split('/')[1]]?.extractParamsFromUrl(action.payload.location.pathname, action.payload.location.search).params || state
    }, currentValueFromUrl.params);
    const siteReducer = handleActions({
        [ROUTER_REDUX_ACTION]: (state, action) => apps[action.payload.location.pathname.split('/')[1]]?.extractParamsFromUrl(action.payload.location.pathname, action.payload.location.search).site || state
    }, '');
    const languageReducer = handleActions({
        [ROUTER_REDUX_ACTION]: (state, action) => apps[action.payload.location.pathname.split('/')[1]]?.extractParamsFromUrl(action.payload.location.pathname, action.payload.location.search).language || state
    }, '');
    const tableViewModeReducer = handleActions({
        [setTableViewMode]: (state, action) => ({...state, viewMode: action.payload}),
        [setTableViewType]: (state, action) => ({...state, viewType: action.payload})
    }, {
        viewMode: currentValueFromUrl.viewMode,
        viewType: localStorage.getItem(JContentConstants.localStorageKeys.viewType) || JContentConstants.tableView.viewType.CONTENT
    });

    const openPathsReducer = handleActions({
        [cmOpenPaths]: (state, action) => _.union(state, action.payload),
        [cmReplaceOpenedPaths]: (state, action) => action.payload,
        [cmClosePaths]: (state, action) => _.difference(state, action.payload)
    }, [
        ...extractPaths(currentValueFromUrl.site || 'systemsite', currentValueFromUrl.path, currentValueFromUrl.mode).slice(0, -1)
    ]);

    const tableOpenPathsReducer = handleActions({
        [cmOpenTablePaths]: (state, action) => _.union(state, action.payload),
        [cmCloseTablePaths]: (state, action) => _.difference(state, action.payload)
    }, []);

    registry.add('redux-reducer', 'app', {targets: ['jcontent'], reducer: appReducer});
    registry.add('redux-reducer', 'mode', {targets: ['jcontent'], reducer: modeReducer});
    registry.add('redux-reducer', 'preSearchModeMemo', {targets: ['jcontent'], reducer: preSearchModeMemoReducer});
    registry.add('redux-reducer', 'path', {targets: ['jcontent'], reducer: pathReducer});
    registry.add('redux-reducer', 'params', {targets: ['jcontent'], reducer: paramsReducer});
    registry.add('redux-reducer', 'openPaths', {targets: ['jcontent'], reducer: openPathsReducer});
    registry.add('redux-reducer', 'tableOpenPaths', {targets: ['jcontent'], reducer: tableOpenPathsReducer});
    registry.add('redux-reducer', 'tableView', {targets: ['jcontent'], reducer: tableViewModeReducer});
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

    let listener = store => () => {
        const state = store.getState();
        if (state.jcontent?.mode === 'search' && state.jcontent?.mode === 'sql2Search') {
            return;
        }

        if (state.router.location.pathname.startsWith('/jcontent') && state.jcontent?.mode) {
            localStorage.setItem('jcontent-previous-mode-' + state.site, state.jcontent.mode);
            if (state.jcontent.tableView.viewMode) {
                localStorage.setItem('jcontent-previous-tableView-viewMode-' + state.site + '-' + state.jcontent.mode, state.jcontent.tableView.viewMode);
            }

            if (state.jcontent?.path) {
                localStorage.setItem('jcontent-previous-location-' + state.site + '-' + state.jcontent.mode, state.jcontent.path);
            }
        }

        if (state.router.location.pathname.startsWith('/category-manager') && state.jcontent?.mode && state.jcontent?.path) {
            localStorage.setItem('category-manager-previous-location', state.jcontent.path);
        }
    };

    registry.add('redux-listener', 'jcontent-path', {createListener: listener});
};
