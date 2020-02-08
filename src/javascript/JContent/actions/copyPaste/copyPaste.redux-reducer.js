import copyPasteConstants from './copyPaste.constants';
import {handleActions} from 'redux-actions';
import {copypasteCopy, copypasteCut, copypasteClear} from './copyPaste.redux-actions';

const initialState = {
    type: copyPasteConstants.COPY,
    nodes: []
};

export const copyPaste = handleActions({
    [copypasteCopy]: (state, action) => ({type: copyPasteConstants.COPY, nodes: action.payload}),
    [copypasteCut]: (state, action) => ({type: copyPasteConstants.CUT, nodes: action.payload}),
    [copypasteClear]: () => (initialState)
}, initialState);
