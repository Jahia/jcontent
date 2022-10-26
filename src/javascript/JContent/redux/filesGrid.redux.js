import JContentConstants from '~/JContent/JContent.constants';
import {createActions, handleActions} from 'redux-actions';

export const {filesgridSetMode, filesgridSetGridMode} = createActions('FILESGRID_SET_MODE');

const localStorage = window.localStorage;
const FILE_SELECTOR_MODE = JContentConstants.localStorageKeys.filesSelectorMode;
const GRID = JContentConstants.mode.GRID;

export const filesGridRedux = registry => {
    const initialState = {
        mode: localStorage.getItem(FILE_SELECTOR_MODE) === null ? GRID : localStorage.getItem(FILE_SELECTOR_MODE)
    };

    const filesGrid = handleActions({
        [filesgridSetMode]: (state, action) => ({...state, mode: action.payload})
    }, initialState);

    registry.add('redux-reducer', 'filesGrid', {targets: ['jcontent'], reducer: filesGrid});
};
