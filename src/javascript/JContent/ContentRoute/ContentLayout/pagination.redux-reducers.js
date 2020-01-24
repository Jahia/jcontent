import {CM_SET_PAGE, CM_SET_PAGE_SIZE} from './pagination.redux-actions';
import {LOCATION_CHANGE} from 'connected-react-router';

let paginationReducer = (state = {currentPage: 0, pageSize: 25}, action = {}) => {
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
        case LOCATION_CHANGE:
            return {
                ...state,
                currentPage: 0
            };
        default:
            return state;
    }
};

export {paginationReducer};
