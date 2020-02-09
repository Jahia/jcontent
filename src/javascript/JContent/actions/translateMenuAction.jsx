import {composeActions, menuAction} from '@jahia/react-material';
import requirementsAction from './requirementsAction';
import {reduxAction} from './reduxAction';
import {map} from 'rxjs/operators';
import {of} from 'rxjs';

export default composeActions(requirementsAction, menuAction, reduxAction(state => ({availableLanguages: state.jcontent.availableLanguages})), {
    init: context => {
        context.initRequirements({
            retrievePermission: context.availableLanguages.map(lang => 'jcr:modifyProperties_default_' + lang.language),
            enabled: context => {
                if (context.availableLanguages.length <= 1) {
                    return of(false);
                }

                return context.node.pipe(map(node => context.availableLanguages.reduce((acc, lang) => acc || node['jcr_modifyProperties_default_' + lang.language], false)));
            }
        });
    }
});
