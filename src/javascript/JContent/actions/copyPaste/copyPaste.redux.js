import copyPasteConstants from './copyPaste.constants';
import {createActions, handleActions} from 'redux-actions';

export const {copypasteCopy, copypasteCut, copypasteClear} = createActions('COPYPASTE_COPY', 'COPYPASTE_CUT', 'COPYPASTE_CLEAR');

export const copypasteReduxReducers = registry => {
    const initialState = {
        type: copyPasteConstants.COPY,
        nodes: []
    };

    const copyPaste = handleActions({
        [copypasteCopy]: (state, action) => ({type: copyPasteConstants.COPY, nodes: action.payload}),
        [copypasteCut]: (state, action) => ({type: copyPasteConstants.CUT, nodes: action.payload}),
        [copypasteClear]: () => (initialState)
    }, initialState);

    registry.add('redux-reducer', 'copyPaste', {reducer: copyPaste});
};
