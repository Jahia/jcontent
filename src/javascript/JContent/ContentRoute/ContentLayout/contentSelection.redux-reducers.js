import {cmSetPage, cmSetPageSize} from './pagination.redux-actions';
import {cmAddSelection, cmClearSelection, cmRemoveSelection, cmSwitchSelection} from './contentSelection.redux-actions';
import {cmSetSort} from './sort.redux-actions';
import {cmSetPath} from '../../JContent.redux-actions';
import {handleActions} from 'redux-actions';

const toArray = value => (Array.isArray(value) ? value : [value]);

export const selectionReducer = handleActions({
    [cmAddSelection]: (state, action) => state.concat(toArray(action.payload).filter(path => state.indexOf(path) < 0)),
    [cmRemoveSelection]: (state, action) => state.filter(path => toArray(action.payload).indexOf(path) === -1),
    [cmSwitchSelection]: (state, action) => (state.indexOf(action.payload) === -1) ? [...state, action.payload] : state.filter(path => action.payload !== path),
    [cmClearSelection]: () => ([]),
    [cmSetPath]: () => ([]),
    [cmSetSort]: () => ([]),
    [cmSetPage]: () => ([]),
    [cmSetPageSize]: () => ([])
}, []);
