import JContentConstants from '../../../JContent.constants';

const localStorage = window.localStorage;
const FILE_SELECTOR_MODE = JContentConstants.localStorageKeys.filesSelectorMode;
const FILE_SELECTOR_GRID_MODE = JContentConstants.localStorageKeys.filesSelectorGridMode;
const THUMBNAIL = JContentConstants.gridMode.THUMBNAIL;
const GRID = JContentConstants.mode.GRID;

const initialState = {
    mode: localStorage.getItem(FILE_SELECTOR_MODE) === null ? GRID : localStorage.getItem(FILE_SELECTOR_MODE),
    gridMode: localStorage.getItem(FILE_SELECTOR_GRID_MODE) === null ? THUMBNAIL : localStorage.getItem(FILE_SELECTOR_GRID_MODE)
};

export const filesGrid = (state = initialState, action = {}) => {
    switch (action.type) {
        case 'FILESGRID_SET_MODE': return {
            mode: action.mode,
            gridMode: state.gridMode
        };
        case 'FILESGRID_SET_GRID_MODE': return {
            gridMode: action.gridMode,
            mode: state.mode
        };
        default: return state;
    }
};
