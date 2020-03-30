import * as _ from 'lodash';
import {extractPaths} from './JContent.utils';
import {createActions, handleActions} from 'redux-actions';
import {batch} from 'react-redux';
import {registry} from '@jahia/ui-extender';
import rison from 'rison';
import queryString from 'query-string';
import {push} from 'connected-react-router';
import {combineReducers} from 'redux';

export const CM_DRAWER_STATES = {HIDE: 0, TEMP: 1, SHOW: 2, FULL_SCREEN: 3};
export const CM_PREVIEW_MODES = {EDIT: 'edit', LIVE: 'live'};

const PARAMS_KEY = '?params=';

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

const select = state => {
    let {router: {location: {pathname, search}}, site, language, jcontent: {mode, path, params}} = state;
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

const pathResolver = (currentValue, currentValueFromUrl) => {
    if (currentValue.site !== currentValueFromUrl.site) {
        let registryItem = registry.get('accordionItem', currentValue.mode);
        if (registryItem && registryItem.defaultPath) {
            return registryItem.defaultPath(currentValue.site);
        }
    }

    return currentValue.path;
};

export const {cmAddPathsToRefetch, cmRemovePathsToRefetch, cmOpenPaths, cmClosePaths, cmSetMode, cmSetPath, cmSetParams, cmSetModePathParams} =
    createActions('CM_ADD_PATHS_TO_REFETCH', 'CM_REMOVE_PATHS_TO_REFETCH', 'CM_OPEN_PATHS', 'CM_CLOSE_PATHS', 'CM_SET_MODE', 'CM_SET_PATH', 'CM_SET_PARAMS', 'CM_SET_MODE_PATH_PARAMS');

export const cmGoto = data => (
    dispatch => {
        batch(() => {
            if (data.site) {
                dispatch(registry.get('redux-reducer', 'site').actions.setSite(data.site));
            }

            if (data.language) {
                dispatch(registry.get('redux-reducer', 'language').actions.setLanguage(data.language));
            }

            if (data.mode || data.path || data.params) {
                dispatch(cmSetModePathParams({mode: data.mode, path: data.path, params: data.params}));
            }
        });
    }
);

export const jContentRedux = registry => {
    const jahiaCtx = window.contextJsParameters;
    const pathName = window.location.pathname.substring((jahiaCtx.contextPath + jahiaCtx.urlbase).length);
    const currentValueFromUrl = extractParamsFromUrl(pathName, window.location.search);

    const modeReducer = handleActions({
        [cmSetMode]: (state, action) => action.payload,
        [cmSetModePathParams]: (state, action) => action.payload.mode ? action.payload.mode : state
    }, currentValueFromUrl.mode);
    const pathReducer = handleActions({
        [cmSetPath]: (state, action) => action.payload,
        [cmSetModePathParams]: (state, action) => action.payload.path ? action.payload.path : state
    }, currentValueFromUrl.path);
    const paramsReducer = handleActions({
        [cmSetParams]: (state, action) => action.payload,
        [cmSetModePathParams]: (state, action) => action.payload.params ? action.payload.params : state
    }, currentValueFromUrl.params);

    const openPathsReducer = handleActions({
        [cmOpenPaths]: (state, action) => _.union(state, action.payload),
        [cmClosePaths]: (state, action) => _.difference(state, action.payload)
    }, _.dropRight(extractPaths(currentValueFromUrl.site, currentValueFromUrl.path, currentValueFromUrl.mode), 1));

    const pathsToRefetchReducer = handleActions({
        [cmAddPathsToRefetch]: (state, action) => _.union(state, action.payload),
        [cmRemovePathsToRefetch]: (state, action) => _.difference(state, action.payload)
    }, []);

    registry.add('redux-reducer', 'mode', {targets: ['jcontent'], reducer: modeReducer});
    registry.add('redux-reducer', 'path', {targets: ['jcontent'], reducer: pathReducer});
    registry.add('redux-reducer', 'params', {targets: ['jcontent'], reducer: paramsReducer});
    registry.add('redux-reducer', 'openPaths', {targets: ['jcontent'], reducer: openPathsReducer});
    registry.add('redux-reducer', 'pathsToRefetch', {targets: ['jcontent'], reducer: pathsToRefetchReducer});

    let currentValue;
    let getSyncListener = store => () => {
        setTimeout(() => {
            let previousValue = currentValue || {};
            currentValue = select(store.getState());
            if (currentValue.pathname.startsWith('/jcontent/')) {
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
                    store.dispatch(push(buildUrl(currentValue.site, currentValue.language, currentValue.mode, encodeURI(pathResolver(currentValue, currentValueFromUrl)), currentValue.params)));
                }
            }
        });
    };

    const reducersArray = registry.find({type: 'redux-reducer', target: 'jcontent'});
    const reducerObj = {};
    reducersArray.forEach(r => {
        reducerObj[r.key] = r.reducer;
    });

    const jcontentReducer = combineReducers(reducerObj);

    registry.add('redux-reducer', 'jcontent', {targets: ['root'], reducer: jcontentReducer});
    registry.add('redux-listener', 'jcontent', {targets: ['root'], createListener: getSyncListener});
    registry.add('redux-action', 'jcontentGoto', {action: cmGoto});
};
