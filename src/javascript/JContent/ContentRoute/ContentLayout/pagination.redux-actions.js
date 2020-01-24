const CM_SET_PAGE = 'CM_SET_PAGE';
const CM_SET_PAGE_SIZE = 'CM_SET_PAGE_SIZE';

function cmSetPage(page) {
    return {
        type: CM_SET_PAGE,
        page: page
    };
}

function cmSetPageSize(size) {
    return {
        type: CM_SET_PAGE_SIZE,
        pageSize: size
    };
}

export {cmSetPageSize};
export {cmSetPage};
export {CM_SET_PAGE_SIZE};
export {CM_SET_PAGE};
