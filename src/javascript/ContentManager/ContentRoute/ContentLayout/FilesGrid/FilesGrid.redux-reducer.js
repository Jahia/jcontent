const localStorage = window.localStorage;

const initialState = {
    mode: localStorage.getItem('cmm_files_selector_mode') !== null ? localStorage.getItem('cmm_files_selector_mode') : 'grid',
    gridMode: localStorage.getItem('cmm_files_selector_grid_mode') !== null ? localStorage.getItem('cmm_files_selector_grid_mode') : 'thumbnail'
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
