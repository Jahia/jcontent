const CM_SET_SORT = 'CM_SET_SORT';

function cmSetSort(sort) {
    return {
        type: CM_SET_SORT,
        sort: sort
    };
}

export {CM_SET_SORT, cmSetSort};
