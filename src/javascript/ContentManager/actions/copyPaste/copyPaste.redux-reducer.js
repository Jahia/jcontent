import copyPasteConstants from './copyPaste.constants';

const initialState = {
    type: copyPasteConstants.COPY,
    nodes: []
};

export const copyPaste = (state = initialState, action) => {
    switch (action.type) {
        case 'COPYPASTE_COPY': return {
            type: copyPasteConstants.COPY,
            nodes: action.nodes
        };
        case 'COPYPASTE_CUT': return {
            type: copyPasteConstants.CUT,
            nodes: action.nodes
        };
        case 'COPYPASTE_CLEAR': return initialState;
        default: return state;
    }
};
