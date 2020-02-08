import {cmSetPage, cmSetPageSize} from './pagination.redux-actions';
import {cmSetPath} from '../../JContent.redux-actions';
import {handleActions} from 'redux-actions';

export const paginationReducer = handleActions({
    [cmSetPage]: (state, action) => ({...state, currentPage: action.payload}),
    [cmSetPageSize]: (state, action) => ({...state, pageSize: action.payload}),
    [cmSetPath]: state => ({...state, currentPage: 0})
}, {currentPage: 0, pageSize: 25});
