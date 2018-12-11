import {composeActions, menuAction} from '@jahia/react-material';
import requirementsAction from './requirementsAction';
import {reduxAction} from './reduxAction';

export default composeActions(requirementsAction, menuAction, reduxAction(state => ({availableLanguages: state.availableLanguages})), {
    init: context => {
        context.initRequirements({enabled: context => context.availableLanguages.length > 1});
    }
});
