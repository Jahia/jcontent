import {composeActions} from '@jahia/react-material';
import requirementsAction from './requirementsAction';
import {reduxAction} from "./reduxAction";
import * as _ from "lodash";

export default composeActions(requirementsAction, reduxAction(state => ({language: state.language, availableLanguages: state.availableLanguages})), {
    init: context => {
        let actions = [];
        _.each(context.availableLanguages, (source) => {
            _.each(context.availableLanguages, (dest) => {
                if (source.language !== dest.language && (source.language === context.language || dest.language === context.language)) {
                    actions.push({
                        buttonLabel: `${_.upperFirst(source.displayName)} -> ${ _.upperFirst(dest.displayName)}`,
                        sourceLang: source.language,
                        destLang: dest.language
                    });
                }
            });
        });
        context.actions = actions;
    },
    onClick: context => {
        window.parent.authoringApi.translateContent(context.path, context.sourceLang, context.destLang, null);
    },
});
