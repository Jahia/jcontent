import JContentConstants from '../../../JContent.constants';
import {filesgridSetGridMode, filesgridSetMode} from './FilesGrid.redux-actions';
import {handleActions} from 'redux-actions';

const localStorage = window.localStorage;
const FILE_SELECTOR_MODE = JContentConstants.localStorageKeys.filesSelectorMode;
const FILE_SELECTOR_GRID_MODE = JContentConstants.localStorageKeys.filesSelectorGridMode;
const THUMBNAIL = JContentConstants.gridMode.THUMBNAIL;
const GRID = JContentConstants.mode.GRID;

const initialState = {
    mode: localStorage.getItem(FILE_SELECTOR_MODE) === null ? GRID : localStorage.getItem(FILE_SELECTOR_MODE),
    gridMode: localStorage.getItem(FILE_SELECTOR_GRID_MODE) === null ? THUMBNAIL : localStorage.getItem(FILE_SELECTOR_GRID_MODE)
};

export const filesGrid = handleActions({
    [filesgridSetMode]: (state, action) => ({...state, mode: action.payload}),
    [filesgridSetGridMode]: (state, action) => ({...state, gridMode: action.payload})
}, initialState);
