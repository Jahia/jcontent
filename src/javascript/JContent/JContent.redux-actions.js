import {batch} from 'react-redux';
import {registry} from '@jahia/ui-extender';
import {createActions} from 'redux-actions';

export const CM_DRAWER_STATES = {HIDE: 0, TEMP: 1, SHOW: 2, FULL_SCREEN: 3};
export const CM_PREVIEW_MODES = {EDIT: 'edit', LIVE: 'live'};

export const {cmSetUilanguage, cmAddPathsToRefetch, cmRemovePathsToRefetch, cmOpenPaths, cmClosePaths, cmSetAvailableLanguages, cmSetMode, cmSetPath, cmSetParams, cmSetSearchMode} =
    createActions('CM_SET_UILANGUAGE', 'CM_ADD_PATHS_TO_REFETCH', 'CM_REMOVE_PATHS_TO_REFETCH', 'CM_OPEN_PATHS', 'CM_CLOSE_PATHS', 'CM_SET_AVAILABLE_LANGUAGES', 'CM_SET_MODE', 'CM_SET_PATH', 'CM_SET_PARAMS', 'CM_SET_SEARCH_MODE');

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

