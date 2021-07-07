import JContentConstants from '../../../JContent.constants';
import {createActions, handleActions} from 'redux-actions';

export const {setViewMode} = createActions('SET_VIEW_MODE');
const localStorage = window.localStorage;
const VIEW_MODE = JContentConstants.localStorageKeys.viewMode;
const DEFAULT_VIEW_MODE = JContentConstants.viewMode.flat;

export const structuredViewRedux = registry => {
    const initialState = {
        viewMode: localStorage.getItem(VIEW_MODE) === null ? DEFAULT_VIEW_MODE : localStorage.getItem(VIEW_MODE)
    };

    const viewMode = handleActions({
        [setViewMode]: (state, action) => ({...state, viewMode: action.payload})
    }, initialState);

    registry.add('redux-reducer', 'viewMode', {targets: ['jcontent'], reducer: viewMode});
};
