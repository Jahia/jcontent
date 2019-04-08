const initialState = {
    mode: 'grid',
    gridMode: 'thumbnail'
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
