import {cmSetSort} from './sort.redux-actions';
import {handleAction} from 'redux-actions';

export const sortReducer = handleAction(cmSetSort, (state, action) => (action.payload), {order: 'ASC', orderBy: 'lastModified.value'});
