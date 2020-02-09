import * as _ from 'lodash';
import {extractPaths} from './JContent.utils';
import JContentConstants from './JContent.constants';
import {createActions, handleAction, handleActions} from 'redux-actions';
import {batch} from 'react-redux';
import {registry} from '@jahia/ui-extender';
import rison from 'rison';
import queryString from 'query-string';
import {push} from 'connected-react-router';

export const CM_DRAWER_STATES = {HIDE: 0, TEMP: 1, SHOW: 2, FULL_SCREEN: 3};
export const CM_PREVIEW_MODES = {EDIT: 'edit', LIVE: 'live'};

const PARAMS_KEY = '?params=';
const DEFAULT_MODE_PATHS = {browse: '/contents', media: '/files'};

const extractParamsFromUrl = (pathname, search) => {
    if (pathname.startsWith('/jcontent')) {
        let [, , site, language, mode, ...pathElements] = pathname.split('/');

        let path;
        if (mode === JContentConstants.mode.APPS) {
            path = pathElements.join('/');
        } else {
            path = '/sites/' + site;
            if (_.isEmpty(pathElements)) {
                if (mode === JContentConstants.mode.MEDIA) {
                    path += '/files';
                }
            } else {
                path += ('/' + pathElements.join('/'));
            }
        }

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

const buildUrl = (site, language, mode, path, params) => {
    let sitePath = '/sites/' + site;
    if (path.startsWith(sitePath + '/')) {
        path = path.substring(('/sites/' + site).length);
    } else if (mode === JContentConstants.mode.APPS) {
        // Path is an action key
        path = path.startsWith('/') ? path : '/' + path;
    } else {
        path = '';
    }

    // Special chars in folder naming
    path = path.replace(/[^/]/g, encodeURIComponent);

    let queryString = _.isEmpty(params) ? '' : PARAMS_KEY + rison.encode_uri(params);
    return '/jcontent/' + [site, language, mode].join('/') + path + queryString;
};

const pathResolver = (currentValue, currentValueFromUrl) => {
    if (currentValue.site !== currentValueFromUrl.site && currentValue.mode !== JContentConstants.mode.APPS) {
        // Switched sites, we have to set default path based on mode: browse -> /content-folders | media -> /files
        return currentValueFromUrl.path.substr(0, currentValueFromUrl.path.indexOf(currentValueFromUrl.site)) + currentValue.site + DEFAULT_MODE_PATHS[currentValue.mode];
    }

    return currentValue.path;
};

export const {cmAddPathsToRefetch, cmRemovePathsToRefetch, cmOpenPaths, cmClosePaths, cmSetAvailableLanguages, cmSetMode, cmSetPath, cmSetParams, cmSetSearchMode} =
    createActions('CM_ADD_PATHS_TO_REFETCH', 'CM_REMOVE_PATHS_TO_REFETCH', 'CM_OPEN_PATHS', 'CM_CLOSE_PATHS', 'CM_SET_AVAILABLE_LANGUAGES', 'CM_SET_MODE', 'CM_SET_PATH', 'CM_SET_PARAMS', 'CM_SET_SEARCH_MODE');

export const cmGoto = data => (
    dispatch => {
        batch(() => {
            if (data.site) {
                dispatch(registry.get('redux-reducer', 'site').actions.setSite(data.site));
            }

            if (data.language) {
                dispatch(registry.get('redux-reducer', 'language').actions.setLanguage(data.language));
            }

            if (data.mode) {
                dispatch(cmSetMode(data.mode));
            }

            if (data.path) {
                dispatch(cmSetPath(data.path));
            }

            if (data.params) {
                dispatch(cmSetParams(data.params));
            }
        });
    }
);

export const jContentRedux = registry => {
    const jahiaCtx = window.contextJsParameters;
    const pathName = window.location.pathname.substring((jahiaCtx.contextPath + jahiaCtx.urlbase).length);
    const currentValueFromUrl = extractParamsFromUrl(pathName, window.location.search);

    const availableLanguagesReducer = handleAction(cmSetAvailableLanguages, (state, action) => action.payload, []);
    const modeReducer = handleAction(cmSetMode, (state, action) => action.payload, currentValueFromUrl.mode);
    const pathReducer = handleAction(cmSetPath, (state, action) => action.payload, currentValueFromUrl.path);
    const paramsReducer = handleAction(cmSetParams, (state, action) => action.payload, currentValueFromUrl.params);

    const openPathsReducer = handleActions({
        [cmOpenPaths]: (state, action) => _.union(state, action.payload),
        [cmClosePaths]: (state, action) => _.difference(state, action.payload)
    }, (currentValueFromUrl.mode === JContentConstants.mode.APPS) ? [] : _.dropRight(extractPaths(currentValueFromUrl.site, currentValueFromUrl.path, currentValueFromUrl.mode), 1));

    const pathsToRefetchReducer = handleActions({
        [cmAddPathsToRefetch]: (state, action) => _.union(state, action.payload),
        [cmRemovePathsToRefetch]: (state, action) => _.difference(state, action.payload)
    }, []);

    const searchModeReducer = handleAction(cmSetSearchMode, (state, action) => action.payload, (currentValueFromUrl.params.sql2SearchFrom ? 'sql2' : 'normal'));

    registry.add('redux-reducer', 'availableLanguages', {reducer: availableLanguagesReducer});
    registry.add('redux-reducer', 'mode', {reducer: modeReducer});
    registry.add('redux-reducer', 'path', {reducer: pathReducer});
    registry.add('redux-reducer', 'params', {reducer: paramsReducer});
    registry.add('redux-reducer', 'openPaths', {reducer: openPathsReducer});
    registry.add('redux-reducer', 'pathsToRefetch', {reducer: pathsToRefetchReducer});
    registry.add('redux-reducer', 'searchMode', {reducer: searchModeReducer});

    let currentValue;
    let getSyncListener = store => () => {
        setTimeout(() => {
            let previousValue = currentValue || {};
            currentValue = select(store.getState());
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
        });
    };

    registry.add('redux-listener', 'jcontent', {createListener: getSyncListener});
};
