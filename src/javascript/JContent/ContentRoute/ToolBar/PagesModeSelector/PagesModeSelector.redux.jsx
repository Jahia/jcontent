import {createActions, handleActions} from 'redux-actions';
import JContentConstants from '../../../JContent.constants';

export const {setPagesMode} = createActions('SET_PAGES_MODE');
export const pagesModeRedux = registry => {
    registry.add('redux-reducer', 'pagesMode', {
        targets: ['jcontent'], reducer: handleActions({
            [setPagesMode]: (state, action) => action.payload
        }, JContentConstants.pagesMode.LIST)
    });
};
