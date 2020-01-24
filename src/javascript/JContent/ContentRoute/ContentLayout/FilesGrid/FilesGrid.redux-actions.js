export const setMode = mode => {
    return {
        type: 'FILESGRID_SET_MODE',
        mode
    };
};

export const setGridMode = gridMode => {
    return {
        type: 'FILESGRID_SET_GRID_MODE',
        gridMode
    };
};
