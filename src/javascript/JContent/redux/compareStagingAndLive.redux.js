import {createActions, handleActions} from 'redux-actions';

export const {
    compareStagingLiveSetOpen,
    compareStagingLiveSetClosed,
    compareStagingLiveSetPath,
    compareStagingLiveShowHighlights,
    compareStagingLiveHideHighlights,
    compareStagingLiveReload,
    compareStagingLiveReset,
    compareStagingLiveSet} = createActions(
    'COMPARE_STAGING_LIVE_SET_OPEN',
    'COMPARE_STAGING_LIVE_SET_CLOSED',
    'COMPARE_STAGING_LIVE_SET_PATH',
    'COMPARE_STAGING_LIVE_SHOW_HIGHLIGHTS',
    'COMPARE_STAGING_LIVE_HIDE_HIGHLIGHTS',
    'COMPARE_STAGING_LIVE_RELOAD',
    'COMPARE_STAGING_LIVE_RESET',
    'COMPARE_STAGING_LIVE_SET'
);

export const cslInitialState = {
    open: false,
    path: undefined,
    showHighlights: false,
    reloadCount: 0
};

export const compareStagingAndLiveRedux = registry => {
    const compareStagingAndLive = handleActions({
        [compareStagingLiveSetOpen]: state => ({...state, open: true}),
        [compareStagingLiveSetClosed]: state => ({...state, open: false}),
        [compareStagingLiveSetPath]: (state, action) => ({...state, path: action.payload}),
        [compareStagingLiveShowHighlights]: state => ({...state, showHighlights: true}),
        [compareStagingLiveHideHighlights]: state => ({...state, showHighlights: false}),
        [compareStagingLiveReload]: state => ({...state, reloadCount: state.reloadCount + 1, showHighlights: false}),
        [compareStagingLiveReset]: () => cslInitialState,
        [compareStagingLiveSet]: (state, action) => ({...state, ...action.payload})
    }, cslInitialState);

    registry.add('redux-reducer', 'compareStagingAndLive', {targets: ['jcontent'], reducer: compareStagingAndLive});
};
