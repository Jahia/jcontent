import {cmSetPage, cmSetPageSize} from './pagination.redux';
import {cmSetSort} from './sort.redux';
import {createAction, handleActions} from 'redux-actions';
import {cmSetPreviewSelection} from '~/JContent/redux/preview.redux';

const getAction = (path, type) => (dispatch, getState) => {
    dispatch({
        type: type,
        payload: path
    });
    let s = getState().jcontent;
    if (s.selection.length > 0 && s.previewSelection) {
        dispatch(cmSetPreviewSelection(null));
    }
};

export const cmAddSelection = path => getAction(path, 'CM_ADD_SELECTION');
cmAddSelection.toString = () => 'CM_ADD_SELECTION';

export const cmRemoveSelection = path => getAction(path, 'CM_REMOVE_SELECTION');
cmRemoveSelection.toString = () => 'CM_REMOVE_SELECTION';

export const cmSwitchSelection = path => getAction(path, 'CM_SWITCH_SELECTION');
cmSwitchSelection.toString = () => 'CM_SWITCH_SELECTION';

export const cmClearSelection = createAction('CM_CLEAR_SELECTION');

export const selectionRedux = registry => {
    const toArray = value => (Array.isArray(value) ? value : [value]);

    const selectionReducer = handleActions({
        [cmAddSelection]: (state, action) => state.concat(toArray(action.payload).filter(path => state.indexOf(path) < 0)),
        [cmRemoveSelection]: (state, action) => state.filter(path => toArray(action.payload).indexOf(path) === -1),
        [cmSwitchSelection]: (state, action) => (state.indexOf(action.payload) === -1) ? [...state, action.payload] : state.filter(path => action.payload !== path),
        [cmClearSelection]: () => ([]),
        [cmSetSort]: () => ([]),
        [cmSetPage]: () => ([]),
        [cmSetPageSize]: () => ([]),
        '@@router/LOCATION_CHANGE': () => ([])
    }, []);

    registry.add('redux-reducer', 'selection', {targets: ['jcontent'], reducer: selectionReducer});
};
