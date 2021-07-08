import JContentConstants from '../../../JContent.constants';
import {createActions, handleActions} from 'redux-actions';

export const {setContentFolderViewMode} = createActions('SET_CONTENT_FOLDER_VIEW_MODE');
const localStorage = window.localStorage;
const VIEW_MODE = JContentConstants.localStorageKeys.viewMode;
const DEFAULT_VIEW_MODE = JContentConstants.viewMode.flat;

export const structuredViewRedux = registry => {
    const initialState = {
        viewMode: localStorage.getItem(VIEW_MODE) === null ? DEFAULT_VIEW_MODE : localStorage.getItem(VIEW_MODE)
    };

    const contentFolderViewModeReducer = handleActions({
        [setContentFolderViewMode]: (state, action) => ({...state, viewMode: action.payload})
    }, initialState);

    registry.add('redux-reducer', 'contentFolder', {targets: ['jcontent'], reducer: contentFolderViewModeReducer});
};
