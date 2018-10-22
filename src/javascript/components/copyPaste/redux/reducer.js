const initialState = {
    items: []
};

export const copyPaste = (state = initialState, action) => {
    switch(action.type) {
        case "COPYPASTE_COPY" : return {
            items: action.items
        };
        case "COPYPASTE_CLEAR" : return {
            items: []
        };
        default : return state;
    }
};

