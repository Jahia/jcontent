import {CM_SET_PAGE, CM_SET_PAGE_SIZE} from './pagination.redux-actions';

let paginationReducer = (state = {currentPage: 0, pageSize: 25}, action) => {
    switch (action.type) {
        case CM_SET_PAGE_SIZE:
            return {
                ...state,
                pageSize: action.pageSize
            };
        case CM_SET_PAGE:
            return {
                ...state,
                currentPage: action.page
            };
        default:
            return state;
    }
};

export {paginationReducer};
