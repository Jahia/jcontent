import copyPasteConstants from './copyPaste.constants';
import {createActions, handleActions} from 'redux-actions';

export const {copypaste, copypasteCopy, copypasteCut, copypasteClear} = createActions('COPYPASTE', 'COPYPASTE_COPY', 'COPYPASTE_CUT', 'COPYPASTE_CLEAR');

export const copypasteRedux = registry => {
    const initialState = {
        type: copyPasteConstants.COPY,
        nodes: []
    };

    const copyPaste = handleActions({
        [copypaste]: (state, action) => (action.payload),
        [copypasteCopy]: (state, action) => ({type: copyPasteConstants.COPY, nodes: action.payload}),
        [copypasteCut]: (state, action) => ({type: copyPasteConstants.CUT, nodes: action.payload}),
        [copypasteClear]: () => (initialState)
    }, initialState);

    registry.add('redux-reducer', 'copyPaste', {targets: ['jcontent'], reducer: copyPaste});
};
