import {createAction, handleAction} from 'redux-actions';

export const cmSetSort = createAction('CM_SET_SORT');

export const sortReduxReducers = registry => {
    const sortReducer = handleAction(cmSetSort, (state, action) => (action.payload), {
        order: 'ASC',
        orderBy: 'lastModified.value'
    });

    registry.add('redux-reducer', 'sort', {reducer: sortReducer});
};
