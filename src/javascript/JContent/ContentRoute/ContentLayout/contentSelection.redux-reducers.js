import {CM_SET_PAGE} from './pagination.redux-actions';
import {CM_ADD_SELECTION, CM_REMOVE_SELECTION, CM_SWITCH_SELECTION, CM_CLEAR_SELECTION} from './contentSelection.redux-actions';
import {CM_SET_SORT} from './sort.redux-actions';
import {CM_SET_PAGE_SIZE} from './pagination.redux-actions';
import {CM_NAVIGATE} from '../../JContent.redux-actions';

let selectionReducer = (state = [], action = {}) => {
    if (action.type === CM_ADD_SELECTION || action.type === CM_REMOVE_SELECTION || action.type === CM_SWITCH_SELECTION) {
        if (Array.isArray(action.path)) {
            return action.path.map(path => ({type: action.type, path})).reduce(selectionReducer, state);
        }
    }

    switch (action.type) {
        case CM_ADD_SELECTION:
            if (state.indexOf(action.path) === -1) {
                return [...state, action.path];
            }

            return state;
        case CM_REMOVE_SELECTION:
            if (state.indexOf(action.path) > -1) {
                return state.filter(path => path !== action.path);
            }

            return state;
        case CM_SWITCH_SELECTION:
            if (state.indexOf(action.path) === -1) {
                return [...state, action.path];
            }

            return state.filter(path => path !== action.path);

        case CM_CLEAR_SELECTION:
        case CM_SET_SORT:
        case CM_SET_PAGE:
        case CM_SET_PAGE_SIZE:
        case CM_NAVIGATE:
            return [];
        default:
            return state;
    }
};

export {selectionReducer};
