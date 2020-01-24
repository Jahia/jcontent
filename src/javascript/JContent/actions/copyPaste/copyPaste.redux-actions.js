export const copy = nodes => {
    return {
        type: 'COPYPASTE_COPY',
        nodes: nodes
    };
};

export const cut = nodes => {
    return {
        type: 'COPYPASTE_CUT',
        nodes: nodes
    };
};

export const clear = () => {
    return {
        type: 'COPYPASTE_CLEAR'
    };
};
