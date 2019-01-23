import {CM_SET_SORT} from './sort.redux-actions';

let sortReducer = (state = {order: 'ASC', orderBy: 'lastModified.value'}, action) => {
    switch (action.type) {
        case CM_SET_SORT:
            return action.sort;
        default:
            return state;
    }
};
export {sortReducer};
