import {createActions, handleActions} from 'redux-actions';
import JContentConstants from '~/JContent/JContent.constants';

export const {
    setActiveContentStatus,
    resetActiveContentStatus,
    addPublishedStatusPath,
    addVisibilityStatusPath,
    addLiveRoleStatusPath,
    addContentStatusPaths,
    resetContentStatusPaths
} = createActions(
    'SET_ACTIVE_CONTENT_STATUS',
    'RESET_ACTIVE_CONTENT_STATUS',
    'ADD_PUBLISHED_STATUS_PATH',
    'ADD_VISIBILITY_STATUS_PATH',
    'ADD_LIVE_ROLE_STATUS_PATH',
    'ADD_CONTENT_STATUS_PATHS',
    'RESET_CONTENT_STATUS_PATHS'
);

export const contentStatusRedux = registry => {
    const {PUBLISHED, LIVE_ROLE, VISIBILITY, NO_STATUS} = JContentConstants.statusView;
    const localStorageKey = 'jcontent-status-selector-active';
    const defaultState = {
        active: localStorage.getItem(localStorageKey) || NO_STATUS,
        // We keep track of unique paths to avoid repetition and derive the count from unique paths added
        statusPaths: {[PUBLISHED]: new Set(), [VISIBILITY]: new Set(), [LIVE_ROLE]: new Set()}
    };

    // Clone state and add path to set if it does not exist in one of state.statusPaths, for each [statusPathKeys]
    function addStatusPaths(state, path, statusPathKeys = []) {
        const statusPaths = {};

        statusPathKeys.forEach(statusKey => {
            const prevStatusSet = state.statusPaths[statusKey];
            if (!prevStatusSet || prevStatusSet.has(path)) {
                return;
            }

            statusPaths[statusKey] = new Set(prevStatusSet);
            statusPaths[statusKey].add(path);
        });

        const isEmptyPaths = Object.keys(statusPaths).length === 0;
        return isEmptyPaths ? state : {
            ...state,
            statusPaths: {
                ...state.statusPaths,
                ...statusPaths
            }
        };
    }

    function setActive(state, statusMode = NO_STATUS) {
        if (statusMode === NO_STATUS) {
            localStorage.removeItem(localStorageKey);
        } else {
            localStorage.setItem(localStorageKey, statusMode);
        }

        return {...state, active: statusMode};
    }

    // Keep track of active content status being highlighted in page builder and content paths for each status
    const contentStatusReducer = handleActions({
        [setActiveContentStatus]: (state, action) => setActive(state, action.payload),
        [resetActiveContentStatus]: state => setActive(state, NO_STATUS),
        [addPublishedStatusPath]: (state, action) => addStatusPaths(state, action.payload, ['publicationPaths']),
        [addVisibilityStatusPath]: (state, action) => addStatusPaths(state, action.payload, ['visibilityPaths']),
        [addLiveRoleStatusPath]: (state, action) => addStatusPaths(state, action.payload, ['liveRolePaths']),
        [addContentStatusPaths]: (state, action) => addStatusPaths(state, action.payload.path, action.payload?.statusKeys),
        [resetContentStatusPaths]: state => ({
            ...state,
            statusPaths: {[PUBLISHED]: new Set(), [VISIBILITY]: new Set(), [LIVE_ROLE]: new Set()}
        })
    }, defaultState);

    registry.add('redux-reducer', 'contentStatus', {targets: ['jcontent'], reducer: contentStatusReducer});
};
