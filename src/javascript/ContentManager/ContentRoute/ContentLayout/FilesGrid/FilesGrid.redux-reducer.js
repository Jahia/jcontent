import ContentManagerConstants from '../../../ContentManager.constants';

const localStorage = window.localStorage;
const FILE_SELECTOR_MODE = ContentManagerConstants.localStorageKeys.filesSelectorMode;
const FILE_SELECTOR_GRID_MODE = ContentManagerConstants.localStorageKeys.filesSelectorGridMode;
const THUMBNAIL = ContentManagerConstants.gridMode.THUMBNAIL;
const GRID = ContentManagerConstants.mode.GRID;

const initialState = {
    mode: localStorage.getItem(FILE_SELECTOR_MODE) !== null ? localStorage.getItem(FILE_SELECTOR_MODE) : GRID,
    gridMode: localStorage.getItem(FILE_SELECTOR_GRID_MODE) !== null ? localStorage.getItem(FILE_SELECTOR_GRID_MODE) : THUMBNAIL
};

export const filesGrid = (state = initialState, action) => {
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
