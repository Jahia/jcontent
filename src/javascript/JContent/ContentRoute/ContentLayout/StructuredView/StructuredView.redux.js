import JContentConstants from '../../../JContent.constants';
import {createActions, handleActions} from 'redux-actions';

export const {setTableViewMode} = createActions('SET_TABLE_VIEW_MODE');
export const {setTableViewType} = createActions('SET_TABLE_VIEW_TYPE');
const localStorage = window.localStorage;
const VIEW_MODE = JContentConstants.localStorageKeys.viewMode;
const DEFAULT_VIEW_MODE = JContentConstants.viewMode.flat;

export const structuredViewRedux = registry => {
    const initialState = {
        viewMode: localStorage.getItem(VIEW_MODE) === null ? DEFAULT_VIEW_MODE : localStorage.getItem(VIEW_MODE),
        viewType: null
    };

    const contentFolderViewModeReducer = handleActions({
        [setTableViewMode]: (state, action) => ({...state, viewMode: action.payload}),
        [setTableViewType]: (state, action) => ({...state, viewType: action.payload})
    }, initialState);

    registry.add('redux-reducer', 'tableView', {targets: ['jcontent'], reducer: contentFolderViewModeReducer});
};
