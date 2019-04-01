const initialState = {
    mode: 'grid',
    size: 1
};

export const filesGrid = (state = initialState, action) => {
    switch (action.type) {
        case 'FILESGRID_SET_MODE': return {
            size: state.size,
            mode: action.mode
        };
        case 'FILESGRID_SET_SIZE': return {
            size: action.size,
            mode: state.mode
        };
        default: return state;
    }
};
