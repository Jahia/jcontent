import {createActions} from 'redux-actions';

export const {copypasteCopy, copypasteCut, copypasteClear} = createActions('COPYPASTE_COPY', 'COPYPASTE_CUT', 'COPYPASTE_CLEAR');
