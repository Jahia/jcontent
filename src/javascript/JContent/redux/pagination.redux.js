import {createActions, handleActions} from 'redux-actions';

export const {cmSetPage, cmSetPageSize} = createActions('CM_SET_PAGE', 'CM_SET_PAGE_SIZE');
export const paginationRedux = registry => {
    const paginationReducer = handleActions({
        [cmSetPage]: (state, action) => ({...state, currentPage: action.payload}),
        [cmSetPageSize]: (state, action) => ({...state, pageSize: action.payload, currentPage: 0}),
        '@@router/LOCATION_CHANGE': state => ({...state, currentPage: 0})
    }, {currentPage: 0, pageSize: 25});

    registry.add('redux-reducer', 'pagination', {targets: ['jcontent'], reducer: paginationReducer});
};
