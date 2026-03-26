export const getCoords = elem => {
    const box = elem.getBoundingClientRect();

    const body = elem.ownerDocument.body;
    const docEl = elem.ownerDocument.documentElement;

    const scrollTop = window.pageYOffset || docEl.scrollTop || body.scrollTop;
    const scrollLeft = window.pageXOffset || docEl.scrollLeft || body.scrollLeft;

    const clientTop = docEl.clientTop || body.clientTop || 0;
    const clientLeft = docEl.clientLeft || body.clientLeft || 0;

    const top = box.top + scrollTop - clientTop;
    const left = box.left + scrollLeft - clientLeft;

    return {
        top: Math.round(top),
        left: Math.round(left),
        width: box.width,
        height: box.height
    };
};

export const getBoundingBox = (element, isHeaderDisplayed) => {
    const rect = getCoords(element);

    const left = rect.left;
    const width = rect.width;
    const top = rect.top;
    const height = rect.height + (isHeaderDisplayed ? 0 : 4);
    return {top, left, width, height};
};
