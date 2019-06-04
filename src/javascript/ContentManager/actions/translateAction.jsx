import {composeActions} from '@jahia/react-material';
import requirementsAction from './requirementsAction';
import {reduxAction} from './reduxAction';
import * as _ from 'lodash';
import {map} from 'rxjs/operators';

export default composeActions(requirementsAction, reduxAction(state => ({language: state.language, availableLanguages: state.availableLanguages})), {
    init: context => {
        context.initRequirements({
            retrievePermission: context.availableLanguages.map(lang => 'jcr:modifyProperties_default_' + lang.language)
        });
        context.actions = context.node.pipe(map(node =>
            _.flatMap(context.availableLanguages, source => _.flatMap(context.availableLanguages, dest => {
                if (source.language !== dest.language && (source.language === context.language || dest.language === context.language) && node['jcr_modifyProperties_default_' + dest.language]) {
                    return [{
                        key: source.displayName + dest.displayName,
                        buttonLabel: 'label.contentManager.translateAction',
                        buttonLabelParams: {
                            source: _.upperFirst(source.displayName),
                            dest: _.upperFirst(dest.displayName)
                        },
                        sourceLang: source.language,
                        destLang: dest.language
                    }];
                }

                return [];
            }))
        ));
    },
    onClick: context => {
        window.parent.authoringApi.translateContent(context.path, context.sourceLang, context.destLang, null);
    }
});
