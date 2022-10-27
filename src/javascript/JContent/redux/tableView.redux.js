import JContentConstants from '~/JContent/JContent.constants';
import {createActions, handleActions} from 'redux-actions';

export const {setTableViewMode, setTableViewType} = createActions('SET_TABLE_VIEW_MODE', 'SET_TABLE_VIEW_TYPE');
const localStorage = window.localStorage;
const VIEW_MODE = JContentConstants.localStorageKeys.viewMode;
const VIEW_TYPE = JContentConstants.localStorageKeys.viewType;
const DEFAULT_VIEW_MODE = JContentConstants.tableView.viewMode.FLAT;
const DEFAULT_VIEW_TYPE = JContentConstants.tableView.viewType.CONTENT;

export const tableViewRedux = registry => {
    const initialState = {
        viewMode: localStorage.getItem(VIEW_MODE) === null ? DEFAULT_VIEW_MODE : localStorage.getItem(VIEW_MODE),
        viewType: localStorage.getItem(VIEW_TYPE) === null ? DEFAULT_VIEW_TYPE : localStorage.getItem(VIEW_TYPE)
    };

    const contentFolderViewModeReducer = handleActions({
        [setTableViewMode]: (state, action) => ({...state, viewMode: action.payload}),
        [setTableViewType]: (state, action) => ({...state, viewType: action.payload})
    }, initialState);

    registry.add('redux-reducer', 'tableView', {targets: ['jcontent'], reducer: contentFolderViewModeReducer});
};
