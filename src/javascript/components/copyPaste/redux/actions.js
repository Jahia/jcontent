export const copy = items => {
    return {
        type: "COPYPASTE_COPY",
        items: items
    }
};

export const clear = () => {
    return {
        type: "COPYPASTE_CLEAR"
    }
};