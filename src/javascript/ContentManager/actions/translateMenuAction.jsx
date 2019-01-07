import {composeActions, menuAction} from '@jahia/react-material';
import requirementsAction from './requirementsAction';
import {reduxAction} from './reduxAction';
import {map} from 'rxjs/operators';

export default composeActions(requirementsAction, menuAction, reduxAction(state => ({availableLanguages: state.availableLanguages})), {
    init: context => {
        context.initRequirements({
            retrievePermission: context.availableLanguages.map(lang => 'jcr:modifyProperties_default_' + lang.language),
            enabled: context => {
                return context.node.pipe(map(node => context.availableLanguages.reduce((acc, lang) => acc || node['jcr_modifyProperties_default_' + lang.language], false)));
            }
        });
    }
});
